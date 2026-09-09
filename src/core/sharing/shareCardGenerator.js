/**
 * Share Card Generator (Canvas & SVG)
 * Spec reference: docs/cefr-learning-planner-spec/09_SHARING_AND_AVATAR.md
 */

export class ShareCardGenerator {
  /**
   * Generate an SVG data URL for a learning achievement or milestone
   * @param {Object} options
   * @param {string} options.title
   * @param {string} options.subtitle
   * @param {string} [options.currentLevel]
   * @param {string} [options.targetLevel]
   * @param {number} [options.streakDays]
   * @param {number} [options.completedHours]
   * @param {string} [options.quote]
   * @param {boolean} [options.includeLevels]
   * @param {boolean} [options.includeStreak]
   * @param {boolean} [options.includeHours]
   * @returns {string} SVG string
   */
  static generateSvg({
    title = 'English C1 Master Milestone',
    subtitle = '120-Day Bootcamp Learning Journey',
    currentLevel = 'B1',
    targetLevel = 'C1',
    streakDays = 1,
    completedHours = 12,
    quote = 'Every mistake analyzed is a step closer to fluency.',
    includeLevels = true,
    includeStreak = true,
    includeHours = true
  } = {}) {
    return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450" style="background:#0b0f19; font-family:system-ui, -apple-system, sans-serif;">
      <defs>
        <linearGradient id="cardBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1e1b4b"/>
          <stop offset="50%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#020617"/>
        </linearGradient>
        <linearGradient id="accentGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#6366f1"/>
          <stop offset="100%" stop-color="#ec4899"/>
        </linearGradient>
      </defs>

      <!-- Card Background with Glow -->
      <rect x="20" y="20" width="760" height="410" rx="28" fill="url(#cardBg)" stroke="rgba(99,102,241,0.3)" stroke-width="2"/>

      <!-- App Header Badge -->
      <rect x="50" y="50" width="180" height="34" rx="17" fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.4)"/>
      <text x="140" y="72" fill="#818cf8" font-size="13" font-weight="bold" text-anchor="middle">ENGLISH C1 BOOTCAMP</text>

      <!-- Main Title -->
      <text x="50" y="130" fill="#ffffff" font-size="28" font-weight="800">${escapeXml(title)}</text>
      <text x="50" y="160" fill="#94a3b8" font-size="15">${escapeXml(subtitle)}</text>

      <!-- Stats Row -->
      <g transform="translate(50, 200)">
        ${includeLevels ? `
          <!-- CEFR Badge -->
          <rect x="0" y="0" width="210" height="95" rx="18" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)"/>
          <text x="20" y="32" fill="#94a3b8" font-size="12">MỤC TIÊU CEFR</text>
          <text x="20" y="70" fill="#38bdf8" font-size="28" font-weight="900">${escapeXml(currentLevel)} → ${escapeXml(targetLevel)}</text>
        ` : ''}

        ${includeStreak ? `
          <!-- Streak Badge -->
          <rect x="230" y="0" width="210" height="95" rx="18" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)"/>
          <text x="250" y="32" fill="#94a3b8" font-size="12">CHUỖI HỌC TẬP</text>
          <text x="250" y="70" fill="#f59e0b" font-size="28" font-weight="900">🔥 ${streakDays} Ngày</text>
        ` : ''}

        ${includeHours ? `
          <!-- Hours Badge -->
          <rect x="460" y="0" width="240" height="95" rx="18" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)"/>
          <text x="480" y="32" fill="#94a3b8" font-size="12">TỔNG THỜI GIAN HỌC</text>
          <text x="480" y="70" fill="#10b981" font-size="28" font-weight="900">⏱️ ${completedHours} Giờ</text>
        ` : ''}
      </g>

      <!-- Inspirational Quote -->
      <text x="50" y="340" fill="#cbd5e1" font-size="14" font-style="italic">“${escapeXml(quote)}”</text>

      <!-- Footer Branding -->
      <line x1="50" y1="370" x2="750" y2="370" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
      <text x="50" y="400" fill="#64748b" font-size="12">Local-First Master Learning Station • Deterministic Cambridge CEFR</text>
      <text x="750" y="400" fill="#818cf8" font-size="12" font-weight="600" text-anchor="end">C1 Mastery Station</text>
    </svg>
    `.trim();
  }

  /**
   * Convert SVG string to downloadable PNG data URL using HTML5 Canvas
   * @param {string} svgString
   * @returns {Promise<string>} PNG Data URL
   */
  static async svgToPngDataUrl(svgString) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 450;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/png'));
      };

      img.onerror = err => {
        URL.revokeObjectURL(url);
        reject(err);
      };

      img.src = url;
    });
  }

  /**
   * Build social share caption
   * @param {Object} options
   * @returns {string}
   */
  static buildCaption({
    title = 'Chinh phục C1 Cambridge',
    currentLevel = 'B1',
    targetLevel = 'C1',
    streakDays = 1,
    completedHours = 12
  }) {
    return `🎯 Mình đang chinh phục mục tiêu tiếng Anh ${currentLevel} → ${targetLevel} cùng trạm học English C1 Bootcamp!\n` +
      `🔥 Chuỗi học liên tục: ${streakDays} ngày | ⏱️ Đã tích luỹ: ${completedHours} giờ học sâu.\n` +
      `#EnglishBootcamp #C1Cambridge #CEFR #EnglishLearner`;
  }
}

function escapeXml(unsafe = '') {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
