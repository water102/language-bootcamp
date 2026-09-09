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
/**
 * English C1 Bootcamp — Core Application Controller
 * Browser study tools mounted by React, with Redux persistence.
 */

// Application State
export let appState = structuredClone(store.getState().study);

// Timer State
let timerState = {
  mode: 'deep', // 'deep' (90m), 'pomo' (25m), 'break' (5m), 'stopwatch'
  totalSeconds: 90 * 60,
  remainingSeconds: 90 * 60,
  intervalId: null,
  isRunning: false
};

// Audio Recorder State
let recorderState = {
  mediaRecorder: null,
  audioChunks: [],
  isRecording: false,
  timerInterval: null,
  secondsRecorded: 0,
  take1Url: null,
  take2Url: null
};

// Current Flashcard Index
let srsState = {
  currentIndex: 0,
  cards: [],
  isFlipped: false
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

  loadState();
  initNavigation();
  initDashboard();
  initRoadmap();
  initScheduleAndTimers();
  initStarterPack();
  initSpeakingLab();
  initWritingStudio();
  initFlashcardsSRS();
  initGrammarMatrix();
  initAIPrompts();
  initErrorLogAndBackup();
  initTimelineEngine();
  initLanShareModal();
  initPronunciation();
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

  // Async load from Dexie for robust offline-first storage
  getAllCustomLessonsLocal().then(lessons => {
    if (Array.isArray(lessons) && lessons.length > 0) {
      lessons.forEach(l => {
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
  initDashboard();
  initStarterPack();
  syncDaySpecificStudyViews(dayNum);
  if (typeof renderRoadmapGrid === 'function') renderRoadmapGrid();

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
// 3. Dashboard
// ==========================================================================
function initDashboard() {
  updateHeaderDay();

  // Progress stats
  const completedCount = appState.completedDays.length;
  const progressPercent = Math.round((completedCount / 120) * 100);

  const completedCountEl = document.getElementById('stat-completed-days');
  const percentEl = document.getElementById('stat-percent');
  const streakEl = document.getElementById('stat-streak');
  const chunksLearnedEl = document.getElementById('stat-chunks-learned');

  if (completedCountEl) completedCountEl.textContent = `${completedCount} / 120`;
  if (percentEl) percentEl.textContent = `${progressPercent}%`;
  if (streakEl) streakEl.textContent = `${appState.streak} Days 🔥`;
  if (chunksLearnedEl) chunksLearnedEl.textContent = `${completedCount * 20} Chunks`;

  // Today's mission
  const currentDayData = BOOTCAMP_DATA.roadmap.find(r => r.day === appState.currentDay) || BOOTCAMP_DATA.roadmap[0];
  const missionTitle = document.getElementById('mission-day-title');
  const missionGrammar = document.getElementById('mission-grammar-val');
  const missionVocab = document.getElementById('mission-vocab-val');
  const missionSpeaking = document.getElementById('mission-speaking-val');
  const missionWriting = document.getElementById('mission-writing-val');

  if (missionTitle) missionTitle.textContent = `Nhiệm Vụ Trọng Tâm Ngày ${currentDayData.day} (${currentDayData.level})`;
  if (missionGrammar) missionGrammar.textContent = currentDayData.grammar;
  if (missionVocab) missionVocab.textContent = currentDayData.vocab;
  if (missionSpeaking) missionSpeaking.textContent = currentDayData.speaking;
  if (missionWriting) missionWriting.textContent = currentDayData.writing;

  // Render Daily 6-KPI Checklist
  renderKPIChecklist();

  // Render Phase Gates tracker
  renderPhaseGates();
}

function renderKPIChecklist() {
  const container = document.getElementById('daily-kpi-container');
  if (!container) return;

  const todayKey = `day_${appState.currentDay}`;
  const dayKpis = appState.kpis[todayKey] || {};

  container.innerHTML = '';
  BOOTCAMP_DATA.dailyKPIs.forEach(kpi => {
    const isChecked = !!dayKpis[kpi.id];
    const item = document.createElement('div');
    item.className = `kpi-item ${isChecked ? 'checked' : ''}`;
    item.innerHTML = `
      <div class="kpi-checkbox">
        ${isChecked ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>` : ''}
      </div>
      <span class="kpi-text">${kpi.text}</span>
    `;

    item.addEventListener('click', () => {
      toggleKPI(kpi.id);
    });

    container.appendChild(item);
  });
}

function toggleKPI(kpiId) {
  const todayKey = `day_${appState.currentDay}`;
  if (!appState.kpis[todayKey]) appState.kpis[todayKey] = {};
  appState.kpis[todayKey][kpiId] = !appState.kpis[todayKey][kpiId];
  saveState();
  renderKPIChecklist();

  // Check if all 6 KPIs are done to celebrate
  const allChecked = BOOTCAMP_DATA.dailyKPIs.every(k => appState.kpis[todayKey][k.id]);
  if (allChecked) {
    playChimeSound();
    if (!appState.completedDays.includes(appState.currentDay)) {
      appState.completedDays.push(appState.currentDay);
      saveState();
    }
    showToast(`🎉 Xuất sắc! Bạn đã hoàn thành toàn bộ 6 KPI của Ngày ${appState.currentDay}!`);
    initDashboard();
  }
}

function renderPhaseGates() {
  const container = document.getElementById('phase-gates-container');
  if (!container) return;

  const fillBar = document.getElementById('phase-gate-fill');
  const current = appState.currentDay;
  const progressPercent = Math.min(100, Math.round((current / 120) * 100));

  if (fillBar) {
    fillBar.style.width = `${progressPercent}%`;
  }

  container.innerHTML = '';
  BOOTCAMP_DATA.gates.forEach(gate => {
    const isPassed = current > gate.day;
    const isActive = current <= gate.day && current > (gate.day - 14);

    const node = document.createElement('div');
    node.className = `gate-node ${isPassed ? 'passed' : ''} ${isActive ? 'active' : ''}`;
    node.innerHTML = `
      <div class="gate-dot">${isPassed ? '✓' : gate.level}</div>
      <div class="gate-info">
        <div class="gate-day">Day ${gate.day}</div>
        <div class="gate-name">${gate.gate}</div>
      </div>
    `;

    node.addEventListener('click', () => {
      openModal(`Phase Gate Checkpoint: Day ${gate.day} (${gate.gate})`, `
        <div class="flex flex-col gap-[12px]" >
          <p><strong>Tiêu chí tối thiểu bắt buộc:</strong></p>
          <div class="[background:rgba(255,255,255,0.05)] p-[14px] rounded-[10px] [border-left:3px_solid_var(--accent-amber)] leading-[1.6]" >
            ${gate.criteria}
          </div>
          <p class="text-[13px] text-muted mt-[6px]" >
            ⚠️ <em>Gating Rule: Nếu bạn trượt gate này với khoảng cách lớn, hãy kéo dài thêm 4–8 tuần thay vì vội vã sang phase tiếp theo!</em>
          </p>
          <button class="btn-primary mt-[10px]"  data-action="switch-day" data-day="${gate.day}">Chuyển tới Ngày ${gate.day}</button>
        </div>
      `);
    });

    container.appendChild(node);
  });
}

// ==========================================================================
// 4. Interactive 120-Day Roadmap
// ==========================================================================
let renderRoadmapGrid = null;

function initRoadmap() {
  const container = document.getElementById('roadmap-grid-container');
  const searchInput = document.getElementById('roadmap-search-input');
  const filterPills = document.querySelectorAll('.roadmap-filter-pill');

  let currentLevelFilter = 'all';
  let currentSearchTerm = '';

  function renderRoadmap() {
    if (!container) return;
    container.innerHTML = '';

    const filtered = BOOTCAMP_DATA.roadmap.filter(item => {
      const matchFilter = currentLevelFilter === 'all' || 
                           item.level.toLowerCase() === currentLevelFilter.toLowerCase() ||
                           (currentLevelFilter === 'gate' && item.isGate);
      const matchSearch = currentSearchTerm === '' ||
                          item.grammar.toLowerCase().includes(currentSearchTerm) ||
                          item.vocab.toLowerCase().includes(currentSearchTerm) ||
                          item.speaking.toLowerCase().includes(currentSearchTerm) ||
                          `day ${item.day}`.includes(currentSearchTerm);
      return matchFilter && matchSearch;
    });

    filtered.forEach(dayItem => {
      const isCompleted = appState.completedDays.includes(dayItem.day);
      const isCurrent = (dayItem.day === appState.currentDay);
      const card = document.createElement('div');
      card.className = `day-card ${isCurrent ? 'current-learning-day' : ''} ${isCompleted ? 'completed' : ''} ${dayItem.isGate ? 'is-gate' : ''}`;
      if (isCurrent) card.id = 'current-learning-roadmap-card';

      card.innerHTML = `
        <div class="day-card-header">
          <div class="day-header-left">
            <span class="day-num">Day ${dayItem.day}</span>
            ${isCurrent ? '<span class="current-learning-pill">⚡ Đang học</span>' : ''}
          </div>
          <span class="cefr-tag ${dayItem.level.toLowerCase()}">${dayItem.level}</span>
        </div>
        <div class="day-card-body">
          <div class="day-topic">${dayItem.grammar}</div>
          <div class="day-grammar">📚 Vocab: <strong>${dayItem.vocab}</strong></div>
          <div class="day-grammar">🎙️ Speak: ${dayItem.speaking}</div>
        </div>
        <div class="day-meta-footer">
          <span>${dayItem.isGate ? '⭐ Gatekeeper' : dayItem.isWeeklyTest ? '📝 Weekly Test' : 'W' + dayItem.week}</span>
          <span class="${isCurrent ? 'footer-current-tag' : ''}">${isCurrent ? '🔥 Đang học hôm nay' : (isCompleted ? '✅ Hoàn thành' : '👉 Bắt đầu')}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        openDayDetailModal(dayItem);
      });

      container.appendChild(card);
    });
  }

  renderRoadmapGrid = renderRoadmap;

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentLevelFilter = pill.getAttribute('data-level');
      renderRoadmap();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchTerm = e.target.value.toLowerCase().trim();
      renderRoadmap();
    });
  }

  renderRoadmap();
}

function openDayDetailModal(dayItem) {
  const isCompleted = appState.completedDays.includes(dayItem.day);

  openModal(`Chi Tiết Lộ Trình: Day ${dayItem.day} (${dayItem.level})`, `
    <div class="flex flex-col gap-[16px]" >
      <div>
        <span class="cefr-tag ${dayItem.level.toLowerCase()} text-[12px]" >CEFR: ${dayItem.level}</span>
        <span class="font-code text-[12px] text-dim ml-[8px]" >Tuần ${dayItem.week}</span>
      </div>
      
      <div class="glass-card p-[16px] [background:rgba(255,255,255,0.03)]" >
        <h4 class="text-brand-light mb-[6px]" >📖 Ngữ Pháp / Use of English</h4>
        <p class="text-[15px] text-[#fff] font-semibold" >${dayItem.grammar}</p>
      </div>

      <div class="glass-card p-[16px] [background:rgba(255,255,255,0.03)]" >
        <h4 class="text-accent-amber mb-[6px]" >🗂️ Miền Từ Vựng (Vocabulary Domain)</h4>
        <p class="text-[14px] text-[#fff]" >${dayItem.vocab}</p>
      </div>

      <div class="glass-card p-[16px] [background:rgba(255,255,255,0.03)]" >
        <h4 class="text-accent-cyan mb-[6px]" >🎙️ Nhiệm Vụ Nói (Speaking Task)</h4>
        <p class="text-[14px] text-[#fff]" >${dayItem.speaking}</p>
      </div>

      <div class="glass-card p-[16px] [background:rgba(255,255,255,0.03)]" >
        <h4 class="text-[#ec4899] mb-[6px]" >✍️ Nhiệm Vụ Viết (Writing Task)</h4>
        <p class="text-[14px] text-[#fff]" >${dayItem.writing}</p>
      </div>

      <div class="[background:rgba(16,185,129,0.08)] [border:1px_solid_rgba(16,185,129,0.2)] p-[14px] rounded-[10px]" >
        <strong class="text-accent-green" >🎯 Chỉ tiêu KPI ngày:</strong>
        <p class="text-[13.5px] text-[#cbd5e1] mt-[4px]" >${dayItem.kpi}</p>
      </div>

      <div class="flex gap-[12px] mt-[10px] flex-wrap" >
        <button class="btn-primary" data-action="switch-day" data-day="${dayItem.day}">
          🚀 Chọn Làm Ngày Học Hiện Tại
        </button>
        <button class="btn-secondary" data-action="complete-day" data-day="${dayItem.day}">
          ${isCompleted ? '↩️ Đánh dấu Chưa Hoàn Thành' : '✅ Đánh dấu Đã Hoàn Thành'}
        </button>
        <button class="btn-secondary [border-color:var(--accent-amber)] text-accent-amber" data-action="lesson-day" data-day="${dayItem.day}">
          📚 Mở Bài Học Chi Tiết (Day ${dayItem.day})
        </button>
        <button class="btn-secondary text-accent-cyan [border-color:rgba(6,182,212,0.4)]" data-action="copy-prompt" data-day="${dayItem.day}">
          📋 Copy Prompt AI
        </button>
        <button class="btn-secondary text-brand-light [border-color:rgba(99,102,241,0.4)]" data-action="import-lesson" data-day="${dayItem.day}">
          🤖 Nhập Bài Học Từ AI
        </button>
      </div>
    </div>
  `);
}

