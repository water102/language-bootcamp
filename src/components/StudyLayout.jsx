import { memo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { highlightSchedulePanel, switchCurrentDay, speakText, showToast, appState, renderScheduleList, renderTimelineBarTrack, updateTimelineTick, renderGrammarTable } from '@/runtime/controller';
import GoalPlannerModal from '@/components/planner/GoalPlannerModal';
import AiBridgeModal from '@/components/ai/AiBridgeModal';
import StudyRoomModal from '@/components/social/StudyRoomModal';
import ChibiCompanionWidget from '@/components/companion/ChibiCompanionWidget';
import ShareModal from '@/components/sharing/ShareModal';
import ScheduleEditorModal from '@/components/schedule/ScheduleEditorModal';
import GrammarLessonModal from '@/components/grammar/GrammarLessonModal';
import WritingDiffModal from '@/components/writing/WritingDiffModal';
import SrsScheduleModal from '@/components/srs/SrsScheduleModal';
import WeeklyReportModal from '@/components/report/WeeklyReportModal';
import DashboardPage from '@/pages/DashboardPage';
import RoadmapPage from '@/pages/RoadmapPage';
import SchedulePage from '@/pages/SchedulePage';
import LessonsPage from '@/pages/LessonsPage';
import SpeakingPage from '@/pages/SpeakingPage';
import WritingPage from '@/pages/WritingPage';
import FlashcardsPage from '@/pages/FlashcardsPage';
import GrammarPage from '@/pages/GrammarPage';
import PronunciationPage from '@/pages/PronunciationPage';
import AssessmentPage from '@/pages/AssessmentPage';
import AiTutorPage from '@/pages/AiTutorPage';
import ErrorLogPage from '@/pages/ErrorLogPage';

export default memo(function StudyLayout() {
  const [showGoalPlanner, setShowGoalPlanner] = useState(false);
  const [showAiBridge, setShowAiBridge] = useState(false);
  const [showStudyRoom, setShowStudyRoom] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showScheduleEditor, setShowScheduleEditor] = useState(false);
  const [showWritingDiff, setShowWritingDiff] = useState(false);
  const [showSrsSchedule, setShowSrsSchedule] = useState(false);
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);
  const [showGrammarModal, setShowGrammarModal] = useState(false);
  const [selectedGrammar, setSelectedGrammar] = useState(null);

  useEffect(() => {
    const handleOpenScheduleEditor = () => setShowScheduleEditor(true);
    const handleOpenWritingDiff = () => setShowWritingDiff(true);
    const handleOpenSrsSchedule = () => setShowSrsSchedule(true);
    const handleOpenWeeklyReport = () => setShowWeeklyReport(true);
    const handleOpenGrammarLesson = (e) => {
      if (e.detail) {
        setSelectedGrammar(e.detail);
        setShowGrammarModal(true);
      }
    };

    window.addEventListener('open-schedule-editor', handleOpenScheduleEditor);
    window.addEventListener('open-writing-diff', handleOpenWritingDiff);
    window.addEventListener('open-srs-schedule', handleOpenSrsSchedule);
    window.addEventListener('open-weekly-report', handleOpenWeeklyReport);
    window.addEventListener('open-grammar-lesson', handleOpenGrammarLesson);

    return () => {
      window.removeEventListener('open-schedule-editor', handleOpenScheduleEditor);
      window.removeEventListener('open-writing-diff', handleOpenWritingDiff);
      window.removeEventListener('open-srs-schedule', handleOpenSrsSchedule);
      window.removeEventListener('open-weekly-report', handleOpenWeeklyReport);
      window.removeEventListener('open-grammar-lesson', handleOpenGrammarLesson);
    };
  }, []);
  return (<>
<div className="app-container">

<aside className="sidebar" id="sidebar">
<div className="brand-section">
<div className="brand-icon" title="English C1 Bootcamp">{"C1"}</div>
<div className="brand-text">
<h1>{"C1 Bootcamp"}</h1>
<p>{"120 Days • 12H System"}</p>
</div>
<Button variant="unstyled" className="sidebar-toggle-btn" id="sidebar-toggle-btn" title="Thu gọn / Mở rộng thanh điều hướng">
<svg className="icon-collapse" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
</Button>
</div>
<div className="sidebar-nav-body">
<div className="nav-group-title">{"Tổng quan"}</div>
<ul className="nav-links">
<li className="nav-link active" data-target="dashboard" data-title="Dashboard">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
<span>{"Dashboard"}</span>
</li>
<li className="nav-link" data-target="roadmap" data-title="Lộ Trình 120 Ngày">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
<span>{"Lộ Trình 120 Ngày"}</span>
<span className="nav-badge">{"120"}</span>
</li>
<li className="nav-link" data-target="schedule" data-title="Quy Trình & Protocols">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
<span>{"Quy Trình & Protocols"}</span>
</li>
</ul>
<div className="nav-group-title">{"Thực hành kỹ năng"}</div>
<ul className="nav-links">
<li className="nav-link" data-target="lessons" data-title="Starter Pack (Tuần 1)">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
<span>{"Starter Pack (Tuần 1)"}</span>
</li>
<li className="nav-link" data-target="speaking" data-title="Phòng Thu Speaking">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
<span>{"Phòng Thu Speaking"}</span>
</li>
<li className="nav-link" data-target="writing" data-title="Writing Studio">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
<span>{"Writing Studio"}</span>
</li>
<li className="nav-link" data-target="flashcards" data-title="Flashcards SRS Chunks">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="M7 15h10M7 9h2"></path></svg>
<span>{"Flashcards SRS Chunks"}</span>
</li>
<li className="nav-link" data-target="grammar" data-title="Ma Trận Ngữ Pháp">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
<span>{"Ma Trận Ngữ Pháp"}</span>
</li>
<li className="nav-link" data-target="pronunciation" data-title="Phát Âm & IPA">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
<span>{"Phát Âm & IPA"}</span>
</li>
</ul>
<div className="nav-group-title">{"Đánh giá & Công cụ"}</div>
<ul className="nav-links">
<li className="nav-link" data-target="ai-tutor" data-title="Trạm Prompts AI Tutor">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
<span>{"Trạm Prompts AI Tutor"}</span>
</li>
<li className="nav-link" data-target="assessment" data-title="Day 0 & Test Rubric">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
<span>{"Day 0 & Test Rubric"}</span>
</li>
<li className="nav-link" data-target="error-log" data-title="Sổ Lỗi Vàng & Backup">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
<span>{"Sổ Lỗi Vàng & Backup"}</span>
</li>
</ul>
<div className="sidebar-footer">
<div className="current-day-badge">
<span>{"TIẾN ĐỘ"}</span>
<span id="sidebar-day-number">{"Day 1/120"}</span>
</div>
</div>
</div>

</aside>

<div className="main-wrapper">

<header className="top-header">
<div className="header-left">
<Button variant="unstyled" className="mobile-menu-btn" id="mobile-menu-btn" title="Mở menu">
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
</Button>
<div className="header-title-badge">
<h2 id="header-day-display">{"Day 1: be: affirmative"}</h2>
<span className="cefr-tag a1" id="header-cefr-tag">{"A1"}</span>
</div>
</div>
<div className="header-right">
<div className="streak-pill">
<span>{"🔥"}</span>
<span id="stat-streak">{"1 Days"}</span>
</div>
<div className="quick-day-select">
<label htmlFor="quick-day-select">{"Ngày:"}</label>
<select id="quick-day-select"></select>
</div>
<Button variant="unstyled" className="header-action-btn" id="open-goal-planner-btn" title="Thiết Lập Mục Tiêu & Kế Hoạch CEFR (Adaptive Planner)" onClick={() => setShowGoalPlanner(true)}>
<span>{"🎯"}</span>
<span className="btn-text">{"Kế Hoạch CEFR"}</span>
</Button>
<Button variant="unstyled" className="header-action-btn" id="open-ai-bridge-btn" title="Cầu Nối AI (AI Bridge Fixed Slots)" onClick={() => setShowAiBridge(true)}>
<span>{"🤖"}</span>
<span className="btn-text">{"AI Bridge"}</span>
</Button>
<Button variant="unstyled" className="header-action-btn" id="open-study-room-btn" title="Phòng Học Nhóm P2P (Firebase Signaling & WebRTC DataChannel)" onClick={() => setShowStudyRoom(true)}>
<span>{"👥"}</span>
<span className="btn-text">{"Phòng P2P"}</span>
</Button>
<Button variant="unstyled" className="header-action-btn" id="open-share-modal-btn" title="Chia Sẻ Thành Tựu & Thẻ Tiến Độ (Milestone Cards & Web Share)" onClick={() => setShowShareModal(true)}>
<span>{"🌟"}</span>
<span className="btn-text">{"Chia Sẻ"}</span>
</Button>
<Button variant="unstyled" className="header-action-btn" id="open-schedule-editor-btn" title="Chỉnh sửa lịch học & Đổi lộ trình B1->C1 8H" onClick={() => setShowScheduleEditor(true)}>
<span>{"✏️"}</span>
<span className="btn-text">{"Sửa Lịch"}</span>
</Button>
<Button variant="unstyled" className="header-action-btn" id="open-writing-diff-btn" title="So sánh bản viết Draft 1 vs Draft 2 Rewrite Diff" onClick={() => setShowWritingDiff(true)}>
<span>{"📝"}</span>
<span className="btn-text">{"So Sánh Viết"}</span>
</Button>
<Button variant="unstyled" className="header-action-btn" id="open-srs-schedule-btn" title="Lịch ôn tập Flashcards SRS & Phân phối Leitner" onClick={() => setShowSrsSchedule(true)}>
<span>{"🗂️"}</span>
<span className="btn-text">{"Lịch SRS"}</span>
</Button>
<Button variant="unstyled" className="header-action-btn" id="open-weekly-report-btn" title="Báo Cáo Tiến Độ Tuần (Weekly Review Analytics)" onClick={() => setShowWeeklyReport(true)}>
<span>{"📊"}</span>
<span className="btn-text">{"Báo Cáo"}</span>
</Button>
<Button variant="unstyled" className="header-action-btn" id="toggle-schedule-panel-btn" title="Ẩn/Hiện Lịch 12H & Timers bên phải">
<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
<span className="btn-text">{"Lịch 12H & Timers"}</span>
</Button>
</div>
</header>



<div className="global-timeline-strip" id="global-timeline-strip">
<div className="global-timeline-header">
<div className="gt-header-left">
<span className="live-pulse-dot"></span>
<span className="gt-title" id="global-timeline-title">{"Tiến Trình 12 Giờ Trong Ngày"}</span>
<span className="timeline-active-tag deep" id="timeline-active-tag">{"⚡ Khối 5: Speaking + pronunciation"}</span>
<Button variant="unstyled" className="icon-tool-btn text-[12px] px-2.5 py-1 bg-[rgba(255,255,255,0.08)] rounded hover:bg-[rgba(255,255,255,0.15)] text-[#cbd5e1] flex items-center gap-1 ml-2 transition" id="timeline-edit-schedule-btn" title="Chỉnh sửa lịch học (Kéo thả, đổi giờ, B1->C1 8H)" onClick={() => setShowScheduleEditor(true)}>
<span>{"✏️ Sửa lịch"}</span>
</Button>
</div>
<div className="gt-header-right">
<div className="timeline-legend-inline">
<span className="legend-item"><span className="legend-dot deep"></span>{"Deep (7–8h)"}</span>
<span className="legend-item"><span className="legend-dot medium"></span>{"Medium (2–3h)"}</span>
<span className="legend-item"><span className="legend-dot light"></span>{"Light (1–2h)"}</span>
<span className="legend-item"><span className="legend-dot break"></span>{"Nghỉ & Ăn"}</span>
</div>
</div>
</div>
<div className="global-timeline-body">
<div className="timeline-track-container">
<div className="timeline-bar-track full-width" id="daily-timeline-bar-track">

<div className="timeline-needle left-[0%]" id="timeline-live-needle" >
<div className="needle-flag" id="needle-flag-text">{"00:00"}</div>
<div className="needle-line"></div>
</div>
</div>
</div>
<div className="timeline-time-ruler">
<span>{"07:00"}</span>
<span>{"09:00"}</span>
<span>{"11:00"}</span>
<span>{"13:00"}</span>
<span>{"15:00"}</span>
<span>{"17:00"}</span>
<span>{"19:00"}</span>
<span>{"21:00"}</span>
<span>{"23:00"}</span>
</div>
</div>
</div>



<DashboardPage />



<RoadmapPage />



<SchedulePage />



<LessonsPage />



<SpeakingPage />



<WritingPage />



<FlashcardsPage />



<GrammarPage />



<PronunciationPage />



<AssessmentPage />



<AiTutorPage />



<ErrorLogPage />
</div>



<aside className="schedule-sidebar" id="schedule-sidebar">

<div className="schedule-sidebar-header">
<div className="sidebar-header-title">
<span className="live-pulse-dot"></span>
<h3>{"Lịch 12H & Timers"}</h3>
</div>
<div className="sidebar-header-actions">
<Button variant="unstyled" className="icon-tool-btn active" id="toggle-sound-alerts-btn" title="Bật/Tắt chuông báo âm thanh">
<span>{"🔊"}</span>
</Button>
<Button variant="unstyled" className="icon-tool-btn" id="toggle-desktop-notif-btn" title="Bật/Tắt thông báo Desktop">
<span>{"🔔"}</span>
</Button>
<Button variant="unstyled" className="icon-tool-btn test-bell" id="test-alert-btn" title="Thử chuông ngay lập tức">
<span>{"⚡"}</span>
</Button>
<Button variant="unstyled" className="icon-tool-btn dock-toggle-btn" id="close-schedule-panel-btn" title="Thu gọn / Ẩn cột này">
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
</Button>
</div>
</div>

<div className="schedule-sidebar-body">

<div className="sidebar-clock-card">
<div className="clock-display-row">
<div className="live-clock-text" id="live-clock-time">{"00:00:00"}</div>
<span className="status-indicator-pill active" id="current-status-badge">{"ĐANG TRONG KHỐI"}</span>
</div>
<div className="clock-sub-row">
<span className="mode-tag deep" id="current-mode-badge">{"DEEP FOCUS"}</span>
<span className="next-block-text" id="next-block-preview-text">{"⏭️ Đang tải khối kế..."}</span>
</div>
</div>

<div className="sidebar-active-block-card">
<div className="countdown-header-row">
<span className="countdown-label-mini" id="countdown-label-text">{"Thời gian còn lại trong khối:"}</span>
<div className="countdown-digits-compact" id="live-countdown-digits">{"00:00:00"}</div>
</div>
<div className="block-progress-track">
<div className="block-progress-fill w-[0%]" id="live-block-progress-fill" ></div>
</div>
<div className="progress-meta-row">
<span id="block-start-time-lbl">{"07:00"}</span>
<span id="block-percent-lbl">{"0%"}</span>
<span id="block-end-time-lbl">{"08:30"}</span>
</div>
<div className="current-block-info">
<h4 className="block-name-title" id="current-block-name">{"Đang xác định khối học..."}</h4>
<p className="block-output-desc" id="current-block-output">{"🎯 Mục tiêu đầu ra..."}</p>
</div>
<Button variant="unstyled" className="btn-primary jump-tool-btn" id="btn-jump-to-current-tool">{"\n            🚀 Mở Nhanh Công Cụ Này\n          "}</Button>
</div>

<div className="sidebar-timer-card">
<div className="timer-card-title">
<h4>{"⏱️ Đồng Hồ Tập Trung (Focus Timer)"}</h4>
</div>
<div className="timer-mode-selector">
<Button variant="unstyled" className="timer-mode-btn active" data-mode="deep">{"90m Deep"}</Button>
<Button variant="unstyled" className="timer-mode-btn" data-mode="pomo">{"25m Pomo"}</Button>
<Button variant="unstyled" className="timer-mode-btn" data-mode="break">{"5m Nghỉ"}</Button>
<Button variant="unstyled" className="timer-mode-btn" data-mode="stopwatch">{"Bấm giờ"}</Button>
</div>
<div className="timer-dial-compact" id="timer-dial-ring">
<div className="timer-time-display-compact" id="timer-time-text">{"90:00"}</div>
<div className="timer-label-compact">{"Deep Focus Mode"}</div>
</div>
<div className="timer-controls-row">
<Button variant="unstyled" className="btn-primary timer-action-btn" id="timer-start-btn">
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
<span>{"Bắt đầu"}</span>
</Button>
<Button variant="unstyled" className="btn-secondary timer-action-btn" id="timer-reset-btn">
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
<span>{"Đặt lại"}</span>
</Button>
</div>
</div>

<div className="sidebar-schedule-section">
<div className="schedule-section-header">
<div className="flex items-center justify-between w-full">
<h4 id="sidebar-schedule-title">{"📅 9 Khung Giờ Trong Ngày"}</h4>
<Button variant="unstyled" className="icon-tool-btn text-[12px] px-2 py-0.5 bg-[rgba(255,255,255,0.08)] rounded hover:bg-[rgba(255,255,255,0.15)] text-[#cbd5e1]" id="sidebar-edit-schedule-btn" title="Chỉnh sửa lịch trong ngày (Kéo, thả, sửa giờ, B1->C1 8H)" onClick={() => setShowScheduleEditor(true)}>
<span>{"✏️ Sửa lịch"}</span>
</Button>
</div>
<span className="schedule-hint" id="sidebar-schedule-hint">{"07:00–22:30"}</span>
</div>
<div className="schedule-blocks compact-list" id="schedule-list-container"></div>
</div>

<div className="sidebar-protocols-box">
<Button variant="unstyled" className="btn-secondary protocols-shortcut-btn" id="open-protocols-modal-btn">{"\n            📋 Xem 5 Protocols Quy Trình Học Chuẩn\n          "}</Button>
</div>
</div>
</aside>
</div>

<div className="modal-overlay hidden" id="lan-share-modal" >
<div className="modal-container lan-modal-box">
<div className="modal-header">
<div className="modal-title-group">
<span className="modal-icon">{"📱"}</span>
<div>
<h3>{"Học Trên Điện Thoại & Thiết Bị LAN"}</h3>
<p className="modal-subtitle">{"Quét mã QR để mở trạm học trên iPhone, iPad, Android hoặc máy tính khác trong cùng Wi-Fi"}</p>
</div>
</div>
<Button variant="unstyled" className="modal-close-btn" id="close-lan-modal">{"×"}</Button>
</div>
<div className="modal-body">
<div className="lan-content-grid">
<div className="lan-qr-wrapper">
<div className="lan-qr-card" id="lan-qr-card">
<img id="lan-qr-image" alt="Mã QR truy cập LAN" />
</div>
<p className="lan-qr-caption">{"📷 Dùng Camera điện thoại quét mã này"}</p>
</div>
<div className="lan-info-panel">
<div className="lan-input-group">
<label htmlFor="lan-url-input">{"Đường dẫn trong mạng nội bộ (LAN):"}</label>
<div className="lan-url-box">
<input type="text" id="lan-url-input" readOnly defaultValue="http://192.168.101.169:8080/" />
<Button variant="unstyled" className="btn btn-primary" id="btn-copy-lan-url">
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
<span>{"Sao chép"}</span>
</Button>
</div>
</div>
<div className="lan-guide-card">
<h4>{"📌 3 Bước kết nối nhanh trên điện thoại:"}</h4>
<ol>
<li>{"Đảm bảo điện thoại kết nối "}<strong>{"chung mạng Wi-Fi"}</strong>{" với máy tính này."}</li>
<li>{"Mở camera điện thoại quét mã QR hoặc gõ địa chỉ trên vào Safari / Chrome."}</li>
<li>{"Bấm "}<strong>{"Chia sẻ → \"Thêm vào Màn hình chính\" (Add to Home Screen)"}</strong>{" để dùng tràn viền như App gốc!"}</li>
</ol>
</div>
<div className="lan-status-box">
<span className="status-dot-pulse"></span>
<span>{"Máy chủ đang phục vụ tại IP: "}<strong>{"192.168.101.169"}</strong>{" • Cổng "}<strong>{"8080"}</strong></span>
</div>
</div>
</div>
</div>
</div>
</div>




<GoalPlannerModal isOpen={showGoalPlanner} onClose={() => setShowGoalPlanner(false)} />
<AiBridgeModal isOpen={showAiBridge} onClose={() => setShowAiBridge(false)} />
<StudyRoomModal isOpen={showStudyRoom} onClose={() => setShowStudyRoom(false)} />
{showShareModal && <ShareModal onClose={() => setShowShareModal(false)} />}
<ScheduleEditorModal isOpen={showScheduleEditor} onClose={() => setShowScheduleEditor(false)} onScheduleUpdated={() => { renderScheduleList(); renderTimelineBarTrack(); updateTimelineTick(); }} />
<GrammarLessonModal
  isOpen={showGrammarModal}
  grammarItem={selectedGrammar}
  onClose={() => setShowGrammarModal(false)}
  onMasterySaved={() => {
    const activeFilter = document.querySelector('.grammar-filter-btn.active')?.getAttribute('data-level') || 'all';
    renderGrammarTable(activeFilter);
  }}
/>
<WritingDiffModal isOpen={showWritingDiff} onClose={() => setShowWritingDiff(false)} />
<SrsScheduleModal isOpen={showSrsSchedule} onClose={() => setShowSrsSchedule(false)} />
<WeeklyReportModal isOpen={showWeeklyReport} onClose={() => setShowWeeklyReport(false)} />
<ChibiCompanionWidget />
</>); });
