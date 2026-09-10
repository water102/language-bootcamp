import { memo, useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { BOOTCAMP_DATA, reviewAndStudyBlock, openDailyLessonBlock } from '@/runtime/controller';

function parseMins(tStr) {
  if (!tStr) return 0;
  const [h, m] = tStr.trim().split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function formatMins(totalMinutes) {
  const h = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const m = String(totalMinutes % 60).padStart(2, '0');
  return `${h}:${m}`;
}

export default memo(function TimelineStrip({ onOpenScheduleEditor }) {
  const currentDay = useSelector(state => state.study?.currentDay || 1);
  const [timeNow, setTimeNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentDayData = useMemo(() => {
    return BOOTCAMP_DATA?.roadmap?.find(r => r.day === currentDay) || BOOTCAMP_DATA?.roadmap?.[0] || {};
  }, [currentDay]);

  const schedule = useMemo(() => {
    return BOOTCAMP_DATA?.dailySchedule || [];
  }, []);

  const curH = timeNow.getHours();
  const curM = timeNow.getMinutes();
  const curS = timeNow.getSeconds();
  const currentTotalSecs = curH * 3600 + curM * 60 + curS;
  const currentTotalMins = curH * 60 + curM;

  // 14h window: 07:00 (420 min) to 23:00 (1380 min) = 960 mins
  const dayStartMins = 420;
  const dayEndMins = 1380;
  const totalMins = 960;

  // Needle position
  const offsetMins = currentTotalMins + (curS / 60) - dayStartMins;
  let needlePct = (offsetMins / totalMins) * 100;
  if (needlePct < 0) needlePct = 0;
  if (needlePct > 100) needlePct = 100;

  const needleFlagText = `${String(curH).padStart(2, '0')}:${String(curM).padStart(2, '0')}`;

  // Parsed blocks & timeline segments
  const { segments, activeBlock } = useMemo(() => {
    const parsedBlocks = schedule.map((blk, idx) => {
      const rawTime = blk.time || '';
      const parts = (rawTime.includes('–') ? rawTime.split('–') : rawTime.split('-')).map(s => s.trim());
      const startM = parseMins(parts[0]);
      const endM = parseMins(parts[1]);
      const durM = blk.durationMinutes || (endM > startM ? endM - startM : 90);
      return {
        ...blk,
        idx: idx + 1,
        startM,
        endM: endM || (startM + durM),
        durM
      };
    }).sort((a, b) => a.startM - b.startM);

    const segs = [];
    let cursorMins = dayStartMins;
    let foundActive = null;

    parsedBlocks.forEach(blk => {
      const bStartSecs = blk.startM * 60;
      const bEndSecs = blk.endM * 60;
      if (currentTotalSecs >= bStartSecs && currentTotalSecs < bEndSecs) {
        foundActive = blk;
      }

      if (blk.startM > cursorMins) {
        const gapM = blk.startM - cursorMins;
        segs.push({
          type: 'break',
          shortName: gapM >= 45 ? `🍽️ Nghỉ (${gapM}m)` : `☕ ${gapM}m`,
          label: `Nghỉ giải lao (${formatMins(cursorMins)}–${formatMins(blk.startM)})`,
          mode: 'break',
          durM: gapM
        });
        cursorMins = blk.startM;
      }

      const cleanTitle = (blk.block || '').replace(/^Khối\s*\d+:\s*/i, '').split('+')[0].split('(')[0].trim();
      segs.push({
        type: 'block',
        id: blk.id,
        rawBlock: blk,
        num: String(blk.idx),
        shortName: cleanTitle || blk.block,
        label: `${blk.block} (${blk.time})`,
        output: blk.output,
        mode: (blk.mode || 'DEEP').toLowerCase(),
        durM: blk.durM
      });
      cursorMins = Math.max(cursorMins, blk.endM);
    });

    if (cursorMins < dayEndMins) {
      const endGapM = dayEndMins - cursorMins;
      segs.push({
        type: 'break',
        shortName: `🌙 Nghỉ (${endGapM}m)`,
        label: `Thời gian tự do / Nghỉ ngơi (${formatMins(cursorMins)}–23:00)`,
        mode: 'break',
        durM: endGapM
      });
    }

    return { segments: segs, activeBlock: foundActive };
  }, [schedule, currentTotalSecs]);

  const activeTagClass = activeBlock ? (activeBlock.mode || 'deep').toLowerCase() : 'break';
  const activeTagText = activeBlock ? `⚡ ${activeBlock.block}` : '☕ Nghỉ & Nạp Năng Lượng';

  const objectiveText = activeBlock
    ? `${activeBlock.block}: ${activeBlock.output}`
    : `🎯 Mục tiêu Day ${currentDay} (${currentDayData.level || 'C1'}): Ngữ pháp "${currentDayData.grammar || 'C1 Grammar'}" & ${currentDayData.vocab || 'Vocab Chunks'}`;

  const handleJump = useCallback(() => {
    reviewAndStudyBlock(activeBlock || schedule[0]);
  }, [activeBlock, schedule]);

  return (
    <div className="global-timeline-strip" id="global-timeline-strip">
      <div className="global-timeline-header">
        <div className="gt-header-left">
          <span className="live-pulse-dot"></span>
          <span className="gt-title" id="global-timeline-title">{"Tiến Trình 14 Giờ Trong Ngày"}</span>
          <span className={`timeline-active-tag ${activeTagClass}`} id="timeline-active-tag">
            {activeTagText}
          </span>
          <Button
            variant="unstyled"
            className="icon-tool-btn text-[12px] px-2.5 py-1 bg-[rgba(255,255,255,0.08)] rounded hover:bg-[rgba(255,255,255,0.15)] text-[#cbd5e1] flex items-center gap-1 ml-2 transition"
            id="timeline-edit-schedule-btn"
            title="Chỉnh sửa lịch học (Kéo thả, đổi giờ, B1->C1 8H)"
            onClick={onOpenScheduleEditor}
          >
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
            {segments.map((seg, idx) => {
              const segWidthPct = (seg.durM / totalMins) * 100;
              const titleTooltip = seg.output ? `${seg.label} • Mục tiêu: ${seg.output} • ${seg.durM} phút` : `${seg.label} • ${seg.durM} phút`;

              if (seg.type === 'block') {
                return (
                  <div
                    key={idx}
                    id={`timeline-seg-${seg.id}`}
                    className={`timeline-block-seg ${seg.mode}`}
                    style={{ width: `${segWidthPct}%` }}
                    title={titleTooltip}
                    onClick={() => openDailyLessonBlock(seg.rawBlock)}
                  >
                    <span className="seg-full-label">
                      <strong>{`${seg.num}.`}</strong> {seg.shortName}
                    </span>
                  </div>
                );
              }
              return (
                <div
                  key={idx}
                  className={`timeline-block-seg ${seg.mode}`}
                  style={{ width: `${segWidthPct}%` }}
                  title={titleTooltip}
                >
                  <span className="seg-break-text">{seg.shortName}</span>
                </div>
              );
            })}

            <div className="timeline-needle" id="timeline-live-needle" style={{ left: `${needlePct}%` }}>
              <div className="needle-flag" id="needle-flag-text">{needleFlagText}</div>
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

        <div className="timeline-objective-banner" id="timeline-current-objective-bar">
          <div className="timeline-obj-content">
            <span className="timeline-obj-badge">{"🎯 Mục tiêu khối:"}</span>
            <span className="timeline-obj-text" id="timeline-current-objective-text">
              {objectiveText}
            </span>
          </div>
          <div className="timeline-obj-meta">
            <span className="timeline-obj-day-pill" id="timeline-current-day-pill">
              {`Day ${currentDay} (${currentDayData.level || 'C1'})`}
            </span>
            <Button
              variant="unstyled"
              className="timeline-obj-jump-btn"
              id="timeline-obj-jump-btn"
              onClick={handleJump}
            >
              <span>{"🚀 Mở công cụ"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});