function toggleCompleteDay(dayNum) {
  if (appState.completedDays.includes(dayNum)) {
    appState.completedDays = appState.completedDays.filter(d => d !== dayNum);
    showToast(`Đã bỏ đánh dấu hoàn thành Ngày ${dayNum}`);
  } else {
    appState.completedDays.push(dayNum);
    showToast(`🎉 Chúc mừng bạn đã hoàn thành Ngày ${dayNum}!`);
    playChimeSound();
  }
  saveState();
  initDashboard();
  initRoadmap();
}

// ==========================================================================
// 5. Schedule & Smart Timers
// ==========================================================================
function initScheduleAndTimers() {
  renderScheduleList();
  renderProtocols('listening');

  // Timer Mode selector buttons
  const modeButtons = document.querySelectorAll('.timer-mode-btn');
  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setTimerMode(btn.getAttribute('data-mode'));
    });
  });

  const startBtn = document.getElementById('timer-start-btn');
  const resetBtn = document.getElementById('timer-reset-btn');

  if (startBtn) {
    startBtn.addEventListener('click', toggleTimer);
  }
  if (resetBtn) {
    resetBtn.addEventListener('click', resetTimer);
  }

  // Protocol Tabs
  const protocolTabs = document.querySelectorAll('.protocol-tab-btn');
  protocolTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      protocolTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderProtocols(tab.getAttribute('data-protocol'));
    });
  });
}

function setTimerMode(mode) {
  pauseTimer();
  timerState.mode = mode;

  if (mode === 'deep') {
    timerState.totalSeconds = 90 * 60;
    timerState.remainingSeconds = 90 * 60;
  } else if (mode === 'pomo') {
    timerState.totalSeconds = 25 * 60;
    timerState.remainingSeconds = 25 * 60;
  } else if (mode === 'break') {
    timerState.totalSeconds = 5 * 60;
    timerState.remainingSeconds = 5 * 60;
  } else if (mode === 'stopwatch') {
    timerState.totalSeconds = 0;
    timerState.remainingSeconds = 0;
  }

  updateTimerDisplay();
}

function toggleTimer() {
  if (timerState.isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
}

function startTimer() {
  timerState.isRunning = true;
  const startBtn = document.getElementById('timer-start-btn');
  if (startBtn) {
    startBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
      <span>Tạm dừng</span>
    `;
    startBtn.classList.remove('btn-primary');
    startBtn.classList.add('btn-secondary');
  }

  timerState.intervalId = setInterval(() => {
    if (timerState.mode === 'stopwatch') {
      timerState.remainingSeconds++;
    } else {
      timerState.remainingSeconds--;
      if (timerState.remainingSeconds <= 0) {
        pauseTimer();
        timerState.remainingSeconds = 0;
        playChimeSound();
        showToast('🔔 Khối học đã kết thúc! Hãy nghỉ ngơi giải lao.');
      }
    }
    updateTimerDisplay();
  }, 1000);
}

function pauseTimer() {
  timerState.isRunning = false;
  clearInterval(timerState.intervalId);
  const startBtn = document.getElementById('timer-start-btn');
  if (startBtn) {
    startBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
      <span>Bắt đầu</span>
    `;
    startBtn.classList.remove('btn-secondary');
    startBtn.classList.add('btn-primary');
  }
}

function resetTimer() {
  pauseTimer();
  setTimerMode(timerState.mode);
}

function updateTimerDisplay() {
  const display = document.getElementById('timer-time-text');
  const timerDial = document.getElementById('timer-dial-ring');
  if (!display) return;

  const total = timerState.remainingSeconds;
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  display.textContent = formatted;

  if (timerDial && timerState.totalSeconds > 0 && timerState.mode !== 'stopwatch') {
    const fraction = (timerState.totalSeconds - timerState.remainingSeconds) / timerState.totalSeconds;
    const deg = Math.min(360, Math.round(fraction * 360));
    timerDial.style.background = `conic-gradient(var(--primary-light) ${deg}deg, rgba(255,255,255,0.05) ${deg}deg)`;
  }
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

  setTimerMode('deep');
  timerState.totalSeconds = timerDuration * 60;
  timerState.remainingSeconds = timerDuration * 60;
  updateTimerDisplay();

  document.querySelector(`.nav-link[data-target="${targetRoute}"]`)?.click();
  window.location.hash = `#/${targetRoute}`;

  if (targetRoute === 'lessons') {
    setTimeout(() => {
      let targetSectionId = 'block-section-listening';
      if (checkText.includes('grammar') || checkText.includes('ngữ pháp')) targetSectionId = 'block-section-grammar';
      else if (checkText.includes('chunk') || checkText.includes('collocation') || checkText.includes('20')) targetSectionId = 'block-section-chunks';
      else if (checkText.includes('reading') || checkText.includes('đọc')) targetSectionId = 'block-section-reading';
      else if (checkText.includes('speaking') || checkText.includes('nói')) targetSectionId = 'block-section-speaking';
      else if (checkText.includes('writing') || checkText.includes('viết')) targetSectionId = 'block-section-writing';
      else if (checkText.includes('extensive') || checkText.includes('hội thoại') || checkText.includes('thảo luận')) targetSectionId = 'block-section-extensive';
      else if (checkText.includes('immersion') || checkText.includes('thực chiến') || checkText.includes('đời thực')) targetSectionId = 'block-section-immersion';
      else if (checkText.includes('srs') || checkText.includes('sổ lỗi') || checkText.includes('phản tư')) targetSectionId = 'block-section-srs';

      const sec = document.getElementById(targetSectionId);
      if (sec) {
        sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        sec.style.boxShadow = '0 0 25px rgba(99, 102, 241, 0.7)';
        setTimeout(() => { sec.style.boxShadow = ''; }, 1500);
      }
    }, 200);
  }

  showToast(`🚀 Đang mở công cụ học Day ${targetDay}: ${block.block || block.title} (${timerDuration} phút)!`);
}

export function renderScheduleList() {
  const container = document.getElementById('schedule-list-container');
  if (!container) return;

  const currentSchedule = getActiveSchedule();
  const dayNum = appState.currentDay || 1;
  const dayData = BOOTCAMP_DATA.roadmap.find(r => r.day === dayNum) || BOOTCAMP_DATA.roadmap[0];

  const titleEl = document.getElementById('sidebar-schedule-title');
  if (titleEl) {
    titleEl.textContent = `📅 ${currentSchedule.length} Khung Giờ Trong Ngày`;
  }
  const hintEl = document.getElementById('sidebar-schedule-hint');
  if (hintEl && currentSchedule.length > 0) {
    const firstTime = (currentSchedule[0].time || '').split(/–|-/)[0]?.trim() || '07:00';
    const lastTime = (currentSchedule[currentSchedule.length - 1].time || '').split(/–|-/)[1]?.trim() || '23:00';
    hintEl.textContent = `Day ${dayNum} (${dayData.level}) • ${firstTime}–${lastTime}`;
  }

  const timelineTitleEl = document.getElementById('global-timeline-title');
  if (timelineTitleEl) {
    const totalHours = Math.round(currentSchedule.reduce((sum, b) => sum + (b.durationMinutes || 90), 0) / 60);
    timelineTitleEl.textContent = `Tiến Trình ${totalHours} Giờ Trong Ngày`;
  }

  container.innerHTML = '';
  currentSchedule.forEach(block => {
    const item = document.createElement('div');
    item.className = 'schedule-block-item cursor-pointer hover:border-indigo-500/50 transition';
    item.id = `schedule-block-${block.id}`;

    item.innerHTML = `
      <div class="block-time">${block.time}</div>
      <div class="block-info">
        <div class="block-title flex items-center justify-between gap-1">
          <span>${block.block}</span>
          ${block.level ? `<span class="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold uppercase">${block.level}</span>` : ''}
        </div>
        <div class="block-output">🎯 Mục tiêu: ${block.output}</div>
      </div>
      <div class="mode-tag ${(block.mode || 'DEEP').toLowerCase()}">${block.mode || 'DEEP'}</div>
    `;

    item.addEventListener('click', () => {
      reviewAndStudyBlock(block);
    });

    container.appendChild(item);
  });
}

// ==========================================================================
// 5.1. Live Daily Timeline & Real-Time Countdown Engine
// ==========================================================================
let lastAlertKey = null;

function initTimelineEngine() {
  if (!appState.settings) {
    appState.settings = { soundAlerts: true, desktopNotif: false, voiceAlerts: true };
  }

  // Render linear segmented timeline bar
  renderTimelineBarTrack();

  // Wire up alert controls
  const soundToggleBtn = document.getElementById('toggle-sound-alerts-btn');
  const desktopNotifBtn = document.getElementById('toggle-desktop-notif-btn');
  const testAlertBtn = document.getElementById('test-alert-btn');

  if (soundToggleBtn) {
    soundToggleBtn.classList.toggle('active', !!appState.settings.soundAlerts);
    soundToggleBtn.onclick = () => {
      appState.settings.soundAlerts = !appState.settings.soundAlerts;
      soundToggleBtn.classList.toggle('active', appState.settings.soundAlerts);
      saveState();
      showToast(appState.settings.soundAlerts ? '🔊 Đã BẬT chuông báo & giọng nhắc!' : '🔇 Đã TẮT chuông báo.');
    };
  }

  if (desktopNotifBtn) {
    desktopNotifBtn.classList.toggle('active', !!appState.settings.desktopNotif);
    desktopNotifBtn.onclick = async () => {
      if (!('Notification' in window)) {
        alert('Trình duyệt không hỗ trợ Desktop Notifications.');
        return;
      }
      if (Notification.permission === 'granted') {
        appState.settings.desktopNotif = !appState.settings.desktopNotif;
        desktopNotifBtn.classList.toggle('active', appState.settings.desktopNotif);
        saveState();
        showToast(appState.settings.desktopNotif ? '🔔 Đã BẬT thông báo desktop!' : '🔕 Đã TẮT thông báo desktop.');
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          appState.settings.desktopNotif = true;
          desktopNotifBtn.classList.add('active');
          saveState();
          showToast('🔔 Đã cấp quyền và BẬT thông báo desktop!');
          new Notification('C1 Bootcamp Master', { body: 'Thông báo nhắc nhở đã được kích hoạt thành công!' });
        } else {
          showToast('Bạn đã từ chối quyền thông báo trên trình duyệt.');
        }
      } else {
        alert('Bạn đã chặn thông báo. Vui lòng cấp quyền thông báo trong cài đặt trình duyệt để nhận nhắc nhở.');
      }
    };
  }

  if (testAlertBtn) {
    testAlertBtn.onclick = () => {
      triggerReminderAlert(
        '🔔 Thử nghiệm nhắc nhở C1 Bootcamp!',
        'Đồng hồ đếm ngược và chuông báo đã hoạt động hoàn hảo.',
        'Attention: C1 Bootcamp study reminder test successful.'
      );
    };
  }

  // Update immediately and then every second (1000ms)
  updateTimelineTick();
  setInterval(updateTimelineTick, 1000);
}

function formatMins(totalMinutes) {
  const h = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const m = String(totalMinutes % 60).padStart(2, '0');
  return `${h}:${m}`;
}

