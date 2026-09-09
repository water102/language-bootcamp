import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { highlightSchedulePanel, switchCurrentDay, speakText, showToast, appState } from '@/runtime/controller';
export default memo(function AiTutorPage() { return (<section className="page-view" id="view-ai-tutor">
<div className="view-header">
<h2>{"Trạm Prompt Gia Sư AI (ChatGPT / Claude Command Center)"}</h2>
<p>{"Bộ 8 Prompt được tinh chỉnh đặc biệt để biến AI thành huấn luyện viên CEFR khắt khe, giáo viên ngữ âm, hoặc giám khảo chấm thi Cambridge."}</p>
</div>
<div className="prompts-grid" id="ai-prompts-container"></div>
</section>); });
