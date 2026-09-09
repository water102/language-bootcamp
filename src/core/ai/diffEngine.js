/**
 * AI Content Diff Engine
 * Spec reference: docs/cefr-learning-planner-spec/05_AI_BRIDGE_CONTRACT.md (section 11)
 */

export class DiffEngine {
  /**
   * Compares existing session content with incoming AI sessions
   * @param {Array<Object>} existingSessions
   * @param {Array<Object>} incomingSessions
   * @returns {Object}
   */
  static computeDiff(existingSessions = [], incomingSessions = []) {
    const existingMap = new Map(existingSessions.map(s => [s.slotId, s]));
    const incomingMap = new Map(incomingSessions.map(s => [s.slotId, s]));

    const added = [];
    const updated = [];
    const unchanged = [];

    incomingMap.forEach((newSession, slotId) => {
      const oldSession = existingMap.get(slotId);
      if (!oldSession) {
        added.push({
          slotId,
          newTitle: newSession.title,
          newActivitiesCount: newSession.activities?.length || 0,
          type: 'ADDED'
        });
      } else {
        // Compare title & activities count
        const titleChanged = oldSession.title !== newSession.title;
        const activitiesChanged = JSON.stringify(oldSession.activities) !== JSON.stringify(newSession.activities);

        if (titleChanged || activitiesChanged) {
          updated.push({
            slotId,
            oldTitle: oldSession.title,
            newTitle: newSession.title,
            oldActivitiesCount: oldSession.activities?.length || 0,
            newActivitiesCount: newSession.activities?.length || 0,
            type: 'UPDATED'
          });
        } else {
          unchanged.push({ slotId, title: oldSession.title, type: 'UNCHANGED' });
        }
      }
    });

    return {
      added,
      updated,
      unchanged,
      totalChanges: added.length + updated.length
    };
  }
}