export function renderTimelineBarTrack() {
  const track = document.getElementById('daily-timeline-bar-track');
  if (!track) return;

  const currentSchedule = getActiveSchedule();
  // Fixed daily window: 07:00 (420 min) to 23:00 (1380 min) = 960 minutes
  const dayStartMins = 420;
  const dayEndMins = 1380;
  const totalMins = dayEndMins - dayStartMins; // 960 mins

  const parseMins = (tStr) => {
    if (!tStr) return 0;
    const [h, m] = tStr.trim().split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  // Convert each block to time interval
  const parsedBlocks = currentSchedule.map((blk, idx) => {
    const rawTime = blk.time || '';
    const parts = (rawTime.includes('–') ? rawTime.split('–') : rawTime.split('-')).map(s => s.trim());
    const startM = parseMins(parts[0]);
    const endM = parseMins(parts[1]);
    const durM = blk.durationMinutes || (endM > startM ? endM - startM : 90);
    return {
      ...blk,
      idx: idx + 1,
      startM,
      endM: endM || (startM + durM),
      durM
    };
  }).sort((a, b) => a.startM - b.startM);

  const segments = [];
  let cursorMins = dayStartMins;

  parsedBlocks.forEach(blk => {
    if (blk.startM > cursorMins) {
      const gapM = blk.startM - cursorMins;
      segments.push({
        type: 'break',
        shortName: gapM >= 45 ? `🍽️ Nghỉ (${gapM}m)` : `☕ ${gapM}m`,
        label: `Nghỉ giải lao (${formatMins(cursorMins)}–${formatMins(blk.startM)})`,
        mode: 'break',
        durM: gapM
      });
      cursorMins = blk.startM;
    }

    const cleanTitle = (blk.block || '').replace(/^Khối\s*\d+:\s*/i, '').split('+')[0].split('(')[0].trim();
    segments.push({
      type: 'block',
      id: blk.id,
      num: String(blk.idx),
      shortName: cleanTitle || blk.block,
      label: `${blk.block} (${blk.time})`,
      output: blk.output,
      mode: (blk.mode || 'DEEP').toLowerCase(),
      durM: blk.durM
    });
    cursorMins = Math.max(cursorMins, blk.endM);
  });

  if (cursorMins < dayEndMins) {
    const endGapM = dayEndMins - cursorMins;
    segments.push({
      type: 'break',
      shortName: `🌙 Nghỉ (${endGapM}m)`,
      label: `Thời gian tự do / Nghỉ ngơi (${formatMins(cursorMins)}–23:00)`,
      mode: 'break',
      durM: endGapM
    });
  }

  track.innerHTML = '';

  segments.forEach(seg => {
    const segWidthPct = (seg.durM / totalMins) * 100;
    const el = document.createElement('div');
    el.className = `timeline-block-seg ${seg.mode}`;
    el.style.width = `${segWidthPct}%`;
    el.title = seg.output ? `${seg.label} • Mục tiêu: ${seg.output} • ${seg.durM} phút` : `${seg.label} • ${seg.durM} phút`;

    if (seg.type === 'block') {
      el.id = `timeline-seg-${seg.id}`;
      el.innerHTML = `<span class="seg-full-label"><strong>${seg.num}.</strong> ${seg.shortName}</span>`;
      el.onclick = () => {
        const blk = currentSchedule.find(b => b.id === seg.id) || currentSchedule[0];
        if (blk) {
          reviewAndStudyBlock(blk);
        }
      };
    } else {
      el.innerHTML = `<span class="seg-break-text">${seg.shortName}</span>`;
    }
    track.appendChild(el);
  });

  const needle = document.createElement('div');
  needle.className = 'timeline-needle';
  needle.id = 'timeline-live-needle';
  needle.innerHTML = `
    <div class="needle-flag" id="needle-flag-text">00:00</div>
    <div class="needle-line"></div>
  `;
  track.appendChild(needle);
}

export function updateTimelineTick() {
  const now = new Date();
  const curH = now.getHours();
  const curM = now.getMinutes();
  const curS = now.getSeconds();

  const currentTotalSecs = curH * 3600 + curM * 60 + curS;
  const currentTotalMins = curH * 60 + curM;

  // Format digital clock HH:MM:SS
  const timeStr = `${String(curH).padStart(2, '0')}:${String(curM).padStart(2, '0')}:${String(curS).padStart(2, '0')}`;
  const clockEl = document.getElementById('live-clock-time');
  if (clockEl) clockEl.textContent = timeStr;

  // Update needle position
  const needle = document.getElementById('timeline-live-needle');
  const needleFlag = document.getElementById('needle-flag-text');
  if (needle && needleFlag) {
    needleFlag.textContent = `${String(curH).padStart(2, '0')}:${String(curM).padStart(2, '0')}`;
    const offsetMins = currentTotalMins + (curS / 60) - 420; // 07:00 is 420
    let needlePct = (offsetMins / 960) * 100;
    if (needlePct < 0) needlePct = 0;
    if (needlePct > 100) needlePct = 100;
    needle.style.left = `${needlePct}%`;
  }

  // Determine current active block or break
  let activeBlock = null;
  let nextBlock = null;
  const currentSchedule = getActiveSchedule();

  for (let i = 0; i < currentSchedule.length; i++) {
    const blk = currentSchedule[i];
    const rawTime = blk.time || '';
    const parts = (rawTime.includes('–') ? rawTime.split('–') : rawTime.split('-')).map(s => s.trim());
    const [sH, sM] = (parts[0] || '07:00').split(':').map(Number);
    const [eH, eM] = (parts[1] || '08:30').split(':').map(Number);

    const bStartSecs = sH * 3600 + sM * 60;
    const bEndSecs = eH * 3600 + eM * 60;

    if (currentTotalSecs >= bStartSecs && currentTotalSecs < bEndSecs) {
      activeBlock = {
        ...blk,
        startSecs: bStartSecs,
        endSecs: bEndSecs,
        durationSecs: bEndSecs - bStartSecs,
        elapsedSecs: currentTotalSecs - bStartSecs,
        remainingSecs: bEndSecs - currentTotalSecs
      };
      nextBlock = currentSchedule[i + 1] || null;
      break;
    } else if (currentTotalSecs < bStartSecs && !nextBlock) {
      nextBlock = blk;
    }
  }

  // Elements to update
  const statusBadge = document.getElementById('current-status-badge');
  const modeBadge = document.getElementById('current-mode-badge');
  const blockTitleEl = document.getElementById('current-block-name');
  const blockDescEl = document.getElementById('current-block-output');
  const countdownDigitsEl = document.getElementById('live-countdown-digits');
  const countdownLabelEl = document.getElementById('countdown-label-text');
  const progressFillEl = document.getElementById('live-block-progress-fill');
  const blockStartLbl = document.getElementById('block-start-time-lbl');
  const blockEndLbl = document.getElementById('block-end-time-lbl');
  const blockPercentLbl = document.getElementById('block-percent-lbl');
  const nextBlockPreviewEl = document.getElementById('next-block-preview-text');
  const jumpBtn = document.getElementById('btn-jump-to-current-tool');
  const timelineActiveTag = document.getElementById('timeline-active-tag');

  // Clear previous active highlights
  document.querySelectorAll('.timeline-block-seg').forEach(s => s.classList.remove('active-seg'));
  document.querySelectorAll('.schedule-block-item').forEach(s => s.classList.remove('current-active'));

  if (activeBlock) {
    // 1. INSIDE AN ACTIVE STUDY BLOCK
    const segEl = document.getElementById(`timeline-seg-${activeBlock.id}`);
    if (segEl) segEl.classList.add('active-seg');

    const schEl = document.getElementById(`schedule-block-${activeBlock.id}`);
    if (schEl) schEl.classList.add('current-active');

    if (timelineActiveTag) {
      timelineActiveTag.textContent = `⚡ Khối ${activeBlock.id}: ${activeBlock.block.split('+')[0].split('(')[0].trim()}`;
      timelineActiveTag.className = `timeline-active-tag ${activeBlock.mode.toLowerCase()}`;
    }

    if (statusBadge) {
      statusBadge.textContent = 'ĐANG TRONG KHỐI';
      statusBadge.className = 'status-indicator-pill active';
    }
    if (modeBadge) {
      modeBadge.textContent = `${activeBlock.mode.toUpperCase()} MODE`;
      modeBadge.className = `mode-tag ${activeBlock.mode.toLowerCase()}`;
    }
    if (blockTitleEl) {
      blockTitleEl.textContent = `${activeBlock.time} • ${activeBlock.block}`;
    }
    if (blockDescEl) {
      blockDescEl.textContent = `🎯 Mục tiêu đầu ra: ${activeBlock.output}`;
    }

    // Format remaining countdown
    const remM = Math.floor(activeBlock.remainingSecs / 60);
    const remS = activeBlock.remainingSecs % 60;
    const countdownStr = `${String(remM).padStart(2, '0')}:${String(remS).padStart(2, '0')}`;
    if (countdownDigitsEl) countdownDigitsEl.textContent = countdownStr;
    if (countdownLabelEl) countdownLabelEl.textContent = 'Thời gian còn lại trong khối:';

    // Progress percentage
    const pct = Math.min(100, Math.round((activeBlock.elapsedSecs / activeBlock.durationSecs) * 100));
    if (progressFillEl) progressFillEl.style.width = `${pct}%`;
    if (blockPercentLbl) blockPercentLbl.textContent = `${pct}% đã qua`;

    const [st, et] = activeBlock.time.split('–');
    if (blockStartLbl) blockStartLbl.textContent = st;
    if (blockEndLbl) blockEndLbl.textContent = et;

    // Next block teaser
    if (nextBlockPreviewEl) {
      if (nextBlock) {
        nextBlockPreviewEl.textContent = `⏭️ Tiếp theo: ${nextBlock.time} ${nextBlock.block} (${nextBlock.mode})`;
      } else {
        nextBlockPreviewEl.textContent = '⏭️ Tiếp theo: 23:00 Giờ ngủ phục hồi';
      }
    }

    // Quick jump button
    if (jumpBtn) {
      jumpBtn.style.display = 'inline-flex';
      const jumpConfig = getToolJumpForBlock(activeBlock.id);
      jumpBtn.innerHTML = `${jumpConfig.icon} <span>${jumpConfig.label}</span>`;
      jumpBtn.onclick = () => {
        document.querySelector(`[data-target=${jumpConfig.target}]`).click();
      };
    }

    // 5-minute warning alert
    if (activeBlock.remainingSecs === 300) {
      const alertKey = `warn_5m_${activeBlock.id}_${now.toDateString()}`;
      if (lastAlertKey !== alertKey) {
        lastAlertKey = alertKey;
        triggerReminderAlert(
          `⚠️ Cảnh báo 5 phút: Khối ${activeBlock.block}`,
          `Còn 5 phút nữa là kết thúc khối học! Hãy kiểm tra và hoàn thành mục tiêu: "${activeBlock.output}".`,
          `Five minutes remaining in ${activeBlock.block}. Finish your output.`
        );
      }
    }

    // Block start alert
    if (activeBlock.elapsedSecs === 1 || activeBlock.elapsedSecs === 0) {
      const alertKey = `start_${activeBlock.id}_${now.toDateString()}`;
      if (lastAlertKey !== alertKey) {
        lastAlertKey = alertKey;
        triggerReminderAlert(
          `🔔 Bắt đầu: ${activeBlock.block} (${activeBlock.time})`,
          `Mục tiêu khối: ${activeBlock.output}. Hãy bắt đầu tập trung cao độ!`,
          `Starting ${activeBlock.block}. Deep focus now.`
        );
      }
    }

  } else if (currentTotalMins >= 420 && currentTotalMins < 1380) {
    // 2. BREAK INTERVAL
    if (statusBadge) {
      statusBadge.textContent = 'GIỜ NGHỈ GIẢI LAO';
      statusBadge.className = 'status-indicator-pill break';
    }
    if (modeBadge) {
      modeBadge.textContent = 'NẠP NĂNG LƯỢNG';
      modeBadge.className = 'mode-tag light';
    }
    if (blockTitleEl) {
      blockTitleEl.textContent = '☕ Thời Gian Nghỉ Ngơi & Thư Giãn';
    }
    if (blockDescEl) {
      blockDescEl.textContent = 'Vận động nhẹ nhàng, uống nước để não bộ phục hồi trước khi vào khối tiếp theo.';
    }

    // Countdown to next block
    if (nextBlock) {
      const rawTime = nextBlock.time || '';
      const parts = (rawTime.includes('–') ? rawTime.split('–') : rawTime.split('-')).map(s => s.trim());
      const [sH, sM] = (parts[0] || '07:00').split(':').map(Number);
      const nextStartSecs = sH * 3600 + sM * 60;
      const secsToNext = Math.max(0, nextStartSecs - currentTotalSecs);

      const remM = Math.floor(secsToNext / 60);
      const remS = secsToNext % 60;
      if (countdownDigitsEl) countdownDigitsEl.textContent = `${String(remM).padStart(2, '0')}:${String(remS).padStart(2, '0')}`;
      if (countdownLabelEl) countdownLabelEl.textContent = 'Đếm ngược đến khối tiếp theo:';
      if (nextBlockPreviewEl) nextBlockPreviewEl.textContent = `⏭️ Chuẩn bị: ${nextBlock.time} ${nextBlock.block} (${nextBlock.mode || 'DEEP'})`;
      if (blockStartLbl) blockStartLbl.textContent = 'Giải lao';
      if (blockEndLbl) blockEndLbl.textContent = parts[0] || '07:00';
      if (blockPercentLbl) blockPercentLbl.textContent = `Còn ${remM}m`;
      if (progressFillEl) progressFillEl.style.width = '100%';
    }

    if (jumpBtn) {
      jumpBtn.style.display = 'none';
    }

  } else {
    // 3. SLEEP / RECOVERY TIME (23:00 to 07:00)
    if (statusBadge) {
      statusBadge.textContent = 'GIỜ NGỦ & PHỤC HỒI';
      statusBadge.className = 'status-indicator-pill sleep';
    }
    if (modeBadge) {
      modeBadge.textContent = 'RECOVERY';
      modeBadge.className = 'mode-tag light';
    }
    if (blockTitleEl) {
      blockTitleEl.textContent = '🌙 Giấc Ngủ Sâu Bắt Buộc (7.5–9 Tiếng)';
    }
    if (blockDescEl) {
      blockDescEl.textContent = 'Quy tắc Bootcamp: Không bao giờ đánh đổi giấc ngủ lấy việc học. Não bộ cần ngủ để củng cố trí nhớ dài hạn.';
    }

    let secsTo7am = 0;
    if (currentTotalMins >= 1380) { // 23:00 to 24:00
      secsTo7am = (86400 - currentTotalSecs) + (7 * 3600);
    } else { // 00:00 to 07:00
      secsTo7am = (7 * 3600) - currentTotalSecs;
    }

    const remH = Math.floor(secsTo7am / 3600);
    const remM = Math.floor((secsTo7am % 3600) / 60);
    const remS = secsTo7am % 60;

    if (countdownDigitsEl) countdownDigitsEl.textContent = `${String(remH).padStart(2, '0')}:${String(remM).padStart(2, '0')}:${String(remS).padStart(2, '0')}`;
    if (countdownLabelEl) countdownLabelEl.textContent = 'Đếm ngược đến 07:00 sáng mai:';
    if (nextBlockPreviewEl) nextBlockPreviewEl.textContent = '⏭️ Ngày mai: 07:00 Grammar + sentence production';
    if (progressFillEl) progressFillEl.style.width = '100%';
    if (blockPercentLbl) blockPercentLbl.textContent = 'Ngủ sâu';
    if (blockStartLbl) blockStartLbl.textContent = '23:00';
    if (blockEndLbl) blockEndLbl.textContent = '07:00';

    if (jumpBtn) {
      jumpBtn.style.display = 'none';
    }
  }

  // Update timeline objective banner
  const timelineObjText = document.getElementById('timeline-current-objective-text');
  const timelineDayPill = document.getElementById('timeline-current-day-pill');
  const timelineObjJump = document.getElementById('timeline-obj-jump-btn');

  const curDayNum = appState.currentDay || 1;
  const curDayData = BOOTCAMP_DATA.roadmap.find(r => r.day === curDayNum) || BOOTCAMP_DATA.roadmap[0];

  if (timelineDayPill) {
    timelineDayPill.textContent = `Day ${curDayNum} (${curDayData.level})`;
  }

  if (activeBlock) {
    if (timelineObjText) {
      timelineObjText.textContent = `${activeBlock.block}: ${activeBlock.output}`;
    }
    if (timelineObjJump) {
      timelineObjJump.style.display = 'inline-flex';
      timelineObjJump.onclick = () => reviewAndStudyBlock(activeBlock);
    }
  } else if (currentTotalMins >= 420 && currentTotalMins < 1380) {
    if (timelineObjText) {
      timelineObjText.textContent = `☕ Giải lao phục hồi năng lượng • Tiếp theo: ${nextBlock ? `${nextBlock.time} ${nextBlock.block}` : 'Nghỉ ngơi'}`;
    }
    if (timelineObjJump && nextBlock) {
      timelineObjJump.style.display = 'inline-flex';
      timelineObjJump.onclick = () => reviewAndStudyBlock(nextBlock);
    }
  } else {
    if (timelineObjText) {
      timelineObjText.textContent = `🌙 Giấc ngủ sâu bắt buộc (7.5–9 tiếng) để củng cố trí nhớ dài hạn`;
    }
    if (timelineObjJump) {
      timelineObjJump.style.display = 'none';
    }
  }
}

function getToolJumpForBlock(blockId) {
  switch (blockId) {
    case 1: return { target: 'grammar', icon: '📖', label: 'Mở Ma Trận Ngữ Pháp' };
    case 2: return { target: 'lessons', icon: '🎧', label: 'Mở Bài Nghe Starter Pack' };
    case 3: return { target: 'flashcards', icon: '🗂️', label: 'Mở Flashcards SRS' };
    case 4: return { target: 'lessons', icon: '📖', label: 'Mở Bài Đọc Starter Pack' };
    case 5: return { target: 'speaking', icon: '🎙️', label: 'Mở Phòng Thu Speaking' };
    case 6: return { target: 'writing', icon: '✍️', label: 'Mở Writing Studio' };
    case 7: return { target: 'lessons', icon: '🎧', label: 'Mở Bài Học Tuần 1' };
    case 8: return { target: 'ai-tutor', icon: '🤖', label: 'Mở Trạm Prompt AI Tutor' };
    case 9: return { target: 'error-log', icon: '📝', label: 'Mở Sổ Lỗi Vàng' };
    default: return { target: 'dashboard', icon: '🚀', label: 'Mở Dashboard' };
  }
}

function triggerReminderAlert(title, message, voiceText) {
  // 1. Play chime bell
  if (appState.settings && appState.settings.soundAlerts) {
    playChimeSound();
  }

  // 2. Voice alert
  if (appState.settings && appState.settings.voiceAlerts && voiceText) {
    setTimeout(() => {
      speakText(voiceText);
    }, 400);
  }

  // 3. Desktop browser notification
  if (appState.settings && appState.settings.desktopNotif && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body: message,
        icon: 'favicon.ico'
      });
    } catch (e) {
      console.warn('Desktop notification error:', e);
    }
  }

  // 4. In-app toast notification
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
function initStarterPack() {
  const navContainer = document.getElementById('lesson-days-nav');
  if (!navContainer) return;

  navContainer.innerHTML = '';

  const curDay = Number(appState.currentDay) || 1;
  const curWeek = Math.ceil(curDay / 7);
  const startDay = (curWeek - 1) * 7 + 1;
  const endDay = Math.min(120, curWeek * 7);

  // Week Controls & Jump Dropdown
  const weekControls = document.createElement('div');
  weekControls.className = 'flex items-center gap-2 mb-3 w-full flex-wrap';
  weekControls.innerHTML = `
    <span class="text-xs font-bold text-accent-cyan">Tuần ${curWeek} (Day ${startDay}–${endDay}):</span>
    <select id="lesson-week-select" class="form-select text-xs py-1 px-2.5 rounded bg-slate-800 text-white border border-slate-700">
      ${Array.from({ length: 18 }, (_, i) => `<option value="${i + 1}" ${i + 1 === curWeek ? 'selected' : ''}>Tuần ${i + 1} (Day ${(i * 7) + 1}–${Math.min(120, (i + 1) * 7)})</option>`).join('')}
    </select>
    <select id="lesson-day-jump-select" class="form-select text-xs py-1 px-2.5 rounded bg-slate-800 text-white border border-slate-700">
      ${Array.from({ length: 120 }, (_, i) => `<option value="${i + 1}" ${i + 1 === curDay ? 'selected' : ''}>Nhảy tới Day ${i + 1}</option>`).join('')}
    </select>
  `;

  navContainer.appendChild(weekControls);

  const daysRow = document.createElement('div');
  daysRow.className = 'flex gap-2 overflow-x-auto w-full pb-1';

  for (let d = startDay; d <= endDay; d++) {
    const dayLesson = CurriculumContentEngine.getDayLesson(d);
    const isCustom = CurriculumContentEngine.hasCustomLesson(d);
    const btn = document.createElement('button');
    btn.className = `lesson-day-btn ${d === curDay ? 'active' : ''} ${isCustom ? 'border-emerald-500/50 text-emerald-300' : ''}`;
    btn.textContent = `${isCustom ? '✨ ' : ''}Day ${d}: ${dayLesson.theme}`;

    btn.addEventListener('click', () => {
      document.querySelectorAll('.lesson-day-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      switchCurrentDay(d);
    });

    daysRow.appendChild(btn);
  }
  navContainer.appendChild(daysRow);

  const weekSelect = weekControls.querySelector('#lesson-week-select');
  if (weekSelect) {
    weekSelect.addEventListener('change', (e) => {
      const targetW = Number(e.target.value);
      const targetFirstDay = (targetW - 1) * 7 + 1;
      switchCurrentDay(targetFirstDay);
    });
  }

  const dayJumpSelect = weekControls.querySelector('#lesson-day-jump-select');
  if (dayJumpSelect) {
    dayJumpSelect.addEventListener('change', (e) => {
      switchCurrentDay(Number(e.target.value));
    });
  }

  const activeLesson = CurriculumContentEngine.getDayLesson(curDay);
  renderLessonContent(activeLesson);
}

function renderLessonContent(lesson) {
  if (!lesson) return;
  const titleEl = document.getElementById('lesson-theme-title');
  const grammarEl = document.getElementById('lesson-grammar-title');
  const chunksContainer = document.getElementById('lesson-chunks-container');
  const listeningScriptEl = document.getElementById('lesson-listening-script');
  const listeningTitleEl = document.getElementById('lesson-listening-title');
  const questionsContainer = document.getElementById('lesson-questions-container');
  const readingTextEl = document.getElementById('lesson-reading-text');
  const readingPromptEl = document.getElementById('lesson-reading-prompt');
  const speakingTaskEl = document.getElementById('lesson-speaking-task');
  const writingTaskEl = document.getElementById('lesson-writing-task');
  const mediaEmbedContainer = document.getElementById('lesson-media-embed-container');

  if (titleEl) titleEl.textContent = `Day ${lesson.day}: ${lesson.theme}`;
  if (grammarEl) grammarEl.textContent = `Ngữ pháp mục tiêu: ${lesson.grammar}`;

  // Media Embed (VOA / LibriVox / Audio / Video)
  if (mediaEmbedContainer) {
    const media = lesson.mediaEmbed;
    if (media && (media.embedUrl || media.youtubeId || media.streamUrl || media.audioUrl)) {
      mediaEmbedContainer.classList.remove('hidden');
      const isVideo = media.type === 'video' || !!media.embedUrl || !!media.youtubeId;
      const videoSrc = media.embedUrl || (media.youtubeId ? `https://www.youtube-nocookie.com/embed/${media.youtubeId}` : '');
      const audioSrc = media.streamUrl || media.audioUrl || '';
      const provider = media.provider || media.source || 'Học liệu mở';

      if (isVideo && videoSrc) {
        mediaEmbedContainer.innerHTML = `
          <div class="p-3 bg-slate-900/80 rounded-xl border border-indigo-500/30">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="text-rose-400 font-bold text-xs">🎬 Video Học Liệu:</span>
                <span class="text-white font-semibold text-xs">${media.title}</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 uppercase">${provider}</span>
              </div>
              ${media.externalUrl ? `<a href="${media.externalUrl}" target="_blank" rel="noopener noreferrer" class="text-[11px] text-cyan-400 hover:underline">Mở video gốc ↗</a>` : ''}
            </div>
            <div class="aspect-video w-full max-w-xl mx-auto rounded-lg overflow-hidden border border-white/10">
              <iframe
                class="w-full h-full"
                src="${videoSrc}"
                title="${media.title}"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen
              ></iframe>
            </div>
          </div>
        `;
      } else if (audioSrc) {
        mediaEmbedContainer.innerHTML = `
          <div class="p-3 bg-slate-900/80 rounded-xl border border-emerald-500/30">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="text-emerald-400 font-bold text-xs">🎧 Sách Nói / Audio:</span>
                <span class="text-white font-semibold text-xs">${media.title}</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase">${provider}</span>
              </div>
              ${media.externalUrl ? `<a href="${media.externalUrl}" target="_blank" rel="noopener noreferrer" class="text-[11px] text-cyan-400 hover:underline">Mở sách ↗</a>` : ''}
            </div>
            <audio controls class="w-full mt-1" src="${audioSrc}"></audio>
          </div>
        `;
      }
    } else {
      mediaEmbedContainer.classList.add('hidden');
      mediaEmbedContainer.innerHTML = '';
    }
  }

  // Chunks list
  if (chunksContainer && Array.isArray(lesson.chunks)) {
    chunksContainer.innerHTML = '';
    lesson.chunks.forEach(c => {
      const row = document.createElement('div');
      row.className = 'chunk-row';
      row.innerHTML = `
        <div class="chunk-left">
          <div class="chunk-en">${c.en}</div>
          <div class="chunk-vi">${c.vi}</div>
          <div class="chunk-ex">"${c.ex}"</div>
        </div>
        <button class="tts-btn" title="Nghe phát âm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
        </button>
      `;

      row.querySelector('.tts-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        speakText(c.en);
      });

      chunksContainer.appendChild(row);
    });
  }

  // Listening
  if (listeningTitleEl) listeningTitleEl.textContent = lesson.listening ? lesson.listening.title : `Intensive Listening Day ${lesson.day}`;
  if (listeningScriptEl && lesson.listening) {
    listeningScriptEl.textContent = lesson.listening.script;
    listeningScriptEl.classList.add('blur-content'); // Hide transcript by default for active listening!
  }

  const toggleScriptBtn = document.getElementById('toggle-script-btn');
  if (toggleScriptBtn && listeningScriptEl) {
    toggleScriptBtn.onclick = () => {
      const isBlurred = listeningScriptEl.classList.toggle('blur-content');
      toggleScriptBtn.textContent = isBlurred ? '👁️ Hiện Transcript' : '🙈 Ẩn Transcript';
    };
  }

  const playScriptTTSBtn = document.getElementById('play-script-tts-btn');
  if (playScriptTTSBtn && lesson.listening) {
    playScriptTTSBtn.onclick = () => {
      speakText(lesson.listening.script);
    };
  }

  // Questions
  if (questionsContainer && lesson.listening && Array.isArray(lesson.listening.questions)) {
    questionsContainer.innerHTML = '';
    lesson.listening.questions.forEach((q, idx) => {
      const qBox = document.createElement('div');
      qBox.classList.add('mb-[12px]');
      qBox.innerHTML = `
        <p class="font-semibold text-[#fff] mb-[6px]" >${idx + 1}. ${q}</p>
        <input type="text" class="form-input w-full text-[13px]"  placeholder="Gõ câu trả lời của bạn..." />
      `;
      questionsContainer.appendChild(qBox);
    });
  }

  // Reading
  if (readingTextEl && lesson.reading) readingTextEl.textContent = lesson.reading.text || '';
  if (readingPromptEl && lesson.reading) readingPromptEl.textContent = lesson.reading.prompt || '';

  // Tasks
  if (speakingTaskEl) speakingTaskEl.textContent = lesson.speakingTask || lesson.speaking?.prompt || '';
  if (writingTaskEl) writingTaskEl.textContent = lesson.writingTask || lesson.writing?.prompt || '';

  // 1. Render Block 1: Grammar Details & Sentence Drills
  const grammarExpEl = document.getElementById('lesson-grammar-explanation');
  if (grammarExpEl) {
    grammarExpEl.textContent = lesson.grammarDetail?.explanation || `Lý thuyết cấu trúc: ${lesson.grammar}`;
  }
  const grammarRulesList = document.getElementById('lesson-grammar-rules-list');
  if (grammarRulesList && lesson.grammarDetail?.rules) {
    grammarRulesList.innerHTML = lesson.grammarDetail.rules.map(r => `<li>${r}</li>`).join('');
  }
  const grammarDrillsContainer = document.getElementById('lesson-grammar-drills-container');
  if (grammarDrillsContainer) {
    grammarDrillsContainer.innerHTML = '';
    const drills = lesson.grammarDetail?.sentenceDrills || [
      { drill: `Đặt 1 câu phức áp dụng "${lesson.grammar}"`, answer: `Example sentence demonstrating ${lesson.grammar}.` }
    ];
    drills.forEach((d, idx) => {
      const dItem = document.createElement('div');
      dItem.className = 'p-2.5 rounded bg-slate-950/60 border border-indigo-500/20 text-xs';
      dItem.innerHTML = `
        <div class="flex items-start justify-between gap-2">
          <div class="font-medium text-slate-200">
            <span class="text-indigo-400 font-bold">Câu ${idx + 1}:</span> ${d.drill}
          </div>
          <button class="btn-toggle-drill-ans text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 whitespace-nowrap">
            👁️ Xem đáp án
          </button>
        </div>
        <div class="drill-answer-box hidden mt-2 pt-1.5 border-t border-white/5 text-emerald-300 font-mono text-[11px]">
          💡 <strong>Đáp án mẫu:</strong> ${d.answer}
        </div>
      `;
      const ansBox = dItem.querySelector('.drill-answer-box');
      const toggleBtn = dItem.querySelector('.btn-toggle-drill-ans');
      toggleBtn.onclick = () => {
        const isHidden = ansBox.classList.toggle('hidden');
        toggleBtn.textContent = isHidden ? '👁️ Xem đáp án' : '🙈 Ẩn đáp án';
      };
      grammarDrillsContainer.appendChild(dItem);
    });
  }

  // 2. Render Block 2: Shadowing Focus
  const shadowingFocusEl = document.getElementById('lesson-listening-shadowing-focus');
  if (shadowingFocusEl) {
    shadowingFocusEl.textContent = lesson.listening?.shadowingFocus || 'Luyện nối âm tự nhiên và nhịp điệu trọng âm câu.';
  }

  // 4. Render Block 4: Active Reading Title & Vocab Focus
  const readingTitleEl = document.getElementById('lesson-reading-title');
  if (readingTitleEl) readingTitleEl.textContent = lesson.reading?.title || `Active Reading (Day ${lesson.day})`;
  const readingVocabTags = document.getElementById('lesson-reading-vocab-tags');
  if (readingVocabTags) {
    readingVocabTags.innerHTML = '';
    const vocabList = Array.isArray(lesson.reading?.vocabularyFocus) ? lesson.reading.vocabularyFocus : [];
    if (vocabList.length > 0) {
      vocabList.forEach(v => {
        const span = document.createElement('span');
        span.className = 'text-[11px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-200 border border-blue-500/30 font-mono';
        span.textContent = v;
        readingVocabTags.appendChild(span);
      });
    } else {
      readingVocabTags.innerHTML = `<span class="text-[11px] text-slate-400">Trích xuất collocations tự nhiên trong bài</span>`;
    }
  }

  // 5. Render Block 5: Speaking Studio Outline & Pronunciation
  const spkOutlineEl = document.getElementById('lesson-speaking-outline');
  if (spkOutlineEl && lesson.speaking?.outline) {
    spkOutlineEl.innerHTML = lesson.speaking.outline.map(o => `<li>${o}</li>`).join('');
  }
  const spkPronEl = document.getElementById('lesson-speaking-pronunciation');
  if (spkPronEl) {
    spkPronEl.textContent = lesson.speaking?.pronunciationTips || 'Giữ trường độ nguyên âm dài, phát âm rõ âm đuôi và nối âm tự nhiên.';
  }
  const spkFollowupEl = document.getElementById('lesson-speaking-followup');
  if (spkFollowupEl) {
    spkFollowupEl.innerHTML = '';
    const followups = Array.isArray(lesson.speaking?.followUpQuestions) ? lesson.speaking.followUpQuestions : ['How does this apply in practice?'];
    followups.forEach((q, idx) => {
      const qDiv = document.createElement('div');
      qDiv.className = 'p-1.5 rounded bg-slate-900/40 border border-white/5';
      qDiv.innerHTML = `❓ <strong>Q${idx + 1}:</strong> ${q}`;
      spkFollowupEl.appendChild(qDiv);
    });
  }

  // 6. Render Block 6: Writing Studio Outline & Samples
  const wrtOutlineEl = document.getElementById('lesson-writing-outline');
  if (wrtOutlineEl) {
    wrtOutlineEl.textContent = lesson.writing?.outline || 'Introduction (Thesis) → Body Paragraphs → Conclusion (Synthesis).';
  }
  const wrtTargetsEl = document.getElementById('lesson-writing-targets');
  if (wrtTargetsEl) {
    const targets = Array.isArray(lesson.writing?.targetStructures) ? lesson.writing.targetStructures : [`Ứng dụng cấu trúc ${lesson.grammar}`];
    wrtTargetsEl.innerHTML = targets.map(t => `<li>${t}</li>`).join('');
  }
  const wrtSampleEl = document.getElementById('lesson-writing-sample');
  if (wrtSampleEl) {
    wrtSampleEl.textContent = lesson.writing?.sampleSnippet || `In contemporary discourse, the subject of ${lesson.vocab || 'this topic'} requires rigorous lexical choice and syntactic variety.`;
  }

  // 7. Render Block 7: Extensive Listening & Conversation
  const extTitleEl = document.getElementById('lesson-extensive-title');
  if (extTitleEl) extTitleEl.textContent = lesson.extensiveListening?.title || 'Extensive Listening & Discussion';
  const extDescEl = document.getElementById('lesson-extensive-desc');
  if (extDescEl) extDescEl.textContent = lesson.extensiveListening?.description || '60–90 phút nghe thụ cảm tự nhiên và thảo luận phản biện không phụ đề.';
  const extQuestionsEl = document.getElementById('lesson-extensive-questions');
  if (extQuestionsEl) {
    const qList = Array.isArray(lesson.extensiveListening?.discussionQuestions) ? lesson.extensiveListening.discussionQuestions : [];
    extQuestionsEl.innerHTML = qList.map(q => `<div class="p-1 rounded bg-slate-900/40">💬 ${q}</div>`).join('');
  }
  const extSourcesEl = document.getElementById('lesson-extensive-sources');
  if (extSourcesEl) extSourcesEl.textContent = lesson.extensiveListening?.recommendedSources || 'BBC 6 Minute English, NPR News, TED Radio Hour';

  // 8. Render Block 8: Immersion & Real-world Expressions
  const immCtxEl = document.getElementById('lesson-immersion-context');
  if (immCtxEl) immCtxEl.textContent = lesson.immersion?.context || `Bối cảnh thực tế công sở và đời sống quốc tế.`;
  const immExpressionsEl = document.getElementById('lesson-immersion-expressions');
  if (immExpressionsEl) {
    immExpressionsEl.innerHTML = '';
    const expressions = Array.isArray(lesson.immersion?.realWorldExpressions) ? lesson.immersion.realWorldExpressions : [];
    expressions.forEach(e => {
      const eCard = document.createElement('div');
      eCard.className = 'p-2 rounded bg-slate-900/60 border border-teal-500/20';
      eCard.innerHTML = `
        <div class="font-bold text-teal-300 text-xs flex items-center justify-between">
          <span>${e.phrase}</span>
          <button class="tts-inline-btn text-[10px] text-cyan-400 hover:underline" data-text="${e.phrase}">🔊 Nghe</button>
        </div>
        <div class="text-[11px] text-slate-300 mt-0.5">${e.meaning}</div>
        <div class="text-[10px] text-slate-400 italic mt-0.5">📌 ${e.situation}</div>
      `;
      eCard.querySelector('.tts-inline-btn').onclick = () => speakText(e.phrase);
      immExpressionsEl.appendChild(eCard);
    });
  }
  const immMediaTipEl = document.getElementById('lesson-immersion-media-tip');
  if (immMediaTipEl) immMediaTipEl.textContent = lesson.immersion?.mediaSuggestion || 'Xem phóng sự VOA / BBC / Bloomberg liên quan.';

  // 9. Render Block 9: SRS & Error Log Reflection
  const srsPitfallsEl = document.getElementById('lesson-srs-pitfalls');
  if (srsPitfallsEl) {
    const pitfalls = Array.isArray(lesson.srsAndErrorLog?.commonPitfalls) ? lesson.srsAndErrorLog.commonPitfalls : ['Lỗi dịch word-by-word'];
    srsPitfallsEl.innerHTML = pitfalls.map(p => `<li>${p}</li>`).join('');
  }
  const srsRemindersEl = document.getElementById('lesson-srs-reminders');
  if (srsRemindersEl) srsRemindersEl.textContent = lesson.srsAndErrorLog?.reviewReminders || 'Ôn tập 20 target chunks mới trên SRS và bổ sung lỗi sai vào sổ lỗi.';
  const srsQuestionsEl = document.getElementById('lesson-reflection-questions');
  if (srsQuestionsEl) {
    const qList = Array.isArray(lesson.srsAndErrorLog?.reflectionQuestions) ? lesson.srsAndErrorLog.reflectionQuestions : [];
    srsQuestionsEl.innerHTML = qList.map((q, i) => `<div>${i + 1}. ${q}</div>`).join('');
  }
  const dailyReflInput = document.getElementById('lesson-daily-reflection-input');
  if (dailyReflInput) {
    dailyReflInput.value = localStorage.getItem(`c1_reflection_day_${lesson.day}`) || '';
  }
  const saveReflBtn = document.getElementById('btn-save-daily-reflection');
  if (saveReflBtn) {
    saveReflBtn.onclick = () => {
      if (dailyReflInput) {
        localStorage.setItem(`c1_reflection_day_${lesson.day}`, dailyReflInput.value);
        showToast(`💾 Đã lưu nhật ký phản tư Day ${lesson.day}!`);
      }
    };
  }

  // Custom AI Lesson Indicators & Actions
  const sourceBadge = document.getElementById('lesson-source-badge');
  const restoreBtn = document.getElementById('btn-restore-default-lesson');
  const copyPromptBtn = document.getElementById('btn-copy-day-prompt');
  const isCustom = CurriculumContentEngine.hasCustomLesson(lesson.day);

  if (sourceBadge) {
    if (isCustom) {
      sourceBadge.classList.remove('hidden');
      sourceBadge.textContent = '✨ Bài Học AI (Đã Lưu & Đồng Bộ)';
    } else {
      sourceBadge.classList.add('hidden');
    }
  }

  if (restoreBtn) {
    if (isCustom) {
      restoreBtn.classList.remove('hidden');
      restoreBtn.onclick = () => restoreDefaultLesson(lesson.day);
    } else {
      restoreBtn.classList.add('hidden');
    }
  }

  if (copyPromptBtn) {
    copyPromptBtn.onclick = async () => {
      try {
        const prompt = generateDayLessonPrompt(lesson.day);
        await navigator.clipboard.writeText(prompt);
        showToast(`📋 Đã copy prompt Cambridge C1 cho Day ${lesson.day}!`);
      } catch (e) {
        showToast(`Lỗi sao chép: Hãy mở modal Nhập bài học để copy.`);
      }
    };
  }

  // Render Version Selector for current day
  renderLessonVersionSelector(lesson.day);
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
    opt.textContent = `✨ ${ver.theme} ${timeStr ? `[${timeStr}]` : ''}`;
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
  recorderState.take1Url = null;
  recorderState.take2Url = null;
  const take1Container = document.getElementById('audio-take-1-container');
  const take2Container = document.getElementById('audio-take-2-container');
  if (take1Container) take1Container.innerHTML = '';
  if (take2Container) take2Container.innerHTML = '';

  getRecordingsByDay(appState.currentDay).then(recs => {
    if (recs && recs.length) {
      const take1 = recs.find(r => r.takeType === 'take1');
      const take2 = recs.find(r => r.takeType === 'take2');
      if (take1 && take1.audioBlob) {
        recorderState.take1Url = URL.createObjectURL(take1.audioBlob);
        displayAudioTake('take1', recorderState.take1Url);
      }
      if (take2 && take2.audioBlob) {
        recorderState.take2Url = URL.createObjectURL(take2.audioBlob);
        displayAudioTake('take2', recorderState.take2Url);
      }
    }
  }).catch(() => {});
}

