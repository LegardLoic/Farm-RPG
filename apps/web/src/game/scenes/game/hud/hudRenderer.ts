export type HudRenderContext = {
  root: HTMLElement;
};

// Reserved for future extraction of HUD render/update orchestration from GameScene.
export function renderHud(_context: HudRenderContext): void {
  // Intentionally empty for incremental migration.
}
