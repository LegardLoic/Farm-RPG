import type {
  AutoSaveState,
  CombatEncounterState,
  CombatStatus,
  CombatTurn,
  CombatUiStatus,
  HeroAppearanceKey,
  HeroProfileState,
  IntroNarrativeState,
  IntroNarrativeStepKey,
  QuestState,
  QuestStatus,
  SaveSlotPreview,
  SaveSlotState,
  VillageNpcHudEntry,
  VillageNpcRelationshipHudEntry,
} from '../gameScene.stateTypes';
import type {
  BlacksmithOfferState,
  VillageCropBuybackOfferState,
  VillageSeedOfferState,
} from '../gameScene.types';
import {
  normalizeBlacksmithPayload as parseBlacksmithPayload,
  normalizeFarmCraftIngredientState as parseFarmCraftIngredientState,
  normalizeFarmCraftRecipeState as parseFarmCraftRecipeState,
  normalizeFarmCropCatalogEntry as parseFarmCropCatalogEntry,
  normalizeFarmPlotState as parseFarmPlotState,
  normalizeFarmStoryEventEntry as parseFarmStoryEventEntry,
  normalizeGameplayCraftingPayload as parseGameplayCraftingPayload,
  normalizeGameplayFarmPayload as parseGameplayFarmPayload,
  normalizeGameplayFarmStoryPayload as parseGameplayFarmStoryPayload,
  normalizeGameplayLoopPayload as parseGameplayLoopPayload,
  normalizeGameplayTowerStoryPayload as parseGameplayTowerStoryPayload,
  normalizeTowerStoryEventEntry as parseTowerStoryEventEntry,
  normalizeVillageMarketPayload as parseVillageMarketPayload,
  type FarmCraftIngredientState,
  type FarmCraftRecipeState,
  type FarmCraftingState,
  type FarmCropCatalogEntryState,
  type FarmPlotState,
  type FarmState,
  type FarmStoryEventState,
  type FarmStoryState,
  type GameplayLoopState,
  type TowerStoryEventState,
  type TowerStoryState,
  type ValueParsers,
} from './payloadNormalizers';
import {
  parseAutoSavePayload as parseAutoSavePayloadFromService,
  parseCombatPayload as parseCombatPayloadFromService,
  parseHeroProfilePayload as parseHeroProfilePayloadFromService,
  parseQuestsPayload as parseQuestsPayloadFromService,
  parseSaveSlotPreviewPayload as parseSaveSlotPreviewPayloadFromService,
  parseSaveSlotsPayload as parseSaveSlotsPayloadFromService,
  type GameplayPayloadParsers,
} from './gameplayPayloadParsers';
import {
  asCombatStatus as asCombatStatusFromParser,
  asCombatTurn as asCombatTurnFromParser,
  asCombatUiStatus as asCombatUiStatusFromParser,
  asNumber as asNumberFromParser,
  asQuestStatus as asQuestStatusFromParser,
  asRecord as asRecordFromParser,
  asString as asStringFromParser,
  asStringArray as asStringArrayFromParser,
  isRecord as isRecordFromParser,
} from './valueParsers';
import { normalizeGameplayIntroPayload as normalizeGameplayIntroPayloadFromIntro } from '../features/intro/introLogic';
import {
  normalizeVillageNpcEntry as normalizeVillageNpcEntryFromVillageHud,
  normalizeVillageNpcRelationshipEntry as normalizeVillageNpcRelationshipEntryFromVillageHud,
} from '../features/village/villageHudParsers';

