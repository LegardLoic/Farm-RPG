import type {
  BlacksmithOfferState,
  VillageCropBuybackOfferState,
  VillageSeedOfferState,
} from '../gameScene.types';

export type ShopValueParsers = {
  asRecord: (value: unknown) => Record<string, unknown> | null;
  asString: (value: unknown) => string | null;
  asNumber: (value: unknown) => number | null;
};

export type VillageMarketPayloadState = {
  unlocked: boolean;
  seedOffers: VillageSeedOfferState[];
  cropBuybackOffers: VillageCropBuybackOfferState[];
};

export function normalizeBlacksmithPayload(
  payload: unknown,
  parsers: ShopValueParsers,
): { offers: BlacksmithOfferState[] } {
  const payloadRecord = parsers.asRecord(payload);
  if (!payloadRecord) {
    return { offers: [] };
  }

  const shop = parsers.asRecord(payloadRecord.shop);
  if (!shop) {
    return { offers: [] };
  }

  const rawOffers = shop.offers;
  if (!Array.isArray(rawOffers)) {
    return { offers: [] };
  }

  const offers = rawOffers
    .map((entry) => normalizeBlacksmithOffer(entry, parsers))
    .filter((entry): entry is BlacksmithOfferState => entry !== null);

  return { offers };
}

export function normalizeVillageMarketPayload(
  payload: unknown,
  parsers: ShopValueParsers,
): VillageMarketPayloadState {
  const payloadRecord = parsers.asRecord(payload);
  if (!payloadRecord) {
    return {
      unlocked: false,
      seedOffers: [],
      cropBuybackOffers: [],
    };
  }

  const shop = parsers.asRecord(payloadRecord.shop);
  if (!shop) {
    return {
      unlocked: false,
      seedOffers: [],
      cropBuybackOffers: [],
    };
  }

  const rawSeedOffers = Array.isArray(shop.seedOffers) ? shop.seedOffers : [];
  const rawBuybackOffers = Array.isArray(shop.cropBuybackOffers) ? shop.cropBuybackOffers : [];

  return {
    unlocked: Boolean(shop.unlocked),
    seedOffers: rawSeedOffers
      .map((entry) => normalizeVillageSeedOffer(entry, parsers))
      .filter((entry): entry is VillageSeedOfferState => entry !== null),
    cropBuybackOffers: rawBuybackOffers
      .map((entry) => normalizeVillageCropBuybackOffer(entry, parsers))
      .filter((entry): entry is VillageCropBuybackOfferState => entry !== null),
  };
}

function normalizeBlacksmithOffer(value: unknown, parsers: ShopValueParsers): BlacksmithOfferState | null {
  const record = parsers.asRecord(value);
  if (!record) {
    return null;
  }

  const offerKey = parsers.asString(record.offerKey);
  const itemKey = parsers.asString(record.itemKey);
  const name = parsers.asString(record.name);
  const description = parsers.asString(record.description);
  const goldPrice = parsers.asNumber(record.goldPrice);
  const tierRaw = parsers.asNumber(record.tier);
  const requiredFlags = Array.isArray(record.requiredFlags)
    ? record.requiredFlags
        .map((entry) => parsers.asString(entry))
        .filter((entry): entry is string => entry !== null)
    : [];

  if (!offerKey || !itemKey || !name || !description || goldPrice === null) {
    return null;
  }

  const tier = tierRaw === 2 || tierRaw === 3 ? tierRaw : 1;

  return {
    offerKey,
    itemKey,
    name,
    description,
    goldPrice: Math.max(0, Math.round(goldPrice)),
    tier,
    requiredFlags,
  };
}

function normalizeVillageSeedOffer(value: unknown, parsers: ShopValueParsers): VillageSeedOfferState | null {
  const record = parsers.asRecord(value);
  if (!record) {
    return null;
  }

  const offerKey = parsers.asString(record.offerKey);
  const itemKey = parsers.asString(record.itemKey);
  const name = parsers.asString(record.name);
  const description = parsers.asString(record.description);
  const goldPrice = parsers.asNumber(record.goldPrice);

  if (!offerKey || !itemKey || !name || !description || goldPrice === null) {
    return null;
  }

  return {
    offerKey,
    itemKey,
    name,
    description,
    goldPrice: Math.max(0, Math.round(goldPrice)),
  };
}

