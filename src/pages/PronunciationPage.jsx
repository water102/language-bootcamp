import { memo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { IPA_GROUPS, IPA_LESSONS, generateExtraSentence } from '@/data/ipaData';
import { togglePronunciationCompleted } from '@/store';
import { speakText, showToast } from '@/runtime/controller';

export default memo(function PronunciationPage() {
  const dispatch = useDispatch();
  const pronunciationCompleted = useSelector(state => state.study.pronunciationCompleted || {});

  const [activeLesson, setActiveLesson] = useState(null);

  const completedCount = IPA_LESSONS.filter(l => pronunciationCompleted[l.id] === true).length;

  const handleToggleDone = (e, lesson) => {
    e.stopPropagation();
    dispatch(togglePronunciationCompleted(lesson.id));
    const isNowDone = !pronunciationCompleted[lesson.id];
    showToast(isNowDone ? `✓ Đã học âm /${lesson.symbol}/!` : `○ Bỏ đánh dấu âm /${lesson.symbol}/.`);
  };

  const playWordsAudio = (lesson, rate = 0.95) => {
    speakText(lesson.words, 'en-GB', rate);
  };

  const playDiscreteWordsAudio = (lesson) => {
    const words = lesson.words.split(',').map(w => w.trim());
    let delay = 0;
    words.forEach(w => {
      setTimeout(() => speakText(w, 'en-GB', 0.8), delay);
      delay += 1100;
    });
  };

  const playSentenceAudio = (sentence, rate = 0.95) => {
    speakText(sentence, 'en-GB', rate);
  };

  return (
    <section className="page-view" id="view-pronunciation">
      <div className="view-header">
        <h2>Kế Hoạch Luyện Phát Âm & Cơ Học Nghe Hiểu (Pronunciation Mechanics)</h2>
        <p>
          Phát âm được rèn luyện để tăng độ rõ ràng (intelligibility) và phục vụ cho khả năng nghe hiểu, không phải bắt chước chất giọng giả tạo.
        </p>
      </div>

      <div className="glass-card mb-[24px]">
        <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
          <h2 className="text-xl font-bold text-white">Bảng 44 âm IPA tiếng Anh</h2>
          <div className="ipa-progress flex items-center gap-3">
            <strong className="text-sm text-indigo-300 font-mono">Đã học {completedCount}/44 âm</strong>
            <progress max="44" value={completedCount} className="w-32 h-2 rounded bg-slate-700" aria-label="Tiến độ học IPA"></progress>
          </div>
        </div>
        <p className="ipa-note text-xs text-muted mb-4">
          Chọn một âm để mở bài luyện chi tiết. Bảng theo quy ước Anh–Anh truyền thống: 12 nguyên âm đơn, 8 nguyên âm đôi và 24 phụ âm. Đánh dấu sau khi luyện xong để lưu tiến độ.
        </p>

        <div id="ipa-course">
          {IPA_GROUPS.map((group, gIdx) => (
            <div key={group} className="mb-6">
              <h3 className="text-base font-semibold text-slate-200 mb-3 border-b border-white/5 pb-1">
                {group}
              </h3>
              <div className="ipa-grid grid grid-cols-[repeat(auto-fill,_minmax(120px,_1fr))] gap-2.5">
                {IPA_LESSONS.filter(l => l.group === gIdx).map(l => {
                  const isDone = pronunciationCompleted[l.id] === true;
                  return (
                    <button
                      key={l.id}
                      type="button"
                      className={`ipa-tile p-3 rounded-lg border text-left transition flex flex-col justify-between h-24 ${
                        isDone
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-white/5 border-white/10 hover:border-indigo-500/50 text-white'
                      }`}
                      onClick={() => setActiveLesson(l)}
                      aria-label={`Học âm /${l.symbol}/, ${isDone ? 'đã học' : 'chưa học'}`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <strong className="text-lg font-mono text-white">/{l.symbol}/</strong>
                        <span
                          className="ipa-quick-check cursor-pointer p-0.5 hover:scale-110 transition"
                          onClick={(e) => handleToggleDone(e, l)}
                          title={isDone ? 'Bỏ đánh dấu đã học' : 'Đánh dấu đã học'}
                        >
                          {isDone ? '✅' : '⭕'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 truncate">{l.words.split(',')[0]}</span>
                      <small className="text-[10px] text-slate-500 font-medium">
                        {isDone ? '✓ Đã học' : 'Mở bài học →'}
                      </small>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* IPA Lesson Modal */}
      {activeLesson && (
        <div
          className="modal-overlay open"
          style={{ display: 'flex' }}
          onClick={() => setActiveLesson(null)}
        >
          <div
            className="modal-card"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
              <div>
                <h2 className="text-2xl font-bold font-mono text-white">Luyện âm /{activeLesson.symbol}/</h2>
                <p className="text-xs text-indigo-300">{IPA_GROUPS[activeLesson.group]} · 5–10 phút</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setActiveLesson(null)}
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4 text-sm leading-relaxed text-slate-200">
              <div>
                <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wide mb-1">
                  1. Khẩu hình & cách tạo âm
                </h3>
                <p className="p-3 rounded bg-white/5 border border-white/5">{activeLesson.mouth}</p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wide mb-1">
                  2. Luyện từ và phân biệt âm
                </h3>
                <p className="ipa-examples p-2.5 rounded bg-white/5 font-semibold text-white">
                  {activeLesson.words}
                </p>
                <div className="flex gap-2 flex-wrap my-2">
                  <Button variant="unstyled" className="btn-secondary text-xs py-1.5 px-3" onClick={() => playWordsAudio(activeLesson)}>
                    🔊 Nghe từ mẫu
                  </Button>
                  <Button variant="unstyled" className="btn-secondary text-xs py-1.5 px-3" onClick={() => playWordsAudio(activeLesson, 0.65)}>
                    🐢 Nghe chậm (0.7x)
                  </Button>
                  <Button variant="unstyled" className="btn-secondary text-xs py-1.5 px-3" onClick={() => playDiscreteWordsAudio(activeLesson)}>
                    🎯 Nghe từng âm
                  </Button>
                </div>
                <p className="text-xs text-muted mt-1">
                  Đọc đối chiếu: <strong>{activeLesson.contrast}</strong>. Lặp lại 5 lượt và chú ý vị trí lưỡi, môi hoặc độ rung.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wide mb-1">
                  3. Đưa âm vào câu thực tế
                </h3>
                <p className="ipa-examples p-2.5 rounded bg-white/5 text-white font-medium">
                  {activeLesson.sentence}
                </p>
                <div className="flex gap-2 flex-wrap my-2">
                  <Button variant="unstyled" className="btn-secondary text-xs py-1.5 px-3" onClick={() => playSentenceAudio(activeLesson.sentence)}>
                    🔊 Nghe câu mẫu
                  </Button>
                  <Button variant="unstyled" className="btn-secondary text-xs py-1.5 px-3" onClick={() => playSentenceAudio(activeLesson.sentence, 0.65)}>
                    🐢 Nghe chậm (0.7x)
                  </Button>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-3 mt-3">
                  <strong className="text-indigo-400 text-xs block mb-2">🎯 Các câu nghe mẫu bổ sung:</strong>
                  <div className="flex flex-col gap-2 text-xs">
                    <div className="flex justify-between items-center gap-2">
                      <span>1. {generateExtraSentence(activeLesson.symbol, activeLesson.words, 1)}</span>
                      <Button
                        variant="unstyled"
                        className="btn-secondary text-xs py-1 px-2 shrink-0"
                        onClick={() => playSentenceAudio(generateExtraSentence(activeLesson.symbol, activeLesson.words, 1), 0.9)}
                      >
                        🔊 Nghe
                      </Button>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span>2. {generateExtraSentence(activeLesson.symbol, activeLesson.words, 2)}</span>
                      <Button
                        variant="unstyled"
                        className="btn-secondary text-xs py-1 px-2 shrink-0"
                        onClick={() => playSentenceAudio(generateExtraSentence(activeLesson.symbol, activeLesson.words, 2), 0.9)}
                      >
                        🔊 Nghe
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-white">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                    checked={pronunciationCompleted[activeLesson.id] === true}
                    onChange={() => dispatch(togglePronunciationCompleted(activeLesson.id))}
                  />
                  <span>Tôi đã học và luyện bài này</span>
                </label>
                <Button variant="unstyled" className="btn-primary text-xs py-1.5 px-4" onClick={() => setActiveLesson(null)}>
                  Hoàn thành
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reference Grids */}
      <div className="pronunciation-reference-grid grid grid-cols-[1fr_1.5fr] gap-[24px]">
        <div className="glass-card">
          <h3 className="font-display text-[18px] text-[#fff] mb-[14px]">
            ⏱️ 15 Phút Khởi Động Hàng Ngày
          </h3>
          <div className="flex flex-col gap-[12px]">
            <div className="p-[12px] rounded-[8px] bg-[rgba(255,255,255,0.03)]">
              <strong className="text-brand-light">3 phút — Khởi động cơ miệng:</strong>
              <p className="text-[13px] text-muted mt-[2px]">
                Luyện các âm dễ nuốt hoặc sai: /θ/, /ð/, /ʃ/, /tʃ/, âm đuôi -ed và phụ âm cuối.
              </p>
            </div>
            <div className="p-[12px] rounded-[8px] bg-[rgba(255,255,255,0.03)]">
              <strong className="text-accent-amber">4 phút — Trọng âm từ:</strong>
              <p className="text-[13px] text-muted mt-[2px]">
                Nói to 10 từ mục tiêu nhiều âm tiết, nhấn đúng trọng âm chính.
              </p>
            </div>
            <div className="p-[12px] rounded-[8px] bg-[rgba(255,255,255,0.03)]">
              <strong className="text-accent-cyan">4 phút — Nhịp điệu câu (Rhythm):</strong>
              <p className="text-[13px] text-muted mt-[2px]">
                Shadow 4-6 câu theo phách: từ mang thông tin (content words) nhấn mạnh, từ chức năng giảm âm (schwa /ə/).
              </p>
            </div>
            <div className="p-[12px] rounded-[8px] bg-[rgba(255,255,255,0.03)]">
              <strong className="text-accent-green">4 phút — Nối âm & nuốt âm:</strong>
              <p className="text-[13px] text-muted mt-[2px]">
                Lặp lại một câu tự nhiên tốc độ nhanh 10 lần liên tục.
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <h3 className="font-display text-[18px] text-[#fff] mb-[14px]">
            Bản Đồ Cặp Âm Tối Thiểu (Minimal Pairs & Contrasts)
          </h3>
          <div className="pronunciation-reference-grid grid grid-cols-[repeat(auto-fill,_minmax(220px,_1fr))] gap-[12px]">
            <div className="p-[12px] rounded-[8px] bg-[rgba(255,255,255,0.02)] border border-[var(--border-subtle)]">
              <strong className="text-[#fff]">/ɪ/ vs /i:/</strong>
              <p className="text-[13px] text-dim mt-[2px]">ship / sheep, live / leave, fit / feet</p>
              <Button variant="unstyled" className="btn-secondary py-[4px] px-[10px] text-[11px] mt-[6px]" onClick={() => speakText('ship sheep live leave fit feet')}>
                🔊 Nghe
              </Button>
            </div>
            <div className="p-[12px] rounded-[8px] bg-[rgba(255,255,255,0.02)] border border-[var(--border-subtle)]">
              <strong className="text-[#fff]">/s/ vs /ʃ/</strong>
              <p className="text-[13px] text-dim mt-[2px]">see / she, seat / sheet, sock / shock</p>
              <Button variant="unstyled" className="btn-secondary py-[4px] px-[10px] text-[11px] mt-[6px]" onClick={() => speakText('see she seat sheet sock shock')}>
                🔊 Nghe
              </Button>
            </div>
            <div className="p-[12px] rounded-[8px] bg-[rgba(255,255,255,0.02)] border border-[var(--border-subtle)]">
              <strong className="text-[#fff]">/θ/ vs /ð/</strong>
              <p className="text-[13px] text-dim mt-[2px]">think / this, three / there, breath / breathe</p>
              <Button variant="unstyled" className="btn-secondary py-[4px] px-[10px] text-[11px] mt-[6px]" onClick={() => speakText('think this three there breath breathe')}>
                🔊 Nghe
              </Button>
            </div>
            <div className="p-[12px] rounded-[8px] bg-[rgba(255,255,255,0.02)] border border-[var(--border-subtle)]">
              <strong className="text-[#fff]">-ed Endings (/t/, /d/, /ɪd/)</strong>
              <p className="text-[13px] text-dim mt-[2px]">worked /t/, played /d/, waited /ɪd/</p>
              <Button variant="unstyled" className="btn-secondary py-[4px] px-[10px] text-[11px] mt-[6px]" onClick={() => speakText('worked played waited')}>
                🔊 Nghe
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
