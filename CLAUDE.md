# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

치킨게임 — a browser shooting game (~10 min playthrough) built with **Phaser 3** and bundled by **Vite**. The player ("꼬꼬") shoots eggs at enemies across stages and a boss fight. Deployed to GitHub Pages.

## Commands

```bash
npm run dev       # Vite dev server (hot reload)
npm run build     # Production build to ./dist
npm run preview   # Preview the production build
```

There is no test suite, linter, or formatter configured. Pushing to `main` triggers `.github/workflows/build.yml`, which runs `npm run build` and deploys `./dist` to GitHub Pages. `vite.config.js` sets `base: "/chicken-game/"`, so production assets resolve under that path.

## Architecture

### Scene flow

Entry is [src/main.js](src/main.js), which configures the Phaser `Game` (canvas sized to `window.innerWidth/Height`, `Scale.FIT`, arcade physics, no gravity) and registers all scenes. The play order:

```
Preloader → MenuScene → FirstScene → SecondScene → BossScene → GameClearScene
                              ↘ (on death) GameOverScene ↗
```

- **HudScene** runs *in parallel* with gameplay scenes (started alongside FirstScene), not in sequence. It owns the lives/points/time/effects display and is reached via `this.scene.get("HudScene")`.
- **Preloader** ([src/preloader.js](src/preloader.js)) loads every asset (sprites, audio, fonts, backgrounds) from `/public/assets` and defines all animations. New assets must be registered here.

### Scene inheritance

```
BaseScene (src/scenes/BaseScene.js)
├── NormalScene (spawn timers, difficulty ramp, "walk off right edge → next stage")
│   ├── FirstScene  (pigs only)
│   └── SecondScene (pigs + 30% cats)
└── BossScene (GoldPig boss with bullet-hell patterns)
```

- **BaseScene** holds the shared gameplay loop: player creation, input (arrow keys + WASD, space to fire), collisions, heart/item spawning, life loss, and HUD wiring. Override hooks: `getBackground()` (required) and `completeStage()`.
- **NormalScene** adds the time-based difficulty system (`getSpawnConfig()` / `applySpawnConfig()` let each stage tune spawn delay, monster speed, and spawn tiers). Each concrete stage overrides `getSpawnConfig()`, `getBackground()`, `spawnSingleMonster()`, and `startNextRound(nextSceneKey)`.

### Player state carries across scenes

The player's upgrades persist between stages. `BaseScene.startNextRound()` passes `player`, `points`, `lives`, `heldItem`, and **`timedEffectsRemaining`** into the next scene's `init(data)`. Timed effects (e.g. PowerEgg) are re-scheduled in the new scene via `scheduleTimedEffectRemoval()` so their countdown continues rather than resetting — this is the subtle part: a timed buff is a `delayedCall` timer that must be torn down and recreated with the remaining duration on every scene transition.

### Effect / item system

Player stats are **derived**, never mutated directly. [src/gameobjects/Player.js](src/gameobjects/Player.js):

- `activeEffects` (e.g. `{ bullet, eggSpeed, speed, eggSize, powerEgg }`) is the source of truth.
- `addEffect`/`removeEffect`/`addTimedEffect` change the counters, then `recomputeStatsFromEffects()` recalculates `bulletDamage`, `bulletSpeed`, `fireDelay`, `speed`, `eggSize` from base values. To change how an upgrade affects the player, edit `recomputeStatsFromEffects()`, not the individual stats.

Items are config-driven:
- [src/config/items.js](src/config/items.js) — `ITEM_DEFS` (texture/frame, `effectKey`, `maxStacks`, `apply`/`remove`, `allowedMonsters`) and `MAX_STACK` caps.
- [src/config/loot.js](src/config/loot.js) — per-monster drop rates, the weighted drop table, and the filter that excludes maxed-out or monster-restricted items. PowerEgg has an extra rarity gate.

When adding an item: add a `ITEM_DEFS` entry, an `MAX_STACK` cap, a drop-table row in loot.js, and (if it changes a stat) wire its `effectKey` into `recomputeStatsFromEffects()`.

### Monsters & boss

`Monster` ([src/gameobjects/monsters/Monster.js](src/gameobjects/monsters/Monster.js)) is the base (`hit(damage)` returns whether killed). `Pig`/`Cat` are normal enemies. `GoldPig` is the boss: it owns a bullet group and an array of `pattern*` methods cycled by `startNextPattern()`, with an `ultimatePattern` unlocked at half health. Boss health lives in [src/config/monster.js](src/config/monster.js) (`BOSS_HEALTH`). The boss reports HP via the scene's `bossHealthChanged` event → `BossHealthBar`.

### i18n

[src/i18n/i18n.js](src/i18n/i18n.js) wraps i18next (KO default, EN fallback, language persisted to `localStorage`). Use `t("key")` for all user-facing text; locale strings live in [src/i18n/locales/](src/i18n/locales/). Scenes that display text subscribe via `onLanguageChanged()` and re-set their text in a `refreshTexts()` handler (see MenuScene) — remember to unsubscribe in `shutdown()`.

### Sound

`SoundManager` is created once in the Preloader and stored in `game.registry` (`registry.get("soundManager")`). Scenes call `soundManager.changeBGM("bgmN")` and `playSound(key, opts)`.

## Conventions

- Code is **4-space indent, CRLF, UTF-8** (`.editorconfig`). Comments and commit messages are in Korean.
- Assets are referenced by the keys registered in the Preloader, loaded relative to the `assets` path; physical files live in `public/assets/`.
- `MenuScene` contains commented-out test shortcuts (jump straight to BossScene with maxed items) — useful for manual testing.
- For QA, the Preloader can jump straight to a scene via URL query params ([src/debug/debugEntry.js](src/debug/debugEntry.js), `tryStartDebugScene`): `?scene=boss` (aliases `first`/`second`/`boss`/`menu`), and `?scene=boss&items=max` to also inject maxed-out effects. Gameplay scenes also start HudScene in parallel. Dev-build only (`import.meta.env.DEV`) — guarded so production is unaffected; unknown scene keys fall back to MenuScene.