function normalizeVillageCropBuybackOffer(
  value: unknown,
  parsers: ShopValueParsers,
): VillageCropBuybackOfferState | null {
  const record = parsers.asRecord(value);
  if (!record) {
    return null;
  }

  const itemKey = parsers.asString(record.itemKey);
  const name = parsers.asString(record.name);
  const description = parsers.asString(record.description);
  const goldValue = parsers.asNumber(record.goldValue);
  const ownedQuantity = parsers.asNumber(record.ownedQuantity);

  if (!itemKey || !name || !description || goldValue === null || ownedQuantity === null) {
    return null;
  }

  return {
    itemKey,
    name,
    description,
    goldValue: Math.max(0, Math.round(goldValue)),
    ownedQuantity: Math.max(0, Math.round(ownedQuantity)),
  };
}

export type ValueParsers = {
  asRecord: (value: unknown) => Record<string, unknown> | null;
  asString: (value: unknown) => string | null;
  asNumber: (value: unknown) => number | null;
};

export type FarmStoryTriggerType = 'day' | 'harvest_total';

export type FarmStoryEventState = {
  key: string;
  flagKey: string;
  triggerType: FarmStoryTriggerType;
  target: number;
  progress: number;
  unlocked: boolean;
  title: string;
  narrative: string;
};

export type FarmStoryState = {
  farmUnlocked: boolean;
  day: number;
  harvestTotal: number;
  unlockedEvents: number;
  totalEvents: number;
  activeEventKey: string | null;
  activeEventTitle: string;
  activeEventNarrative: string;
  events: FarmStoryEventState[];
};

export type TowerStoryEventState = {
  key: string;
  milestoneFloor: number;
  milestoneFlagKey: string;
  reportFlagKey: string;
  reached: boolean;
  reported: boolean;
  title: string;
  narrative: string;
};

export type TowerStoryState = {
  highestFloor: number;
  reachedEvents: number;
  reportedEvents: number;
  totalEvents: number;
  activeEventKey: string | null;
  activeEventTitle: string;
  activeEventNarrative: string;
  events: TowerStoryEventState[];
};

export type FarmCraftIngredientState = {
  itemKey: string;
  requiredQuantity: number;
  ownedQuantity: number;
};

export type FarmCraftRecipeState = {
  recipeKey: string;
  name: string;
  description: string;
  outputItemKey: string;
  outputQuantity: number;
  requiredFlags: string[];
  unlocked: boolean;
  ingredients: FarmCraftIngredientState[];
  maxCraftable: number;
};

export type FarmCraftingState = {
  unlocked: boolean;
  recipes: FarmCraftRecipeState[];
  craftableRecipes: number;
};

export type FarmCropCatalogEntryState = {
  cropKey: string;
  seedItemKey: string;
  harvestItemKey: string;
  growthDays: number;
  requiredFlags: string[];
  unlocked: boolean;
};

export type FarmPlotState = {
  plotKey: string;
  row: number;
  col: number;
  cropKey: string | null;
  plantedDay: number | null;
  growthDays: number | null;
  wateredToday: boolean;
  growthProgressDays: number;
  daysToMaturity: number | null;
  readyToHarvest: boolean;
};

export type FarmState = {
  unlocked: boolean;
  totalPlots: number;
  plantedPlots: number;
  wateredPlots: number;
  readyPlots: number;
  cropCatalog: FarmCropCatalogEntryState[];
  plots: FarmPlotState[];
};

export type LoopPreparationState = {
  active: boolean;
  hpBoostActive: boolean;
  mpBoostActive: boolean;
  attackBoostActive: boolean;
  ready: boolean;
  blockers: string[];
  nextStep: string;
};

