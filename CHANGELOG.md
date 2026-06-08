# Changelog

All notable changes to UI-Referee are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [1.0.0] — 2025

### Added
- Floating toolbar (🚩 Flag Element · ↗ Export · ✕ Clear)
- `Alt+A` keyboard shortcut to toggle annotation mode
- Hover highlight overlay with element tag / id / class label
- Annotation modal with element info card (tag, id, classes, selector, text)
- Smart CSS selector generator — prioritises `#id`, `data-testid`, `data-cy`, `data-test`, class chain, nth-of-type fallback
- Annotation data model with full DOM context (outerHTML, innerText, parentHTML, boundingRect, computedStyles)
- JSON export — structured payload with page metadata and all annotations
- AI Prompt export — ready-to-paste prompt for Claude Code, Cursor, Windsurf, Cline, Roo Code, Gemini CLI, OpenAI Codex
- Numbered red badges on annotated elements; auto-reposition on scroll / resize
- Toast notifications for all actions
- `localStorage` persistence under `uireferee_annotations`
- Bookmarklet support
- Public API: `UIReferee.init / enable / disable / exportJSON / exportPrompt / clear / getAnnotations`
- Zero dependencies · single file · ~18kb · MIT License
