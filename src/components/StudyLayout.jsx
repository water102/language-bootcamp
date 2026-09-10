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
import ImportLessonModal from '@/components/lessons/ImportLessonModal';
import CloudLibraryModal from '@/components/lessons/CloudLibraryModal';
import TimelineStrip from '@/components/timeline/TimelineStrip';
import ScheduleSidebar from '@/components/schedule/ScheduleSidebar';
import LanShareModal from '@/components/sharing/LanShareModal';
import DashboardPage from '@/pages/DashboardPage';
import RoadmapPage from '@/pages/RoadmapPage';
import SchedulePage from '@/pages/SchedulePage';
import LessonsPage from '@/pages/LessonsPage';
import ContentHubPage from '@/pages/ContentHubPage';
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
  const [showImportLesson, setShowImportLesson] = useState(false);
  const [importLessonDay, setImportLessonDay] = useState(1);
  const [showCloudLibrary, setShowCloudLibrary] = useState(false);
  const [showLanShareModal, setShowLanShareModal] = useState(false);

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
    const handleOpenCloudLibrary = () => setShowCloudLibrary(true);
    const handleOpenLanShare = () => setShowLanShareModal(true);
    const handleOpenImportLesson = (e) => {
      if (e.detail && e.detail.day) {
        setImportLessonDay(Number(e.detail.day));
      } else {
        setImportLessonDay(appState.currentDay || 1);
      }
      setShowImportLesson(true);
    };

    window.addEventListener('open-schedule-editor', handleOpenScheduleEditor);
    window.addEventListener('open-writing-diff', handleOpenWritingDiff);
    window.addEventListener('open-srs-schedule', handleOpenSrsSchedule);
    window.addEventListener('open-weekly-report', handleOpenWeeklyReport);
    window.addEventListener('open-grammar-lesson', handleOpenGrammarLesson);
    window.addEventListener('open-import-lesson-modal', handleOpenImportLesson);
    window.addEventListener('open-cloud-library-modal', handleOpenCloudLibrary);
    window.addEventListener('open-lan-share', handleOpenLanShare);

    return () => {
      window.removeEventListener('open-schedule-editor', handleOpenScheduleEditor);
      window.removeEventListener('open-writing-diff', handleOpenWritingDiff);
      window.removeEventListener('open-srs-schedule', handleOpenSrsSchedule);
      window.removeEventListener('open-weekly-report', handleOpenWeeklyReport);
      window.removeEventListener('open-grammar-lesson', handleOpenGrammarLesson);
      window.removeEventListener('open-import-lesson-modal', handleOpenImportLesson);
      window.removeEventListener('open-cloud-library-modal', handleOpenCloudLibrary);
      window.removeEventListener('open-lan-share', handleOpenLanShare);
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
<li className="nav-link" data-target="content-hub" data-title="Kho Tài Nguyên & Luyện Tập">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
<span>{"Kho Tài Nguyên & Luyện Tập"}</span>
<span className="nav-badge">{"PACK"}</span>
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
<Button variant="unstyled" className="header-action-btn" id="btn-lan-share" title="Học trên điện thoại & thiết bị LAN (QR Code)" onClick={() => setShowLanShareModal(true)}>
<span>{"📱"}</span>
<span className="btn-text">{"Học Mobile"}</span>
</Button>
<Button variant="unstyled" className="header-action-btn" id="toggle-schedule-panel-btn" title="Ẩn/Hiện Lịch 12H & Timers bên phải" onClick={() => document.body.classList.toggle('schedule-collapsed')}>
<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
<span className="btn-text">{"Lịch 12H & Timers"}</span>
</Button>
</div>
</header>

<TimelineStrip onOpenScheduleEditor={() => setShowScheduleEditor(true)} />



<DashboardPage />



<RoadmapPage />



<SchedulePage />



<LessonsPage />
<ContentHubPage />



<SpeakingPage />



<WritingPage />



<FlashcardsPage />



<GrammarPage />



<PronunciationPage />



<AssessmentPage />



<AiTutorPage />



<ErrorLogPage />
</div>



<ScheduleSidebar onOpenScheduleEditor={() => setShowScheduleEditor(true)} onClose={() => document.body.classList.toggle('schedule-collapsed')} />
</div>

<LanShareModal isOpen={showLanShareModal} onClose={() => setShowLanShareModal(false)} />




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
<ImportLessonModal
  isOpen={showImportLesson}
  dayNum={importLessonDay}
  onClose={() => setShowImportLesson(false)}
/>
<CloudLibraryModal isOpen={showCloudLibrary} onClose={() => setShowCloudLibrary(false)} />
<ChibiCompanionWidget />
</>); });
