/**
 * Core Domain Constants for CEFR Learning Planner
 * Spec reference: docs/cefr-learning-planner-spec/02, 03, 04, 18
 */

export const STORAGE_SCHEMA_VERSION = 1;
export const LEGACY_STORAGE_KEY = 'c1_bootcamp_state_v2';
export const CURRENT_STORAGE_KEY = 'cefr_planner_state_v1';
export const INDEXED_DB_NAME = 'cefr_learning_planner_db';
export const INDEXED_DB_VERSION = 1;

export const CEFR_LEVELS = /** @type {const} */ (['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

/**
 * Cumulative guided-learning hours baseline (Cambridge English research).
 * Referenced in 04_PLANNER_ENGINE.md
 */
export const CEFR_HOURS_BASELINE = {
  A0: { min: 0, midpoint: 0, max: 0 },
  A1: { min: 90, midpoint: 95, max: 100 },
  A2: { min: 180, midpoint: 190, max: 200 },
  B1: { min: 350, midpoint: 375, max: 400 },
  B2: { min: 500, midpoint: 550, max: 600 },
  C1: { min: 700, midpoint: 750, max: 800 },
  C2: { min: 1000, midpoint: 1100, max: 1200 }
};

export const SLOT_CLASS = /** @type {const} */ ({
  DEEP: 'DEEP',       // 45–90 min
  NORMAL: 'NORMAL',   // 25–50 min
  LIGHT: 'LIGHT'      // 5–25 min
});

export const SKILLS = /** @type {const} */ ([
  'grammar',
  'vocabulary',
  'listening',
  'reading',
  'speaking',
  'writing',
  'pronunciation',
  'review',
  'assessment',
  'immersion'
]);

export const FEASIBILITY_STATUS = /** @type {const} */ ({
  COMFORTABLE: 'COMFORTABLE',       // Coverage >= 1.30
  REALISTIC: 'REALISTIC',           // Coverage 1.05 – 1.30
  AGGRESSIVE: 'AGGRESSIVE',         // Coverage 0.90 – 1.05
  VERY_AGGRESSIVE: 'VERY_AGGRESSIVE', // Coverage 0.70 – 0.90
  UNLIKELY: 'UNLIKELY'              // Coverage < 0.70
});

export const SCENARIO_TYPES = /** @type {const} */ ({
  BALANCED: 'BALANCED',
  INTENSIVE: 'INTENSIVE',
  SUSTAINABLE: 'SUSTAINABLE'
});

export const MVD_MODE = /** @type {const} */ ({
  NORMAL: 'NORMAL',
  BUSY: 'BUSY',
  EMERGENCY: 'EMERGENCY'
});

export const DOMAIN_EVENTS = /** @type {const} */ ({
  PLAN_CREATED: 'PLAN_CREATED',
  PLAN_UPDATED: 'PLAN_UPDATED',
  PLAN_IMPORTED: 'PLAN_IMPORTED',
  DAY_STARTED: 'DAY_STARTED',
  SESSION_STARTED: 'SESSION_STARTED',
  SESSION_PAUSED: 'SESSION_PAUSED',
  SESSION_COMPLETED: 'SESSION_COMPLETED',
  SESSION_SKIPPED: 'SESSION_SKIPPED',
  REVIEW_DUE: 'REVIEW_DUE',
  REVIEW_COMPLETED: 'REVIEW_COMPLETED',
  ASSESSMENT_RECORDED: 'ASSESSMENT_RECORDED',
  WEEK_REVIEW_READY: 'WEEK_REVIEW_READY',
  PLAN_RECALCULATED: 'PLAN_RECALCULATED',
  MILESTONE_REACHED: 'MILESTONE_REACHED',
  ACHIEVEMENT_UNLOCKED: 'ACHIEVEMENT_UNLOCKED',
  STREAK_UPDATED: 'STREAK_UPDATED',
  STREAK_FROZEN: 'STREAK_FROZEN',
  ROOM_JOINED: 'ROOM_JOINED',
  CHAT_MESSAGE_RECEIVED: 'CHAT_MESSAGE_RECEIVED',
  PEER_LEFT: 'PEER_LEFT'
});
