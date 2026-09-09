/**
 * Gamification Engine: XP, Coins, Bond, Streaks & Achievements
 * Spec reference: docs/cefr-learning-planner-spec/06_GAMIFICATION.md
 */

import { eventBus, DOMAIN_EVENTS } from '../events/eventBus.js';
import { localStore } from '../storage/localStorageAdapter.js';

export class GamificationEngine {
  static initialize() {
    // Listen to study session completions
    eventBus.subscribe(DOMAIN_EVENTS.SESSION_COMPLETED, (payload) => {
      this.handleSessionCompleted(payload);
    });

    // Listen to plan created
    eventBus.subscribe(DOMAIN_EVENTS.PLAN_CREATED, () => {
      this.addXp(100, 'Tạo kế hoạch học tập CEFR');
    });
  }

  static getProfile() {
    const profile = localStore.get('gamification') || {};
    return {
      totalXp: profile.totalXp || 0,
      userLevel: profile.userLevel || 1,
      coins: profile.coins || 50,
      bondLevel: profile.bondLevel || 1,
      bondPoints: profile.bondPoints || 0,
      streakCount: profile.streakCount || 1,
      freezeStreakCount: profile.freezeStreakCount || 2,
      lastStudyDate: profile.lastStudyDate || null,
      unlockedAchievements: profile.unlockedAchievements || []
    };
  }

  static saveProfile(profile) {
    localStore.set('gamification', profile);
  }

  static handleSessionCompleted(payload) {
    const minutes = Number(payload?.actualMinutes) || 30;
    // XP formula: 10 XP base + 1 XP per 2 minutes studied
    const earnedXp = 10 + Math.round(minutes / 2);
    // Coins: 5 coins per completed deep session
    const earnedCoins = minutes >= 45 ? 5 : 2;
    // Bond points with Chibi: +15 points
    const earnedBond = 15;

    this.addRewards(earnedXp, earnedCoins, earnedBond, `Hoàn thành phiên học ${minutes} phút`);
  }

  static addRewards(xp, coins, bond, reason = '') {
    const profile = this.getProfile();
    profile.totalXp += xp;
    profile.coins += coins;
    profile.bondPoints += bond;

    // Check level up (every 250 XP)
    const newLevel = Math.floor(profile.totalXp / 250) + 1;
    let leveledUp = false;
    if (newLevel > profile.userLevel) {
      profile.userLevel = newLevel;
      profile.coins += 20; // level up bonus
      leveledUp = true;
    }

    // Check bond level up (every 100 bond points)
    const newBondLevel = Math.floor(profile.bondPoints / 100) + 1;
    let bondLevelUp = false;
    if (newBondLevel > profile.bondLevel) {
      profile.bondLevel = newBondLevel;
      bondLevelUp = true;
    }

    this.saveProfile(profile);

    eventBus.publish(DOMAIN_EVENTS.STREAK_UPDATED, {
      xpEarned: xp,
      coinsEarned: coins,
      totalXp: profile.totalXp,
      userLevel: profile.userLevel,
      leveledUp,
      bondLevelUp,
      reason
    });
  }

  static addXp(amount, reason) {
    this.addRewards(amount, 0, 5, reason);
  }
}