export type GameplayLoopState = {
  stageKey: 'tower_bootstrap' | 'village_sync' | 'farm_scale' | 'combat_mastery';
  stageLabel: string;
  farmUnlocked: boolean;
  villageMarketUnlocked: boolean;
  supplies: {
    healingHerb: number;
    manaTonic: number;
  };
  relationshipAverage: number;
  preparation: LoopPreparationState;
};

export function normalizeGameplayFarmStoryPayload(payload: unknown, parsers: ValueParsers): FarmStoryState | null {
  const root = parsers.asRecord(payload);
  if (!root) {
    return null;
  }

  const storyRecord = parsers.asRecord(root.farmStory) ?? parsers.asRecord(root.farm_story) ?? null;
  if (!storyRecord) {
    return null;
  }

  const day = parsers.asNumber(storyRecord.day);
  const harvestTotal = parsers.asNumber(storyRecord.harvestTotal);
  const unlockedEvents = parsers.asNumber(storyRecord.unlockedEvents);
  const totalEvents = parsers.asNumber(storyRecord.totalEvents);
  const activeEventKeyRaw = parsers.asString(storyRecord.activeEventKey);
  const activeEventTitle = parsers.asString(storyRecord.activeEventTitle);
  const activeEventNarrative = parsers.asString(storyRecord.activeEventNarrative);
  const eventsRaw = Array.isArray(storyRecord.events) ? storyRecord.events : null;

  if (
    day === null ||
    harvestTotal === null ||
    unlockedEvents === null ||
    totalEvents === null ||
    !activeEventTitle ||
    !activeEventNarrative ||
    !eventsRaw
  ) {
    return null;
  }

  const events = eventsRaw
    .map((entry) => normalizeFarmStoryEventEntry(entry, parsers))
    .filter((entry): entry is FarmStoryEventState => entry !== null);

  return {
    farmUnlocked: Boolean(storyRecord.farmUnlocked),
    day: Math.max(1, Math.round(day)),
    harvestTotal: Math.max(0, Math.round(harvestTotal)),
    unlockedEvents: Math.max(0, Math.round(unlockedEvents)),
    totalEvents: Math.max(0, Math.round(totalEvents)),
    activeEventKey: activeEventKeyRaw ? activeEventKeyRaw : null,
    activeEventTitle,
    activeEventNarrative,
    events,
  };
}

export function normalizeFarmStoryEventEntry(payload: unknown, parsers: ValueParsers): FarmStoryEventState | null {
  const record = parsers.asRecord(payload);
  if (!record) {
    return null;
  }

  const key = parsers.asString(record.key);
  const flagKey = parsers.asString(record.flagKey);
  const triggerTypeRaw = parsers.asString(record.triggerType)?.trim().toLowerCase();
  const target = parsers.asNumber(record.target);
  const progress = parsers.asNumber(record.progress);
  const title = parsers.asString(record.title);
  const narrative = parsers.asString(record.narrative);

  if (
    !key ||
    !flagKey ||
    !triggerTypeRaw ||
    (triggerTypeRaw !== 'day' && triggerTypeRaw !== 'harvest_total') ||
    target === null ||
    progress === null ||
    !title ||
    !narrative
  ) {
    return null;
  }

  return {
    key,
    flagKey,
    triggerType: triggerTypeRaw,
    target: Math.max(1, Math.round(target)),
    progress: Math.max(0, Math.round(progress)),
    unlocked: Boolean(record.unlocked),
    title,
    narrative,
  };
}

