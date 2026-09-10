import { memo, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import BOOTCAMP_DATA from '@/data';
import { showToast } from '@/runtime/controller';

export default memo(function AiTutorPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const prompts = useMemo(() => {
    const list = BOOTCAMP_DATA.aiPrompts || [];
    const term = searchTerm.toLowerCase().trim();
    if (!term) return list;

    return list.filter(p =>
      (p.title || '').toLowerCase().includes(term) ||
      (p.description || '').toLowerCase().includes(term) ||
      (p.template || '').toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const handleCopy = async (prompt) => {
    try {
      await navigator.clipboard.writeText(prompt.template);
      showToast(`📋 Đã sao chép: "${prompt.title}"! Hãy dán vào AI.`);
    } catch {
      showToast('Không thể sao chép tự động, vui lòng thử lại.');
    }
  };

  return (
    <section className="page-view" id="view-ai-tutor">
      <div className="view-header">
        <h2>Trạm Prompt Gia Sư AI (ChatGPT / Claude Command Center)</h2>
        <p>
          Bộ 8 Prompt được tinh chỉnh đặc biệt để biến AI thành huấn luyện viên CEFR khắt khe, giáo viên ngữ âm, hoặc giám khảo chấm thi Cambridge.
        </p>
      </div>

      <div className="glass-card mb-[20px] p-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-dim">
          Có <strong>{prompts.length}</strong> câu lệnh chuyên sâu cho học viên C1 Bootcamp
        </span>
        <div className="search-input-box max-w-sm w-full">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm prompt theo kỹ năng..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="prompts-grid" id="ai-prompts-container">
        {prompts.map((p, idx) => (
          <div key={p.title || idx} className="prompt-card flex flex-col justify-between">
            <div>
              <div className="prompt-card-header flex items-center justify-between mb-2">
                <span className="prompt-title font-semibold text-white">{p.title}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-indigo-300 font-mono">
                  Prompt #{idx + 1}
                </span>
              </div>
              <p className="prompt-desc text-xs text-muted mb-3 leading-relaxed">{p.description}</p>
              <div className="prompt-code-box font-mono text-xs leading-relaxed max-h-48 overflow-y-auto mb-4 select-all">
                {p.template}
              </div>
            </div>
            <div className="flex gap-2 mt-auto pt-2 border-t border-white/5">
              <Button
                variant="unstyled"
                className="btn-primary copy-prompt-btn flex-1 py-2 text-xs font-semibold"
                onClick={() => handleCopy(p)}
              >
                📋 Copy Prompt
              </Button>
              <a
                href="https://chatgpt.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary py-2 px-3 text-xs inline-flex items-center justify-center font-medium"
              >
                ChatGPT ↗
              </a>
              <a
                href="https://claude.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary py-2 px-3 text-xs inline-flex items-center justify-center font-medium"
              >
                Claude ↗
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});
