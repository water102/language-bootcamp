import BOOTCAMP_DATA from '@/data';
export { BOOTCAMP_DATA };
import { store, replaceStudy } from '@/store';
import dayjs from 'dayjs';
import { 
  saveRecording, 
  getRecordingsByDay, 
  saveWritingDraftVersion, 
  getWritingDraftHistory, 
  getAllCustomLessonsLocal, 
  deleteCustomLessonLocal,
  getCustomLessonVersions,
  getActiveLessonVersionId,
  setActiveLessonVersionId,
  deleteCustomLessonVersion
} from '@/core/storage/db.js';
import { CurriculumContentEngine } from '@/core/curriculum/curriculumContentEngine.js';
import { generateDayLessonPrompt } from '@/core/ai/lessonPromptBuilder.js';
import {
  isFirebaseConfigured,
  isCloudSyncEnabled,
  subscribeToCustomLessonsFromCloud,
  syncCustomLessonsFromCloud,
  restoreLocalLessonsToCloud
} from '@/core/firebase/lessonCloudSync.js';
/**
 * English C1 Bootcamp — Core Application Controller
 * Browser study tools mounted by React, with Redux persistence.
 */

// Application State
export let appState = structuredClone(store.getState().study);
store.subscribe(() => {
  appState = structuredClone(store.getState().study);
});

// Timer State
let timerState = {
  mode: 'deep', // 'deep' (90m), 'pomo' (25m), 'break' (5m), 'stopwatch'
  totalSeconds: 90 * 60,
  remainingSeconds: 90 * 60,
  intervalId: null,
  isRunning: false
};

// Initialize Application
export function initializeStudyTools() {
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const { action, day } = button.dataset;
    if (action === 'complete-day') toggleCompleteDay(Number(day));
    if (action === 'copy-prompt') {
      const prompt = generateDayLessonPrompt(Number(day));
      navigator.clipboard.writeText(prompt).then(() => {
        showToast(`📋 Đã sao chép AI Master Prompt cho Ngày ${day}!`);
      }).catch(() => {
        showToast('Không thể sao chép tự động, vui lòng thử lại.');
      });
      return;
    }
    if (action === 'import-lesson') {
      closeModal();
      window.dispatchEvent(new CustomEvent('open-import-lesson-modal', { detail: { day: Number(day) } }));
      return;
    }
    if (action === 'switch-day' || action === 'lesson-day') {
      switchCurrentDay(Number(day));
      if (action === 'lesson-day' || (BOOTCAMP_DATA.starterPack && BOOTCAMP_DATA.starterPack.some(l => l.day === Number(day)))) {
        document.querySelector('.nav-link[data-target=lessons]')?.click();
        window.location.hash = '#/lessons';
      } else {
        document.querySelector('.nav-link[data-target=dashboard]')?.click();
        window.location.hash = '#/dashboard';
      }
    }
    closeModal();
  });

  // Lesson version selection handler via delegation
  document.addEventListener('change', async (event) => {
    if (event.target && event.target.id === 'lesson-version-select') {
      const selectEl = event.target;
      const selectedVal = selectEl.value;
      const targetDay = Number(appState.currentDay) || 1;
      setActiveLessonVersionId(targetDay, selectedVal);
      let activeLesson = null;

      if (selectedVal === 'default') {
        CurriculumContentEngine.setActiveVersion(targetDay, 'default');
        activeLesson = CurriculumContentEngine.getDayLesson(targetDay);
      } else {
        const versions = await getCustomLessonVersions(targetDay);
        const match = versions.find(v => v.id === selectedVal);
        if (match) {
          CurriculumContentEngine.setCustomLesson(match);
          activeLesson = match;
        } else {
          activeLesson = CurriculumContentEngine.setActiveVersion(targetDay, selectedVal);
        }
      }

      if (activeLesson && Array.isArray(activeLesson.chunks) && activeLesson.chunks.length > 0) {
        if (!appState.flashcards) appState.flashcards = [];
        appState.flashcards = appState.flashcards.filter(c => c.day !== targetDay);
        activeLesson.chunks.forEach((item, idx) => {
          appState.flashcards.push({
            id: `card_d${targetDay}_custom_${idx}`,
            day: targetDay,
            chunk: item.en,
            meaning: item.vi,
            example: item.ex,
            box: 1,
            nextReview: Date.now()
          });
        });
        saveState();
      }

      syncDaySpecificStudyViews(targetDay);
      initStarterPack();
      showToast(selectedVal === 'default' ? 'Đã chuyển về Bài học chuẩn' : 'Đã kích hoạt phiên bản bài học AI');
    }
  });

  // Delete version handler via delegation
  document.addEventListener('click', async (event) => {
    const delBtn = event.target.closest('#btn-delete-current-version');
    if (delBtn) {
      const targetDay = Number(appState.currentDay) || 1;
      const activeId = getActiveLessonVersionId(targetDay);
      if (activeId === 'default') return;
      if (!confirm(`Bạn có chắc muốn xóa phiên bản AI này của Day ${targetDay}?`)) return;
      await deleteCustomLessonVersion(activeId, targetDay);
      const newActive = getActiveLessonVersionId(targetDay);
      CurriculumContentEngine.setActiveVersion(targetDay, newActive);
      syncDaySpecificStudyViews(targetDay);
      initStarterPack();
      showToast('🗑️ Đã xóa phiên bản bài học AI.');
    }
  });

  loadState().then(() => initCloudLessonSync()).catch(() => initCloudLessonSync());
  initNavigation();
  initScheduleAndTimers();
  initStarterPack();
  initSpeakingLab();
  initWritingStudio();
  initTimelineEngine();
  initLanShareModal();
}