function initSpeakingLab() {
  const recordBtn = document.getElementById('record-toggle-btn');
  const timerDisplay = document.getElementById('recording-timer');
  const dot = document.getElementById('recording-dot');
  const take1Container = document.getElementById('audio-take-1-container');
  const take2Container = document.getElementById('audio-take-2-container');

  if (recordBtn) {
    recordBtn.addEventListener('click', toggleAudioRecording);
  }

  // Load recordings from Dexie for active day
  loadRecordingsForCurrentDay();

  // Render speaking prompt bank
  renderSpeakingPrompts('all');

  const promptFilters = document.querySelectorAll('.speaking-filter-btn');
  promptFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      promptFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderSpeakingPrompts(btn.getAttribute('data-level'));
    });
  });
}

async function toggleAudioRecording() {
  const recordBtn = document.getElementById('record-toggle-btn');
  const dot = document.getElementById('recording-dot');
  const timerDisplay = document.getElementById('recording-timer');

  if (!recorderState.isRecording) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorderState.mediaRecorder = new MediaRecorder(stream);
      recorderState.audioChunks = [];

      recorderState.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recorderState.audioChunks.push(e.data);
        }
      };

      recorderState.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(recorderState.audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const takeType = !recorderState.take1Url ? 'take1' : 'take2';

        saveRecording({
          day: appState.currentDay,
          takeType,
          audioBlob,
          durationSeconds: recorderState.secondsRecorded || 0
        });

        if (takeType === 'take1') {
          recorderState.take1Url = audioUrl;
          displayAudioTake('take1', audioUrl);
          showToast('🎤 Đã lưu Take 1 vào Dexie! Hãy nghe lại phân tích lỗi và ghi âm Take 2.');
        } else {
          recorderState.take2Url = audioUrl;
          displayAudioTake('take2', audioUrl);
          showToast('🎯 Đã lưu Take 2 vào Dexie! Hãy đối chiếu sự tiến bộ giữa 2 lần nói.');
        }

        stream.getTracks().forEach(track => track.stop());
      };

      recorderState.mediaRecorder.start();
      recorderState.isRecording = true;
      recorderState.secondsRecorded = 0;

      if (dot) dot.classList.add('active');
      if (recordBtn) {
        recordBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="12" height="16"></rect></svg>
          <span>Dừng Thu Âm</span>
        `;
        recordBtn.classList.remove('btn-primary');
        recordBtn.classList.add('btn-danger');
      }

      recorderState.timerInterval = setInterval(() => {
        recorderState.secondsRecorded++;
        const mins = Math.floor(recorderState.secondsRecorded / 60);
        const secs = recorderState.secondsRecorded % 60;
        if (timerDisplay) {
          timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
      }, 1000);

    } catch (err) {
      console.error('Microphone error:', err);
      if (!window.isSecureContext) {
        alert('Lưu ý: Trình duyệt yêu cầu kết nối HTTPS hoặc localhost để truy cập Microphone. Khi học qua IP LAN (HTTP), tất cả các tính năng xem bài, lộ trình, flashcards SRS và bài tập đều hoạt động trọn vẹn; riêng thu âm nói bạn có thể học trực tiếp trên máy chủ localhost hoặc cấu hình cho phép trên Chrome mobile (chrome://flags).');
      } else {
        alert('Không thể truy cập microphone. Vui lòng cấp quyền Microphone trong trình duyệt của bạn!');
      }
    }
  } else {
    // Stop recording
    if (recorderState.mediaRecorder && recorderState.mediaRecorder.state !== 'inactive') {
      recorderState.mediaRecorder.stop();
    }
    recorderState.isRecording = false;
    clearInterval(recorderState.timerInterval);

    if (dot) dot.classList.remove('active');
    if (recordBtn) {
      recordBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
        <span>Ghi Âm Nói</span>
      `;
      recordBtn.classList.remove('btn-danger');
      recordBtn.classList.add('btn-primary');
    }
  }
}

