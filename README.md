# Aura Platinum Financial & Benefits Catalog

A modularized HTML catalog for the Aura Platinum financial and benefits experience.

## Project structure

- `index.html` — semantic page markup and dependency loading
- `assets/css/styles.css` — extracted page-level CSS
- `assets/js/tailwind-config.js` — Tailwind theme configuration
- `assets/js/app.js` — catalog interactions and application behavior

## Run locally

Open `index.html` in a browser. The page uses external CDN assets, so an internet connection is required for those dependencies.

## Refactor notes

The embedded CSS and both inline JavaScript blocks have been separated into focused files. Script order and the original markup are preserved, and classic scripts remain in place so existing global functions and inline event handlers continue to work.

This is a static front-end project; authentication and any sensitive-looking sample/customer data in the original source should be treated as demo content unless connected to real backend services.
