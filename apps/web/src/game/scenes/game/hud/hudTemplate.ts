export type HudTemplateFactory = () => string;

// Reserved for future extraction of the inline HUD markup from GameScene.
export const createHudTemplate: HudTemplateFactory = () => '';
