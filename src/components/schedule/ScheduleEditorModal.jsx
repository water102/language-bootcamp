import { useEffect, useState, useRef } from 'react';
import { Sessionizer } from '@/core/planner/sessionizer.js';
import { appState, getActiveSchedule, showToast } from '@/runtime/controller.js';
import BOOTCAMP_DATA from '@/data.js';

export default function ScheduleEditorModal({ isOpen, onClose, onScheduleUpdated }) {
  const [schedule, setSchedule] = useState(() => {
    if (appState.customSchedule && Array.isArray(appState.customSchedule) && appState.customSchedule.length) {
      return JSON.parse(JSON.stringify(appState.customSchedule));
    }
    return JSON.parse(JSON.stringify(BOOTCAMP_DATA.dailySchedule));
  });

  const [activePreset, setActivePreset] = useState('custom');
  const fileInputRef = useRef(null);

  // The editor stays mounted while the app is open. Reload its draft when it
  // opens so a schedule restored from localStorage is never overwritten by the
  // initial default schedule.
  useEffect(() => {
    if (!isOpen) return;
    setSchedule(JSON.parse(JSON.stringify(getActiveSchedule())));
    setActivePreset(appState.customSchedule?.length ? 'custom' : '12h');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApply12hPreset = () => {
    const preset = JSON.parse(JSON.stringify(BOOTCAMP_DATA.dailySchedule));
    setSchedule(preset);
    setActivePreset('12h');
    showToast('Đã áp dụng mẫu 12H Bootcamp Chuẩn');
  };

  const handleApply8hPreset = () => {
    const raw8h = Sessionizer.getB1toC1EightHourPreset();
    const formatted = raw8h.map((slot, idx) => ({
      id: idx + 1,
      time: `${slot.startTime} - ${slot.endTime}`,
      startTime: slot.startTime,
      endTime: slot.endTime,
      block: slot.title,
      mode: slot.slotClass.toUpperCase(),
      output: `Hoàn thành 100% mục tiêu ca học ${slot.skill}`,
      skill: slot.skill,
      durationMinutes: slot.durationMinutes
    }));
    setSchedule(formatted);
    setActivePreset('8h');
    showToast('Đã áp dụng mẫu Lộ trình B1 → C1 8 Tiếng');
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const next = [...schedule];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    setSchedule(next);
  };

  const handleMoveDown = (index) => {
    if (index === schedule.length - 1) return;
    const next = [...schedule];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    setSchedule(next);
  };

  const handleDelete = (index) => {
    const next = schedule.filter((_, i) => i !== index);
    setSchedule(next);
  };

  const handleAddBlock = () => {
    const newId = schedule.length ? Math.max(...schedule.map(s => s.id || 0)) + 1 : 1;
    const newBlock = {
      id: newId,
      time: '14:00 - 15:30',
      startTime: '14:00',
      endTime: '15:30',
      block: 'Khối Học Tự Chọn (Custom Study Block)',
      mode: 'DEEP',
      output: 'Tập trung chuyên sâu kỹ năng mục tiêu',
      skill: 'speaking',
      durationMinutes: 90
    };
    setSchedule([...schedule, newBlock]);
  };

  const handleFieldChange = (index, field, value) => {
    const next = [...schedule];
    next[index] = { ...next[index], [field]: value };
    if (field === 'time') {
      const parts = value.replace('–', '-').split('-').map(s => s.trim());
      if (parts.length === 2) {
        next[index].startTime = parts[0];
        next[index].endTime = parts[1];
      }
    }
    setSchedule(next);
  };

  const handleExportJson = () => {
    const exportPayload = {
      version: "1.0",
      type: "c1_bootcamp_schedule",
      exportedAt: new Date().toISOString(),
      activePreset,
      totalBlocks: schedule.length,
      schedule
    };
    const dataStr = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `c1_study_schedule_${activePreset}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('📥 Đã tải xuống tệp JSON lịch học!');
  };

  const handleCopyJson = async () => {
    try {
      const exportPayload = {
        version: "1.0",
        type: "c1_bootcamp_schedule",
        exportedAt: new Date().toISOString(),
        schedule
      };
      await navigator.clipboard.writeText(JSON.stringify(exportPayload, null, 2));
      showToast('📋 Đã sao chép JSON lịch học vào bộ nhớ tạm!');
    } catch (e) {
      alert('Không thể tự động sao chép: ' + e.message);
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = event.target?.result;
        const parsed = JSON.parse(raw);
        const importedSchedule = Array.isArray(parsed) ? parsed : (parsed.schedule && Array.isArray(parsed.schedule) ? parsed.schedule : null);
        if (!importedSchedule || importedSchedule.length === 0) {
          throw new Error('Tệp JSON không chứa danh sách khối học hợp lệ.');
        }
        setSchedule(importedSchedule);
        setActivePreset('custom');
        showToast(`📤 Đã nhập thành công ${importedSchedule.length} khối học từ tệp JSON!`);
      } catch (err) {
        alert('Lỗi đọc tệp JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSave = () => {
    appState.customSchedule = schedule;
    try {
      localStorage.setItem('c1_custom_schedule', JSON.stringify(schedule));
    } catch (e) {}

    if (typeof onScheduleUpdated === 'function') {
      onScheduleUpdated(schedule);
    }
    showToast('💾 Đã lưu thời khóa biểu vào bộ nhớ thiết bị!');
    onClose();
  };

  return (
    <div id="schedule-editor-modal" className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#1f2937]/50">
          <div>
            <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
              <span>📅</span> Chỉnh Sửa Thời Khóa Biểu Trong Ngày
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Đồng bộ dữ liệu thời gian thực giữa Tiến Trình Timeline và Danh Sách Khung Giờ • Hỗ trợ Xuất & Nhập JSON
            </p>
          </div>
          <button id="close-schedule-editor-modal-btn" onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition">
            ✕
          </button>
        </div>

        {/* Presets & Sharing Toolbar */}
        <div className="p-4 bg-[#1e1b4b]/30 border-b border-white/5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-gray-300">Mẫu có sẵn:</span>
            <button
              id="apply-12h-preset-btn"
              onClick={handleApply12hPreset}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activePreset === '12h' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
            >
              12H Chuẩn
            </button>
            <button
              id="apply-8h-preset-btn"
              onClick={handleApply8hPreset}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activePreset === '8h' ? 'bg-amber-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
            >
              Lộ trình B1 → C1 8 Tiếng (Nghỉ 11h–13h45 & 16h–20h)
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-export-schedule-json"
              onClick={handleExportJson}
              title="Tải tệp JSON lịch học về máy để chia sẻ"
              className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 font-semibold text-xs flex items-center gap-1.5 transition border border-white/10"
            >
              <span>📥</span> Xuất JSON
            </button>
            <button
              id="btn-copy-schedule-json"
              onClick={handleCopyJson}
              title="Sao chép toàn bộ mã JSON lịch học"
              className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 font-semibold text-xs flex items-center gap-1.5 transition border border-white/10"
            >
              <span>📋</span> Copy
            </button>
            <button
              id="btn-import-schedule-json"
              onClick={() => fileInputRef.current?.click()}
              title="Nhập tệp JSON lịch học từ máy tính"
              className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 font-semibold text-xs flex items-center gap-1.5 transition border border-white/10"
            >
              <span>📤</span> Nhập JSON
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />

            <button
              id="btn-add-block"
              onClick={handleAddBlock}
              className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold text-xs flex items-center gap-1 text-white transition"
            >
              <span>+</span> Thêm Khối
            </button>
          </div>
        </div>

        {/* Blocks List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {schedule.map((block, idx) => (
            <div
              key={block.id || idx}
              className="p-3.5 bg-[#0b0f19] border border-white/10 rounded-xl flex items-center gap-3 hover:border-indigo-500/40 transition"
            >
              {/* Index & Reorder Controls */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <span className="text-xs font-bold text-gray-400 w-5 text-center">#{idx + 1}</span>
                <div className="flex flex-col gap-0.5">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMoveUp(idx)}
                    className="text-[10px] p-0.5 rounded bg-white/5 hover:bg-white/15 disabled:opacity-20 text-gray-300"
                    title="Di chuyển lên"
                  >
                    ▲
                  </button>
                  <button
                    disabled={idx === schedule.length - 1}
                    onClick={() => handleMoveDown(idx)}
                    className="text-[10px] p-0.5 rounded bg-white/5 hover:bg-white/15 disabled:opacity-20 text-gray-300"
                    title="Di chuyển xuống"
                  >
                    ▼
                  </button>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 flex-1 items-center">
                {/* Time Range */}
                <div className="md:col-span-3">
                  <label className="text-[10px] text-gray-400 block mb-0.5">Khung giờ (HH:mm - HH:mm)</label>
                  <input
                    type="text"
                    value={block.time || `${block.startTime || '07:00'} - ${block.endTime || '08:30'}`}
                    onChange={(e) => handleFieldChange(idx, 'time', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Block Name */}
                <div className="md:col-span-4">
                  <label className="text-[10px] text-gray-400 block mb-0.5">Tên ca học / Kỹ năng</label>
                  <input
                    type="text"
                    value={block.block || block.title || ''}
                    onChange={(e) => handleFieldChange(idx, 'block', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Target Output */}
                <div className="md:col-span-3">
                  <label className="text-[10px] text-gray-400 block mb-0.5">Mục tiêu đầu ra (Output KPI)</label>
                  <input
                    type="text"
                    value={block.output || ''}
                    onChange={(e) => handleFieldChange(idx, 'output', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-gray-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Mode Tag */}
                <div className="md:col-span-2">
                  <label className="text-[10px] text-gray-400 block mb-0.5">Chế độ học</label>
                  <select
                    value={(block.mode || 'DEEP').toUpperCase()}
                    onChange={(e) => handleFieldChange(idx, 'mode', e.target.value)}
                    className="w-full bg-[#1e293b] border border-white/10 rounded-lg px-2 py-1 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="DEEP">DEEP FOCUS</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LIGHT">LIGHT</option>
                  </select>
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => handleDelete(idx)}
                className="text-gray-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/5 transition shrink-0"
                title="Xóa khối học này"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#1f2937]/30 border-t border-white/5 flex justify-between items-center text-xs flex-wrap gap-3">
          <span className="text-gray-400">
            Tổng cộng {schedule.length} khối học. Tiến trình Timeline và Lịch cột phải sẽ đồng bộ ngay khi lưu.
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold transition"
            >
              Hủy
            </button>
            <button
              id="btn-save-schedule"
              onClick={handleSave}
              className="py-2 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-lg shadow-indigo-500/20"
            >
              💾 Lưu Thời Khóa Biểu
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
