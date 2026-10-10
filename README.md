# Aura Platinum Financial & Benefits Catalog

A modularized HTML catalog for the Aura Platinum financial and benefits experience.

## Project structure

- `index.html` — page markup and external dependency loading
- `assets/css/styles.css` — extracted page-level styles
- `assets/js/inline-script-01.js` — Tailwind configuration and early page setup
- `assets/js/inline-script-02.js` — catalog interactions and application behavior

## Run locally

Open `index.html` in a browser. The page uses external CDN assets, so an internet connection is required for those dependencies.

## Notes

This refactor separates embedded CSS and JavaScript into maintainable files while preserving the original script order and page markup. Inline event handlers remain in the HTML and call global functions from the classic scripts.
