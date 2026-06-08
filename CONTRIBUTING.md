# Contributing to UI-Referee

Thank you for your interest in contributing! UI-Referee is intentionally kept as a **single-file, zero-dependency** project. Please keep that constraint in mind before proposing changes.

---

## Ground Rules

- **Single file** — all code lives in `ui-referee.js`. No build pipeline, no `node_modules`.
- **No external dependencies** — pure ES6 only.
- **Backwards compatible** — the `window.UIReferee` public API must not break between minor versions.
- **Browser support** — Chrome 90+, Firefox 88+, Safari 14+, Edge 90+.

---

## How to Contribute

### 1. Fork & Clone

```bash
git clone https://github.com/idiotinnovators/ui-referee.git
cd ui-referee
```

### 2. Make Changes

Edit `ui-referee.js` directly. The file is structured in clearly labelled sections (0–9), mirroring the order: constants → utilities → styles → components → core SDK → bootstrap.

### 3. Test Locally

```bash
# Open the demo page in your browser
open examples/basic.html

# Or serve with any static server
npx serve .
python3 -m http.server 8080
```

Test on Chrome, Firefox, and Safari before submitting.

### 4. Open a Pull Request

- One logical change per PR.
- Describe what problem you're solving and how.
- Include before / after screenshots or a screen recording if UI is affected.

---

## Reporting Bugs

Open an issue using the **Bug Report** template. Please include:

- Browser and version
- Steps to reproduce
- Expected vs actual behaviour
- A minimal HTML snippet that triggers the bug (if possible)

---

## Feature Requests

Open an issue using the **Feature Request** template. Describe the use case — not just the feature — so we can find the best solution together.

---

## Code Style

- 2-space indentation
- `const` / `let` (never `var`)
- Prefer class methods over loose functions for stateful components
- Keep comments terse but clear — the section headers and class names should do most of the talking

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
