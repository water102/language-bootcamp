import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { highlightSchedulePanel, switchCurrentDay, speakText, showToast, appState } from '@/runtime/controller';

export default memo(function LessonsPage() {
  const scrollToBlock = (blockId) => {
    const el = document.getElementById(blockId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el.style.boxShadow = '0 0 25px rgba(99, 102, 241, 0.6)';
      el.style.transition = 'box-shadow 0.4s ease';
      setTimeout(() => { el.style.boxShadow = ''; }, 1500);
    }
  };

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

      <div className="lesson-nav-days" id="lesson-days-nav"></div>

      {/* Header Info Banner */}
      <div className="glass-card mb-[16px]">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display text-[22px] text-[#fff]" id="lesson-theme-title">{"Day 1 — Identity & Introductions"}</h3>
              <span id="lesson-source-badge" className="hidden text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ✨ Bài Học AI (Custom)
              </span>
            </div>
            <p className="text-brand-light text-[14px] font-semibold mt-[2px]" id="lesson-grammar-title">{"be: affirmative + subject pronouns"}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="unstyled"
              id="btn-copy-day-prompt"
              className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
              title="Sao chép prompt Cambridge C1 của ngày này để đưa vào ChatGPT / Claude / Gemini"
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
                window.dispatchEvent(new CustomEvent('open-import-lesson-modal', { detail: { day: appState.currentDay } }));
              }}
            >
              <span>🤖</span>
              <span>Nhập Bài Học Từ AI</span>
            </Button>
            <Button
              variant="unstyled"
              id="btn-restore-default-lesson"
              className="hidden btn-secondary text-xs px-2.5 py-2 text-rose-300 hover:text-rose-200 border-rose-500/30"
              title="Quay lại bài học gốc của Bootcamp"
            >
              <span>↩️</span>
              <span>Khôi phục gốc</span>
            </Button>
            <Button
              variant="unstyled"
              className="btn-secondary text-xs px-3 py-2"
              onClick={() => {
                switchCurrentDay(appState.currentDay);
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
          >
            <option value="default">📌 Bài học chuẩn (Standard Bootcamp)</option>
          </select>
          <span id="lesson-version-count" className="text-[11px] text-slate-400">
            (1 bản có sẵn)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="unstyled"
            id="btn-delete-current-version"
            className="hidden btn-secondary text-xs py-1 px-2.5 text-rose-300 hover:text-rose-200 border-rose-500/30"
            title="Xóa phiên bản AI này"
          >
            <span>🗑️ Xóa bản này</span>
          </Button>
          <Button
            variant="unstyled"
            id="btn-add-version-quick"
            className="btn-secondary text-xs py-1 px-2.5 text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/10"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-import-lesson-modal', { detail: { day: appState.currentDay } }));
            }}
          >
            <span>➕ Nhập thêm bản AI</span>
          </Button>
        </div>
      </div>

      {/* 9 Blocks Quick Jump Nav Bar */}
      <div className="glass-card p-2.5 mb-[20px] bg-slate-950/70 border border-indigo-500/20 sticky top-2 z-10 backdrop-blur-md">
        <div className="text-[11px] text-slate-400 font-bold mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span>⚡</span>
            <span>Điều Hướng Nhanh 9 Khối Học Trong Ngày:</span>
          </span>
          <span className="text-[10px] text-indigo-300">Bấm để cuộn nhanh đến khối tương ứng</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button onClick={() => scrollToBlock('block-section-grammar')} className="px-2.5 py-1 rounded-md bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-200 whitespace-nowrap border border-indigo-500/30 transition">
            📐 1. Ngữ Pháp
          </button>
          <button onClick={() => scrollToBlock('block-section-listening')} className="px-2.5 py-1 rounded-md bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-200 whitespace-nowrap border border-cyan-500/30 transition">
            🎧 2. Nghe Sâu
          </button>
          <button onClick={() => scrollToBlock('block-section-chunks')} className="px-2.5 py-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-200 whitespace-nowrap border border-emerald-500/30 transition">
            💎 3. 20 Chunks
          </button>
          <button onClick={() => scrollToBlock('block-section-reading')} className="px-2.5 py-1 rounded-md bg-blue-500/20 hover:bg-blue-500/40 text-blue-200 whitespace-nowrap border border-blue-500/30 transition">
            📖 4. Đọc Hiểu
          </button>
          <button onClick={() => scrollToBlock('block-section-speaking')} className="px-2.5 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/40 text-amber-200 whitespace-nowrap border border-amber-500/30 transition">
            🎙️ 5. Luyện Nói
          </button>
          <button onClick={() => scrollToBlock('block-section-writing')} className="px-2.5 py-1 rounded-md bg-pink-500/20 hover:bg-pink-500/40 text-pink-200 whitespace-nowrap border border-pink-500/30 transition">
            ✍️ 6. Luyện Viết
          </button>
          <button onClick={() => scrollToBlock('block-section-extensive')} className="px-2.5 py-1 rounded-md bg-purple-500/20 hover:bg-purple-500/40 text-purple-200 whitespace-nowrap border border-purple-500/30 transition">
            💬 7. Nghe Mở Rộng
          </button>
          <button onClick={() => scrollToBlock('block-section-immersion')} className="px-2.5 py-1 rounded-md bg-teal-500/20 hover:bg-teal-500/40 text-teal-200 whitespace-nowrap border border-teal-500/30 transition">
            🌐 8. Immersion
          </button>
          <button onClick={() => scrollToBlock('block-section-srs')} className="px-2.5 py-1 rounded-md bg-slate-500/20 hover:bg-slate-500/40 text-slate-200 whitespace-nowrap border border-slate-500/30 transition">
            🧠 9. SRS & Sổ Lỗi
          </button>
        </div>
      </div>

      {/* Media Embed Container */}
      <div className="glass-card mb-[20px] hidden" id="lesson-media-embed-container"></div>

      {/* ========================================================================= */}
      {/* 9 ALL-INCLUSIVE DAILY BLOCKS SECTIONS                                     */}
      {/* ========================================================================= */}
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
            <p className="text-slate-200 text-sm leading-relaxed" id="lesson-grammar-explanation">Đang nạp giải thích ngữ pháp...</p>
          </div>
          <div className="mb-4">
            <h5 className="text-white font-bold text-xs uppercase mb-2">📌 Quy Tắc Vàng Cần Ghi Nhớ:</h5>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 pl-1" id="lesson-grammar-rules-list">
              <li>Áp dụng chính xác hình thái động từ và trật tự từ.</li>
              <li>Tránh bẫy nhầm lẫn thì và hòa hợp ngữ pháp.</li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold text-xs uppercase mb-2">✍️ Thực Hành Đặt Câu (Sentence Drills & Transformations):</h5>
            <div className="space-y-2" id="lesson-grammar-drills-container">
              {/* Dynamic Sentence Drills inserted here */}
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
              <Button variant="unstyled" className="btn-secondary py-1.5 px-3 text-xs" id="play-script-tts-btn">
                🔊 Đọc Audio
              </Button>
              <Button variant="unstyled" className="btn-secondary py-1.5 px-3 text-xs" id="toggle-script-btn">
                👁️ Hiện Transcript
              </Button>
            </div>
          </div>
          <strong className="text-accent-cyan text-sm block mb-2" id="lesson-listening-title">Đang nạp bài nghe...</strong>
          <div className="script-box blur-content mb-3" id="lesson-listening-script"></div>
          <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/20 mb-3 text-xs text-cyan-200">
            <span className="font-bold">🎯 Trọng tâm Shadowing: </span>
            <span id="lesson-listening-shadowing-focus">Luyện nối âm tự nhiên và nhịp điệu trọng âm câu.</span>
          </div>
          <div>
            <h5 className="text-white text-xs font-bold uppercase mb-2">❓ Câu hỏi kiểm tra nghe hiểu:</h5>
            <div id="lesson-questions-container"></div>
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
          <div className="chunks-list-card" id="lesson-chunks-container"></div>
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
          <h5 className="text-blue-300 font-bold text-sm mb-2" id="lesson-reading-title">Tiêu đề bài đọc</h5>
          <p className="text-sm text-main leading-[1.75] mb-3 p-3 rounded-lg bg-slate-900/50 border border-white/5 whitespace-pre-line" id="lesson-reading-text"></p>
          <div className="mb-3" id="lesson-reading-vocab-focus-box">
            <span className="text-xs text-slate-400 font-semibold block mb-1">🔍 Từ vựng học thuật trọng tâm trong bài:</span>
            <div className="flex flex-wrap gap-1.5" id="lesson-reading-vocab-tags"></div>
          </div>
          <div className="py-2.5 px-3.5 rounded-lg bg-[rgba(255,255,255,0.03)] border-l-2 border-amber-400">
            <span className="text-xs text-amber-400 font-bold block">📝 Yêu cầu tóm tắt (Summary Prompt):</span>
            <p className="text-xs text-slate-300 mt-1" id="lesson-reading-prompt"></p>
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
                switchCurrentDay(appState.currentDay);
                document.querySelector('[data-target=speaking]')?.click();
              }}
            >
              🚀 Mở Phòng Thu Âm Nói
            </Button>
          </div>
          <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-500/20 mb-3">
            <span className="text-xs text-amber-300 font-bold uppercase block mb-1">Đề bài luyện nói:</span>
            <p className="text-white text-sm font-semibold" id="lesson-speaking-task"></p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
              <h6 className="text-xs text-amber-300 font-bold mb-1.5">📋 Gợi Ý Dàn Ý 3 Phần:</h6>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside" id="lesson-speaking-outline">
                <li>Mở đầu (30s): Nêu luận điểm chính.</li>
                <li>Thân bài (60s): 2 ý phân tích kèm dẫn chứng.</li>
                <li>Kết luận (30s): Tóm tắt và bài học.</li>
              </ul>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
              <h6 className="text-xs text-amber-300 font-bold mb-1.5">🗣️ Hướng Dẫn Phát Âm & Ngữ Điệu:</h6>
              <p className="text-xs text-slate-300 leading-relaxed" id="lesson-speaking-pronunciation">
                Chú ý nối âm tự nhiên và duy trì độ vang nguyên âm dài.
              </p>
            </div>
          </div>
          <div>
            <h6 className="text-xs text-slate-400 font-bold mb-1.5">⚡ Câu Hỏi Phản Xạ Follow-up:</h6>
            <div className="space-y-1 text-xs text-slate-200" id="lesson-speaking-followup"></div>
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
                switchCurrentDay(appState.currentDay);
                document.querySelector('[data-target=writing]')?.click();
              }}
            >
              🚀 Mở Writing Studio
            </Button>
          </div>
          <div className="p-3.5 rounded-lg bg-pink-950/20 border border-pink-500/20 mb-3">
            <span className="text-xs text-pink-300 font-bold uppercase block mb-1">Nhiệm vụ viết:</span>
            <p className="text-white text-sm font-semibold" id="lesson-writing-task"></p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
              <h6 className="text-xs text-pink-300 font-bold mb-1.5">📐 Dàn Ý Cấu Trúc Đề Xuất:</h6>
              <p className="text-xs text-slate-300 leading-relaxed" id="lesson-writing-outline"></p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
              <h6 className="text-xs text-pink-300 font-bold mb-1.5">🎯 Cấu Trúc Ngữ Pháp Bắt Buộc Đưa Vào:</h6>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside" id="lesson-writing-targets"></ul>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
            <h6 className="text-xs text-pink-300 font-bold mb-1">💡 Đoạn Văn Mẫu C1 Tham Khảo:</h6>
            <p className="text-xs text-slate-300 italic leading-relaxed" id="lesson-writing-sample"></p>
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
          <h5 className="text-purple-300 font-bold text-sm mb-1.5" id="lesson-extensive-title">Chủ đề nghe mở rộng</h5>
          <p className="text-xs text-slate-300 leading-relaxed mb-3" id="lesson-extensive-desc"></p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-500/20">
              <h6 className="text-xs text-purple-300 font-bold mb-1.5">🗣️ Câu Hỏi Đàm Thoại / Debate:</h6>
              <div className="space-y-1 text-xs text-slate-200" id="lesson-extensive-questions"></div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
              <h6 className="text-xs text-slate-400 font-bold mb-1.5">📻 Kênh & Nguồn Nghe Khuyến Nghị:</h6>
              <p className="text-xs text-cyan-300" id="lesson-extensive-sources"></p>
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
            <p className="text-xs text-slate-200" id="lesson-immersion-context"></p>
          </div>
          <div className="mb-3">
            <h6 className="text-xs text-white font-bold uppercase mb-2">💎 Thành Ngữ / Khẩu Ngữ Đời Thực Cần Nạp:</h6>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" id="lesson-immersion-expressions"></div>
          </div>
          <div className="text-xs text-slate-400">
            <span className="font-semibold text-slate-300">📺 Gợi ý Media: </span>
            <span id="lesson-immersion-media-tip"></span>
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
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside" id="lesson-srs-pitfalls"></ul>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
              <h6 className="text-xs text-slate-300 font-bold mb-1.5">📋 Nhắc Nhở Ôn Tập SRS:</h6>
              <p className="text-xs text-slate-300 leading-relaxed" id="lesson-srs-reminders"></p>
            </div>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-900/80 border border-indigo-500/20">
            <h6 className="text-xs text-indigo-300 font-bold mb-2 flex items-center justify-between">
              <span>✍️ Nhật Ký Phản Tư 3 Dòng Cuối Ngày (3-Line Reflection Journal):</span>
              <span className="text-[10px] text-slate-400">Tự động lưu vào bộ nhớ máy</span>
            </h6>
            <div className="space-y-1 text-xs text-slate-300 mb-2" id="lesson-reflection-questions"></div>
            <textarea
              id="lesson-daily-reflection-input"
              rows="3"
              className="form-input w-full text-xs p-2 rounded bg-slate-950 text-slate-100 border border-slate-700 focus:border-indigo-400"
              placeholder="Gõ 3 dòng phản tư của bạn hôm nay: 1. Cụm từ hay nhất... 2. Lỗi đã sửa... 3. Mục tiêu ngày mai..."
            ></textarea>
            <div className="flex justify-end mt-2">
              <Button
                variant="unstyled"
                id="btn-save-daily-reflection"
                className="btn-primary text-xs px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white"
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

