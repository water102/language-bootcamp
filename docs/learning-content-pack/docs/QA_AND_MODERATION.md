# QA, SAFETY & CONTENT MODERATION

## 1. Corpus safety

Open corpora can contain profanity, violence, sexual content, discriminatory language, outdated language and learner-unfriendly sentences.

Before publishing auto-selected content:
- profanity/explicit filter;
- sensitive-topic classification;
- sentence quality heuristics;
- duplicate/spam filter;
- language detection;
- optional manual blocklist.

## 2. Tatoeba quality

Do not assume every community sentence/translation is pedagogically ideal.
Quality score can use:
- trusted/owned flag if available;
- number/quality of links;
- naturalness checks;
- sentence length;
- language consistency;
- user reports.

## 3. Broken/changed license

If source license/Terms changes:
- mark source `MANUAL_REVIEW`;
- stop new ingestion;
- preserve existing provenance snapshot;
- if required, disable native delivery and fall back to external link/remove asset.

## 4. User reporting

Every lesson/content item should expose:
- report wrong answer;
- report bad translation;
- report inappropriate content;
- report broken link/audio;
- report license/source issue.

Reports stay local in zero-server mode but should be exportable as diagnostic bundle.

## 5. AI-generated content

AI text must be marked derived/generated in metadata.
For factual/comprehension questions, save source evidence span/id.
AI must never invent source license or claim permission.
