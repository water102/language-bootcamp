import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ReactTimeAgo from 'react-time-ago';
import TimeAgo from 'javascript-time-ago';
import vi from 'javascript-time-ago/locale/vi';
import dayjs from 'dayjs';
import { Button } from '@/components/ui/button';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);
TimeAgo.addDefaultLocale(vi);
export default function StudyInsights() {
  const [expanded, setExpanded] = useState(false);
  const completed = useSelector(state => state.study.completedDays);
  const { savedAt, error } = useSelector(state => state.meta);
  const phases = [[1,14],[15,28],[29,56],[57,84],[85,120]];
  return <div className="glass-card mt-[24px]">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Button variant="secondary" aria-expanded={expanded} aria-controls="study-chart" onClick={() => setExpanded(!expanded)}>
        {expanded ? 'Ẩn biểu đồ tiến độ' : 'Xem biểu đồ tiến độ'}
      </Button>
      <span className="text-xs text-muted" role="status">
        {error || (savedAt ? <>Đã lưu <ReactTimeAgo date={savedAt} locale="vi" /> · {dayjs(savedAt).format('HH:mm DD/MM/YYYY')}</> : 'Dữ liệu được lưu trên trình duyệt này')}
      </span>
    </div>
    {expanded && <div id="study-chart" className="relative mt-4 h-64">
      <Bar aria-label="Số ngày hoàn thành theo giai đoạn CEFR" role="img" data={{
        labels: ['A1','A2','B1','B2','C1'],
        datasets: [{ label: 'Ngày đã hoàn thành', data: phases.map(([start,end]) => completed.filter(d => d >= start && d <= end).length), backgroundColor: ['#10b981','#34d399','#06b6d4','#8b5cf6','#f59e0b'], borderRadius: 6 }],
      }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#94a3b8' } } }, scales: { x: { ticks: { color: '#94a3b8' }, grid: { display: false } }, y: { beginAtZero: true, ticks: { precision: 0, color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.08)' } } } }} />
    </div>}
  </div>;
}
