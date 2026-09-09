import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { highlightSchedulePanel, switchCurrentDay, speakText, showToast, appState } from '@/runtime/controller';
export default memo(function SpeakingPage() { return (<section className="page-view" id="view-speaking">
<div className="view-header">
<h2>{"Phòng Thu Âm Speaking & Quy Trình Hai Bản Thu (Take 1 vs Take 2)"}</h2>
<p>{"Nguyên tắc vàng: Ghi âm Take 1 (không nhìn kịch bản) → Nghe lại bắt 3-5 lỗi đắt giá → Ghi âm Take 2 với các từ khóa để sửa chữa."}</p>
</div>
<div className="recorder-card">
<div className="recording-status-dot" id="recording-dot"></div>
<div className="recorder-time" id="recording-timer">{"00:00"}</div>
<div className="recorder-buttons">
<Button variant="unstyled" className="record-action-btn btn-primary" id="record-toggle-btn">
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
<span>{"Ghi Âm Nói (Microphone)"}</span>
</Button>
</div>
<p className="text-[13px] text-dim max-w-[550px]" >{"\n            Hệ thống ghi âm trực tiếp qua trình duyệt của bạn (100% riêng tư). Thu âm lần đầu sẽ lưu vào "}<strong>{"Take 1"}</strong>{", lần thu tiếp theo sẽ lưu vào "}<strong>{"Take 2"}</strong>{".\n          "}</p>
<div className="audio-preview-section">
<div id="audio-take-1-container"></div>
<div id="audio-take-2-container"></div>
</div>
</div>

<div className="glass-card">
<div className="flex justify-between items-center mb-[16px] flex-wrap gap-[12px]" >
<div>
<h3 className="font-display text-[18px] text-[#fff]" >{"Ngân Hàng Đề Thi Nói (Prompt Bank)"}</h3>
<p className="text-[13.5px] text-accent-amber font-semibold mt-[4px]" id="active-speaking-prompt-text" >{"\n                Chọn một đề bên dưới để luyện tập\n              "}</p>
</div>
<div className="filter-pills">
<Button variant="unstyled" className="filter-pill speaking-filter-btn active" data-level="all">{"Tất cả"}</Button>
<Button variant="unstyled" className="filter-pill speaking-filter-btn" data-level="a1_a2">{"A1–A2 (1-5m)"}</Button>
<Button variant="unstyled" className="filter-pill speaking-filter-btn" data-level="b1">{"B1 (5-10m)"}</Button>
<Button variant="unstyled" className="filter-pill speaking-filter-btn" data-level="b2">{"B2 (10-15m)"}</Button>
<Button variant="unstyled" className="filter-pill speaking-filter-btn" data-level="c1">{"C1 (15-20m)"}</Button>
</div>
</div>
<div className="grid grid-cols-[repeat(auto-fill,_minmax(320px,_1fr))] gap-[14px]"  id="speaking-prompts-container"></div>
</div>
</section>); });