export function normalizeGameplayTowerStoryPayload(payload: unknown, parsers: ValueParsers): TowerStoryState | null {
  const root = parsers.asRecord(payload);
  if (!root) {
    return null;
  }

  const storyRecord = parsers.asRecord(root.towerStory) ?? parsers.asRecord(root.tower_story) ?? null;
  if (!storyRecord) {
    return null;
  }

  const highestFloor = parsers.asNumber(storyRecord.highestFloor);
  const reachedEvents = parsers.asNumber(storyRecord.reachedEvents);
  const reportedEvents = parsers.asNumber(storyRecord.reportedEvents);
  const totalEvents = parsers.asNumber(storyRecord.totalEvents);
  const activeEventKeyRaw = parsers.asString(storyRecord.activeEventKey);
  const activeEventTitle = parsers.asString(storyRecord.activeEventTitle);
  const activeEventNarrative = parsers.asString(storyRecord.activeEventNarrative);
  const eventsRaw = Array.isArray(storyRecord.events) ? storyRecord.events : null;
  if (
    highestFloor === null ||
    reachedEvents === null ||
    reportedEvents === null ||
    totalEvents === null ||
    !activeEventTitle ||
    !activeEventNarrative ||
    !eventsRaw
  ) {
    return null;
  }

  const events = eventsRaw
    .map((entry) => normalizeTowerStoryEventEntry(entry, parsers))
    .filter((entry): entry is TowerStoryEventState => entry !== null);

  return {
    highestFloor: Math.max(1, Math.round(highestFloor)),
    reachedEvents: Math.max(0, Math.round(reachedEvents)),
    reportedEvents: Math.max(0, Math.round(reportedEvents)),
    totalEvents: Math.max(0, Math.round(totalEvents)),
    activeEventKey: activeEventKeyRaw ? activeEventKeyRaw : null,
    activeEventTitle,
    activeEventNarrative,
    events,
  };
}

export function normalizeTowerStoryEventEntry(payload: unknown, parsers: ValueParsers): TowerStoryEventState | null {
  const record = parsers.asRecord(payload);
  if (!record) {
    return null;
  }

  const key = parsers.asString(record.key);
  const milestoneFloor = parsers.asNumber(record.milestoneFloor);
  const milestoneFlagKey = parsers.asString(record.milestoneFlagKey);
  const reportFlagKey = parsers.asString(record.reportFlagKey);
  const title = parsers.asString(record.title);
  const narrative = parsers.asString(record.narrative);
  if (!key || milestoneFloor === null || !milestoneFlagKey || !reportFlagKey || !title || !narrative) {
    return null;
  }

  return {
    key,
    milestoneFloor: Math.max(1, Math.round(milestoneFloor)),
    milestoneFlagKey,
    reportFlagKey,
    reached: Boolean(record.reached),
    reported: Boolean(record.reported),
    title,
    narrative,
  };
}

export function normalizeGameplayFarmPayload(payload: unknown, parsers: ValueParsers): FarmState | null {
  const root = parsers.asRecord(payload);
  if (!root) {
    return null;
  }

  const farmRecord = parsers.asRecord(root.farm) ?? root;
  const totalPlots = parsers.asNumber(farmRecord.totalPlots);
  const plantedPlots = parsers.asNumber(farmRecord.plantedPlots);
  const wateredPlots = parsers.asNumber(farmRecord.wateredPlots);
  const readyPlots = parsers.asNumber(farmRecord.readyPlots);
  const cropCatalogRaw = Array.isArray(farmRecord.cropCatalog) ? farmRecord.cropCatalog : null;
  const plotsRaw = Array.isArray(farmRecord.plots) ? farmRecord.plots : null;

  if (
    totalPlots === null ||
    plantedPlots === null ||
    wateredPlots === null ||
    readyPlots === null ||
    !cropCatalogRaw ||
    !plotsRaw
  ) {
    return null;
  }

  const cropCatalog = cropCatalogRaw
    .map((entry) => normalizeFarmCropCatalogEntry(entry, parsers))
    .filter((entry): entry is FarmCropCatalogEntryState => entry !== null);
  const plots = plotsRaw
    .map((entry) => normalizeFarmPlotState(entry, parsers))
    .filter((entry): entry is FarmPlotState => entry !== null)
    .sort((left, right) => left.row - right.row || left.col - right.col || left.plotKey.localeCompare(right.plotKey));

  return {
    unlocked: Boolean(farmRecord.unlocked),
    totalPlots: Math.max(0, Math.round(totalPlots)),
    plantedPlots: Math.max(0, Math.round(plantedPlots)),
    wateredPlots: Math.max(0, Math.round(wateredPlots)),
    readyPlots: Math.max(0, Math.round(readyPlots)),
    cropCatalog,
    plots,
  };
}

