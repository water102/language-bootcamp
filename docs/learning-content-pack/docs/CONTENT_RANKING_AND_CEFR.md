# CONTENT RANKING & CEFR TAGGING

## 1. Ranking

Mỗi candidate nhận score 0-100.

Suggested weighted model:

```text
25 levelMatch
20 skillMatch
10 durationMatch
10 topicMatch
10 qualityScore
 7 userPreference
 6 freshness/novelty
 5 deliveryMode bonus
 4 offlinePreference
 3 sourceTrust
```

Delivery mode bonus mặc định:
- native +5;
- embed +3;
- external +0.

Không để native bonus lấn át mismatch lớn về level/skill.

## 2. Recency penalty

Nếu content đã dùng gần đây:
- < 3 days: -30;
- 3-7 days: -20;
- 8-21 days: -10;
- >21 days: 0.

Nếu query intent=`review`, đảo logic dựa trên spaced repetition due date.

## 3. CEFR confidence

`levelConfidence` 0..1.

Priority evidence:
1. source-provided CEFR annotation;
2. vocabulary/grammar profile evidence;
3. deterministic linguistic features;
4. AI estimate only as supplemental signal.

## 4. Lexical CEFR estimate

Tokenize/lemmatize/POS-tag passage.
Map known lexical tokens to CEFR-J.
Ignore function-word inflation when calculating passage challenge.

Store distribution:

```json
{"A1":0.35,"A2":0.25,"B1":0.22,"B2":0.12,"C1":0.05,"C2":0.01}
```

Suggested level heuristic:
- compute content-word CEFR percentile (e.g. p85/p90);
- penalize high unknown-word rate;
- combine with grammar profile and length/structure features.

Do NOT claim official CEFR classification from lexical coverage alone.

## 5. Sentence eligibility

For A1/A2 native auto-exercises, prefer sentences with:
- manageable length;
- one dominant target structure;
- low unknown-word ratio;
- no ambiguous pronoun/reference dependence;
- no unsafe/explicit content;
- translation pair quality sufficient.

## 6. User personalization

Boost item if it overlaps:
- weak skill;
- due vocabulary;
- error notebook tags;
- preferred topic;
- upcoming assessment competency.
