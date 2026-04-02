import type { FarmCraftingState, FarmPlotState, FarmState } from '../../services/payloadNormalizers';

export type RenderFarmPanelParams = {
  seedSelect: HTMLSelectElement;
  plotsRoot: HTMLElement;
  isAuthenticated: boolean;
  farmBusy: boolean;
  farmState: FarmState | null;
  selectedSeedItemKey: string;
  selectedPlotKey: string | null;
  formatFarmLabel: (raw: string) => string;
  getFarmPlotPhaseLabel: (plot: FarmPlotState) => string;
  getFarmPlotStatusLabel: (plot: FarmPlotState) => string;
};

export type RenderFarmPanelResult = {
  selectedSeedItemKey: string;
};

export function updateFarmHudValues(params: {
  summaryValue: HTMLElement | null;
  storySummaryValue: HTMLElement | null;
  storyNarrativeValue: HTMLElement | null;
  errorValue: HTMLElement | null;
  sleepButton: HTMLButtonElement | null;
  craftingToggleButton: HTMLButtonElement | null;
  goVillageButton: HTMLButtonElement | null;
  contextSeedValue: HTMLElement | null;
  contextReadyValue: HTMLElement | null;
  contextFeedbackValue: HTMLElement | null;
  summaryLabel: string;
  storySummaryLabel: string;
  storyNarrativeLabel: string;
  farmError: string | null;
  sleepButtonDisabled: boolean;
  sleepButtonLabel: string;
  craftingToggleDisabled: boolean;
  craftingToggleLabel: string;
  goVillageDisabled: boolean;
  selectedSeedLabel: string;
  readyPlotsLabel: string;
  feedbackTone: 'error' | 'info';
  feedbackLabel: string;
}): void {
  if (params.summaryValue) {
    params.summaryValue.textContent = params.summaryLabel;
  }

  if (params.storySummaryValue) {
    params.storySummaryValue.textContent = params.storySummaryLabel;
  }

  if (params.storyNarrativeValue) {
    params.storyNarrativeValue.textContent = params.storyNarrativeLabel;
  }

  if (params.errorValue) {
    params.errorValue.hidden = !params.farmError;
    params.errorValue.textContent = params.farmError ?? '';
  }

  if (params.sleepButton) {
    params.sleepButton.disabled = params.sleepButtonDisabled;
    params.sleepButton.textContent = params.sleepButtonLabel;
  }

  if (params.craftingToggleButton) {
    params.craftingToggleButton.disabled = params.craftingToggleDisabled;
    params.craftingToggleButton.textContent = params.craftingToggleLabel;
  }

  if (params.goVillageButton) {
    params.goVillageButton.disabled = params.goVillageDisabled;
  }

  if (params.contextSeedValue) {
    params.contextSeedValue.textContent = params.selectedSeedLabel;
  }

  if (params.contextReadyValue) {
    params.contextReadyValue.textContent = params.readyPlotsLabel;
  }

  if (params.contextFeedbackValue) {
    params.contextFeedbackValue.dataset.tone = params.feedbackTone;
    params.contextFeedbackValue.textContent = params.feedbackLabel;
  }
}

export function renderFarmPanel(params: RenderFarmPanelParams): RenderFarmPanelResult {
  params.seedSelect.replaceChildren();
  params.plotsRoot.replaceChildren();

  if (!params.isAuthenticated) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Connexion requise';
    params.seedSelect.appendChild(option);
    params.seedSelect.value = '';
    params.seedSelect.disabled = true;

    const item = document.createElement('li');
    item.classList.add('farm-plot-item', 'empty');
    item.textContent = 'Connecte-toi pour gerer les parcelles de la ferme.';
    params.plotsRoot.appendChild(item);
    return { selectedSeedItemKey: '' };
  }

  const farm = params.farmState;
  if (!farm) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = params.farmBusy ? 'Chargement...' : 'Aucune donnee ferme';
    params.seedSelect.appendChild(option);
    params.seedSelect.value = '';
    params.seedSelect.disabled = true;

    const item = document.createElement('li');
    item.classList.add('farm-plot-item', 'empty');
    item.textContent = params.farmBusy ? 'Chargement des parcelles...' : 'Aucune donnee ferme disponible.';
    params.plotsRoot.appendChild(item);
    return { selectedSeedItemKey: '' };
  }

  const unlockedCrops = farm.cropCatalog.filter((entry) => entry.unlocked);
  let selectedSeedItemKey = params.selectedSeedItemKey;
  if (unlockedCrops.length === 0) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Aucune graine debloquee';
    params.seedSelect.appendChild(option);
    selectedSeedItemKey = '';
  } else {
    const unlockedSeedKeys = new Set(unlockedCrops.map((entry) => entry.seedItemKey));
    if (!unlockedSeedKeys.has(selectedSeedItemKey)) {
      const firstUnlocked = unlockedCrops[0];
      selectedSeedItemKey = firstUnlocked ? firstUnlocked.seedItemKey : '';
    }

    for (const crop of unlockedCrops) {
      const option = document.createElement('option');
      option.value = crop.seedItemKey;
      option.textContent = `${params.formatFarmLabel(crop.seedItemKey)} (${crop.growthDays}j)`;
      params.seedSelect.appendChild(option);
    }
  }

  params.seedSelect.value = selectedSeedItemKey;
  params.seedSelect.disabled = params.farmBusy || !farm.unlocked || unlockedCrops.length === 0;

  if (!farm.unlocked) {
    const item = document.createElement('li');
    item.classList.add('farm-plot-item', 'empty');
    item.textContent = 'Ferme verrouillee. Termine l intro (attribution de ferme).';
    params.plotsRoot.appendChild(item);
    return { selectedSeedItemKey };
  }

  if (farm.plots.length === 0) {
    const item = document.createElement('li');
    item.classList.add('farm-plot-item', 'empty');
    item.textContent = params.farmBusy ? 'Chargement des parcelles...' : 'Aucune parcelle configuree.';
    params.plotsRoot.appendChild(item);
    return { selectedSeedItemKey };
  }

  const sortedPlots = [...farm.plots].sort(
    (left, right) => left.row - right.row || left.col - right.col || left.plotKey.localeCompare(right.plotKey),
  );

  for (const plot of sortedPlots) {
    const item = document.createElement('li');
    item.classList.add('farm-plot-item');
    if (plot.readyToHarvest) {
      item.dataset.ready = '1';
    }
    if (!plot.cropKey) {
      item.dataset.empty = '1';
    }
    if (plot.plotKey === params.selectedPlotKey) {
      item.dataset.selected = '1';
    }

    const header = document.createElement('div');
    header.classList.add('farm-plot-header');

    const title = document.createElement('strong');
    title.textContent = `Parcelle ${plot.row}-${plot.col}`;
    header.appendChild(title);

    const badge = document.createElement('span');
    badge.classList.add('farm-plot-meta');
    badge.textContent = params.getFarmPlotPhaseLabel(plot);
    header.appendChild(badge);
    item.appendChild(header);

    const status = document.createElement('p');
    status.classList.add('farm-plot-status');
    status.textContent = params.getFarmPlotStatusLabel(plot);
    item.appendChild(status);

    const actions = document.createElement('div');
    actions.classList.add('farm-plot-actions');

    const focusButton = document.createElement('button');
    focusButton.classList.add('hud-farm-action');
    focusButton.dataset.farmAction = 'select';
    focusButton.dataset.plotKey = plot.plotKey;
    focusButton.textContent = plot.plotKey === params.selectedPlotKey ? 'Ciblee' : 'Cibler';
    focusButton.disabled = params.farmBusy;
    actions.appendChild(focusButton);

    item.appendChild(actions);
    params.plotsRoot.appendChild(item);
  }

  return { selectedSeedItemKey };
}