export type GameScenePayloadGateway = {
  isRecord: (value: unknown) => value is Record<string, unknown>;
  asRecord: (value: unknown) => Record<string, unknown> | null;
  asString: (value: unknown) => string | null;
  asStringArray: (value: unknown) => string[];
  asNumber: (value: unknown) => number | null;
  asCombatUiStatus: (value: unknown) => CombatUiStatus | null;
  asCombatStatus: (value: unknown) => CombatStatus | null;
  asQuestStatus: (value: unknown) => QuestStatus | null;
  asCombatTurn: (value: unknown) => CombatTurn | null;
  normalizeGameplayIntroPayload: (payload: unknown) => IntroNarrativeState | null;
  normalizeVillageNpcEntry: (payload: unknown) => VillageNpcHudEntry | null;
  normalizeVillageNpcRelationshipEntry: (payload: unknown) => VillageNpcRelationshipHudEntry | null;
  normalizeGameplayFarmStoryPayload: (payload: unknown) => FarmStoryState | null;
  normalizeFarmStoryEventEntry: (payload: unknown) => FarmStoryEventState | null;
  normalizeGameplayTowerStoryPayload: (payload: unknown) => TowerStoryState | null;
  normalizeTowerStoryEventEntry: (payload: unknown) => TowerStoryEventState | null;
  normalizeGameplayFarmPayload: (payload: unknown) => FarmState | null;
  normalizeGameplayCraftingPayload: (payload: unknown) => FarmCraftingState | null;
  normalizeGameplayLoopPayload: (payload: unknown) => GameplayLoopState | null;
  normalizeFarmCraftRecipeState: (payload: unknown) => FarmCraftRecipeState | null;
  normalizeFarmCraftIngredientState: (payload: unknown) => FarmCraftIngredientState | null;
  normalizeFarmCropCatalogEntry: (payload: unknown) => FarmCropCatalogEntryState | null;
  normalizeFarmPlotState: (payload: unknown) => FarmPlotState | null;
  normalizeQuestsPayload: (payload: unknown) => QuestState[];
  normalizeBlacksmithPayload: (payload: unknown) => { offers: BlacksmithOfferState[] };
  normalizeVillageMarketPayload: (payload: unknown) => {
    unlocked: boolean;
    seedOffers: VillageSeedOfferState[];
    cropBuybackOffers: VillageCropBuybackOfferState[];
  };
  normalizeSaveSlotsPayload: (payload: unknown) => SaveSlotState[];
  normalizeAutoSavePayload: (payload: unknown) => AutoSaveState | null;
  normalizeHeroProfilePayload: (payload: unknown) => HeroProfileState | null;
  normalizeSaveSlotPreviewPayload: (payload: unknown) => SaveSlotPreview | null;
  normalizeCombatPayload: (payload: unknown) => CombatEncounterState | null;
};

