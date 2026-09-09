import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { highlightSchedulePanel, switchCurrentDay, speakText, showToast, appState } from '@/runtime/controller';
export default memo(function WritingPage() { return (<section className="page-view" id="view-writing">
<div className="view-header">
<h2>{"Writing Studio — Quy Trình Viết Lại (Rewrite Rule)"}</h2>
<p>{"Nguyên tắc bắt buộc: Bản nháp 1 (Draft 1) → Nhận phản hồi/Sửa lỗi → "}<strong>{"Bản nháp 2 (Draft 2) viết lại hoàn toàn từ trang trắng"}</strong>{" để kích hoạt khả năng gợi nhớ chủ động."}</p>
</div>
<div className="writing-container">

<div className="glass-card">
<div className="editor-tabs">
<Button variant="unstyled" className="editor-tab-btn active" data-draft="draft1">{"Bản Nháp 1 (Draft 1)"}</Button>
<Button variant="unstyled" className="editor-tab-btn" data-draft="draft2">{"Bản Viết Lại (Draft 2 — Blank Page)"}</Button>
</div>
<textarea id="writing-draft-1" className="writing-textarea" placeholder="Bắt đầu viết bản nháp 1 của bạn tại đây mà không nhìn vào từ điển..."></textarea>
<textarea id="writing-draft-2" className="writing-textarea hidden"  placeholder="Viết lại toàn bộ bài viết từ trang trắng sau khi đã xem góp ý của AI / giáo viên..."></textarea>
<div className="editor-footer">
<div className="word-count-badge" id="writing-word-count">{"0 words"}</div>
<Button variant="unstyled" className="btn-secondary" id="btn-open-writing-diff" onClick={() => window.dispatchEvent(new CustomEvent('open-writing-diff'))}>{"\n                📝 So Sánh Draft 1 & Draft 2 (Diff)\n              "}</Button>
<Button variant="unstyled" className="btn-primary" id="btn-send-to-ai-examiner">{"\n                📋 Gửi Cho ChatGPT Writing Examiner (Copy Prompt)\n              "}</Button>
</div>
</div>

<div>
<div className="glass-card mb-[20px]" >
<h4 className="text-[16px] text-[#fff] mb-[6px]" >{"Đề Bài Đang Chọn:"}</h4>
<p className="text-[13.5px] text-brand-light font-semibold" id="active-writing-prompt-text" >{"\n                Hãy chọn đề bài trong danh sách bên dưới\n              "}</p>
<div className="mt-[12px] p-[12px] rounded-[8px] text-[12.5px] text-muted leading-[1.6] [background:rgba(255,255,255,0.03)]" >{"\n                🎯 "}<strong>{"Mẹo chấm thi Cambridge:"}</strong>{" Sau khi viết nháp 1, bấm nút "}<em>{"\"Gửi Cho ChatGPT Writing Examiner\""}</em>{". Ứng dụng sẽ tự động đóng gói bài của bạn thành một prompt phân tích 5 tiêu chí để ChatGPT chấm điểm và chỉ ra 5 lỗi đắt giá nhất.\n              "}</div>
</div>
<div className="glass-card">
<div className="flex justify-between items-center mb-[12px] flex-wrap gap-[8px]" >
<h4 className="text-[15px] text-[#fff]" >{"Ngân Hàng Đề Viết"}</h4>
<div className="filter-pills">
<Button variant="unstyled" className="filter-pill writing-filter-btn active" data-level="all">{"All"}</Button>
<Button variant="unstyled" className="filter-pill writing-filter-btn" data-level="a1_a2">{"A1-A2"}</Button>
<Button variant="unstyled" className="filter-pill writing-filter-btn" data-level="b1">{"B1"}</Button>
<Button variant="unstyled" className="filter-pill writing-filter-btn" data-level="b2">{"B2"}</Button>
<Button variant="unstyled" className="filter-pill writing-filter-btn" data-level="c1">{"C1"}</Button>
</div>
</div>
<div className="flex flex-col gap-[10px] max-h-[380px] overflow-y-auto pr-[6px]"  id="writing-prompts-container"></div>
</div>
</div>
</div>
</section>); });
