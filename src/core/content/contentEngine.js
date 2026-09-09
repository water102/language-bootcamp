/**
 * Content Engine
 * Implements content filtering, query ranking, and interactive exercise generation
 * Based on docs/learning-content-pack specifications:
 * - docs/CONTENT_MASTER_SPEC.md
 * - docs/EXERCISE_GENERATION.md
 * - docs/CONTENT_RANKING_AND_CEFR.md
 */

import {
  SOURCES,
  EXTERNAL_RESOURCES,
  TATOEBA_SENTENCES,
  VOA_STORIES,
  EXTENSIVE_READERS,
  CEFR_VOCAB_QUIZ
} from '../../data/learningContentPackData.js';

export const ContentEngine = {
  /**
   * Filter external/embed resources by multi-attribute criteria
   */
  getResources({ level = 'all', skill = 'all', deliveryMode = 'all', sourceId = 'all', search = '' } = {}) {
    return EXTERNAL_RESOURCES.filter(item => {
      const matchLevel = level === 'all' || (item.levels && item.levels.includes(level));
      const matchSkill = skill === 'all' || (item.skills && item.skills.includes(skill));
      const matchDelivery = deliveryMode === 'all' || item.deliveryMode === deliveryMode;
      const matchSource = sourceId === 'all' || item.sourceId === sourceId;
      const matchSearch = !search || (
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase())
      );
      return matchLevel && matchSkill && matchDelivery && matchSource && matchSearch;
    });
  },

  /**
   * Get all registered providers and licenses
   */
  getSources() {
    return SOURCES;
  },

  /**
   * Get Tatoeba bilingual sentences with optional level and topic filtering
   */
  getTatoebaSentences({ level = 'all', topic = 'all' } = {}) {
    return TATOEBA_SENTENCES.filter(item => {
      const matchLevel = level === 'all' || item.level === level;
      const matchTopic = topic === 'all' || item.topic === topic;
      return matchLevel && matchTopic;
    });
  },

  /**
   * Get VOA multimedia stories
   */
  getVoaStories({ level = 'all' } = {}) {
    return VOA_STORIES.filter(item => level === 'all' || item.level === level);
  },

  /**
   * Get Project Gutenberg & LibriVox extensive readers
   */
  getExtensiveReaders({ level = 'all' } = {}) {
    return EXTENSIVE_READERS.filter(item => level === 'all' || item.level === level);
  },

  /**
   * Get CEFR-J & WordNet vocab quiz items
   */
  getVocabQuiz({ level = 'all' } = {}) {
    return CEFR_VOCAB_QUIZ.filter(item => level === 'all' || item.level === level);
  },

  /**
   * Generate an interactive sentence scramble exercise
   */
  generateSentenceScramble(level = 'all') {
    const candidates = this.getTatoebaSentences({ level });
    if (!candidates.length) return null;
    const item = candidates[Math.floor(Math.random() * candidates.length)];
    // Clean tokens for scrambling
    const cleanTokens = item.en.replace(/[.,?!]/g, '').split(/\s+/);
    // Shuffle
    const scrambled = [...cleanTokens].sort(() => Math.random() - 0.5);
    return {
      sentenceId: item.id,
      level: item.level,
      originalSentence: item.en,
      translationVi: item.vi,
      grammarFocus: item.grammar,
      cleanTokens,
      scrambledTokens: scrambled
    };
  },

  /**
   * Check sentence scramble solution
   */
  checkSentenceScramble(expectedTokens, userTokens) {
    if (!Array.isArray(userTokens) || userTokens.length !== expectedTokens.length) {
      return { isCorrect: false, score: 0 };
    }
    const isCorrect = expectedTokens.every((token, idx) => token.toLowerCase() === userTokens[idx].toLowerCase());
    return {
      isCorrect,
      score: isCorrect ? 100 : 0,
      diff: expectedTokens.map((t, idx) => ({
        expected: t,
        given: userTokens[idx] || '',
        match: (userTokens[idx] || '').toLowerCase() === t.toLowerCase()
      }))
    };
  },

  /**
   * Evaluate dictation transcript against ground truth
   */
  evaluateDictation(groundTruth, userInput) {
    const normalize = str => str.trim().toLowerCase().replace(/[.,!?;:"'—–-]/g, '').split(/\s+/);
    const truthTokens = normalize(groundTruth);
    const userTokens = normalize(userInput);

    let matchCount = 0;
    const wordDiff = truthTokens.map((word, i) => {
      const match = userTokens[i] === word;
      if (match) matchCount++;
      return {
        word,
        userWord: userTokens[i] || '',
        correct: match
      };
    });

    const accuracy = truthTokens.length > 0 ? Math.round((matchCount / truthTokens.length) * 100) : 0;
    return {
      accuracy,
      isPerfect: accuracy === 100,
      wordDiff,
      totalWords: truthTokens.length,
      matchedWords: matchCount
    };
  }
};
