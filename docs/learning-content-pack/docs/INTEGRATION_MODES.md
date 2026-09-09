# INTEGRATION MODES

## Native

Use when license/provenance allows hosting/transforming.
User stays entirely in app; score and telemetry are automatic.

Examples:
- CEFR-J-derived vocabulary metadata;
- Open English WordNet definitions/relations with attribution;
- reusable Tatoeba text/audio;
- verified VOA-owned material;
- selected public-domain/OER content.

## Embed

Use when provider supports embedding but not redistribution.

Primary example: YouTube official iframe player.

App can wrap the player with its own:
- objective;
- pre-vocabulary;
- quiz;
- note-taking;
- summary;
- speaking task.

Never present embedded media as locally owned.

## External

Open official source in new tab/window.
On return, app requests optional self-report:
- completed yes/no;
- duration;
- score if user knows it;
- difficulty 1-5;
- confidence 1-5.

External links are appropriate for Cambridge/British Council content.

## Link safety

- always display provider/domain;
- use noopener/noreferrer where appropriate;
- mark external icon;
- periodically check link health manually/through permitted mechanisms;
- do not bypass paywalls/login/access controls.
