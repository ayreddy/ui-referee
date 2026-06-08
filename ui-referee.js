/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                       UI-REFEREE  🟥                         ║
 * ║          Visual UI Annotation SDK for AI Coding Agents       ║
 * ║                                                              ║
 * ║  Click any element. Leave a note. Export AI-ready context.   ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * CDN:     https://idiotinnovators.com/ui-referee.js
 * GitHub:  https://github.com/idiotinnovators/ui-referee
 * Version: 1.0.0
 *
 * Usage:
 *   <script src="https://idiotinnovators.com/ui-referee.js"></script>
 *
 * Public API:
 *   UIReferee.init()         — manually initialize (auto-runs on load)
 *   UIReferee.enable()       — enter annotation mode
 *   UIReferee.disable()      — exit annotation mode
 *   UIReferee.exportJSON()   — download structured JSON
 *   UIReferee.exportPrompt() — copy AI prompt to clipboard
 *   UIReferee.clear()        — clear all annotations
 *   UIReferee.getAnnotations() — returns annotation array
 *
 * Optimised for:
 *   Claude Code · OpenAI Codex · Cursor · Windsurf
 *   Roo Code · Cline · Gemini CLI
 *
 * No dependencies · No build tools · Pure ES6 · Single file
 * © 2025 Idiot Innovators — MIT License
 */

