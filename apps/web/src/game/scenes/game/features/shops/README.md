# Shops feature notes

`villageShopController.ts` is a pure controller scaffold for the village shop panel.

It currently exposes:

- state creation and transitions for open / close / tab / select
- `resolveVillageShopController(...)` for a normalized panel view model
- `resolveVillageShopPrimaryAction(...)` and `resolveVillageShopTalkAction(...)` for UI action branching

This file is intentionally not wired into `GameScene.ts` yet.
