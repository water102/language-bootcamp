import { memo, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import BOOTCAMP_DATA from '@/data';
import { updateGrammarMastery } from '@/store';
import { showToast } from '@/runtime/controller';

export default memo(function GrammarPage() {
  const dispatch = useDispatch();
  const grammarMastery = useSelector(state => state.study.grammarMastery || {});

  const [levelFilter, setLevelFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filterButtons = [
    { id: 'all', label: 'Tất cả' },
    { id: 'a1_a2', label: 'A1–A2 Core' },
    { id: 'b1', label: 'B1 Core' },
    { id: 'b2', label: 'B2 Control' },
    { id: 'c1', label: 'C1 Refinement' },
  ];

  const allItems = useMemo(() => {
    const syllabus = BOOTCAMP_DATA.grammarSyllabus || {};
    let list = [];
    if (syllabus.A1_A2) list = list.concat(syllabus.A1_A2.map(g => ({ name: g, level: 'A1-A2', key: 'a1_a2' })));
    if (syllabus.B1) list = list.concat(syllabus.B1.map(g => ({ name: g, level: 'B1', key: 'b1' })));
    if (syllabus.B2) list = list.concat(syllabus.B2.map(g => ({ name: g, level: 'B2', key: 'b2' })));
    if (syllabus.C1) list = list.concat(syllabus.C1.map(g => ({ name: g, level: 'C1', key: 'c1' })));
    return list;
  }, []);

  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return allItems.filter(item => {
      const matchLevel = levelFilter === 'all' || item.key === levelFilter;
      const matchSearch = term === '' || item.name.toLowerCase().includes(term);
      return matchLevel && matchSearch;
    });
  }, [allItems, levelFilter, searchTerm]);

  const handleOpenLesson = (item) => {
    window.dispatchEvent(new CustomEvent('open-grammar-lesson', {
      detail: { name: item.name, level: item.level }
    }));
  };

  const handleToggleMastery = (name, type) => {
    dispatch(updateGrammarMastery({ name, type }));
    showToast(`Đã cập nhật tiến độ ngữ pháp: ${name}`);
  };

  return (
    <section className="page-view" id="view-grammar">
      <div className="view-header">
        <h2>Ma Trận Ngữ Pháp & Use of English (A1 đến C1)</h2>
        <p>
          Quy tắc làm chủ ngữ pháp: Một chủ điểm chỉ được tính là hoàn thành khi bạn: (1) Hiểu bản chất → (2) Viết chính xác không cần gợi ý → (3) Nói phản xạ trơn tru dưới áp lực.
        </p>
      </div>

      <div className="glass-card">
        <div className="flex justify-between items-center mb-[20px] flex-wrap gap-[12px]">
          <div className="filter-pills">
            {filterButtons.map(btn => (
              <Button
                key={btn.id}
                variant="unstyled"
                className={`filter-pill grammar-filter-btn ${levelFilter === btn.id ? 'active' : ''}`}
                onClick={() => setLevelFilter(btn.id)}
              >
                {btn.label}
              </Button>
            ))}
          </div>
          <div className="search-input-box max-w-xs">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm chủ điểm ngữ pháp..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grammar-table-container">
          <table className="grammar-table">
            <thead>
              <tr>
                <th className="w-[100px]">Cấp độ</th>
                <th>Chủ Điểm Ngữ Pháp</th>
                <th className="w-[150px]">Bài Học & Bài Tập</th>
                <th className="w-[340px]">Cấp Độ Làm Chủ (Mastery Levels)</th>
              </tr>
            </thead>
            <tbody id="grammar-table-body">
              {filteredItems.map(item => {
                const mastery = grammarMastery[item.name] || { understand: false, written: false, spoken: false };
                const levelClass = item.level.toLowerCase().replace('-', '_');

                return (
                  <tr key={item.name} data-grammar-name={item.name}>
                    <td>
                      <span className={`cefr-tag ${levelClass}`}>{item.level}</span>
                    </td>
                    <td className="font-semibold text-[#fff]">{item.name}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-open-grammar-lesson px-2.5 py-1 rounded bg-indigo-600/80 hover:bg-indigo-600 text-xs font-semibold text-white shadow transition flex items-center gap-1.5"
                        title="Mở nội dung bài học lý thuyết và bài tập trắc nghiệm"
                        onClick={() => handleOpenLesson(item)}
                      >
                        <span>📖</span>
                        <span>Học & Bài Tập</span>
                      </button>
                    </td>
                    <td>
                      <div className="mastery-checkbox-group">
                        <label className={`mastery-pill-check ${mastery.understand ? 'checked' : ''}`}>
                          <input
                            type="checkbox"
                            checked={!!mastery.understand}
                            onChange={() => handleToggleMastery(item.name, 'understand')}
                          />
                          <span>1. Hiểu</span>
                        </label>
                        <label className={`mastery-pill-check ${mastery.written ? 'checked' : ''}`}>
                          <input
                            type="checkbox"
                            checked={!!mastery.written}
                            onChange={() => handleToggleMastery(item.name, 'written')}
                          />
                          <span>2. Viết đúng</span>
                        </label>
                        <label className={`mastery-pill-check ${mastery.spoken ? 'checked' : ''}`}>
                          <input
                            type="checkbox"
                            checked={!!mastery.spoken}
                            onChange={() => handleToggleMastery(item.name, 'spoken')}
                          />
                          <span>3. Nói phản xạ</span>
                        </label>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
});
