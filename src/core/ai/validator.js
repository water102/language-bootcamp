/**
 * AI Response Validator
 * Spec reference: docs/cefr-learning-planner-spec/05_AI_BRIDGE_CONTRACT.md (sections 6, 7, 10)
 */

import { AI_CONTRACT_VERSION, AI_ERROR_CODES } from './aiContractConstants.js';

export class AiResponseValidator {
  /**
   * Validates an AI JSON response payload against fixed slots and canonical hash
   * @param {any} rawPayload Parsed JSON object or string
   * @param {Object} context
   * @param {string} context.expectedInputHash
   * @param {string} context.expectedPlanId
   * @param {Set<string>|Array<string>} context.validSlotIds
   * @param {Record<string, number>} context.maxDurationsBySlot Map of slotId -> durationMinutes
   * @returns {Object}
   */
  static validate(rawPayload, {
    expectedInputHash,
    expectedPlanId,
    validSlotIds = new Set(),
    maxDurationsBySlot = {}
  }) {
    let payload = rawPayload;
    if (typeof rawPayload === 'string') {
      try {
        // Strip markdown code fences if user pasted ```json ... ```
        const clean = rawPayload.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
        payload = JSON.parse(clean);
      } catch (err) {
        return {
          valid: false,
          errorCode: AI_ERROR_CODES.INVALID_JSON,
          errors: ['Dữ liệu không phải là định dạng JSON hợp lệ: ' + err.message],
          validSessions: [],
          invalidSessions: []
        };
      }
    }

    const errors = [];
    const slotSet = validSlotIds instanceof Set ? validSlotIds : new Set(validSlotIds);

    // 1. Check Schema Version
    if (!payload.schemaVersion || payload.schemaVersion !== AI_CONTRACT_VERSION) {
      errors.push(`Phiên bản hợp đồng AI (${payload.schemaVersion || 'không rõ'}) không tương thích với phiên bản ứng dụng (${AI_CONTRACT_VERSION}).`);
    }

    // 2. Check Canonical Input Hash
    let hashMismatch = false;
    if (expectedInputHash && payload.inputHash !== expectedInputHash) {
      hashMismatch = true;
      errors.push(`Cảnh báo HASH_MISMATCH: inputHash của AI ("${payload.inputHash || 'trống'}") không khớp với inputHash của kế hoạch hiện tại ("${expectedInputHash}"). Phản hồi có thể đã cũ hoặc không đồng bộ.`);
    }

    // 3. Validate Sessions
    if (!Array.isArray(payload.sessions) || payload.sessions.length === 0) {
      errors.push('Phản hồi thiếu danh sách "sessions" hợp lệ.');
      return {
        valid: false,
        errorCode: AI_ERROR_CODES.MISSING_REQUIRED_FIELDS,
        errors,
        hashMismatch,
        validSessions: [],
        invalidSessions: []
      };
    }

    const validSessions = [];
    const invalidSessions = [];
    const seenSlotIds = new Set();

    payload.sessions.forEach((session, idx) => {
      const sessionErrors = [];
      const { slotId, title, objectives, activities } = session || {};

      if (!slotId) {
        sessionErrors.push(`Session #${idx + 1} thiếu slotId.`);
      } else if (!slotSet.has(slotId)) {
        sessionErrors.push(`slotId "${slotId}" không tồn tại trong danh sách fixed slots được tạo bởi local planner.`);
      } else if (seenSlotIds.has(slotId)) {
        sessionErrors.push(`slotId "${slotId}" bị trùng lặp nhiều lần trong phản hồi AI.`);
      }

      if (!title) sessionErrors.push(`Session "${slotId || idx}" thiếu title.`);
      if (!Array.isArray(objectives)) sessionErrors.push(`Session "${slotId || idx}" thiếu objectives array.`);
      if (!Array.isArray(activities) || activities.length === 0) {
        sessionErrors.push(`Session "${slotId || idx}" thiếu activities list.`);
      } else if (slotId && maxDurationsBySlot[slotId]) {
        const totalActivityMinutes = activities.reduce((sum, a) => sum + (Number(a.durationMinutes) || 0), 0);
        const maxAllowed = maxDurationsBySlot[slotId];
        if (totalActivityMinutes > maxAllowed) {
          sessionErrors.push(`Thời lượng hoạt động (${totalActivityMinutes}m) vượt quá thời lượng slot cho phép (${maxAllowed}m).`);
        }
      }

      if (sessionErrors.length === 0) {
        seenSlotIds.add(slotId);
        validSessions.push(session);
      } else {
        invalidSessions.push({ session, errors: sessionErrors });
        errors.push(...sessionErrors);
      }
    });

    return {
      valid: errors.length === 0 && !hashMismatch,
      hashMismatch,
      errors,
      validSessions,
      invalidSessions,
      totalCount: payload.sessions.length,
      validCount: validSessions.length,
      invalidCount: invalidSessions.length
    };
  }
}
