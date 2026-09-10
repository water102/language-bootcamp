import { memo, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import {
  BOOTCAMP_DATA,
  playChimeSound,
  speakText,
  showToast,
  reviewAndStudyBlock,
  openDailyLessonBlock
} from '@/runtime/controller';

function parseMins(tStr) {
  if (!tStr) return 0;
  const [h, m] = tStr.trim().split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function formatCountdown(totalSecs) {
  if (totalSecs < 0) totalSecs = 0;
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default memo(function ScheduleSidebar({ onOpenScheduleEditor, onClose }) {
  const currentDay = useSelector(state => state.study?.currentDay || 1);
  const [timeNow, setTimeNow] = useState(() => new Date());

  // Focus Timer States
  const [timerMode, setTimerMode] = useState('deep'); // 'deep' | 'pomo' | 'break' | 'stopwatch'
  const [timerTotalSecs, setTimerTotalSecs] = useState(90 * 60);
  const [timerRemainingSecs, setTimerRemainingSecs] = useState(90 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Settings
  const [soundAlerts, setSoundAlerts] = useState(() => {
    try {
      const s = localStorage.getItem('c1_sound_alerts');
      return s !== null ? JSON.parse(s) : true;
    } catch {
      return true;
    }
  });

  const [desktopNotif, setDesktopNotif] = useState(() => {
    return typeof Notification !== 'undefined' && Notification.permission === 'granted';
  });

  const lastAlertKeyRef = useRef(null);

  // Live clock interval (every 1 second)
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setTimeNow(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Focus Timer interval
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerRemainingSecs(prev => {
          if (timerMode === 'stopwatch') {
            return prev + 1;
          }
          if (prev <= 1) {
            clearInterval(interval);
            setIsTimerRunning(false);
            playChimeSound();
            showToast('⏰ Đã hết thời gian tập trung! Hãy nghỉ giải lao 5 phút.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerMode]);

  // Listen for focus timer trigger events from other components/blocks
  useEffect(() => {
    const handleSetFocusTimer = (e) => {
      const { durationMinutes = 90, mode = 'deep' } = e.detail || {};
      setTimerMode(mode);
      const secs = durationMinutes * 60;
      setTimerTotalSecs(secs);
      setTimerRemainingSecs(secs);
      setIsTimerRunning(true);
    };
    window.addEventListener('set-focus-timer', handleSetFocusTimer);
    return () => window.removeEventListener('set-focus-timer', handleSetFocusTimer);
  }, []);

  // Handle timer mode change
  const handleSetTimerMode = useCallback((mode) => {
    setTimerMode(mode);
    setIsTimerRunning(false);
    let secs = 90 * 60;
    if (mode === 'deep') secs = 90 * 60;
    else if (mode === 'pomo') secs = 25 * 60;
    else if (mode === 'break') secs = 5 * 60;
    else if (mode === 'stopwatch') secs = 0;
    setTimerTotalSecs(secs);
    setTimerRemainingSecs(secs);
  }, []);

  const handleToggleTimer = useCallback(() => {
    setIsTimerRunning(r => !r);
  }, []);

  const handleResetTimer = useCallback(() => {
    setIsTimerRunning(false);
    setTimerRemainingSecs(timerTotalSecs);
  }, [timerTotalSecs]);

  // Current schedule & time calculations
  const schedule = useMemo(() => {
    return BOOTCAMP_DATA?.dailySchedule || [];
  }, []);

  const curH = timeNow.getHours();
  const curM = timeNow.getMinutes();
  const curS = timeNow.getSeconds();
  const currentTotalSecs = curH * 3600 + curM * 60 + curS;
  const liveClockStr = `${String(curH).padStart(2, '0')}:${String(curM).padStart(2, '0')}:${String(curS).padStart(2, '0')}`;

  // Find active block & next block
  const { activeBlock, nextBlock } = useMemo(() => {
    let active = null;
    let next = null;

    for (let i = 0; i < schedule.length; i++) {
      const blk = schedule[i];
      const rawTime = blk.time || '';
      const parts = (rawTime.includes('–') ? rawTime.split('–') : rawTime.split('-')).map(s => s.trim());
      const [sH, sM] = (parts[0] || '07:00').split(':').map(Number);
      const [eH, eM] = (parts[1] || '08:30').split(':').map(Number);

      const bStartSecs = sH * 3600 + sM * 60;
      const bEndSecs = eH * 3600 + eM * 60;

      if (currentTotalSecs >= bStartSecs && currentTotalSecs < bEndSecs) {
        active = {
          ...blk,
          startTimeStr: parts[0] || '07:00',
          endTimeStr: parts[1] || '08:30',
          startSecs: bStartSecs,
          endSecs: bEndSecs,
          durationSecs: bEndSecs - bStartSecs,
          elapsedSecs: currentTotalSecs - bStartSecs,
          remainingSecs: bEndSecs - currentTotalSecs
        };
        next = schedule[i + 1] || null;
        break;
      } else if (currentTotalSecs < bStartSecs && !next) {
        next = blk;
      }
    }

    return { activeBlock: active, nextBlock: next };
  }, [schedule, currentTotalSecs]);

  // Sound / Audio alert trigger on block change
  useEffect(() => {
    if (!activeBlock) return;
    const alertKey = `${activeBlock.id}_${activeBlock.startTimeStr}`;
    if (lastAlertKeyRef.current !== alertKey) {
      lastAlertKeyRef.current = alertKey;
      if (soundAlerts) {
        playChimeSound();
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          speakText(`Starting ${activeBlock.block}. Target: ${activeBlock.output || 'high focus'}.`);
        }
      }
      if (desktopNotif && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(`C1 Bootcamp: ${activeBlock.block}`, {
          body: `Mục tiêu đầu ra: ${activeBlock.output || 'Học tập chuyên sâu'}`
        });
      }
    }
  }, [activeBlock, soundAlerts, desktopNotif]);

  // Toggles
  const handleToggleSound = useCallback(() => {
    setSoundAlerts(prev => {
      const next = !prev;
      localStorage.setItem('c1_sound_alerts', JSON.stringify(next));
      showToast(next ? '🔊 Đã BẬT chuông báo & giọng nhắc!' : '🔇 Đã TẮT chuông báo.');
      return next;
    });
  }, []);

  const handleToggleDesktopNotif = useCallback(async () => {
    if (typeof Notification === 'undefined') {
      alert('Trình duyệt không hỗ trợ Desktop Notifications.');
      return;
    }
    if (Notification.permission === 'granted') {
      setDesktopNotif(prev => {
        const next = !prev;
        showToast(next ? '🔔 Đã BẬT thông báo desktop!' : '🔕 Đã TẮT thông báo desktop.');
        return next;
      });
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setDesktopNotif(true);
        showToast('🔔 Đã cấp quyền và BẬT thông báo desktop!');
        new Notification('C1 Bootcamp Master', { body: 'Thông báo nhắc nhở đã được kích hoạt thành công!' });
      }
    } else {
      alert('Vui lòng cho phép thông báo trong cài đặt trình duyệt để nhận nhắc nhở.');
    }
  }, []);

  const handleTestAlert = useCallback(() => {
    playChimeSound();
    speakText('Attention: C1 Bootcamp study reminder test successful.');
    showToast('🔔 Thử nghiệm nhắc nhở chuông báo C1 Bootcamp thành công!');
  }, []);

  // Compute progress percent for active block
  const progressPct = useMemo(() => {
    if (!activeBlock || !activeBlock.durationSecs) return 0;
    const pct = Math.round((activeBlock.elapsedSecs / activeBlock.durationSecs) * 100);
    return Math.max(0, Math.min(100, pct));
  }, [activeBlock]);

  // Formatted timer text
  const timerFormattedStr = useMemo(() => {
    const m = Math.floor(timerRemainingSecs / 60);
    const s = timerRemainingSecs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, [timerRemainingSecs]);

  const timerModeLabel = useMemo(() => {
    if (timerMode === 'deep') return 'Deep Focus Mode';
    if (timerMode === 'pomo') return 'Pomodoro 25m';
    if (timerMode === 'break') return 'Short Break';
    return 'Stopwatch';
  }, [timerMode]);

  return (
    <aside className="schedule-sidebar" id="schedule-sidebar">
      <div className="schedule-sidebar-header">
        <div className="sidebar-header-title">
          <span className="live-pulse-dot"></span>
          <h3>{"Lịch 12H & Timers"}</h3>
        </div>
        <div className="sidebar-header-actions">
          <Button
            variant="unstyled"
            className={`icon-tool-btn ${soundAlerts ? 'active' : ''}`}
            id="toggle-sound-alerts-btn"
            title="Bật/Tắt chuông báo âm thanh"
            onClick={handleToggleSound}
          >
            <span>{"🔊"}</span>
          </Button>
          <Button
            variant="unstyled"
            className={`icon-tool-btn ${desktopNotif ? 'active' : ''}`}
            id="toggle-desktop-notif-btn"
            title="Bật/Tắt thông báo Desktop"
            onClick={handleToggleDesktopNotif}
          >
            <span>{"🔔"}</span>
          </Button>
          <Button
            variant="unstyled"
            className="icon-tool-btn test-bell"
            id="test-alert-btn"
            title="Thử chuông ngay lập tức"
            onClick={handleTestAlert}
          >
            <span>{"⚡"}</span>
          </Button>
          <Button
            variant="unstyled"
            className="icon-tool-btn dock-toggle-btn"
            id="close-schedule-panel-btn"
            title="Thu gọn / Ẩn cột này"
            onClick={onClose}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </Button>
        </div>
      </div>

      <div className="schedule-sidebar-body">
        {/* Clock Card */}
        <div className="sidebar-clock-card">
          <div className="clock-display-row">
            <div className="live-clock-text" id="live-clock-time">{liveClockStr}</div>
            <span className={`status-indicator-pill ${activeBlock ? 'active' : ''}`} id="current-status-badge">
              {activeBlock ? 'ĐANG TRONG KHỐI' : 'NGHỈ GIẢI LAO'}
            </span>
          </div>
          <div className="clock-sub-row">
            <span className={`mode-tag ${activeBlock ? (activeBlock.mode || 'deep').toLowerCase() : 'break'}`} id="current-mode-badge">
              {activeBlock ? `${(activeBlock.mode || 'DEEP').toUpperCase()} FOCUS` : 'REST & MEAL'}
            </span>
            <span className="next-block-text" id="next-block-preview-text">
              {nextBlock ? `⏭️ Tiếp theo: ${nextBlock.time} ${nextBlock.block}` : '🎉 Hoàn thành ngày học!'}
            </span>
          </div>
        </div>

        {/* Active Block Countdown Card */}
        <div className="sidebar-active-block-card">
          <div className="countdown-header-row">
            <span className="countdown-label-mini" id="countdown-label-text">
              {activeBlock ? 'Thời gian còn lại trong khối:' : 'Khối học tiếp theo bắt đầu sau:'}
            </span>
            <div className="countdown-digits-compact" id="live-countdown-digits">
              {activeBlock ? formatCountdown(activeBlock.remainingSecs) : '--:--'}
            </div>
          </div>
          <div className="block-progress-track">
            <div
              className="block-progress-fill"
              id="live-block-progress-fill"
              style={{ width: `${progressPct}%` }}
            ></div>
          </div>
          <div className="progress-meta-row">
            <span id="block-start-time-lbl">{activeBlock?.startTimeStr || '07:00'}</span>
            <span id="block-percent-lbl">{`${progressPct}%`}</span>
            <span id="block-end-time-lbl">{activeBlock?.endTimeStr || '08:30'}</span>
          </div>
          <div className="current-block-info">
            <h4 className="block-name-title" id="current-block-name">
              {activeBlock?.block || 'Thời gian tự do & nghỉ ngơi'}
            </h4>
            <p className="block-output-desc" id="current-block-output">
              {activeBlock?.output || '🎯 Thư giãn hoặc ôn tập nhẹ'}
            </p>
          </div>
          <Button
            variant="unstyled"
            className="btn-primary jump-tool-btn"
            id="btn-jump-to-current-tool"
            onClick={() => reviewAndStudyBlock(activeBlock || schedule[0])}
          >
            {"🚀 Mở Nhanh Công Cụ Này"}
          </Button>
        </div>

        {/* Focus Timer Card */}
        <div className="sidebar-timer-card">
          <div className="timer-card-title">
            <h4>{"⏱️ Đồng Hồ Tập Trung (Focus Timer)"}</h4>
          </div>
          <div className="timer-mode-selector">
            {[
              { mode: 'deep', label: '90m Deep' },
              { mode: 'pomo', label: '25m Pomo' },
              { mode: 'break', label: '5m Nghỉ' },
              { mode: 'stopwatch', label: 'Bấm giờ' },
            ].map(item => (
              <Button
                key={item.mode}
                variant="unstyled"
                className={`timer-mode-btn ${timerMode === item.mode ? 'active' : ''}`}
                data-mode={item.mode}
                onClick={() => handleSetTimerMode(item.mode)}
              >
                {item.label}
              </Button>
            ))}
          </div>
          <div className="timer-dial-compact" id="timer-dial-ring">
            <div className="timer-time-display-compact" id="timer-time-text">
              {timerFormattedStr}
            </div>
            <div className="timer-label-compact">{timerModeLabel}</div>
          </div>
          <div className="timer-controls-row">
            <Button
              variant="unstyled"
              className="btn-primary timer-action-btn"
              id="timer-start-btn"
              onClick={handleToggleTimer}
            >
              {isTimerRunning ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                  </svg>
                  <span>{"Tạm dừng"}</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  <span>{"Bắt đầu"}</span>
                </>
              )}
            </Button>
            <Button
              variant="unstyled"
              className="btn-secondary timer-action-btn"
              id="timer-reset-btn"
              onClick={handleResetTimer}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6"></path>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
              <span>{"Đặt lại"}</span>
            </Button>
          </div>
        </div>

        {/* 9 Khung Giờ Trong Ngày */}
        <div className="sidebar-schedule-section">
          <div className="schedule-section-header">
            <div className="flex items-center justify-between w-full">
              <h4 id="sidebar-schedule-title">
                {`📅 9 Khung Giờ Trong Ngày ${currentDay ? `(Day ${currentDay})` : ''}`}
              </h4>
              <Button
                variant="unstyled"
                className="icon-tool-btn text-[12px] px-2 py-0.5 bg-[rgba(255,255,255,0.08)] rounded hover:bg-[rgba(255,255,255,0.15)] text-[#cbd5e1]"
                id="sidebar-edit-schedule-btn"
                title="Chỉnh sửa lịch trong ngày (Kéo, thả, sửa giờ, B1->C1 8H)"
                onClick={onOpenScheduleEditor}
              >
                <span>{"✏️ Sửa lịch"}</span>
              </Button>
            </div>
            <span className="schedule-hint" id="sidebar-schedule-hint">{"07:00–23:00"}</span>
          </div>
          <div className="schedule-blocks compact-list" id="schedule-list-container">
            {schedule.map((blk, idx) => {
              const isCurrent = activeBlock?.id === blk.id;
              const modeLower = (blk.mode || 'DEEP').toLowerCase();
              return (
                <div
                  key={blk.id || idx}
                  className={`schedule-block-item ${modeLower} ${isCurrent ? 'active' : ''}`}
                  onClick={() => openDailyLessonBlock(blk)}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-[11px] text-slate-300 font-semibold">{blk.time}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      modeLower === 'deep' ? 'bg-indigo-500/20 text-indigo-300' :
                      modeLower === 'medium' ? 'bg-cyan-500/20 text-cyan-300' :
                      'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {blk.mode || 'DEEP'}
                    </span>
                  </div>
                  <h5 className="text-white text-xs font-semibold mb-0.5">{blk.block}</h5>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{blk.output}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Protocols Shortcut */}
        <div className="sidebar-protocols-box">
          <Button
            variant="unstyled"
            className="btn-secondary protocols-shortcut-btn"
            id="open-protocols-modal-btn"
            onClick={() => {
              document.querySelector('.nav-link[data-target="schedule"]')?.click();
              window.location.hash = '#/schedule';
            }}
          >
            {"📋 Xem 5 Protocols Quy Trình Học Chuẩn"}
          </Button>
        </div>
      </div>
    </aside>
  );
});
