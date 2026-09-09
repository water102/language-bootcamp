import { useState, useEffect } from 'react';
import { ChibiStateMachine, CHIBI_EMOTIONS } from '@/core/companion/chibiStateMachine.js';
import { GamificationEngine } from '@/core/gamification/gamificationEngine.js';
import { eventBus, DOMAIN_EVENTS } from '@/core/events/eventBus.js';

export default function ChibiCompanionWidget() {
  const [minimized, setMinimized] = useState(false);
  const [chibiState] = useState(() => new ChibiStateMachine());
  const [emotion, setEmotion] = useState(CHIBI_EMOTIONS.HAPPY);
  const [dialogue, setDialogue] = useState(chibiState.currentDialogue);
  const [gameProfile, setGameProfile] = useState(() => GamificationEngine.getProfile());
  const [showSpeech, setShowSpeech] = useState(true);

  useEffect(() => {
    GamificationEngine.initialize();

    const unsub = eventBus.subscribe('*', (eventName, payload) => {
      chibiState.onEvent(eventName, payload);
      setEmotion(chibiState.emotion);
      setDialogue(chibiState.currentDialogue);
      setShowSpeech(true);
      setGameProfile(GamificationEngine.getProfile());
    });

    return () => unsub();
  }, []);

  const handleClickChibi = () => {
    // Cycle dialogue
    const tips = [
      "Học theo cụm từ (chunks) giúp bạn nói mượt hơn 300% so với học từng từ đơn lẻ đấy!",
      "Hôm nay bạn đã luyện nói Take 1 & Take 2 chưa? Nghe lại giọng mình giúp cải thiện phát âm cực nhanh!",
      "Đừng ngại mắc lỗi! Mỗi lỗi sai lặp lại 3 lần ghi vào Sổ Lỗi Vàng chính là điểm bứt phá tiếp theo!",
      "Nghỉ ngơi 10–15 phút sau mỗi 90 phút học sâu giúp não bộ củng cố synap thần kinh hiệu quả nhất!"
    ];
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setEmotion(CHIBI_EMOTIONS.CHEERING);
    setDialogue(randomTip);
    setShowSpeech(true);
  };

  if (minimized) {
    return (
      <div
        onClick={() => setMinimized(false)}
        className="fixed bottom-5 left-5 lg:left-[calc(var(--sidebar-w)+20px)] z-[999] bg-[#1e1b4b] border border-indigo-500/50 rounded-full p-2.5 shadow-2xl cursor-pointer hover:scale-110 transition flex items-center gap-2 text-white"
        title="Mở Bạn Đồng Hành Chibi"
      >
        <span className="text-xl">✨</span>
        <span className="text-xs font-bold font-display pr-2">Aoi (Lv.{gameProfile.userLevel})</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-5 left-5 lg:left-[calc(var(--sidebar-w)+20px)] z-[999] flex flex-col items-start pointer-events-none select-none">
      
      {/* Speech Bubble */}
      {showSpeech && (
        <div className="pointer-events-auto max-w-xs mb-2 bg-[#111827]/95 border border-indigo-500/40 rounded-2xl p-3 shadow-2xl backdrop-blur-md text-white text-xs relative animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex justify-between items-center text-[10px] text-indigo-400 font-bold mb-1">
            <span>✨ AOI • TRỢ LÝ HỌC C1</span>
            <button
              onClick={() => setShowSpeech(false)}
              className="text-gray-400 hover:text-white ml-2 text-xs"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-200 leading-relaxed">{dialogue}</p>
          {/* Arrow */}
          <div className="absolute -bottom-2 left-6 w-3 h-3 bg-[#111827] border-r border-b border-indigo-500/40 transform rotate-45" />
        </div>
      )}

      {/* Chibi Card */}
      <div className="pointer-events-auto bg-gradient-to-b from-[#1e1b4b]/90 to-[#0f172a]/95 border border-indigo-500/40 rounded-3xl p-3 shadow-2xl backdrop-blur-md flex items-center gap-3">
        
        {/* Animated SVG Chibi Character */}
        <div
          onClick={handleClickChibi}
          className="relative cursor-pointer hover:scale-105 transition transform active:scale-95 group"
          title="Nhấp để trò chuyện cùng Aoi!"
        >
          <svg width="60" height="60" viewBox="0 0 100 100" className="drop-shadow-lg">
            {/* Hair Back */}
            <circle cx="50" cy="50" r="42" fill="#4338ca" />
            
            {/* Face */}
            <circle cx="50" cy="52" r="32" fill="#fed7aa" />
            
            {/* Hair Front Bangs */}
            <path d="M 22 45 Q 50 20 78 45 Q 65 30 50 32 Q 35 30 22 45" fill="#4f46e5" />
            
            {/* Cheeks Blush */}
            <circle cx="32" cy="58" r="6" fill="#fb7185" opacity="0.6" />
            <circle cx="68" cy="58" r="6" fill="#fb7185" opacity="0.6" />
            
            {/* Eyes depending on emotion */}
            {emotion === CHIBI_EMOTIONS.CHEERING ? (
              <>
                {/* Happy closed curve eyes */}
                <path d="M 30 52 Q 37 46 44 52" stroke="#1e1b4b" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M 56 52 Q 63 46 70 52" stroke="#1e1b4b" strokeWidth="4" fill="none" strokeLinecap="round" />
              </>
            ) : (
              <>
                {/* Anime big sparkling eyes */}
                <circle cx="37" cy="50" r="6.5" fill="#1e1b4b" />
                <circle cx="63" cy="50" r="6.5" fill="#1e1b4b" />
                <circle cx="35" cy="48" r="2.5" fill="#ffffff" />
                <circle cx="61" cy="48" r="2.5" fill="#ffffff" />
              </>
            )}
            
            {/* Mouth */}
            {emotion === CHIBI_EMOTIONS.CHEERING ? (
              <path d="M 44 62 Q 50 70 56 62 Z" fill="#e11d48" />
            ) : (
              <path d="M 46 62 Q 50 66 54 62" stroke="#1e1b4b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            )}

            {/* Little Ahoge / Hair tuft */}
            <path d="M 50 18 Q 45 6 56 8 Q 50 14 50 18" fill="#6366f1" />
          </svg>

          {/* Level Badge */}
          <span className="absolute -bottom-1 -right-1 bg-amber-500 text-black text-[10px] font-black px-1.5 py-0.2 rounded-full border border-black shadow">
            Lv.{gameProfile.userLevel}
          </span>
        </div>

        {/* Stats & Actions */}
        <div className="text-xs space-y-1 pr-1">
          <div className="flex items-center justify-between gap-3 font-bold text-white">
            <span className="font-display">Aoi Companion</span>
            <button
              onClick={() => setMinimized(true)}
              className="text-gray-400 hover:text-white text-xs px-1"
              title="Thu nhỏ"
            >
              −
            </button>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-gray-300">
            <span className="flex items-center gap-1 font-semibold text-amber-400">
              🪙 {gameProfile.coins}
            </span>
            <span className="flex items-center gap-1 font-semibold text-emerald-400">
              ⚡ {gameProfile.totalXp} XP
            </span>
            <span className="flex items-center gap-1 font-semibold text-pink-400">
              ❤️ Bond {gameProfile.bondLevel}
            </span>
          </div>

          {/* Progress bar to next level */}
          <div className="w-32 h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-indigo-400"
              style={{ width: `${(gameProfile.totalXp % 250) / 2.5}%` }}
            />
          </div>
        </div>

      </div>

    </div>
  );
}
