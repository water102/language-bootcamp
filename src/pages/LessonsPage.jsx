import { memo, useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { switchCurrentDay, speakText, showToast } from '@/runtime/controller';
import { setDay } from '@/store';
import { CurriculumContentEngine } from '@/core/curriculum/curriculumContentEngine.js';
import { generateDayLessonPrompt } from '@/core/ai/lessonPromptBuilder.js';
import {
  getCustomLessonVersions,
  getActiveLessonVersionId,
  setActiveLessonVersionId,
  deleteCustomLessonVersion,
  deleteCustomLessonLocal
} from '@/core/storage/db.js';
import dayjs from 'dayjs';

export default memo(function LessonsPage() {
  const dispatch = useDispatch();
  const currentDay = useSelector(state => state.study?.currentDay || 1);

  const curWeek = Math.ceil(currentDay / 7);
  const startDay = (curWeek - 1) * 7 + 1;
  const endDay = Math.min(120, curWeek * 7);

  const [versions, setVersions] = useState([]);
  const [activeVersionId, setActiveVersionIdState] = useState('default');
  const [versionVersionCounter, setVersionCounter] = useState(0);

  const [isScriptVisible, setIsScriptVisible] = useState(false);
  const [openedDrills, setOpenedDrills] = useState(() => new Set());
  const [reflectionText, setReflectionText] = useState('');

  // Load versions whenever day or counter changes
  useEffect(() => {
    let isMounted = true;
    const curActiveId = getActiveLessonVersionId(currentDay);
    if (isMounted) setActiveVersionIdState(curActiveId);

    getCustomLessonVersions(currentDay).then(vList => {
      if (isMounted) setVersions(vList || []);
    });

    setReflectionText(localStorage.getItem(`c1_reflection_day_${currentDay}`) || '');
    setIsScriptVisible(false);
    setOpenedDrills(new Set());

    return () => {
      isMounted = false;
    };
  }, [currentDay, versionVersionCounter]);

  // Listen to custom lesson applied
  useEffect(() => {
    const handleLessonApplied = (e) => {
      if (e.detail?.day === currentDay) {
        setVersionCounter(c => c + 1);
      }
    };
    window.addEventListener('custom-lesson-applied', handleLessonApplied);
    return () => window.removeEventListener('custom-lesson-applied', handleLessonApplied);
  }, [currentDay]);

  // Current active lesson object
  const activeLesson = useMemo(() => {
    return CurriculumContentEngine.getDayLesson(currentDay) || {};
  }, [currentDay, activeVersionId, versionVersionCounter]);

  const isCustom = useMemo(() => {
    return CurriculumContentEngine.hasCustomLesson(currentDay);
  }, [currentDay, activeLesson, versionVersionCounter]);

  const handleSelectDay = useCallback((d) => {
    dispatch(setDay(d));
    switchCurrentDay(d);
  }, [dispatch]);

  const handleWeekSelect = useCallback((e) => {
    const targetW = Number(e.target.value);
    const targetFirstDay = (targetW - 1) * 7 + 1;
    handleSelectDay(targetFirstDay);
  }, [handleSelectDay]);

  const handleCopyPrompt = useCallback(async () => {
    try {
      const prompt = generateDayLessonPrompt(currentDay);
      await navigator.clipboard.writeText(prompt);
      showToast(`📋 Đã copy prompt Cambridge C1 cho Day ${currentDay}!`);
    } catch {
      showToast(`Lỗi sao chép: Hãy mở modal Nhập bài học để copy.`);
    }
  }, [currentDay]);

  const handleRestoreDefault = useCallback(async () => {
    try {
      await deleteCustomLessonLocal(currentDay);
      localStorage.removeItem(`c1_custom_lesson_${currentDay}`);
      localStorage.removeItem(`c1_custom_lesson_versions_${currentDay}`);
      setActiveLessonVersionId(currentDay, 'default');
      CurriculumContentEngine.removeCustomLesson(currentDay);
      setActiveVersionIdState('default');
      setVersionCounter(c => c + 1);
      showToast(`↩️ Đã khôi phục bài học gốc chuẩn cho Day ${currentDay}`);
    } catch (err) {
      showToast(`Không thể khôi phục: ${err.message}`);
    }
  }, [currentDay]);

  const handleVersionChange = useCallback(async (e) => {
    const selectedVal = e.target.value;
    setActiveLessonVersionId(currentDay, selectedVal);
    setActiveVersionIdState(selectedVal);

    if (selectedVal === 'default') {
      CurriculumContentEngine.setActiveVersion(currentDay, 'default');
    } else {
      const match = versions.find(v => v.id === selectedVal);
      if (match) {
        CurriculumContentEngine.setCustomLesson(match);
      } else {
        CurriculumContentEngine.setActiveVersion(currentDay, selectedVal);
      }
    }
    setVersionCounter(c => c + 1);
    showToast(selectedVal === 'default' ? 'Đã chuyển về Bài học chuẩn' : 'Đã kích hoạt phiên bản bài học AI');
  }, [currentDay, versions]);

  const handleDeleteCurrentVersion = useCallback(async () => {
    if (activeVersionId === 'default') return;
    if (!confirm(`Bạn có chắc muốn xóa phiên bản AI này của Day ${currentDay}?`)) return;
    await deleteCustomLessonVersion(activeVersionId, currentDay);
    const newActive = getActiveLessonVersionId(currentDay);
    CurriculumContentEngine.setActiveVersion(currentDay, newActive);
    setActiveVersionIdState(newActive);
    setVersionCounter(c => c + 1);
    showToast(`Đã xóa phiên bản AI.`);
  }, [activeVersionId, currentDay]);

  const toggleDrillAnswer = useCallback((idx) => {
    setOpenedDrills(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  const handleSaveReflection = useCallback(() => {
    localStorage.setItem(`c1_reflection_day_${currentDay}`, reflectionText);
    showToast(`💾 Đã lưu nhật ký phản tư Day ${currentDay}!`);
  }, [currentDay, reflectionText]);

  // Media embed computation
  const media = activeLesson.mediaEmbed;
  const hasMedia = media && (media.embedUrl || media.youtubeId || media.streamUrl || media.audioUrl);
  const isVideo = hasMedia && (media.type === 'video' || !!media.embedUrl || !!media.youtubeId);
  const videoSrc = hasMedia ? (media.embedUrl || (media.youtubeId ? `https://www.youtube-nocookie.com/embed/${media.youtubeId}` : '')) : '';
  const audioSrc = hasMedia ? (media.streamUrl || media.audioUrl || '') : '';
  const provider = hasMedia ? (media.provider || media.source || 'Học liệu mở') : '';

  return (
    <section className="page-view" id="view-lessons">
      <div className="view-header">
        <h2>{"Trạm Học Tập Toàn Diện 9 Khối Trong Ngày (Daily Mastery Hub)"}</h2>
        <p>{"Học liệu chuẩn hóa Cambridge C1 bao trọn 9 khung giờ học tập chuyên sâu: Ngữ pháp, Nghe sâu, 20 Chunks, Đọc hiểu, Luyện nói, Luyện viết, Nghe mở rộng, Immersion thực tế và Sổ lỗi SRS."}</p>
      </div>

      <div className="glass-card p-3.5 mb-4 flex flex-wrap items-center justify-between gap-3 bg-[linear-gradient(90deg,rgba(99,102,241,0.12),rgba(6,182,212,0.1))] border border-[rgba(99,102,241,0.25)]">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">📚</span>
          <div>
            <h4 className="text-white text-xs font-bold">Mở Rộng Học Liệu Với Learning Content Pack</h4>
            <p className="text-muted text-[11px]">Hơn 170+ hoạt động Cambridge, câu song ngữ Tatoeba, bài đọc VOA & sách nói LibriVox.</p>
          </div>
        </div>
        <Button
          variant="unstyled"
          className="btn-secondary text-xs px-3 py-1.5"
          onClick={() => {
            document.querySelector('[data-target="content-hub"]')?.click();
          }}
        >
          Khám Phá Kho Mở Rộng ↗
        </Button>
      </div>

      {/* Week & Day Navigation */}
      <div className="lesson-nav-days" id="lesson-days-nav">
        <div className="flex items-center gap-2 mb-3 w-full flex-wrap">
          <span className="text-xs font-bold text-accent-cyan">{`Tuần ${curWeek} (Day ${startDay}–${endDay}):`}</span>
          <select
            id="lesson-week-select"
            className="form-select text-xs py-1 px-2.5 rounded bg-slate-800 text-white border border-slate-700"
            value={curWeek}
            onChange={handleWeekSelect}
          >
            {Array.from({ length: 18 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {`Tuần ${i + 1} (Day ${(i * 7) + 1}–${Math.min(120, (i + 1) * 7)})`}
              </option>
            ))}
          </select>
          <select
            id="lesson-day-jump-select"
            className="form-select text-xs py-1 px-2.5 rounded bg-slate-800 text-white border border-slate-700"
            value={currentDay}
            onChange={(e) => handleSelectDay(Number(e.target.value))}
          >
            {Array.from({ length: 120 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {`Nhảy tới Day ${i + 1}`}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 overflow-x-auto w-full pb-1">
          {Array.from({ length: endDay - startDay + 1 }, (_, idx) => {
            const d = startDay + idx;
            const dLesson = CurriculumContentEngine.getDayLesson(d) || {};
            const dIsCustom = CurriculumContentEngine.hasCustomLesson(d);
            return (
              <button
                key={d}
                className={`lesson-day-btn ${d === currentDay ? 'active' : ''} ${dIsCustom ? 'border-emerald-500/50 text-emerald-300' : ''}`}
                onClick={() => handleSelectDay(d)}
              >
                {`${dIsCustom ? '✨ ' : ''}Day ${d}: ${dLesson.theme || ''}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Header Info Banner */}
      <div className="glass-card mb-[16px]">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display text-[22px] text-[#fff]" id="lesson-theme-title">
                {`Day ${currentDay} — ${activeLesson.theme || ''}`}
              </h3>
              {isCustom && (
                <span id="lesson-source-badge" className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ✨ Bài Học AI (Đã Lưu & Đồng Bộ)
                </span>
              )}
            </div>
            <p className="text-brand-light text-[14px] font-semibold mt-[2px]" id="lesson-grammar-title">
              {activeLesson.grammar ? `Ngữ pháp mục tiêu: ${activeLesson.grammar}` : ''}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="unstyled"
              id="btn-copy-day-prompt"
              className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
              title="Sao chép prompt Cambridge C1 của ngày này để đưa vào ChatGPT / Claude / Gemini"
              onClick={handleCopyPrompt}
            >
              <span>📋</span>
              <span>Copy Prompt AI</span>
            </Button>
            <Button
              variant="unstyled"
              id="btn-open-import-modal"
              className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5 bg-[linear-gradient(135deg,#6366f1,#06b6d4)]"
              title="Dán kết quả JSON từ AI để biến thành bài học chính thức"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-import-lesson-modal', { detail: { day: currentDay } }));
              }}
            >
              <span>🤖</span>
              <span>Nhập Bài Học Từ AI</span>
            </Button>
            {isCustom && (
              <Button
                variant="unstyled"
                id="btn-restore-default-lesson"
                className="btn-secondary text-xs px-2.5 py-2 text-rose-300 hover:text-rose-200 border-rose-500/30"
                title="Quay lại bài học gốc của Bootcamp"
                onClick={handleRestoreDefault}
              >
                <span>↩️</span>
                <span>Khôi phục gốc</span>
              </Button>
            )}
            <Button
              variant="unstyled"
              className="btn-secondary text-xs px-3 py-2"
              onClick={() => {
                switchCurrentDay(currentDay);
                document.querySelector('[data-target=speaking]')?.click();
              }}
            >
              {"🎙️ Thu Âm Nói"}
            </Button>
          </div>
        </div>
      </div>

      {/* Lesson Version Selector Bar */}
      <div className="glass-card p-3 mb-[16px] flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-700/80" id="lesson-version-bar">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
            <span>🏷️</span>
            <span>Phiên bản nội dung:</span>
          </span>
          <select
            id="lesson-version-select"
            className="form-select text-xs py-1.5 px-3 rounded-lg bg-slate-950 text-slate-100 border border-indigo-500/40 focus:border-cyan-400 focus:outline-none min-w-[240px]"
            value={activeVersionId}
            onChange={handleVersionChange}
          >
            <option value="default">📌 Bài học chuẩn (Standard Bootcamp)</option>
            {versions.map(ver => {
              const timeStr = ver.createdAt ? dayjs(ver.createdAt).format('HH:mm DD/MM') : '';
              const byStr = ver.sharedBy ? ` • ${ver.sharedBy}` : '';
              return (
                <option key={ver.id} value={ver.id}>
                  {`✨ ${ver.theme} ${timeStr ? `[${timeStr}]` : ''}${byStr}`}
                </option>
              );
            })}
          </select>
          <span id="lesson-version-count" className="text-[11px] text-slate-400">
            {versions.length > 0 ? `(${versions.length} bản AI + 1 bản chuẩn)` : '(1 bản có sẵn)'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {activeVersionId !== 'default' && (
            <Button
              variant="unstyled"
              id="btn-delete-current-version"
              className="btn-secondary text-xs py-1 px-2.5 text-rose-300 hover:text-rose-200 border-rose-500/30"
              title="Xóa phiên bản AI này"
              onClick={handleDeleteCurrentVersion}
            >
              <span>🗑️ Xóa bản này</span>
            </Button>
          )}
          <Button
            variant="unstyled"
            id="btn-add-version-quick"
            className="btn-secondary text-xs py-1 px-2.5 text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/10"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-import-lesson-modal', { detail: { day: currentDay } }));
            }}
          >
            <span>➕ Nhập thêm bản AI</span>
          </Button>
          <Button
            variant="unstyled"
            id="btn-open-cloud-library"
            className="btn-secondary text-xs py-1 px-2.5 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/10"
            title="Xem tất cả bài học mà mọi thành viên đã nhập vào hệ thống (đồng bộ qua Firebase Cloud)"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-cloud-library-modal'));
            }}
          >
            <span>☁️ Kho bài học dùng chung</span>
          </Button>
        </div>
      </div>

      {/* Media Embed Container */}
      {hasMedia && (
        <div className="glass-card mb-[20px]" id="lesson-media-embed-container">
          {isVideo && videoSrc ? (
            <div className="p-3 bg-slate-900/80 rounded-xl border border-indigo-500/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-rose-400 font-bold text-xs">🎬 Video Học Liệu:</span>
                  <span className="text-white font-semibold text-xs">{media.title}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 uppercase">{provider}</span>
                </div>
                {media.externalUrl && (
                  <a href={media.externalUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-cyan-400 hover:underline">
                    Mở video gốc ↗
                  </a>
                )}
              </div>
              <div className="aspect-video w-full max-w-xl mx-auto rounded-lg overflow-hidden border border-white/10">
                <iframe
                  className="w-full h-full"
                  src={videoSrc}
                  title={media.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          ) : audioSrc ? (
            <div className="p-3 bg-slate-900/80 rounded-xl border border-emerald-500/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold text-xs">🎧 Sách Nói / Audio:</span>
                  <span className="text-white font-semibold text-xs">{media.title}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase">{provider}</span>
                </div>
                {media.externalUrl && (
                  <a href={media.externalUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-cyan-400 hover:underline">
                    Mở sách ↗
                  </a>
                )}
              </div>
              <audio controls className="w-full mt-1" src={audioSrc}></audio>
            </div>
          ) : null}
        </div>
      )}

      {/* 9 ALL-INCLUSIVE DAILY BLOCKS */}
      <div className="flex flex-col gap-[22px]">

        {/* KHỐI 1: GRAMMAR & SENTENCE DRILLS */}
        <div className="glass-card p-5 border-l-4 border-l-indigo-500" id="block-section-grammar">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xl">📐</span>
              <div>
                <h4 className="text-white text-base font-bold">Khối 1: Ngữ Pháp & Thực Hành Đặt Câu (Grammar & Sentence Drills)</h4>
                <p className="text-slate-400 text-xs">Khung giờ chuẩn: 07:00–08:30 • 90 Phút Deep Work • Mục tiêu: Nắm vững cấu trúc & 30–50 câu thực hành</p>
              </div>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold uppercase">Khối 1 / 90m Deep</span>
          </div>
          <div className="mb-4 p-3.5 rounded-lg bg-slate-900/60 border border-indigo-500/20">
            <h5 className="text-indigo-300 font-bold text-xs uppercase mb-1">Lý Thuyết Cốt Lõi & Nguyên Lý Ngữ Pháp:</h5>
            <p className="text-slate-200 text-sm leading-relaxed" id="lesson-grammar-explanation">
              {activeLesson.grammarDetail?.explanation || `Lý thuyết cấu trúc: ${activeLesson.grammar || ''}`}
            </p>
          </div>
          <div className="mb-4">
            <h5 className="text-white font-bold text-xs uppercase mb-2">📌 Quy Tắc Vàng Cần Ghi Nhớ:</h5>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 pl-1" id="lesson-grammar-rules-list">
              {(activeLesson.grammarDetail?.rules || [
                'Áp dụng chính xác hình thái động từ và trật tự từ.',
                'Tránh bẫy nhầm lẫn thì và hòa hợp ngữ pháp.'
              ]).map((rule, rIdx) => (
                <li key={rIdx}>{rule}</li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold text-xs uppercase mb-2">✍️ Thực Hành Đặt Câu (Sentence Drills & Transformations):</h5>
            <div className="space-y-2" id="lesson-grammar-drills-container">
              {(activeLesson.grammarDetail?.sentenceDrills || [
                { drill: `Đặt 1 câu phức áp dụng "${activeLesson.grammar || 'ngữ pháp'}"`, answer: `Example sentence demonstrating ${activeLesson.grammar || 'target grammar'}.` }
              ]).map((d, dIdx) => (
                <div key={dIdx} className="p-2.5 rounded bg-slate-950/60 border border-indigo-500/20 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-medium text-slate-200">
                      <span className="text-indigo-400 font-bold">Câu {dIdx + 1}:</span> {d.drill}
                    </div>
                    <button
                      className="btn-toggle-drill-ans text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 whitespace-nowrap"
                      onClick={() => toggleDrillAnswer(dIdx)}
                    >
                      {openedDrills.has(dIdx) ? '🙈 Ẩn đáp án' : '👁️ Xem đáp án'}
                    </button>
                  </div>
                  {openedDrills.has(dIdx) && (
                    <div className="drill-answer-box mt-2 pt-1.5 border-t border-white/5 text-emerald-300 font-mono text-[11px]">
                      💡 <strong>Đáp án mẫu:</strong> {d.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KHỐI 2: INTENSIVE LISTENING */}
        <div className="glass-card p-5 border-l-4 border-l-cyan-500 listening-panel" id="block-section-listening">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎧</span>
              <div>
                <h4 className="text-white text-base font-bold">Khối 2: Nghe Chuyên Sâu & Dictation (Intensive Listening)</h4>
                <p className="text-slate-400 text-xs">Khung giờ chuẩn: 09:00–10:30 • 90 Phút Deep Work • Mục tiêu: Dictation + Shadowing 5 lần</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="unstyled"
                className="btn-secondary py-1.5 px-3 text-xs"
                id="play-script-tts-btn"
                onClick={() => {
                  if (activeLesson.listening?.script) speakText(activeLesson.listening.script);
                }}
              >
                🔊 Đọc Audio
              </Button>
              <Button
                variant="unstyled"
                className="btn-secondary py-1.5 px-3 text-xs"
                id="toggle-script-btn"
                onClick={() => setIsScriptVisible(v => !v)}
              >
                {isScriptVisible ? '🙈 Ẩn Transcript' : '👁️ Hiện Transcript'}
              </Button>
            </div>
          </div>
          <strong className="text-accent-cyan text-sm block mb-2" id="lesson-listening-title">
            {activeLesson.listening?.title || `Intensive Listening Day ${currentDay}`}
          </strong>
          <div className={`script-box mb-3 ${!isScriptVisible ? 'blur-content' : ''}`} id="lesson-listening-script">
            {activeLesson.listening?.script || ''}
          </div>
          <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/20 mb-3 text-xs text-cyan-200">
            <span className="font-bold">🎯 Trọng tâm Shadowing: </span>
            <span id="lesson-listening-shadowing-focus">
              {activeLesson.listening?.shadowingFocus || 'Luyện nối âm tự nhiên và nhịp điệu trọng âm câu.'}
            </span>
          </div>
          <div>
            <h5 className="text-white text-xs font-bold uppercase mb-2">❓ Câu hỏi kiểm tra nghe hiểu:</h5>
            <div id="lesson-questions-container">
              {(activeLesson.listening?.questions || []).map((q, qIdx) => (
                <div key={qIdx} className="mb-[12px]">
                  <p className="font-semibold text-[#fff] mb-[6px]">{qIdx + 1}. {q}</p>
                  <input type="text" className="form-input w-full text-[13px]" placeholder="Gõ câu trả lời của bạn..." />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KHỐI 3: 20 TARGET CHUNKS */}
        <div className="glass-card p-5 border-l-4 border-l-emerald-500" id="block-section-chunks">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xl">💎</span>
              <div>
                <h4 className="text-white text-base font-bold">Khối 3: 20 Target Chunks / Collocations Chuẩn CEFR</h4>
                <p className="text-slate-400 text-xs">Khung giờ chuẩn: 10:45–12:15 • 90 Phút Deep Work • Mục tiêu: Nạp 20 chunks + nghe TTS + lưu SRS</p>
              </div>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">Khối 3 / 20 Chunks</span>
          </div>
          <div className="chunks-list-card" id="lesson-chunks-container">
            {(activeLesson.chunks || []).map((c, cIdx) => (
              <div key={cIdx} className="chunk-row">
                <div className="chunk-left">
                  <div className="chunk-en">{c.en}</div>
                  <div className="chunk-vi">{c.vi}</div>
                  <div className="chunk-ex">"{c.ex}"</div>
                </div>
                <button
                  className="tts-btn"
                  title="Nghe phát âm"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(c.en);
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* KHỐI 4: ACTIVE READING */}
        <div className="glass-card p-5 border-l-4 border-l-blue-500" id="block-section-reading">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xl">📖</span>
              <div>
                <h4 className="text-white text-base font-bold">Khối 4: Đọc Phân Tích & Trích Xuất (Active Reading)</h4>
                <p className="text-slate-400 text-xs">Khung giờ chuẩn: 13:15–14:45 • 90 Phút Medium Focus • Mục tiêu: Đọc phân tích + Tóm tắt 80–120 từ</p>
              </div>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold uppercase">Khối 4 / Active Reading</span>
          </div>
          <h5 className="text-blue-300 font-bold text-sm mb-2" id="lesson-reading-title">
            {activeLesson.reading?.title || `Active Reading (Day ${currentDay})`}
          </h5>
          <p className="text-sm text-main leading-[1.75] mb-3 p-3 rounded-lg bg-slate-900/50 border border-white/5 whitespace-pre-line" id="lesson-reading-text">
            {activeLesson.reading?.text || ''}
          </p>
          <div className="mb-3" id="lesson-reading-vocab-focus-box">
            <span className="text-xs text-slate-400 font-semibold block mb-1">🔍 Từ vựng học thuật trọng tâm trong bài:</span>
            <div className="flex flex-wrap gap-1.5" id="lesson-reading-vocab-tags">
              {(activeLesson.reading?.vocabularyFocus || []).length > 0 ? (
                activeLesson.reading.vocabularyFocus.map((v, vIdx) => (
                  <span key={vIdx} className="text-[11px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-200 border border-blue-500/30 font-mono">
                    {v}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-slate-400">Trích xuất collocations tự nhiên trong bài</span>
              )}
            </div>
          </div>
          <div className="py-2.5 px-3.5 rounded-lg bg-[rgba(255,255,255,0.03)] border-l-2 border-amber-400">
            <span className="text-xs text-amber-400 font-bold block">📝 Yêu cầu tóm tắt (Summary Prompt):</span>
            <p className="text-xs text-slate-300 mt-1" id="lesson-reading-prompt">
              {activeLesson.reading?.prompt || ''}
            </p>
          </div>
        </div>

        {/* KHỐI 5: SPEAKING STUDIO */}
        <div className="glass-card p-5 border-l-4 border-l-amber-500" id="block-section-speaking">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎙️</span>
              <div>
                <h4 className="text-white text-base font-bold">Khối 5: Luyện Nói & Ngữ Điệu (Speaking Studio)</h4>
                <p className="text-slate-400 text-xs">Khung giờ chuẩn: 15:00–16:30 • 90 Phút Deep Work • Mục tiêu: Thu âm Take 1 & Take 2 theo dàn ý</p>
              </div>
            </div>
            <Button
              variant="unstyled"
              className="btn-primary text-xs px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white"
              onClick={() => {
                switchCurrentDay(currentDay);
                document.querySelector('[data-target=speaking]')?.click();
              }}
            >
              🚀 Mở Phòng Thu Âm Nói
            </Button>
          </div>
          <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-500/20 mb-3">
            <span className="text-xs text-amber-300 font-bold uppercase block mb-1">Đề bài luyện nói:</span>
            <p className="text-white text-sm font-semibold" id="lesson-speaking-task">
              {activeLesson.speakingTask || activeLesson.speaking?.prompt || ''}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
              <h6 className="text-xs text-amber-300 font-bold mb-1.5">📋 Gợi Ý Dàn Ý 3 Phần:</h6>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside" id="lesson-speaking-outline">
                {(activeLesson.speaking?.outline || [
                  'Mở đầu (30s): Nêu luận điểm chính.',
                  'Thân bài (60s): 2 ý phân tích kèm dẫn chứng.',
                  'Kết luận (30s): Tóm tắt và bài học.'
                ]).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
              <h6 className="text-xs text-amber-300 font-bold mb-1.5">🗣️ Hướng Dẫn Phát Âm & Ngữ Điệu:</h6>
              <p className="text-xs text-slate-300 leading-relaxed" id="lesson-speaking-pronunciation">
                {activeLesson.speaking?.pronunciationTips || 'Chú ý nối âm tự nhiên và duy trì độ vang nguyên âm dài.'}
              </p>
            </div>
          </div>
          <div>
            <h6 className="text-xs text-slate-400 font-bold mb-1.5">⚡ Câu Hỏi Phản Xạ Follow-up:</h6>
            <div className="space-y-1 text-xs text-slate-200" id="lesson-speaking-followup">
              {(activeLesson.speaking?.followUpQuestions || ['How does this apply in practice?']).map((q, idx) => (
                <div key={idx} className="p-1.5 rounded bg-slate-900/40 border border-white/5">
                  ❓ <strong>Q{idx + 1}:</strong> {q}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KHỐI 6: WRITING STUDIO */}
        <div className="glass-card p-5 border-l-4 border-l-pink-500" id="block-section-writing">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xl">✍️</span>
              <div>
                <h4 className="text-white text-base font-bold">Khối 6: Luyện Viết Luận C1 (Writing Studio)</h4>
                <p className="text-slate-400 text-xs">Khung giờ chuẩn: 16:45–18:15 • 90 Phút Deep Work • Mục tiêu: Draft 1 → Sửa lỗi → Rewrite Draft 2</p>
              </div>
            </div>
            <Button
              variant="unstyled"
              className="btn-primary text-xs px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white"
              onClick={() => {
                switchCurrentDay(currentDay);
                document.querySelector('[data-target=writing]')?.click();
              }}
            >
              🚀 Mở Writing Studio
            </Button>
          </div>
          <div className="p-3.5 rounded-lg bg-pink-950/20 border border-pink-500/20 mb-3">
            <span className="text-xs text-pink-300 font-bold uppercase block mb-1">Nhiệm vụ viết:</span>
            <p className="text-white text-sm font-semibold" id="lesson-writing-task">
              {activeLesson.writingTask || activeLesson.writing?.prompt || ''}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
              <h6 className="text-xs text-pink-300 font-bold mb-1.5">📐 Dàn Ý Cấu Trúc Đề Xuất:</h6>
              <p className="text-xs text-slate-300 leading-relaxed" id="lesson-writing-outline">
                {activeLesson.writing?.outline || 'Introduction (Thesis) → Body Paragraphs → Conclusion (Synthesis).'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
              <h6 className="text-xs text-pink-300 font-bold mb-1.5">🎯 Cấu Trúc Ngữ Pháp Bắt Buộc Đưa Vào:</h6>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside" id="lesson-writing-targets">
                {(activeLesson.writing?.targetStructures || [`Ứng dụng cấu trúc ${activeLesson.grammar || 'mục tiêu'}`]).map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
            <h6 className="text-xs text-pink-300 font-bold mb-1">💡 Đoạn Văn Mẫu C1 Tham Khảo:</h6>
            <p className="text-xs text-slate-300 italic leading-relaxed" id="lesson-writing-sample">
              {activeLesson.writing?.sampleSnippet || `In contemporary discourse, the subject of ${activeLesson.vocab || 'this topic'} requires rigorous lexical choice and syntactic variety.`}
            </p>
          </div>
        </div>

        {/* KHỐI 7: EXTENSIVE LISTENING & CONVERSATION */}
        <div className="glass-card p-5 border-l-4 border-l-purple-500" id="block-section-extensive">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xl">💬</span>
              <div>
                <h4 className="text-white text-base font-bold">Khối 7: Nghe Mở Rộng & Hội Thoại Thảo Luận (Extensive Listening)</h4>
                <p className="text-slate-400 text-xs">Khung giờ chuẩn: 19:15–20:45 • 90 Phút Medium Focus • Mục tiêu: 60–90m nghe mở rộng + thảo luận</p>
              </div>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold uppercase">Khối 7 / Extensive</span>
          </div>
          <h5 className="text-purple-300 font-bold text-sm mb-1.5" id="lesson-extensive-title">
            {activeLesson.extensiveListening?.title || 'Extensive Listening & Discussion'}
          </h5>
          <p className="text-xs text-slate-300 leading-relaxed mb-3" id="lesson-extensive-desc">
            {activeLesson.extensiveListening?.description || '60–90 phút nghe thụ cảm tự nhiên và thảo luận phản biện không phụ đề.'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-500/20">
              <h6 className="text-xs text-purple-300 font-bold mb-1.5">🗣️ Câu Hỏi Đàm Thoại / Debate:</h6>
              <div className="space-y-1 text-xs text-slate-200" id="lesson-extensive-questions">
                {(activeLesson.extensiveListening?.discussionQuestions || []).map((q, idx) => (
                  <div key={idx} className="p-1 rounded bg-slate-900/40">💬 {q}</div>
                ))}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
              <h6 className="text-xs text-slate-400 font-bold mb-1.5">📻 Kênh & Nguồn Nghe Khuyến Nghị:</h6>
              <p className="text-xs text-cyan-300" id="lesson-extensive-sources">
                {activeLesson.extensiveListening?.recommendedSources || 'BBC 6 Minute English, NPR News, TED Radio Hour'}
              </p>
            </div>
          </div>
        </div>

        {/* KHỐI 8: IMMERSION */}
        <div className="glass-card p-5 border-l-4 border-l-teal-500" id="block-section-immersion">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌐</span>
              <div>
                <h4 className="text-white text-base font-bold">Khối 8: Immersion & Tiếng Anh Thực Chiến (Real-World English)</h4>
                <p className="text-slate-400 text-xs">Khung giờ chuẩn: 21:00–22:30 • 90 Phút Light Work • Mục tiêu: Nạp thành ngữ thực chiến & xem media bản xứ</p>
              </div>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold uppercase">Khối 8 / Immersion</span>
          </div>
          <div className="p-3 rounded-lg bg-teal-950/20 border border-teal-500/20 mb-3">
            <span className="text-xs text-teal-300 font-bold uppercase block mb-1">Bối cảnh ứng dụng thực tế:</span>
            <p className="text-xs text-slate-200" id="lesson-immersion-context">
              {activeLesson.immersion?.context || 'Bối cảnh thực tế công sở và đời sống quốc tế.'}
            </p>
          </div>
          <div className="mb-3">
            <h6 className="text-xs text-white font-bold uppercase mb-2">💎 Thành Ngữ / Khẩu Ngữ Đời Thực Cần Nạp:</h6>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" id="lesson-immersion-expressions">
              {(activeLesson.immersion?.realWorldExpressions || []).map((e, idx) => (
                <div key={idx} className="p-2 rounded bg-slate-900/60 border border-teal-500/20">
                  <div className="font-bold text-teal-300 text-xs flex items-center justify-between">
                    <span>{e.phrase}</span>
                    <button
                      className="tts-inline-btn text-[10px] text-cyan-400 hover:underline"
                      onClick={() => speakText(e.phrase)}
                    >
                      🔊 Nghe
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">{e.meaning}</div>
                  <div className="text-[10px] text-slate-400 italic mt-0.5">📌 {e.situation}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-slate-400">
            <span className="font-semibold text-slate-300">📺 Gợi ý Media: </span>
            <span id="lesson-immersion-media-tip">
              {activeLesson.immersion?.mediaSuggestion || 'Xem phóng sự VOA / BBC / Bloomberg liên quan.'}
            </span>
          </div>
        </div>

        {/* KHỐI 9: SRS & ERROR LOG */}
        <div className="glass-card p-5 border-l-4 border-l-slate-400" id="block-section-srs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xl">🧠</span>
              <div>
                <h4 className="text-white text-base font-bold">Khối 9: SRS Review, Sổ Lỗi Vàng & Nhật Ký Phản Tư (Reflection)</h4>
                <p className="text-slate-400 text-xs">Khung giờ chuẩn: 22:30–23:00 • 30 Phút Light Review • Mục tiêu: Ôn thẻ SRS + Ghi sổ lỗi + Nhật ký 3 dòng</p>
              </div>
            </div>
            <Button
              variant="unstyled"
              className="btn-secondary text-xs px-3 py-1.5"
              onClick={() => {
                document.querySelector('[data-target="flashcards"]')?.click();
              }}
            >
              🃏 Mở Thẻ Flashcards SRS
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/20">
              <h6 className="text-xs text-rose-300 font-bold mb-1.5">⚠️ Bẫy Lỗi Thường Gặp Cần Tránh:</h6>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside" id="lesson-srs-pitfalls">
                {(activeLesson.srsAndErrorLog?.commonPitfalls || ['Lỗi dịch word-by-word']).map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
              <h6 className="text-xs text-slate-300 font-bold mb-1.5">📋 Nhắc Nhở Ôn Tập SRS:</h6>
              <p className="text-xs text-slate-300 leading-relaxed" id="lesson-srs-reminders">
                {activeLesson.srsAndErrorLog?.reviewReminders || 'Ôn tập 20 target chunks mới trên SRS và bổ sung lỗi sai vào sổ lỗi.'}
              </p>
            </div>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-900/80 border border-indigo-500/20">
            <h6 className="text-xs text-indigo-300 font-bold mb-2 flex items-center justify-between">
              <span>✍️ Nhật Ký Phản Tư 3 Dòng Cuối Ngày (3-Line Reflection Journal):</span>
              <span className="text-[10px] text-slate-400">Tự động lưu vào bộ nhớ máy</span>
            </h6>
            <div className="space-y-1 text-xs text-slate-300 mb-2" id="lesson-reflection-questions">
              {(activeLesson.srsAndErrorLog?.reflectionQuestions || []).map((q, idx) => (
                <div key={idx}>{idx + 1}. {q}</div>
              ))}
            </div>
            <textarea
              id="lesson-daily-reflection-input"
              rows="3"
              className="form-input w-full text-xs p-2 rounded bg-slate-950 text-slate-100 border border-slate-700 focus:border-indigo-400"
              placeholder="Gõ 3 dòng phản tư của bạn hôm nay: 1. Cụm từ hay nhất... 2. Lỗi đã sửa... 3. Mục tiêu ngày mai..."
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
            ></textarea>
            <div className="flex justify-end mt-2">
              <Button
                variant="unstyled"
                id="btn-save-daily-reflection"
                className="btn-primary text-xs px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white"
                onClick={handleSaveReflection}
              >
                💾 Lưu Nhật Ký Phản Tư
              </Button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
});


