# DATA ACQUISITION

Use `catalog/download_manifest.json` as machine-readable source of truth.

## CEFR-J

Repository:
https://github.com/openlanguageprofiles/olp-en-cefrj

Files:
- cefrj-vocabulary-profile-1.5.csv (~7,800 lines)
- cefrj-grammar-profile-20180315.csv (~501 lines)
- octanove-vocabulary-profile-c1c2-1.0.csv (~2,137 lines)

## Open English WordNet 2025

Official downloads:
https://en-word.net/downloads

Recommended format:
`english-wordnet-2025-json.zip` (~9.5 MB).

## Tatoeba English/Vietnamese

Official weekly export root:
https://downloads.tatoeba.org/exports/

English directory:
https://downloads.tatoeba.org/exports/per_language/eng/

Useful files observed 2026-09-05:
- `eng_sentences.tsv.bz2` ~24.9 MB
- `eng_sentences_CC0.tsv.bz2` ~1.29 MB
- `eng_sentences_with_audio.tsv.bz2` ~4.09 MB
- `eng-vie_links.tsv.bz2` ~140 KB

Vietnamese directory:
https://downloads.tatoeba.org/exports/per_language/vie/

Agent should also fetch Vietnamese sentence table needed to resolve linked IDs.

## Project Gutenberg

Do NOT spider human-facing pages.
Official machine catalog:
https://www.gutenberg.org/cache/epub/feeds/

Observed current catalog:
- `pg_catalog.csv.gz` ~5.3 MB
- `rdf-files.tar.bz2` ~121 MB
- entire text tar can be ~10+ GB and should not be bundled by default.

Use catalog to select a curated English subset first.

## LibriVox

API:
https://librivox.org/api/feed/audiobooks

API docs:
https://librivox.org/api/info

Use metadata/API first; download selected books/chapters only.

## VOA Learning English

Source rights statement:
https://learningenglish.voanews.com/p/6861.html

Prefer curated series ingestion rather than blind whole-site crawling. Every imported asset must retain original URL and ownership check result.