(function (global) {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
   * 0.  CONSTANTS
   * ───────────────────────────────────────────────────────────── */
  const VERSION     = '1.0.0';
  const STORAGE_KEY = 'uireferee_annotations';
  const Z_BASE      = 2_147_483_000;
  const CDN_URL     = 'https://idiotinnovators.com/ui-referee.js';

  /* ─────────────────────────────────────────────────────────────
   * 1.  UTILITY HELPERS
   * ───────────────────────────────────────────────────────────── */

  /** Short unique ID */
  function uid() {
    return 'ref_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  /**
   * generateSelector(el)
   * Builds the most precise, readable CSS selector for an element.
   *
   * Priority:
   *   1. Unique #id
   *   2. [data-testid]
   *   3. [data-cy]
   *   4. [data-test]
   *   5. Parent + class chain
   *   6. nth-of-type fallback path
   */
  function generateSelector(el) {
    if (!el || el === document.body) return 'body';

    // 1 — unique id
    if (el.id) {
      const sel = `#${CSS.escape(el.id)}`;
      try { if (document.querySelectorAll(sel).length === 1) return sel; } catch (_) {}
    }

    // 2 — data-testid
    const testId = el.getAttribute('data-testid');
    if (testId) {
      const sel = `[data-testid="${testId}"]`;
      try { if (document.querySelectorAll(sel).length === 1) return sel; } catch (_) {}
    }

    // 3 — data-cy
    const cy = el.getAttribute('data-cy');
    if (cy) {
      const sel = `[data-cy="${cy}"]`;
      try { if (document.querySelectorAll(sel).length === 1) return sel; } catch (_) {}
    }

    // 4 — data-test
    const test = el.getAttribute('data-test');
    if (test) {
      const sel = `[data-test="${test}"]`;
      try { if (document.querySelectorAll(sel).length === 1) return sel; } catch (_) {}
    }

    // 5 — class chain (parent + element)
    if (el.classList.length) {
      const classes = '.' + Array.from(el.classList)
        .filter(c => !/^(ng-|js-|is-|has-|active|hover|focus|selected|disabled)$/.test(c))
        .slice(0, 3)
        .map(c => CSS.escape(c))
        .join('.');
      if (classes !== '.') {
        const parent = el.parentElement;
        if (parent && parent !== document.body) {
          const pSel = parent.classList[0]
            ? '.' + CSS.escape(parent.classList[0])
            : parent.tagName.toLowerCase();
          const combined = `${pSel} ${el.tagName.toLowerCase()}${classes}`;
          try { if (document.querySelectorAll(combined).length === 1) return combined; } catch (_) {}
        }
        try { if (document.querySelectorAll(classes).length === 1) return classes; } catch (_) {}
      }
    }

    // 6 — nth-of-type path (capped at 6 levels)
    const path = [];
    let node = el;
    while (node && node !== document.documentElement) {
      const parent = node.parentElement;
      if (!parent) break;
      const siblings = Array.from(parent.children).filter(c => c.tagName === node.tagName);
      const idx = siblings.indexOf(node);
      path.unshift(idx > 0
        ? `${node.tagName.toLowerCase()}:nth-of-type(${idx + 1})`
        : node.tagName.toLowerCase());
      node = parent;
      if (path.length >= 6) break;
    }
    return path.join(' > ');
  }

  /**
   * getDOMContext(el)
   * Captures rich DOM + style context for the annotated element.
   */
  function getDOMContext(el) {
    const rect = el.getBoundingClientRect();
    const cs   = window.getComputedStyle(el);
    return {
      outerHTML   : el.outerHTML.slice(0, 2000),
      innerText   : (el.innerText || '').slice(0, 500),
      parentHTML  : el.parentElement ? el.parentElement.outerHTML.slice(0, 1000) : '',
      boundingRect: {
        top   : Math.round(rect.top  + window.scrollY),
        left  : Math.round(rect.left + window.scrollX),
        width : Math.round(rect.width),
        height: Math.round(rect.height),
      },
      computedStyles: {
        display        : cs.display,
        position       : cs.position,
        width          : cs.width,
        height         : cs.height,
        color          : cs.color,
        backgroundColor: cs.backgroundColor,
        margin         : cs.margin,
        padding        : cs.padding,
        fontSize       : cs.fontSize,
      },
    };
  }

  /** Download a file in the browser */
  function downloadFile(filename, content, mime = 'application/json') {
    const blob = new Blob([content], { type: mime });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /** Copy text to clipboard (modern + legacy fallback) */
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = Object.assign(document.createElement('textarea'), {
        value: text,
        style: 'position:fixed;opacity:0;pointer-events:none',
      });
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    }
  }

  /* ─────────────────────────────────────────────────────────────
   * 2.  STYLES
   * ───────────────────────────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('uir-styles')) return;
    const css = `
      :root {
        --uir-red     : #e8001c;
        --uir-red2    : #ff3347;
        --uir-yellow  : #ffd000;
        --uir-green   : #00c853;
        --uir-bg      : #0d0d0f;
        --uir-surface : #161619;
        --uir-surface2: #1e1e23;
        --uir-border  : rgba(232,0,28,0.28);
        --uir-border2 : rgba(255,255,255,0.07);
        --uir-text    : #f0eef4;
        --uir-muted   : #6e6c80;
        --uir-radius  : 10px;
        --uir-shadow  : 0 12px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(232,0,28,0.18);
        --uir-font    : 'Segoe UI', system-ui, -apple-system, sans-serif;
        --uir-mono    : 'Fira Code','Cascadia Code','Consolas',monospace;
        --uir-z       : ${Z_BASE};
      }

      /* ── Toolbar ── */
      #uir-toolbar {
        position      : fixed;
        bottom        : 22px;
        right         : 22px;
        z-index       : var(--uir-z);
        display       : flex;
        align-items   : center;
        gap           : 6px;
        background    : var(--uir-bg);
        border        : 1px solid var(--uir-border);
        border-radius : 14px;
        padding       : 7px 10px;
        box-shadow    : var(--uir-shadow);
        font-family   : var(--uir-font);
        user-select   : none;
        backdrop-filter: blur(16px);
      }

      /* whistle logo mark */
      .uir-logo {
        display     : flex;
        align-items : center;
        gap         : 7px;
        padding-right: 8px;
        border-right: 1px solid var(--uir-border);
        margin-right: 2px;
      }
      .uir-logo-icon {
        width : 26px;
        height: 26px;
        background: var(--uir-red);
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        line-height: 1;
        box-shadow: 0 2px 8px rgba(232,0,28,0.45);
        flex-shrink: 0;
      }
      .uir-logo-text {
        font-size    : 11.5px;
        font-weight  : 800;
        letter-spacing: 0.06em;
        color        : var(--uir-text);
        white-space  : nowrap;
        line-height  : 1;
      }
      .uir-logo-text span { color: var(--uir-red); }

      /* ── Buttons ── */
      .uir-btn {
        display      : inline-flex;
        align-items  : center;
        gap          : 5px;
        border       : none;
        border-radius: 8px;
        padding      : 6px 12px;
        font-size    : 12px;
        font-weight  : 700;
        font-family  : var(--uir-font);
        cursor       : pointer;
        transition   : background 0.15s, transform 0.1s, box-shadow 0.15s;
        white-space  : nowrap;
        outline      : none;
        letter-spacing: 0.02em;
      }
      .uir-btn:active { transform: scale(0.95); }

      .uir-btn-flag {
        background: var(--uir-red);
        color     : #fff;
        box-shadow: 0 2px 10px rgba(232,0,28,0.35);
      }
      .uir-btn-flag:hover { background: var(--uir-red2); box-shadow: 0 2px 16px rgba(232,0,28,0.55); }

      .uir-btn-active {
        background: var(--uir-yellow);
        color     : #0d0d0f;
        box-shadow: 0 0 18px rgba(255,208,0,0.5);
        animation : uir-pulse 1.8s ease-in-out infinite;
      }
      .uir-btn-active:hover { background: #ffe033; }

      .uir-btn-ghost {
        background: rgba(255,255,255,0.06);
        color     : var(--uir-text);
        border    : 1px solid var(--uir-border2);
      }
      .uir-btn-ghost:hover { background: rgba(255,255,255,0.11); }

      .uir-btn-danger {
        background: rgba(232,0,28,0.1);
        color     : var(--uir-red2);
        border    : 1px solid rgba(232,0,28,0.2);
        padding   : 6px 9px;
      }
      .uir-btn-danger:hover { background: rgba(232,0,28,0.2); }

      .uir-count {
        background   : var(--uir-red);
        color        : #fff;
        border-radius: 99px;
        font-size    : 10px;
        font-weight  : 800;
        padding      : 1px 6px;
        min-width    : 17px;
        text-align   : center;
        display      : inline-block;
        box-shadow   : 0 0 6px rgba(232,0,28,0.4);
      }

      @keyframes uir-pulse {
        0%,100% { box-shadow: 0 0 18px rgba(255,208,0,0.5); }
        50%      { box-shadow: 0 0 30px rgba(255,208,0,0.8); }
      }

      /* ── Hover overlay ── */
      #uir-hover-overlay {
        position       : fixed;
        pointer-events : none;
        z-index        : calc(var(--uir-z) - 10);
        border         : 2px dashed var(--uir-red);
        border-radius  : 3px;
        background     : rgba(232,0,28,0.05);
        box-shadow     : 0 0 0 1px rgba(232,0,28,0.15);
        display        : none;
        transition     : top 0.05s, left 0.05s, width 0.05s, height 0.05s;
      }
      #uir-hover-tag {
        position     : absolute;
        top          : -24px;
        left         : -1px;
        background   : var(--uir-red);
        color        : #fff;
        font-size    : 10px;
        font-weight  : 700;
        font-family  : var(--uir-mono);
        padding      : 2px 8px;
        border-radius: 4px 4px 4px 0;
        white-space  : nowrap;
        letter-spacing: 0.04em;
        box-shadow   : 0 2px 8px rgba(232,0,28,0.4);
      }

      /* ── Backdrop ── */
      .uir-backdrop {
        display        : none;
        position       : fixed;
        inset          : 0;
        z-index        : calc(var(--uir-z) + 10);
        background     : rgba(0,0,0,0.7);
        backdrop-filter: blur(5px);
        align-items    : center;
        justify-content: center;
      }
      .uir-backdrop.uir-open { display: flex; }

      /* ── Annotation Modal ── */
      #uir-ann-modal {
        background   : var(--uir-surface);
        border       : 1px solid var(--uir-border);
        border-radius: 16px;
        width        : min(560px, 93vw);
        max-height   : 86vh;
        overflow-y   : auto;
        box-shadow   : var(--uir-shadow), 0 0 80px rgba(232,0,28,0.08);
        font-family  : var(--uir-font);
        color        : var(--uir-text);
        animation    : uir-in 0.22s cubic-bezier(0.34,1.56,0.64,1);
      }
      @keyframes uir-in {
        from { transform: scale(0.87) translateY(24px); opacity:0; }
        to   { transform: scale(1)    translateY(0);    opacity:1; }
      }

      .uir-modal-head {
        display        : flex;
        align-items    : center;
        justify-content: space-between;
        padding        : 18px 22px 14px;
        border-bottom  : 1px solid var(--uir-border2);
      }
      .uir-modal-title {
        font-size  : 14px;
        font-weight: 800;
        color      : var(--uir-text);
        display    : flex;
        align-items: center;
        gap        : 9px;
        letter-spacing: 0.02em;
      }
      .uir-flag-pip {
        width : 10px; height: 10px;
        border-radius: 50%;
        background: var(--uir-red);
        box-shadow: 0 0 8px var(--uir-red);
        display: inline-block;
        animation: uir-pip 1.6s ease-in-out infinite;
      }
      @keyframes uir-pip {
        0%,100% { box-shadow: 0 0 8px var(--uir-red); }
        50%      { box-shadow: 0 0 16px var(--uir-red), 0 0 4px #fff; }
      }

      .uir-x {
        background   : rgba(255,255,255,0.05);
        border       : 1px solid var(--uir-border2);
        color        : var(--uir-muted);
        width        : 28px; height: 28px;
        border-radius: 7px;
        cursor       : pointer;
        font-size    : 14px;
        display      : flex;
        align-items  : center;
        justify-content: center;
        transition   : background 0.15s, color 0.15s;
        flex-shrink  : 0;
      }
      .uir-x:hover { background: rgba(232,0,28,0.18); color: var(--uir-red2); }

      .uir-modal-body { padding: 18px 22px; }

      /* element info card */
      .uir-el-card {
        background   : rgba(0,0,0,0.28);
        border       : 1px solid var(--uir-border2);
        border-radius: 8px;
        padding      : 12px 14px;
        display      : grid;
        grid-template-columns: auto 1fr;
        gap          : 6px 14px;
        font-size    : 12px;
        margin-bottom: 16px;
      }
      .uir-el-label {
        color      : var(--uir-muted);
        font-weight: 700;
        white-space: nowrap;
        font-size  : 11px;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        padding-top: 1px;
      }
      .uir-el-val {
        color       : var(--uir-text);
        font-family : var(--uir-mono);
        font-size   : 11.5px;
        overflow    : hidden;
        text-overflow: ellipsis;
        white-space : nowrap;
      }
      .uir-el-val.c-tag  { color: #ff7b72; }
      .uir-el-val.c-sel  { color: var(--uir-green); }
      .uir-el-val.c-id   { color: #79c0ff; }
      .uir-el-val.c-cls  { color: #d2a8ff; }

      .uir-field-label {
        font-size    : 11px;
        font-weight  : 700;
        color        : var(--uir-muted);
        margin-bottom: 7px;
        display      : block;
        letter-spacing: 0.07em;
        text-transform: uppercase;
      }
      .uir-textarea {
        width        : 100%;
        background   : rgba(0,0,0,0.32);
        border       : 1px solid var(--uir-border2);
        border-radius: 8px;
        color        : var(--uir-text);
        font-family  : var(--uir-font);
        font-size    : 13px;
        padding      : 11px 14px;
        resize       : vertical;
        min-height   : 96px;
        box-sizing   : border-box;
        outline      : none;
        transition   : border-color 0.15s, box-shadow 0.15s;
        line-height  : 1.6;
      }
      .uir-textarea:focus {
        border-color: var(--uir-red);
        box-shadow  : 0 0 0 3px rgba(232,0,28,0.15);
      }
      .uir-textarea::placeholder { color: var(--uir-muted); }

      .uir-modal-foot {
        display        : flex;
        justify-content: flex-end;
        align-items    : center;
        gap            : 8px;
        padding        : 13px 22px 18px;
        border-top     : 1px solid var(--uir-border2);
      }
      .uir-hint {
        font-size : 11px;
        color     : var(--uir-muted);
        margin-right: auto;
      }

      /* ── Export Modal ── */
      #uir-exp-modal {
        background   : var(--uir-surface);
        border       : 1px solid var(--uir-border);
        border-radius: 16px;
        width        : min(660px, 94vw);
        max-height   : 88vh;
        overflow-y   : auto;
        box-shadow   : var(--uir-shadow);
        font-family  : var(--uir-font);
        color        : var(--uir-text);
        animation    : uir-in 0.22s cubic-bezier(0.34,1.56,0.64,1);
      }

      /* tabs */
      .uir-tabs {
        display     : flex;
        gap         : 2px;
        padding     : 14px 22px 0;
        border-bottom: 1px solid var(--uir-border2);
      }
      .uir-tab {
        padding      : 8px 18px;
        font-size    : 12px;
        font-weight  : 700;
        color        : var(--uir-muted);
        cursor       : pointer;
        border-radius: 6px 6px 0 0;
        border       : 1px solid transparent;
        background   : transparent;
        font-family  : var(--uir-font);
        transition   : color 0.15s, background 0.15s;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        font-size    : 11px;
      }
      .uir-tab.uir-tab-on {
        color        : var(--uir-text);
        background   : rgba(232,0,28,0.12);
        border-color : var(--uir-border);
        border-bottom: 1px solid var(--uir-surface);
        margin-bottom: -1px;
      }
      .uir-tab:hover:not(.uir-tab-on) { color: var(--uir-text); background: rgba(255,255,255,0.04); }

      .uir-tab-pane          { display: none; padding: 20px 22px 24px; }
      .uir-tab-pane.uir-on   { display: block; }

      /* code block */
      .uir-code {
        background   : rgba(0,0,0,0.38);
        border       : 1px solid var(--uir-border2);
        border-radius: 8px;
        padding      : 14px;
        font-family  : var(--uir-mono);
        font-size    : 11.5px;
        color        : #a8b4cf;
        white-space  : pre-wrap;
        word-break   : break-all;
        max-height   : 360px;
        overflow-y   : auto;
        line-height  : 1.65;
      }
      .uir-code::-webkit-scrollbar { width: 5px; }
      .uir-code::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius:3px; }

      .uir-row {
        display  : flex;
        gap      : 8px;
        margin-top: 13px;
        flex-wrap: wrap;
      }

      /* ── Toast ── */
      #uir-toast {
        position     : fixed;
        bottom       : 88px;
        right        : 22px;
        z-index      : calc(var(--uir-z) + 60);
        background   : var(--uir-surface2);
        border       : 1px solid var(--uir-green);
        border-radius: 9px;
        padding      : 10px 18px;
        font-size    : 12.5px;
        font-family  : var(--uir-font);
        font-weight  : 700;
        color        : var(--uir-green);
        box-shadow   : 0 4px 24px rgba(0,200,83,0.2);
        opacity      : 0;
        transform    : translateY(12px);
        transition   : opacity 0.2s, transform 0.2s;
        pointer-events: none;
        letter-spacing: 0.02em;
        display      : flex;
        align-items  : center;
        gap          : 7px;
      }
      #uir-toast.uir-show { opacity:1; transform: translateY(0); }
      #uir-toast.uir-warn {
        border-color: var(--uir-yellow);
        color       : var(--uir-yellow);
        box-shadow  : 0 4px 24px rgba(255,208,0,0.2);
      }

      /* ── Annotation Badges ── */
      .uir-badge {
        position     : fixed;
        z-index      : calc(var(--uir-z) - 5);
        width        : 22px;
        height       : 22px;
        border-radius: 50%;
        background   : var(--uir-red);
        color        : #fff;
        font-size    : 10px;
        font-weight  : 800;
        font-family  : var(--uir-font);
        display      : flex;
        align-items  : center;
        justify-content: center;
        box-shadow   : 0 2px 10px rgba(232,0,28,0.55), 0 0 0 2.5px rgba(255,255,255,0.2);
        cursor       : pointer;
        transition   : transform 0.15s, box-shadow 0.15s;
        border       : none;
        pointer-events: all;
      }
      .uir-badge:hover {
        transform : scale(1.25);
        box-shadow: 0 4px 18px rgba(232,0,28,0.7), 0 0 0 3px rgba(255,255,255,0.3);
      }

      /* ── Annotation mode cursor ── */
      body.uir-mode,
      body.uir-mode * { cursor: crosshair !important; }

      /* scrollbar global for modals */
      #uir-ann-modal::-webkit-scrollbar,
      #uir-exp-modal::-webkit-scrollbar { width: 5px; }
      #uir-ann-modal::-webkit-scrollbar-thumb,
      #uir-exp-modal::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius:3px; }
    `;

    const s = document.createElement('style');
    s.id    = 'uir-styles';
    s.textContent = css;
    document.head.appendChild(s);
  }

  /* ─────────────────────────────────────────────────────────────
   * 3.  TOOLBAR
   * ───────────────────────────────────────────────────────────── */
  class Toolbar {
    constructor(sdk) {
      this.sdk = sdk;
      this.el  = null;
    }

    build() {
      const tb  = document.createElement('div');
      tb.id     = 'uir-toolbar';
      tb.innerHTML = `
        <div class="uir-logo">
          <div class="uir-logo-icon">🟥</div>
          <div class="uir-logo-text">UI<span>-</span>REFEREE</div>
        </div>
        <button class="uir-btn uir-btn-flag" id="uir-flag-btn" title="Toggle annotation mode (Alt+A)">
          🚩 Flag Element
        </button>
        <button class="uir-btn uir-btn-ghost" id="uir-exp-btn" title="Export annotations">
          ↗ Export
          <span class="uir-count" id="uir-count">0</span>
        </button>
        <button class="uir-btn uir-btn-danger" id="uir-clear-btn" title="Clear all">✕</button>
      `;
      document.body.appendChild(tb);
      this.el = tb;

      tb.querySelector('#uir-flag-btn').addEventListener('click', () => {
        this.sdk.annotating ? this.sdk.disable() : this.sdk.enable();
      });
      tb.querySelector('#uir-exp-btn').addEventListener('click', () => {
        this.sdk.exportModal.open();
      });
      tb.querySelector('#uir-clear-btn').addEventListener('click', () => {
        if (this.sdk.annotations.length === 0) {
          this.sdk.toast('No annotations to clear.', 'warn');
          return;
        }
        if (confirm('Remove all UI-Referee annotations?')) this.sdk.clear();
      });

      // Alt+A keyboard shortcut
      document.addEventListener('keydown', e => {
        if (e.altKey && e.key.toLowerCase() === 'a') {
          this.sdk.annotating ? this.sdk.disable() : this.sdk.enable();
        }
      });
    }

    setActive(on) {
      const btn = document.getElementById('uir-flag-btn');
      if (!btn) return;
      if (on) {
        btn.innerHTML  = '⏹ Stop Flagging';
        btn.className  = 'uir-btn uir-btn-active';
      } else {
        btn.innerHTML  = '🚩 Flag Element';
        btn.className  = 'uir-btn uir-btn-flag';
      }
    }

    updateCount(n) {
      const b = document.getElementById('uir-count');
      if (b) b.textContent = n;
    }
  }

  /* ─────────────────────────────────────────────────────────────
   * 4.  HOVER OVERLAY
   * ───────────────────────────────────────────────────────────── */
  class HoverOverlay {
    constructor() { this.el = null; this.tag = null; }

    build() {
      const ov = document.createElement('div');
      ov.id    = 'uir-hover-overlay';
      const tg = document.createElement('div');
      tg.id    = 'uir-hover-tag';
      ov.appendChild(tg);
      document.body.appendChild(ov);
      this.el  = ov;
      this.tag = tg;
    }

    show(el) {
      if (!this.el) return;
      const r = el.getBoundingClientRect();
      Object.assign(this.el.style, {
        display: 'block',
        top    : `${r.top  - 2}px`,
        left   : `${r.left - 2}px`,
        width  : `${r.width  + 4}px`,
        height : `${r.height + 4}px`,
      });
      this.tag.textContent =
        `<${el.tagName.toLowerCase()}>`
        + (el.id ? `#${el.id}` : '')
        + (el.classList[0] ? `.${el.classList[0]}` : '');
    }

    hide() { if (this.el) this.el.style.display = 'none'; }
  }

  /* ─────────────────────────────────────────────────────────────
   * 5.  ANNOTATION MODAL
   * ───────────────────────────────────────────────────────────── */
  class AnnotationModal {
    constructor(sdk) { this.sdk = sdk; this.backdrop = null; this.target = null; }

    build() {
      const bd  = document.createElement('div');
      bd.id     = 'uir-ann-backdrop';
      bd.className = 'uir-backdrop';
      bd.innerHTML = `
        <div id="uir-ann-modal">
          <div class="uir-modal-head">
            <div class="uir-modal-title">
              <span class="uir-flag-pip"></span>
              Flag This Element
            </div>
            <button class="uir-x" id="uir-ann-x">✕</button>
          </div>
          <div class="uir-modal-body">
            <div class="uir-el-card" id="uir-el-info"></div>
            <label class="uir-field-label">Instruction / Note for AI Agent</label>
            <textarea class="uir-textarea" id="uir-note"
              placeholder="Describe the change you want…&#10;&#10;e.g. 'Change this button label to &quot;Get Started&quot; and make it green'&#10;e.g. 'This nav link is broken — fix the href to /pricing'"></textarea>
          </div>
          <div class="uir-modal-foot">
            <span class="uir-hint">⌘↵ to save · Esc to cancel</span>
            <button class="uir-btn uir-btn-ghost" id="uir-ann-cancel">Cancel</button>
            <button class="uir-btn uir-btn-flag" id="uir-ann-save">🚩 Save Flag</button>
          </div>
        </div>
      `;
      document.body.appendChild(bd);
      this.backdrop = bd;

      bd.querySelector('#uir-ann-x').addEventListener('click', () => this.close());
      bd.querySelector('#uir-ann-cancel').addEventListener('click', () => this.close());
      bd.querySelector('#uir-ann-save').addEventListener('click', () => this.save());
      bd.addEventListener('click', e => { if (e.target === bd) this.close(); });

      document.addEventListener('keydown', e => {
        if (!bd.classList.contains('uir-open')) return;
        if (e.key === 'Escape') this.close();
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) this.save();
      });
    }

    open(el) {
      this.target = el;
      const sel   = generateSelector(el);
      const info  = this.backdrop.querySelector('#uir-el-info');
      info.innerHTML = `
        <span class="uir-el-label">Tag</span>
        <span class="uir-el-val c-tag">&lt;${el.tagName.toLowerCase()}&gt;</span>
        <span class="uir-el-label">ID</span>
        <span class="uir-el-val c-id">${el.id || '—'}</span>
        <span class="uir-el-label">Classes</span>
        <span class="uir-el-val c-cls">${el.classList.length ? Array.from(el.classList).join(' ') : '—'}</span>
        <span class="uir-el-label">Selector</span>
        <span class="uir-el-val c-sel">${sel}</span>
        <span class="uir-el-label">Text</span>
        <span class="uir-el-val">${(el.innerText || '').slice(0, 90).trim() || '—'}</span>
      `;
      this.backdrop.querySelector('#uir-note').value = '';
      this.backdrop.classList.add('uir-open');
      setTimeout(() => this.backdrop.querySelector('#uir-note').focus(), 80);
    }

    close() { this.backdrop.classList.remove('uir-open'); this.target = null; }

    save() {
      const note = this.backdrop.querySelector('#uir-note').value.trim();
      if (!note) { this.backdrop.querySelector('#uir-note').focus(); return; }
      if (this.target) this.sdk.addAnnotation(this.target, note);
      this.close();
    }
  }

  /* ─────────────────────────────────────────────────────────────
   * 6.  EXPORT MODAL
   * ───────────────────────────────────────────────────────────── */
  class ExportModal {
    constructor(sdk) { this.sdk = sdk; this.backdrop = null; }

    build() {
      const bd  = document.createElement('div');
      bd.id     = 'uir-exp-backdrop';
      bd.className = 'uir-backdrop';
      bd.innerHTML = `
        <div id="uir-exp-modal">
          <div class="uir-modal-head">
            <div class="uir-modal-title">
              <span class="uir-flag-pip"></span>
              Export for AI Agent
            </div>
            <button class="uir-x" id="uir-exp-x">✕</button>
          </div>
          <div class="uir-tabs">
            <button class="uir-tab uir-tab-on" data-pane="json">📄 JSON</button>
            <button class="uir-tab" data-pane="prompt">🤖 AI Prompt</button>
          </div>
          <div class="uir-tab-pane uir-on" id="uir-pane-json">
            <div class="uir-code" id="uir-json-pre"></div>
            <div class="uir-row">
              <button class="uir-btn uir-btn-flag" id="uir-copy-json">⎘ Copy JSON</button>
              <button class="uir-btn uir-btn-ghost" id="uir-dl-json">↓ Download JSON</button>
            </div>
          </div>
          <div class="uir-tab-pane" id="uir-pane-prompt">
            <div class="uir-code" id="uir-prompt-pre"></div>
            <div class="uir-row">
              <button class="uir-btn uir-btn-flag" id="uir-copy-prompt">⎘ Copy Prompt</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(bd);
      this.backdrop = bd;

      bd.querySelector('#uir-exp-x').addEventListener('click', () => this.close());
      bd.addEventListener('click', e => { if (e.target === bd) this.close(); });
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && bd.classList.contains('uir-open')) this.close();
      });

      bd.querySelectorAll('.uir-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          bd.querySelectorAll('.uir-tab').forEach(t => t.classList.remove('uir-tab-on'));
          bd.querySelectorAll('.uir-tab-pane').forEach(p => p.classList.remove('uir-on'));
          tab.classList.add('uir-tab-on');
          bd.querySelector(`#uir-pane-${tab.dataset.pane}`).classList.add('uir-on');
        });
      });

      bd.querySelector('#uir-copy-json').addEventListener('click', async () => {
        await copyToClipboard(this.sdk.exportJSON(false));
        this.sdk.toast('✓ JSON copied to clipboard');
      });
      bd.querySelector('#uir-dl-json').addEventListener('click', () => {
        downloadFile('ui-referee-annotations.json', this.sdk.exportJSON(false));
        this.sdk.toast('✓ Downloaded ui-referee-annotations.json');
      });
      bd.querySelector('#uir-copy-prompt').addEventListener('click', async () => {
        await copyToClipboard(this.sdk.exportPrompt(false));
        this.sdk.toast('✓ Prompt copied — paste into your AI agent');
      });
    }

    open() {
      if (this.sdk.annotations.length === 0) {
        this.sdk.toast('No flags yet — click "Flag Element" to start.', 'warn');
        return;
      }
      this.backdrop.querySelector('#uir-json-pre').textContent   = this.sdk.exportJSON(false);
      this.backdrop.querySelector('#uir-prompt-pre').textContent = this.sdk.exportPrompt(false);
      this.backdrop.classList.add('uir-open');
    }

    close() { this.backdrop.classList.remove('uir-open'); }
  }

  /* ─────────────────────────────────────────────────────────────
   * 7.  BADGE MANAGER
   * ───────────────────────────────────────────────────────────── */
  class BadgeManager {
    constructor(sdk) { this.sdk = sdk; this.map = new Map(); }

    _makeBadge(ann) {
      const b = document.createElement('div');
      b.className = 'uir-badge';
      b.title     = ann.note;
      document.body.appendChild(b);
      b.addEventListener('click', () => {
        this.sdk.toast(`Flag: ${ann.note.slice(0, 70)}${ann.note.length > 70 ? '…' : ''}`);
      });
      return b;
    }

    _pos(badge, ann) {
      let el;
      try { el = document.querySelector(ann.selector); } catch (_) {}
      if (!el) { badge.style.display = 'none'; return; }
      const r = el.getBoundingClientRect();
      badge.style.display = 'flex';
      badge.style.top     = `${r.top  + window.scrollY - 11}px`;
      badge.style.left    = `${r.left + window.scrollX + r.width - 11}px`;
    }

    rebuildAll(annotations) {
      this.map.forEach(({ badge }) => badge.remove());
      this.map.clear();
      annotations.forEach((ann, i) => {
        const badge = this._makeBadge(ann);
        badge.textContent = i + 1;
        this._pos(badge, ann);
        this.map.set(ann.id, { badge, ann });
      });
    }

    repositionAll() {
      this.map.forEach(({ badge, ann }) => this._pos(badge, ann));
    }

    clearAll() {
      this.map.forEach(({ badge }) => badge.remove());
      this.map.clear();
    }
  }

  /* ─────────────────────────────────────────────────────────────
   * 8.  CORE SDK
   * ───────────────────────────────────────────────────────────── */
  class UIRefereeSDK {
    constructor() {
      this.annotating   = false;
      this.annotations  = [];
      this._hovered     = null;
      this._toastTimer  = null;

      this.toolbar      = new Toolbar(this);
      this.hover        = new HoverOverlay();
      this.annotModal   = new AnnotationModal(this);
      this.exportModal  = new ExportModal(this);
      this.badges       = new BadgeManager(this);

      this._onMove   = this._onMove.bind(this);
      this._onClick  = this._onClick.bind(this);
      this._onScroll = this._onScroll.bind(this);
    }

    /* ── init ── */
    init() {
      injectStyles();
      this.toolbar.build();
      this.hover.build();
      this.annotModal.build();
      this.exportModal.build();
      this._load();
      window.addEventListener('scroll', this._onScroll, { passive: true });
      window.addEventListener('resize', this._onScroll, { passive: true });
      console.log(
        `%c🟥 UI-Referee v${VERSION} ready  %c Alt+A to toggle · ${CDN_URL}`,
        'color:#e8001c;font-weight:800;font-size:13px',
        'color:#6e6c80;font-size:11px'
      );
    }

    /* ── enable ── */
    enable() {
      this.annotating = true;
      document.body.classList.add('uir-mode');
      document.addEventListener('mousemove', this._onMove);
      document.addEventListener('click',     this._onClick, true);
      this.toolbar.setActive(true);
      this.toast('🚩 Click any element to flag it');
    }

    /* ── disable ── */
    disable() {
      this.annotating = false;
      document.body.classList.remove('uir-mode');
      document.removeEventListener('mousemove', this._onMove);
      document.removeEventListener('click',     this._onClick, true);
      this.hover.hide();
      this._hovered = null;
      this.toolbar.setActive(false);
    }

    /* ── mouse move ── */
    _onMove(e) {
      const el = e.target;
      if (el.closest('#uir-toolbar,#uir-ann-backdrop,#uir-exp-backdrop,#uir-hover-overlay,.uir-badge')) {
        this.hover.hide();
        return;
      }
      if (el === this._hovered) return;
      this._hovered = el;
      this.hover.show(el);
    }

    /* ── click ── */
    _onClick(e) {
      const el = e.target;
      if (el.closest('#uir-toolbar,#uir-ann-backdrop,#uir-exp-backdrop,.uir-badge')) return;
      e.preventDefault();
      e.stopPropagation();
      this.hover.hide();
      this.annotModal.open(el);
    }

    /* ── scroll ── */
    _onScroll() { this.badges.repositionAll(); }

    /* ── add annotation ── */
    addAnnotation(el, note) {
      const annotation = {
        id         : uid(),
        timestamp  : Date.now(),
        selector   : generateSelector(el),
        tag        : el.tagName.toLowerCase(),
        idAttribute: el.id || '',
        classes    : Array.from(el.classList),
        text       : (el.innerText || '').slice(0, 300),
        note,
        pageUrl    : window.location.href,
        pageTitle  : document.title,
        context    : getDOMContext(el),
      };
      this.annotations.push(annotation);
      this._save();
      this.toolbar.updateCount(this.annotations.length);
      this.badges.rebuildAll(this.annotations);
      this.toast(`✓ Flag #${this.annotations.length} saved`);
    }

    /* ── export JSON ── */
    exportJSON(trigger = true) {
      const out = JSON.stringify({
        meta: {
          tool   : 'UI-Referee',
          version: VERSION,
          cdn    : CDN_URL,
          github : 'https://github.com/idiotinnovators/ui-referee',
        },
        page: {
          url  : window.location.href,
          title: document.title,
        },
        annotations: this.annotations,
      }, null, 2);
      if (trigger) {
        downloadFile('ui-referee-annotations.json', out);
        this.toast('✓ Downloaded ui-referee-annotations.json');
      }
      return out;
    }

    /* ── export AI prompt ── */
    exportPrompt(trigger = true) {
      const lines = [
        '# UI-Referee — AI Agent Change Request',
        '',
        'You are an expert frontend developer modifying a live webpage.',
        'Below are flagged UI elements with specific change instructions.',
        'Implement all changes, producing production-ready code.',
        '',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        'PAGE CONTEXT',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        `Title : ${document.title}`,
        `URL   : ${window.location.href}`,
        `Flags : ${this.annotations.length}`,
        '',
      ];

      this.annotations.forEach((ann, i) => {
        lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        lines.push(`FLAG ${i + 1} of ${this.annotations.length}`);
        lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        lines.push('');
        lines.push(`Selector   : ${ann.selector}`);
        lines.push(`Tag        : <${ann.tag}>`);
        if (ann.idAttribute) lines.push(`ID         : #${ann.idAttribute}`);
        if (ann.classes.length) lines.push(`Classes    : ${ann.classes.join(' ')}`);
        lines.push(`Flagged At : ${new Date(ann.timestamp).toISOString()}`);
        lines.push('');
        lines.push('── Current Text ──');
        lines.push(ann.text || '(no visible text)');
        lines.push('');
        lines.push('── Current HTML ──');
        lines.push((ann.context?.outerHTML || '').slice(0, 900));
        lines.push('');
        if (ann.context?.boundingRect) {
          const r = ann.context.boundingRect;
          lines.push(`── Bounding Box — top:${r.top}px left:${r.left}px ${r.width}×${r.height}px ──`);
          lines.push('');
        }
        lines.push('── Requested Change ──');
        lines.push(ann.note);
        lines.push('');
      });

      lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      lines.push('INSTRUCTIONS');
      lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      lines.push('');
      lines.push('1. Implement every flagged change above.');
      lines.push('2. Use the CSS selector provided to target each element precisely.');
      lines.push('3. Return production-ready code (HTML/CSS/JS as appropriate).');
      lines.push('4. Prefer minimal diffs; only output what changes.');
      lines.push('5. If a framework (React, Vue, etc.) is detected, match its patterns.');
      lines.push('');
      lines.push(`── Generated by UI-Referee v${VERSION} · ${CDN_URL} ──`);

      const str = lines.join('\n');
      if (trigger) {
        copyToClipboard(str).then(() => this.toast('✓ Prompt copied — paste into your AI agent'));
      }
      return str;
    }

    /* ── clear ── */
    clear() {
      this.annotations = [];
      this._save();
      this.badges.clearAll();
      this.toolbar.updateCount(0);
      this.toast('✓ All flags cleared');
    }

    /* ── toast ── */
    toast(msg, type = 'ok', ms = 2800) {
      let t = document.getElementById('uir-toast');
      if (!t) {
        t = document.createElement('div');
        t.id = 'uir-toast';
        document.body.appendChild(t);
      }
      clearTimeout(this._toastTimer);
      t.textContent = msg;
      t.className = 'uir-show' + (type === 'warn' ? ' uir-warn' : '');
      this._toastTimer = setTimeout(() => { t.className = ''; }, ms);
    }

    /* ── persistence ── */
    _save() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.annotations)); } catch (_) {}
    }
    _load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        this.annotations = JSON.parse(raw);
        this.toolbar.updateCount(this.annotations.length);
        setTimeout(() => this.badges.rebuildAll(this.annotations), 300);
      } catch (_) {}
    }
  }

  /* ─────────────────────────────────────────────────────────────
   * 9.  BOOTSTRAP & PUBLIC API
   * ───────────────────────────────────────────────────────────── */
  const sdk = new UIRefereeSDK();

  global.UIReferee = {
    version       : VERSION,
    init          : ()  => sdk.init(),
    enable        : ()  => sdk.enable(),
    disable       : ()  => sdk.disable(),
    exportJSON    : ()  => sdk.exportJSON(true),
    exportPrompt  : ()  => sdk.exportPrompt(true),
    clear         : ()  => sdk.clear(),
    getAnnotations: ()  => [...sdk.annotations],
    _sdk          : sdk,
  };

  /* Auto-init */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => sdk.init());
  } else {
    sdk.init();
  }

})(window);
