## Repository quick orientation

This repository is a small collection of front-end experiments (plain HTML/CSS/JS) grouped in `Experiment 1`, `Experiment 2`, `Experiment 3`. There is no build system, package manager, or server code — work happens directly in the browser files.

Keep guidance short and focused; use examples below when editing or adding features.

### Big-picture architecture

- Each experiment is a self-contained static UI under `Experiment N/`.
- Files to inspect for behavior: `index.html`, `script.js`, `style.css` inside each experiment folder. Example: `Experiment 2/index.html` + `Experiment 2/script.js` implement a theme toggle using `data-theme` on `<html>` and `localStorage`.
- There are no backend APIs or build steps; changes are visible by opening `index.html` in a browser.

### Common patterns & conventions

- Vanilla JavaScript only: prefer direct DOM APIs (getElementById, addEventListener, dataset) as used in `Experiment 2/script.js`.
- Small in-file data arrays for demo data. Example: `Experiment 3/script.js` keeps a `products` array and filters it in-memory.
- State persistence (when present) uses `localStorage` (see `Experiment 2` theme save).

### Editing guidelines for AI agents

- Make minimal, reviewable changes. Tests and builds are not present, so prefer incremental edits and include a short manual verification step (open the edited `index.html`).
- When adding JS behavior, follow existing style: small functions (`filterProducts`, `displayProducts`), direct DOM updates via `innerHTML`, and event listeners attached with `addEventListener`.
- For UI changes, update `style.css` in the same experiment folder. Keep selectors scoped to the experiment to avoid accidental cross-file reuse.

### Examples to reference in code changes

- Toggle theme: `Experiment 2/script.js` — use `document.documentElement.dataset.theme` and `localStorage.setItem('theme', value)`.
- Product filtering: `Experiment 3/script.js` — keep filter logic pure and call a separate `displayProducts()` to update DOM.

### Developer workflows

- Run / preview: Open the desired `index.html` in a browser. No build or install steps.
- Linting / tests: None exist. Make small, easily revertible commits and include manual verification steps in commit messages.

### Integration points & external dependencies

- There are no external services or package.json. If you add dependencies, include a simple `README` and a `package.json` and document why it was added.

### What NOT to change automatically

- Do not introduce a global build system or assume Node/npm unless the change explicitly adds them and includes a README and package manifest.
- Avoid cross-experiment edits unless consolidating duplicate utilities into a new shared folder with documentation.

### Files to check for any change

- `Experiment 2/index.html`, `Experiment 2/script.js` (theme sample)
- `Experiment 3/index.html`, `Experiment 3/script.js` (filtering sample)
- `Experiment 1/` contains minimal placeholder content; edit if replicating patterns.

If anything here is unclear or you want the instructions expanded (examples for adding tests, or adding a simple dev server), tell me what to include and I will update this file.
