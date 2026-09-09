# Raw Data Policy

Raw third-party corpora are intentionally fetched from their official endpoints rather than frozen into this specification ZIP.

Reasons:
1. Tatoeba exports update weekly.
2. Large corpora can reach tens of MB to many GB.
3. Audio/media may have item-specific rights.
4. Project Gutenberg and LibriVox require jurisdiction-aware public-domain handling.
5. Agent should record current hash/version/license at ingestion time.

`catalog/download_manifest.json` contains the concrete URLs and expected ingestion role.
