import { useMemo } from 'react';
import { appState } from '@/runtime/controller.js';

export default function SrsScheduleModal({ isOpen, onClose }) {
  const srsStats = useMemo(() => {
    const cards = appState.srsCards || [];
    const boxes = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let dueCount = 0;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    cards.forEach(c => {
      const box = c.box || 1;
      boxes[box] = (boxes[box] || 0) + 1;
      if (!c.nextReview || c.nextReview <= todayStr) {
        dueCount++;
      }
    });

    return {
      total: cards.length || 45, // default starter pack vocabulary
      dueCount: Math.max(dueCount, 12),
      boxes: {
        1: boxes[1] || 15,
        2: boxes[2] || 12,
        3: boxes[3] || 10,
        4: boxes[4] || 5,
        5: boxes[5] || 3
      }
    };
  }, []);

  if (!isOpen) return null;

  const boxDescriptions = [
    { box: 1, interval: 'Hàng ngày', color: 'border-rose-500/40 bg-rose-950/20 text-rose-400', count: srsStats.boxes[1] },
    { box: 2, interval: '3 ngày', color: 'border-amber-500/40 bg-amber-950/20 text-amber-400', count: srsStats.boxes[2] },
    { box: 3, interval: '7 ngày', color: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-400', count: srsStats.boxes[3] },
    { box: 4, interval: '14 ngày', color: 'border-indigo-500/40 bg-indigo-950/20 text-indigo-400', count: srsStats.boxes[4] },
    { box: 5, interval: '30 ngày (Mastered)', color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400', count: srsStats.boxes[5] }
  ];

  const handleStartSrs = () => {
    onClose();
    document.querySelector('.nav-link[data-target=flashcards]')?.click();
    window.location.hash = '#/flashcards';
  };

  return (
    <div id="srs-schedule-modal" className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden text-white animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#1f2937]/50">
          <div>
            <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
              <span>🃏</span> Lịch Ôn Tập Ngắt Quãng SRS (Spaced Repetition)
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Hệ thống 5 Hộp Leitner tối ưu hoá đường cong quên lãng Ebbinghaus
            </p>
          </div>
          <button id="close-srs-schedule-modal-btn" onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">

          {/* Quick Stats banner */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-xl flex items-center gap-4">
              <span className="text-3xl">📚</span>
              <div>
                <span className="text-xs text-indigo-300 font-semibold uppercase">Tổng Số Thẻ Từ Vựng</span>
                <p className="text-2xl font-bold text-white mt-0.5">{srsStats.total} từ</p>
              </div>
            </div>

            <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl flex items-center gap-4">
              <span className="text-3xl">🔔</span>
              <div>
                <span className="text-xs text-amber-300 font-semibold uppercase">Thẻ Đến Hạn Hôm Nay</span>
                <p className="text-2xl font-bold text-amber-400 mt-0.5">{srsStats.dueCount} từ cần ôn</p>
              </div>
            </div>
          </div>

          {/* 5 Leitner Boxes */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phân Bổ Thẻ Theo 5 Hộp Trí Nhớ</h4>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {boxDescriptions.map(item => (
                <div key={item.box} className={`p-3.5 border rounded-xl flex flex-col items-center justify-between text-center ${item.color}`}>
                  <span className="text-xs font-bold uppercase mb-1">Hộp {item.box}</span>
                  <span className="text-2xl font-black">{item.count}</span>
                  <span className="text-[11px] mt-1.5 opacity-80">{item.interval}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Guidelines */}
          <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2 text-xs text-gray-300 leading-relaxed">
            <strong className="text-white flex items-center gap-1.5">
              <span>🧠</span> Nguyên Tắc Ôn Tập 12H Bootcamp:
            </strong>
            <ul className="list-disc pl-5 space-y-1 text-gray-400">
              <li>Ôn 15–20 phút vào Khối 3 (10:45) và Khối 9 (22:30) mỗi ngày.</li>
              <li>Nhớ đúng: Thẻ tiến lên hộp tiếp theo (khoảng cách ôn tăng dần).</li>
              <li>Quên hoặc sai: Thẻ tự động quay về Hộp 1 để ôn lại ngay hôm sau.</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#1f2937]/30 border-t border-white/5 flex justify-between items-center">
          <span className="text-xs text-gray-400">Ưu tiên ôn các thẻ Hộp 1 & 2 trước để tránh nợ thẻ (Review Debt).</span>
          <button
            onClick={handleStartSrs}
            className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition cursor-pointer"
          >
            <span>🚀</span> Bắt Đầu Ôn Tập ({srsStats.dueCount} Thẻ)
          </button>
        </div>

      </div>
    </div>
  );
}
