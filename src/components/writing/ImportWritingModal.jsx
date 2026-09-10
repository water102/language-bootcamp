import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { saveWritingAiResultLocal } from '@/core/storage/db.js';
import { saveWritingAiResultToCloud } from '@/core/firebase/writingCloudSync.js';
import { showToast } from '@/runtime/controller.js';
import { parseAiWritingResponse } from '@/core/ai/writingResponseParser.js';

export { parseAiWritingResponse };

export default function ImportWritingModal({ isOpen, onClose, topic, onSaved }) {
  const [aiModel, setAiModel] = useState('ChatGPT-4o');
  const [versionTitle, setVersionTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [previewTab, setPreviewTab] = useState('parsed'); // 'parsed' | 'raw'
  const [isSaving, setIsSaving] = useState(false);
  const [cloudStatus, setCloudStatus] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRawText('');
      setCloudStatus('');
      setVersionTitle(`Bản C1 (${aiModel})`);
    }
  }, [isOpen, aiModel]);

  if (!isOpen) return null;

  const parsed = parseAiWritingResponse(rawText);
  const wordCount = parsed.modelEssay
    ? parsed.modelEssay.trim().split(/\s+/).filter(w => w.length > 0).length
    : 0;

  const handleSave = async () => {
    if (!rawText || rawText.trim().length === 0) {
      showToast('⚠️ Vui lòng dán nội dung kết quả AI trước khi lưu!');
      return;
    }

    setIsSaving(true);
    setCloudStatus('Đang lưu vào thiết bị & đồng bộ Firebase Cloud...');

    try {
      const topicId = topic?.id || `topic_${(topic?.text || 'default').slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}`;
      const payload = {
        id: `w_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        topicId,
        topicText: topic?.text || 'CEFR C1 Writing Task',
        day: topic?.day || null,
        title: versionTitle.trim() || `Bản C1 (${aiModel})`,
        aiModel,
        outline: parsed.outline,
        modelEssay: parsed.modelEssay,
        keyAssets: parsed.keyAssets,
        rawContent: rawText.trim(),
        createdAt: new Date().toISOString()
      };

      // 1. Save locally
      const localItem = await saveWritingAiResultLocal(payload);

      // 2. Save to Firebase Cloud
      const cloudRes = await saveWritingAiResultToCloud(payload);
      if (cloudRes.success) {
        setCloudStatus('✅ ' + cloudRes.message);
      } else {
        setCloudStatus('ℹ️ ' + cloudRes.message);
      }

      showToast(`🎉 Đã lưu & chia sẻ thành công phiên bản "${payload.title}"!`);

      if (typeof onSaved === 'function') {
        onSaved(localItem);
      }

      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error('Save error:', err);
      showToast(`Lỗi khi lưu: ${err.message}`);
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-[16px] [background:rgba(0,0,0,0.75)] backdrop-blur-[6px] animate-fadeIn">
      <div className="glass-card w-full max-w-[780px] max-h-[90vh] flex flex-col p-[24px] rounded-[18px] border border-white/10 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-start pb-[14px] border-b border-white/10 mb-[16px]">
          <div>
            <div className="flex items-center gap-[8px]">
              <span className="text-[20px]">📥</span>
              <h3 className="text-[18px] font-bold text-white m-0">Import Kết Quả AI & Chia Sẻ Cloud</h3>
            </div>
            <p className="text-[12.5px] text-muted mt-[4px] m-0">
              Dán kết quả từ ChatGPT, Claude hoặc Gemini để lưu phiên bản tham khảo và chia sẻ cho tất cả người học.
            </p>
          </div>
          <Button
            variant="unstyled"
            onClick={onClose}
            className="text-muted hover:text-white p-[6px] rounded-[8px] transition-colors"
            title="Đóng modal"
          >
            ✕
          </Button>
        </div>

        {/* Topic Banner */}
        <div className="p-[12px] rounded-[10px] [background:rgba(99,102,241,0.1)] border border-indigo-500/20 mb-[16px]">
          <div className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-[2px]">
            Đề bài đang gắn kết quả:
          </div>
          <div className="text-[13px] text-white font-medium line-clamp-2">
            {topic?.text || 'IELTS / Cambridge C1 Academic Essay'}
          </div>
        </div>

        {/* Form Controls */}
        <div className="flex gap-[12px] flex-wrap mb-[14px]">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[12px] font-medium text-muted mb-[6px]">
              Tên phiên bản / Ghi chú:
            </label>
            <input
              type="text"
              value={versionTitle}
              onChange={e => setVersionTitle(e.target.value)}
              placeholder="VD: Bản mẫu nâng cao C1 - Claude 3.7"
              className="w-full py-[8px] px-[12px] rounded-[8px] text-[13px] text-white bg-black/30 border border-white/10 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="w-[180px]">
            <label className="block text-[12px] font-medium text-muted mb-[6px]">
              Mô hình AI:
            </label>
            <select
              value={aiModel}
              onChange={e => {
                setAiModel(e.target.value);
                setVersionTitle(`Bản C1 (${e.target.value})`);
              }}
              className="w-full py-[8px] px-[10px] rounded-[8px] text-[13px] text-white bg-black/40 border border-white/10 focus:border-indigo-500 outline-none cursor-pointer"
            >
              <option value="ChatGPT-4o">ChatGPT-4o</option>
              <option value="Claude 3.7 Sonnet">Claude 3.7 Sonnet</option>
              <option value="Gemini 2.5 Pro">Gemini 2.5 Pro</option>
              <option value="DeepSeek-R1">DeepSeek-R1 / V3</option>
              <option value="AI Examiner">AI Examiner Feedback</option>
              <option value="Khác">Khác / Custom</option>
            </select>
          </div>
        </div>

        {/* Input Textarea & Previews */}
        <div className="flex-1 flex flex-col min-h-0 mb-[16px]">
          <div className="flex justify-between items-center mb-[6px]">
            <label className="text-[12px] font-medium text-muted">
              Nội dung câu trả lời từ AI (Markdown hoặc Plain Text):
            </label>
            {rawText.trim().length > 0 && (
              <div className="flex items-center gap-[6px] text-[11px] text-brand-light">
                <span>⚡ Tự động nhận diện:</span>
                {parsed.outline && <span className="bg-emerald-500/20 text-emerald-300 px-[6px] py-[1px] rounded">Dàn ý</span>}
                {parsed.modelEssay && <span className="bg-blue-500/20 text-blue-300 px-[6px] py-[1px] rounded">Bài mẫu ({wordCount} words)</span>}
                {parsed.keyAssets && <span className="bg-amber-500/20 text-amber-300 px-[6px] py-[1px] rounded">Từ vựng</span>}
              </div>
            )}
          </div>

          <textarea
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            placeholder="Dán toàn bộ kết quả AI vừa sinh tại đây...
Hệ thống sẽ tự động bóc tách:
- 1. Dàn ý chi tiết (Detailed Outline)
- 2. Bài viết mẫu C1 (Model Essay)
- 3. Từ vựng & cấu trúc ngữ pháp (Key Learning Assets)"
            className="flex-1 min-h-[190px] max-h-[280px] p-[12px] rounded-[10px] bg-black/30 border border-white/10 text-white font-mono text-[12.5px] leading-[1.6] resize-y outline-none focus:border-indigo-500 transition-all placeholder:text-muted/60"
          />
        </div>

        {/* Status Message */}
        {cloudStatus && (
          <div className="text-[12px] text-brand-light mb-[12px] px-[8px] py-[4px] bg-white/5 rounded-[6px]">
            {cloudStatus}
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex justify-between items-center pt-[12px] border-t border-white/10 flex-wrap gap-[10px]">
          <div className="text-[11.5px] text-muted flex items-center gap-[5px]">
            <span>🌐</span>
            <span>Chia sẻ qua Firebase: Mọi người học đều có thể tham khảo phiên bản này.</span>
          </div>

          <div className="flex items-center gap-[10px]">
            <Button
              variant="unstyled"
              onClick={onClose}
              disabled={isSaving}
              className="btn-secondary text-[13px] py-[8px] px-[16px]"
            >
              Hủy
            </Button>
            <Button
              variant="unstyled"
              onClick={handleSave}
              disabled={isSaving || !rawText.trim()}
              className="btn-primary text-[13px] py-[8px] px-[20px] flex items-center gap-[6px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <span className="inline-block animate-spin">⏳</span>
                  <span>Đang lưu & đồng bộ...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Lưu & Chia Sẻ Cloud</span>
                </>
              )}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