export function normalizeGameplayCraftingPayload(payload: unknown, parsers: ValueParsers): FarmCraftingState | null {
  const root = parsers.asRecord(payload);
  if (!root) {
    return null;
  }

  const craftingRecord = parsers.asRecord(root.crafting) ?? root;
  const recipesRaw = Array.isArray(craftingRecord.recipes) ? craftingRecord.recipes : null;
  const craftableRecipes = parsers.asNumber(craftingRecord.craftableRecipes);
  if (!recipesRaw || craftableRecipes === null) {
    return null;
  }

  const recipes = recipesRaw
    .map((entry) => normalizeFarmCraftRecipeState(entry, parsers))
    .filter((entry): entry is FarmCraftRecipeState => entry !== null);

  return {
    unlocked: Boolean(craftingRecord.unlocked),
    craftableRecipes: Math.max(0, Math.round(craftableRecipes)),
    recipes,
  };
}

export function normalizeGameplayLoopPayload(payload: unknown, parsers: ValueParsers): GameplayLoopState | null {
  const root = parsers.asRecord(payload);
  if (!root) {
    return null;
  }

  const loopRecord = parsers.asRecord(root.loop) ?? root;
  const stageKeyRaw = parsers.asString(loopRecord.stageKey)?.trim().toLowerCase();
  const stageLabel = parsers.asString(loopRecord.stageLabel)?.trim();
  const relationshipAverageRaw = parsers.asNumber(loopRecord.relationshipAverage);
  const supplies = parsers.asRecord(loopRecord.supplies);
  const preparation = parsers.asRecord(loopRecord.preparation);

  if (
    !stageKeyRaw ||
    (stageKeyRaw !== 'tower_bootstrap' &&
      stageKeyRaw !== 'village_sync' &&
      stageKeyRaw !== 'farm_scale' &&
      stageKeyRaw !== 'combat_mastery') ||
    !stageLabel ||
    relationshipAverageRaw === null ||
    !supplies ||
    !preparation
  ) {
    return null;
  }

  const healingHerb = parsers.asNumber(supplies.healingHerb);
  const manaTonic = parsers.asNumber(supplies.manaTonic);
  const nextStep = parsers.asString(preparation.nextStep)?.trim();
  if (healingHerb === null || manaTonic === null || !nextStep) {
    return null;
  }

  const blockers = Array.isArray(preparation.blockers)
    ? preparation.blockers
        .map((entry) => parsers.asString(entry)?.trim() ?? '')
        .filter((entry) => entry.length > 0)
    : [];

  return {
    stageKey: stageKeyRaw,
    stageLabel,
    farmUnlocked: Boolean(loopRecord.farmUnlocked),
    villageMarketUnlocked: Boolean(loopRecord.villageMarketUnlocked),
    relationshipAverage: Number(relationshipAverageRaw.toFixed(2)),
    supplies: {
      healingHerb: Math.max(0, Math.round(healingHerb)),
      manaTonic: Math.max(0, Math.round(manaTonic)),
    },
    preparation: {
      active: Boolean(preparation.active),
      hpBoostActive: Boolean(preparation.hpBoostActive),
      mpBoostActive: Boolean(preparation.mpBoostActive),
      attackBoostActive: Boolean(preparation.attackBoostActive),
      ready: Boolean(preparation.ready),
      blockers,
      nextStep,
    },
  };
}

