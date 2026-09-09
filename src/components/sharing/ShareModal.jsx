import { useState, useEffect, useRef } from 'react';
import { ShareCardGenerator } from '@/core/sharing/shareCardGenerator.js';
import { BrowserCapabilities } from '@/core/adapters/browserCapabilities.js';
import { LocalStorageAdapter } from '@/core/storage/localStorageAdapter.js';

export default function ShareModal({ onClose }) {
  const [includeLevels, setIncludeLevels] = useState(true);
  const [includeStreak, setIncludeStreak] = useState(true);
  const [includeHours, setIncludeHours] = useState(true);
  const [copiedText, setCopiedText] = useState('');
  const [pngUrl, setPngUrl] = useState(null);

  // Retrieve current active plan / user stats from storage
  let activePlan = null;
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('c1_active_plan') : null;
    if (raw) activePlan = JSON.parse(raw);
  } catch (e) {}
  const currentLevel = activePlan?.currentLevel || 'B1';
  const targetLevel = activePlan?.targetLevel || 'C1';

  // Calculate stats
  const streakDays = 1;
  const completedHours = 12;

  const cardData = {
    title: 'Hành Trình Chinh Phục C1 Cambridge',
    subtitle: '120 Ngày Bứt Phá Năng Lực Học Thuật & Giao Tiếp',
    currentLevel,
    targetLevel,
    streakDays,
    completedHours,
    includeLevels,
    includeStreak,
    includeHours
  };

  const svgString = ShareCardGenerator.generateSvg(cardData);
  const caption = ShareCardGenerator.buildCaption(cardData);

  useEffect(() => {
    // Generate PNG from SVG for preview & download
    ShareCardGenerator.svgToPngDataUrl(svgString)
      .then(url => setPngUrl(url))
      .catch(err => console.warn('[Share] PNG conversion error:', err));
  }, [svgString]);

  const handleCopyLink = async () => {
    await BrowserCapabilities.shareOrCopy({
      title: 'English C1 Bootcamp',
      text: 'Trạm học English C1 Bootcamp — 120 Ngày Master Learning Station',
      url: window.location.href
    });
    setCopiedText('Đã sao chép link trang!');
    setTimeout(() => setCopiedText(''), 3000);
  };

  const handleCopyCaption = async () => {
    await navigator.clipboard?.writeText(caption);
    setCopiedText('Đã sao chép nội dung chia sẻ!');
    setTimeout(() => setCopiedText(''), 3000);
  };

  const handleDownloadPng = () => {
    if (!pngUrl) return;
    const a = document.createElement('a');
    a.href = pngUrl;
    a.download = `c1-bootcamp-milestone-${Date.now()}.png`;
    a.click();
  };

  const handleNativeShare = async () => {
    await BrowserCapabilities.shareOrCopy({
      title: 'English C1 Bootcamp Milestone',
      text: caption,
      url: window.location.href
    });
  };

  const handleFacebookShare = () => {
    navigator.clipboard?.writeText(caption);
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(fbUrl, '_blank', 'width=600,height=500');
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden text-white animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#1f2937]/50">
          <div>
            <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
              <span>🌟</span> Chia Sẻ Tiến Độ & Thẻ Thành Tựu
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Tạo thẻ thành tựu học tập cá nhân hoá • Bảo mật tuyệt đối (chỉ chia sẻ thông tin bạn chọn)
            </p>
          </div>
          <button id="close-share-modal-btn" onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Card Preview */}
          <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black/40 flex items-center justify-center p-2">
            {pngUrl ? (
              <img src={pngUrl} alt="Milestone Share Card" className="w-full h-auto rounded-lg" />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: svgString }} className="w-full" />
            )}
          </div>

          {/* Privacy & Customization Toggles */}
          <div className="bg-[#1f2937]/40 border border-white/5 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Tuỳ Chọn Hiển Thị (Bảo Mật Cá Nhân)</h4>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLevels}
                  onChange={e => setIncludeLevels(e.target.checked)}
                  className="rounded border-gray-600 text-indigo-600 focus:ring-0"
                />
                <span className="text-gray-300">Cấp độ CEFR ({currentLevel}→{targetLevel})</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeStreak}
                  onChange={e => setIncludeStreak(e.target.checked)}
                  className="rounded border-gray-600 text-indigo-600 focus:ring-0"
                />
                <span className="text-gray-300">Chuỗi học tập ({streakDays} ngày)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeHours}
                  onChange={e => setIncludeHours(e.target.checked)}
                  className="rounded border-gray-600 text-indigo-600 focus:ring-0"
                />
                <span className="text-gray-300">Tổng giờ học ({completedHours}h)</span>
              </label>
            </div>
          </div>

          {/* Caption Box */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span className="font-semibold">Nội dung bài đăng gợi ý (Caption):</span>
              {copiedText && <span className="text-emerald-400 font-bold">{copiedText}</span>}
            </div>
            <textarea
              readOnly
              value={caption}
              rows={3}
              className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-3 text-xs text-gray-300 focus:outline-none resize-none font-sans"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <button
              onClick={handleDownloadPng}
              className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition cursor-pointer"
            >
              <span>📥</span> Tải Ảnh (.PNG)
            </button>

            <button
              onClick={handleCopyCaption}
              className="py-2.5 px-3 rounded-xl bg-[#1e1b4b] border border-indigo-500/40 hover:bg-[#2e2b6b] text-indigo-200 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>📋</span> Chép Caption
            </button>

            <button
              onClick={handleCopyLink}
              className="py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-200 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>🔗</span> Chép Link Trang
            </button>

            <button
              onClick={handleFacebookShare}
              className="py-2.5 px-3 rounded-xl bg-[#1877F2]/20 border border-[#1877F2]/40 hover:bg-[#1877F2]/30 text-[#1877F2] font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>🌐</span> Chia Sẻ Facebook
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