// ==========================================================================
// 1. LocalStorage & Persistence
// ==========================================================================
function loadState() {
  const savedSchedule = localStorage.getItem('c1_custom_schedule');
  if (savedSchedule) {
    try {
      const parsed = JSON.parse(savedSchedule);
      if (Array.isArray(parsed) && parsed.length > 0) {
        appState.customSchedule = parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved custom schedule', e);
    }
  }

  // Load custom lessons from localStorage & Dexie
  if (!appState.customLessons) appState.customLessons = {};
  for (let d = 1; d <= 120; d++) {
    const raw = localStorage.getItem(`c1_custom_lesson_${d}`);
    if (raw) {
      try {
        const lesson = JSON.parse(raw);
        if (lesson && lesson.day) {
          appState.customLessons[lesson.day] = lesson;
          CurriculumContentEngine.setCustomLesson(lesson);
        }
      } catch (e) {}
    }
  }

  // Async load from Dexie for robust offline-first storage.
  // Returns a promise so the cloud sync can start once local versions are known.
  const dexieReady = getAllCustomLessonsLocal().then(lessons => {
    const lessonList = Array.isArray(lessons) ? lessons : Object.values(lessons || {});
    if (lessonList.length > 0) {
      lessonList.forEach(l => {
        appState.customLessons[l.day] = l;
        CurriculumContentEngine.setCustomLesson(l);
      });
      if (CurriculumContentEngine.hasCustomLesson(appState.currentDay)) {
        syncDaySpecificStudyViews(appState.currentDay);
      }
    }
  }).catch(err => console.warn('Could not load custom lessons from Dexie:', err));

  // Initialize preloaded flashcards from Starter Pack if empty
  if (!appState.flashcards || appState.flashcards.length === 0) {
    appState.flashcards = [];
    BOOTCAMP_DATA.starterPack.forEach(lesson => {
      lesson.chunks.forEach((item, idx) => {
        appState.flashcards.push({
          id: `card_d${lesson.day}_${idx}`,
          day: lesson.day,
          chunk: item.en,
          meaning: item.vi,
          example: item.ex,
          box: 1, // Leitner box (1, 2, 3)
          nextReview: Date.now()
        });
      });
    });
    saveState();
  }

  return dexieReady;
}

// ==========================================================================
// 1b. Firebase Cloud Shared Lesson Sync (multi-user / multi-device)
// ==========================================================================
function replaceFlashcardsForDay(dayNum, chunks) {
  const day = Number(dayNum);
  if (!Number.isFinite(day) || !Array.isArray(chunks) || chunks.length === 0) return;
  if (!appState.flashcards) appState.flashcards = [];
  appState.flashcards = appState.flashcards.filter(c => c.day !== day);
  chunks.forEach((item, idx) => {
    appState.flashcards.push({
      id: `card_d${day}_custom_${idx}`,
      day,
      chunk: item.en,
      meaning: item.vi,
      example: item.ex,
      box: 1,
      nextReview: Date.now()
    });
  });
  saveState();
}

/**
 * Integrate lessons received from the Firebase Cloud shared library into the
 * running app: register activated ones in the content engine, refresh the UI
 * and notify the user.
 */
function applyCloudLessons({ addedLessons = [], activatedLessons = [], isFirst = false } = {}) {
  if ((!addedLessons || addedLessons.length === 0) && (!activatedLessons || activatedLessons.length === 0)) return;

  if (!appState.customLessons) appState.customLessons = {};
  const touchedDays = new Set();

  // Every newly shared version is already in the local store — just refresh
  // the version selector so it appears in the dropdown.
  addedLessons.forEach(lesson => touchedDays.add(Number(lesson.day)));

  // Shared lessons auto-activated for days with no local lesson:
  // enable them in the engine and rebuild that day's flashcards.
  activatedLessons.forEach(lesson => {
    try {
      appState.customLessons[lesson.day] = lesson;
      CurriculumContentEngine.setCustomLesson(lesson);
      touchedDays.add(Number(lesson.day));
      replaceFlashcardsForDay(lesson.day, lesson.chunks);
    } catch (e) {
      console.warn('[CloudSync] Failed to activate shared lesson locally:', lesson?.id, e);
    }
  });

  const currentDay = Number(appState.currentDay) || 1;
  if (touchedDays.has(currentDay)) {
    // Re-rendering the starter pack also refreshes the lesson content and the
    // version selector, which always mirrors the current day.
    syncDaySpecificStudyViews(currentDay);
    initStarterPack();
    renderLessonVersionSelector(currentDay);
  }

  // Let open React surfaces (e.g. the shared cloud library modal) refresh.
  window.dispatchEvent(new CustomEvent('cloud-lessons-updated', {
    detail: { added: addedLessons.length, activated: activatedLessons.length }
  }));

  const newCount = (addedLessons || []).length;
  if (newCount > 0) {
    showToast(isFirst
      ? `☁️ Đã tải ${newCount} bài học dùng chung từ nhóm trên Firebase Cloud!`
      : `☁️ Có ${newCount} bài học mới được thành viên khác đồng bộ!`);
  }
}

function initCloudLessonSync() {
  if (!isCloudSyncEnabled()) {
    console.info('[CloudSync] Firebase chưa cấu hình hoặc đồng bộ đang tắt — bỏ qua đồng bộ bài học dùng chung.');
    return;
  }

  // The first snapshot delivers the full shared library (initial sync);
  // subsequent snapshots deliver new imports from other members live.
  subscribeToCustomLessonsFromCloud(result => applyCloudLessons(result || {}));

  // Self-healing: re-upload this device's locally imported lessons that are
  // missing from the shared cloud library (failed past upload, cloud cleanup).
  restoreLocalLessonsToCloud().catch(() => {});

  // Safety net: re-pull the whole shared library periodically in case a
  // live snapshot was dropped (network blip, tab suspended, PWA resume).
  if (!window.__cloudLessonSyncTimer__) {
    window.__cloudLessonSyncTimer__ = setInterval(() => {
      syncCustomLessonsFromCloud().then(res => {
        if (res.success && (res.addedLessons.length > 0 || res.activatedLessons.length > 0)) {
          applyCloudLessons(res);
        }
      }).catch(() => {});
    }, 5 * 60 * 1000);
  }
}

export function getDaySpecificSchedule(targetDay = appState.currentDay, baseSchedule = null) {
  const dayNum = Number(targetDay) || appState.currentDay || 1;
  const dayData = BOOTCAMP_DATA.roadmap.find(r => r.day === dayNum) || BOOTCAMP_DATA.roadmap[0];
  const curLesson = CurriculumContentEngine.getDayLesson(dayNum);

  // If active lesson is a custom AI lesson (or standard lesson with no customSchedule override), use its tailored scheduleBlocks
  if (curLesson && Array.isArray(curLesson.scheduleBlocks) && curLesson.scheduleBlocks.length > 0) {
    if (curLesson.isCustomAiLesson || (!appState.customSchedule || appState.customSchedule.length === 0)) {
      return curLesson.scheduleBlocks.map((item, idx) => ({
        ...item,
        id: item.id || (idx + 1),
        rawBlock: item.block,
        rawOutput: item.output,
        level: curLesson.level || dayData.level,
        day: dayNum
      }));
    }
  }

  const scheduleSource = baseSchedule || (
    (appState.customSchedule && Array.isArray(appState.customSchedule) && appState.customSchedule.length > 0)
      ? appState.customSchedule
      : BOOTCAMP_DATA.dailySchedule
  );

  const starterData = BOOTCAMP_DATA.starterPack?.find(s => s.day === dayNum);

  return scheduleSource.map((item) => {
    const rawTitle = (item.block || item.title || '').toLowerCase();
    const skill = (item.skill || '').toLowerCase();
    let adaptedTitle = item.block;
    let adaptedOutput = item.output;

    // Detect block category
    if (skill === 'grammar' || rawTitle.includes('grammar') || rawTitle.includes('ngữ pháp')) {
      if (dayData.isWeeklyTest || dayData.isGate) {
        adaptedTitle = `Tổng Ôn Ngữ Pháp: ${dayData.grammar}`;
        adaptedOutput = `Củng cố toàn bộ điểm ngữ pháp: "${dayData.grammar}" & chuẩn bị kiểm tra`;
      } else {
        adaptedTitle = `Ngữ pháp: ${dayData.grammar}`;
        adaptedOutput = `30–50 câu nói & viết áp dụng cấu trúc "${dayData.grammar}" (${dayData.level})`;
      }
    } else if (skill === 'listening' || rawTitle.includes('listening') || rawTitle.includes('nghe')) {
      if (rawTitle.includes('extensive') || rawTitle.includes('conversation')) {
        adaptedTitle = `Extensive Listening: VOA / Podcast (${dayData.level})`;
        adaptedOutput = `60–90m nghe thụ cảm tự nhiên chủ đề "${dayData.vocab}" không phụ đề`;
      } else {
        if (starterData?.listening) {
          adaptedTitle = `Nghe Chuyên Sâu: ${starterData.listening.title}`;
          adaptedOutput = `Dictation bài "${starterData.listening.title}" + Trả lời câu hỏi hiểu + Shadowing 5 lần`;
        } else if (dayData.isWeeklyTest || dayData.isGate) {
          adaptedTitle = `Kiểm Tra Nghe Benchmark (${dayData.level})`;
          adaptedOutput = `Nghe bài mới không chuẩn bị trước, phân tích lỗi nghe và tóm tắt`;
        } else {
          adaptedTitle = `Nghe Chuyên Sâu: Chủ đề ${dayData.vocab}`;
          adaptedOutput = `Dictation 60–90s tài liệu ${dayData.level} + Shadowing ngữ điệu tự nhiên`;
        }
      }
    } else if (skill === 'vocabulary' || rawTitle.includes('vocab') || rawTitle.includes('từ vựng') || rawTitle.includes('collocation') || rawTitle.includes('chunk')) {
      if (dayData.isWeeklyTest || dayData.isGate) {
        adaptedTitle = `Ôn Tập Toàn Bộ Chunks Tuần ${dayData.week}`;
        adaptedOutput = `Active recall 100% chunks trong tuần, kiểm tra collocation và phản xạ`;
      } else if (starterData?.chunks) {
        adaptedTitle = `20 Chunks Ngày ${dayData.day}: ${dayData.vocab}`;
        adaptedOutput = `Nạp 20 chunks chủ đề "${dayData.vocab}" + nghe mẫu TTS + lưu SRS`;
      } else {
        adaptedTitle = `Từ Vựng & Chunks: Chủ đề ${dayData.vocab}`;
        adaptedOutput = `20 Target Chunks (${dayData.level}) + đặt câu ngữ cảnh thực tế`;
      }
    } else if (skill === 'reading' || rawTitle.includes('reading') || rawTitle.includes('đọc')) {
      if (starterData?.reading) {
        adaptedTitle = `Active Reading: ${starterData.reading.title}`;
        adaptedOutput = `Tóm tắt: "${starterData.reading.prompt || starterData.reading.title}"`;
      } else if (dayData.isWeeklyTest || dayData.isGate) {
        adaptedTitle = `Đọc Hiểu Benchmark (${dayData.level})`;
        adaptedOutput = `Đọc văn bản tính giờ, trích xuất 10 cụm từ C1/B2 và viết tóm tắt`;
      } else {
        adaptedTitle = `Active Reading: Chủ đề ${dayData.vocab}`;
        adaptedOutput = `Đọc phân tích cấu trúc, trích 10 cụm collocations và viết tóm tắt 100–150 từ`;
      }
    } else if (skill === 'speaking' || rawTitle.includes('speaking') || rawTitle.includes('nói') || rawTitle.includes('pronunciation') || rawTitle.includes('phát âm')) {
      if (dayData.isGate) {
        adaptedTitle = `Phase Gate Speaking: ${dayData.speaking}`;
        adaptedOutput = `Thu âm liên tục không dùng tài liệu theo tiêu chuẩn Gate (${dayData.level})`;
      } else if (dayData.isWeeklyTest) {
        adaptedTitle = `Weekly Speaking Review: ${dayData.speaking}`;
        adaptedOutput = `Thu âm 5 phút nói không dùng giấy nhớ tổng kết tuần (Take 1 & Take 2)`;
      } else {
        adaptedTitle = `Speaking: ${dayData.speaking}`;
        adaptedOutput = `Thu âm nói: "${dayData.speaking}" (Take 1 nháp → Take 2 hoàn thiện)`;
      }
    } else if (skill === 'writing' || rawTitle.includes('writing') || rawTitle.includes('viết')) {
      const promptSnippet = (dayData.writing || '').replace(/^Write\s*/i, '');
      const shortPrompt = promptSnippet.length > 38 ? promptSnippet.slice(0, 38) + '...' : promptSnippet;
      if (dayData.isGate) {
        adaptedTitle = `Gate Timed Writing (${dayData.level})`;
        adaptedOutput = `Viết bài luận tính giờ: ${dayData.writing} (Chấm theo CEFR Rubric)`;
      } else if (dayData.isWeeklyTest) {
        adaptedTitle = `Weekly Review Writing: ${shortPrompt}`;
        adaptedOutput = `Viết bài phản ánh tuần: ${dayData.writing}`;
      } else {
        adaptedTitle = `Writing: ${shortPrompt}`;
        adaptedOutput = `Nhiệm vụ: ${dayData.writing} (Draft 1 → Phân tích lỗi → Rewrite Draft 2)`;
      }
    } else if (rawTitle.includes('immersion') || rawTitle.includes('entertainment')) {
      adaptedTitle = `Immersion: Media & Phim (${dayData.level})`;
      adaptedOutput = `Xem video/tin tức tiếng Anh tự nhiên + Ghi lại 5 cụm từ thú vị`;
    } else if (rawTitle.includes('srs') || rawTitle.includes('error') || rawTitle.includes('sổ lỗi')) {
      if (dayData.isWeeklyTest || dayData.isGate) {
        adaptedTitle = `Đánh Giá Tuần & Reset Sổ Lỗi Vàng`;
        adaptedOutput = `Tổng kết tuần, phân tích lỗi lặp lại ≥3 lần, lên kế hoạch cho tuần tới`;
      } else {
        adaptedTitle = `SRS Review & Sổ Lỗi Ngày ${dayData.day}`;
        adaptedOutput = `Ôn toàn bộ thẻ SRS đến hạn + Ghi lỗi lặp lại + Viết nhật ký 3 dòng`;
      }
    }

    return {
      ...item,
      rawBlock: item.block,
      rawOutput: item.output,
      block: adaptedTitle,
      output: adaptedOutput,
      level: dayData.level,
      day: dayNum
    };
  });
}

export function getActiveSchedule(targetDay = appState.currentDay, options = {}) {
  const baseSchedule = (appState.customSchedule && Array.isArray(appState.customSchedule) && appState.customSchedule.length > 0)
    ? appState.customSchedule
    : BOOTCAMP_DATA.dailySchedule;

  if (options && options.raw) {
    return baseSchedule;
  }

  return getDaySpecificSchedule(targetDay, baseSchedule);
}

export function saveState() {
  store.dispatch(replaceStudy(appState));
  if (store.getState().meta.error) throw new Error(store.getState().meta.error);
}

export function showToast(message) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>${message}</span>
  `;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

// ==========================================================================
// 2. Navigation & Router
// ==========================================================================
export function highlightSchedulePanel() {
  document.body.classList.remove('schedule-collapsed');
  if (window.innerWidth <= 1200) {
    document.body.classList.add('schedule-open');
  }
  const panel = document.getElementById('schedule-sidebar');
  if (panel) {
    panel.style.boxShadow = '0 0 35px rgba(99, 102, 241, 0.7)';
    panel.style.transition = 'box-shadow 0.3s ease';
    setTimeout(() => {
      panel.style.boxShadow = '';
    }, 1200);
  }
}

function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const pageViews = document.querySelectorAll('.page-view');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const sidebar = document.querySelector('.sidebar');
  const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');

  // Load saved sidebar collapse state
  const isCollapsedInitial = localStorage.getItem('c1_sidebar_collapsed') === 'true';
  if (sidebar && isCollapsedInitial) {
    sidebar.classList.add('collapsed');
    document.body.classList.add('sidebar-collapsed');
  }

  // Sidebar collapse toggle button
  if (sidebarToggleBtn && sidebar) {
    sidebarToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('collapsed');
      document.body.classList.toggle('sidebar-collapsed');
      const isCol = sidebar.classList.contains('collapsed');
      localStorage.setItem('c1_sidebar_collapsed', isCol ? 'true' : 'false');
      showToast(isCol ? 'Đã thu gọn menu về icons' : 'Đã mở rộng menu điều hướng');
    });
  }

  // Right Schedule Panel Toggles
  const toggleScheduleBtn = document.getElementById('toggle-schedule-panel-btn');
  const closeScheduleBtn = document.getElementById('close-schedule-panel-btn');

  if (toggleScheduleBtn) {
    toggleScheduleBtn.addEventListener('click', () => {
      if (window.innerWidth <= 1200) {
        document.body.classList.toggle('schedule-open');
      } else {
        document.body.classList.toggle('schedule-collapsed');
      }
    });
  }

  if (closeScheduleBtn) {
    closeScheduleBtn.addEventListener('click', () => {
      if (window.innerWidth <= 1200) {
        document.body.classList.remove('schedule-open');
      } else {
        document.body.classList.add('schedule-collapsed');
      }
      showToast('Đã thu gọn cột Lịch 12H & Timers (bấm ⏱️ Lịch 12H để mở lại)');
    });
  }

  // Quick Protocols button in right sidebar
  const openProtocolsBtn = document.getElementById('open-protocols-modal-btn');
  if (openProtocolsBtn) {
    openProtocolsBtn.addEventListener('click', () => {
      const scheduleNav = document.querySelector('[data-target=schedule]');
      if (scheduleNav) scheduleNav.click();
    });
  }

  if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // React Router owns navigation and active page selection.

  // Header quick day selector
  const quickDaySelect = document.getElementById('quick-day-select');
  if (quickDaySelect) {
    for (let d = 1; d <= 120; d++) {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = `Day ${d}`;
      if (d === appState.currentDay) opt.selected = true;
      quickDaySelect.appendChild(opt);
    }
    quickDaySelect.addEventListener('change', (e) => {
      switchCurrentDay(parseInt(e.target.value));
    });
  }
}

export function switchCurrentDay(newDay) {
  const dayNum = Number(newDay) || 1;
  appState.currentDay = dayNum;
  saveState();
  updateHeaderDay();
  initStarterPack();
  syncDaySpecificStudyViews(dayNum);

  // Re-render schedule list and timeline bar with day-specific content
  renderScheduleList();
  renderTimelineBarTrack();
  updateTimelineTick();

  showToast(`Đã chuyển sang Ngày ${dayNum} trong lộ trình!`);
  loadRecordingsForCurrentDay();
}

export function syncDaySpecificStudyViews(targetDay = appState.currentDay) {
  const dayNum = Number(targetDay) || 1;
  const dayData = BOOTCAMP_DATA.roadmap.find(r => r.day === dayNum) || BOOTCAMP_DATA.roadmap[0];
  const curLesson = CurriculumContentEngine.getDayLesson(dayNum);

  // 1. Sync Speaking Studio Prompt & Recordings
  const speakingPromptEl = document.getElementById('active-speaking-prompt-text');
  if (speakingPromptEl) {
    speakingPromptEl.textContent = `🎯 Day ${dayNum} (${dayData.level}): ${dayData.speaking || curLesson.speakingTask}`;
  }

  // 2. Sync Writing Studio Prompt & Drafts
  const writingPromptEl = document.getElementById('active-writing-prompt-text');
  if (writingPromptEl) {
    writingPromptEl.textContent = `🎯 Day ${dayNum} (${dayData.level}): ${dayData.writing || curLesson.writingTask}`;
  }
  const drafts = appState.writingDrafts[dayNum] || {};
  for (const [id, key] of [['writing-draft-1', 'draft1'], ['writing-draft-2', 'draft2']]) {
    const field = document.getElementById(id);
    if (field) field.value = drafts[key] || '';
  }
  document.getElementById('writing-draft-1')?.dispatchEvent(new Event('input'));

  // 3. Render Lesson Content for current day
  renderLessonContent(curLesson);

  // 4. Update Header Day & Pill
  updateHeaderDay();
  const dayPill = document.getElementById('timeline-current-day-pill');
  if (dayPill) {
    dayPill.textContent = `Day ${dayNum} (${dayData.level})`;
  }

  // 5. Update timeline current objective text
  const currentSchedule = getActiveSchedule(dayNum);
  const now = new Date();
  const curSecs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const activeBlock = currentSchedule.find(b => {
    const rawTime = b.time || '';
    const parts = (rawTime.includes('–') ? rawTime.split('–') : rawTime.split('-')).map(s => s.trim());
    const [sH, sM] = (parts[0] || '07:00').split(':').map(Number);
    const [eH, eM] = (parts[1] || '08:30').split(':').map(Number);
    return curSecs >= (sH * 3600 + sM * 60) && curSecs < (eH * 3600 + eM * 60);
  });

  const objTextEl = document.getElementById('timeline-current-objective-text');
  if (objTextEl) {
    if (activeBlock) {
      objTextEl.textContent = `${activeBlock.block}: ${activeBlock.output}`;
    } else {
      objTextEl.textContent = `🎯 Mục tiêu Day ${dayNum} (${dayData.level}): Ngữ pháp "${dayData.grammar}" & ${dayData.vocab}`;
    }
  }

  const objJumpBtn = document.getElementById('timeline-obj-jump-btn');
  if (objJumpBtn) {
    objJumpBtn.onclick = () => {
      reviewAndStudyBlock(activeBlock || currentSchedule[0]);
    };
  }

  // Refresh schedule panel and timeline bar to reflect day-specific/custom AI blocks
  renderScheduleList();
  renderTimelineBarTrack();
}

function updateHeaderDay() {
  const dayBadge = document.getElementById('header-day-display');
  const quickSelect = document.getElementById('quick-day-select');
  const sidebarDay = document.getElementById('sidebar-day-number');
  const cefrTag = document.getElementById('header-cefr-tag');

  const currentDayData = BOOTCAMP_DATA.roadmap.find(r => r.day === appState.currentDay) || BOOTCAMP_DATA.roadmap[0];

  if (dayBadge) dayBadge.textContent = `Day ${appState.currentDay}: ${currentDayData.grammar}`;
  if (quickSelect) quickSelect.value = appState.currentDay;
  if (sidebarDay) sidebarDay.textContent = `Day ${appState.currentDay}/120`;
  
  if (cefrTag) {
    cefrTag.textContent = currentDayData.level;
    cefrTag.className = `cefr-tag ${currentDayData.level.toLowerCase()}`;
  }
}

// ==========================================================================
// 3 & 4. Dashboard & Roadmap (Migrated to Reactive React Components)
// ==========================================================================
export function toggleCompleteDay(dayNum) {
  const day = Number(dayNum);
  if (!Array.isArray(appState.completedDays)) appState.completedDays = [];
  if (appState.completedDays.includes(day)) {
    appState.completedDays = appState.completedDays.filter(d => d !== day);
    showToast(`Đã bỏ đánh dấu hoàn thành Ngày ${day}`);
  } else {
    appState.completedDays.push(day);
    appState.completedDays.sort((a, b) => a - b);
    showToast(`🎉 Chúc mừng bạn đã hoàn thành Ngày ${day}!`);
    playChimeSound();
  }
  saveState();
}

// ==========================================================================
// 5. Schedule & Protocols
// ==========================================================================
export function initScheduleAndTimers() {
  // Protocol Tabs in SchedulePage
  const protocolTabs = document.querySelectorAll('.protocol-tab-btn');
  protocolTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      protocolTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderProtocols(tab.getAttribute('data-protocol'));
    });
  });
  renderProtocols('listening');
}

export function setTimerMode(mode) {
  window.dispatchEvent(new CustomEvent('set-focus-timer', { detail: { mode } }));
}
export function toggleTimer() {}
export function startTimer() {}
export function pauseTimer() {}
export function resetTimer() {}
export function updateTimerDisplay() {}

const LESSON_SECTION_BY_BLOCK_ID = {
  1: 'block-section-grammar',
  2: 'block-section-listening',
  3: 'block-section-chunks',
  4: 'block-section-reading',
  5: 'block-section-speaking',
  6: 'block-section-writing',
  7: 'block-section-extensive',
  8: 'block-section-immersion',
  9: 'block-section-srs'
};

function getLessonSectionId(block) {
  const checkText = `${block.block || block.title || ''} ${block.rawBlock || ''} ${block.skill || ''}`.toLowerCase();

  if (checkText.includes('grammar') || checkText.includes('ngữ pháp')) return 'block-section-grammar';
  if (checkText.includes('chunk') || checkText.includes('collocation') || checkText.includes('từ vựng') || checkText.includes('vocab')) return 'block-section-chunks';
  if (checkText.includes('reading') || checkText.includes('đọc')) return 'block-section-reading';
  if (checkText.includes('speaking') || checkText.includes('nói') || checkText.includes('phát âm') || checkText.includes('pronunciation')) return 'block-section-speaking';
  if (checkText.includes('writing') || checkText.includes('viết')) return 'block-section-writing';
  if (checkText.includes('extensive') || checkText.includes('hội thoại') || checkText.includes('conversation') || checkText.includes('thảo luận')) return 'block-section-extensive';
  if (checkText.includes('immersion') || checkText.includes('thực chiến') || checkText.includes('đời thực')) return 'block-section-immersion';
  if (checkText.includes('srs') || checkText.includes('sổ lỗi') || checkText.includes('phản tư') || checkText.includes('review')) return 'block-section-srs';
  if (checkText.includes('listening') || checkText.includes('nghe')) return 'block-section-listening';

  return LESSON_SECTION_BY_BLOCK_ID[Number(block.id)] || 'block-section-listening';
}

export function openDailyLessonBlock(block) {
  if (!block) return;

  const targetDay = Number(block.day) || appState.currentDay || 1;
  if (targetDay !== appState.currentDay) {
    appState.currentDay = targetDay;
    saveState();
    updateHeaderDay();
  }
  syncDaySpecificStudyViews(targetDay);

  document.querySelector('.nav-link[data-target="lessons"]')?.click();
  window.location.hash = '#/lessons';

  setTimeout(() => {
    const section = document.getElementById(getLessonSectionId(block));
    if (!section) return;

    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    section.style.boxShadow = '0 0 25px rgba(99, 102, 241, 0.7)';
    section.style.transition = 'box-shadow 0.4s ease';
    setTimeout(() => { section.style.boxShadow = ''; }, 1500);
  }, 200);
}

export function reviewAndStudyBlock(block) {
  if (!block) return;
  const targetDay = Number(block.day) || appState.currentDay || 1;
  if (targetDay !== appState.currentDay) {
    appState.currentDay = targetDay;
    saveState();
    updateHeaderDay();
  }

  // Synchronize all study views to the target day
  syncDaySpecificStudyViews(targetDay);

  const title = (block.block || block.title || '').toLowerCase();
  const rawTitle = (block.rawBlock || '').toLowerCase();
  const skill = (block.skill || '').toLowerCase();
  const checkText = `${title} ${rawTitle} ${skill}`;
  let targetRoute = 'dashboard';
  let timerDuration = block.durationMinutes || 90;

  if (checkText.includes('speaking') || checkText.includes('nói') || checkText.includes('phát âm') || checkText.includes('pronunciation')) {
    targetRoute = 'speaking';
  } else if (checkText.includes('ngữ pháp') || checkText.includes('grammar')) {
    targetRoute = 'grammar';
  } else if (checkText.includes('writing') || checkText.includes('viết')) {
    targetRoute = 'writing';
  } else if (checkText.includes('srs') || checkText.includes('flashcard') || checkText.includes('từ vựng') || checkText.includes('vocab') || checkText.includes('chunk')) {
    targetRoute = 'flashcards';
  } else if (checkText.includes('listening') || checkText.includes('reading') || checkText.includes('nghe') || checkText.includes('đọc') || checkText.includes('immersion')) {
    targetRoute = 'lessons';
  }

  // Broadcast timer trigger to ScheduleSidebar React component
  window.dispatchEvent(new CustomEvent('set-focus-timer', {
    detail: { durationMinutes: timerDuration, mode: 'deep' }
  }));

  document.querySelector(`.nav-link[data-target="${targetRoute}"]`)?.click();
  window.location.hash = `#/${targetRoute}`;

  if (targetRoute === 'lessons') {
    setTimeout(() => {
      const sec = document.getElementById(getLessonSectionId(block));
      if (sec) {
        sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        sec.style.boxShadow = '0 0 25px rgba(99, 102, 241, 0.7)';
        sec.style.transition = 'box-shadow 0.4s ease';
        setTimeout(() => { sec.style.boxShadow = ''; }, 1500);
      }
    }, 200);
  }

  showToast(`🚀 Đang mở công cụ học Day ${targetDay}: ${block.block || block.title} (${timerDuration} phút)!`);
}