export function renderFarmCraftingRecipes(params: {
  craftingRoot: HTMLElement;
  isAuthenticated: boolean;
  farmCraftingBusy: boolean;
  farmBusy: boolean;
  craftingState: FarmCraftingState | null;
  formatFarmLabel: (raw: string) => string;
}): void {
  params.craftingRoot.replaceChildren();

  if (!params.isAuthenticated) {
    const item = document.createElement('li');
    item.classList.add('shop-item', 'empty');
    item.textContent = 'Connecte-toi pour utiliser le craft de ferme.';
    params.craftingRoot.appendChild(item);
    return;
  }

  if (params.farmCraftingBusy && !params.craftingState) {
    const item = document.createElement('li');
    item.classList.add('shop-item', 'empty');
    item.textContent = 'Chargement des recettes...';
    params.craftingRoot.appendChild(item);
    return;
  }

  const crafting = params.craftingState;
  if (!crafting) {
    const item = document.createElement('li');
    item.classList.add('shop-item', 'empty');
    item.textContent = 'Aucune donnee de craft disponible.';
    params.craftingRoot.appendChild(item);
    return;
  }

  if (!crafting.unlocked) {
    const item = document.createElement('li');
    item.classList.add('shop-item', 'empty');
    item.textContent = 'Craft verrouille. Termine l attribution de la ferme.';
    params.craftingRoot.appendChild(item);
    return;
  }

  const unlockedRecipes = crafting.recipes.filter((recipe) => recipe.unlocked);
  if (unlockedRecipes.length === 0) {
    const item = document.createElement('li');
    item.classList.add('shop-item', 'empty');
    item.textContent = params.farmCraftingBusy ? 'Mise a jour des recettes...' : 'Aucune recette debloquee.';
    params.craftingRoot.appendChild(item);
    return;
  }

  for (const recipe of unlockedRecipes) {
    const item = document.createElement('li');
    item.classList.add('shop-item', 'farm-crafting-item');

    const header = document.createElement('div');
    header.classList.add('shop-item-header');

    const name = document.createElement('strong');
    name.textContent = recipe.name;
    header.appendChild(name);

    const output = document.createElement('span');
    output.classList.add('shop-price');
    output.textContent = `+${recipe.outputQuantity} ${params.formatFarmLabel(recipe.outputItemKey)}`;
    header.appendChild(output);
    item.appendChild(header);

    const description = document.createElement('p');
    description.classList.add('shop-description');
    description.textContent = recipe.description;
    item.appendChild(description);

    const ingredients = document.createElement('p');
    ingredients.classList.add('farm-crafting-ingredients');
    ingredients.textContent = `Requis: ${recipe.ingredients
      .map((entry) => `${params.formatFarmLabel(entry.itemKey)} ${entry.ownedQuantity}/${entry.requiredQuantity}`)
      .join(' | ')}`;
    item.appendChild(ingredients);

    const craftButton = document.createElement('button');
    craftButton.classList.add('hud-shop-buy');
    craftButton.textContent = `Fabriquer x1 (max ${recipe.maxCraftable})`;
    craftButton.dataset.farmCraftAction = 'craft';
    craftButton.dataset.recipeKey = recipe.recipeKey;
    craftButton.disabled = params.farmCraftingBusy || params.farmBusy || recipe.maxCraftable < 1;
    item.appendChild(craftButton);

    params.craftingRoot.appendChild(item);
  }
}
