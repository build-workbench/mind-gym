---
title: State Architecture
description: Summary of the three-layer state model used by Mind Gym.
---

# State Architecture

The project uses a three-layer state model: settings hold durable preferences, game state coordinates the live session, and mode state captures specialized flows such as N-back or delayed recall. This division reduces accidental coupling and gives each layer a clear testing surface.

The design also reflects the repository's preference for deep modules with small public interfaces. Readers who need more detail should compare this overview with the repository's dedicated state-management design documents and specs.
