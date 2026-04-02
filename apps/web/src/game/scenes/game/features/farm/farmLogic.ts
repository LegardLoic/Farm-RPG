import {
  FARM_LABEL_OVERRIDES,
  FARM_PLOT_LAYOUT_FALLBACK,
  FARM_SCENE_COL_STEP,
  FARM_SCENE_ORIGIN_X,
  FARM_SCENE_ORIGIN_Y,
  FARM_SCENE_ROW_STEP,
} from '../../gameScene.constants';

export type FarmPlotPhase = 'empty' | 'planted' | 'watered' | 'ready';

export type FarmPlotStateLike = {
  plotKey: string;
  row: number;
  col: number;
  cropKey: string | null;
  growthDays: number | null;
  wateredToday: boolean;
  growthProgressDays: number;
  daysToMaturity: number | null;
  readyToHarvest: boolean;
};

export type FarmStateLike = {
  unlocked: boolean;
  totalPlots: number;
  plantedPlots: number;
  readyPlots: number;
  plots: FarmPlotStateLike[];
};

export type FarmStoryStateLike = {
  day: number;
  harvestTotal: number;
  unlockedEvents: number;
  totalEvents: number;
  activeEventTitle: string;
  activeEventNarrative: string;
};

export type FarmCraftRecipeStateLike = {
  unlocked: boolean;
};

export type FarmCraftingStateLike = {
  unlocked: boolean;
  craftableRecipes: number;
  recipes: FarmCraftRecipeStateLike[];
};

export type FarmScenePlotSlotLike = {
  plotKey: string;
  row: number;
  col: number;
  plot: FarmPlotStateLike | null;
};