function displayAudioTake(takeType, url) {
  const container = document.getElementById(`audio-${takeType}-container`);
  if (!container) return;

  container.innerHTML = `
    <div class="audio-take-box">
      <strong class="text-brand-light text-[13px] w-[70px]" >${takeType === 'take1' ? 'Take 1' : 'Take 2'}:</strong>
      <audio controls src="${url}"></audio>
      <a href="${url}" download="${takeType}_day_${appState.currentDay}.webm" class="btn-secondary py-[6px] px-[12px] text-[12px]" >Tải về</a>
    </div>
  `;
}

function renderSpeakingPrompts(levelFilter) {
  const container = document.getElementById('speaking-prompts-container');
  if (!container) return;

  container.innerHTML = '';
  let allPrompts = [];

  if (levelFilter === 'all' || levelFilter === 'a1_a2') {
    allPrompts = allPrompts.concat(BOOTCAMP_DATA.speakingPrompts.A1_A2.map(p => ({ ...p, level: 'A1-A2' })));
  }
  if (levelFilter === 'all' || levelFilter === 'b1') {
    allPrompts = allPrompts.concat(BOOTCAMP_DATA.speakingPrompts.B1.map(p => ({ ...p, level: 'B1' })));
  }
  if (levelFilter === 'all' || levelFilter === 'b2') {
    allPrompts = allPrompts.concat(BOOTCAMP_DATA.speakingPrompts.B2.map(p => ({ ...p, level: 'B2' })));
  }
  if (levelFilter === 'all' || levelFilter === 'c1') {
    allPrompts = allPrompts.concat(BOOTCAMP_DATA.speakingPrompts.C1.map(p => ({ ...p, level: 'C1' })));
  }

  allPrompts.forEach(p => {
    const card = document.createElement('div');
    card.className = 'glass-card';
    card.classList.add('py-[14px]', 'px-[18px]', 'cursor-pointer');

    card.innerHTML = `
      <div class="flex justify-between mb-[6px]" >
        <span class="cefr-tag ${p.level.toLowerCase().replace('-', '_')}">${p.level}</span>
        <span class="font-code text-[12px] text-accent-amber" >⏱️ ${p.targetTime}</span>
      </div>
      <p class="text-[14px] text-[#fff] font-semibold" >${p.id}. ${p.text}</p>
    `;

    card.addEventListener('click', () => {
      const activePromptDisplay = document.getElementById('active-speaking-prompt-text');
      if (activePromptDisplay) {
        activePromptDisplay.textContent = `${p.level} Prompt: ${p.text} (Mục tiêu: ${p.targetTime})`;
        showToast(`Đã chọn đề: "${p.text.substring(0, 40)}..."`);
      }
    });

    container.appendChild(card);
  });
}