export function renderScheduleList() {
  // Handled reactively by ScheduleSidebar React component
  window.dispatchEvent(new CustomEvent('schedule-updated'));
}

export function initTimelineEngine() {
  // Handled reactively by TimelineStrip and ScheduleSidebar React components
}

export function renderTimelineBarTrack() {
  // Handled reactively by TimelineStrip React component
  window.dispatchEvent(new CustomEvent('timeline-updated'));
}

export function updateTimelineTick() {
  // Handled reactively by React clock hooks
}

export function triggerReminderAlert(title, message, voiceText) {
  if (appState.settings && appState.settings.soundAlerts) {
    playChimeSound();
  }
  if (appState.settings && appState.settings.voiceAlerts && voiceText) {
    setTimeout(() => {
      speakText(voiceText);
    }, 400);
  }
  if (appState.settings && appState.settings.desktopNotif && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, { body: message, icon: 'favicon.ico' });
    } catch (e) {
      console.warn('Desktop notification error:', e);
    }
  }
  showToast(title);
}

function renderProtocols(protocolKey) {
  const container = document.getElementById('protocol-steps-container');
  const titleEl = document.getElementById('protocol-active-title');
  if (!container) return;

  container.innerHTML = '';

  if (protocolKey === 'fatigue') {
    const fatigue = BOOTCAMP_DATA.protocols.fatigueRule;
    if (titleEl) titleEl.textContent = fatigue.title;
    container.innerHTML = `
      <div class="[background:rgba(245,158,11,0.08)] [border-left:3px_solid_var(--accent-amber)] p-[16px] rounded-[10px] leading-[1.7]" >
        ${fatigue.text}
      </div>
    `;
    return;
  }

  const steps = BOOTCAMP_DATA.protocols[protocolKey] || [];
  if (titleEl) {
    const titles = {
      listening: 'Intensive Listening Protocol (90 min)',
      reading: 'Active Reading Protocol (90 min)',
      speaking: 'Deliberate Speaking Protocol (90 min)',
      writing: 'Rigorous Writing & Rewrite Protocol (90 min)'
    };
    titleEl.textContent = titles[protocolKey] || 'Protocol';
  }

  steps.forEach(s => {
    const stepEl = document.createElement('div');
    stepEl.className = 'protocol-step';
    stepEl.innerHTML = `
      <div class="step-num">${s.step}</div>
      <div class="[flex:1]" >
        ${s.duration ? `<strong class="text-brand-light mr-[6px]" >[${s.duration}]</strong>` : ''}
        <span>${s.text}</span>
      </div>
    `;
    container.appendChild(stepEl);
  });
}

