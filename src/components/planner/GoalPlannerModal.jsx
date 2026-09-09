import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { CEFR_LEVELS, SKILLS, FEASIBILITY_STATUS, SCENARIO_TYPES, DOMAIN_EVENTS } from '@/core/domain/constants.js';
import { CefrHoursEngine } from '@/core/planner/cefrHours.js';
import { FeasibilityEngine } from '@/core/planner/feasibility.js';
import { ScenarioOptimizer } from '@/core/planner/scenarios.js';
import { Scheduler } from '@/core/planner/scheduler.js';
import { localStore } from '@/core/storage/localStorageAdapter.js';
import { indexedDb, STORES } from '@/core/storage/indexedDbAdapter.js';
import { eventBus } from '@/core/events/eventBus.js';
import { createLearningGoal } from '@/core/domain/types.js';

export default function GoalPlannerModal({ isOpen, onClose, onPlanActivated }) {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const defaultTargetDate = new Date(Date.now() + 120 * 86400000).toISOString().split('T')[0];

  const [currentLevel, setCurrentLevel] = useState('A2');
  const [progressWithinLevel, setProgressWithinLevel] = useState(0.2);
  const [targetLevel, setTargetLevel] = useState('C1');
  const [startDate] = useState(todayStr);
  const [targetDate, setTargetDate] = useState(defaultTargetDate);
  const [dailyHours, setDailyHours] = useState(4);
  const [daysPerWeek, setDaysPerWeek] = useState(6);
  const [weakSkills, setWeakSkills] = useState(['speaking', 'writing']);
  const [selectedScenario, setSelectedScenario] = useState(SCENARIO_TYPES.BALANCED);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Calculate Required Hours
  const requiredHours = useMemo(() => {
    return CefrHoursEngine.calculateRequiredHours(currentLevel, progressWithinLevel, targetLevel);
  }, [currentLevel, progressWithinLevel, targetLevel]);

  // 2. Feasibility Evaluation
  const feasibility = useMemo(() => {
    return FeasibilityEngine.evaluate({
      requiredExpectedHours: requiredHours.expected,
      startDate,
      targetDate,
      dailyHours,
      daysPerWeek,
      adherenceFactor: 0.85
    });
  }, [requiredHours.expected, startDate, targetDate, dailyHours, daysPerWeek]);

  // 3. 3 Scenarios
  const scenarios = useMemo(() => {
    return ScenarioOptimizer.generateScenarios({
      requiredExpectedHours: requiredHours.expected,
      startDate,
      targetDate,
      baseDailyHours: dailyHours
    });
  }, [requiredHours.expected, startDate, targetDate, dailyHours]);

  const toggleWeakSkill = (skill) => {
    setWeakSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const applyScenario = (scType) => {
    setSelectedScenario(scType);
    const sc = scenarios[scType];
    if (sc) {
      setDailyHours(sc.dailyHours);
      setDaysPerWeek(Math.round(sc.daysPerWeek));
      if (sc.targetDate) setTargetDate(sc.targetDate);
    }
  };

  const handleActivatePlan = async () => {
    setIsSaving(true);
    try {
      const profile = localStore.get('profile') || {};
      const goal = createLearningGoal({
        profileId: profile.profileId || 'user_default',
        currentLevel,
        progressWithinLevel,
        targetLevel,
        targetDate,
        startDate,
        availability: { mode: 'daily-total', hoursPerDay: dailyHours, daysPerWeek },
        weakSkills,
        scenario: selectedScenario
      });

      // Generate complete schedule slots with scheduler
      const plan = Scheduler.generatePlanSchedule({
        planId: `plan_${Date.now()}`,
        goalId: goal.goalId,
        startDate,
        targetDate,
        dailyHours,
        daysPerWeek,
        weakSkills,
        nominalCurriculumDays: 120
      });

      // Save goal and active plan reference to localStore
      localStore.set('activeGoal', goal);
      localStore.set('activePlanId', plan.planId);
      localStore.set('activePlanSummary', {
        planId: plan.planId,
        goalId: goal.goalId,
        currentLevel,
        targetLevel,
        dailyHours,
        targetDate,
        totalSlots: plan.totalSlotsCount,
        totalHours: plan.totalPlannedHours
      });

      // Save full plan and slots to IndexedDB
      await indexedDb.put(STORES.PLANS, plan);
      for (const slot of plan.slots) {
        await indexedDb.put(STORES.SCHEDULE_SLOTS, slot);
      }

      // Emit domain event
      eventBus.publish(DOMAIN_EVENTS.PLAN_CREATED, {
        planId: plan.planId,
        goalId: goal.goalId,
        targetLevel,
        totalPlannedHours: plan.totalPlannedHours
      });

      if (typeof onPlanActivated === 'function') {
        onPlanActivated(plan);
      }
      onClose();
    } catch (err) {
      console.error('[GoalPlannerModal] Failed to activate plan:', err);
      alert('Có lỗi khi lưu kế hoạch: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case FEASIBILITY_STATUS.COMFORTABLE: return '#10b981';
      case FEASIBILITY_STATUS.REALISTIC: return '#06b6d4';
      case FEASIBILITY_STATUS.AGGRESSIVE: return '#f59e0b';
      case FEASIBILITY_STATUS.VERY_AGGRESSIVE: return '#f97316';
      default: return '#ef4444';
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#1f2937]/50">
          <div>
            <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
              <span>🎯</span> Thiết Lập Mục Tiêu & Kế Hoạch CEFR (Adaptive Planner)
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Tính toán số giờ chuẩn Cambridge, tối ưu kịch bản và sinh lịch học cố định deterministic
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          
          {/* Level Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#1e293b]/70 p-4 rounded-xl border border-white/5">
              <label htmlFor="goal-current-level" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Trình Độ Hiện Tại
              </label>
              <select
                id="goal-current-level"
                value={currentLevel}
                onChange={e => setCurrentLevel(e.target.value)}
                className="w-full bg-[#0f172a] border border-white/10 rounded-lg p-2.5 text-white font-medium focus:border-brand-primary outline-none"
              >
                {CEFR_LEVELS.slice(0, 6).map(lvl => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Tiến độ trong level:</span>
                  <span className="font-bold text-cyan-400">{Math.round(progressWithinLevel * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={progressWithinLevel}
                  onChange={e => setProgressWithinLevel(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="bg-[#1e293b]/70 p-4 rounded-xl border border-white/5">
              <label htmlFor="goal-target-level" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Mục Tiêu Đạt Đến
              </label>
              <select
                id="goal-target-level"
                value={targetLevel}
                onChange={e => setTargetLevel(e.target.value)}
                className="w-full bg-[#0f172a] border border-white/10 rounded-lg p-2.5 text-white font-medium focus:border-brand-primary outline-none"
              >
                {CEFR_LEVELS.slice(1).map(lvl => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
              <div className="mt-3 text-xs text-gray-400">
                <span>Khoảng cách mục tiêu: </span>
                <span className="text-white font-semibold">{currentLevel} → {targetLevel}</span>
              </div>
            </div>

            <div className="bg-[#1e293b]/70 p-4 rounded-xl border border-white/5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Hạn Chót Dự Kiến
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                className="w-full bg-[#0f172a] border border-white/10 rounded-lg p-2.5 text-white font-medium focus:border-brand-primary outline-none"
              />
              <div className="mt-3 text-xs text-gray-400">
                <span>Tổng số ngày lịch: </span>
                <span className="text-cyan-400 font-bold">{feasibility.diffDays} ngày</span>
              </div>
            </div>
          </div>

          {/* Availability & Weak Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#1e293b]/70 p-4 rounded-xl border border-white/5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                Quỹ Thời Gian Học Hàng Ngày & Hàng Tuần
              </label>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Số giờ học/ngày:</span>
                    <span className="font-bold text-brand-light">{dailyHours} giờ/ngày</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    step="0.5"
                    value={dailyHours}
                    onChange={e => setDailyHours(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                    <span>1h (Bền bỉ)</span>
                    <span>4h (Tiêu chuẩn)</span>
                    <span>8h (Nâng cao)</span>
                    <span>12h (Bootcamp)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Số ngày học trong tuần:</span>
                    <span className="font-bold text-brand-light">{daysPerWeek} ngày/tuần</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="7"
                    step="1"
                    value={daysPerWeek}
                    onChange={e => setDaysPerWeek(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <div className="text-[11px] text-gray-400 mt-1">
                    {daysPerWeek < 7 ? `Có ${7 - daysPerWeek} ngày xả hơi / hồi phục mỗi tuần` : 'Luyện tập toàn bộ 7 ngày/tuần'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#1e293b]/70 p-4 rounded-xl border border-white/5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Kỹ Năng Yếu Cần Tăng Cường (Prioritized Skills)
              </label>
              <p className="text-[11px] text-gray-400 mb-3">
                Các kỹ năng này sẽ được thuật toán ưu tiên phân bổ nhiều slot hơn trong tuần.
              </p>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map(skill => {
                  const isSelected = weakSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleWeakSkill(skill)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                        isSelected
                          ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                          : 'bg-black/20 border-white/5 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {skill.toUpperCase()} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Calculation & Feasibility Banner */}
          <div className="bg-gradient-to-r from-gray-900 to-[#1e1b4b] border border-indigo-500/30 p-4 rounded-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-[11px] text-indigo-400 uppercase font-bold tracking-wider">
                  Ước Tính Giờ Học Cambridge (CEFR Hours Baseline)
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-2xl font-black text-white">{requiredHours.expected}h</span>
                  <span className="text-xs text-gray-400">
                    (Lạc quan: <strong className="text-emerald-400">{requiredHours.optimistic}h</strong> — Thận trọng: <strong className="text-amber-400">{requiredHours.conservative}h</strong>)
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-gray-400 block uppercase font-bold">Tính Khả Thi (Feasibility)</span>
                <div className="inline-flex items-center gap-2 mt-1 px-3 py-1 rounded-full text-xs font-black uppercase"
                  style={{ backgroundColor: `${getStatusColor(feasibility.status)}20`, color: getStatusColor(feasibility.status), border: `1px solid ${getStatusColor(feasibility.status)}60` }}>
                  <span>●</span> {feasibility.status} (Coverage: {Math.round(feasibility.coverageRatio * 100)}%)
                </div>
              </div>
            </div>

            {feasibility.recommendations.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/10 text-xs text-gray-300">
                {feasibility.recommendations.map((rec, idx) => (
                  <p key={idx} className="mt-1 flex items-start gap-1.5 text-gray-300">
                    <span className="text-indigo-400">💡</span> {rec}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* 3 Scenario Cards */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Lựa Chọn Kịch Bản Thực Thi (Scenario Optimizer)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.values(scenarios).map(sc => {
                const isSelected = selectedScenario === sc.type;
                return (
                  <div
                    key={sc.type}
                    onClick={() => applyScenario(sc.type)}
                    className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30'
                        : 'bg-[#1e293b]/50 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-sm text-white">{sc.title}</span>
                        {isSelected && <span className="text-indigo-400 text-xs font-bold">ĐÃ CHỌN</span>}
                      </div>
                      <p className="text-xs text-gray-400 mb-3 leading-relaxed">{sc.description}</p>
                    </div>

                    <div className="space-y-1.5 text-xs pt-3 border-t border-white/10 text-gray-300">
                      <div className="flex justify-between">
                        <span>Cường độ:</span>
                        <strong className="text-white">{sc.dailyHours}h/ngày ({sc.daysPerWeek}d/w)</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Nguy cơ đuối sức:</span>
                        <span className="font-semibold text-amber-400">{sc.burnoutRisk}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Độ phủ (Coverage):</span>
                        <span className="font-bold text-emerald-400">{Math.round(sc.evaluation.coverageRatio * 100)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#1f2937]/50 flex justify-end gap-3">
          <Button variant="unstyled" className="btn-secondary text-xs px-4 py-2" onClick={onClose}>
            Đóng
          </Button>
          <Button
            variant="unstyled"
            className="btn-primary text-xs px-6 py-2 flex items-center gap-2"
            disabled={isSaving}
            onClick={handleActivatePlan}
          >
            {isSaving ? 'Đang kích hoạt...' : '🚀 Kích Hoạt Kế Hoạch Này'}
          </Button>
        </div>

      </div>
    </div>
  );
}
