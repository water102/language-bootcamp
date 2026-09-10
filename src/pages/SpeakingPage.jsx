import { memo, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { showToast, BOOTCAMP_DATA } from '@/runtime/controller';
import { saveRecording, getRecordingsByDay } from '@/core/storage/db.js';
import { CurriculumContentEngine } from '@/core/curriculum/curriculumContentEngine.js';

export default memo(function SpeakingPage() {
    const currentDay = useSelector(state => state.study?.currentDay || 1);

    const [levelFilter, setLevelFilter] = useState('all');
    const [isRecording, setIsRecording] = useState(false);
    const [secondsRecorded, setSecondsRecorded] = useState(0);
    const [take1Url, setTake1Url] = useState(null);
    const [take2Url, setTake2Url] = useState(null);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerIntervalRef = useRef(null);

    // Day data & current prompt
    const dayData = useMemo(() => {
        return BOOTCAMP_DATA?.roadmap?.find(r => r.day === currentDay) || BOOTCAMP_DATA?.roadmap?.[0];
    }, [currentDay]);

    const curLesson = useMemo(() => {
        return CurriculumContentEngine.getDayLesson(currentDay);
    }, [currentDay]);

    const defaultDayPrompt = useMemo(() => {
        const task = dayData?.speaking || curLesson?.speakingTask || 'Describe an experience or express an opinion';
        return `🎯 Day ${currentDay} (${dayData?.level || 'C1'}): ${task}`;
    }, [currentDay, dayData, curLesson]);

    const [activePromptText, setActivePromptText] = useState(defaultDayPrompt);

    // Update active prompt when day changes if still using default format
    useEffect(() => {
        setActivePromptText(defaultDayPrompt);
    }, [defaultDayPrompt]);

    // Load recordings from Dexie whenever currentDay changes
    useEffect(() => {
        let isMounted = true;
        setTake1Url(null);
        setTake2Url(null);

        getRecordingsByDay(currentDay).then(recs => {
            if (!isMounted || !recs || !recs.length) return;
            const take1 = recs.find(r => r.takeType === 'take1');
            const take2 = recs.find(r => r.takeType === 'take2');
            if (take1 && take1.audioBlob) {
                setTake1Url(URL.createObjectURL(take1.audioBlob));
            }
            if (take2 && take2.audioBlob) {
                setTake2Url(URL.createObjectURL(take2.audioBlob));
            }
        }).catch(err => {
            console.warn('Failed to load recordings for day', currentDay, err);
        });

        return () => {
            isMounted = false;
        };
    }, [currentDay]);

    // Clean up timer on unmount
    useEffect(() => {
        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    // Toggle Audio Recording
    const handleToggleRecording = useCallback(async () => {
        if (!isRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                audioChunksRef.current = [];

                mediaRecorder.ondataavailable = (e) => {
                    if (e.data && e.data.size > 0) {
                        audioChunksRef.current.push(e.data);
                    }
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    const targetTake = !take1Url ? 'take1' : 'take2';

                    saveRecording({
                        day: currentDay,
                        takeType: targetTake,
                        audioBlob,
                        durationSeconds: secondsRecorded || 0
                    });

                    if (targetTake === 'take1') {
                        setTake1Url(audioUrl);
                        showToast('🎤 Đã lưu Take 1 vào Dexie! Hãy nghe lại phân tích lỗi và ghi âm Take 2.');
                    } else {
                        setTake2Url(audioUrl);
                        showToast('🎯 Đã lưu Take 2 vào Dexie! Hãy đối chiếu sự tiến bộ giữa 2 lần nói.');
                    }

                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorder.start();
                setIsRecording(true);
                setSecondsRecorded(0);

                timerIntervalRef.current = setInterval(() => {
                    setSecondsRecorded(prev => prev + 1);
                }, 1000);

            } catch (err) {
                console.error('Microphone access error:', err);
                if (!window.isSecureContext) {
                    alert('Lưu ý: Trình duyệt yêu cầu kết nối HTTPS hoặc localhost để truy cập Microphone. Khi học qua IP LAN (HTTP), tất cả các tính năng xem bài, lộ trình, flashcards SRS và bài tập đều hoạt động trọn vẹn; riêng thu âm nói bạn có thể học trực tiếp trên máy chủ localhost hoặc cấu hình cho phép trên Chrome mobile (chrome://flags).');
                } else {
                    alert('Không thể truy cập microphone. Vui lòng cấp quyền Microphone trong trình duyệt của bạn!');
                }
            }
        } else {
            // Stop recording
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
            setIsRecording(false);
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        }
    }, [isRecording, take1Url, currentDay, secondsRecorded]);

    // Timer formatted mm:ss
    const formattedTimer = useMemo(() => {
        const mins = Math.floor(secondsRecorded / 60);
        const secs = secondsRecorded % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }, [secondsRecorded]);

    // Filter speaking prompts
    const filteredPrompts = useMemo(() => {
        let list = [];
        const sp = BOOTCAMP_DATA?.speakingPrompts || {};
        if (levelFilter === 'all' || levelFilter === 'a1_a2') {
            list = list.concat((sp.A1_A2 || []).map(p => ({ ...p, level: 'A1-A2' })));
        }
        if (levelFilter === 'all' || levelFilter === 'b1') {
            list = list.concat((sp.B1 || []).map(p => ({ ...p, level: 'B1' })));
        }
        if (levelFilter === 'all' || levelFilter === 'b2') {
            list = list.concat((sp.B2 || []).map(p => ({ ...p, level: 'B2' })));
        }
        if (levelFilter === 'all' || levelFilter === 'c1') {
            list = list.concat((sp.C1 || []).map(p => ({ ...p, level: 'C1' })));
        }
        return list;
    }, [levelFilter]);

    const handleSelectPrompt = useCallback((p) => {
        const promptStr = `${p.level} Prompt: ${p.text} (Mục tiêu: ${p.targetTime})`;
        setActivePromptText(promptStr);
        showToast(`Đã chọn đề: "${p.text.substring(0, 40)}..."`);
    }, []);

    return (
        <section className="page-view" id="view-speaking">
            <div className="view-header">
                <h2>{"Phòng Thu Âm Speaking & Quy Trình Hai Bản Thu (Take 1 vs Take 2)"}</h2>
                <p>{"Nguyên tắc vàng: Ghi âm Take 1 (không nhìn kịch bản) → Nghe lại bắt 3-5 lỗi đắt giá → Ghi âm Take 2 với các từ khóa để sửa chữa."}</p>
            </div>

            <div className="recorder-card">
                <div className={`recording-status-dot ${isRecording ? 'active' : ''}`} id="recording-dot"></div>
                <div className="recorder-time" id="recording-timer">{formattedTimer}</div>
                <div className="recorder-buttons">
                    <Button
                        variant="unstyled"
                        className={`record-action-btn ${isRecording ? 'btn-danger' : 'btn-primary'}`}
                        id="record-toggle-btn"
                        onClick={handleToggleRecording}
                    >
                        {isRecording ? (
                            <>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="6" y="4" width="12" height="16"></rect>
                                </svg>
                                <span>{"Dừng Thu Âm"}</span>
                            </>
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 14 14"></polyline>
                                </svg>
                                <span>{"Ghi Âm Nói (Microphone)"}</span>
                            </>
                        )}
                    </Button>
                </div>
                <p className="text-[13px] text-dim max-w-[550px]">
                    {"\nHệ thống ghi âm trực tiếp qua trình duyệt của bạn (100% riêng tư). Thu âm lần đầu sẽ lưu vào "}
                    <strong>{"Take 1"}</strong>
                    {", lần thu tiếp theo sẽ lưu vào "}
                    <strong>{"Take 2"}</strong>
                    {".\n"}
                </p>
                <div className="audio-preview-section">
                    <div id="audio-take-1-container">
                        {take1Url && (
                            <div className="audio-take-box">
                                <strong className="text-brand-light text-[13px] w-[70px]">{"Take 1:"}</strong>
                                <audio controls src={take1Url}></audio>
                                <a href={take1Url} download={`take1_day_${currentDay}.webm`} className="btn-secondary py-[6px] px-[12px] text-[12px]">
                                    {"Tải về"}
                                </a>
                            </div>
                        )}
                    </div>
                    <div id="audio-take-2-container">
                        {take2Url && (
                            <div className="audio-take-box">
                                <strong className="text-brand-light text-[13px] w-[70px]">{"Take 2:"}</strong>
                                <audio controls src={take2Url}></audio>
                                <a href={take2Url} download={`take2_day_${currentDay}.webm`} className="btn-secondary py-[6px] px-[12px] text-[12px]">
                                    {"Tải về"}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="glass-card">
                <div className="flex justify-between items-center mb-[16px] flex-wrap gap-[12px]">
                    <div>
                        <h3 className="font-display text-[18px] text-[#fff]">{"Ngân Hàng Đề Thi Nói (Prompt Bank)"}</h3>
                        <p className="text-[13.5px] text-accent-amber font-semibold mt-[4px]" id="active-speaking-prompt-text">
                            {activePromptText}
                        </p>
                    </div>
                    <div className="filter-pills">
                        {[
                            { key: 'all', label: 'Tất cả' },
                            { key: 'a1_a2', label: 'A1–A2 (1-5m)' },
                            { key: 'b1', label: 'B1 (5-10m)' },
                            { key: 'b2', label: 'B2 (10-15m)' },
                            { key: 'c1', label: 'C1 (15-20m)' }
                        ].map(pill => (
                            <Button
                                key={pill.key}
                                variant="unstyled"
                                className={`filter-pill speaking-filter-btn ${levelFilter === pill.key ? 'active' : ''}`}
                                data-level={pill.key}
                                onClick={() => setLevelFilter(pill.key)}
                            >
                                {pill.label}
                            </Button>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,_minmax(320px,_1fr))] gap-[14px]" id="speaking-prompts-container">
                    {filteredPrompts.map(p => (
                        <div
                            key={`${p.level}-${p.id}`}
                            className="glass-card py-[14px] px-[18px] cursor-pointer hover:border-indigo-500/50 transition-colors"
                            onClick={() => handleSelectPrompt(p)}
                        >
                            <div className="flex justify-between mb-[6px]">
                                <span className={`cefr-tag ${p.level.toLowerCase().replace('-', '_')}`}>{p.level}</span>
                                <span className="font-code text-[12px] text-accent-amber">⏱️ {p.targetTime}</span>
                            </div>
                            <p className="text-[14px] text-[#fff] font-semibold">{p.id}. {p.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
});