export function createGameScenePayloadGateway(options: {
  getFallbackCombatStatus: () => CombatStatus;
  isHeroAppearanceKey: (value: string) => value is HeroAppearanceKey;
  isIntroNarrativeStepKey: (value: string) => value is IntroNarrativeStepKey;
}): GameScenePayloadGateway {
  const asRecord = (value: unknown): Record<string, unknown> | null => asRecordFromParser(value);
  const isRecord = (value: unknown): value is Record<string, unknown> => isRecordFromParser(value);
  const asString = (value: unknown): string | null => asStringFromParser(value);
  const asStringArray = (value: unknown): string[] => asStringArrayFromParser(value);
  const asNumber = (value: unknown): number | null => asNumberFromParser(value);
  const asCombatUiStatus = (value: unknown): CombatUiStatus | null => asCombatUiStatusFromParser(value);
  const asCombatStatus = (value: unknown): CombatStatus | null => asCombatStatusFromParser(value);
  const asQuestStatus = (value: unknown): QuestStatus | null => asQuestStatusFromParser(value);
  const asCombatTurn = (value: unknown): CombatTurn | null => asCombatTurnFromParser(value);

  const getContentValueParsers = (): ValueParsers => ({
    asRecord,
    asString,
    asNumber,
  });

  const getGameplayPayloadParsers = (): GameplayPayloadParsers<CombatStatus, CombatTurn, QuestStatus> => ({
    isRecord,
    asRecord,
    asString,
    asStringArray,
    asNumber,
    asCombatStatus,
    asQuestStatus,
    asCombatTurn,
  });

  return {
    isRecord,
    asRecord,
    asString,
    asStringArray,
    asNumber,
    asCombatUiStatus,
    asCombatStatus,
    asQuestStatus,
    asCombatTurn,
    normalizeGameplayIntroPayload: (payload) =>
      normalizeGameplayIntroPayloadFromIntro(payload, { asRecord, asString }, options.isIntroNarrativeStepKey),
    normalizeVillageNpcEntry: (payload) =>
      normalizeVillageNpcEntryFromVillageHud(payload, {
        asRecord,
        asString,
      }),
    normalizeVillageNpcRelationshipEntry: (payload) =>
      normalizeVillageNpcRelationshipEntryFromVillageHud(payload, {
        asRecord,
        asString,
        asNumber,
      }),
    normalizeGameplayFarmStoryPayload: (payload) =>
      parseGameplayFarmStoryPayload(payload, getContentValueParsers()) as FarmStoryState | null,
    normalizeFarmStoryEventEntry: (payload) =>
      parseFarmStoryEventEntry(payload, getContentValueParsers()) as FarmStoryEventState | null,
    normalizeGameplayTowerStoryPayload: (payload) =>
      parseGameplayTowerStoryPayload(payload, getContentValueParsers()) as TowerStoryState | null,
    normalizeTowerStoryEventEntry: (payload) =>
      parseTowerStoryEventEntry(payload, getContentValueParsers()) as TowerStoryEventState | null,
    normalizeGameplayFarmPayload: (payload) =>
      parseGameplayFarmPayload(payload, getContentValueParsers()) as FarmState | null,
    normalizeGameplayCraftingPayload: (payload) =>
      parseGameplayCraftingPayload(payload, getContentValueParsers()) as FarmCraftingState | null,
    normalizeGameplayLoopPayload: (payload) =>
      parseGameplayLoopPayload(payload, getContentValueParsers()) as GameplayLoopState | null,
    normalizeFarmCraftRecipeState: (payload) =>
      parseFarmCraftRecipeState(payload, getContentValueParsers()) as FarmCraftRecipeState | null,
    normalizeFarmCraftIngredientState: (payload) =>
      parseFarmCraftIngredientState(payload, getContentValueParsers()) as FarmCraftIngredientState | null,
    normalizeFarmCropCatalogEntry: (payload) =>
      parseFarmCropCatalogEntry(payload, getContentValueParsers()) as FarmCropCatalogEntryState | null,
    normalizeFarmPlotState: (payload) => parseFarmPlotState(payload, getContentValueParsers()) as FarmPlotState | null,
    normalizeQuestsPayload: (payload) => parseQuestsPayloadFromService(payload, getGameplayPayloadParsers()),
    normalizeBlacksmithPayload: (payload) =>
      parseBlacksmithPayload(payload, {
        asRecord,
        asString,
        asNumber,
      }),
    normalizeVillageMarketPayload: (payload) =>
      parseVillageMarketPayload(payload, {
        asRecord,
        asString,
        asNumber,
      }),
    normalizeSaveSlotsPayload: (payload) => parseSaveSlotsPayloadFromService(payload, getGameplayPayloadParsers()),
    normalizeAutoSavePayload: (payload) => parseAutoSavePayloadFromService(payload, getGameplayPayloadParsers()),
    normalizeHeroProfilePayload: (payload) =>
      parseHeroProfilePayloadFromService(payload, getGameplayPayloadParsers(), options.isHeroAppearanceKey),
    normalizeSaveSlotPreviewPayload: (payload) =>
      parseSaveSlotPreviewPayloadFromService(payload, getGameplayPayloadParsers()),
    normalizeCombatPayload: (payload) =>
      parseCombatPayloadFromService(payload, getGameplayPayloadParsers(), options.getFallbackCombatStatus()),
  };
}
