/**
 * AI Writing Response Parser
 * Smart parsing for CEFR C1 Outline, Model Essay, and Key Learning Assets
 */
export function parseAiWritingResponse(text) {
  if (!text || typeof text !== 'string') {
    return { outline: '', modelEssay: '', keyAssets: '', raw: '' };
  }

  const raw = text.trim();
  let outline = '';
  let modelEssay = '';
  let keyAssets = '';

  const outlineStartRegex = /(?:###?\s*(?:PART\s*1[:.]?\s*)?(?:DETAILED\s+OUTLINE|DÀN\s+Ý\s+CHI\s+TIẾT|DÀN\s+Ý|OUTLINE))/i;
  const essayStartRegex = /(?:###?\s*(?:PART\s*2[:.]?\s*)?(?:MODEL\s+ESSAY|BÀI\s+MẪU|SAMPLE\s+ESSAY|ESSAY))/i;
  const assetsStartRegex = /(?:###?\s*(?:BONUS[:\s-]*|PART\s*3[:.]?\s*)?(?:KEY\s+LEARNING|TỪ\s+VỰNG|VOCABULARY|CHUNKS|LEARNING\s+ASSETS)|###?\s*BONUS)/i;

  const outlineMatch = raw.search(outlineStartRegex);
  const essayMatch = raw.search(essayStartRegex);
  const assetsMatch = raw.search(assetsStartRegex);

  if (outlineMatch !== -1 && essayMatch !== -1 && essayMatch > outlineMatch) {
    outline = raw.slice(outlineMatch, essayMatch).trim();
    if (assetsMatch !== -1 && assetsMatch > essayMatch) {
      modelEssay = raw.slice(essayMatch, assetsMatch).trim();
      keyAssets = raw.slice(assetsMatch).trim();
    } else {
      modelEssay = raw.slice(essayMatch).trim();
    }
  } else if (essayMatch !== -1) {
    if (outlineMatch !== -1 && outlineMatch < essayMatch) {
      outline = raw.slice(outlineMatch, essayMatch).trim();
    }
    if (assetsMatch !== -1 && assetsMatch > essayMatch) {
      modelEssay = raw.slice(essayMatch, assetsMatch).trim();
      keyAssets = raw.slice(assetsMatch).trim();
    } else {
      modelEssay = raw.slice(essayMatch).trim();
    }
  } else {
    modelEssay = raw;
  }

  return { outline, modelEssay, keyAssets, raw };
}
