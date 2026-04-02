export type HudBindingResult = {
  // Map of key to bound element references, to be specialized during extraction.
  elements: Record<string, Element | null>;
};

// Reserved for future extraction of HUD querySelector bindings from GameScene.
export function bindHudElements(root: ParentNode): HudBindingResult {
  return { elements: { root: root as Element | null } };
}
