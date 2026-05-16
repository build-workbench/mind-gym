---
title: System Overview
description: High-level summary of the Mind Gym application and docs stack.
---

# System Overview

Mind Gym ships as a static, browser-first application: vanilla JavaScript drives gameplay, Tailwind CSS provides styling, and localStorage plus a service worker provide persistence and offline capability. The whitepaper site mirrors that simplicity by using VitePress as a lightweight publishing layer.

At a high level, the runtime splits concerns between persistent settings, runtime game state, and mode-specific state. That separation keeps the core loop understandable while still supporting multiple training modes from one app shell.
