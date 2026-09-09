import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { generateDayLessonPrompt, validateAndParseLessonJson } from '@/core/ai/lessonPromptBuilder.js';
import { saveCustomLessonToCloud, fetchCustomLessonFromCloud } from '@/core/firebase/lessonCloudSync.js';
import { saveCustomLessonLocal } from '@/core/storage/db.js';
import { appState, showToast } from '@/runtime/controller.js';
import { CurriculumContentEngine } from '@/core/curriculum/curriculumContentEngine.js';

export default function ImportLessonModal({ isOpen, onClose, dayNum = appState.currentDay, onLessonApplied }) {
  const [targetDay, setTargetDay] = useState(dayNum);
  const [versionTitle, setVersionTitle] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cloudStatus, setCloudStatus] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTargetDay(appState.currentDay || dayNum || 1);
      setVersionTitle('');
      setJsonInput('');
      setValidationResult(null);
      setCloudStatus('');
    }
  }, [isOpen, dayNum]);

  if (!isOpen) return null;

  const promptText = generateDayLessonPrompt(targetDay);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      showToast(`📋 Đã sao chép AI Master Prompt cho Ngày ${targetDay}!`);
    } catch (e) {
      console.warn('Clipboard copy error:', e);
      showToast('Không thể tự động copy, vui lòng sao chép thủ công.');
    }
  };

  const handleValidate = () => {
    setCloudStatus('');
    const result = validateAndParseLessonJson(jsonInput);
    setValidationResult(result);
    if (!result.success) {
      showToast(`⚠️ ${result.error}`);
    } else {
      showToast(`✅ JSON hợp lệ! Sẵn sàng chuyển thành bài học Ngày ${result.lesson.day}.`);
    }
  };

  const handleApplyLesson = async () => {
    if (!validationResult || !validationResult.success || !validationResult.lesson) {
      handleValidate();
      return;
    }

    setIsProcessing(true);
    const lesson = { ...validationResult.lesson };
    if (versionTitle.trim()) {
      lesson.theme = versionTitle.trim();
    }

    try {
      // 1. Save to local Dexie IndexedDB (multi-version support)
      const savedLesson = await saveCustomLessonLocal(lesson);

      // 2. Register with Curriculum Content Engine
      CurriculumContentEngine.setCustomLesson(savedLesson);

      // 3. Save to appState and localStorage
      if (!appState.customLessons) appState.customLessons = {};
      appState.customLessons[savedLesson.day] = savedLesson;

      // 4. Push to Firebase Cloud in background
      const cloudRes = await saveCustomLessonToCloud(savedLesson);
      setCloudStatus(cloudRes.message);

      // 5. Notify controller & parent callback
      if (typeof onLessonApplied === 'function') {
        onLessonApplied(savedLesson);
      }

      // Trigger custom event for controller to refresh all views
      window.dispatchEvent(new CustomEvent('custom-lesson-applied', { detail: savedLesson }));

      showToast(`🎉 Đã nạp thành công bài học Ngày ${savedLesson.day}! Bắt đầu học ngay.`);
      setTimeout(() => {
        setIsProcessing(false);
        onClose();
      }, 500);
    } catch (err) {
      console.error('Failed to apply lesson:', err);
      showToast(`Lỗi khi lưu bài học: ${err.message}`);
      setIsProcessing(false);
    }
  };

  const handleFetchFromCloud = async () => {
    setIsProcessing(true);
    setCloudStatus('Đang kết nối Firebase Cloud...');
    try {
      const res = await fetchCustomLessonFromCloud(targetDay);
      if (res.success && res.lesson) {
        setJsonInput(JSON.stringify(res.lesson, null, 2));
        setValidationResult({ success: true, lesson: res.lesson });
        setCloudStatus(`✅ Đã tải bài học Ngày ${targetDay} từ Firebase Cloud!`);
        showToast(`Đã nạp bài học từ Cloud cho Ngày ${targetDay}`);
      } else {
        setCloudStatus(`ℹ️ ${res.message}`);
        showToast(res.message);
      }
    } catch (e) {
      setCloudStatus(`⚠️ ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" id="import-lesson-modal">
      <div className="glass-card w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#0f172a] border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📥</span>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Nhập Bài Học Từ AI & Đồng Bộ Cloud
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">Day {targetDay}</span>
              </h3>
              <p className="text-xs text-slate-400">Tạo nội dung với AI, dán JSON và chuyển hóa ngay thành bài học chuẩn của Bootcamp.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4 text-xs">
          
          {/* Step 1: Prompt Generation */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-accent-cyan flex items-center gap-1.5">
                <span>1️⃣</span> AI Master Prompt cho Ngày {targetDay}:
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="unstyled"
                  onClick={handleCopyPrompt}
                  className="btn-secondary text-[11px] py-1 px-2.5 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40"
                  id="btn-copy-day-prompt"
                >
                  📋 Copy AI Prompt
                </Button>
                <a
                  href="https://chatgpt.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] py-1 px-2 text-cyan-400 hover:underline flex items-center gap-0.5"
                >
                  Mở ChatGPT ↗
                </a>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              Bấm copy prompt ở trên, dán vào ChatGPT hoặc Claude để sinh trọn vẹn 20 chunks, bài nghe, bài đọc và đề thi.
            </p>
            <div className="max-h-24 overflow-y-auto p-2 bg-black/40 rounded border border-white/5 font-mono text-[10px] text-slate-300 select-all" id="modal-prompt-preview">
              {promptText}
            </div>
          </div>

          {/* Step 2: Version Title & Paste JSON */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                <span>🏷️</span>
                <span>Tên / Ghi chú phiên bản này (Tùy chọn):</span>
              </label>
              <input
                type="text"
                value={versionTitle}
                onChange={(e) => setVersionTitle(e.target.value)}
                placeholder="Ví dụ: Bản chuyên sâu thương mại, Bản chuẩn Cambridge CAE, v.v."
                className="w-full text-xs py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                id="lesson-version-title-input"
              />
            </div>

            <div className="flex items-center justify-between mt-1">
              <label className="font-bold text-white flex items-center gap-1.5">
                <span>2️⃣</span> Dán Phản Hồi JSON Từ AI Vào Đây:
              </label>
              <Button
                variant="unstyled"
                onClick={handleFetchFromCloud}
                disabled={isProcessing}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 py-0.5 px-1.5 flex items-center gap-1"
                id="btn-fetch-cloud-lesson"
              >
                ☁️ Tải từ Firebase Cloud
              </Button>
            </div>
            <textarea
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                setValidationResult(null);
              }}
              rows={7}
              placeholder={`Dán kết quả JSON từ AI vào đây...\nVí dụ:\n{\n  "day": ${targetDay},\n  "theme": "...",\n  "grammar": "...",\n  "chunks": [...],\n  "listening": { ... },\n  "reading": { ... }\n}`}
              className="w-full font-mono text-[11px] p-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 transition resize-y"
              id="lesson-json-textarea"
            />
          </div>

          {/* Step 3: Validation & Preview */}
          <div className="flex items-center justify-between">
            <Button
              variant="unstyled"
              onClick={handleValidate}
              className="btn-secondary py-1.5 px-3 rounded-lg text-xs"
              id="btn-validate-lesson-json"
            >
              🔍 Kiểm Tra Cú Pháp & Schema
            </Button>
            {cloudStatus && (
              <span className="text-[11px] text-indigo-300 font-mono italic">{cloudStatus}</span>
            )}
          </div>

          {validationResult && (
            <div id="modal-preview-panel" className={`p-3 rounded-xl border ${validationResult.success ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200' : 'bg-rose-950/30 border-rose-500/40 text-rose-200'}`}>
              {validationResult.success ? (
                <div>
                  <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                    <span>✅</span> Dữ liệu hợp lệ: {validationResult.lesson.theme} (Day {validationResult.lesson.day})
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-300 mt-2">
                    <div>📐 <strong>Ngữ pháp:</strong> {validationResult.lesson.grammar}</div>
                    <div>🎧 <strong>Nghe sâu:</strong> {validationResult.lesson.listening?.title}</div>
                    <div>💎 <strong>20 Chunks:</strong> {validationResult.lesson.chunks?.length} cụm từ</div>
                    <div>📖 <strong>Đọc hiểu:</strong> {validationResult.lesson.reading?.title}</div>
                    <div>🎙️ <strong>Luyện nói:</strong> Đã sẵn sàng</div>
                    <div>✍️ <strong>Luyện viết:</strong> Đã sẵn sàng</div>
                    <div>💬 <strong>Nghe mở rộng:</strong> Đã sẵn sàng</div>
                    <div>🌐 <strong>Immersion:</strong> {validationResult.lesson.immersion?.realWorldExpressions?.length || 3} thành ngữ</div>
                    <div>🧠 <strong>SRS & Sổ lỗi:</strong> Đã sẵn sàng</div>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-emerald-500/20 text-[10px] text-emerald-300 flex items-center justify-between">
                    <span>📅 Tự động đồng bộ 9 Khung Giờ Trong Ngày & Tiến Trình 14 Giờ</span>
                    <span className="font-bold">9/9 Khối Đầy Đủ</span>
                  </div>
                </div>
              ) : (
                <div className="font-medium text-rose-300">
                  ❌ {validationResult.error}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-slate-900/80 flex items-center justify-between gap-3">
          <Button
            variant="unstyled"
            onClick={onClose}
            className="btn-secondary py-2 px-4 text-xs"
          >
            Đóng
          </Button>

          <Button
            variant="unstyled"
            onClick={handleApplyLesson}
            disabled={isProcessing || !jsonInput.trim()}
            className="btn-primary py-2 px-5 text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-1.5"
            id="btn-apply-custom-lesson"
          >
            {isProcessing ? '⏳ Đang Xử Lý & Lưu...' : '🚀 Biến Thành Bài Học (Lưu & Áp Dụng)'}
          </Button>
        </div>

      </div>
    </div>
  );
}
