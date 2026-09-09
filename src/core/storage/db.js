import Dexie from 'dexie';

/**
 * English C1 Bootcamp Client-Side Dexie Database
 * Spec reference: docs/cefr-learning-planner-spec/03_DOMAIN_AND_STORAGE.md
 * Stores media recordings (audio blobs) and writing history with zero cloud dependency
 */
export class BootcampDatabase extends Dexie {
  constructor() {
    super('EnglishC1BootcampDB');
    this.version(1).stores({
      recordings: '++id, day, takeType, createdAt',
      writingDrafts: '++id, day, draftType, version, createdAt'
    });
  }
}

export const db = new BootcampDatabase();

/**
 * Audio Recording Operations
 */
export async function saveRecording({ day, takeType, audioBlob, durationSeconds = 0 }) {
  try {
    const id = await db.recordings.add({
      day: Number(day),
      takeType, // 'take1' | 'take2'
      audioBlob,
      durationSeconds,
      createdAt: new Date().toISOString()
    });
    return id;
  } catch (err) {
    console.warn('[Dexie] Failed to save recording:', err);
    return null;
  }
}

export async function getRecordingsByDay(day) {
  try {
    return await db.recordings.where('day').equals(Number(day)).reverse().sortBy('createdAt');
  } catch (err) {
    console.warn('[Dexie] Failed to load recordings:', err);
    return [];
  }
}

/**
 * Writing Drafts Version History Operations
 */
export async function saveWritingDraftVersion({ day, draftType, content, wordCount = 0 }) {
  try {
    const existing = await db.writingDrafts.where({ day: Number(day), draftType }).count();
    const version = existing + 1;
    const id = await db.writingDrafts.add({
      day: Number(day),
      draftType, // 'draft1' | 'draft2'
      content,
      wordCount,
      version,
      createdAt: new Date().toISOString()
    });
    return { id, version };
  } catch (err) {
    console.warn('[Dexie] Failed to save writing draft:', err);
    return null;
  }
}

export async function getWritingDraftHistory(day, draftType) {
  try {
    let query = db.writingDrafts.where('day').equals(Number(day));
    if (draftType) {
      return await db.writingDrafts.where({ day: Number(day), draftType }).reverse().sortBy('createdAt');
    }
    return await query.reverse().sortBy('createdAt');
  } catch (err) {
    console.warn('[Dexie] Failed to load writing drafts:', err);
    return [];
  }
}