// ==========================================================================
// 6. Curriculum Lessons & Starter Pack (Days 1–120)
// ==========================================================================
export function initStarterPack() {
  // Handled reactively by LessonsPage React component
}

export function renderLessonContent(_lesson) {
  // Handled reactively by LessonsPage React component
}

export async function renderLessonVersionSelector(dayNum) {
  const targetDay = Number(dayNum) || appState.currentDay || 1;
  const selectEl = document.getElementById('lesson-version-select');
  const countEl = document.getElementById('lesson-version-count');
  const deleteBtn = document.getElementById('btn-delete-current-version');
  if (!selectEl) return;

  const versions = await getCustomLessonVersions(targetDay);
  const activeId = getActiveLessonVersionId(targetDay);

  selectEl.innerHTML = '';

  // 1. Standard Default Lesson Option
  const defaultOpt = document.createElement('option');
  defaultOpt.value = 'default';
  defaultOpt.textContent = '📌 Bài học chuẩn (Standard Bootcamp)';
  if (activeId === 'default' || versions.length === 0) {
    defaultOpt.selected = true;
  }
  selectEl.appendChild(defaultOpt);

  // 2. Add each AI Version
  versions.forEach((ver, index) => {
    const opt = document.createElement('option');
    opt.value = ver.id;
    const timeStr = ver.createdAt ? dayjs(ver.createdAt).format('HH:mm DD/MM') : '';
    const byStr = ver.sharedBy ? ` • ${ver.sharedBy}` : '';
    opt.textContent = `✨ ${ver.theme} ${timeStr ? `[${timeStr}]` : ''}${byStr}`;
    if (activeId === ver.id) {
      opt.selected = true;
    }
    selectEl.appendChild(opt);
  });

  if (countEl) {
    countEl.textContent = `(${versions.length > 0 ? `${versions.length} bản AI + 1 bản chuẩn` : '1 bản có sẵn'})`;
  }

  // Update Delete button visibility
  if (deleteBtn) {
    if (activeId !== 'default' && versions.length > 0) {
      deleteBtn.classList.remove('hidden');
    } else {
      deleteBtn.classList.add('hidden');
    }
  }
}

