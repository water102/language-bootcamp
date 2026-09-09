import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { highlightSchedulePanel, switchCurrentDay, speakText, showToast, appState } from '@/runtime/controller';
export default memo(function RoadmapPage() { return (<section className="page-view" id="view-roadmap">
<div className="view-header">
<h2>{"Lộ Trình Tương Tác 120 Ngày Master Plan"}</h2>
<p>{"Kế hoạch chi tiết từng ngày từ A1 đến C1 Benchmark. Bấm vào bất kỳ ngày nào để xem toàn bộ nhiệm vụ hoặc đánh dấu hoàn thành."}</p>
</div>
<div className="roadmap-controls">
<div className="filter-pills">
<Button variant="unstyled" className="filter-pill roadmap-filter-pill active" data-level="all">{"Tất cả (120 ngày)"}</Button>
<Button variant="unstyled" className="filter-pill roadmap-filter-pill" data-level="a1">{"A1 Foundation"}</Button>
<Button variant="unstyled" className="filter-pill roadmap-filter-pill" data-level="a2">{"A2 Independence"}</Button>
<Button variant="unstyled" className="filter-pill roadmap-filter-pill" data-level="b1">{"B1 Intermediate"}</Button>
<Button variant="unstyled" className="filter-pill roadmap-filter-pill" data-level="b2">{"B2 Upper-Intermediate"}</Button>
<Button variant="unstyled" className="filter-pill roadmap-filter-pill" data-level="c1">{"C1 Advanced Control"}</Button>
<Button variant="unstyled" className="filter-pill roadmap-filter-pill" data-level="gate">{"⭐ Phase Gates"}</Button>
</div>
<div className="search-input-box">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
<input type="text" id="roadmap-search-input" placeholder="Tìm kiếm ngữ pháp, từ vựng, chủ đề..." />
</div>
</div>
<div className="roadmap-grid" id="roadmap-grid-container"></div>
</section>); });
