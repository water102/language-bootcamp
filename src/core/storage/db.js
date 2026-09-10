import Dexie from 'dexie';

/**
 * English C1 Bootcamp Client-Side Dexie Database
 * Spec reference: docs/cefr-learning-planner-spec/03_DOMAIN_AND_STORAGE.md
 * Stores media recordings (audio blobs), writing history, and custom AI lessons with zero cloud dependency
 */
export class BootcampDatabase extends Dexie {
  constructor() {
    super('EnglishC1BootcampDB');
    this.version(1).stores({
      recordings: '++id, day, takeType, createdAt',
      writingDrafts: '++id, day, draftType, version, createdAt',
      customLessons: 'day, updatedAt'
    });
    this.version(2).stores({
      recordings: '++id, day, takeType, createdAt',
      writingDrafts: '++id, day, draftType, version, createdAt',
      customLessons: 'day, updatedAt'
    });
    this.version(3).stores({
      recordings: '++id, day, takeType, createdAt',
      writingDrafts: '++id, day, draftType, version, createdAt',
      customLessons: 'id, day, createdAt'
    });
    this.version(4).stores({
      recordings: '++id, day, takeType, createdAt',
      writingDrafts: '++id, day, draftType, version, createdAt',
      customLessons: 'id, day, createdAt',
      writingAiResults: 'id, topicId, day, createdAt'
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
    console.warn('[Dexie] Failed to save draft version:', err);
    return null;
  }
}

export async function getWritingDraftHistory(day, draftType) {
  try {
    return await db.writingDrafts
      .where({ day: Number(day), draftType })
      .reverse()
      .sortBy('createdAt');
  } catch (err) {
    console.warn('[Dexie] Failed to load draft history:', err);
    return [];
  }
}

/**
 * Custom AI Lessons Multi-Version Operations
 */
function saveLessonToLocalCache(lesson) {
  try {
    const day = Number(lesson.day);
    const rawList = localStorage.getItem(`c1_custom_lesson_versions_${day}`);
    let list = [];
    if (rawList) {
      try { list = JSON.parse(rawList) || []; } catch (e) {}
    }
    list = list.filter(l => l.id !== lesson.id);
    list.unshift(lesson);
    localStorage.setItem(`c1_custom_lesson_versions_${day}`, JSON.stringify(list));
    localStorage.setItem(`c1_custom_lesson_${day}`, JSON.stringify(lesson));
  } catch (e) {
    console.warn('LocalStorage quota warning:', e);
  }
}

export function getActiveLessonVersionId(day) {
  try {
    return localStorage.getItem(`c1_active_lesson_ver_${day}`) || 'default';
  } catch (e) {
    return 'default';
  }
}

export function setActiveLessonVersionId(day, versionId) {
  try {
    localStorage.setItem(`c1_active_lesson_ver_${day}`, versionId || 'default');
  } catch (e) {}
}

export async function saveCustomLessonLocal(lesson) {
  try {
    const day = Number(lesson.day);
    if (!lesson.id) {
      lesson.id = `lesson_d${day}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    }
    if (!lesson.createdAt) {
      lesson.createdAt = new Date().toISOString();
    }
    lesson.updatedAt = new Date().toISOString();

    // Try saving to Dexie
    try {
      await db.customLessons.put({
        id: lesson.id,
        day,
        lesson,
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt
      });
    } catch (dbErr) {
      console.warn('[Dexie] Put failed, falling back to cache:', dbErr);
    }

    // Save to local version cache
    saveLessonToLocalCache(lesson);
    setActiveLessonVersionId(day, lesson.id);

    return lesson;
  } catch (err) {
    console.warn('[Dexie] Failed to save custom lesson version:', err);
    saveLessonToLocalCache(lesson);
    setActiveLessonVersionId(lesson.day, lesson.id);
    return lesson;
  }
}

/**
 * Store a shared (cloud) lesson version locally WITHOUT overriding the
 * device's active version choice. Deduplicated by version id.
 * @returns {Promise<{ added: boolean, lesson: Object }>}
 */
export async function saveRemoteCustomLessonVersion(lesson) {
  const day = Number(lesson.day);
  if (!Number.isFinite(day) || !lesson.id) {
    return { added: false, lesson };
  }

  try {
    const existing = await getCustomLessonVersions(day);
    if (existing.some(v => v.id === lesson.id)) {
      return { added: false, lesson };
    }
  } catch (e) {}

  if (!lesson.createdAt) lesson.createdAt = new Date().toISOString();
  if (!lesson.updatedAt) lesson.updatedAt = lesson.createdAt;
  lesson.sharedFromCloud = true;

  try {
    await db.customLessons.put({
      id: lesson.id,
      day,
      lesson,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt
    });
  } catch (dbErr) {
    console.warn('[Dexie] Remote lesson put failed, keeping localStorage copy:', dbErr);
  }

  try {
    const rawList = localStorage.getItem(`c1_custom_lesson_versions_${day}`);
    let list = [];
    if (rawList) {
      try { list = JSON.parse(rawList) || []; } catch (e) { list = []; }
    }
    if (!list.some(l => l.id === lesson.id)) {
      list.unshift(lesson);
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      if (list.length > 10) list = list.slice(0, 10);
      localStorage.setItem(`c1_custom_lesson_versions_${day}`, JSON.stringify(list));
    }
  } catch (e) {
    console.warn('LocalStorage quota warning (remote lesson):', e);
  }

  return { added: true, lesson };
}

/**
 * Make a shared cloud lesson the active version for its day on this device.
 * Only used for days that have no locally imported lesson yet.
 */
export function activateRemoteCustomLesson(lesson) {
  try {
    const day = Number(lesson.day);
    if (!Number.isFinite(day) || !lesson.id) return false;
    localStorage.setItem(`c1_custom_lesson_${day}`, JSON.stringify(lesson));
    setActiveLessonVersionId(day, lesson.id);
    return true;
  } catch (e) {
    return false;
  }
}

export async function getCustomLessonVersions(day) {
  const targetDay = Number(day);
  let versions = [];

  // 1. Read from localStorage cache first (guaranteed multi-version retention)
  try {
    const raw = localStorage.getItem(`c1_custom_lesson_versions_${targetDay}`);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) {
        versions = list;
      }
    }
  } catch (e) {}

  // 2. Query IndexedDB and merge any versions not yet in localStorage
  try {
    const records = await db.customLessons.where('day').equals(targetDay).toArray();
    if (records && records.length > 0) {
      records.forEach(r => {
        const item = r.lesson || r;
        if (item && item.id && !versions.some(v => v.id === item.id)) {
          versions.push(item);
        }
      });
    }
  } catch (err) {
    // ignore
  }

  // 3. Fallback to single legacy key if still empty
  if (versions.length === 0) {
    try {
      const single = localStorage.getItem(`c1_custom_lesson_${targetDay}`);
      if (single) {
        const parsed = JSON.parse(single);
        if (parsed) versions = [parsed];
      }
    } catch (e) {}
  }

  versions.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  return versions;
}

export async function getCustomLessonLocal(day) {
  const versions = await getCustomLessonVersions(day);
  if (versions.length === 0) return null;

  const activeId = getActiveLessonVersionId(day);
  if (activeId === 'default') return null;

  const match = versions.find(v => v.id === activeId);
  return match || versions[0];
}

export async function getAllCustomLessonsLocal() {
  const map = {};
  for (let d = 1; d <= 120; d++) {
    const versions = await getCustomLessonVersions(d);
    if (versions.length > 0) {
      const activeId = getActiveLessonVersionId(d);
      if (activeId !== 'default') {
        map[d] = versions.find(v => v.id === activeId) || versions[0];
      }
    }
  }
  return map;
}

export async function deleteCustomLessonVersion(versionId, day) {
  try {
    const targetDay = Number(day);
    try {
      await db.customLessons.delete(versionId);
    } catch (e) {}

    const rawList = localStorage.getItem(`c1_custom_lesson_versions_${targetDay}`);
    if (rawList) {
      try {
        let list = JSON.parse(rawList) || [];
        list = list.filter(l => l.id !== versionId);
        localStorage.setItem(`c1_custom_lesson_versions_${targetDay}`, JSON.stringify(list));
      } catch (e) {}
    }

    const currentActive = getActiveLessonVersionId(targetDay);
    if (currentActive === versionId) {
      const remaining = await getCustomLessonVersions(targetDay);
      if (remaining.length > 0) {
        setActiveLessonVersionId(targetDay, remaining[0].id);
        localStorage.setItem(`c1_custom_lesson_${targetDay}`, JSON.stringify(remaining[0]));
      } else {
        setActiveLessonVersionId(targetDay, 'default');
        localStorage.removeItem(`c1_custom_lesson_${targetDay}`);
      }
    }
    return true;
  } catch (err) {
    console.warn('[Dexie] Failed to delete custom lesson version:', err);
    return false;
  }
}

export async function deleteCustomLessonLocal(day) {
  try {
    const targetDay = Number(day);
    const versions = await getCustomLessonVersions(targetDay);
    for (const v of versions) {
      if (v.id) {
        try { await db.customLessons.delete(v.id); } catch (e) {}
      }
    }
    localStorage.removeItem(`c1_custom_lesson_versions_${targetDay}`);
    localStorage.removeItem(`c1_custom_lesson_${targetDay}`);
    setActiveLessonVersionId(targetDay, 'default');
    return true;
  } catch (err) {
    console.warn('[Dexie] Failed to delete all custom lessons for day:', err);
    return false;
  }
}

/**
 * Writing AI Results Multi-Version Operations
 */
export async function saveWritingAiResultLocal(result) {
  try {
    const item = {
      ...result,
      id: result.id || `w_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: result.createdAt || new Date().toISOString()
    };

    // Save to Dexie
    try {
      await db.writingAiResults.put(item);
    } catch (dbErr) {
      console.warn('[Dexie] writingAiResults put failed, keeping localStorage fallback:', dbErr);
    }

    // Save to LocalStorage cache
    if (item.topicId) {
      const topicKey = `c1_writing_ai_results_${item.topicId}`;
      try {
        const existing = JSON.parse(localStorage.getItem(topicKey) || '[]');
        const filtered = existing.filter(r => r.id !== item.id);
        filtered.unshift(item);
        localStorage.setItem(topicKey, JSON.stringify(filtered));
      } catch (e) {
        console.warn('[LocalStorage] Failed to cache writing ai result:', e);
      }
    }

    return item;
  } catch (err) {
    console.warn('[Storage] Failed to save writing ai result:', err);
    return result;
  }
}

export async function getWritingAiResultsLocal(topicId) {
  if (!topicId) return [];
  try {
    // Try Dexie first
    let list = [];
    try {
      list = await db.writingAiResults.where('topicId').equals(topicId).reverse().sortBy('createdAt');
    } catch (e) {}

    if (list && list.length > 0) {
      return list;
    }

    // Fallback to localStorage
    const cached = localStorage.getItem(`c1_writing_ai_results_${topicId}`);
    if (cached) {
      return JSON.parse(cached);
    }

    return [];
  } catch (err) {
    console.warn('[Storage] Failed to get writing ai results:', err);
    return [];
  }
}

export async function deleteWritingAiResultLocal(id, topicId) {
  try {
    try {
      await db.writingAiResults.delete(id);
    } catch (e) {}

    if (topicId) {
      const topicKey = `c1_writing_ai_results_${topicId}`;
      const cached = JSON.parse(localStorage.getItem(topicKey) || '[]');
      const filtered = cached.filter(r => r.id !== id);
      localStorage.setItem(topicKey, JSON.stringify(filtered));
    }
    return true;
  } catch (err) {
    console.warn('[Storage] Failed to delete writing ai result:', err);
    return false;
  }
}

