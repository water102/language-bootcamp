import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { highlightSchedulePanel, switchCurrentDay, speakText, showToast, appState } from '@/runtime/controller';
export default memo(function PronunciationPage() { return (<section className="page-view" id="view-pronunciation">
<div className="view-header">
<h2>{"Kế Hoạch Luyện Phát Âm & Cơ Học Nghe Hiểu (Pronunciation Mechanics)"}</h2>
<p>{"Phát âm được rèn luyện để tăng độ rõ ràng (intelligibility) và phục vụ cho khả năng nghe hiểu, không phải bắt chước chất giọng giả tạo."}</p>
</div>
<div className="glass-card mb-[24px]" >
<h2>{"Bảng 44 âm IPA tiếng Anh"}</h2>
<p className="ipa-note">{"Chọn một âm để mở bài luyện chi tiết. Bảng theo quy ước Anh–Anh truyền thống: 12 nguyên âm đơn, 8 nguyên âm đôi và 24 phụ âm; cách phát âm có thể khác theo giọng. Đây là bảng âm tiếng Anh, không phải toàn bộ ký hiệu IPA của mọi ngôn ngữ."}</p>
<p className="ipa-note">{"Đánh dấu sau khi luyện xong; có thể bỏ đánh dấu để học lại. Tiến độ lưu trên trình duyệt này và nằm trong bản sao lưu dữ liệu của ứng dụng."}</p>
<div id="ipa-course"></div>
</div>
<dialog id="ipa-lesson" aria-labelledby="ipa-lesson-title">
<div className="ipa-dialog-top"><Button variant="unstyled" type="button" className="btn-secondary" data-close="" autoFocus>{"Đóng ✕"}</Button></div>
<div className="ipa-lesson-body"></div>
</dialog>
<div className="pronunciation-reference-grid grid grid-cols-[1fr_1.5fr] gap-[24px]" >
<div className="glass-card">
<h3 className="font-display text-[18px] text-[#fff] mb-[14px]" >{"\n              ⏱️ 15 Phút Khởi Động Hàng Ngày\n            "}</h3>
<div className="flex flex-col gap-[12px]" >
<div className="p-[12px] rounded-[8px] [background:rgba(255,255,255,0.03)]" >
<strong className="text-brand-light" >{"3 phút — Khởi động cơ miệng:"}</strong>
<p className="text-[13px] text-muted mt-[2px]" >{"Luyện các âm dễ nuốt hoặc sai: /θ/, /ð/, /ʃ/, /tʃ/, âm đuôi -ed và phụ âm cuối."}</p>
</div>
<div className="p-[12px] rounded-[8px] [background:rgba(255,255,255,0.03)]" >
<strong className="text-accent-amber" >{"4 phút — Trọng âm từ:"}</strong>
<p className="text-[13px] text-muted mt-[2px]" >{"Nói to 10 từ mục tiêu nhiều âm tiết, nhấn đúng trọng âm chính."}</p>
</div>
<div className="p-[12px] rounded-[8px] [background:rgba(255,255,255,0.03)]" >
<strong className="text-accent-cyan" >{"4 phút — Nhịp điệu câu (Rhythm):"}</strong>
<p className="text-[13px] text-muted mt-[2px]" >{"Shadow 4-6 câu theo phách: từ mang thông tin (content words) nhấn mạnh, từ chức năng giảm âm (schwa /ə/)."}</p>
</div>
<div className="p-[12px] rounded-[8px] [background:rgba(255,255,255,0.03)]" >
<strong className="text-accent-green" >{"4 phút — Nối âm & nuốt âm:"}</strong>
<p className="text-[13px] text-muted mt-[2px]" >{"Lặp lại một câu tự nhiên tốc độ nhanh 10 lần liên tục."}</p>
</div>
</div>
</div>
<div className="glass-card">
<h3 className="font-display text-[18px] text-[#fff] mb-[14px]" >{"\n              Bản Đồ Cặp Âm Tối Thiểu (Minimal Pairs & Contrasts)\n            "}</h3>
<div className="pronunciation-reference-grid grid grid-cols-[repeat(auto-fill,_minmax(220px,_1fr))] gap-[12px]" >
<div className="p-[12px] rounded-[8px] [background:rgba(255,255,255,0.02)] [border:1px_solid_var(--border-subtle)]" >
<strong className="text-[#fff]" >{"/ɪ/ vs /i:/"}</strong>
<p className="text-[13px] text-dim mt-[2px]" >{"ship / sheep, live / leave, fit / feet"}</p>
<Button variant="unstyled" className="btn-secondary py-[4px] px-[10px] text-[11px] mt-[6px]"  onClick={() => {speakText('ship sheep live leave fit feet')}}>{"🔊 Nghe"}</Button>
</div>
<div className="p-[12px] rounded-[8px] [background:rgba(255,255,255,0.02)] [border:1px_solid_var(--border-subtle)]" >
<strong className="text-[#fff]" >{"/s/ vs /ʃ/"}</strong>
<p className="text-[13px] text-dim mt-[2px]" >{"see / she, seat / sheet, sock / shock"}</p>
<Button variant="unstyled" className="btn-secondary py-[4px] px-[10px] text-[11px] mt-[6px]"  onClick={() => {speakText('see she seat sheet sock shock')}}>{"🔊 Nghe"}</Button>
</div>
<div className="p-[12px] rounded-[8px] [background:rgba(255,255,255,0.02)] [border:1px_solid_var(--border-subtle)]" >
<strong className="text-[#fff]" >{"/θ/ vs /ð/"}</strong>
<p className="text-[13px] text-dim mt-[2px]" >{"think / this, three / there, breath / breathe"}</p>
<Button variant="unstyled" className="btn-secondary py-[4px] px-[10px] text-[11px] mt-[6px]"  onClick={() => {speakText('think this three there breath breathe')}}>{"🔊 Nghe"}</Button>
</div>
<div className="p-[12px] rounded-[8px] [background:rgba(255,255,255,0.02)] [border:1px_solid_var(--border-subtle)]" >
<strong className="text-[#fff]" >{"-ed Endings (/t/, /d/, /ɪd/)"}</strong>
<p className="text-[13px] text-dim mt-[2px]" >{"worked /t/, lived /d/, wanted /ɪd/"}</p>
<Button variant="unstyled" className="btn-secondary py-[4px] px-[10px] text-[11px] mt-[6px]"  onClick={() => {speakText('worked lived wanted')}}>{"🔊 Nghe"}</Button>
</div>
</div>
</div>
</div>
</section>); });