export function normalizeFarmCraftRecipeState(payload: unknown, parsers: ValueParsers): FarmCraftRecipeState | null {
  const record = parsers.asRecord(payload);
  if (!record) {
    return null;
  }

  const recipeKey = parsers.asString(record.recipeKey);
  const name = parsers.asString(record.name);
  const description = parsers.asString(record.description);
  const outputItemKey = parsers.asString(record.outputItemKey);
  const outputQuantity = parsers.asNumber(record.outputQuantity);
  const maxCraftable = parsers.asNumber(record.maxCraftable);
  const requiredFlags = Array.isArray(record.requiredFlags)
    ? record.requiredFlags
        .map((entry) => parsers.asString(entry))
        .filter((entry): entry is string => entry !== null)
    : [];
  const ingredientsRaw = Array.isArray(record.ingredients) ? record.ingredients : null;

  if (
    !recipeKey ||
    !name ||
    !description ||
    !outputItemKey ||
    outputQuantity === null ||
    maxCraftable === null ||
    !ingredientsRaw
  ) {
    return null;
  }

  const ingredients = ingredientsRaw
    .map((entry) => normalizeFarmCraftIngredientState(entry, parsers))
    .filter((entry): entry is FarmCraftIngredientState => entry !== null);

  return {
    recipeKey,
    name,
    description,
    outputItemKey,
    outputQuantity: Math.max(1, Math.round(outputQuantity)),
    requiredFlags,
    unlocked: Boolean(record.unlocked),
    ingredients,
    maxCraftable: Math.max(0, Math.round(maxCraftable)),
  };
}

export function normalizeFarmCraftIngredientState(
  payload: unknown,
  parsers: ValueParsers,
): FarmCraftIngredientState | null {
  const record = parsers.asRecord(payload);
  if (!record) {
    return null;
  }

  const itemKey = parsers.asString(record.itemKey);
  const requiredQuantity = parsers.asNumber(record.requiredQuantity);
  const ownedQuantity = parsers.asNumber(record.ownedQuantity);
  if (!itemKey || requiredQuantity === null || ownedQuantity === null) {
    return null;
  }

  return {
    itemKey,
    requiredQuantity: Math.max(1, Math.round(requiredQuantity)),
    ownedQuantity: Math.max(0, Math.round(ownedQuantity)),
  };
}

export function normalizeFarmCropCatalogEntry(
  payload: unknown,
  parsers: ValueParsers,
): FarmCropCatalogEntryState | null {
  const record = parsers.asRecord(payload);
  if (!record) {
    return null;
  }

  const cropKey = parsers.asString(record.cropKey);
  const seedItemKey = parsers.asString(record.seedItemKey);
  const harvestItemKey = parsers.asString(record.harvestItemKey);
  const growthDays = parsers.asNumber(record.growthDays);
  const requiredFlags = Array.isArray(record.requiredFlags)
    ? record.requiredFlags
        .map((entry) => parsers.asString(entry))
        .filter((entry): entry is string => entry !== null)
    : [];

  if (!cropKey || !seedItemKey || !harvestItemKey || growthDays === null) {
    return null;
  }

  return {
    cropKey,
    seedItemKey,
    harvestItemKey,
    growthDays: Math.max(1, Math.round(growthDays)),
    requiredFlags,
    unlocked: Boolean(record.unlocked),
  };
}

export function normalizeFarmPlotState(payload: unknown, parsers: ValueParsers): FarmPlotState | null {
  const record = parsers.asRecord(payload);
  if (!record) {
    return null;
  }

  const plotKey = parsers.asString(record.plotKey);
  const row = parsers.asNumber(record.row);
  const col = parsers.asNumber(record.col);
  const cropKey = parsers.asString(record.cropKey);
  const plantedDay = parsers.asNumber(record.plantedDay);
  const growthDays = parsers.asNumber(record.growthDays);
  const growthProgressDays = parsers.asNumber(record.growthProgressDays);
  const daysToMaturity = parsers.asNumber(record.daysToMaturity);

  if (!plotKey || row === null || col === null || growthProgressDays === null) {
    return null;
  }

  return {
    plotKey,
    row: Math.max(1, Math.round(row)),
    col: Math.max(1, Math.round(col)),
    cropKey: cropKey ?? null,
    plantedDay: plantedDay === null ? null : Math.max(1, Math.round(plantedDay)),
    growthDays: growthDays === null ? null : Math.max(1, Math.round(growthDays)),
    wateredToday: Boolean(record.wateredToday),
    growthProgressDays: Math.max(0, Math.round(growthProgressDays)),
    daysToMaturity: daysToMaturity === null ? null : Math.max(0, Math.round(daysToMaturity)),
    readyToHarvest: Boolean(record.readyToHarvest),
  };
}

