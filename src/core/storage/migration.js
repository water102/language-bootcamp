/**
 * Storage Migration Runner
 * Spec reference:
 * - docs/cefr-learning-planner-spec/03_DOMAIN_AND_STORAGE.md (section 4)
 * - docs/cefr-learning-planner-spec/18_BOOTCAMP_CURRICULUM_INTEGRATION.md (section 10)
 */

import { LEGACY_STORAGE_KEY, CURRENT_STORAGE_KEY, STORAGE_SCHEMA_VERSION } from '../domain/constants.js';
import { createUserProfile, createLearningGoal, createStudyLog, createGamificationProfile } from '../domain/types.js';
import { localStore } from './localStorageAdapter.js';
import { indexedDb, STORES } from './indexedDbAdapter.js';

export class MigrationRunner {
  /**
   * Check if migration is needed and run it safely
   */
  static async runMigrations() {
    const currentState = localStore.read();
    const currentVersion = currentState?.schemaVersion || 0;

    if (currentVersion >= STORAGE_SCHEMA_VERSION) {
      return { migrated: false, currentVersion };
    }

    console.log(`[Migration] Starting migration from schema version ${currentVersion} to ${STORAGE_SCHEMA_VERSION}...`);

    try {
      // 1. Read legacy data safely
      const rawLegacy = typeof window !== 'undefined' && window.localStorage
        ? window.localStorage.getItem(LEGACY_STORAGE_KEY)
        : null;

      let legacyData = null;
      if (rawLegacy) {
        try {
          legacyData = JSON.parse(rawLegacy);
        } catch (err) {
          console.warn('[Migration] Legacy data JSON parse failed, preserving raw string:', err);
        }
      }

      // 2. Build new profile & goals from legacy or defaults
      const currentDay = legacyData?.currentDay || 1;
      const completedDays = Array.isArray(legacyData?.completedDays) ? legacyData.completedDays : [];
      
      const profile = createUserProfile({
        nickname: legacyData?.userName || 'C1 Learner',
        currentLevel: currentDay > 56 ? 'B2' : currentDay > 28 ? 'B1' : 'A2',
        targetLevel: 'C1'
      });

      const goal = createLearningGoal({
        profileId: profile.profileId,
        currentLevel: profile.currentLevel,
        targetLevel: 'C1'
      });

      const gamification = createGamificationProfile({
        profileId: profile.profileId,
        totalXp: (completedDays.length * 50) + ((legacyData?.pomodoroTotalCount || 0) * 20),
        userLevel: Math.max(1, Math.floor(completedDays.length / 5) + 1),
        streakCount: completedDays.length > 0 ? 1 : 0
      });

      // 3. Write basic state into localStorage
      localStore.write({
        activeProfileId: profile.profileId,
        activeGoalId: goal.goalId,
        profile,
        goal,
        gamification,
        legacyImportedAt: new Date().toISOString()
      });

      // 4. If IndexedDB is supported, migrate flashcards, logs, drafts
      if (typeof window !== 'undefined' && window.indexedDB && legacyData) {
        try {
          // Migrate completed days to study logs
          for (const dayNum of completedDays) {
            const log = createStudyLog({
              planId: goal.goalId,
              sourceDay: dayNum,
              skill: 'review',
              plannedMinutes: 60,
              actualMinutes: 60,
              notes: `Completed Day ${dayNum} from legacy session`
            });
            await indexedDb.put(STORES.STUDY_LOGS, log);
          }

          // Migrate flashcards if present
          if (Array.isArray(legacyData.flashcards)) {
            for (let i = 0; i < legacyData.flashcards.length; i++) {
              const card = legacyData.flashcards[i];
              await indexedDb.put(STORES.VOCABULARY, {
                itemId: `vocab_leg_${i}`,
                term: card.front || card.word || `Card ${i + 1}`,
                meaning: card.back || card.meaning || '',
                box: card.box || 1,
                nextReviewAt: card.nextReview || new Date().toISOString()
              });
            }
          }

          // Migrate error notebook if present
          if (Array.isArray(legacyData.errorLogs)) {
            for (let i = 0; i < legacyData.errorLogs.length; i++) {
              const item = legacyData.errorLogs[i];
              await indexedDb.put(STORES.ERROR_NOTEBOOK, {
                errorId: `err_leg_${i}`,
                original: item.original || item.text || '',
                correction: item.correction || '',
                explanation: item.explanation || item.reason || '',
                count: item.repeatCount || 1,
                status: 'ACTIVE'
              });
            }
          }
        } catch (idbErr) {
          console.warn('[Migration] IndexedDB migration step partial failure (non-blocking):', idbErr);
        }
      }

      console.log(`[Migration] Successfully completed migration to schema version ${STORAGE_SCHEMA_VERSION}. Legacy data was preserved.`);
      return {
        migrated: true,
        previousVersion: currentVersion,
        newVersion: STORAGE_SCHEMA_VERSION
      };
    } catch (err) {
      console.error('[Migration] Migration failed! Preserving original data untouched.', err);
      return {
        migrated: false,
        error: err.message
      };
    }
  }
}