// ==========================================================================
// 8. Writing Studio (Distraction-Free & Rewrite Canvas)
// ==========================================================================
function initWritingStudio() {
  const draft1Textarea = document.getElementById('writing-draft-1');
  const draft2Textarea = document.getElementById('writing-draft-2');
  const wordCountDisplay = document.getElementById('writing-word-count');
  const targetBadge = document.getElementById('writing-target-badge');

  let currentDraftTab = 'draft1';

  // Load saved drafts for current day
  const savedDrafts = appState.writingDrafts[appState.currentDay] || { draft1: '', draft2: '' };
  if (draft1Textarea) draft1Textarea.value = savedDrafts.draft1 || '';
  if (draft2Textarea) draft2Textarea.value = savedDrafts.draft2 || '';

  function updateWordCount() {
    const activeText = currentDraftTab === 'draft1' ? (draft1Textarea ? draft1Textarea.value : '') : (draft2Textarea ? draft2Textarea.value : '');
    const words = activeText.trim().split(/\s+/).filter(w => w.length > 0).length;
    if (wordCountDisplay) {
      wordCountDisplay.textContent = `${words} words`;
    }
  }

  if (draft1Textarea) {
    draft1Textarea.addEventListener('input', () => {
      if (!appState.writingDrafts[appState.currentDay]) appState.writingDrafts[appState.currentDay] = {};
      appState.writingDrafts[appState.currentDay].draft1 = draft1Textarea.value;
      saveState();
      updateWordCount();
    });
  }

  if (draft2Textarea) {
    draft2Textarea.addEventListener('input', () => {
      if (!appState.writingDrafts[appState.currentDay]) appState.writingDrafts[appState.currentDay] = {};
      appState.writingDrafts[appState.currentDay].draft2 = draft2Textarea.value;
      saveState();
      updateWordCount();
    });
  }

  // Draft Tabs switcher
  const draftTabs = document.querySelectorAll('.editor-tab-btn');
  draftTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      draftTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDraftTab = btn.getAttribute('data-draft');

      if (currentDraftTab === 'draft1') {
        if (draft1Textarea) draft1Textarea.style.display = 'block';
        if (draft2Textarea) draft2Textarea.style.display = 'none';
      } else {
        if (draft1Textarea) draft1Textarea.style.display = 'none';
        if (draft2Textarea) draft2Textarea.style.display = 'block';
      }
      updateWordCount();
    });
  });

  // Generate Prompt for AI Examiner button
  const aiExaminerBtn = document.getElementById('btn-send-to-ai-examiner');
  if (aiExaminerBtn) {
    aiExaminerBtn.addEventListener('click', () => {
      const activeText = currentDraftTab === 'draft1' ? (draft1Textarea ? draft1Textarea.value : '') : (draft2Textarea ? draft2Textarea.value : '');
      if (!activeText || activeText.trim().length === 0) {
        showToast('Vui lòng viết bài trước khi gửi cho AI Examiner!');
        return;
      }

      const currentDayData = BOOTCAMP_DATA.roadmap.find(r => r.day === appState.currentDay) || BOOTCAMP_DATA.roadmap[0];
      const examinerPrompt = BOOTCAMP_DATA.aiPrompts[3].template
        .replace('[TASK_DESCRIPTION]', `Day ${currentDayData.day} Writing Task: ${currentDayData.writing}`)
        .replace('[PASTE_YOUR_ESSAY_HERE]', activeText);

      navigator.clipboard.writeText(examinerPrompt).then(() => {
        showToast('📋 Đã copy đề bài & bài viết theo chuẩn Cambridge Examiner Prompt! Hãy dán vào ChatGPT.');
        window.open('https://chatgpt.com', '_blank');
      }).catch(err => {
        console.error('Clipboard copy error:', err);
      });
    });
  }

  // Render Writing Prompts Bank
  renderWritingPrompts('all');
  const writingFilters = document.querySelectorAll('.writing-filter-btn');
  writingFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      writingFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderWritingPrompts(btn.getAttribute('data-level'));
    });
  });

  updateWordCount();
}

function renderWritingPrompts(levelFilter) {
  const container = document.getElementById('writing-prompts-container');
  if (!container) return;

  container.innerHTML = '';
  let allPrompts = [];

  if (levelFilter === 'all' || levelFilter === 'a1_a2') {
    allPrompts = allPrompts.concat(BOOTCAMP_DATA.writingPrompts.A1_A2.map(p => ({ ...p, level: 'A1-A2' })));
  }
  if (levelFilter === 'all' || levelFilter === 'b1') {
    allPrompts = allPrompts.concat(BOOTCAMP_DATA.writingPrompts.B1.map(p => ({ ...p, level: 'B1' })));
  }
  if (levelFilter === 'all' || levelFilter === 'b2') {
    allPrompts = allPrompts.concat(BOOTCAMP_DATA.writingPrompts.B2.map(p => ({ ...p, level: 'B2' })));
  }
  if (levelFilter === 'all' || levelFilter === 'c1') {
    allPrompts = allPrompts.concat(BOOTCAMP_DATA.writingPrompts.C1.map(p => ({ ...p, level: 'C1' })));
  }

  allPrompts.forEach(p => {
    const card = document.createElement('div');
    card.className = 'glass-card';
    card.classList.add('py-[14px]', 'px-[18px]', 'cursor-pointer');

    card.innerHTML = `
      <div class="flex justify-between mb-[6px]" >
        <span class="cefr-tag ${p.level.toLowerCase().replace('-', '_')}">${p.level}</span>
        <span class="font-code text-[12px] text-brand-light" >📝 ${p.words}</span>
      </div>
      <p class="text-[13.5px] text-[#fff] font-semibold" >${p.id}. ${p.text}</p>
    `;

    card.addEventListener('click', () => {
      const activePromptDisplay = document.getElementById('active-writing-prompt-text');
      if (activePromptDisplay) {
        activePromptDisplay.textContent = `[${p.level}] ${p.text} (${p.words})`;
        showToast(`Đã chọn đề viết số ${p.id}`);
      }
    });

    container.appendChild(card);
  });
}

// ==========================================================================
// 9. Vocabulary & Spaced Repetition (SRS Flashcards)
// ==========================================================================
function initFlashcardsSRS() {
  srsState.cards = appState.flashcards || [];
  srsState.currentIndex = 0;
  srsState.isFlipped = false;

  const cardScene = document.getElementById('flashcard-scene');
  const inner = document.getElementById('flashcard-inner');

  if (cardScene && inner) {
    cardScene.addEventListener('click', () => {
      srsState.isFlipped = !srsState.isFlipped;
      if (srsState.isFlipped) {
        inner.classList.add('flipped');
      } else {
        inner.classList.remove('flipped');
      }
    });
  }

  const againBtn = document.getElementById('srs-again-btn');
  const goodBtn = document.getElementById('srs-good-btn');
  const easyBtn = document.getElementById('srs-easy-btn');

  if (againBtn) againBtn.addEventListener('click', () => handleSRSReview(1));
  if (goodBtn) goodBtn.addEventListener('click', () => handleSRSReview(2));
  if (easyBtn) easyBtn.addEventListener('click', () => handleSRSReview(3));

  renderCurrentFlashcard();
}

