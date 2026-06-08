<div align="center">

# 🟥 UI-Referee

**Visual UI Annotation SDK for AI Coding Agents**

Click any element on any webpage. Leave a note. Export structured, AI-ready context in one click.

[![Version](https://img.shields.io/badge/version-1.0.0-e8001c?style=flat-square&labelColor=0d0d0f)](https://github.com/idiotinnovators/ui-referee/releases)
[![License](https://img.shields.io/badge/license-MIT-ffd000?style=flat-square&labelColor=0d0d0f)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-zero-00c853?style=flat-square&labelColor=0d0d0f)](ui-referee.js)
[![File Size](https://img.shields.io/badge/size-~18kb-79c0ff?style=flat-square&labelColor=0d0d0f)](ui-referee.js)
[![CDN](https://img.shields.io/badge/CDN-idiotinnovators.com-d2a8ff?style=flat-square&labelColor=0d0d0f)](https://idiotinnovators.com/ui-referee.js)

---

<!-- Replace with your actual GIF -->
![UI-Referee in action](demo.gif)

---

**Works with →**
&nbsp;
![Claude Code](https://img.shields.io/badge/Claude_Code-e8001c?style=flat-square)
![Cursor](https://img.shields.io/badge/Cursor-1a1a1a?style=flat-square)
![Windsurf](https://img.shields.io/badge/Windsurf-0a84ff?style=flat-square)
![Cline](https://img.shields.io/badge/Cline-7c3aed?style=flat-square)
![Roo_Code](https://img.shields.io/badge/Roo_Code-059669?style=flat-square)
![Gemini_CLI](https://img.shields.io/badge/Gemini_CLI-1a73e8?style=flat-square)
![OpenAI_Codex](https://img.shields.io/badge/OpenAI_Codex-10a37f?style=flat-square)

</div>

---

## What is UI-Referee?

UI-Referee is a **single JavaScript file** you drop into any webpage.  
It injects a floating toolbar that lets you:

1. **Flag** any element on the page with a click
2. **Describe** the change you want in plain English
3. **Export** a structured JSON payload or a ready-to-paste AI prompt

No build tools. No npm. No React. No backend. No accounts.  
It just works — on any site, any stack, any browser.

---

## Quick Start

### CDN (recommended — no install)

```html
<script src="https://idiotinnovators.com/ui-referee.js"></script>
```

Drop this tag anywhere in your HTML — `<head>` or before `</body>`.  
UI-Referee auto-initialises. The toolbar appears in the bottom-right corner.

### Self-hosted

```bash
# Download the single file
curl -o ui-referee.js https://idiotinnovators.com/ui-referee.js
```

```html
<script src="/path/to/ui-referee.js"></script>
```

### Bookmarklet (annotate any site)

Create a browser bookmark and set the URL to:

```javascript
javascript:(function(){var s=document.createElement('script');s.src='https://idiotinnovators.com/ui-referee.js';document.head.appendChild(s);})();
```

Click the bookmark on any webpage to inject UI-Referee on the fly.

---

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  1. Open any webpage                                        │
│  2. Click  🚩 Flag Element  in the toolbar                  │
│  3. Hover over elements  →  red dashed highlight appears    │
│  4. Click the element you want to annotate                  │
│  5. Type your instruction in the modal  →  Save Flag        │
│  6. Repeat for all elements that need changes               │
│  7. Click  ↗ Export  →  copy JSON or AI Prompt             │
│  8. Paste the prompt into Claude Code, Cursor, Cline, etc.  │
└─────────────────────────────────────────────────────────────┘
```

---

## Features

### 🚩 Floating Toolbar
Injected into any page at `z-index: 2,147,483,000` — always on top, never breaks layout.

| Button | Action |
|---|---|
| **🚩 Flag Element** | Toggle annotation mode |
| **↗ Export `n`** | Open export modal (JSON + AI Prompt) |
| **✕** | Clear all flags |

**Keyboard shortcut:** `Alt + A` — toggle annotation mode from anywhere.

---

### 🎯 Smart Element Selection
When annotation mode is active, hover any element to see a red dashed outline and a tag label showing `<tag>#id.class`.

Clicking opens the annotation modal, which shows:
- Tag name
- ID attribute
- Class list
- Auto-generated CSS selector
- Visible text content

---

### 🔍 Smart Selector Generator
UI-Referee builds the shortest, most reliable CSS selector for each element:

| Priority | Example |
|---|---|
| Unique `id` | `#submit-btn` |
| `data-testid` | `[data-testid="checkout-btn"]` |
| `data-cy` | `[data-cy="nav-link"]` |
| `data-test` | `[data-test="hero-cta"]` |
| Parent + class chain | `.hero .btn-primary` |
| `nth-of-type` fallback | `body > div:nth-of-type(2) > button` |

---

### 📄 Export: JSON

```json
{
  "meta": {
    "tool": "UI-Referee",
    "version": "1.0.0",
    "cdn": "https://idiotinnovators.com/ui-referee.js"
  },
  "page": {
    "url": "https://example.com/pricing",
    "title": "Pricing — Example"
  },
  "annotations": [
    {
      "id": "ref_abc123",
      "timestamp": 1719000000000,
      "selector": "#pricing-cta",
      "tag": "button",
      "idAttribute": "pricing-cta",
      "classes": ["btn", "btn-primary", "btn-lg"],
      "text": "Start Free Trial",
      "note": "Change text to 'Get Started Free' and make the background #00c853",
      "pageUrl": "https://example.com/pricing",
      "pageTitle": "Pricing — Example",
      "context": {
        "outerHTML": "<button id=\"pricing-cta\" class=\"btn btn-primary btn-lg\">Start Free Trial</button>",
        "innerText": "Start Free Trial",
        "parentHTML": "...",
        "boundingRect": { "top": 480, "left": 640, "width": 200, "height": 48 },
        "computedStyles": {
          "display": "inline-flex",
          "position": "static",
          "width": "200px",
          "height": "48px",
          "color": "rgb(255,255,255)",
          "backgroundColor": "rgb(232,0,28)",
          "fontSize": "16px"
        }
      }
    }
  ]
}
```

---

### 🤖 Export: AI Prompt

Produces a structured, agent-ready prompt:

```
# UI-Referee — AI Agent Change Request

You are an expert frontend developer modifying a live webpage.
Below are flagged UI elements with specific change instructions.
Implement all changes, producing production-ready code.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Title : Pricing — Example
URL   : https://example.com/pricing
Flags : 2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FLAG 1 of 2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Selector : #pricing-cta
Tag      : <button>
...

── Requested Change ──
Change text to 'Get Started Free' and make the background #00c853
```

---

### 🔢 Numbered Badges
After saving a flag, a small red numbered badge appears on the annotated element.  
Badges reposition automatically on scroll and window resize.  
Click a badge to see a toast with its note.

---

### 💾 Persistence
Annotations are saved to `localStorage` under the key `uireferee_annotations`.  
Reload the page — your flags are still there.

---

## JavaScript API

UI-Referee exposes a global `UIReferee` object:

```javascript
// Auto-initialised on load — call manually only if needed
UIReferee.init()

// Annotation mode
UIReferee.enable()        // enter annotation mode
UIReferee.disable()       // exit annotation mode

// Export
UIReferee.exportJSON()    // download ui-referee-annotations.json
UIReferee.exportPrompt()  // copy AI prompt to clipboard

// Data
UIReferee.getAnnotations() // returns array of annotation objects
UIReferee.clear()          // clears all annotations + localStorage

// Meta
UIReferee.version          // "1.0.0"
```

### Example: Programmatic annotation on a specific element

```javascript
// You can trigger annotation on any element via the internal SDK:
const el = document.querySelector('#my-button');
UIReferee._sdk.addAnnotation(el, 'Change this button color to green');
```

### Example: Export and send to your own backend

```javascript
const json = JSON.parse(UIReferee._sdk.exportJSON(false));

fetch('/api/annotations', {
  method : 'POST',
  headers: { 'Content-Type': 'application/json' },
  body   : JSON.stringify(json),
});
```

---

## Using the Exported Prompt with AI Agents

### Claude Code (CLI)
```bash
# Paste the exported prompt directly into Claude Code
claude "$(pbpaste)"     # macOS — pbpaste reads clipboard
claude "$(xclip -o)"   # Linux
```

### Cursor / Windsurf / Cline / Roo Code
1. Click **↗ Export → AI Prompt → ⎘ Copy Prompt**
2. Open your AI agent's chat panel
3. Paste — the agent will implement all flagged changes

### Gemini CLI
```bash
gemini -p "$(pbpaste)"
```

### OpenAI Codex / API
```javascript
const prompt = UIReferee._sdk.exportPrompt(false);

const response = await openai.chat.completions.create({
  model   : 'gpt-4o',
  messages: [{ role: 'user', content: prompt }],
});
```

---

## Data Model Reference

Each annotation object has this shape:

```typescript
interface Annotation {
  id          : string;       // "ref_abc123def"
  timestamp   : number;       // Unix ms
  selector    : string;       // "#submit-btn"
  tag         : string;       // "button"
  idAttribute : string;       // "submit-btn"
  classes     : string[];     // ["btn", "btn-primary"]
  text        : string;       // Visible text (max 300 chars)
  note        : string;       // Your instruction
  pageUrl     : string;       // Current page URL
  pageTitle   : string;       // document.title

  context: {
    outerHTML   : string;     // Element's HTML (max 2000 chars)
    innerText   : string;     // Visible text (max 500 chars)
    parentHTML  : string;     // Parent element HTML
    boundingRect: {
      top: number; left: number;
      width: number; height: number;
    };
    computedStyles: {
      display: string; position: string;
      width: string;   height: string;
      color: string;   backgroundColor: string;
      margin: string;  padding: string;
      fontSize: string;
    };
  };
}
```

---

## Browser Support

| Browser | Support |
|---|---|
| Chrome 90+ | ✅ Full |
| Firefox 88+ | ✅ Full |
| Safari 14+ | ✅ Full |
| Edge 90+ | ✅ Full |
| Opera 76+ | ✅ Full |

Requires: `CSS.escape`, `getBoundingClientRect`, `localStorage`, `Blob` / `URL.createObjectURL`.

---

## Contributing

Contributions are welcome!

```bash
git clone https://github.com/idiotinnovators/ui-referee.git
cd ui-referee

# Edit the single source file
code ui-referee.js

# Test by opening the example page
open examples/basic.html
```

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

---

## Changelog

### v1.0.0 — Initial Release
- Floating toolbar with flag / export / clear
- Hover highlight with element tag label
- Annotation modal with smart selector generation
- JSON export with full DOM context
- AI-prompt export (Claude Code, Cursor, Windsurf, Cline, Gemini CLI, Codex)
- Numbered badges with scroll repositioning
- `localStorage` persistence across page reloads
- `Alt+A` keyboard shortcut
- Bookmarklet support
- Zero dependencies · single file · ~18kb

---

## License

MIT © 2025 [Idiot Innovators](https://idiotinnovators.com)

---

<div align="center">

**[⬆ Back to top](#-ui-referee)**

Made with love by [Idiot Innovators Research And Development](https://idiotinnovators.com) · CDN: `https://idiotinnovators.com/ui-referee.js`

</div>
