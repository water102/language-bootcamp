import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { highlightSchedulePanel, switchCurrentDay, speakText, showToast, appState } from '@/runtime/controller';
export default memo(function FlashcardsPage() { return (<section className="page-view" id="view-flashcards">
<div className="view-header">
<h2>{"Hệ Thống Flashcards SRS — Active Recall Chunks"}</h2>
<p>{"Học theo cụm từ và câu ngữ cảnh hoàn chỉnh (Spaced Repetition System). Không học các từ vựng đơn lẻ không có ngữ cảnh."}</p>
</div>
<div className="flashcards-wrapper">
<div className="flex justify-between items-center mb-[16px]" >
<span className="text-[13px] text-dim" >{"Chạm hoặc nhấp vào thẻ để lật xem đáp án"}</span>
<span className="font-code text-[13px] text-brand-light font-bold"  id="srs-card-counter">{"1 / 140"}</span>
</div>
<div className="flashcard-3d-scene" id="flashcard-scene">
<div className="flashcard-inner" id="flashcard-inner">

<div className="flashcard-face flashcard-front">
<span className="text-[11px] uppercase text-dim tracking-[1px] mb-[14px] font-bold" >{"\n                  Điền cụm từ phù hợp vào chỗ trống\n                "}</span>
<div className="flashcard-cloze" id="srs-front-cloze">{"\"Loading cloze sentence...\""}</div>
<span className="text-[12px] text-muted" >{"👉 Bấm để lật thẻ"}</span>
</div>

<div className="flashcard-face flashcard-back">
<span className="text-[11px] uppercase text-accent-green tracking-[1px] mb-[10px] font-bold" >{"\n                  Target Collocation / Chunk\n                "}</span>
<div className="flashcard-chunk" id="srs-back-chunk">{"chunk name"}</div>
<div className="flashcard-vi" id="srs-back-vi">{"nghĩa tiếng việt"}</div>
<div className="text-[13px] text-muted italic"  id="srs-back-ex">{"\"Example sentence in context\""}</div>
</div>
</div>
</div>
<div className="flashcard-actions">
<Button variant="unstyled" className="srs-btn again" id="srs-again-btn">{"❌ Lại (+1 ngày)"}</Button>
<Button variant="unstyled" className="srs-btn good" id="srs-good-btn">{"👍 Tốt (+3 ngày)"}</Button>
<Button variant="unstyled" className="srs-btn easy" id="srs-easy-btn">{"⚡ Dễ (+7 ngày)"}</Button>
</div>
</div>
</section>); });
