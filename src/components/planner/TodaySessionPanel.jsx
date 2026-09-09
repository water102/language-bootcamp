import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MVD_MODE, DOMAIN_EVENTS } from '@/core/domain/constants.js';
import { eventBus } from '@/core/events/eventBus.js';
import { localStore } from '@/core/storage/localStorageAdapter.js';
import { indexedDb, STORES } from '@/core/storage/indexedDbAdapter.js';
import { BOOTCAMP_CURRICULUM_TEMPLATE } from '@/core/curriculum/bootcamp120Template.js';

export default function TodaySessionPanel({ onOpenGoalModal }) {
  const [mvdTier, setMvdTier] = useState(MVD_MODE.NORMAL);
  const [activePlanSummary, setActivePlanSummary] = useState(null);
  const [todaySlots, setTodaySlots] = useState([]);
  const [completedSlotIds, setCompletedSlotIds] = useState(new Set());
  const [todayCurriculumDay, setTodayCurriculumDay] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadTodayData();

    // Listen for plan created or session events
    const unsub1 = eventBus.subscribe(DOMAIN_EVENTS.PLAN_CREATED, () => loadTodayData());
    const unsub2 = eventBus.subscribe(DOMAIN_EVENTS.SESSION_COMPLETED, (payload) => {
      if (payload?.slotId) {
        setCompletedSlotIds(prev => new Set([...prev, payload.slotId]));
      }
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  const loadTodayData = async () => {
    const summary = localStore.get('activePlanSummary');
    setActivePlanSummary(summary);

    const legacyState = localStore.read();
    const currentDayNum = legacyState?.data?.currentDay || 1;
    setTodayCurriculumDay(BOOTCAMP_CURRICULUM_TEMPLATE.getDay(currentDayNum));

    // Try to load slots from indexedDB
    try {
      const allSlots = await indexedDb.queryByIndex(STORES.SCHEDULE_SLOTS, 'by_date', todayStr);
      if (allSlots && allSlots.length > 0) {
        setTodaySlots(allSlots);
      } else {
        // If today has no date slots yet, use nominal Day slots from curriculum
        generateFallbackTodaySlots(currentDayNum);
      }
    } catch (e) {
      generateFallbackTodaySlots(currentDayNum);
    }
  };

  const generateFallbackTodaySlots = (dayNum) => {
    const defaultSlots = [
      { slotId: 'slot_today_1', startTime: '07:00', endTime: '08:30', durationMinutes: 90, slotClass: 'DEEP', assignedSkill: 'grammar', mvdTier: MVD_MODE.EMERGENCY, notes: 'Ngữ pháp & Luyện viết câu' },
      { slotId: 'slot_today_2', startTime: '09:00', endTime: '10:30', durationMinutes: 90, slotClass: 'DEEP', assignedSkill: 'listening', mvdTier: MVD_MODE.BUSY, notes: 'Intensive Listening & Shadowing' },
      { slotId: 'slot_today_3', startTime: '10:45', endTime: '12:15', durationMinutes: 90, slotClass: 'DEEP', assignedSkill: 'vocabulary', mvdTier: MVD_MODE.NORMAL, notes: 'Vocabulary Chunks & Spaced SRS' },
      { slotId: 'slot_today_4', startTime: '15:00', endTime: '16:30', durationMinutes: 90, slotClass: 'DEEP', assignedSkill: 'speaking', mvdTier: MVD_MODE.NORMAL, notes: 'Speaking Practice + 15p IPA' },
      { slotId: 'slot_today_5', startTime: '16:45', endTime: '18:15', durationMinutes: 90, slotClass: 'DEEP', assignedSkill: 'writing', mvdTier: MVD_MODE.NORMAL, notes: 'Writing Studio Draft & Correction' }
    ];
    setTodaySlots(defaultSlots);
  };

  const toggleSlotComplete = (slotId, durationMinutes) => {
    const isCompleted = completedSlotIds.has(slotId);
    const updated = new Set(completedSlotIds);

    if (isCompleted) {
      updated.delete(slotId);
    } else {
      updated.add(slotId);
      // Publish event
      eventBus.publish(DOMAIN_EVENTS.SESSION_COMPLETED, {
        slotId,
        actualMinutes: durationMinutes,
        completedAt: new Date().toISOString()
      });
    }
    setCompletedSlotIds(updated);
  };

  // Filter slots based on MVD tier
  const filteredSlots = todaySlots.filter(slot => {
    if (mvdTier === MVD_MODE.EMERGENCY) return slot.mvdTier === MVD_MODE.EMERGENCY;
    if (mvdTier === MVD_MODE.BUSY) return slot.mvdTier === MVD_MODE.EMERGENCY || slot.mvdTier === MVD_MODE.BUSY;
    return true; // NORMAL: all slots
  });

  const totalPlannedMinutes = filteredSlots.reduce((sum, s) => sum + s.durationMinutes, 0);
  const completedMinutes = filteredSlots
    .filter(s => completedSlotIds.has(s.slotId))
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  return (
    <div className="glass-card mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <span>📅</span> Lịch Học Hôm Nay & Chế Độ MVD
            </h3>
            {activePlanSummary ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-primary/20 text-brand-light border border-brand-primary/30 font-bold uppercase">
                {activePlanSummary.currentLevel} → {activePlanSummary.targetLevel} ({activePlanSummary.dailyHours}h/d)
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase">
                Mặc định Bootcamp 12H
              </span>
            )}
          </div>
          <p className="text-xs text-dim mt-0.5">
            {todayCurriculumDay
              ? `Bài học: Day ${todayCurriculumDay.sourceDay} (${todayCurriculumDay.levelFocus}) • ${todayCurriculumDay.grammarTopic || ''}`
              : 'Tùy biến phiên học linh hoạt chống đứt chuỗi thói quen'}
          </p>
        </div>

        {/* MVD Tiers Buttons */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
          <span className="text-[10px] text-gray-400 font-bold px-2">CHẾ ĐỘ:</span>
          <button
            onClick={() => setMvdTier(MVD_MODE.NORMAL)}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              mvdTier === MVD_MODE.NORMAL
                ? 'bg-indigo-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Bình Thường
          </button>
          <button
            onClick={() => setMvdTier(MVD_MODE.BUSY)}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              mvdTier === MVD_MODE.BUSY
                ? 'bg-amber-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Bận Rộn (2 Slot)
          </button>
          <button
            onClick={() => setMvdTier(MVD_MODE.EMERGENCY)}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              mvdTier === MVD_MODE.EMERGENCY
                ? 'bg-rose-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Khẩn Cấp (1 Slot)
          </button>
        </div>
      </div>

      {/* Progress Bar for Today */}
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="text-dim">
          Đã hoàn thành: <strong className="text-white">{completedMinutes}</strong> / {totalPlannedMinutes} phút
        </span>
        <span className="font-bold text-accent-green">
          {totalPlannedMinutes > 0 ? Math.round((completedMinutes / totalPlannedMinutes) * 100) : 0}%
        </span>
      </div>
      <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden mb-4 border border-white/5">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500"
          style={{ width: `${totalPlannedMinutes > 0 ? Math.min(100, Math.round((completedMinutes / totalPlannedMinutes) * 100)) : 0}%` }}
        />
      </div>

      {/* Slots List */}
      <div className="space-y-2.5">
        {filteredSlots.map((slot, index) => {
          const isDone = completedSlotIds.has(slot.slotId);
          return (
            <div
              key={slot.slotId || index}
              className={`p-3 rounded-xl border flex items-center justify-between transition ${
                isDone
                  ? 'bg-emerald-950/20 border-emerald-500/30 opacity-75'
                  : 'bg-white/5 border-white/5 hover:border-white/15'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleSlotComplete(slot.slotId, slot.durationMinutes)}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center border font-bold text-xs transition ${
                    isDone
                      ? 'bg-emerald-500 border-emerald-400 text-black'
                      : 'border-white/20 hover:border-white/50 text-transparent'
                  }`}
                >
                  ✓
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{slot.notes || `${slot.assignedSkill} session`}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-dim uppercase font-semibold">
                      {slot.assignedSkill}
                    </span>
                    <span className="text-[10px] text-brand-light font-medium">
                      {slot.startTime} – {slot.endTime} ({slot.durationMinutes}m)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="unstyled"
                  className="text-xs px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium"
                  onClick={() => {
                    // Navigate to appropriate skill tab
                    const targetSkill = slot.assignedSkill;
                    const routeMap = {
                      speaking: 'speaking',
                      writing: 'writing',
                      grammar: 'grammar',
                      vocabulary: 'flashcards',
                      listening: 'lessons',
                      reading: 'lessons',
                      pronunciation: 'pronunciation'
                    };
                    const route = routeMap[targetSkill] || 'schedule';
                    const link = document.querySelector(`.nav-link[data-target="${route}"]`);
                    if (link) link.click();
                  }}
                >
                  Bắt Đầu Học
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info & Call to Action */}
      <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-xs">
        <span className="text-dim">
          💡 Chế độ <strong>Khẩn Cấp (Emergency)</strong> giúp duy trì chuỗi ngày streak ngay cả khi bạn chỉ có 15–30 phút.
        </span>
        <Button
          variant="unstyled"
          className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
          onClick={onOpenGoalModal}
        >
          ⚙️ Chỉnh Sửa Kế Hoạch CEFR →
        </Button>
      </div>
    </div>
  );
}
