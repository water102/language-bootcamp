import { memo, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { speakText, showToast } from '@/runtime/controller';
import { ContentEngine } from '@/core/content/contentEngine.js';

export default memo(function ContentHubPage() {
  const [activeTab, setActiveTab] = useState('resources'); // 'resources' | 'practice' | 'readers' | 'provenance'
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [selectedDelivery, setSelectedDelivery] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Practice sub-modes: 'quiz' | 'scramble' | 'dictation'
  const [practiceMode, setPracticeMode] = useState('scramble');

  // Vocab Quiz state
  const vocabItems = useMemo(() => ContentEngine.getVocabQuiz({ level: selectedLevel }), [selectedLevel]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizAnswerChecked, setQuizAnswerChecked] = useState(false);

  // Tatoeba Sentence Scramble state
  const [scrambleData, setScrambleData] = useState(() => ContentEngine.generateSentenceScramble('A1'));
  const [selectedTokens, setSelectedTokens] = useState([]);
  const [availableTokens, setAvailableTokens] = useState(() => scrambleData ? [...scrambleData.scrambledTokens] : []);
  const [scrambleResult, setScrambleResult] = useState(null);

  // Dictation state
  const [dictationLevel, setDictationLevel] = useState('A2');
  const dictationCandidates = useMemo(() => ContentEngine.getTatoebaSentences({ level: dictationLevel }), [dictationLevel]);
  const [dictationIndex, setDictationIndex] = useState(0);
  const [dictationInput, setDictationInput] = useState('');
  const [dictationEval, setDictationEval] = useState(null);

  // Filtered resources
  const resources = useMemo(() => {
    return ContentEngine.getResources({
      level: selectedLevel,
      skill: selectedSkill,
      deliveryMode: selectedDelivery,
      search: searchQuery
    });
  }, [selectedLevel, selectedSkill, selectedDelivery, searchQuery]);

  // VOA Stories & Readers
  const voaStories = useMemo(() => ContentEngine.getVoaStories({ level: selectedLevel }), [selectedLevel]);
  const extensiveReaders = useMemo(() => ContentEngine.getExtensiveReaders({ level: selectedLevel }), [selectedLevel]);
  const sources = useMemo(() => ContentEngine.getSources(), []);

  // Scramble actions
  const handlePickToken = (token, index) => {
    setSelectedTokens(prev => [...prev, token]);
    setAvailableTokens(prev => prev.filter((_, i) => i !== index));
    setScrambleResult(null);
  };

  const handleReturnToken = (token, index) => {
    setAvailableTokens(prev => [...prev, token]);
    setSelectedTokens(prev => prev.filter((_, i) => i !== index));
    setScrambleResult(null);
  };

  const handleCheckScramble = () => {
    if (!scrambleData) return;
    const res = ContentEngine.checkSentenceScramble(scrambleData.cleanTokens, selectedTokens);
    setScrambleResult(res);
    if (res.isCorrect) {
      showToast('🎉 Chính xác! Bạn đã ghép đúng câu ngữ pháp.');
      speakText(scrambleData.originalSentence);
    } else {
      showToast('❌ Chưa chính xác, hãy xem lại vị trí các từ.');
    }
  };

  const handleNextScramble = () => {
    const next = ContentEngine.generateSentenceScramble(selectedLevel);
    if (next) {
      setScrambleData(next);
      setAvailableTokens([...next.scrambledTokens]);
      setSelectedTokens([]);
      setScrambleResult(null);
    }
  };

  // Dictation actions
  const currentDictationItem = dictationCandidates[dictationIndex % (dictationCandidates.length || 1)];

  const handleCheckDictation = () => {
    if (!currentDictationItem) return;
    const res = ContentEngine.evaluateDictation(currentDictationItem.en, dictationInput);
    setDictationEval(res);
    if (res.isPerfect) {
      showToast('🌟 Tuyệt vời! Bạn chép chính xác 100% từng từ.');
    }
  };

  const handleNextDictation = () => {
    setDictationIndex(prev => (prev + 1) % dictationCandidates.length);
    setDictationInput('');
    setDictationEval(null);
  };

  return (
    <section className="page-view" id="view-content-hub">
      <div className="view-header">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2>📚 Kho Tài Nguyên & Luyện Tập Mở Rộng</h2>
            <p>
              Hệ thống học liệu phân cấp CEFR (A1–C2) từ các nguồn mở uy tín (VOA, Tatoeba, Project Gutenberg, LibriVox, CEFR-J) kèm các bộ sinh bài tập tương tác.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[rgba(99,102,241,0.15)] border border-[rgba(99,102,241,0.3)] rounded-full text-xs font-semibold text-brand-light">
              ✨ Content Master Spec Active
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[rgba(255,255,255,0.08)] mb-6 gap-2 overflow-x-auto pb-1">
        <Button
          variant="unstyled"
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition flex items-center gap-2 ${
            activeTab === 'resources'
              ? 'bg-[rgba(99,102,241,0.2)] text-white border-b-2 border-brand'
              : 'text-muted hover:text-white hover:bg-[rgba(255,255,255,0.04)]'
          }`}
          onClick={() => setActiveTab('resources')}
        >
          <span>🌐 Nguồn Tuyển Chọn ({resources.length})</span>
        </Button>
        <Button
          variant="unstyled"
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition flex items-center gap-2 ${
            activeTab === 'practice'
              ? 'bg-[rgba(99,102,241,0.2)] text-white border-b-2 border-brand'
              : 'text-muted hover:text-white hover:bg-[rgba(255,255,255,0.04)]'
          }`}
          onClick={() => setActiveTab('practice')}
        >
          <span>🧩 Phòng Luyện Tập Tương Tác</span>
        </Button>
        <Button
          variant="unstyled"
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition flex items-center gap-2 ${
            activeTab === 'readers'
              ? 'bg-[rgba(99,102,241,0.2)] text-white border-b-2 border-brand'
              : 'text-muted hover:text-white hover:bg-[rgba(255,255,255,0.04)]'
          }`}
          onClick={() => setActiveTab('readers')}
        >
          <span>📖 Bài Đọc & Sách Nói</span>
        </Button>
        <Button
          variant="unstyled"
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition flex items-center gap-2 ${
            activeTab === 'provenance'
              ? 'bg-[rgba(99,102,241,0.2)] text-white border-b-2 border-brand'
              : 'text-muted hover:text-white hover:bg-[rgba(255,255,255,0.04)]'
          }`}
          onClick={() => setActiveTab('provenance')}
        >
          <span>🛡️ Minh Bạch Bản Quyền</span>
        </Button>
      </div>

      {/* Global Filter Bar (Applied across tabs) */}
      <div className="glass-card mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* CEFR Level Selector */}
          <div>
            <label className="text-xs text-muted block mb-1 font-semibold uppercase">Trình độ CEFR</label>
            <div className="flex flex-wrap gap-1">
              {['all', 'A1', 'A2', 'B1', 'B2', 'C1'].map(lvl => (
                <button
                  key={lvl}
                  className={`px-2.5 py-1 text-xs rounded font-bold transition ${
                    selectedLevel === lvl
                      ? 'bg-brand text-white shadow-md'
                      : 'bg-[rgba(255,255,255,0.06)] text-muted hover:text-white'
                  }`}
                  onClick={() => setSelectedLevel(lvl)}
                >
                  {lvl === 'all' ? 'Tất cả' : lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Skill Selector */}
          <div>
            <label className="text-xs text-muted block mb-1 font-semibold uppercase">Kỹ năng</label>
            <select
              className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand"
              value={selectedSkill}
              onChange={e => setSelectedSkill(e.target.value)}
            >
              <option value="all">Tất cả kỹ năng</option>
              <option value="listening">Nghe (Listening)</option>
              <option value="reading">Đọc (Reading)</option>
              <option value="speaking">Nói (Speaking)</option>
              <option value="writing">Viết (Writing)</option>
              <option value="vocabulary">Từ vựng (Vocabulary)</option>
              <option value="grammar">Ngữ pháp (Grammar)</option>
            </select>
          </div>

          {/* Delivery Mode */}
          <div>
            <label className="text-xs text-muted block mb-1 font-semibold uppercase">Phương thức học</label>
            <select
              className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand"
              value={selectedDelivery}
              onChange={e => setSelectedDelivery(e.target.value)}
            >
              <option value="all">Mọi hình thức</option>
              <option value="native">🚀 Native (Làm trực tiếp)</option>
              <option value="embed">🎬 Embed (Trình phát nhúng)</option>
              <option value="external">🌐 External (Liên kết nguồn)</option>
            </select>
          </div>

          {/* Search Input */}
          <div>
            <label className="text-xs text-muted block mb-1 font-semibold uppercase">Tìm kiếm tài liệu</label>
            <input
              type="text"
              placeholder="Nhập từ khóa, chủ đề..."
              className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand placeholder:text-gray-500"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* TAB 1: CURATED RESOURCES */}
      {activeTab === 'resources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted">
              Không tìm thấy tài liệu phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            resources.map(res => (
              <div key={res.id} className="glass-card flex flex-col justify-between p-5 hover:border-[rgba(99,102,241,0.4)] transition">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[rgba(255,255,255,0.08)] text-accent-cyan uppercase">
                      {res.sourceId}
                    </span>
                    <div className="flex gap-1">
                      {res.levels.map(l => (
                        <span key={l} className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(99,102,241,0.2)] text-brand-light font-bold">
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                  <h4 className="text-white text-base font-semibold mb-2 leading-snug">{res.title}</h4>
                  <p className="text-muted text-xs mb-3 leading-relaxed">{res.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {res.skills.map(s => (
                      <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.05)] text-gray-300">
                        #{s}
                      </span>
                    ))}
                    {res.durationMinutes && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.1)] text-accent-amber">
                        ⏱️ {res.durationMinutes}m
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[rgba(255,255,255,0.08)] flex items-center justify-between">
                  <span className="text-[11px] text-gray-400 truncate max-w-[170px]" title={res.rights}>
                    📜 {res.rights}
                  </span>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded bg-brand text-white hover:bg-brand-light transition"
                  >
                    Mở Học ↗
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: INTERACTIVE PRACTICE STUDIO */}
      {activeTab === 'practice' && (
        <div className="space-y-6">
          {/* Mode Selector */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="unstyled"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                practiceMode === 'scramble'
                  ? 'bg-accent-cyan text-gray-900'
                  : 'bg-[rgba(255,255,255,0.06)] text-white hover:bg-[rgba(255,255,255,0.1)]'
              }`}
              onClick={() => setPracticeMode('scramble')}
            >
              🔀 Sắp Xếp Câu Song Ngữ Tatoeba
            </Button>
            <Button
              variant="unstyled"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                practiceMode === 'quiz'
                  ? 'bg-accent-cyan text-gray-900'
                  : 'bg-[rgba(255,255,255,0.06)] text-white hover:bg-[rgba(255,255,255,0.1)]'
              }`}
              onClick={() => setPracticeMode('quiz')}
            >
              📝 Trắc Nghiệm Collocation & Từ Vựng CEFR-J
            </Button>
            <Button
              variant="unstyled"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                practiceMode === 'dictation'
                  ? 'bg-accent-cyan text-gray-900'
                  : 'bg-[rgba(255,255,255,0.06)] text-white hover:bg-[rgba(255,255,255,0.1)]'
              }`}
              onClick={() => setPracticeMode('dictation')}
            >
              🎧 Nghe Chép Chính Tả (Dictation & Shadowing)
            </Button>
          </div>

          {/* MODE: SCRAMBLE */}
          {practiceMode === 'scramble' && scrambleData && (
            <div className="glass-card p-6 max-w-3xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs px-2.5 py-1 rounded bg-[rgba(99,102,241,0.2)] text-brand-light font-bold">
                  Trình độ {scrambleData.level} • {scrambleData.grammarFocus}
                </span>
                <Button
                  variant="unstyled"
                  className="btn-secondary text-xs px-2.5 py-1"
                  onClick={() => speakText(scrambleData.originalSentence)}
                >
                  🔊 Nghe mẫu (TTS)
                </Button>
              </div>

              <div className="bg-[rgba(255,255,255,0.03)] border-l-4 border-accent-amber p-4 rounded-r-lg mb-6">
                <span className="text-xs text-accent-amber font-bold uppercase block mb-1">Nghĩa tiếng Việt:</span>
                <p className="text-base text-white font-medium">{scrambleData.translationVi}</p>
              </div>

              {/* Target Drop/Selected Zone */}
              <div className="mb-4">
                <label className="text-xs text-muted block mb-2 font-semibold">
                  Câu của bạn (Bấm vào từ để hoàn thiện câu):
                </label>
                <div className="min-h-[56px] p-3 rounded-lg bg-[rgba(0,0,0,0.3)] border border-dashed border-[rgba(255,255,255,0.2)] flex flex-wrap gap-2 items-center">
                  {selectedTokens.length === 0 ? (
                    <span className="text-xs text-gray-500 italic">Chọn các từ bên dưới theo đúng thứ tự...</span>
                  ) : (
                    selectedTokens.map((token, idx) => (
                      <button
                        key={`${token}-${idx}`}
                        className="px-3 py-1.5 rounded bg-brand text-white font-medium text-sm shadow hover:bg-red-500 transition"
                        onClick={() => handleReturnToken(token, idx)}
                        title="Bấm để trả lại"
                      >
                        {token}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Available Tokens */}
              <div className="mb-6">
                <label className="text-xs text-muted block mb-2 font-semibold">Các từ khả dụng:</label>
                <div className="flex flex-wrap gap-2 min-h-[42px]">
                  {availableTokens.map((token, idx) => (
                    <button
                      key={`${token}-${idx}`}
                      className="px-3 py-1.5 rounded bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.18)] text-white text-sm font-medium transition"
                      onClick={() => handlePickToken(token, idx)}
                    >
                      {token}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scramble Result Diff */}
              {scrambleResult && (
                <div className={`p-4 rounded-lg mb-4 ${scrambleResult.isCorrect ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-200' : 'bg-rose-950/40 border border-rose-500/40 text-rose-200'}`}>
                  <div className="font-semibold text-sm mb-1">
                    {scrambleResult.isCorrect ? '🎉 Chính xác 100%!' : '⚠️ Thứ tự từ chưa chuẩn:'}
                  </div>
                  <div className="text-xs opacity-90">
                    <strong>Đáp án chuẩn:</strong> {scrambleData.originalSentence}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="unstyled" className="btn-primary text-sm px-4 py-2" onClick={handleCheckScramble}>
                  Kiểm Tra Kết Quả
                </Button>
                <Button variant="unstyled" className="btn-secondary text-sm px-4 py-2" onClick={handleNextScramble}>
                  Câu Tiếp Theo ⏭️
                </Button>
              </div>
            </div>
          )}

          {/* MODE: VOCAB QUIZ */}
          {practiceMode === 'quiz' && vocabItems.length > 0 && (
            <div className="glass-card p-6 max-w-2xl">
              {(() => {
                const item = vocabItems[currentQuizIndex % vocabItems.length];
                return (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs px-2.5 py-1 rounded bg-[rgba(99,102,241,0.2)] text-brand-light font-bold">
                        CEFR {item.level} • Cụm: "{item.term}"
                      </span>
                      <span className="text-xs text-muted">
                        {currentQuizIndex + 1} / {vocabItems.length}
                      </span>
                    </div>

                    <div className="text-sm text-gray-300 mb-2">
                      <strong>Nghĩa:</strong> {item.meaningVi}
                    </div>

                    <h4 className="text-white text-base font-semibold mb-4 leading-relaxed">
                      {item.question}
                    </h4>

                    <div className="space-y-2.5 mb-5">
                      {item.options.map((opt, idx) => {
                        let btnStyle = 'bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.1)]';
                        if (quizAnswerChecked) {
                          if (idx === item.correctIndex) {
                            btnStyle = 'bg-emerald-800/40 border-emerald-500 text-emerald-200 font-bold';
                          } else if (idx === selectedOption) {
                            btnStyle = 'bg-rose-800/40 border-rose-500 text-rose-200';
                          }
                        } else if (idx === selectedOption) {
                          btnStyle = 'bg-brand/30 border-brand text-white';
                        }
                        return (
                          <button
                            key={idx}
                            disabled={quizAnswerChecked}
                            className={`w-full text-left p-3 rounded-lg border text-sm transition flex items-center justify-between ${btnStyle}`}
                            onClick={() => setSelectedOption(idx)}
                          >
                            <span>{opt}</span>
                            {quizAnswerChecked && idx === item.correctIndex && <span>✓</span>}
                          </button>
                        );
                      })}
                    </div>

                    {quizAnswerChecked && (
                      <div className="p-3 bg-[rgba(255,255,255,0.04)] rounded-lg text-xs text-gray-300 mb-4">
                        💡 <strong>Giải thích:</strong> {item.explanation}
                        {item.synonym && <div className="mt-1 text-accent-cyan">Từ đồng nghĩa: {item.synonym}</div>}
                      </div>
                    )}

                    <div className="flex gap-3">
                      {!quizAnswerChecked ? (
                        <Button
                          variant="unstyled"
                          className="btn-primary text-sm px-4 py-2"
                          disabled={selectedOption === null}
                          onClick={() => setQuizAnswerChecked(true)}
                        >
                          Xác Nhận Đáp Án
                        </Button>
                      ) : (
                        <Button
                          variant="unstyled"
                          className="btn-primary text-sm px-4 py-2"
                          onClick={() => {
                            setCurrentQuizIndex(prev => (prev + 1) % vocabItems.length);
                            setSelectedOption(null);
                            setQuizAnswerChecked(false);
                          }}
                        >
                          Câu Kế Tiếp ⏭️
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* MODE: DICTATION */}
          {practiceMode === 'dictation' && currentDictationItem && (
            <div className="glass-card p-6 max-w-3xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs px-2.5 py-1 rounded bg-[rgba(99,102,241,0.2)] text-brand-light font-bold">
                  {currentDictationItem.level} • Nghe chép chính tả
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="unstyled"
                    className="btn-secondary text-xs px-3 py-1.5"
                    onClick={() => speakText(currentDictationItem.en, 1.0)}
                  >
                    🔊 Nghe Tốc Độ Bình Thường
                  </Button>
                  <Button
                    variant="unstyled"
                    className="btn-secondary text-xs px-3 py-1.5"
                    onClick={() => speakText(currentDictationItem.en, 0.75)}
                  >
                    🐢 Nghe Chậm (0.75x)
                  </Button>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs text-muted block mb-2 font-semibold">
                  Gõ lại toàn bộ câu bạn nghe được:
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.15)] rounded-lg p-3 text-sm text-white focus:outline-none focus:border-brand"
                  placeholder="Bấm nút 'Nghe' ở trên và gõ câu tại đây..."
                  value={dictationInput}
                  onChange={e => setDictationInput(e.target.value)}
                />
              </div>

              {dictationEval && (
                <div className="mb-5 p-4 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">Độ chính xác: {dictationEval.accuracy}%</span>
                    <span className="text-xs text-muted">
                      Khớp {dictationEval.matchedWords} / {dictationEval.totalWords} từ
                    </span>
                  </div>
                  <div className="text-xs text-gray-300 leading-relaxed mb-3">
                    <strong>Câu gốc:</strong> {currentDictationItem.en}
                  </div>
                  <div className="text-xs text-accent-amber">
                    <strong>Nghĩa tiếng Việt:</strong> {currentDictationItem.vi}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="unstyled" className="btn-primary text-sm px-4 py-2" onClick={handleCheckDictation}>
                  So Sánh Transcript
                </Button>
                <Button variant="unstyled" className="btn-secondary text-sm px-4 py-2" onClick={handleNextDictation}>
                  Bài Nghe Khác ⏭️
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: READERS & MEDIA */}
      {activeTab === 'readers' && (
        <div className="space-y-8">
          {/* VOA Multimedia Stories */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>🎙️ Bài Đọc Multimedia VOA Learning English (Kèm Audio & Câu Hỏi)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {voaStories.map(story => (
                <div key={story.id} className="glass-card p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-[rgba(99,102,241,0.2)] text-brand-light font-bold">
                        {story.level}
                      </span>
                      <span className="text-xs text-muted">⏱️ {story.audioDuration}</span>
                    </div>
                    <h4 className="text-white font-semibold text-base mb-2">{story.title}</h4>
                    <p className="text-muted text-xs leading-relaxed mb-4">{story.excerpt}</p>
                    
                    <div className="mb-4">
                      <span className="text-[11px] text-gray-400 font-bold block mb-1">Từ vựng trọng tâm:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {story.vocabulary.map(v => (
                          <span
                            key={v.word}
                            className="text-[11px] px-2 py-0.5 rounded bg-[rgba(255,255,255,0.06)] text-accent-cyan cursor-pointer hover:bg-[rgba(255,255,255,0.15)]"
                            onClick={() => speakText(v.word)}
                            title={`${v.ipa} - ${v.meaningVi}`}
                          >
                            {v.word} 🔊
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[rgba(255,255,255,0.08)] flex gap-2">
                    <Button
                      variant="unstyled"
                      className="btn-primary text-xs px-3 py-1.5 flex-1"
                      onClick={() => speakText(story.fullText)}
                    >
                      🔊 Đọc Audio Bài Này
                    </Button>
                    <Button
                      variant="unstyled"
                      className="btn-secondary text-xs px-3 py-1.5"
                      onClick={() => {
                        showToast(`💡 Nhiệm vụ viết: ${story.writingPrompt}`);
                      }}
                    >
                      ✍️ Đề Bài Viết
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gutenberg & LibriVox Extensive Reading */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>📚 Văn Học Cổ Điển Project Gutenberg & Sách Nói LibriVox</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {extensiveReaders.map(reader => (
                <div key={reader.id} className="glass-card p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-[rgba(99,102,241,0.2)] text-brand-light font-bold">
                        {reader.level} • {reader.author}
                      </span>
                      <span className="text-xs text-muted">{reader.wordCount}</span>
                    </div>
                    <h4 className="text-white font-semibold text-base mb-2">{reader.title}</h4>
                    <p className="text-muted text-xs leading-relaxed mb-3">{reader.description}</p>
                    
                    <div className="p-3 bg-[rgba(0,0,0,0.25)] rounded-lg text-xs text-gray-300 italic mb-4 border-l-2 border-accent-cyan">
                      "{reader.excerpt}"
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[rgba(255,255,255,0.08)] flex items-center justify-between gap-2">
                    <a
                      href={reader.gutenbergUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary text-xs px-3 py-1.5 flex-1 text-center"
                    >
                      📖 Đọc Toàn Bộ (Gutenberg) ↗
                    </a>
                    <a
                      href={reader.librivoxUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary text-xs px-3 py-1.5 flex-1 text-center"
                    >
                      🎧 Nghe Sách Nói (LibriVox) ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PROVENANCE & LICENSES */}
      {activeTab === 'provenance' && (
        <div className="glass-card p-6">
          <div className="mb-6">
            <h3 className="text-base font-bold text-white mb-1">
              📜 Ma Trận Bản Quyền & Nguồn Gốc (Provenance & License Matrix)
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Theo quy chuẩn Content Master Spec, hệ thống phân biệt nghiêm ngặt giữa tài nguyên Native (Public Domain / CC0 / CC-BY), tài nguyên Embed (YouTube API), và tài nguyên External (Chỉ liên kết nguồn gốc, không tự ý sao chép).
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.12)] text-muted uppercase">
                  <th className="py-2.5 px-3">Nhà Cung Cấp / Nguồn</th>
                  <th className="py-2.5 px-3">Phân Loại Bản Quyền</th>
                  <th className="py-2.5 px-3">Chế Độ Phân Phối</th>
                  <th className="py-2.5 px-3">Độ Tin Cậy</th>
                  <th className="py-2.5 px-3">Hành Vi Bắt Buộc</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.06)] text-gray-300">
                {sources.map(s => (
                  <tr key={s.id} className="hover:bg-[rgba(255,255,255,0.02)]">
                    <td className="py-3 px-3 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <span>{s.name}</span>
                        <a href={s.home} target="_blank" rel="noreferrer" className="text-accent-cyan hover:underline">↗</a>
                      </div>
                      <span className="text-[10px] text-gray-500 font-normal">{s.provider}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-[rgba(255,255,255,0.06)] text-brand-light font-mono text-[11px]">
                        {s.licenseClass}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex gap-1">
                        {s.deliveryModes.map(m => (
                          <span key={m} className="px-1.5 py-0.5 rounded bg-[rgba(0,0,0,0.3)] text-gray-400 text-[10px] uppercase">
                            {m}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="capitalize text-emerald-400 font-medium">{s.trust}</span>
                    </td>
                    <td className="py-3 px-3 text-gray-400">
                      {s.deliveryModes.includes('native') ? 'Lưu trữ & sinh bài tập trực tiếp' : 'Mở liên kết gốc hoặc nhúng chính thức'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
});
