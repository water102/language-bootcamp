import { memo, useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { reviewFlashcard } from '@/store';
import { speakText, showToast } from '@/runtime/controller';

export default memo(function FlashcardsPage() {
  const dispatch = useDispatch();
  const flashcards = useSelector(state => state.study.flashcards || []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [boxFilter, setBoxFilter] = useState('all');

  const filteredCards = useMemo(() => {
    if (boxFilter === 'all') return flashcards;
    const targetBox = Number(boxFilter);
    return flashcards.filter(c => (c.box || 1) === targetBox);
  }, [flashcards, boxFilter]);

  // Reset index if filtered cards change
  useEffect(() => {
    if (currentIndex >= filteredCards.length) {
      setCurrentIndex(0);
    }
    setIsFlipped(false);
  }, [boxFilter, filteredCards.length]);

  const card = filteredCards[currentIndex];

  const clozeText = useMemo(() => {
    if (!card) return '';
    const chunk = card.chunk || '';
    const example = card.example || '';
    if (!chunk || !example) return `How do you say in English: "${card.meaning || ''}"?`;

    try {
      const regex = new RegExp(chunk.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      if (regex.test(example)) {
        return example.replace(regex, '_______');
      }
    } catch {}
    return `How do you say in English: "${card.meaning}"?`;
  }, [card]);

  const handleReview = (quality) => {
    if (!card) return;
    dispatch(reviewFlashcard({ cardId: card.id, quality }));
    setIsFlipped(false);
    if (filteredCards.length > 1) {
      setCurrentIndex(prev => (prev + 1) % filteredCards.length);
    }
    const daysAdd = quality === 1 ? '1 ngày' : quality === 2 ? '3 ngày' : '7 ngày';
    showToast(`Đã lưu Box ${quality} (+${daysAdd})`);
  };

  const handleNext = () => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex(prev => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex(prev => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleFlip = () => {
    setIsFlipped(prev => !prev);
  };

  return (
    <section className="page-view" id="view-flashcards">
      <div className="view-header">
        <h2>Hệ Thống Flashcards SRS — Active Recall Chunks</h2>
        <p>
          Học theo cụm từ và câu ngữ cảnh hoàn chỉnh (Spaced Repetition System). Không học các từ vựng đơn lẻ không có ngữ cảnh.
        </p>
      </div>

      <div className="flashcards-wrapper">
        <div className="flex justify-between items-center mb-[16px] flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-dim">Lọc theo hộp Leitner:</span>
            <div className="flex gap-1">
              {['all', '1', '2', '3'].map(b => (
                <button
                  key={b}
                  type="button"
                  className={`px-2.5 py-1 text-xs rounded font-semibold transition ${
                    boxFilter === b
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                  onClick={() => setBoxFilter(b)}
                >
                  {b === 'all' ? 'Tất cả' : `Hộp ${b}`}
                </button>
              ))}
            </div>
          </div>
          <span className="font-code text-[13px] text-brand-light font-bold" id="srs-card-counter">
            {filteredCards.length > 0 ? `${currentIndex + 1} / ${filteredCards.length}` : '0 / 0'}
          </span>
        </div>

        {card ? (
          <>
            <div
              className="flashcard-3d-scene"
              id="flashcard-scene"
              onClick={handleFlip}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') handleFlip(); }}
              aria-label="Nhấp để lật flashcard"
            >
              <div className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`} id="flashcard-inner">
                {/* Front Face */}
                <div className="flashcard-face flashcard-front">
                  <div className="flex justify-between items-center w-full mb-[14px]">
                    <span className="text-[11px] uppercase text-dim tracking-[1px] font-bold">
                      Điền cụm từ phù hợp vào chỗ trống
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-amber-300 font-mono">
                      Box {card.box || 1} • Day {card.day || 1}
                    </span>
                  </div>
                  <div className="flashcard-cloze" id="srs-front-cloze">
                    &ldquo;{clozeText}&rdquo;
                  </div>
                  <span className="text-[12px] text-muted mt-4">👉 Bấm để lật thẻ</span>
                </div>

                {/* Back Face */}
                <div className="flashcard-face flashcard-back">
                  <div className="flex justify-between items-center w-full mb-[10px]">
                    <span className="text-[11px] uppercase text-accent-green tracking-[1px] font-bold">
                      Target Collocation / Chunk
                    </span>
                    <button
                      type="button"
                      className="p-1 rounded bg-white/10 hover:bg-white/20 text-indigo-300 text-sm"
                      title="Nghe phát âm chuẩn"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(card.chunk);
                      }}
                    >
                      🔊 Nghe
                    </button>
                  </div>
                  <div className="flashcard-chunk" id="srs-back-chunk">{card.chunk}</div>
                  <div className="flashcard-vi" id="srs-back-vi">{card.meaning}</div>
                  <div className="text-[13px] text-muted italic mt-2" id="srs-back-ex">
                    &ldquo;{card.example}&rdquo;
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-3">
              <Button
                variant="unstyled"
                className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded bg-white/5 hover:bg-white/10"
                onClick={handlePrev}
              >
                ◀ Thẻ trước
              </Button>
              <span className="text-xs text-dim">Bấm phím Cách (Space) để lật</span>
              <Button
                variant="unstyled"
                className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded bg-white/5 hover:bg-white/10"
                onClick={handleNext}
              >
                Thẻ tiếp ▶
              </Button>
            </div>

            <div className="flashcard-actions">
              <Button
                variant="unstyled"
                className="srs-btn again"
                id="srs-again-btn"
                onClick={() => handleReview(1)}
              >
                ❌ Lại (+1 ngày)
              </Button>
              <Button
                variant="unstyled"
                className="srs-btn good"
                id="srs-good-btn"
                onClick={() => handleReview(2)}
              >
                👍 Tốt (+3 ngày)
              </Button>
              <Button
                variant="unstyled"
                className="srs-btn easy"
                id="srs-easy-btn"
                onClick={() => handleReview(3)}
              >
                ⚡ Dễ (+7 ngày)
              </Button>
            </div>
          </>
        ) : (
          <div className="glass-card p-8 text-center text-slate-400">
            <p className="text-base font-semibold mb-2">Không tìm thấy thẻ nào trong mục này.</p>
            <p className="text-xs text-slate-500">
              Hãy chọn bài học trong Starter Pack hoặc nạp bài học AI để có flashcard mới.
            </p>
          </div>
        )}
      </div>
    </section>
  );
});
