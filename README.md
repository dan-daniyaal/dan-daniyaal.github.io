# Daniyaal Baquer: Portfolio

My personal portfolio: a sharp, Naruto-inspired site for my work as an Information Systems Engineering student at Stony Brook.

**Live:** https://dan-daniyaal.github.io _(coming soon)_

## Features
- **Hand-sign intro**: 子 丑 寅 卯 辰 → 解 (release), then a diagonal slash reveals the page. Plays once per visit and is skipped for reduced-motion users.
- **Shuriken cursor** that spins faster the faster you move (desktop only).
- **Ninja registration card** hero with a stamped 合格 seal.
- **Projects as scrolls** with S / A / B rank seals.
- **Skills as the five chakra natures**: 風 AI · 火 Front-end · 雷 Systems · 土 Data · 水 Leadership.
- **Résumé summoning scroll** that unrolls, stamps, then downloads the PDF.
- **Easter egg**: type `rasengan`.

## Tech
Plain **HTML, CSS and JavaScript**, with no framework or build step.
- `index.html`: page structure and content
- `css/styles.css`: design tokens, layout, animations
- `js/main.js`: intro, cursor, scroll reveals, nav, résumé scroll, easter egg

Accessible by default: semantic HTML, keyboard focus styles, a skip link, `prefers-reduced-motion` support, and a responsive layout from phone to desktop.

## Run locally
```bash
python -m http.server 5500
```
Then open http://localhost:5500.

Built with [Claude Code](https://claude.com/claude-code).