export async function restoreDefaultLesson(dayNum) {
  const targetDay = Number(dayNum) || appState.currentDay || 1;
  try {
    await deleteCustomLessonLocal(targetDay);
    localStorage.removeItem(`c1_custom_lesson_${targetDay}`);
    localStorage.removeItem(`c1_custom_lesson_versions_${targetDay}`);
    setActiveLessonVersionId(targetDay, 'default');
    CurriculumContentEngine.removeCustomLesson(targetDay);
    if (appState.customLessons) {
      delete appState.customLessons[targetDay];
    }

    syncDaySpecificStudyViews(targetDay);
    initStarterPack();
    showToast(`↩️ Đã khôi phục bài học gốc chuẩn cho Day ${targetDay}`);
  } catch (err) {
    console.error('Error restoring default lesson:', err);
    showToast(`Không thể khôi phục: ${err.message}`);
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('custom-lesson-applied', (e) => {
    const lesson = e.detail;
    if (!lesson || !lesson.day) return;

    // 1. Ensure engine and storage have it active
    setActiveLessonVersionId(lesson.day, lesson.id);
    CurriculumContentEngine.setCustomLesson(lesson);

    // 2. If user is currently on another day, switch to lesson day!
    if (appState.currentDay !== lesson.day) {
      switchCurrentDay(lesson.day);
    }

    // 3. Auto navigate to lessons tab if on another page
    const lessonsNavBtn = document.querySelector('.nav-link[data-target=lessons]');
    if (lessonsNavBtn && !lessonsNavBtn.classList.contains('active')) {
      lessonsNavBtn.click();
      window.location.hash = '#/lessons';
    }

    // 4. Update Flashcards with new chunks
    if (Array.isArray(lesson.chunks) && lesson.chunks.length > 0) {
      if (!appState.flashcards) appState.flashcards = [];
      appState.flashcards = appState.flashcards.filter(c => c.day !== lesson.day);
      lesson.chunks.forEach((item, idx) => {
        appState.flashcards.push({
          id: `card_d${lesson.day}_custom_${idx}`,
          day: lesson.day,
          chunk: item.en,
          meaning: item.vi,
          example: item.ex,
          box: 1,
          nextReview: Date.now()
        });
      });
      saveState();
    }

    // 5. Force re-render of lesson and all views
    syncDaySpecificStudyViews(lesson.day);
    initStarterPack();
  });
}

// ==========================================================================
// 7. Speaking & Recording Lab (Audio Recorder)
// ==========================================================================
export function loadRecordingsForCurrentDay() {
  // Handled reactively by SpeakingPage React component
}

export function initSpeakingLab() {
  // Handled reactively by SpeakingPage React component
}

// ==========================================================================
// 8. Writing Studio (Distraction-Free & Rewrite Canvas)
// ==========================================================================
export async function copyWritingGuidePrompt() {
  try {
    let topic = '';
    const activePromptEl = document.getElementById('active-writing-prompt-text');
    const promptText = activePromptEl ? activePromptEl.textContent.trim() : '';
    const isPlaceholder = !promptText || promptText.includes('Hãy chọn đề bài trong danh sách bên dưới');

    if (!isPlaceholder) {
      topic = promptText;
    } else {
      const currentDay = appState?.currentDay || 1;
      const currentDayData = BOOTCAMP_DATA?.roadmap?.find(r => r.day === currentDay) || BOOTCAMP_DATA?.roadmap?.[0];
      topic = (currentDayData && currentDayData.writing)
        ? `Day ${currentDayData.day} Writing Task: ${currentDayData.writing}`
        : 'CEFR C1 Academic Writing Task';
    }

    const guidePrompt = `Act as an expert CEFR C1 & Cambridge English Writing Coach / Senior IELTS Examiner.

I am preparing to write an essay on the following topic and need your structured guidance:
--------------------------------------------------------------------------------
TOPIC / PROMPT:
${topic}
--------------------------------------------------------------------------------

Please provide a comprehensive, high-scoring preparation guide consisting of TWO essential parts:

### PART 1: DETAILED OUTLINE (DÀN Ý CHI TIẾT)
1. **Topic Breakdown & Analysis**:
   - Clarify the core question, target register (academic/formal), and key perspectives to explore.
2. **Introduction**:
   - Hook & Contextual background
   - Paraphrase of the prompt
   - Strong Thesis Statement & structural roadmap
3. **Body Paragraph 1 (Primary Argument)**:
   - Clear Topic Sentence
   - Deep explanation & reasoning (Why / How)
   - Real-world / concrete illustration or example
   - Concluding / linking sentence
4. **Body Paragraph 2 (Secondary Argument or Counter-argument & Rebuttal)**:
   - Clear Topic Sentence
   - Nuanced analysis & evidence
   - Synthesis connecting back to the thesis
5. **Conclusion**:
   - Restate thesis using sophisticated paraphrase
   - Summarize main arguments
   - Forward-looking takeaway / thought-provoking final implication

### PART 2: MODEL ESSAY (BÀI MẪU CHUẨN C1 ADVANCED)
- Write an exemplary, complete sample essay (approximately 250 - 320 words) at CEFR C1 / Band 8.0+ level.
- Demonstrate sophisticated cohesion, academic tone, natural paragraph progression, and varied sentence structures.

### BONUS: KEY LEARNING ASSETS (TỪ VỰNG & CẤU TRÚC ĐẮT GIÁ)
- **Top 6-8 C1 Academic Chunks & Collocations**: List key phrases used in the model essay along with their meanings and usage tips.
- **3 Advanced Syntactic Patterns**: Highlight sophisticated structures (e.g., Inversion, Cleft sentence, Participle clause, Complex conditional) used in the essay with short explanations of why they elevate the grammatical score.

Please present the outline and essay clearly so I can study the structure before writing my own draft.`;

    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(guidePrompt);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = guidePrompt;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
    }

    showToast('💡 Đã copy Prompt hướng dẫn (Dàn ý & Bài mẫu C1)! Hãy dán vào AI.');
    return guidePrompt;
  } catch (err) {
    console.error('Failed to copy writing guide prompt:', err);
    showToast('Không thể tự động copy, vui lòng thử lại.');
  }
}

