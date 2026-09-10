import { memo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import StudyInsights from '@/components/StudyInsights';
import BOOTCAMP_DATA from '@/data';
import { toggleKPI, toggleCompleteDay } from '@/store';
import { switchCurrentDay, playChimeSound, showToast } from '@/runtime/controller';

export default memo(function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const currentDay = useSelector(state => state.study.currentDay || 1);
  const completedDays = useSelector(state => state.study.completedDays || []);
  const streak = useSelector(state => state.study.streak || 1);
  const todayKey = `day_${currentDay}`;
  const dayKpis = useSelector(state => state.study.kpis?.[todayKey] || {});

  const [selectedGate, setSelectedGate] = useState(null);

  const completedCount = completedDays.length;
  const progressPercent = Math.round((completedCount / 120) * 100);
  const gateProgressPercent = Math.min(100, Math.round((currentDay / 120) * 100));

  const currentDayData = BOOTCAMP_DATA.roadmap?.find(r => r.day === currentDay) || BOOTCAMP_DATA.roadmap?.[0] || {
    day: 1,
    level: 'A1',
    grammar: 'be: affirmative',
    vocab: 'identity',
    speaking: 'self-introduction and goals',
    writing: 'Write a short personal profile (60-80w).'
  };

  const dailyKPIs = BOOTCAMP_DATA.dailyKPIs || [
    { id: 'kpi_chunks', text: 'Nạp & đọc chuẩn 20 Collocations / Chunks' },
    { id: 'kpi_listening', text: 'Dictation 60–90s + Nghe sâu 60 phút' },
    { id: 'kpi_speaking', text: 'Thu âm 2 lượt (Take 1 nháp → Take 2 chuẩn)' },
    { id: 'kpi_writing', text: 'Viết Draft 1 → Phân tích lỗi → Rewrite Draft 2' },
    { id: 'kpi_srs', text: 'Xóa sạch thẻ SRS đến hạn trong ngày' },
    { id: 'kpi_immersion', text: 'Tối thiểu 60–90 phút Immersion thụ cảm tự nhiên' }
  ];

  const handleToggleKPI = (kpiId) => {
    dispatch(toggleKPI({ dayKey: todayKey, kpiId }));

    // Check if toggling this on completes all 6 KPIs
    const willBeChecked = !dayKpis[kpiId];
    if (willBeChecked) {
      const willAllBeChecked = dailyKPIs.every(k => (k.id === kpiId ? true : !!dayKpis[k.id]));
      if (willAllBeChecked) {
        if (typeof playChimeSound === 'function') playChimeSound();
        if (!completedDays.includes(currentDay)) {
          dispatch(toggleCompleteDay(currentDay));
        }
        showToast(`🎉 Xuất sắc! Bạn đã hoàn thành toàn bộ 6 KPI của Ngày ${currentDay}!`);
      }
    }
  };

  const handleSwitchToGateDay = (day) => {
    switchCurrentDay(day);
    setSelectedGate(null);
  };

  return (
    <main className="page-view active" id="view-dashboard">
      <div className="view-header">
        <h2>Bảng Điều Khiển Master C1 Bootcamp</h2>
        <p>Mục tiêu: Đạt năng lực sử dụng tiếng Anh C1 thực thụ qua 120 ngày với 12 giờ tiếp xúc mỗi ngày.</p>
      </div>

      <div className="stats-row">
        <div className="stat-box">
          <span className="stat-label">Tiến Độ Lộ Trình</span>
          <span className="stat-value" id="stat-completed-days">{completedCount} / 120</span>
          <span className="stat-desc">Ngày đã vượt qua</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Tỷ Lệ Hoàn Thành</span>
          <span className="stat-value" id="stat-percent">{progressPercent}%</span>
          <span className="stat-desc">Toàn bộ chiến dịch</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Kho Chunks Đã Nạp</span>
          <span className="stat-value" id="stat-chunks-learned">{completedCount * 20} Chunks</span>
          <span className="stat-desc">Cụm từ ngữ cảnh</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Chuỗi Học Bất Bại</span>
          <span className="stat-value">{streak} Days 🔥</span>
          <span className="stat-desc">Chế độ kỷ luật thép</span>
        </div>
      </div>

      <div className="glass-card phase-gates-card">
        <div className="flex justify-between items-center">
          <h3 className="font-display text-[18px] font-bold text-[#fff]">
            5 Cột Mốc Rào Cản (Phase Gates Timeline)
          </h3>
          <span className="text-[12px] text-dim">Nhấp vào từng gate để xem tiêu chí tối thiểu</span>
        </div>
        <div className="phase-gate-track">
          <div className="phase-gate-line">
            <div
              className="phase-gate-fill"
              id="phase-gate-fill"
              style={{ width: `${gateProgressPercent}%` }}
            ></div>
          </div>
          <div className="phase-gate-nodes" id="phase-gates-container">
            {(BOOTCAMP_DATA.gates || []).map(gate => {
              const isPassed = currentDay > gate.day;
              const isActive = currentDay <= gate.day && currentDay > (gate.day - 14);

              return (
                <div
                  key={gate.day}
                  className={`gate-node ${isPassed ? 'passed' : ''} ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedGate(gate)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedGate(gate); }}
                >
                  <div className="gate-dot">{isPassed ? '✓' : gate.level}</div>
                  <div className="gate-info">
                    <div className="gate-day">Day {gate.day}</div>
                    <div className="gate-name">{gate.gate}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="glass-card mission-card">
          <div className="mission-header">
            <div>
              <span className="text-[12px] text-brand-light uppercase font-bold tracking-[1px]">Nhiệm vụ hôm nay</span>
              <h3 className="mission-title" id="mission-day-title">
                Nhiệm Vụ Trọng Tâm Ngày {currentDayData.day} ({currentDayData.level})
              </h3>
            </div>
          </div>
          <div className="mission-grid">
            <div className="mission-item">
              <div className="mission-item-tag">📖 Ngữ Pháp / Use of English</div>
              <div className="mission-item-val" id="mission-grammar-val">{currentDayData.grammar}</div>
            </div>
            <div className="mission-item">
              <div className="mission-item-tag">🗂️ Miền Từ Vựng</div>
              <div className="mission-item-val" id="mission-vocab-val">{currentDayData.vocab}</div>
            </div>
            <div className="mission-item">
              <div className="mission-item-tag">🎙️ Thực Hành Nói</div>
              <div className="mission-item-val" id="mission-speaking-val">{currentDayData.speaking}</div>
            </div>
            <div className="mission-item">
              <div className="mission-item-tag">✍️ Thực Hành Viết</div>
              <div className="mission-item-val" id="mission-writing-val">{currentDayData.writing}</div>
            </div>
          </div>
          <div className="mission-action-bar">
            <Button
              variant="unstyled"
              className="btn-primary"
              onClick={() => navigate('/lessons')}
            >
              🚀 Mở Bài Học Hôm Nay
            </Button>
            <Button
              variant="unstyled"
              className="btn-secondary"
              onClick={() => navigate('/schedule')}
            >
              ⏱️ Bắt Đầu Hẹn Giờ 90 Phút
            </Button>
          </div>
        </div>

        <div className="glass-card">
          <div className="flex justify-between items-center mb-[16px]">
            <h3 className="font-display text-[17px] font-bold text-[#fff]">
              🎯 6 Chỉ Tiêu KPI Hôm Nay
            </h3>
            <span className="text-[11px] text-accent-green font-bold uppercase">Non-negotiable</span>
          </div>
          <div className="kpi-checklist" id="daily-kpi-container">
            {dailyKPIs.map(kpi => {
              const isChecked = !!dayKpis[kpi.id];
              return (
                <div
                  key={kpi.id}
                  className={`kpi-item ${isChecked ? 'checked' : ''}`}
                  onClick={() => handleToggleKPI(kpi.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleToggleKPI(kpi.id); }}
                >
                  <div className="kpi-checkbox">
                    {isChecked && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                  <span className="kpi-text">{kpi.text}</span>
                </div>
              );
            })}
          </div>
          <p className="text-[12px] text-dim mt-[14px] leading-[1.5]">
            💡 <em>Hoàn thành cả 6 mục này mỗi ngày để duy trì chuỗi học và tự động mở khóa ngày tiếp theo.</em>
          </p>
        </div>
      </div>

      <StudyInsights />

      {/* Phase Gate Modal */}
      {selectedGate && (
        <div
          className="modal-overlay open"
          style={{ display: 'flex' }}
          onClick={() => setSelectedGate(null)}
        >
          <div
            className="modal-card"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '520px' }}
          >
            <button
              className="modal-close-btn"
              onClick={() => setSelectedGate(null)}
              aria-label="Đóng"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <h3 className="font-display text-[20px] font-bold text-[#fff] mb-[18px]">
              Phase Gate Checkpoint: Day {selectedGate.day} ({selectedGate.gate})
            </h3>
            <div className="flex flex-col gap-[12px]">
              <p><strong>Tiêu chí tối thiểu bắt buộc:</strong></p>
              <div className="bg-[rgba(255,255,255,0.05)] p-[14px] rounded-[10px] border-l-[3px] border-[var(--accent-amber)] leading-[1.6]">
                {selectedGate.criteria}
              </div>
              <p className="text-[13px] text-muted mt-[6px]">
                ⚠️ <em>Gating Rule: Nếu bạn trượt gate này với khoảng cách lớn, hãy kéo dài thêm 4–8 tuần thay vì vội vã sang phase tiếp theo!</em>
              </p>
              <Button
                variant="unstyled"
                className="btn-primary mt-[10px]"
                onClick={() => handleSwitchToGateDay(selectedGate.day)}
              >
                Chuyển tới Ngày {selectedGate.day}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
});
