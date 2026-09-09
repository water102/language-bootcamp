/**
 * AI Structured Prompt Builder
 * Spec reference:
 * - docs/cefr-learning-planner-spec/05_AI_BRIDGE_CONTRACT.md (sections 8, 9)
 * - docs/cefr-learning-planner-spec/18_BOOTCAMP_CURRICULUM_INTEGRATION.md (section 8)
 */

import { AI_CONTRACT_VERSION } from './aiContractConstants.js';

export class PromptBuilder {
  /**
   * Generates a Weekly Fixed-Slots Prompt for ChatGPT, Claude, or Gemini
   * @param {Object} params
   * @param {number} params.weekNumber
   * @param {string} params.planId
   * @param {string} params.inputHash
   * @param {string} params.currentLevel
   * @param {string} params.targetLevel
   * @param {Array<string>} [params.weakSkills]
   * @param {Array<Object>} params.slots Fixed slots for the week
   * @param {Array<Object>} [params.curriculumDays] Bootcamp reference topics
   * @returns {string}
   */
  static buildWeeklyDetailPrompt({
    weekNumber = 1,
    planId,
    inputHash,
    currentLevel = 'A2',
    targetLevel = 'C1',
    weakSkills = ['speaking', 'writing'],
    slots = [],
    curriculumDays = []
  }) {
    const slotsDigest = slots.map(s => ({
      slotId: s.slotId,
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
      durationMinutes: s.durationMinutes,
      assignedSkill: s.assignedSkill,
      sourceDay: s.sourceDay,
      notes: s.notes
    }));

    const topicsDigest = curriculumDays.map(d => ({
      sourceDay: d.sourceDay,
      grammarTopic: d.grammarTopic,
      vocabularyTopic: d.vocabularyTopic,
      speakingPrompt: d.speakingPrompt,
      writingPrompt: d.writingPrompt
    }));

    return `Bạn là Trợ Lý Cố Vấn Giáo Trình Học Tiếng Anh C1 theo chuẩn CEFR của ứng dụng CEFR Learning Planner.

### BỐI CẢNH & THÔNG TIN NGƯỜI HỌC
- Trình độ hiện tại: ${currentLevel} -> Mục tiêu hướng đến: ${targetLevel}
- Tuần học số: ${weekNumber}
- Kỹ năng cần tập trung khắc phục điểm yếu: ${weakSkills.join(', ')}
- Plan ID: ${planId}
- Canonical Input Hash: ${inputHash}
- Contract Version: ${AI_CONTRACT_VERSION}

### CÁC KHỐI THỜI GIAN CỐ ĐỊNH (FIXED SLOTS) DO LOCAL ENGINE TÍNH TOÁN
${JSON.stringify(slotsDigest, null, 2)}

### TÀI LIỆU THAM KHẢO TỪ GIÁO TRÌNH C1 BOOTCAMP
${JSON.stringify(topicsDigest, null, 2)}

### QUY TẮC BẤT BIẾN BẮT BUỘC (INVARIANTS):
1. Bạn KHÔNG ĐƯỢC thay đổi slotId, date, startTime, endTime hoặc durationMinutes của bất kỳ slot nào.
2. Tổng số phút của các activities trong mỗi slot KHÔNG ĐƯỢC vượt quá durationMinutes của slot đó.
3. KHÔNG ĐƯỢC tự ý gán điểm đánh giá, kết quả kiểm tra hoặc cộng điểm thưởng/XP.
4. Bạn phải giữ nguyên trường "inputHash" chính xác là "${inputHash}".

### YÊU CẦU ĐẦU RA (OUTPUT JSON SCHEMA):
Hãy trả về DUY NHẤT một khối JSON hợp lệ theo đúng cấu trúc sau (không kèm lời chào hay văn bản thừa bên ngoài):

\`\`\`json
{
  "schemaVersion": "${AI_CONTRACT_VERSION}",
  "planId": "${planId}",
  "inputHash": "${inputHash}",
  "weekNumber": ${weekNumber},
  "sessions": [
    {
      "slotId": "ID_TRÙNG_KHỚP_CHÍNH_XÁC_VỚI_SLOT_ĐÃ_CUNG_CẤP",
      "title": "Tên chủ đề phiên học",
      "objectives": ["Mục tiêu học tập 1", "Mục tiêu học tập 2"],
      "activities": [
        {
          "name": "Tên hoạt động",
          "durationMinutes": 30,
          "instructions": "Hướng dẫn chi tiết từng bước"
        }
      ],
      "expectedOutput": "Sản phẩm đầu ra cần đạt được",
      "keyVocabulary": ["collocation 1", "chunk 2"]
    }
  ]
}
\`\`\``;
  }

  /**
   * Generates a Repair Prompt for partially failed or rejected AI JSON
   * @param {Object} params
   * @param {string} params.planId
   * @param {string} params.inputHash
   * @param {Array<string>} params.errors
   * @param {Array<Object>} params.failedSessions
   * @returns {string}
   */
  static buildRepairPrompt({ planId, inputHash, errors = [], failedSessions = [] }) {
    return `Phản hồi JSON của bạn có một số lỗi validation sau:
${errors.map(e => `- ${e}`).join('\n')}

Dưới đây là các session cần bạn sửa lại (chú ý giữ đúng slotId và không để tổng phút vượt quá durationMinutes):
${JSON.stringify(failedSessions, null, 2)}

Hãy trả về DUY NHẤT một khối JSON đã sửa lại đúng schema với inputHash "${inputHash}".`;
  }
}