function renderCurrentFlashcard() {
  const card = srsState.cards[srsState.currentIndex];
  const inner = document.getElementById('flashcard-inner');
  const counterEl = document.getElementById('srs-card-counter');

  if (inner) {
    inner.classList.remove('flipped');
    srsState.isFlipped = false;
  }

  if (counterEl) {
    counterEl.textContent = `${srsState.currentIndex + 1} / ${srsState.cards.length}`;
  }

  if (!card) return;

  const clozeEl = document.getElementById('srs-front-cloze');
  const chunkEl = document.getElementById('srs-back-chunk');
  const viEl = document.getElementById('srs-back-vi');
  const exEl = document.getElementById('srs-back-ex');

  // Create cloze test by masking the chunk in the example
  let clozeText = card.example;
  const regex = new RegExp(card.chunk, 'gi');
  if (clozeText && regex.test(clozeText)) {
    clozeText = clozeText.replace(regex, '_______');
  } else {
    clozeText = `How do you say in English: "${card.meaning}"?`;
  }

  if (clozeEl) clozeEl.innerHTML = `"${clozeText}"`;
  if (chunkEl) chunkEl.textContent = card.chunk;
  if (viEl) viEl.textContent = card.meaning;
  if (exEl) exEl.textContent = card.example;
}

function handleSRSReview(quality) {
  const card = srsState.cards[srsState.currentIndex];
  if (card) {
    card.box = quality;
    card.nextReview = Date.now() + (quality === 1 ? 1 : quality === 2 ? 3 : 7) * 86400000;
    saveState();
  }

  srsState.currentIndex = (srsState.currentIndex + 1) % srsState.cards.length;
  renderCurrentFlashcard();
}

// ==========================================================================
// 10. Grammar & Use of English Matrix
// ==========================================================================
function initGrammarMatrix() {
  renderGrammarTable('all');

  const filterButtons = document.querySelectorAll('.grammar-filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGrammarTable(btn.getAttribute('data-level'));
    });
  });
}

export function renderGrammarTable(levelFilter = 'all') {
  const container = document.getElementById('grammar-table-body');
  if (!container) return;

  container.innerHTML = '';
  let items = [];

  if (levelFilter === 'all' || levelFilter === 'a1_a2') {
    items = items.concat(BOOTCAMP_DATA.grammarSyllabus.A1_A2.map(g => ({ name: g, level: 'A1-A2' })));
  }
  if (levelFilter === 'all' || levelFilter === 'b1') {
    items = items.concat(BOOTCAMP_DATA.grammarSyllabus.B1.map(g => ({ name: g, level: 'B1' })));
  }
  if (levelFilter === 'all' || levelFilter === 'b2') {
    items = items.concat(BOOTCAMP_DATA.grammarSyllabus.B2.map(g => ({ name: g, level: 'B2' })));
  }
  if (levelFilter === 'all' || levelFilter === 'c1') {
    items = items.concat(BOOTCAMP_DATA.grammarSyllabus.C1.map(g => ({ name: g, level: 'C1' })));
  }

  items.forEach(item => {
    const mastery = appState.grammarMastery[item.name] || { understand: false, written: false, spoken: false };
    const tr = document.createElement('tr');
    tr.setAttribute('data-grammar-name', item.name);

    tr.innerHTML = `
      <td><span class="cefr-tag ${item.level.toLowerCase().replace('-', '_')}">${item.level}</span></td>
      <td class="font-semibold text-[#fff]">${item.name}</td>
      <td>
        <button class="btn-open-grammar-lesson px-2.5 py-1 rounded bg-indigo-600/80 hover:bg-indigo-600 text-xs font-semibold text-white shadow transition flex items-center gap-1.5" title="Mở nội dung bài học lý thuyết và bài tập trắc nghiệm">
          <span>📖</span>
          <span>Học & Bài Tập</span>
        </button>
      </td>
      <td>
        <div class="mastery-checkbox-group">
          <label class="mastery-pill-check ${mastery.understand ? 'checked' : ''}">
            <input type="checkbox" ${mastery.understand ? 'checked' : ''} data-type="understand" />
            <span>1. Hiểu</span>
          </label>
          <label class="mastery-pill-check ${mastery.written ? 'checked' : ''}">
            <input type="checkbox" ${mastery.written ? 'checked' : ''} data-type="written" />
            <span>2. Viết đúng</span>
          </label>
          <label class="mastery-pill-check ${mastery.spoken ? 'checked' : ''}">
            <input type="checkbox" ${mastery.spoken ? 'checked' : ''} data-type="spoken" />
            <span>3. Nói phản xạ</span>
          </label>
        </div>
      </td>
    `;

    const openLessonBtn = tr.querySelector('.btn-open-grammar-lesson');
    if (openLessonBtn) {
      openLessonBtn.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('open-grammar-lesson', {
          detail: { name: item.name, level: item.level }
        }));
      });
    }

    tr.querySelectorAll('input[type=checkbox]').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const type = e.target.getAttribute('data-type');
        if (!appState.grammarMastery[item.name]) {
          appState.grammarMastery[item.name] = { understand: false, written: false, spoken: false };
        }
        appState.grammarMastery[item.name][type] = e.target.checked;
        saveState();
        tr.querySelector(`input[data-type=${type}]`).parentElement.classList.toggle('checked', e.target.checked);
        showToast(`Đã cập nhật tiến độ ngữ pháp: ${item.name}`);
      });
    });

    container.appendChild(tr);
  });
}

// ==========================================================================
// 11. AI Tutor Prompts Hub
// ==========================================================================
function initAIPrompts() {
  const container = document.getElementById('ai-prompts-container');
  if (!container) return;

  container.innerHTML = '';
  BOOTCAMP_DATA.aiPrompts.forEach(p => {
    const card = document.createElement('div');
    card.className = 'prompt-card';

    card.innerHTML = `
      <div class="prompt-card-header">
        <span class="prompt-title">${p.title}</span>
      </div>
      <p class="prompt-desc">${p.description}</p>
      <div class="prompt-code-box">${p.template}</div>
      <div class="flex gap-[8px] mt-[auto]" >
        <button class="btn-primary copy-prompt-btn [flex:1]" >
          📋 Copy Prompt
        </button>
        <a href="https://chatgpt.com" target="_blank" class="btn-secondary py-[10px] px-[14px]" >
          Mở ChatGPT
        </a>
      </div>
    `;

    card.querySelector('.copy-prompt-btn').addEventListener('click', () => {
      navigator.clipboard.writeText(p.template).then(() => {
        showToast(`📋 Đã sao chép: "${p.title}"! Hãy dán vào ChatGPT.`);
      });
    });

    container.appendChild(card);
  });
}

// ==========================================================================
// 12. The Golden Error Log & Data Backup
// ==========================================================================
function initErrorLogAndBackup() {
  renderErrorLogTable();

  const addErrorBtn = document.getElementById('btn-add-error-log');
  if (addErrorBtn) {
    addErrorBtn.addEventListener('click', () => {
      const pattern = document.getElementById('err-input-pattern').value.trim();
      const mistake = document.getElementById('err-input-mistake').value.trim();
      const correction = document.getElementById('err-input-correction').value.trim();
      const rule = document.getElementById('err-input-rule').value.trim();

      if (!pattern || !mistake || !correction) {
        showToast('Vui lòng nhập đầy đủ các trường: Mẫu lỗi, Câu sai và Bản sửa đúng!');
        return;
      }

      appState.errorLog.unshift({
        id: Date.now(),
        date: dayjs().format('DD/MM/YYYY'),
        pattern,
        mistake,
        correction,
        rule
      });

      saveState();
      renderErrorLogTable();

      document.getElementById('err-input-pattern').value = '';
      document.getElementById('err-input-mistake').value = '';
      document.getElementById('err-input-correction').value = '';
      document.getElementById('err-input-rule').value = '';

      showToast('✅ Đã thêm lỗi mới vào Golden Error Log!');
    });
  }

  // Export JSON Backup
  const exportBtn = document.getElementById('btn-export-backup');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(appState, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `c1_bootcamp_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('📥 Đã tải về file sao lưu dữ liệu JSON thành công!');
    });
  }

  // Import JSON Backup
  const importInput = document.getElementById('input-import-backup');
  if (importInput) {
    importInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (imported && typeof imported === 'object') {
            appState = { ...appState, ...imported };
            saveState();
            location.reload();
          }
        } catch (err) {
          alert('File JSON không hợp lệ hoặc bị lỗi định dạng!');
        }
      };
      reader.readAsText(file);
    });
  }
}

function renderErrorLogTable() {
  const container = document.getElementById('error-log-table-body');
  if (!container) return;

  container.innerHTML = '';
  if (appState.errorLog.length === 0) {
    container.innerHTML = `
      <tr>
        <td class="text-center text-dim p-[24px]" colspan="5" >
          Chưa có lỗi nào được ghi nhận. Hãy thêm mọi lỗi lặp lại từ 3 lần trở lên vào sổ tay lỗi!
        </td>
      </tr>
    `;
    return;
  }

  appState.errorLog.forEach((err, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="font-code text-[12px] text-dim" >${err.date}</td>
      <td class="font-bold text-accent-amber" >${err.pattern}</td>
      <td class="text-[#f43f5e] line-through" >${err.mistake}</td>
      <td class="text-accent-green font-semibold" >${err.correction}</td>
      <td class="text-[13px] text-muted" >${err.rule}</td>
    `;
    container.appendChild(tr);
  });
}

