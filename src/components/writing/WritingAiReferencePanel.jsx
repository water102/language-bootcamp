import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { showToast } from '@/runtime/controller.js';

export default function WritingAiReferencePanel({
  versions = [],
  activeVersionId,
  onSelectVersion,
  onOpenImportModal,
  onApplyToDraft
}) {
  const [activeTab, setActiveTab] = useState('essay'); // 'essay' | 'outline' | 'assets' | 'raw'

  const activeVersion = versions.find(v => v.id === activeVersionId) || versions[0];

  const handleCopyText = async (text, label) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast(`📋 Đã sao chép ${label}!`);
    } catch (e) {
      showToast('Không thể tự động copy, vui lòng chọn thủ công.');
    }
  };

  const getWordCount = (text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  };

  if (!versions || versions.length === 0) {
    return (
      <div className="glass-card mb-[20px] p-[18px] border border-dashed border-white/15 rounded-[14px]">
        <div className="flex justify-between items-center flex-wrap gap-[10px]">
          <div>
            <h4 className="text-[14.5px] font-semibold text-white m-0 flex items-center gap-[6px]">
              <span>💡</span>
              <span>Dàn Ý & Bài Mẫu AI (Chưa có bản chia sẻ)</span>
            </h4>
            <p className="text-[12px] text-muted mt-[4px] m-0">
              Hãy dùng nút <strong>Prompt Hướng Dẫn</strong> ở trên để hỏi AI, sau đó import vào đây để lưu và chia sẻ cho cả lớp.
            </p>
          </div>
          <Button
            variant="unstyled"
            onClick={onOpenImportModal}
            className="btn-secondary text-[12.5px] py-[6px] px-[14px] text-brand-light border border-indigo-500/30 hover:border-indigo-500 flex items-center gap-[6px]"
          >
            <span>📥</span>
            <span>Import Bản Đầu Tiên</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card mb-[20px] p-[18px] rounded-[16px] border border-white/10 shadow-lg">
      
      {/* Header & Version Switcher */}
      <div className="flex justify-between items-center mb-[14px] flex-wrap gap-[10px] pb-[12px] border-b border-white/10">
        <div>
          <div className="flex items-center gap-[8px]">
            <span className="text-[16px]">📚</span>
            <h4 className="text-[15px] font-bold text-white m-0">
              Các Phiên Bản AI Đã Import ({versions.length})
            </h4>
            <span className="text-[11px] px-[7px] py-[2px] rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
              ☁️ Cloud Shared
            </span>
          </div>
          <p className="text-[12px] text-muted mt-[3px] m-0">
            Chọn các phiên bản từ bạn hoặc các thành viên khác để xem dàn ý và bài mẫu đối chiếu.
          </p>
        </div>

        <Button
          variant="unstyled"
          onClick={onOpenImportModal}
          className="btn-secondary text-[12px] py-[5px] px-[12px] text-amber-300 border border-amber-500/30 hover:border-amber-500/60 flex items-center gap-[5px]"
        >
          <span>➕</span>
          <span>Import Bản Khác</span>
        </Button>
      </div>

      {/* Version Pills / Selector */}
      <div className="flex items-center gap-[8px] overflow-x-auto pb-[8px] mb-[12px] no-scrollbar">
        {versions.map((v, idx) => {
          const isSelected = v.id === activeVersion?.id;
          return (
            <button
              key={v.id || idx}
              type="button"
              onClick={() => onSelectVersion(v.id)}
              className={`py-[5px] px-[12px] rounded-[8px] text-[12px] font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-[6px] border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/30'
                  : 'bg-white/5 text-muted hover:text-white hover:bg-white/10 border-white/5'
              }`}
            >
              <span>{idx === 0 ? '👑' : '📄'}</span>
              <span>{v.title || `Bản ${idx + 1}`}</span>
              <span className="text-[10px] opacity-75">({v.aiModel || 'AI'})</span>
            </button>
          );
        })}
      </div>

      {activeVersion && (
        <>
          {/* Active Version Metadata Banner */}
          <div className="flex justify-between items-center text-[11.5px] text-muted mb-[12px] px-[10px] py-[6px] bg-black/20 rounded-[8px] flex-wrap gap-[6px]">
            <div className="flex items-center gap-[8px]">
              <span>👤 Chia sẻ bởi: <strong className="text-white">{activeVersion.sharedBy || 'Thành viên'}</strong></span>
              <span>·</span>
              <span>🤖 AI: <strong className="text-brand-light">{activeVersion.aiModel || 'AI'}</strong></span>
            </div>
            <div>
              <span>🕒 {activeVersion.createdAt ? new Date(activeVersion.createdAt).toLocaleDateString('vi-VN') : ''}</span>
            </div>
          </div>

          {/* Content Sub-Tabs */}
          <div className="flex justify-between items-center border-b border-white/10 mb-[12px] flex-wrap gap-[8px]">
            <div className="flex items-center gap-[6px]">
              <button
                type="button"
                onClick={() => setActiveTab('essay')}
                className={`py-[6px] px-[12px] text-[12.5px] font-semibold rounded-t-[6px] transition-all cursor-pointer border-b-2 ${
                  activeTab === 'essay'
                    ? 'border-indigo-500 text-white bg-white/5'
                    : 'border-transparent text-muted hover:text-white'
                }`}
              >
                📖 Bài Mẫu C1 ({getWordCount(activeVersion.modelEssay || activeVersion.rawContent)} words)
              </button>

              {activeVersion.outline && (
                <button
                  type="button"
                  onClick={() => setActiveTab('outline')}
                  className={`py-[6px] px-[12px] text-[12.5px] font-semibold rounded-t-[6px] transition-all cursor-pointer border-b-2 ${
                    activeTab === 'outline'
                      ? 'border-indigo-500 text-white bg-white/5'
                      : 'border-transparent text-muted hover:text-white'
                  }`}
                >
                  📑 Dàn Ý Chi Tiết
                </button>
              )}

              {activeVersion.keyAssets && (
                <button
                  type="button"
                  onClick={() => setActiveTab('assets')}
                  className={`py-[6px] px-[12px] text-[12.5px] font-semibold rounded-t-[6px] transition-all cursor-pointer border-b-2 ${
                    activeTab === 'assets'
                      ? 'border-indigo-500 text-white bg-white/5'
                      : 'border-transparent text-muted hover:text-white'
                  }`}
                >
                  💎 Từ Vựng & Cấu Trúc
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('raw')}
                className={`py-[6px] px-[12px] text-[12.5px] font-semibold rounded-t-[6px] transition-all cursor-pointer border-b-2 ${
                  activeTab === 'raw'
                    ? 'border-indigo-500 text-white bg-white/5'
                    : 'border-transparent text-muted hover:text-white'
                }`}
              >
                📜 Toàn Bộ
              </button>
            </div>

            {/* Quick Actions for Current Tab */}
            <div className="flex items-center gap-[6px] pb-[4px]">
              {activeTab === 'essay' && activeVersion.modelEssay && (
                <>
                  <Button
                    variant="unstyled"
                    onClick={() => handleCopyText(activeVersion.modelEssay, 'bài mẫu C1')}
                    className="btn-secondary text-[11px] py-[3px] px-[8px]"
                    title="Copy bài mẫu vào clipboard"
                  >
                    📋 Copy Bài Mẫu
                  </Button>
                  {typeof onApplyToDraft === 'function' && (
                    <Button
                      variant="unstyled"
                      onClick={() => onApplyToDraft(activeVersion.modelEssay)}
                      className="btn-secondary text-[11px] py-[3px] px-[8px] text-cyan-300 border border-cyan-500/30"
                      title="Chèn bài mẫu vào khung nháp để nghiên cứu"
                    >
                      📝 Nạp vào Draft
                    </Button>
                  )}
                </>
              )}

              {activeTab === 'outline' && activeVersion.outline && (
                <Button
                  variant="unstyled"
                  onClick={() => handleCopyText(activeVersion.outline, 'dàn ý')}
                  className="btn-secondary text-[11px] py-[3px] px-[8px]"
                >
                  📋 Copy Dàn Ý
                </Button>
              )}

              {activeTab === 'assets' && activeVersion.keyAssets && (
                <Button
                  variant="unstyled"
                  onClick={() => handleCopyText(activeVersion.keyAssets, 'từ vựng & cấu trúc')}
                  className="btn-secondary text-[11px] py-[3px] px-[8px]"
                >
                  📋 Copy Từ Vựng
                </Button>
              )}

              {activeTab === 'raw' && activeVersion.rawContent && (
                <Button
                  variant="unstyled"
                  onClick={() => handleCopyText(activeVersion.rawContent, 'toàn bộ kết quả AI')}
                  className="btn-secondary text-[11px] py-[3px] px-[8px]"
                >
                  📋 Copy Toàn Bộ
                </Button>
              )}
            </div>
          </div>

          {/* Active Tab Content Display */}
          <div className="p-[14px] bg-black/25 rounded-[10px] border border-white/5 max-h-[360px] overflow-y-auto leading-[1.7] text-[13px] text-gray-200 whitespace-pre-wrap font-sans">
            {activeTab === 'essay' && (activeVersion.modelEssay || activeVersion.rawContent)}
            {activeTab === 'outline' && (activeVersion.outline || 'Chưa có thông tin dàn ý tách riêng.')}
            {activeTab === 'assets' && (activeVersion.keyAssets || 'Chưa có thông tin từ vựng tách riêng.')}
            {activeTab === 'raw' && (activeVersion.rawContent || '')}
          </div>
        </>
      )}

    </div>
  );
}
