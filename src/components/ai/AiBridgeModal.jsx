import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { PromptBuilder } from '@/core/ai/promptBuilder.js';
import { AiResponseValidator } from '@/core/ai/validator.js';
import { DiffEngine } from '@/core/ai/diffEngine.js';
import { localStore } from '@/core/storage/localStorageAdapter.js';
import { indexedDb, STORES } from '@/core/storage/indexedDbAdapter.js';
import { calculateCanonicalHash } from '@/core/domain/hashing.js';
import { BOOTCAMP_CURRICULUM_TEMPLATE } from '@/core/curriculum/bootcamp120Template.js';
import { DOMAIN_EVENTS } from '@/core/domain/constants.js';
import { eventBus } from '@/core/events/eventBus.js';

export default function AiBridgeModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('prompt'); // 'prompt' | 'import'
  const [weekNumber, setWeekNumber] = useState(1);
  const [promptText, setPromptText] = useState('');
  const [copied, setCopied] = useState(false);
  const [pastedJson, setPastedJson] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [diffResult, setDiffResult] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [canonicalHash, setCanonicalHash] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    loadPlanData();
  }, [weekNumber]);

  const loadPlanData = async () => {
    const summary = localStore.get('activePlanSummary');
    const planId = summary?.planId;

    let plan = null;
    if (planId) {
      plan = await indexedDb.get(STORES.PLANS, planId);
    }
    setActivePlan(plan);

    // Calculate canonical input hash of plan
    const hash = await calculateCanonicalHash({
      planId: planId || 'plan_default',
      targetLevel: summary?.targetLevel || 'C1',
      dailyHours: summary?.dailyHours || 2,
      weekNumber
    });
    setCanonicalHash(hash);

    // Filter slots for selected week
    const startDay = (weekNumber - 1) * 7 + 1;
    const endDay = weekNumber * 7;
    const weekSlots = (plan?.slots || []).filter(s => s.sourceDay >= startDay && s.sourceDay <= endDay);

    // Get curriculum days for reference
    const days = [];
    for (let d = startDay; d <= endDay; d++) {
      const dayData = BOOTCAMP_CURRICULUM_TEMPLATE.getDay(d);
      if (dayData) days.push(dayData);
    }

    const generated = PromptBuilder.buildWeeklyDetailPrompt({
      weekNumber,
      planId: planId || 'plan_default',
      inputHash: hash,
      currentLevel: summary?.currentLevel || 'A2',
      targetLevel: summary?.targetLevel || 'C1',
      slots: weekSlots.length > 0 ? weekSlots : [
        { slotId: `slot_w${weekNumber}_1`, date: '2026-03-01', startTime: '08:00', endTime: '09:30', durationMinutes: 90, assignedSkill: 'grammar', sourceDay: startDay }
      ],
      curriculumDays: days
    });

    setPromptText(generated);
  };

  const handleCopyPrompt = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(promptText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  const handleValidateJson = () => {
    if (!pastedJson.trim()) return;

    // Build valid slot IDs & max durations
    const slotIds = new Set((activePlan?.slots || []).map(s => s.slotId));
    const maxDurations = {};
    (activePlan?.slots || []).forEach(s => {
      maxDurations[s.slotId] = s.durationMinutes;
    });

    const result = AiResponseValidator.validate(pastedJson, {
      expectedInputHash: canonicalHash,
      expectedPlanId: activePlan?.planId,
      validSlotIds: slotIds,
      maxDurationsBySlot: maxDurations
    });

    setValidationResult(result);

    if (result.validSessions.length > 0) {
      const diff = DiffEngine.computeDiff([], result.validSessions);
      setDiffResult(diff);
    } else {
      setDiffResult(null);
    }
  };

  const handleApplyImport = async () => {
    if (!validationResult || validationResult.validSessions.length === 0) return;

    setIsImporting(true);
    try {
      // Save valid sessions content to IndexedDB
      for (const session of validationResult.validSessions) {
        await indexedDb.put('studyLogs', {
          logId: `ai_content_${session.slotId}`,
          slotId: session.slotId,
          title: session.title,
          objectives: session.objectives,
          activities: session.activities,
          expectedOutput: session.expectedOutput,
          source: 'AI_IMPORTED',
          importedAt: new Date().toISOString()
        });
      }

      eventBus.publish(DOMAIN_EVENTS.PLAN_IMPORTED, {
        importedCount: validationResult.validSessions.length,
        weekNumber
      });

      alert(`Đã nạp thành công ${validationResult.validSessions.length} phiên học vào kế hoạch!`);
      onClose();
    } catch (e) {
      console.error('Import failed:', e);
      alert('Lỗi nạp bài học: ' + e.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">

        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#1f2937]/50">
          <div>
            <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
              <span>🤖</span> AI Bridge Contract & Trạm Nạp Bài Học (Fixed-Slots)
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Sinh prompt có cấu trúc bảo vệ slot cố định, kiểm định JSON chặt chẽ và nạp bài học từ ChatGPT / Claude / Gemini
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition">
            ✕
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-white/10 bg-[#0f172a] px-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('prompt')}
            className={`py-3 px-4 border-b-2 font-bold transition ${
              activeTab === 'prompt'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            📋 1. Tạo & Sao Chép Prompt Cho AI
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`py-3 px-4 border-b-2 font-bold transition ${
              activeTab === 'import'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            📥 2. Nạp Phản Hồi AI (Validate & Import)
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-sm">

          {activeTab === 'prompt' ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-[#1e293b]/70 p-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <label className="text-xs text-gray-400 font-semibold uppercase">Chọn Tuần Học:</label>
                  <select
                    value={weekNumber}
                    onChange={e => setWeekNumber(parseInt(e.target.value))}
                    className="bg-[#0f172a] border border-white/10 rounded-lg px-3 py-1.5 text-white font-bold text-xs outline-none"
                  >
                    {Array.from({ length: 17 }, (_, i) => i + 1).map(w => (
                      <option key={w} value={w}>Tuần {w} (Days {(w - 1) * 7 + 1}–{w * 7})</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <a href="https://chatgpt.com" target="_blank" rel="noreferrer" className="text-[11px] text-gray-400 hover:text-white px-2 py-1 rounded bg-white/5 border border-white/10">
                    Mở ChatGPT ↗
                  </a>
                  <a href="https://claude.ai" target="_blank" rel="noreferrer" className="text-[11px] text-gray-400 hover:text-white px-2 py-1 rounded bg-white/5 border border-white/10">
                    Mở Claude ↗
                  </a>
                  <a href="https://gemini.google.com" target="_blank" rel="noreferrer" className="text-[11px] text-gray-400 hover:text-white px-2 py-1 rounded bg-white/5 border border-white/10">
                    Mở Gemini ↗
                  </a>
                </div>
              </div>

              <div className="relative">
                <textarea
                  id="ai-prompt-preview"
                  readOnly
                  value={promptText}
                  className="w-full h-80 bg-[#0b0f19] border border-white/10 rounded-xl p-4 font-mono text-xs text-gray-300 outline-none leading-relaxed resize-none"
                />
                <Button
                  variant="unstyled"
                  onClick={handleCopyPrompt}
                  className="absolute top-3 right-3 btn-primary text-xs px-4 py-1.5 flex items-center gap-1.5 shadow-lg"
                >
                  {copied ? '✓ Đã Sao Chép!' : '📋 Sao Chép Prompt'}
                </Button>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                💡 <strong>Quy trình:</strong> Sao chép prompt này sang ChatGPT, Claude hoặc Gemini. AI sẽ nhận các slot cố định đã chia và trả về duy nhất khối JSON chứa bài học tương ứng. Sau đó chuyển sang tab <strong>"2. Nạp Phản Hồi AI"</strong> để dán kết quả.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Dán Khối JSON Phản Hồi Từ AI:
                </label>
                <textarea
                  id="ai-json-paste"
                  value={pastedJson}
                  onChange={e => setPastedJson(e.target.value)}
                  placeholder="Dán mã JSON trả về từ AI vào đây (có thể bao gồm cả ```json ... ```)..."
                  className="w-full h-44 bg-[#0b0f19] border border-white/10 rounded-xl p-4 font-mono text-xs text-gray-300 outline-none focus:border-indigo-500 leading-relaxed resize-none"
                />
              </div>

              <div className="flex justify-between items-center">
                <Button
                  variant="unstyled"
                  onClick={handleValidateJson}
                  className="btn-secondary text-xs px-5 py-2 flex items-center gap-2"
                >
                  🔍 Kiểm Tra & Xác Thực JSON (Validate)
                </Button>

                {validationResult && (
                  <div className="flex items-center gap-2 text-xs">
                    {validationResult.valid ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <span>✓</span> Hợp lệ ({validationResult.validCount} session)
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <span>⚠</span> Phát hiện {validationResult.errors.length} lỗi
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Validation Errors Display */}
              {validationResult && validationResult.errors.length > 0 && (
                <div className="p-3 bg-rose-950/30 border border-rose-500/40 rounded-xl text-xs text-rose-300 space-y-1">
                  <div className="font-bold text-rose-400">Các lỗi cần lưu ý:</div>
                  {validationResult.errors.map((err, i) => (
                    <div key={i}>• {err}</div>
                  ))}
                </div>
              )}

              {/* Diff Preview */}
              {diffResult && (
                <div className="p-4 bg-[#1e293b]/70 border border-white/10 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs font-bold text-white">
                    <span>Xem Trước Thay Đổi (Diff Preview):</span>
                    <span className="text-indigo-400">{diffResult.totalChanges} mục thay đổi</span>
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 text-xs text-gray-300">
                    {diffResult.added.map(s => (
                      <div key={s.slotId} className="flex justify-between p-2 rounded bg-emerald-950/20 border border-emerald-500/20">
                        <span className="font-semibold text-emerald-300">+ {s.newTitle}</span>
                        <span className="text-dim">({s.newActivitiesCount} hoạt động)</span>
                      </div>
                    ))}
                    {diffResult.updated.map(s => (
                      <div key={s.slotId} className="flex justify-between p-2 rounded bg-amber-950/20 border border-amber-500/20">
                        <span className="font-semibold text-amber-300">~ {s.newTitle}</span>
                        <span className="text-dim">({s.oldActivitiesCount} → {s.newActivitiesCount} hoạt động)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#1f2937]/50 flex justify-end gap-3">
          <Button variant="unstyled" className="btn-secondary text-xs px-4 py-2" onClick={onClose}>
            Đóng
          </Button>
          {activeTab === 'import' && validationResult?.valid && (
            <Button
              variant="unstyled"
              disabled={isImporting}
              onClick={handleApplyImport}
              className="btn-primary text-xs px-6 py-2 flex items-center gap-2"
            >
              {isImporting ? 'Đang nạp...' : '🚀 Nhập Bài Học Vào Lịch'}
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}