// ==========================================================================
// 13. Audio Synthesis (Web Audio Chime Gong) & Speech API
// ==========================================================================
function playChimeSound() {
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
// 15. LAN & Mobile Sharing Modal Handler
// ==========================================================================
function initLanShareModal() {
  const btnOpen = document.getElementById('btn-lan-share');
  const modal = document.getElementById('lan-share-modal');
  const btnClose = document.getElementById('close-lan-modal');
  const urlInput = document.getElementById('lan-url-input');
  const btnCopy = document.getElementById('btn-copy-lan-url');
  const qrImage = document.getElementById('lan-qr-image');

  if (!btnOpen || !modal) return;

  const getLanUrl = () => {
    const hostname = window.location.hostname;
    const port = window.location.port || '8080';
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `${window.location.protocol}//${hostname}${port ? ':' + port : ''}/`;
    }
    return `http://192.168.101.169:${port}/`;
  };

  const updateQrAndInput = () => {
    const lanUrl = getLanUrl();
    if (urlInput) urlInput.value = lanUrl;
    if (qrImage) {
      qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(lanUrl)}&margin=6`;
    }
  };

  btnOpen.addEventListener('click', () => {
    updateQrAndInput();
    modal.style.display = 'flex';
  });

  if (btnClose) {
    btnClose.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      modal.style.display = 'none';
    }
  });

  if (btnCopy && urlInput) {
    btnCopy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(urlInput.value);
        showToast('📋 Đã sao chép liên kết mạng LAN!');
      } catch (err) {
        urlInput.select();
        document.execCommand('copy');
        showToast('📋 Đã sao chép liên kết mạng LAN!');
      }
    });
  }
}

// English teaching chart: 12 monophthongs, 8 diphthongs, 24 consonants.
const IPA_GROUPS = ['Nguyên âm đơn (12)', 'Nguyên âm đôi (8)', 'Phụ âm (24)'];
const IPA_LESSONS = [
['iː','see, green, sheep','Lưỡi cao, hướng ra trước; môi hơi dàn. Giữ âm ổn định.','ship / sheep','We see three green trees.'],
['ɪ','sit, fish, ship','Lưỡi gần phía trước nhưng thấp và thả lỏng hơn /iː/.','sit / seat','The little fish is swimming.'],
['e','bed, pen, ten','Miệng mở vừa, lưỡi ở phía trước, môi thả lỏng.','bed / bad','Ten red pens are on the desk.'],
['æ','cat, map, bad','Hạ hàm, mở miệng rộng; lưỡi thấp phía trước.','bad / bed','The black cat sat on a mat.'],
['ɑː','car, father, start','Mở miệng, lưỡi thấp và lùi; môi không tròn. Theo giọng Anh–Anh, không thêm /r/ cuối car.','cart / cut','Park the car near the farm.'],
['ɒ','hot, clock, stop','Lưỡi thấp phía sau, môi hơi tròn, âm ngắn.','cot / caught','The hot pot is on the hob.'],
['ɔː','door, four, law','Lưỡi phía sau, môi tròn; giữ âm ổn định.','caught / cot','Paul saw four small doors.'],
['ʊ','book, good, foot','Lưỡi gần cao phía sau; môi tròn nhẹ, cơ miệng thả lỏng.','full / fool','Put the good book here.'],
['uː','food, blue, moon','Lưỡi cao, môi tròn; giữ âm dài, không thêm âm /w/ riêng.','fool / full','The blue moon looks beautiful.'],
['ʌ','cup, bus, luck','Mở miệng vừa, môi không tròn; lưỡi thấp gần trung tâm.','cut / cart','The bus comes at one.'],
['ɜː','bird, nurse, work','Lưỡi ở giữa, môi thư giãn; giữ âm ổn định, không thêm /r/ theo giọng Anh–Anh.','bird / bed','The nurse works early.'],
['ə','about, banana, teacher','Thả lỏng hàm và lưỡi ở giữa miệng. Đọc nhẹ trong âm tiết không nhấn.','a /ɑː/ (đối chiếu chất lượng âm)','A teacher has a banana.'],
['eɪ','day, name, late','Bắt đầu gần /e/, trượt lên /ɪ/; phần đầu rõ hơn phần cuối.','late / let','They came late today.'],
['aɪ','my, time, five','Bắt đầu với miệng mở, trượt lên /ɪ/ trong một âm tiết.','my / may','I ride my bike at five.'],
['ɔɪ','boy, choice, coin','Bắt đầu môi tròn gần /ɔ/, trượt về /ɪ/, dần dàn môi.','toy / tie','The boy found a coin.'],
['əʊ','go, home, boat','Bắt đầu ở giữa miệng /ə/, trượt về /ʊ/ và tròn môi.','coat / caught','Go home by boat.'],
['aʊ','now, mouth, house','Bắt đầu miệng mở rồi trượt về /ʊ/, môi tròn dần.','now / no','Our house is outside town.'],
['ɪə','near, ear, here','Trượt từ /ɪ/ về /ə/ nhẹ trong một âm tiết. Một số giọng Anh hiện đại dùng nguyên âm dài thay thế.','here / hair','Come here and sit near me.'],
['eə','hair, chair, care','Trượt từ vùng /e/ về /ə/. Nhiều giọng Anh hiện đại đọc gần /ɛː/.','hair / here','Take care of the chair.'],
['ʊə','cure, pure, tourist','Trượt từ /ʊ/ về /ə/. Âm này thay đổi theo giọng; nhiều từ được đọc với /ɔː/.','tour / tore (có thể trùng âm tùy giọng)','The tourist looked for a cure.'],
['p','pen, happy, cap','Khép hai môi rồi bật hơi; không rung cổ. Đầu âm tiết nhấn có luồng hơi rõ.','pat / bat','Please put the pen in your pocket.'],
['b','book, baby, cab','Khép hai môi rồi mở ra, có rung thanh quản; không thêm nguyên âm sau phụ âm cuối.','bat / pat','Bob bought a blue bag.'],
['t','tea, water, cat','Đầu lưỡi chạm lợi trên rồi bật ra; không rung cổ.','ten / den','Take two tickets today.'],
['d','day, ready, bed','Đầu lưỡi chạm lợi trên rồi mở ra; có rung thanh quản.','den / ten','Dad opened the red door.'],
['k','key, school, back','Nâng phần sau lưỡi chạm ngạc mềm rồi bật hơi; không rung cổ.','coat / goat','Keep the black cup clean.'],
['ɡ','go, bigger, bag','Phần sau lưỡi chạm ngạc mềm rồi nhả ra; có rung thanh quản.','goat / coat','Give the girl a green bag.'],
['f','food, coffee, leaf','Răng trên chạm nhẹ môi dưới, đẩy hơi liên tục; không rung cổ.','fan / van','Four friends found fresh food.'],
['v','very, seven, leave','Răng trên chạm nhẹ môi dưới, hơi đi qua khe; có rung thanh quản.','van / fan','We visited seven villages.'],
['θ','think, bath, teeth','Đầu lưỡi hơi nhô giữa hai hàm răng; thổi hơi, không rung cổ.','thin / tin','I think three things are missing.'],
['ð','this, mother, breathe','Đầu lưỡi nhẹ giữa hai hàm răng, đẩy hơi và rung thanh quản.','then / den','This is their mother.'],
['s','see, sister, bus','Đầu lưỡi gần lợi trên, tạo khe hơi hẹp; không rung cổ.','sip / zip','Six students sit outside.'],
['z','zoo, easy, nose','Giữ khẩu hình /s/ nhưng rung thanh quản.','zip / sip','Zoe visits the zoo.'],
['ʃ','she, washing, fish','Lưỡi gần vùng sau lợi, môi hơi đưa ra; thổi hơi không rung cổ.','she / see','She washed the short shirt.'],
['ʒ','vision, measure, beige','Giữ khẩu hình /ʃ/ và rung thanh quản.','/ʃ/ → /ʒ/ (đối chiếu âm)','Measure the usual amount.'],
['h','hat, ahead, who','Mở đường hơi, thở nhẹ qua miệng; không siết cổ.','heat / eat','He has a happy home.'],
['tʃ','chair, teacher, watch','Chặn hơi như /t/ rồi nhả thành /ʃ/ liền một âm; không rung cổ.','cheap / jeep','Choose a chair for the child.'],
['dʒ','job, bridge, giant','Chặn hơi rồi nhả như /ʒ/ liền một âm, có rung thanh quản.','jeep / cheap','Jane enjoys her new job.'],
['m','man, summer, room','Khép môi; rung thanh quản, đưa hơi qua mũi.','sum / sun','My mother made some jam.'],
['n','no, dinner, sun','Đầu lưỡi chạm lợi trên; hơi qua mũi, có rung thanh quản.','sin / sing','Nine men need dinner.'],
['ŋ','sing, singer, long','Nâng phần sau lưỡi tới ngạc mềm, hơi qua mũi. Không tự thêm /ɡ/ vào cuối sing.','sing / sin','The singer sang a long song.'],
['l','light, yellow, feel','Đầu lưỡi chạm lợi trên, hơi thoát hai bên; cuối từ phần sau lưỡi thường nâng lên.','light / right','Lily likes the little lamp.'],
['r','red, very, right','Ký hiệu từ điển /r/ thường chỉ âm [ɹ]: lưỡi không chạm vòm miệng, không rung đầu lưỡi.','right / light','Read the report in the red room.'],
['j','yes, young, use','Lưỡi nâng gần ngạc cứng rồi trượt nhanh sang nguyên âm; không đọc thành /dʒ/.','year / ear','Yes, you can use it.'],
['w','we, away, wet','Tròn môi, nâng phần sau lưỡi rồi chuyển nhanh sang nguyên âm; không chạm răng vào môi.','wet / vet','We will walk on Wednesday.']
].map((row, index) => ({id: `ipa-${index + 1}`, symbol: row[0], words: row[1], mouth: row[2], contrast: row[3], sentence: row[4], group: index < 12 ? 0 : index < 20 ? 1 : 2}));

function generateExtraSentence(symbol, words, index) {
  const wArr = words.split(',').map(s => s.trim());
  const w1 = wArr[0] || 'word';
  const w2 = wArr[1] || wArr[0] || 'sound';
  if (index === 1) {
    return `Please pay attention to the ${w1} and ${w2} in daily communication.`;
  }
  return `The lecturer clearly pronounced ${w1} and ${w2} during the seminar.`;
}

function initPronunciation() {
  const host = document.getElementById('ipa-course');
  const dialog = document.getElementById('ipa-lesson');
  if (!host || !dialog) return;
  if (!appState.pronunciationCompleted || typeof appState.pronunciationCompleted !== 'object' || Array.isArray(appState.pronunciationCompleted)) appState.pronunciationCompleted = {};
  let activeLesson;
  let opener;
  const done = lesson => appState.pronunciationCompleted[lesson.id] === true;
  function render() {
    const count = IPA_LESSONS.filter(done).length;
    host.innerHTML = `<div class="ipa-progress"><strong>Đã học ${count}/44 âm</strong><progress max="44" value="${count}" aria-label="Tiến độ học IPA"></progress></div>` + IPA_GROUPS.map((group, index) => `<h3>${group}</h3><div class="ipa-grid">${IPA_LESSONS.filter(l => l.group === index).map(l => `<button type="button" class="ipa-tile ${done(l) ? 'is-complete' : ''}" data-lesson="${l.id}" aria-label="Học âm /${l.symbol}/, ${done(l) ? 'đã học' : 'chưa học'}"><div style="display:flex; justify-content:space-between; align-items:center; width:100%;"><strong>/${l.symbol}/</strong><span class="ipa-quick-check" data-toggle-done="${l.id}" title="${done(l) ? 'Bỏ đánh dấu đã học' : 'Đánh dấu đã học'}">${done(l) ? '✅' : '⭕'}</span></div><span>${l.words.split(',')[0]}</span><small>${done(l) ? '✓ Đã học' : 'Mở bài học →'}</small></button>`).join('')}</div>`).join('');
  }
  host.addEventListener('click', event => {
    const checkBtn = event.target.closest('[data-toggle-done]');
    if (checkBtn) {
      event.stopPropagation();
      event.preventDefault();
      const lessonId = checkBtn.dataset.toggleDone;
      appState.pronunciationCompleted[lessonId] = !appState.pronunciationCompleted[lessonId];
      saveState();
      render();
      const targetL = IPA_LESSONS.find(item => item.id === lessonId);
      showToast(appState.pronunciationCompleted[lessonId] ? `✓ Đã học âm /${targetL?.symbol}/!` : `○ Bỏ đánh dấu âm /${targetL?.symbol}/.`);
      return;
    }
    const button = event.target.closest('[data-lesson]');
    if (!button) return;
    opener = button.dataset.lesson;
    activeLesson = IPA_LESSONS.find(l => l.id === opener);
    const l = activeLesson;
    dialog.querySelector('.ipa-lesson-body').innerHTML = `<h2 id="ipa-lesson-title">Luyện âm /${l.symbol}/</h2><p>${IPA_GROUPS[l.group]} · 5–10 phút</p><h3>1. Khẩu hình & cách tạo âm</h3><p>${l.mouth}</p><h3>2. Luyện từ và phân biệt âm</h3><p class="ipa-examples">${l.words}</p><div style="display:flex; gap:8px; flex-wrap:wrap; margin:8px 0 14px;"><button type="button" class="btn-secondary" data-audio="words">🔊 Nghe từ mẫu</button><button type="button" class="btn-secondary" data-audio="words-slow">🐢 Nghe chậm (0.7x)</button><button type="button" class="btn-secondary" data-audio="words-discrete">🎯 Nghe từng âm</button></div><p>Đọc xen kẽ: <strong>${l.contrast}</strong>. Lặp lại 5 lượt và chú ý sự khác biệt về vị trí lưỡi, môi, luồng hơi hoặc độ rung.</p><h3>3. Đưa âm vào câu</h3><p class="ipa-examples">${l.sentence}</p><div style="display:flex; gap:8px; flex-wrap:wrap; margin:8px 0 14px;"><button type="button" class="btn-secondary" data-audio="sentence">🔊 Nghe câu mẫu</button><button type="button" class="btn-secondary" data-audio="sentence-slow">🐢 Nghe chậm (0.7x)</button></div><div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px; margin-bottom:14px;"><strong style="color:#818cf8; font-size:12px; display:block; margin-bottom:8px;">🎯 Các câu nghe mẫu thực tế bổ sung:</strong><div style="display:flex; flex-direction:column; gap:8px; font-size:13px;"><div style="display:flex; justify-content:space-between; align-items:center; gap:8px;"><span>1. ${generateExtraSentence(l.symbol, l.words, 1)}</span><button type="button" class="btn-secondary" style="padding:2px 8px; font-size:11px;" data-audio="extra-1">🔊 Nghe</button></div><div style="display:flex; justify-content:space-between; align-items:center; gap:8px;"><span>2. ${generateExtraSentence(l.symbol, l.words, 2)}</span><button type="button" class="btn-secondary" style="padding:2px 8px; font-size:11px;" data-audio="extra-2">🔊 Nghe</button></div></div></div><h3>4. Tự kiểm tra</h3><ol><li>Không nhìn hướng dẫn: nói lại cách đặt lưỡi và môi.</li><li>Đọc từng từ mẫu 5 lần; chú ý giữ đúng chất lượng âm.</li><li>Tự đặt 2 câu có từ chứa /${l.symbol}/ và đọc thành tiếng.</li><li>Ghi âm bằng điện thoại hoặc Phòng Luyện Nói, nghe lại và chọn một điểm cần sửa.</li></ol><p class="ipa-note">Nút nghe dùng giọng tổng hợp en-GB của thiết bị để đọc từ/câu, không phát âm ký hiệu IPA riêng. Giọng thực tế tùy trình duyệt; cần mạng hay không tùy giọng đã cài.</p><label class="ipa-completion"><input type="checkbox" id="ipa-complete" ${done(l) ? 'checked' : ''}> Tôi đã học và luyện bài này</label><p id="ipa-save-status" role="status"></p>`;
    dialog.showModal();
  });
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => host.querySelector(`[data-lesson="${opener}"]`)?.focus());
  dialog.addEventListener('click', event => {
    const audio = event.target.closest('[data-audio]');
    if (!audio || !activeLesson) return;
    const mode = audio.dataset.audio;
    if (mode === 'words') {
      speakText(activeLesson.words, 'en-GB', 0.95);
    } else if (mode === 'words-slow') {
      speakText(activeLesson.words, 'en-GB', 0.65);
    } else if (mode === 'words-discrete') {
      const words = activeLesson.words.split(',').map(w => w.trim());
      let delay = 0;
      words.forEach(w => {
        setTimeout(() => speakText(w, 'en-GB', 0.8), delay);
        delay += 1100;
      });
    } else if (mode === 'sentence') {
      speakText(activeLesson.sentence, 'en-GB', 0.95);
    } else if (mode === 'sentence-slow') {
      speakText(activeLesson.sentence, 'en-GB', 0.65);
    } else if (mode === 'extra-1') {
      speakText(generateExtraSentence(activeLesson.symbol, activeLesson.words, 1), 'en-GB', 0.9);
    } else if (mode === 'extra-2') {
      speakText(generateExtraSentence(activeLesson.symbol, activeLesson.words, 2), 'en-GB', 0.9);
    }
  });
  dialog.addEventListener('change', event => {
    if (event.target.id !== 'ipa-complete') return;
    appState.pronunciationCompleted[activeLesson.id] = event.target.checked;
    try {
      saveState();
      dialog.querySelector('#ipa-save-status').textContent = 'Đã lưu tiến độ trên trình duyệt này.';
    } catch {
      dialog.querySelector('#ipa-save-status').textContent = 'Trình duyệt không cho phép lưu. Tiến độ chỉ được giữ trong phiên hiện tại.';
    }
    render();
  });
  render();
}

