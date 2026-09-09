import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { highlightSchedulePanel, switchCurrentDay, speakText, showToast, appState } from '@/runtime/controller';
export default memo(function LessonsPage() { return (<section className="page-view" id="view-lessons">
<div className="view-header">
<h2>{"Starter Pack — Bài Học Thực Hành Tuần 1"}</h2>
<p>{"Toàn bộ tài liệu nguyên bản của 7 ngày đầu tiên: 20 Chunks kèm nghĩa tiếng Việt & phát âm mẫu (TTS), bài nghe, câu hỏi đọc hiểu và đề bài viết/nói."}</p>
</div>
<div className="lesson-nav-days" id="lesson-days-nav"></div>
<div className="glass-card mb-[20px]" >
<div className="flex justify-between items-center" >
<div>
<h3 className="font-display text-[22px] text-[#fff]" id="lesson-theme-title" >{"Day 1 — Identity & Introductions"}</h3>
<p className="text-brand-light text-[14px] font-semibold mt-[2px]" id="lesson-grammar-title" >{"be: affirmative + subject pronouns"}</p>
</div>
<Button variant="unstyled" className="btn-primary" onClick={() => {switchCurrentDay(appState.currentDay);document.querySelector('[data-target=speaking]').click();}}>{"\n              🎙️ Thu Âm Nói Ngày Này\n            "}</Button>
</div>
</div>
<div className="lesson-layout">

<div className="glass-card">
<h4 className="text-[16px] text-[#fff] mb-[14px]" >{"\n              💎 20 Target Chunks / Collocations Của Ngày\n            "}</h4>
<div className="chunks-list-card" id="lesson-chunks-container"></div>
</div>

<div className="flex flex-col gap-[20px]" >

<div className="glass-card listening-panel">
<div className="flex justify-between items-center" >
<h4 className="text-[16px] text-[#fff]" >{"🎧 Bài Nghe (Listening Script)"}</h4>
<div className="flex gap-[8px]" >
<Button variant="unstyled" className="btn-secondary py-[6px] px-[12px] text-[12px]"  id="play-script-tts-btn">{"\n                    🔊 Đọc Audio\n                  "}</Button>
<Button variant="unstyled" className="btn-secondary py-[6px] px-[12px] text-[12px]"  id="toggle-script-btn">{"\n                    👁️ Hiện Transcript\n                  "}</Button>
</div>
</div>
<strong className="text-accent-cyan text-[14px]" id="lesson-listening-title" >{"Daniel's Introduction"}</strong>
<div className="script-box blur-content" id="lesson-listening-script"></div>
<div className="mt-[10px]" >
<h5 className="text-[#fff] text-[13.5px] mb-[10px]" >{"❓ Câu hỏi kiểm tra nghe hiểu:"}</h5>
<div id="lesson-questions-container"></div>
</div>
</div>

<div className="glass-card">
<h4 className="text-[16px] text-[#fff] mb-[10px]" >{"📖 Bài Đọc (Active Reading)"}</h4>
<p className="text-[14px] text-main leading-[1.7] mb-[12px]" id="lesson-reading-text" ></p>
<div className="py-[10px] px-[14px] rounded-[8px] [background:rgba(255,255,255,0.03)] [border-left:2px_solid_var(--accent-amber)]" >
<span className="text-[12px] text-accent-amber font-bold" >{"Yêu cầu tóm tắt:"}</span>
<p className="text-[13px] text-muted mt-[2px]" id="lesson-reading-prompt" ></p>
</div>
</div>

<div className="glass-card grid grid-cols-[1fr_1fr] gap-[14px]" >
<div className="p-[14px] rounded-[10px] [background:rgba(245,158,11,0.05)] [border:1px_solid_rgba(245,158,11,0.2)]" >
<strong className="text-accent-amber text-[13px]" >{"🎙️ Nhiệm vụ Nói:"}</strong>
<p className="text-[13px] text-[#fff] mt-[6px]" id="lesson-speaking-task" ></p>
</div>
<div className="p-[14px] rounded-[10px] [background:rgba(99,102,241,0.05)] [border:1px_solid_rgba(99,102,241,0.2)]" >
<strong className="text-brand-light text-[13px]" >{"✍️ Nhiệm vụ Viết:"}</strong>
<p className="text-[13px] text-[#fff] mt-[6px]" id="lesson-writing-task" ></p>
</div>
</div>
</div>
</div>
</section>); });