export function formatFarmLabel(raw: string): string {
  const value = raw.trim().toLowerCase();
  if (value.length === 0) {
    return '-';
  }

  const override = FARM_LABEL_OVERRIDES[value];
  if (override) {
    return override;
  }

  return value
    .split('_')
    .filter((part) => part.length > 0)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

export function getFarmSummaryLabel(input: {
  isAuthenticated: boolean;
  farmBusy: boolean;
  farmState: FarmStateLike | null;
}): string {
  if (!input.isAuthenticated) {
    return 'Connexion requise';
  }

  if (input.farmBusy && !input.farmState) {
    return 'Chargement...';
  }

  if (!input.farmState) {
    return 'Aucune donnee';
  }

  if (!input.farmState.unlocked) {
    return input.farmBusy ? 'Verification debloquage...' : 'Verrouillee';
  }

  return input.farmBusy
    ? 'Mise a jour...'
    : `Pretes ${input.farmState.readyPlots} | Plantees ${input.farmState.plantedPlots}/${input.farmState.totalPlots}`;
}

export function getFarmStorySummaryLabel(input: {
  isAuthenticated: boolean;
  farmBusy: boolean;
  farmStoryState: FarmStoryStateLike | null;
}): string {
  if (!input.isAuthenticated) {
    return 'Scenario ferme: connexion requise';
  }

  if (!input.farmStoryState) {
    return input.farmBusy ? 'Scenario ferme: chargement...' : 'Scenario ferme: aucune donnee';
  }

  const story = input.farmStoryState;
  const progressLabel = `${story.unlockedEvents}/${story.totalEvents} etapes`;
  return `Scenario ferme | ${progressLabel} | Jour ${story.day} | Recoltes ${story.harvestTotal}`;
}

export function getFarmStoryNarrativeLabel(input: {
  isAuthenticated: boolean;
  farmBusy: boolean;
  farmStoryState: FarmStoryStateLike | null;
}): string {
  if (!input.isAuthenticated) {
    return 'Connecte toi pour suivre les beats narratifs lies au rythme de ferme.';
  }

  if (!input.farmStoryState) {
    return input.farmBusy
      ? 'Synchronisation du scenario ferme en cours...'
      : 'Aucun beat narratif ferme charge.';
  }

  return `${input.farmStoryState.activeEventTitle}: ${input.farmStoryState.activeEventNarrative}`;
}

export function getFarmCraftingSummaryLabel(input: {
  isAuthenticated: boolean;
  farmCraftingBusy: boolean;
  farmCraftingState: FarmCraftingStateLike | null;
}): string {
  if (!input.isAuthenticated) {
    return 'Connexion requise';
  }

  if (input.farmCraftingBusy && !input.farmCraftingState) {
    return 'Chargement...';
  }

  if (!input.farmCraftingState) {
    return 'Aucune donnee';
  }

  if (!input.farmCraftingState.unlocked) {
    return input.farmCraftingBusy ? 'Verification debloquage...' : 'Verrouille';
  }

  const unlockedRecipes = input.farmCraftingState.recipes.filter((recipe) => recipe.unlocked).length;
  return input.farmCraftingBusy
    ? 'Mise a jour...'
    : `${input.farmCraftingState.craftableRecipes} craftables | ${unlockedRecipes} recettes`;
}

export function getFarmPlotStatusLabel(plot: FarmPlotStateLike): string {
  if (!plot.cropKey) {
    return 'Parcelle vide. Selectionne une graine puis plante.';
  }

  const cropLabel = formatFarmLabel(plot.cropKey);
  const progress = `${Math.max(0, plot.growthProgressDays)}/${Math.max(1, plot.growthDays ?? 1)}j`;
  const waterLabel = plot.wateredToday ? 'Arrosee aujourd hui' : 'A arroser';
  const maturityLabel = plot.readyToHarvest
    ? 'Prete a recolter'
    : `Maturite: ${Math.max(0, plot.daysToMaturity ?? 0)}j`;

  return `${cropLabel} | Croissance ${progress} | ${waterLabel} | ${maturityLabel}`;
}

export function getFarmPlotPhase(plot: FarmPlotStateLike | null): FarmPlotPhase {
  if (!plot || !plot.cropKey) {
    return 'empty';
  }

  if (plot.readyToHarvest) {
    return 'ready';
  }

  if (plot.wateredToday) {
    return 'watered';
  }

  return 'planted';
}

export function getFarmPlotPhaseLabel(plot: FarmPlotStateLike | null): string {
  const phase = getFarmPlotPhase(plot);
  if (phase === 'ready') {
    return 'Prete';
  }
  if (phase === 'watered') {
    return 'Arrosee';
  }
  if (phase === 'planted') {
    return 'Plantee';
  }

  return 'Vide';
}

export function getSelectedSeedLabel(selectedSeedItemKey: string): string {
  if (!selectedSeedItemKey) {
    return 'Aucune';
  }

  return formatFarmLabel(selectedSeedItemKey);
}

export function getFarmReadyPlotsLabel(farmState: FarmStateLike | null): string {
  if (!farmState || !farmState.unlocked) {
    return 'Ferme verrouillee';
  }

  return `${farmState.readyPlots} pretes / ${farmState.totalPlots}`;
}

export function getFarmFeedbackLabel(input: {
  farmError: string | null;
  farmCraftingError: string | null;
  farmBusy: boolean;
  farmCraftingBusy: boolean;
  farmFeedbackMessage: string | null;
  isAuthenticated: boolean;
  farmUnlocked: boolean;
}): string {
  if (input.farmError) {
    return input.farmError;
  }
  if (input.farmCraftingError) {
    return input.farmCraftingError;
  }
  if (input.farmBusy) {
    return 'Action en cours sur la ferme...';
  }
  if (input.farmCraftingBusy) {
    return 'Craft en cours...';
  }
  if (input.farmFeedbackMessage) {
    return input.farmFeedbackMessage;
  }
  if (!input.isAuthenticated) {
    return 'Connecte-toi pour activer la ferme.';
  }
  if (!input.farmUnlocked) {
    return 'Passe l intro avec le maire pour debloquer la ferme.';
  }

  return 'Clique une parcelle, puis choisis Planter, Arroser ou Recolter.';
}

export function getFarmSceneSlots(farmState: FarmStateLike | null): FarmScenePlotSlotLike[] {
  const byPlotKey = new Map<string, FarmPlotStateLike>();
  if (farmState) {
    for (const plot of farmState.plots) {
      byPlotKey.set(plot.plotKey, plot);
    }
  }

  const slots = FARM_PLOT_LAYOUT_FALLBACK.map<FarmScenePlotSlotLike>((entry) => ({
    plotKey: entry.plotKey,
    row: entry.row,
    col: entry.col,
    plot: byPlotKey.get(entry.plotKey) ?? null,
  }));

  if (farmState && farmState.plots.length > 0) {
    for (const plot of farmState.plots) {
      if (!slots.some((entry) => entry.plotKey === plot.plotKey)) {
        slots.push({
          plotKey: plot.plotKey,
          row: plot.row,
          col: plot.col,
          plot,
        });
      }
    }
  }

  slots.sort((left, right) => left.row - right.row || left.col - right.col || left.plotKey.localeCompare(right.plotKey));
  return slots;
}

export function getFarmScenePlotPosition(slot: FarmScenePlotSlotLike): { x: number; y: number } {
  return {
    x: FARM_SCENE_ORIGIN_X + (slot.col - 1) * FARM_SCENE_COL_STEP,
    y: FARM_SCENE_ORIGIN_Y + (slot.row - 1) * FARM_SCENE_ROW_STEP,
  };
}

export function getFarmScenePlotPalette(
  phase: FarmPlotPhase,
  selected: boolean,
): { frame: number; bed: number; crop: number; badge: string } {
  if (phase === 'ready') {
    return {
      frame: selected ? 0x7f6b2f : 0x6d5a2a,
      bed: 0x78602f,
      crop: 0xd8c37a,
      badge: '#ffeab6',
    };
  }

  if (phase === 'watered') {
    return {
      frame: selected ? 0x375f71 : 0x2f4f5d,
      bed: 0x4d5f4f,
      crop: 0x6eb0d4,
      badge: '#cdeeff',
    };
  }

  if (phase === 'planted') {
    return {
      frame: selected ? 0x44602f : 0x3b532a,
      bed: 0x5f4f2f,
      crop: 0x73ad57,
      badge: '#d2efc2',
    };
  }

  return {
    frame: selected ? 0x5e4a31 : 0x493824,
    bed: 0x6c5234,
    crop: 0x503c29,
    badge: '#c5d0de',
  };
}

export function resolveSelectedFarmPlotKey(
  slots: FarmScenePlotSlotLike[],
  selectedPlotKey: string | null,
): string | null {
  if (slots.length === 0) {
    return null;
  }

  if (selectedPlotKey && slots.some((slot) => slot.plotKey === selectedPlotKey)) {
    return selectedPlotKey;
  }

  const preferred =
    slots.find((slot) => slot.plot?.readyToHarvest) ??
    slots.find((slot) => slot.plot && !slot.plot.cropKey) ??
    slots[0];

  return preferred?.plotKey ?? null;
}

export function getFarmPlotByKey(plotKey: string | null, farmState: FarmStateLike | null): FarmPlotStateLike | null {
  if (!plotKey || !farmState) {
    return null;
  }

  return farmState.plots.find((plot) => plot.plotKey === plotKey) ?? null;
}

export function getFarmSlotByKey(
  slots: FarmScenePlotSlotLike[],
  plotKey: string,
): FarmScenePlotSlotLike | null {
  return slots.find((entry) => entry.plotKey === plotKey) ?? null;
}

