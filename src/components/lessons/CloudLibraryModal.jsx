import { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { Button } from '@/components/ui/button';
import { isCloudSyncEnabled, fetchSharedLessonLibrary } from '@/core/firebase/lessonCloudSync.js';
import { saveCustomLessonLocal, getCustomLessonVersions } from '@/core/storage/db.js';
import { CurriculumContentEngine } from '@/core/curriculum/curriculumContentEngine.js';
import { appState, showToast } from '@/runtime/controller.js';

const LEVEL_TAG = {
  A1: 'a1', A2: 'a2', B1: 'b1', B2: 'b2', C1: 'c1'
};

export default function CloudLibraryModal({ isOpen, onClose }) {
  const [lessons, setLessons] = useState([]);
  const [localIds, setLocalIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [applyingId, setApplyingId] = useState(null);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [search, setSearch] = useState('');

  const loadLibrary = useCallback(async () => {
    if (!isCloudSyncEnabled()) {
      setError('Đồng bộ đám mây đang tắt hoặc Firebase chưa được cấu hình — không thể tải kho bài học dùng chung.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetchSharedLessonLibrary();
      if (res.success) {
        setLessons(res.lessons);
        setLastSyncedAt(new Date().toISOString());
      } else {
        setError(res.message);
      }
    } catch (e) {
      setError(`Lỗi tải kho bài học: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshLocalIds = useCallback(async () => {
    const ids = new Set();
    try {
      for (let d = 1; d <= 120; d++) {
        const versions = await getCustomLessonVersions(d);
        versions.forEach(v => { if (v.id) ids.add(v.id); });
      }
    } catch (e) {}
    setLocalIds(ids);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    loadLibrary();
    refreshLocalIds();
    const onCloudUpdate = () => { loadLibrary(); refreshLocalIds(); };
    window.addEventListener('cloud-lessons-updated', onCloudUpdate);
    return () => window.removeEventListener('cloud-lessons-updated', onCloudUpdate);
  }, [isOpen, loadLibrary, refreshLocalIds]);

  if (!isOpen) return null;

  const handleApply = async (lesson) => {
    setApplyingId(lesson.id);
    try {
      // 1. Persist as a local version and make it the active one for its day
      const saved = await saveCustomLessonLocal(lesson);

      // 2. Register in the content engine & app state
      CurriculumContentEngine.setCustomLesson(saved);
      if (!appState.customLessons) appState.customLessons = {};
      appState.customLessons[saved.day] = saved;

      // 3. Reuse the import flow: controller switches to the day, rebuilds
      //    flashcards and refreshes every study view.
      window.dispatchEvent(new CustomEvent('custom-lesson-applied', { detail: saved }));

      showToast(`☁️ Đã áp dụng bài học dùng chung "${saved.theme}" (Day ${saved.day}) từ ${lesson.sharedBy || 'nhóm'}.`);
      setLocalIds(prev => new Set([...prev, saved.id]));
    } catch (e) {
      showToast(`Không thể áp dụng bài học: ${e.message}`);
    } finally {
      setApplyingId(null);
    }
  };

  const keyword = search.trim().toLowerCase();
  const filtered = keyword
    ? lessons.filter(l =>
        String(l.day).includes(keyword) ||
        (l.theme || '').toLowerCase().includes(keyword) ||
        (l.grammar || '').toLowerCase().includes(keyword) ||
        (l.sharedBy || '').toLowerCase().includes(keyword))
    : lessons;

  const uniqueDays = new Set(lessons.map(l => Number(l.day))).size;
  const members = new Set(lessons.map(l => l.sharedBy).filter(Boolean)).size;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" id="cloud-library-modal">
      <div className="glass-card w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#0f172a] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">☁️</span>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Kho Bài Học Dùng Chung Của Nhóm
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">Firebase Cloud</span>
              </h3>
              <p className="text-xs text-slate-400">
                Tất cả bài học mà mọi thành viên đã nhập vào hệ thống đều xuất hiện ở đây cho mọi người xem và áp dụng.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Stats + Actions */}
        <div className="px-4 pt-3 pb-2 flex flex-wrap items-center justify-between gap-2 bg-slate-900/40">
          <div className="flex items-center gap-2 flex-wrap text-[11px]">
            <span className="px-2 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-bold">
              📚 {lessons.length} bài học
            </span>
            <span className="px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
              📅 {uniqueDays} ngày khác nhau
            </span>
            {members > 0 && (
              <span className="px-2 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                👥 {members} thành viên chia sẻ
              </span>
            )}
            {lastSyncedAt && (
              <span className="text-slate-500 font-mono">
                Đồng bộ lúc {dayjs(lastSyncedAt).format('HH:mm:ss DD/MM')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo ngày, chủ đề, người chia sẻ..."
              className="text-[11px] py-1.5 px-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500 w-44"
              id="cloud-library-search-input"
            />
            <Button
              variant="unstyled"
              onClick={loadLibrary}
              disabled={loading}
              className="btn-secondary text-[11px] py-1.5 px-2.5 rounded-lg flex items-center gap-1"
              id="btn-refresh-cloud-library"
            >
              {loading ? '⏳ Đang tải...' : '🔄 Làm mới'}
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-2.5 text-xs" id="cloud-library-list">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-200">
              ⚠️ {error}
            </div>
          )}

          {loading && lessons.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              Đang tải kho bài học dùng chung từ Firebase Cloud...
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/60 text-center text-slate-300">
              <div className="text-3xl mb-2">☁️</div>
              {lessons.length === 0
                ? 'Chưa có bài học nào trên Cloud. Hãy nhập bài học đầu tiên — mọi thành viên sẽ thấy ngay!'
                : 'Không có bài học nào khớp từ khóa tìm kiếm.'}
            </div>
          )}

          {filtered.map(lesson => {
            const isLocal = localIds.has(lesson.id);
            const isApplied = appState.customLessons?.[lesson.day]?.id === lesson.id;
            const levelKey = LEVEL_TAG[(lesson.level || '').toUpperCase()] || 'b1';
            return (
              <div
                key={lesson.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${isApplied ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-slate-800/50 border-slate-700/60 hover:border-cyan-500/40'}`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex flex-col items-center shrink-0">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Day</span>
                    <span className="text-lg font-bold text-white leading-none">{lesson.day}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-white truncate">{lesson.theme || `Bài học Day ${lesson.day}`}</span>
                      <span className={`cefr-tag ${levelKey}`}>{lesson.level || '—'}</span>
                      {isApplied ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">✅ Đang áp dụng</span>
                      ) : isLocal ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/30 font-bold">Đã có trên máy</span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">Mới từ nhóm</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span>📐 {lesson.grammar || '—'}</span>
                      {lesson.sharedBy && <span>👤 {lesson.sharedBy}</span>}
                      {(lesson.cloudSyncedAt || lesson.updatedAt) && (
                        <span className="font-mono">🕒 {dayjs(lesson.cloudSyncedAt || lesson.updatedAt).format('HH:mm DD/MM')}</span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="unstyled"
                  disabled={applyingId === lesson.id}
                  onClick={() => handleApply(lesson)}
                  className={isApplied
                    ? 'btn-secondary text-[11px] py-1.5 px-3 rounded-lg whitespace-nowrap'
                    : 'btn-primary text-[11px] py-1.5 px-3 rounded-lg whitespace-nowrap bg-cyan-600 hover:bg-cyan-500'}
                  id={`btn-apply-cloud-lesson-${lesson.day}`}
                >
                  {applyingId === lesson.id ? '⏳ Đang áp dụng...' : isApplied ? '🔄 Nạp lại' : '🚀 Áp dụng & Mở'}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-900/80 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-500">
            💡 Bài học mới do thành viên nhập sẽ tự động xuất hiện ở đây và trong danh sách phiên bản của từng ngày.
          </span>
          <Button variant="unstyled" onClick={onClose} className="btn-secondary py-2 px-4 text-xs">
            Đóng
          </Button>
        </div>

      </div>
    </div>
  );
}
