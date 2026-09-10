import { memo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import dayjs from 'dayjs';
import { addErrorLog, removeErrorLog, replaceStudy } from '@/store';
import { showToast } from '@/runtime/controller';

export default memo(function ErrorLogPage() {
  const dispatch = useDispatch();
  const studyState = useSelector(state => state.study);
  const errorLog = useSelector(state => state.study.errorLog || []);

  const [pattern, setPattern] = useState('');
  const [mistake, setMistake] = useState('');
  const [correction, setCorrection] = useState('');
  const [rule, setRule] = useState('');

  const handleAddError = (e) => {
    e.preventDefault();
    if (!pattern.trim() || !mistake.trim() || !correction.trim()) {
      showToast('Vui lòng nhập đầy đủ các trường: Mẫu lỗi, Câu sai và Bản sửa đúng!');
      return;
    }

    dispatch(addErrorLog({
      id: Date.now(),
      date: dayjs().format('DD/MM/YYYY'),
      pattern: pattern.trim(),
      mistake: mistake.trim(),
      correction: correction.trim(),
      rule: rule.trim()
    }));

    setPattern('');
    setMistake('');
    setCorrection('');
    setRule('');
    showToast('✅ Đã thêm lỗi mới vào Golden Error Log!');
  };

  const handleDeleteError = (id) => {
    dispatch(removeErrorLog(id));
    showToast('🗑️ Đã xóa mục lỗi khỏi sổ tay.');
  };

  const handleExportBackup = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(studyState, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `c1_bootcamp_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('📥 Đã tải về file sao lưu dữ liệu JSON thành công!');
    } catch {
      showToast('Không thể tạo file sao lưu.');
    }
  };

  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result);
        if (imported && typeof imported === 'object') {
          dispatch(replaceStudy(imported));
          showToast('🎉 Đã khôi phục toàn bộ dữ liệu học tập thành công!');
        }
      } catch {
        showToast('File JSON không hợp lệ hoặc bị lỗi định dạng!');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <section className="page-view" id="view-error-log">
      <div className="view-header">
        <h2>Sổ Tay Lỗi Vàng (The Golden Error Log) & Sao Lưu Dữ Liệu</h2>
        <p>
          Quy tắc bất biến: Mọi lỗi sai lặp lại từ 3 lần trở lên đều phải được đưa vào Error Log và chuyển hóa thành thẻ Anki/SRS để sửa tận gốc mô hình ngôn ngữ trong não bạn.
        </p>
      </div>

      <div className="glass-card mb-[24px]">
        <h3 className="font-display text-[18px] text-[#fff] mb-[16px]">
          ➕ Ghi Nhận Mẫu Lỗi Sai Mới
        </h3>
        <form onSubmit={handleAddError}>
          <div className="error-log-form">
            <div className="form-group">
              <label>Mẫu Lỗi (Pattern / Lĩnh vực lỗi):</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ví dụ: Giới từ sau be interested, -ed ending..."
                value={pattern}
                onChange={e => setPattern(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Câu Sai Của Bạn (My Mistake):</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ví dụ: I am interested on reading..."
                value={mistake}
                onChange={e => setMistake(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Bản Sửa Đúng Chuẩn (Corrected Form):</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ví dụ: I am interested in reading..."
                value={correction}
                onChange={e => setCorrection(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Quy Tắc Rút Ra (Short Rule):</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ví dụ: interested đi kèm in + V-ing/Noun"
                value={rule}
                onChange={e => setRule(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" variant="unstyled" className="btn-primary" id="btn-add-error-log">
            💾 Lưu Vào Sổ Lỗi Vàng
          </Button>
        </form>
      </div>

      <div className="glass-card mb-[24px]">
        <div className="flex justify-between items-center mb-[16px]">
          <h3 className="font-display text-[18px] text-[#fff]">
            Danh Sách Lỗi Đang Khắc Phục ({errorLog.length})
          </h3>
        </div>
        <div className="grammar-table-container">
          <table className="grammar-table">
            <thead>
              <tr>
                <th className="w-[110px]">Ngày ghi</th>
                <th className="w-[160px]">Mẫu lỗi</th>
                <th>Câu sai</th>
                <th>Bản sửa đúng</th>
                <th>Quy tắc ngữ pháp</th>
                <th className="w-[80px]">Thao tác</th>
              </tr>
            </thead>
            <tbody id="error-log-table-body">
              {errorLog.length === 0 ? (
                <tr>
                  <td className="text-center text-dim p-[24px]" colSpan="6">
                    Chưa có lỗi nào được ghi nhận. Hãy thêm mọi lỗi lặp lại từ 3 lần trở lên vào sổ tay lỗi!
                  </td>
                </tr>
              ) : (
                errorLog.map(err => (
                  <tr key={err.id}>
                    <td className="font-code text-[12px] text-dim">{err.date}</td>
                    <td className="font-bold text-accent-amber">{err.pattern}</td>
                    <td className="text-[#f43f5e] line-through">{err.mistake}</td>
                    <td className="text-accent-green font-semibold">{err.correction}</td>
                    <td className="text-[13px] text-muted">{err.rule}</td>
                    <td>
                      <button
                        type="button"
                        className="text-xs px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                        title="Xóa lỗi này"
                        onClick={() => handleDeleteError(err.id)}
                      >
                        ✕ Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card">
        <h3 className="font-display text-[18px] text-[#fff] mb-[10px]">
          🛡️ An Toàn Dữ Liệu (Backup & Restore)
        </h3>
        <p className="text-[13.5px] text-muted mb-[16px]">
          Toàn bộ tiến độ học tập, thẻ flashcards, bài viết, và sổ lỗi của bạn được lưu an toàn trong trình duyệt (LocalStorage). Bạn có thể tải file JSON dự phòng về máy tính hoặc chuyển sang máy khác bất kỳ lúc nào.
        </p>
        <div className="flex gap-[14px] flex-wrap items-center">
          <Button
            variant="unstyled"
            className="btn-primary"
            id="btn-export-backup"
            onClick={handleExportBackup}
          >
            📥 Tải File Sao Lưu (Export JSON)
          </Button>
          <label className="btn-secondary cursor-pointer inline-flex items-center">
            📤 Khôi Phục Từ File JSON (Import)
            <input
              className="hidden"
              type="file"
              id="input-import-backup"
              accept=".json"
              onChange={handleImportBackup}
            />
          </label>
        </div>
      </div>
    </section>
  );
});