export function initWritingStudio() {
  // Handled reactively by WritingPage React component
}

export function renderWritingPrompts() {
  // Handled reactively by WritingPage React component
}

// ==========================================================================
// 9 & 10. Flashcards SRS & Grammar Matrix (Migrated to Reactive React Components)
// ==========================================================================
export function renderGrammarTable(_levelFilter = 'all') {
  // Maintained for backward compatibility if invoked from modals
}

// ==========================================================================
// 11 & 12. AI Tutor Prompts & Error Log / Backup (Migrated to React Components)
// ==========================================================================

// ==========================================================================
// 13. Audio Synthesis (Web Audio Chime Gong) & Speech API
// ==========================================================================
export function playChimeSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 1.2);
  } catch (e) {
    console.warn('Audio Context not allowed without interaction:', e);
  }
}

export function speakText(text, lang = 'en-US', rate = 0.95) {
  if (!('speechSynthesis' in window)) {
    alert('Trình duyệt của bạn không hỗ trợ Text-to-Speech.');
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  window.speechSynthesis.speak(utterance);
}

// ==========================================================================
// 14. Global Modal Helper
// ==========================================================================
function openModal(title, contentHtml) {
  let modal = document.getElementById('global-modal-overlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'global-modal-overlay';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card">
        <button class="modal-close-btn" data-action="close-modal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <h3 class="font-display text-[20px] font-bold text-[#fff] mb-[18px]" id="global-modal-title" ></h3>
        <div id="global-modal-body"></div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  document.getElementById('global-modal-title').textContent = title;
  document.getElementById('global-modal-body').innerHTML = contentHtml;
  modal.classList.add('open');
}

function closeModal() {
  const modal = document.getElementById('global-modal-overlay');
  if (modal) modal.classList.remove('open');
}

// ==========================================================================
// 15. LAN & Mobile Sharing (Migrated to LanShareModal React Component)
// ==========================================================================
export function initLanShareModal() {
  // Handled reactively by LanShareModal React component
}

// ==========================================================================
// 16. Pronunciation (Migrated to React Components)
// ==========================================================================


