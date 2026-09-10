import { memo, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import BOOTCAMP_DATA from '@/data';
import { toggleCompleteDay } from '@/store';
import { switchCurrentDay, showToast } from '@/runtime/controller';
import { generateDayLessonPrompt } from '@/core/ai/lessonPromptBuilder';

export default memo(function RoadmapPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const currentDay = useSelector(state => state.study.currentDay || 1);
  const completedDays = useSelector(state => state.study.completedDays || []);

  const [filterLevel, setFilterLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDayItem, setSelectedDayItem] = useState(null);

  const filters = [
    { id: 'all', label: 'Tất cả (120 ngày)' },
    { id: 'a1', label: 'A1 Foundation' },
    { id: 'a2', label: 'A2 Independence' },
    { id: 'b1', label: 'B1 Intermediate' },
    { id: 'b2', label: 'B2 Upper-Intermediate' },
    { id: 'c1', label: 'C1 Advanced Control' },
    { id: 'gate', label: '⭐ Phase Gates' },
  ];

  const filteredDays = useMemo(() => {
    const list = BOOTCAMP_DATA.roadmap || [];
    const term = searchTerm.toLowerCase().trim();

    return list.filter(item => {
      const matchFilter =
        filterLevel === 'all' ||
        item.level.toLowerCase() === filterLevel.toLowerCase() ||
        (filterLevel === 'gate' && item.isGate);

      const matchSearch =
        term === '' ||
        item.grammar.toLowerCase().includes(term) ||
        item.vocab.toLowerCase().includes(term) ||
        item.speaking.toLowerCase().includes(term) ||
        `day ${item.day}`.includes(term);

      return matchFilter && matchSearch;
    });
  }, [filterLevel, searchTerm]);

  const handleCopyPrompt = async (day) => {
    try {
      const prompt = generateDayLessonPrompt(day);
      await navigator.clipboard.writeText(prompt);
      showToast(`📋 Đã sao chép AI Master Prompt cho Ngày ${day}!`);
    } catch {
      showToast('Không thể sao chép tự động, vui lòng thử lại.');
    }
  };

  const handleOpenLesson = (day) => {
    switchCurrentDay(day);
    setSelectedDayItem(null);
    navigate('/lessons');
  };

  const handleImportLesson = (day) => {
    setSelectedDayItem(null);
    window.dispatchEvent(new CustomEvent('open-import-lesson-modal', { detail: { day: Number(day) } }));
  };

  const handleToggleComplete = (day) => {
    dispatch(toggleCompleteDay(day));
    const willBeCompleted = !completedDays.includes(day);
    showToast(willBeCompleted ? `🎉 Chúc mừng bạn đã hoàn thành Ngày ${day}!` : `Đã bỏ đánh dấu hoàn thành Ngày ${day}`);
  };

  return (
    <section className="page-view" id="view-roadmap">
      <div className="view-header">
        <h2>Lộ Trình Tương Tác 120 Ngày Master Plan</h2>
        <p>
          Kế hoạch chi tiết từng ngày từ A1 đến C1 Benchmark. Bấm vào bất kỳ ngày nào để xem toàn bộ nhiệm vụ hoặc đánh dấu hoàn thành.
        </p>
      </div>

      <div className="roadmap-controls">
        <div className="filter-pills">
          {filters.map(f => (
            <Button
              key={f.id}
              variant="unstyled"
              className={`filter-pill roadmap-filter-pill ${filterLevel === f.id ? 'active' : ''}`}
              onClick={() => setFilterLevel(f.id)}
            >
              {f.label}
            </Button>
          ))}
        </div>
        <div className="search-input-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            id="roadmap-search-input"
            placeholder="Tìm kiếm ngữ pháp, từ vựng, chủ đề..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="roadmap-grid" id="roadmap-grid-container">
        {filteredDays.map(dayItem => {
          const isCompleted = completedDays.includes(dayItem.day);
          const isCurrent = dayItem.day === currentDay;

          return (
            <div
              key={dayItem.day}
              className={`day-card ${isCurrent ? 'current-learning-day' : ''} ${isCompleted ? 'completed' : ''} ${dayItem.isGate ? 'is-gate' : ''}`}
              id={isCurrent ? 'current-learning-roadmap-card' : undefined}
              onClick={() => setSelectedDayItem(dayItem)}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedDayItem(dayItem); }}
            >
              <div className="day-card-header">
                <div className="day-header-left">
                  <span className="day-num">Day {dayItem.day}</span>
                  {isCurrent && <span className="current-learning-pill">⚡ Đang học</span>}
                </div>
                <span className={`cefr-tag ${dayItem.level.toLowerCase()}`}>{dayItem.level}</span>
              </div>
              <div className="day-card-body">
                <div className="day-topic">{dayItem.grammar}</div>
                <div className="day-grammar">📚 Vocab: <strong>{dayItem.vocab}</strong></div>
                <div className="day-grammar">🎙️ Speak: {dayItem.speaking}</div>
              </div>
              <div className="day-meta-footer">
                <span>{dayItem.isGate ? '⭐ Gatekeeper' : dayItem.isWeeklyTest ? '📝 Weekly Test' : 'W' + dayItem.week}</span>
                <span className={isCurrent ? 'footer-current-tag' : ''}>
                  {isCurrent ? '🔥 Đang học hôm nay' : isCompleted ? '✅ Hoàn thành' : '👉 Bắt đầu'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Day Detail Modal */}
      {selectedDayItem && (
        <div
          className="modal-overlay open"
          style={{ display: 'flex' }}
          onClick={() => setSelectedDayItem(null)}
        >
          <div
            className="modal-card"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '640px' }}
          >
            <button
              className="modal-close-btn"
              onClick={() => setSelectedDayItem(null)}
              aria-label="Đóng"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <h3 className="font-display text-[20px] font-bold text-[#fff] mb-[18px]">
              Chi Tiết Lộ Trình: Day {selectedDayItem.day} ({selectedDayItem.level})
            </h3>
            <div className="flex flex-col gap-[16px]">
              <div>
                <span className={`cefr-tag ${selectedDayItem.level.toLowerCase()} text-[12px]`}>
                  CEFR: {selectedDayItem.level}
                </span>
                <span className="font-code text-[12px] text-dim ml-[8px]">
                  Tuần {selectedDayItem.week}
                </span>
              </div>

              <div className="glass-card p-[16px] bg-[rgba(255,255,255,0.03)]">
                <h4 className="text-brand-light mb-[6px]">📖 Ngữ Pháp / Use of English</h4>
                <p className="text-[15px] text-[#fff] font-semibold">{selectedDayItem.grammar}</p>
              </div>

              <div className="glass-card p-[16px] bg-[rgba(255,255,255,0.03)]">
                <h4 className="text-accent-amber mb-[6px]">🗂️ Miền Từ Vựng (Vocabulary Domain)</h4>
                <p className="text-[14px] text-[#fff]">{selectedDayItem.vocab}</p>
              </div>

              <div className="glass-card p-[16px] bg-[rgba(255,255,255,0.03)]">
                <h4 className="text-accent-cyan mb-[6px]">🎙️ Nhiệm Vụ Nói (Speaking Task)</h4>
                <p className="text-[14px] text-[#fff]">{selectedDayItem.speaking}</p>
              </div>

              <div className="glass-card p-[16px] bg-[rgba(255,255,255,0.03)]">
                <h4 className="text-[#ec4899] mb-[6px]">✍️ Nhiệm Vụ Viết (Writing Task)</h4>
                <p className="text-[14px] text-[#fff]">{selectedDayItem.writing}</p>
              </div>

              <div className="bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.2)] p-[14px] rounded-[10px]">
                <strong className="text-accent-green">🎯 Chỉ tiêu KPI ngày:</strong>
                <p className="text-[13.5px] text-[#cbd5e1] mt-[4px]">{selectedDayItem.kpi}</p>
              </div>

              <div className="flex gap-[12px] mt-[10px] flex-wrap">
                <Button
                  variant="unstyled"
                  className="btn-primary"
                  onClick={() => {
                    switchCurrentDay(selectedDayItem.day);
                    setSelectedDayItem(null);
                  }}
                >
                  🚀 Chọn Làm Ngày Học Hiện Tại
                </Button>
                <Button
                  variant="unstyled"
                  className="btn-secondary"
                  onClick={() => handleToggleComplete(selectedDayItem.day)}
                >
                  {completedDays.includes(selectedDayItem.day)
                    ? '↩️ Đánh dấu Chưa Hoàn Thành'
                    : '✅ Đánh dấu Đã Hoàn Thành'}
                </Button>
                <Button
                  variant="unstyled"
                  className="btn-secondary border-[var(--accent-amber)] text-accent-amber"
                  onClick={() => handleOpenLesson(selectedDayItem.day)}
                >
                  📚 Mở Bài Học Chi Tiết (Day {selectedDayItem.day})
                </Button>
                <Button
                  variant="unstyled"
                  className="btn-secondary text-accent-cyan border-[rgba(6,182,212,0.4)]"
                  onClick={() => handleCopyPrompt(selectedDayItem.day)}
                >
                  📋 Copy Prompt AI
                </Button>
                <Button
                  variant="unstyled"
                  className="btn-secondary text-brand-light border-[rgba(99,102,241,0.4)]"
                  onClick={() => handleImportLesson(selectedDayItem.day)}
                >
                  🤖 Nhập Bài Học Từ AI
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
});
