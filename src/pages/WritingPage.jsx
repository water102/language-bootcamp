import { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import {
    showToast,
    copyWritingGuidePrompt,
    BOOTCAMP_DATA
} from '@/runtime/controller';
import { updateWritingDraft } from '@/store';
import { getWritingAiResultsLocal } from '@/core/storage/db.js';
import { subscribeWritingAiResults, fetchWritingAiResultsFromCloud } from '@/core/firebase/writingCloudSync.js';
import ImportWritingModal from '@/components/writing/ImportWritingModal';
import WritingAiReferencePanel from '@/components/writing/WritingAiReferencePanel';

export default memo(function WritingPage() {
    const dispatch = useDispatch();
    const currentDay = useSelector(state => state.study?.currentDay || 1);
    const writingDrafts = useSelector(state => state.study?.writingDrafts || {});

    const [currentDraftTab, setCurrentDraftTab] = useState('draft1'); // 'draft1' | 'draft2'
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [levelFilter, setLevelFilter] = useState('all');

    // Current day roadmap data
    const currentDayData = useMemo(() => {
        return BOOTCAMP_DATA?.roadmap?.find(r => r.day === currentDay) || BOOTCAMP_DATA?.roadmap?.[0];
    }, [currentDay]);

    const [activeTopic, setActiveTopic] = useState(() => ({
        id: `day_${currentDay}`,
        text: currentDayData ? `Day ${currentDayData.day} Writing Task: ${currentDayData.writing}` : 'CEFR C1 Writing Task',
        day: currentDay
    }));

    // Update active topic when day changes if still on default daily topic
    useEffect(() => {
        if (activeTopic?.id?.startsWith('day_')) {
            setActiveTopic({
                id: `day_${currentDay}`,
                text: currentDayData ? `Day ${currentDayData.day} Writing Task: ${currentDayData.writing}` : 'CEFR C1 Writing Task',
                day: currentDay
            });
        }
    }, [currentDay, currentDayData]);

    const [versions, setVersions] = useState([]);
    const [activeVersionId, setActiveVersionId] = useState(null);

    // Current drafts from Redux
    const dayDrafts = writingDrafts[currentDay] || { draft1: '', draft2: '' };
    const draft1Text = dayDrafts.draft1 || '';
    const draft2Text = dayDrafts.draft2 || '';

    // Active text & word count
    const activeText = currentDraftTab === 'draft1' ? draft1Text : draft2Text;
    const wordCount = useMemo(() => {
        return activeText.trim().split(/\s+/).filter(w => w.length > 0).length;
    }, [activeText]);

    // Handle draft changes
    const handleDraftChange = useCallback((draftType, text) => {
        dispatch(updateWritingDraft({ day: currentDay, draftType, text }));
    }, [dispatch, currentDay]);

    // Listen to topic change events from the prompt bank or external callers
    useEffect(() => {
        const handleTopicChange = (e) => {
            if (e.detail) {
                setActiveTopic(e.detail);
            }
        };
        window.addEventListener('writing-topic-changed', handleTopicChange);
        return () => window.removeEventListener('writing-topic-changed', handleTopicChange);
    }, []);

    // Load local and cloud versions whenever activeTopic changes
    useEffect(() => {
        if (!activeTopic?.id) return;
        let isMounted = true;

        // 1. Instant local cache load
        getWritingAiResultsLocal(activeTopic.id).then(localList => {
            if (isMounted && localList && localList.length > 0) {
                setVersions(localList);
                setActiveVersionId(prev => (localList.some(v => v.id === prev) ? prev : localList[0].id));
            }
        });

        // 2. Initial cloud fetch
        fetchWritingAiResultsFromCloud(activeTopic.id).then(res => {
            if (isMounted && res.success && res.results) {
                setVersions(prev => {
                    const map = new Map();
                    (res.results || []).forEach(item => map.set(item.id, item));
                    (prev || []).forEach(item => {
                        if (!map.has(item.id)) map.set(item.id, item);
                    });
                    const merged = Array.from(map.values()).sort(
                        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
                    );
                    if (merged.length > 0) {
                        setActiveVersionId(cur => (merged.some(v => v.id === cur) ? cur : merged[0].id));
                    }
                    return merged;
                });
            }
        });

        // 3. Realtime listener for community updates
        const unsubscribe = subscribeWritingAiResults(activeTopic.id, cloudList => {
            if (isMounted && cloudList) {
                setVersions(prev => {
                    const map = new Map();
                    cloudList.forEach(item => map.set(item.id, item));
                    (prev || []).forEach(item => {
                        if (!map.has(item.id)) map.set(item.id, item);
                    });
                    const merged = Array.from(map.values()).sort(
                        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
                    );
                    if (merged.length > 0) {
                        setActiveVersionId(cur => (merged.some(v => v.id === cur) ? cur : merged[0].id));
                    }
                    return merged;
                });
            }
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, [activeTopic?.id]);

    const handleSavedNewVersion = useCallback((newResult) => {
        if (!newResult) return;
        setVersions(prev => {
            const filtered = prev.filter(v => v.id !== newResult.id);
            return [newResult, ...filtered];
        });
        setActiveVersionId(newResult.id);
    }, []);

    const handleApplyToDraft = useCallback((essayText) => {
        if (!essayText) return;
        handleDraftChange(currentDraftTab, essayText);
        showToast('📝 Đã nạp bài mẫu vào khung nháp để bạn đối chiếu và luyện tập!');
    }, [currentDraftTab, handleDraftChange]);

    // AI Examiner action
    const handleSendToAiExaminer = useCallback(() => {
        if (!activeText || activeText.trim().length === 0) {
            showToast('Vui lòng viết bài trước khi gửi cho AI Examiner!');
            return;
        }

        const taskText = activeTopic?.text || `Day ${currentDayData?.day || currentDay} Writing Task: ${currentDayData?.writing || ''}`;
        const template = BOOTCAMP_DATA?.aiPrompts?.[3]?.template || 'Score this essay:\n[TASK_DESCRIPTION]\n[PASTE_YOUR_ESSAY_HERE]';
        const examinerPrompt = template
            .replace('[TASK_DESCRIPTION]', taskText)
            .replace('[PASTE_YOUR_ESSAY_HERE]', activeText);

        navigator.clipboard.writeText(examinerPrompt).then(() => {
            showToast('📋 Đã copy đề bài & bài viết theo chuẩn Cambridge Examiner Prompt! Hãy dán vào ChatGPT.');
            window.open('https://chatgpt.com', '_blank');
        }).catch(err => {
            console.error('Clipboard copy error:', err);
            showToast('Không thể sao chép tự động, vui lòng thử lại.');
        });
    }, [activeText, activeTopic, currentDay, currentDayData]);

    // All available prompts filtered by level
    const filteredPrompts = useMemo(() => {
        let list = [];
        const wp = BOOTCAMP_DATA?.writingPrompts || {};
        if (levelFilter === 'all' || levelFilter === 'a1_a2') {
            list = list.concat((wp.A1_A2 || []).map(p => ({ ...p, level: 'A1-A2' })));
        }
        if (levelFilter === 'all' || levelFilter === 'b1') {
            list = list.concat((wp.B1 || []).map(p => ({ ...p, level: 'B1' })));
        }
        if (levelFilter === 'all' || levelFilter === 'b2') {
            list = list.concat((wp.B2 || []).map(p => ({ ...p, level: 'B2' })));
        }
        if (levelFilter === 'all' || levelFilter === 'c1') {
            list = list.concat((wp.C1 || []).map(p => ({ ...p, level: 'C1' })));
        }
        return list;
    }, [levelFilter]);

    const handleSelectPrompt = useCallback((p) => {
        const topicObj = {
            id: `p_${p.level.toLowerCase().replace('-', '_')}_${p.id}`,
            text: `[${p.level}] ${p.text} (${p.words})`,
            level: p.level,
            words: p.words
        };
        setActiveTopic(topicObj);
        window.dispatchEvent(new CustomEvent('writing-topic-changed', { detail: topicObj }));
        showToast(`Đã chọn đề viết số ${p.id}`);
    }, []);

    return (
        <section className="page-view" id="view-writing">
            <div className="view-header">
                <h2>{"Writing Studio — Quy Trình Viết Lại (Rewrite Rule)"}</h2>
                <p>{"Nguyên tắc bắt buộc: Bản nháp 1 (Draft 1) → Nhận phản hồi/Sửa lỗi → "}<strong>{"Bản nháp 2 (Draft 2) viết lại hoàn toàn từ trang trắng"}</strong>{" để kích hoạt khả năng gợi nhớ chủ động."}</p>
            </div>
            <div className="writing-container">

                <div className="glass-card">
                    <div className="editor-tabs">
                        <Button
                            variant="unstyled"
                            className={`editor-tab-btn ${currentDraftTab === 'draft1' ? 'active' : ''}`}
                            data-draft="draft1"
                            onClick={() => setCurrentDraftTab('draft1')}
                        >
                            {"Bản Nháp 1 (Draft 1)"}
                        </Button>
                        <Button
                            variant="unstyled"
                            className={`editor-tab-btn ${currentDraftTab === 'draft2' ? 'active' : ''}`}
                            data-draft="draft2"
                            onClick={() => setCurrentDraftTab('draft2')}
                        >
                            {"Bản Viết Lại (Draft 2 — Blank Page)"}
                        </Button>
                    </div>

                    <textarea
                        id="writing-draft-1"
                        className={`writing-textarea ${currentDraftTab !== 'draft1' ? 'hidden' : ''}`}
                        style={{ display: currentDraftTab === 'draft1' ? 'block' : 'none' }}
                        placeholder="Bắt đầu viết bản nháp 1 của bạn tại đây mà không nhìn vào từ điển..."
                        value={draft1Text}
                        onChange={(e) => handleDraftChange('draft1', e.target.value)}
                    />

                    <textarea
                        id="writing-draft-2"
                        className={`writing-textarea ${currentDraftTab !== 'draft2' ? 'hidden' : ''}`}
                        style={{ display: currentDraftTab === 'draft2' ? 'block' : 'none' }}
                        placeholder="Viết lại toàn bộ bài viết từ trang trắng sau khi đã xem góp ý của AI / giáo viên..."
                        value={draft2Text}
                        onChange={(e) => handleDraftChange('draft2', e.target.value)}
                    />

                    <div className="editor-footer flex-wrap gap-[10px]">
                        <div className="word-count-badge" id="writing-word-count">
                            {`${wordCount} words`}
                        </div>
                        <div className="flex items-center gap-[8px] flex-wrap">
                            <Button
                                variant="unstyled"
                                className="btn-secondary text-amber-300 border border-amber-500/30 hover:border-amber-500/60 flex items-center gap-[6px]"
                                id="btn-copy-writing-guide"
                                onClick={copyWritingGuidePrompt}
                                title="Copy prompt yêu cầu AI tạo dàn ý chi tiết và bài viết mẫu chuẩn C1"
                            >
                                {"💡 Prompt Hướng Dẫn"}
                            </Button>
                            <Button
                                variant="unstyled"
                                className="btn-secondary text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/60 flex items-center gap-[6px]"
                                id="btn-open-import-modal-footer"
                                onClick={() => setIsImportModalOpen(true)}
                                title="Import kết quả từ AI, lưu vào Firebase và chia sẻ cho cả lớp"
                            >
                                {"📥 Import Kết Quả AI"}
                            </Button>
                            <Button
                                variant="unstyled"
                                className="btn-secondary"
                                id="btn-open-writing-diff"
                                onClick={() => window.dispatchEvent(new CustomEvent('open-writing-diff'))}
                            >
                                {"📝 So Sánh Draft 1 & 2"}
                            </Button>
                            <Button
                                variant="unstyled"
                                className="btn-primary"
                                id="btn-send-to-ai-examiner"
                                onClick={handleSendToAiExaminer}
                            >
                                {"📋 Chấm Bài (AI Examiner)"}
                            </Button>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="glass-card mb-[20px]">
                        <div className="flex justify-between items-center mb-[8px] flex-wrap gap-[8px]">
                            <h4 className="text-[16px] text-[#fff] m-0">{"Đề Bài Đang Chọn:"}</h4>
                            <div className="flex items-center gap-[6px] flex-wrap">
                                <Button
                                    variant="unstyled"
                                    className="btn-secondary text-[12px] py-[4px] px-[10px] text-amber-300 border border-amber-500/30 hover:border-amber-500/60 flex items-center gap-[5px]"
                                    id="btn-copy-writing-guide-top"
                                    onClick={copyWritingGuidePrompt}
                                    title="Copy prompt yêu cầu AI tạo dàn ý chi tiết và bài viết mẫu chuẩn C1"
                                >
                                    {"💡 Copy Prompt"}
                                </Button>
                                <Button
                                    variant="unstyled"
                                    className="btn-secondary text-[12px] py-[4px] px-[10px] text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/60 flex items-center gap-[5px]"
                                    id="btn-open-import-modal-top"
                                    onClick={() => setIsImportModalOpen(true)}
                                    title="Import kết quả từ AI, lưu vào Firebase và chia sẻ cho cả lớp"
                                >
                                    {"📥 Import Kết Quả AI"}
                                </Button>
                            </div>
                        </div>
                        <p className="text-[13.5px] text-brand-light font-semibold" id="active-writing-prompt-text">
                            {activeTopic?.text || "Hãy chọn đề bài trong danh sách bên dưới"}
                        </p>
                        <div className="mt-[12px] p-[10px] rounded-[8px] text-[12px] text-muted leading-[1.6] [background:rgba(255,255,255,0.03)]">
                            {"🎯 "}<strong>{"Mẹo học viết C1:"}</strong>{" Bấm "}<em>{"\"💡 Copy Prompt\""}</em>{" để AI lập dàn ý và bài mẫu C1. Sau khi nhận được kết quả, bấm "}<em>{"\"📥 Import Kết Quả AI\""}</em>{" để lưu vào Firebase và chia sẻ cho cả lớp. Mọi người có thể chọn và đối chiếu các phiên bản ngay bên dưới!\n"}
                        </div>
                    </div>

                    {/* AI Reference Panel with Version Selector */}
                    <WritingAiReferencePanel
                        versions={versions}
                        activeVersionId={activeVersionId}
                        onSelectVersion={setActiveVersionId}
                        onOpenImportModal={() => setIsImportModalOpen(true)}
                        onApplyToDraft={handleApplyToDraft}
                    />

                    <div className="glass-card">
                        <div className="flex justify-between items-center mb-[12px] flex-wrap gap-[8px]">
                            <h4 className="text-[15px] text-[#fff]">{"Ngân Hàng Đề Viết"}</h4>
                            <div className="filter-pills">
                                {[
                                    { key: 'all', label: 'All' },
                                    { key: 'a1_a2', label: 'A1-A2' },
                                    { key: 'b1', label: 'B1' },
                                    { key: 'b2', label: 'B2' },
                                    { key: 'c1', label: 'C1' },
                                ].map(pill => (
                                    <Button
                                        key={pill.key}
                                        variant="unstyled"
                                        className={`filter-pill writing-filter-btn ${levelFilter === pill.key ? 'active' : ''}`}
                                        data-level={pill.key}
                                        onClick={() => setLevelFilter(pill.key)}
                                    >
                                        {pill.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-[10px] max-h-[380px] overflow-y-auto pr-[6px]" id="writing-prompts-container">
                            {filteredPrompts.map(p => (
                                <div
                                    key={`${p.level}-${p.id}`}
                                    className="glass-card py-[14px] px-[18px] cursor-pointer hover:border-indigo-500/50 transition-colors"
                                    onClick={() => handleSelectPrompt(p)}
                                >
                                    <div className="flex justify-between mb-[6px]">
                                        <span className={`cefr-tag ${p.level.toLowerCase().replace('-', '_')}`}>{p.level}</span>
                                        <span className="font-code text-[12px] text-brand-light">📝 {p.words}</span>
                                    </div>
                                    <p className="text-[13.5px] text-[#fff] font-semibold">{p.id}. {p.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Import AI Modal */}
            <ImportWritingModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                topic={activeTopic}
                onSaved={handleSavedNewVersion}
            />
        </section>
    );
});
