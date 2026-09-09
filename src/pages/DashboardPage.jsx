import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { highlightSchedulePanel, switchCurrentDay, speakText, showToast, appState } from '@/runtime/controller';
import StudyInsights from '@/components/StudyInsights';
export default memo(function DashboardPage() { return (<main className="page-view active" id="view-dashboard">
<div className="view-header">
<h2>{"Bảng Điều Khiển Master C1 Bootcamp"}</h2>
<p>{"Mục tiêu: Đạt năng lực sử dụng tiếng Anh C1 thực thụ qua 120 ngày với 12 giờ tiếp xúc mỗi ngày."}</p>
</div>

<div className="stats-row">
<div className="stat-box">
<span className="stat-label">{"Tiến Độ Lộ Trình"}</span>
<span className="stat-value" id="stat-completed-days">{"0 / 120"}</span>
<span className="stat-desc">{"Ngày đã vượt qua"}</span>
</div>
<div className="stat-box">
<span className="stat-label">{"Tỷ Lệ Hoàn Thành"}</span>
<span className="stat-value" id="stat-percent">{"0%"}</span>
<span className="stat-desc">{"Toàn bộ chiến dịch"}</span>
</div>
<div className="stat-box">
<span className="stat-label">{"Kho Chunks Đã Nạp"}</span>
<span className="stat-value" id="stat-chunks-learned">{"0 Chunks"}</span>
<span className="stat-desc">{"Cụm từ ngữ cảnh"}</span>
</div>
<div className="stat-box">
<span className="stat-label">{"Chuỗi Học Bất Bại"}</span>
<span className="stat-value">{"12h/ngày"}</span>
<span className="stat-desc">{"Chế độ kỷ luật thép"}</span>
</div>
</div>

<div className="glass-card phase-gates-card">
<div className="flex justify-between items-center" >
<h3 className="font-display text-[18px] font-bold text-[#fff]" >{"\n              5 Cột Mốc Rào Cản (Phase Gates Timeline)\n            "}</h3>
<span className="text-[12px] text-dim" >{"Nhấp vào từng gate để xem tiêu chí tối thiểu"}</span>
</div>
<div className="phase-gate-track">
<div className="phase-gate-line">
<div className="phase-gate-fill w-[1%]" id="phase-gate-fill" ></div>
</div>
<div className="phase-gate-nodes" id="phase-gates-container"></div>
</div>
</div>

<div className="dashboard-grid">

<div className="glass-card mission-card">
<div className="mission-header">
<div>
<span className="text-[12px] text-brand-light uppercase font-bold tracking-[1px]" >{"Nhiệm vụ hôm nay"}</span>
<h3 className="mission-title" id="mission-day-title">{"Nhiệm Vụ Trọng Tâm Ngày 1 (A1)"}</h3>
</div>
</div>
<div className="mission-grid">
<div className="mission-item">
<div className="mission-item-tag">{"📖 Ngữ Pháp / Use of English"}</div>
<div className="mission-item-val" id="mission-grammar-val">{"be: affirmative"}</div>
</div>
<div className="mission-item">
<div className="mission-item-tag">{"🗂️ Miền Từ Vựng"}</div>
<div className="mission-item-val" id="mission-vocab-val">{"identity"}</div>
</div>
<div className="mission-item">
<div className="mission-item-tag">{"🎙️ Thực Hành Nói"}</div>
<div className="mission-item-val" id="mission-speaking-val">{"self-introduction and goals"}</div>
</div>
<div className="mission-item">
<div className="mission-item-tag">{"✍️ Thực Hành Viết"}</div>
<div className="mission-item-val" id="mission-writing-val">{"Write a short personal profile (60-80w)."}</div>
</div>
</div>
<div className="mission-action-bar">
<Button variant="unstyled" className="btn-primary" onClick={() => {document.querySelector('[data-target=lessons]').click();}}>{"\n                🚀 Mở Bài Học Hôm Nay\n              "}</Button>
<Button variant="unstyled" className="btn-secondary" onClick={() => {document.querySelector('[data-target=schedule]').click();}}>{"\n                ⏱️ Bắt Đầu Hẹn Giờ 90 Phút\n              "}</Button>
</div>
</div>

<div className="glass-card">
<div className="flex justify-between items-center mb-[16px]" >
<h3 className="font-display text-[17px] font-bold text-[#fff]" >{"\n                🎯 6 Chỉ Tiêu KPI Hôm Nay\n              "}</h3>
<span className="text-[11px] text-accent-green font-bold uppercase" >{"Non-negotiable"}</span>
</div>
<div className="kpi-checklist" id="daily-kpi-container"></div>
<p className="text-[12px] text-dim mt-[14px] leading-[1.5]" >{"\n              💡 "}<em>{"Hoàn thành cả 6 mục này mỗi ngày để duy trì chuỗi học và tự động mở khóa ngày tiếp theo."}</em>
</p>
</div>
</div>
<StudyInsights /></main>); });
