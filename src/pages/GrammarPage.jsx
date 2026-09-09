import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { highlightSchedulePanel, switchCurrentDay, speakText, showToast, appState } from '@/runtime/controller';
export default memo(function GrammarPage() { return (<section className="page-view" id="view-grammar">
<div className="view-header">
<h2>{"Ma Trận Ngữ Pháp & Use of English (A1 đến C1)"}</h2>
<p>{"Quy tắc làm chủ ngữ pháp: Một chủ điểm chỉ được tính là hoàn thành khi bạn: (1) Hiểu bản chất → (2) Viết chính xác không cần gợi ý → (3) Nói phản xạ trơn tru dưới áp lực."}</p>
</div>
<div className="glass-card">
<div className="flex justify-between items-center mb-[20px] flex-wrap gap-[12px]" >
<div className="filter-pills">
<Button variant="unstyled" className="filter-pill grammar-filter-btn active" data-level="all">{"Tất cả"}</Button>
<Button variant="unstyled" className="filter-pill grammar-filter-btn" data-level="a1_a2">{"A1–A2 Core"}</Button>
<Button variant="unstyled" className="filter-pill grammar-filter-btn" data-level="b1">{"B1 Core"}</Button>
<Button variant="unstyled" className="filter-pill grammar-filter-btn" data-level="b2">{"B2 Control"}</Button>
<Button variant="unstyled" className="filter-pill grammar-filter-btn" data-level="c1">{"C1 Refinement"}</Button>
</div>
</div>
<div className="grammar-table-container">
<table className="grammar-table">
<thead>
<tr>
<th className="w-[100px]" >{"Cấp độ"}</th>
<th>{"Chủ Điểm Ngữ Pháp"}</th>
<th className="w-[150px]" >{"Bài Học & Bài Tập"}</th>
<th className="w-[340px]" >{"Cấp Độ Làm Chủ (Mastery Levels)"}</th>
</tr>
</thead>
<tbody id="grammar-table-body"></tbody>
</table>
</div>
</div>
</section>); });
