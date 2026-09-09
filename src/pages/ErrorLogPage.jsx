import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { highlightSchedulePanel, switchCurrentDay, speakText, showToast, appState } from '@/runtime/controller';
export default memo(function ErrorLogPage() { return (<section className="page-view" id="view-error-log">
<div className="view-header">
<h2>{"Sổ Tay Lỗi Vàng (The Golden Error Log) & Sao Lưu Dữ Liệu"}</h2>
<p>{"Quy tắc bất biến: Mọi lỗi sai lặp lại từ 3 lần trở lên đều phải được đưa vào Error Log và chuyển hóa thành thẻ Anki/SRS để sửa tận gốc mô hình ngôn ngữ trong não bạn."}</p>
</div>

<div className="glass-card mb-[24px]" >
<h3 className="font-display text-[18px] text-[#fff] mb-[16px]" >{"\n            ➕ Ghi Nhận Mẫu Lỗi Sai Mới\n          "}</h3>
<div className="error-log-form">
<div className="form-group">
<label>{"Mẫu Lỗi (Pattern / Lĩnh vực lỗi):"}</label>
<input type="text" id="err-input-pattern" className="form-input" placeholder="Ví dụ: Giới từ sau be interested, -ed ending..." />
</div>
<div className="form-group">
<label>{"Câu Sai Của Bạn (My Mistake):"}</label>
<input type="text" id="err-input-mistake" className="form-input" placeholder="Ví dụ: I am interested on reading..." />
</div>
<div className="form-group">
<label>{"Bản Sửa Đúng Chuẩn (Corrected Form):"}</label>
<input type="text" id="err-input-correction" className="form-input" placeholder="Ví dụ: I am interested in reading..." />
</div>
<div className="form-group">
<label>{"Quy Tắc Rút Ra (Short Rule):"}</label>
<input type="text" id="err-input-rule" className="form-input" placeholder="Ví dụ: interested đi kèm in + V-ing/Noun" />
</div>
</div>
<Button variant="unstyled" className="btn-primary" id="btn-add-error-log">{"\n            💾 Lưu Vào Sổ Lỗi Vàng\n          "}</Button>
</div>

<div className="glass-card mb-[24px]" >
<h3 className="font-display text-[18px] text-[#fff] mb-[16px]" >{"\n            Danh Sách Lỗi Đang Khắc Phục\n          "}</h3>
<div className="grammar-table-container">
<table className="grammar-table">
<thead>
<tr>
<th className="w-[110px]" >{"Ngày ghi"}</th>
<th className="w-[160px]" >{"Mẫu lỗi"}</th>
<th>{"Câu sai"}</th>
<th>{"Bản sửa đúng"}</th>
<th>{"Quy tắc ngữ pháp"}</th>
</tr>
</thead>
<tbody id="error-log-table-body"></tbody>
</table>
</div>
</div>

<div className="glass-card">
<h3 className="font-display text-[18px] text-[#fff] mb-[10px]" >{"\n            🛡️ An Toàn Dữ Liệu (Backup & Restore)\n          "}</h3>
<p className="text-[13.5px] text-muted mb-[16px]" >{"\n            Toàn bộ tiến độ học tập, thẻ flashcards, bài viết, và sổ lỗi của bạn được lưu an toàn trong trình duyệt (LocalStorage). Bạn có thể tải file JSON dự phòng về máy tính hoặc chuyển sang máy khác bất kỳ lúc nào.\n          "}</p>
<div className="flex gap-[14px] flex-wrap" >
<Button variant="unstyled" className="btn-primary" id="btn-export-backup">{"\n              📥 Tải File Sao Lưu (Export JSON)\n            "}</Button>
<label className="btn-secondary cursor-pointer" >{"\n              📤 Khôi Phục Từ File JSON (Import)\n              "}<input className="hidden" type="file" id="input-import-backup" accept=".json"  />
</label>
</div>
</div>
</section>); });
