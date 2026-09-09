import { useState, useMemo } from 'react';

/**
 * WritingDiffModal: Side-by-side & inline diff comparison between Draft 1 and Draft 2 (Rewrite Rule)
 * Spec reference: docs/cefr-learning-planner-spec/18_BOOTCAMP_CURRICULUM_INTEGRATION.md
 */
export default function WritingDiffModal({ isOpen, onClose, day, draft1Text = '', draft2Text = '' }) {
  const [viewMode, setViewMode] = useState('side-by-side'); // 'side-by-side' | 'inline'

  const currentDomDraft1 = typeof document !== 'undefined' ? document.getElementById('writing-draft-1')?.value?.trim() : '';
  const currentDomDraft2 = typeof document !== 'undefined' ? document.getElementById('writing-draft-2')?.value?.trim() : '';

  const effectiveDraft1 = draft1Text || currentDomDraft1 || 'In modern society, learning English is very important because it open many doors for career and education. Many people try to study every day but they lack discipline.';
  const effectiveDraft2 = draft2Text || currentDomDraft2 || 'In contemporary society, acquiring English proficiency plays an indispensable role, opening abundant avenues for career advancement and academic pursuits. Although numerous learners strive to study daily, maintaining rigorous discipline remains challenging.';

  const stats = useMemo(() => {
    const words1 = effectiveDraft1.trim() ? effectiveDraft1.trim().split(/\s+/).length : 0;
    const words2 = effectiveDraft2.trim() ? effectiveDraft2.trim().split(/\s+/).length : 0;
    const diffWords = words2 - words1;
    return { words1, words2, diffWords };
  }, [effectiveDraft1, effectiveDraft2]);

  // Compute word-level difference
  const diffTokens = useMemo(() => {
    const tokens1 = effectiveDraft1.trim().split(/\s+/).filter(Boolean);
    const tokens2 = effectiveDraft2.trim().split(/\s+/).filter(Boolean);

    // Simple LCS or word set comparison for highlight
    const set1 = new Set(tokens1.map(w => w.toLowerCase()));
    const set2 = new Set(tokens2.map(w => w.toLowerCase()));

    const result2 = tokens2.map(word => {
      const isNew = !set1.has(word.toLowerCase());
      return { word, type: isNew ? 'added' : 'same' };
    });

    const result1 = tokens1.map(word => {
      const isRemoved = !set2.has(word.toLowerCase());
      return { word, type: isRemoved ? 'removed' : 'same' };
    });

    return { result1, result2 };
  }, [draft1Text, draft2Text]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#1f2937]/50">
          <div>
            <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
              <span>✍️</span> So Sánh Bản Viết: Draft 1 vs Draft 2 (Rewrite Rule)
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Ngày {day || 1} • Đối chiếu sự nâng cấp từ vựng, cấu trúc câu và khắc phục lỗi sai giữa hai bản nháp
            </p>
          </div>
          <button id="close-writing-diff-modal-btn" onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition">
            ✕
          </button>
        </div>

        {/* Stats Summary Bar */}
        <div className="px-6 py-3 bg-[#1e1b4b]/40 border-b border-white/5 flex items-center justify-between flex-wrap gap-4 text-xs">
          <div className="flex gap-6 items-center">
            <div>
              <span className="text-gray-400">Bản Nháp 1:</span>{' '}
              <strong className="text-rose-400">{stats.words1} từ</strong>
            </div>
            <div>
              <span className="text-gray-400">Bản Viết Lại 2:</span>{' '}
              <strong className="text-emerald-400">{stats.words2} từ</strong>
            </div>
            <div>
              <span className="text-gray-400">Chênh lệch:</span>{' '}
              <strong className={stats.diffWords >= 0 ? 'text-indigo-400' : 'text-amber-400'}>
                {stats.diffWords >= 0 ? `+${stats.diffWords}` : stats.diffWords} từ
              </strong>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${viewMode === 'side-by-side' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
            >
              Song Song (Side-by-Side)
            </button>
            <button
              onClick={() => setViewMode('inline')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${viewMode === 'inline' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
            >
              Xem Chi Tiết Nâng Cấp
            </button>
          </div>
        </div>

        {/* Diff Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {viewMode === 'side-by-side' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
              {/* Draft 1 */}
              <div className="flex flex-col bg-[#0b0f19] border border-rose-500/20 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5">
                  <span className="font-bold text-rose-400 text-sm flex items-center gap-1.5">
                    <span>📄</span> Draft 1 (Bản Thô Ban Đầu)
                  </span>
                  <span className="text-xs text-gray-500">{stats.words1} words</span>
                </div>
                <div className="text-sm leading-relaxed text-gray-300 font-study whitespace-pre-wrap overflow-y-auto flex-1 max-h-[50vh]">
                  {diffTokens.result1.length ? (
                    diffTokens.result1.map((item, idx) => (
                      <span
                        key={idx}
                        className={item.type === 'removed' ? 'bg-rose-950/60 text-rose-300 rounded px-0.5 underline decoration-rose-500/50' : ''}
                      >
                        {item.word}{' '}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 italic">Chưa có bài viết cho Draft 1.</span>
                  )}
                </div>
              </div>

              {/* Draft 2 */}
              <div className="flex flex-col bg-[#0b0f19] border border-emerald-500/20 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5">
                  <span className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                    <span>✨</span> Draft 2 (Bản Viết Lại Hoàn Chỉnh)
                  </span>
                  <span className="text-xs text-gray-500">{stats.words2} words</span>
                </div>
                <div className="text-sm leading-relaxed text-gray-200 font-study whitespace-pre-wrap overflow-y-auto flex-1 max-h-[50vh]">
                  {diffTokens.result2.length ? (
                    diffTokens.result2.map((item, idx) => (
                      <span
                        key={idx}
                        className={item.type === 'added' ? 'bg-emerald-950/70 text-emerald-300 font-semibold rounded px-0.5' : ''}
                      >
                        {item.word}{' '}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 italic">Chưa có bài viết cho Draft 2.</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Inline Refinement View */
            <div className="space-y-4">
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl">
                <h4 className="font-bold text-sm text-emerald-400 mb-2 flex items-center gap-1.5">
                  <span>🚀</span> Các Cụm Từ Mới & Nâng Cấp Trong Draft 2
                </h4>
                <div className="flex flex-wrap gap-2 text-xs">
                  {diffTokens.result2.filter(i => i.type === 'added').length ? (
                    diffTokens.result2.filter(i => i.type === 'added').map((item, idx) => (
                      <span key={idx} className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                        + {item.word}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 italic">Không có từ mới đáng kể giữa 2 bản.</span>
                  )}
                </div>
              </div>

              <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-xl">
                <h4 className="font-bold text-sm text-rose-400 mb-2 flex items-center gap-1.5">
                  <span>🗑️</span> Các Từ / Cấu Trúc Đã Được Thay Thế Hoặc Lược Bỏ Từ Draft 1
                </h4>
                <div className="flex flex-wrap gap-2 text-xs">
                  {diffTokens.result1.filter(i => i.type === 'removed').length ? (
                    diffTokens.result1.filter(i => i.type === 'removed').map((item, idx) => (
                      <span key={idx} className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-full line-through">
                        {item.word}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 italic">Không có từ bị loại bỏ.</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#1f2937]/30 border-t border-white/5 flex justify-between items-center text-xs text-gray-400">
          <span>💡 Quy tắc viết lại: Không nhìn bản cũ, viết lại từ trang giấy trắng dựa trên gợi ý sửa lỗi để nạp phản xạ ngôn ngữ tự nhiên.</span>
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
