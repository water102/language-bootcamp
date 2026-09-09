/**
 * Domain Models & Factories for CEFR Learning Planner
 * Spec reference: docs/cefr-learning-planner-spec/03_DOMAIN_AND_STORAGE.md
 */

import { CEFR_LEVELS, STORAGE_SCHEMA_VERSION, FEASIBILITY_STATUS, SCENARIO_TYPES, MVD_MODE } from './constants.js';

export function createId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Creates a User Profile
 */
export function createUserProfile({
  profileId = createId('prof'),
  nickname = 'Learner',
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  locale = 'vi-VN',
  currentLevel = 'A2',
  progressWithinLevel = 0.0,
  targetLevel = 'C1',
  avatarConfig = null,
  chibiConfig = { companionId: 'chibi_default', personality: 'supportive', outfit: 'default' },
  createdAt = new Date().toISOString(),
  updatedAt = new Date().toISOString()
} = {}) {
  return {
    profileId,
    nickname,
    timezone,
    locale,
    currentLevel,
    progressWithinLevel: Math.max(0, Math.min(1, Number(progressWithinLevel) || 0)),
    targetLevel,
    avatarConfig,
    chibiConfig,
    createdAt,
    updatedAt
  };
}

/**
 * Creates a Learning Goal
 */
export function createLearningGoal({
  goalId = createId('goal'),
  profileId,
  currentLevel = 'A2',
  progressWithinLevel = 0.0,
  targetLevel = 'C1',
  targetDate = new Date(Date.now() + 120 * 24 * 3600 * 1000).toISOString().split('T')[0],
  startDate = new Date().toISOString().split('T')[0],
  availability = { mode: 'daily-total', hoursPerDay: 2, daysPerWeek: 6 },
  weakSkills = ['speaking', 'writing'],
  scenario = SCENARIO_TYPES.BALANCED,
  status = 'ACTIVE',
  createdAt = new Date().toISOString()
} = {}) {
  return {
    goalId,
    profileId,
    currentLevel,
    progressWithinLevel: Math.max(0, Math.min(1, Number(progressWithinLevel) || 0)),
    targetLevel,
    targetDate,
    startDate,
    availability,
    weakSkills,
    scenario,
    status,
    createdAt
  };
}

/**
 * Creates a Schedule Slot
 */
export function createScheduleSlot({
  slotId = createId('slot'),
  planId,
  date,
  startTime = '08:00',
  endTime = '09:00',
  durationMinutes = 60,
  slotClass = 'NORMAL',
  assignedSkill = 'grammar',
  sourceDay = null, // nominal day in curriculum (e.g. Bootcamp day 1..120)
  mvdTier = MVD_MODE.NORMAL,
  locked = false,
  status = 'PLANNED', // PLANNED, COMPLETED, SKIPPED, RESCHEDULED
  notes = ''
} = {}) {
  return {
    slotId,
    planId,
    date,
    startTime,
    endTime,
    durationMinutes: Number(durationMinutes) || 60,
    slotClass,
    assignedSkill,
    sourceDay,
    mvdTier,
    locked,
    status,
    notes
  };
}

/**
 * Creates a Study Log
 */
export function createStudyLog({
  logId = createId('log'),
  slotId,
  planId,
  sourceDay = null,
  skill = 'grammar',
  plannedMinutes = 60,
  actualMinutes = 60,
  completionRatio = 1.0,
  difficulty = 3, // 1..5
  focusScore = 4,   // 1..5
  activeChunksCount = 0,
  errorsLoggedCount = 0,
  notes = '',
  timestamp = new Date().toISOString()
} = {}) {
  return {
    logId,
    slotId,
    planId,
    sourceDay,
    skill,
    plannedMinutes: Number(plannedMinutes) || 0,
    actualMinutes: Number(actualMinutes) || 0,
    completionRatio: Math.max(0, Math.min(1, Number(completionRatio) || 1.0)),
    difficulty,
    focusScore,
    activeChunksCount,
    errorsLoggedCount,
    notes,
    timestamp
  };
}

/**
 * Creates an Assessment Record
 */
export function createAssessmentRecord({
  assessmentId = createId('assess'),
  planId,
  type = 'CHECKPOINT', // DAY_0, WEEKLY_TEST, PHASE_GATE, BENCHMARK_120
  sourceDay = null,
  date = new Date().toISOString().split('T')[0],
  scores = {}, // { speaking: 3.5, writing: 4.0, reading: 85, listening: 80 }
  feedback = '',
  evidenceRef = null, // e.g. audio ID or draft ID
  verifiedConfidence = 0.8
} = {}) {
  return {
    assessmentId,
    planId,
    type,
    sourceDay,
    date,
    scores,
    feedback,
    evidenceRef,
    verifiedConfidence
  };
}

/**
 * Creates a Gamification Profile
 */
export function createGamificationProfile({
  profileId,
  totalXp = 0,
  userLevel = 1,
  coins = 50,
  bondLevel = 1,
  bondPoints = 0,
  streakCount = 0,
  freezeStreakCount = 2,
  lastStudyDate = null,
  unlockedAchievements = [],
  activeQuests = []
} = {}) {
  return {
    profileId,
    totalXp: Number(totalXp) || 0,
    userLevel: Number(userLevel) || 1,
    coins: Number(coins) || 0,
    bondLevel: Number(bondLevel) || 1,
    bondPoints: Number(bondPoints) || 0,
    streakCount: Number(streakCount) || 0,
    freezeStreakCount: Number(freezeStreakCount) || 2,
    lastStudyDate,
    unlockedAchievements,
    activeQuests
  };
}
