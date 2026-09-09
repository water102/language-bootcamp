import { useState } from 'react';
import { getGrammarLesson } from '@/data/grammarLessons.js';
import { appState, saveState, showToast } from '@/runtime/controller.js';

export default function GrammarLessonModal({ isOpen, onClose, grammarItem }) {
  const [activeTab, setActiveTab] = useState('theory'); // 'theory' | 'exercises'
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [checkedAnswers, setCheckedAnswers] = useState({});

  if (!isOpen || !grammarItem) return null;

  const lesson = getGrammarLesson(grammarItem.name, grammarItem.level);
  const exercises = lesson.exercises || [];

  const handleSelectOption = (qIdx, optIdx) => {
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleCheckAnswer = (qIdx) => {
    setCheckedAnswers(prev => ({ ...prev, [qIdx]: true }));
  };

  const handleSaveMastery = () => {
    if (!appState.grammarMastery[lesson.name]) {
      appState.grammarMastery[lesson.name] = { understand: true, written: true, spoken: false };
    } else {
      appState.grammarMastery[lesson.name].understand = true;
      appState.grammarMastery[lesson.name].written = true;
    }
    saveState();

    // Update DOM checkboxes if present in table
    const row = document.querySelector(`tr[data-grammar-name="${lesson.name}"]`);
    if (row) {
      const uCb = row.querySelector('input[data-type="understand"]');
      const wCb = row.querySelector('input[data-type="written"]');
      if (uCb) {
        uCb.checked = true;
        uCb.parentElement?.classList.add('checked');
      }
      if (wCb) {
        wCb.checked = true;
        wCb.parentElement?.classList.add('checked');
      }
    }

    showToast(`🎉 Đã đánh dấu làm chủ chủ điểm: ${lesson.name}!`);
    onClose();
  };

  const allAnswered = exercises.length > 0 && exercises.every((_, idx) => checkedAnswers[idx]);
  const correctCount = exercises.filter((ex, idx) => selectedAnswers[idx] === ex.correct).length;

  return (
    <div id="grammar-lesson-modal" className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#1f2937]/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[11px] font-code font-bold uppercase py-0.5 px-2.5 rounded-full ${
                lesson.level.includes('C1') ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                lesson.level.includes('B2') ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                lesson.level.includes('B1') ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' :
                'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {lesson.level}
              </span>
              <span className="text-xs text-gray-400">Ma Trận Ngữ Pháp C1 Master</span>
            </div>
            <h2 className="text-xl font-bold font-display text-white">
              {lesson.name}
            </h2>
          </div>
          <button id="close-grammar-lesson-modal-btn" onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition">
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-2.5 bg-[#1e1b4b]/30 border-b border-white/5 flex items-center justify-between text-xs">
          <div className="flex gap-2">
            <button
              id="tab-grammar-theory-btn"
              onClick={() => setActiveTab('theory')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'theory' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <span>📖</span> Nội Dung Bài Học
            </button>
            <button
              id="tab-grammar-exercises-btn"
              onClick={() => setActiveTab('exercises')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'exercises' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <span>✍️</span> Bài Tập Thực Hành ({exercises.length} câu)
            </button>
          </div>
          {allAnswered && (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span>✅</span> Điểm: {correctCount}/{exercises.length}
            </span>
          )}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'theory' ? (
            <div className="space-y-5 text-sm">
              {/* Formula & Syntax */}
              <div className="bg-[#0b0f19] border border-indigo-500/20 rounded-xl p-4">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span>📐</span> Cấu Trúc & Công Thức Chuẩn
                </h4>
                <pre className="font-mono text-xs bg-black/40 p-3 rounded-lg text-emerald-300 whitespace-pre-wrap leading-relaxed border border-white/5">
                  {lesson.formula}
                </pre>
              </div>

              {/* Core Usage */}
              <div>
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <span>💡</span> Bản Chất & Cách Dùng Chuyên Sâu
                </h4>
                <p className="text-gray-300 leading-relaxed bg-white/5 p-3.5 rounded-xl border border-white/5">
                  {lesson.explanation}
                </p>
              </div>

              {/* Realistic Examples */}
              <div>
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span>🎯</span> Ví Dụ Thực Tế & Phân Tích (Cambridge C1 Context)
                </h4>
                <div className="space-y-2.5">
                  {lesson.examples?.map((ex, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-3.5 space-y-1">
                      <p className="font-semibold text-white text-sm">{ex.en}</p>
                      <p className="text-xs text-gray-400">→ {ex.vi}</p>
                      {ex.note && (
                        <p className="text-[11px] text-cyan-300 font-mono bg-cyan-950/30 px-2 py-0.5 rounded inline-block mt-1">
                          📌 {ex.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pitfalls & Exam Traps */}
              {lesson.pitfalls?.length > 0 && (
                <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>⚠️</span> Bẫy Thường Gặp & Lưu Ý Tránh Mất Điểm
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-rose-200">
                    {lesson.pitfalls.map((p, idx) => (
                      <li key={idx} className="leading-relaxed">{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Jump to Exercises */}
              <div className="pt-2 flex justify-end">
                <button
                  id="btn-goto-exercises"
                  onClick={() => setActiveTab('exercises')}
                  className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-indigo-600/20"
                >
                  <span>Chuyển Sang Làm Bài Tập Ngay</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {exercises.map((ex, qIdx) => {
                const isChecked = !!checkedAnswers[qIdx];
                const selected = selectedAnswers[qIdx];
                const isCorrect = selected === ex.correct;

                return (
                  <div key={qIdx} className={`p-4 rounded-xl border transition ${
                    isChecked
                      ? isCorrect ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-rose-950/20 border-rose-500/40'
                      : 'bg-white/5 border-white/5'
                  }`}>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-bold text-indigo-300 uppercase">Câu {qIdx + 1}</span>
                      {isChecked && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {isCorrect ? '✓ Chính xác' : '✗ Chưa đúng'}
                        </span>
                      )}
                    </div>

                    <p className="font-study text-sm font-semibold text-white mb-3.5 leading-relaxed">
                      {ex.question}
                    </p>

                    {/* Options */}
                    <div className="space-y-2">
                      {ex.options.map((opt, optIdx) => {
                        const isChosen = selected === optIdx;
                        let optStyle = 'bg-white/5 border-white/5 hover:bg-white/10 text-gray-200';
                        if (isChosen) optStyle = 'bg-indigo-600/30 border-indigo-500 text-white font-semibold';
                        if (isChecked) {
                          if (optIdx === ex.correct) {
                            optStyle = 'bg-emerald-600/30 border-emerald-500 text-emerald-200 font-bold';
                          } else if (isChosen && !isCorrect) {
                            optStyle = 'bg-rose-600/30 border-rose-500 text-rose-200 line-through';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={isChecked}
                            onClick={() => handleSelectOption(qIdx, optIdx)}
                            className={`w-full text-left p-3 rounded-lg border text-xs transition flex items-center justify-between ${optStyle}`}
                          >
                            <span>{opt}</span>
                            {isChecked && optIdx === ex.correct && <span>✅</span>}
                            {isChecked && isChosen && !isCorrect && <span>❌</span>}
                          </button>
                        );
                      })}
                    </div>

                    {/* Check Answer Button & Explanation */}
                    <div className="mt-3 pt-3 border-t border-white/5 flex flex-col gap-2">
                      {!isChecked ? (
                        <div className="flex justify-end">
                          <button
                            disabled={selected === undefined}
                            onClick={() => handleCheckAnswer(qIdx)}
                            className="py-1.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs transition"
                          >
                            Kiểm tra đáp án
                          </button>
                        </div>
                      ) : (
                        <div className="p-3 bg-black/40 rounded-lg text-xs leading-relaxed text-gray-300 border border-white/5">
                          <strong className="text-cyan-300 block mb-0.5">💡 Giải thích chi tiết:</strong>
                          {ex.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Completion Action */}
              {allAnswered && (
                <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h4 className="font-bold text-emerald-400 text-sm">🎉 Bạn đã hoàn thành các câu bài tập!</h4>
                    <p className="text-xs text-gray-300 mt-0.5">
                      Kết quả: {correctCount}/{exercises.length} câu đúng. Nhấn bên dưới để cập nhật tiến độ ma trận ngữ pháp.
                    </p>
                  </div>
                  <button
                    id="btn-save-grammar-mastery"
                    onClick={handleSaveMastery}
                    className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/30"
                  >
                    💾 Lưu Tiến Độ & Đánh Dấu Đã Làm Chủ
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
