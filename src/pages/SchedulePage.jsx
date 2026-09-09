import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { highlightSchedulePanel, switchCurrentDay, speakText, showToast, appState } from '@/runtime/controller';
export default memo(function SchedulePage() { return (<section className="page-view" id="view-schedule">
<div className="view-header">
<h2>{"Hệ Thống 5 Protocols & Quy Trình Học Chuyên Sâu C1 Bootcamp"}</h2>
<p>{"Tập trung vào chất lượng thực thi của 12 giờ học mỗi ngày: Listening 7 bước, Reading 5 bước, Speaking 7 bước, Writing 6 bước và Quy tắc chống kiệt sức não bộ (Cognitive Fatigue Protocol)."}</p>
</div>
<div className="glass-card mb-[24px]" >
<div className="flex justify-between items-center flex-wrap gap-[12px] mb-[16px]" >
<div>
<h3 className="font-display text-[18px] text-[#fff]" >{"\n                Quy Trình Chuẩn Hóa Từng Kỹ Năng (Protocols Master)\n              "}</h3>
<p className="text-[13px] text-dim mt-[2px]" >{"\n                Chọn từng quy trình bên dưới để xem hướng dẫn thực hiện chi tiết từng bước. Đồng hồ học và thời khóa biểu 12H đang chạy thường trực ở cột bên phải.\n              "}</p>
</div>
<Button variant="unstyled" className="btn-primary" onClick={() => {highlightSchedulePanel();}}>{"\n              ⏱️ Xem Đồng Hồ & Lịch Cột Phải\n            "}</Button>
</div>
<div className="protocol-card p-0 [border:none] [background:transparent]" >
<div className="protocol-tabs">
<Button variant="unstyled" className="protocol-tab-btn active" data-protocol="listening">{"Listening (7 bước)"}</Button>
<Button variant="unstyled" className="protocol-tab-btn" data-protocol="reading">{"Reading (5 bước)"}</Button>
<Button variant="unstyled" className="protocol-tab-btn" data-protocol="speaking">{"Speaking (7 bước)"}</Button>
<Button variant="unstyled" className="protocol-tab-btn" data-protocol="writing">{"Writing (6 bước)"}</Button>
<Button variant="unstyled" className="protocol-tab-btn" data-protocol="fatigue">{"Quy tắc kiệt sức"}</Button>
</div>
<h4 className="text-[#fff] mb-[12px] text-[16px] mt-[16px]" id="protocol-active-title" >{"Intensive Listening Protocol (90 min)"}</h4>
<div className="protocol-steps-list" id="protocol-steps-container"></div>
</div>
</div>

<div className="dashboard-grid">
<div className="glass-card">
<h3 className="font-display text-[17px] text-[#fff] mb-[12px]" >{"\n              🧠 Kiến Trúc Phân Bổ Năng Lượng Não Bộ 12 Giờ\n            "}</h3>
<ul className="list-none flex flex-col gap-[10px] text-[13.5px] text-muted" >
<li className="flex gap-[10px]" >
<span className="mode-tag deep self-start" >{"DEEP FOCUS"}</span>
<span><strong>{"7–8 Giờ Chuyên Sâu:"}</strong>{" Ngữ pháp, Listening phân tích, Reading đào sâu, Speaking ghi âm và Writing 2 bản nháp. Tắt hoàn toàn điện thoại và mạng xã hội."}</span>
</li>
<li className="flex gap-[10px]" >
<span className="mode-tag medium self-start" >{"MEDIUM"}</span>
<span><strong>{"2–3 Giờ Trung Bình:"}</strong>{" Nghe podcast thụ động, đọc mở rộng báo chí, xem video tiếng Anh có phụ đề. Não bộ ở trạng thái tiếp nhận tự nhiên."}</span>
</li>
<li className="flex gap-[10px]" >
<span className="mode-tag light self-start" >{"LIGHT"}</span>
<span><strong>{"1–2 Giờ Nhẹ Nhàng:"}</strong>{" Lướt thẻ flashcards SRS ôn từ vựng ngắt quãng, xem show giải trí Anh ngữ trước khi ngủ."}</span>
</li>
</ul>
</div>
<div className="glass-card">
<h3 className="font-display text-[17px] text-[#fff] mb-[12px]" >{"\n              🛡️ 3 Nguyên Tắc Kỷ Luật Thép C1 Bootcamp\n            "}</h3>
<ul className="list-none flex flex-col gap-[12px] text-[13px] text-muted" >
<li className="py-[10px] px-[14px] rounded-[6px] [background:rgba(239,68,68,0.08)] [border-left:3px_solid_var(--accent-rose)]" >
<strong className="text-[#fff]" >{"1. Quy tắc Viết Lại (Rewrite Rule):"}</strong>{" Bản nháp 1 bắt buộc phải được AI sửa lỗi, và BẮT BUỘC viết lại Bản nháp 2 từ trang giấy trắng mà không nhìn bản cũ.\n              "}</li>
<li className="py-[10px] px-[14px] rounded-[6px] [background:rgba(245,158,11,0.08)] [border-left:3px_solid_var(--accent-amber)]" >
<strong className="text-[#fff]" >{"2. Quy tắc 2 Lần Thu Âm (Take 1 vs Take 2):"}</strong>{" Nói tự nhiên không chuẩn bị trước (Take 1) -> Tự nghe lại ghi chép lỗi -> Thu âm lần 2 hoàn chỉnh (Take 2).\n              "}</li>
<li className="py-[10px] px-[14px] rounded-[6px] [background:rgba(16,185,129,0.08)] [border-left:3px_solid_var(--accent-green)]" >
<strong className="text-[#fff]" >{"3. Giấc Ngủ Phục Hồi (7.5–9 Tiếng):"}</strong>{" Tuyệt đối không cắt bớt giờ ngủ để học. Giấc ngủ REM là nơi não bộ hợp nhất toàn bộ từ vựng và cấu trúc C1 vào bộ nhớ dài hạn.\n              "}</li>
</ul>
</div>
</div>
</section>); });
