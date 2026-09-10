import { memo, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { updateDay0Assessment } from '@/store';
import { showToast } from '@/runtime/controller';

export default memo(function AssessmentPage() {
  const dispatch = useDispatch();
  const day0Assessment = useSelector(state => state.study.day0Assessment || {});

  const [externalCefr, setExternalCefr] = useState(day0Assessment.externalCefr || '');
  const [listeningLevel, setListeningLevel] = useState(day0Assessment.listeningLevel || 'A1');
  const [readingLevel, setReadingLevel] = useState(day0Assessment.readingLevel || 'A1');

  useEffect(() => {
    if (day0Assessment) {
      setExternalCefr(day0Assessment.externalCefr || '');
      setListeningLevel(day0Assessment.listeningLevel || 'A1');
      setReadingLevel(day0Assessment.readingLevel || 'A1');
    }
  }, [day0Assessment]);

  const handleSaveBaseline = (e) => {
    e.preventDefault();
    dispatch(updateDay0Assessment({
      externalCefr,
      listeningLevel,
      readingLevel
    }));
    showToast('🎉 Đã lưu kết quả Day 0 Baseline vào hệ thống!');
  };

  return (
    <section className="page-view" id="view-assessment">
      <div className="view-header">
        <h2>Đánh Giá Baseline Day 0 & Bảng Rubric Kiểm Tra Hàng Tuần</h2>
        <p>
          Mỗi ngày thứ 7 là một bài kiểm tra nghiêm túc kéo dài 4-5 tiếng để đo lường năng lực và điều chỉnh khối lượng học cho tuần tiếp theo.
        </p>
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-[24px] mb-[24px]">
        <div className="glass-card">
          <h3 className="font-display text-[18px] text-[#fff] mb-[14px]">
            📊 Đánh Giá Ban Đầu (Day 0 Baseline)
          </h3>
          <form onSubmit={handleSaveBaseline} className="flex flex-col gap-[12px]">
            <div className="form-group">
              <label>Ước tính CEFR ban đầu (British Council test):</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ví dụ: A2 / B1 Low"
                value={externalCefr}
                onChange={e => setExternalCefr(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Working Listening Level (≥70% không nhìn transcript):</label>
              <select
                className="form-input"
                value={listeningLevel}
                onChange={e => setListeningLevel(e.target.value)}
              >
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="C1">C1</option>
              </select>
            </div>
            <div className="form-group">
              <label>Working Reading Level (≥70% trong thời gian chuẩn):</label>
              <select
                className="form-input"
                value={readingLevel}
                onChange={e => setReadingLevel(e.target.value)}
              >
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="C1">C1</option>
              </select>
            </div>
            <Button type="submit" variant="unstyled" className="btn-primary mt-2">
              Lưu Kết Quả Day 0
            </Button>
          </form>
        </div>

        <div className="glass-card">
          <h3 className="font-display text-[18px] text-[#fff] mb-[14px]">
            Bảng Tiêu Chuẩn Điểm Kiểm Tra Tuần (Pass Criteria)
          </h3>
          <div className="flex flex-col gap-[10px]">
            <div className="py-[10px] px-[14px] rounded-[8px] bg-[rgba(255,255,255,0.03)]">
              <strong className="text-brand-light">A. Từ vựng (30m):</strong>
              <span className="text-muted text-[13px]"> Lấy mẫu 50 chunks. Tạo câu đúng trong 10s. Đạt: ≥40/50.</span>
            </div>
            <div className="py-[10px] px-[14px] rounded-[8px] bg-[rgba(255,255,255,0.03)]">
              <strong className="text-accent-amber">B. Ngữ pháp (30m):</strong>
              <span className="text-muted text-[13px]"> 2 khẳng định, 1 phủ định, 1 câu hỏi, 1 câu nói tự nhiên. Đạt: ≥80%.</span>
            </div>
            <div className="py-[10px] px-[14px] rounded-[8px] bg-[rgba(255,255,255,0.03)]">
              <strong className="text-accent-cyan">C. Bài nghe (45m):</strong>
              <span className="text-muted text-[13px]"> Bài nghe target-level hoàn toàn mới. Đạt: ≥70% (hướng tới 80%).</span>
            </div>
            <div className="py-[10px] px-[14px] rounded-[8px] bg-[rgba(255,255,255,0.03)]">
              <strong className="text-accent-green">D. Bài đọc (45m):</strong>
              <span className="text-muted text-[13px]"> Bài đọc target-level mới. Đạt: A1/A2 ≥80%, B1 ≥75%, B2 ≥70%, C1 ≥65-70%.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card">
        <h3 className="font-display text-[18px] text-[#fff] mb-[14px]">
          Rubric Chấm Điểm Kỹ Năng Nói 5 Chiều (Speaking 0–5 Rubric)
        </h3>
        <div className="overflow-x-auto">
          <table className="grammar-table">
            <thead>
              <tr>
                <th>Tiêu chí</th>
                <th>Điểm 0 (Blocking)</th>
                <th>Điểm 3 (Competent)</th>
                <th>Điểm 5 (C1 Mastery)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Fluency (Độ trôi chảy)</strong></td>
                <td className="text-[#f43f5e]">Ngắt quãng liên tục, ấp úng</td>
                <td>Nói câu liền mạch, ngừng tự nhiên</td>
                <td className="text-accent-green">Lưu loát, linh hoạt, tốc độ tự nhiên</td>
              </tr>
              <tr>
                <td><strong>Grammar Range & Control</strong></td>
                <td className="text-[#f43f5e]">Nhiều lỗi cơ bản làm nghẽn ý</td>
                <td>Kiểm soát tốt câu đơn và câu ghép</td>
                <td className="text-accent-green">Cấu trúc phức phong phú, chuẩn xác cao</td>
              </tr>
              <tr>
                <td><strong>Lexical Precision</strong></td>
                <td className="text-[#f43f5e]">Vốn từ rất hạn chế, lặp từ</td>
                <td>Đủ từ diễn đạt ý tưởng thông thường</td>
                <td className="text-accent-green">Cụm từ đắt giá, collocations tự nhiên</td>
              </tr>
              <tr>
                <td><strong>Pronunciation</strong></td>
                <td className="text-[#f43f5e]">Phát âm biến dạng, khó hiểu</td>
                <td>Dễ hiểu dù còn chút ngữ điệu mẹ đẻ</td>
                <td className="text-accent-green">Tròn vành rõ chữ, nối âm, ngữ điệu tinh tế</td>
              </tr>
              <tr>
                <td><strong>Coherence (Mạch lạc)</strong></td>
                <td className="text-[#f43f5e]">Ý tưởng rời rạc từng từ</td>
                <td>Liên kết câu bằng từ nối thông dụng</td>
                <td className="text-accent-green">Bố cục chặt chẽ, dẫn dắt sắc bén</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
});
