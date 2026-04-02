import type {
  BlacksmithOfferState,
  FrontSceneMode,
  VillageCropBuybackOfferState,
  VillageSeedOfferState,
  VillageShopPanelEntry,
  VillageShopTabKey,
  VillageShopTabOption,
  VillageShopType,
} from '../../gameScene.types';
import type { VillageNpcKey, VillageNpcHudState, VillageNpcRelationshipHudState } from '../../gameScene.stateTypes';
import {
  buildVillageShopEntries,
  computeVillageShopRenderSignature,
  getVillageShopActiveError,
  getVillageShopSummaryLabel,
  getVillageShopTabs,
  getVillageShopTalkButtonLabel,
  selectVillageShopEntry,
} from './villageShopLogic';

export type VillageShopControllerState = {
  isOpen: boolean;
  shopType: VillageShopType;
  tabKey: VillageShopTabKey;
  selectedEntryKey: string | null;
  renderSignature: string;
};

export type VillageShopControllerContext = {
  frontSceneMode: FrontSceneMode;
  isAuthenticated: boolean;
  hudGold: number;
  villageMarketUnlocked: boolean;
  villageMarketBusy: boolean;
  villageMarketError: string | null;
  villageMarketSeedOffers: VillageSeedOfferState[];
  villageMarketBuybackOffers: VillageCropBuybackOfferState[];
  blacksmithUnlocked: boolean;
  blacksmithCurseLifted: boolean;
  blacksmithBusy: boolean;
  blacksmithError: string | null;
  blacksmithOffers: BlacksmithOfferState[];
  villageNpcBusy: boolean;
  villageNpcState: VillageNpcHudState;
  villageNpcRelationships: VillageNpcRelationshipHudState;
  towerHighestFloor: number;
};

export type VillageShopPrimaryActionDecision =
  | {
      kind: 'select-offer';
      message: string;
    }
  | {
      kind: 'blocked';
      message: string;
      entry: VillageShopPanelEntry;
    }
  | {
      kind: 'buy-seed';
      offerKey: string;
      entry: VillageShopPanelEntry;
    }
  | {
      kind: 'sell-crop';
      itemKey: string;
      entry: VillageShopPanelEntry;
    }
  | {
      kind: 'buy-forge-item';
      offerKey: string;
      entry: VillageShopPanelEntry;
    };

export type VillageShopTalkActionDecision = {
  npcKey: VillageNpcKey;
  npcLabel: string;
  canTalk: boolean;
  buttonLabel: string;
  message: string | null;
};

export type VillageShopControllerViewModel = {
  isVisible: boolean;
  shopType: VillageShopType;
  npcKey: VillageNpcKey;
  npcLabel: string;
  titleLabel: string;
  summaryLabel: string;
  activeError: string | null;
  tabs: VillageShopTabOption[];
  activeTabKey: VillageShopTabKey;
  entries: VillageShopPanelEntry[];
  selectedEntry: VillageShopPanelEntry | null;
  selectedEntryKey: string | null;
  selectedEntryBusy: boolean;
  detailName: string;
  detailMeta: string;
  detailDescription: string;
  detailComparison: string;
  transactionLabel: string;
  confirmButtonLabel: string;
  confirmButtonDisabled: boolean;
  talkButtonLabel: string;
  talkButtonDisabled: boolean;
  primaryAction: VillageShopPrimaryActionDecision;
  talkAction: VillageShopTalkActionDecision;
  renderSignature: string;
};

export type VillageShopControllerResolution = {
  state: VillageShopControllerState;
  viewModel: VillageShopControllerViewModel;
};

function getVillageShopDefaultTabKey(shopType: VillageShopType): VillageShopTabKey {
  return shopType === 'market' ? 'buy' : 'weapons';
}

export function getVillageShopNpcKey(shopType: VillageShopType): VillageNpcKey {
  return shopType === 'market' ? 'merchant' : 'blacksmith';
}

export function getVillageShopNpcLabel(shopType: VillageShopType): string {
  return shopType === 'market' ? 'Marchande' : 'Forgeron';
}

export function getVillageShopTitleLabel(shopType: VillageShopType): string {
  return shopType === 'market' ? 'Marche du village' : 'Forge du village';
}

export function createVillageShopControllerState(shopType: VillageShopType = 'market'): VillageShopControllerState {
  return {
    isOpen: false,
    shopType,
    tabKey: getVillageShopDefaultTabKey(shopType),
    selectedEntryKey: null,
    renderSignature: '',
  };
}

export function openVillageShopControllerPanel(
  state: VillageShopControllerState,
  shopType: VillageShopType,
): VillageShopControllerState {
  if (state.shopType !== shopType) {
    return {
      ...state,
      isOpen: true,
      shopType,
      tabKey: getVillageShopDefaultTabKey(shopType),
      selectedEntryKey: null,
      renderSignature: '',
    };
  }

  return {
    ...state,
    isOpen: true,
    renderSignature: '',
  };
}

export function closeVillageShopControllerPanel(state: VillageShopControllerState): VillageShopControllerState {
  if (!state.isOpen) {
    return state;
  }

  return {
    ...state,
    isOpen: false,
    selectedEntryKey: null,
    renderSignature: '',
  };
}

export function setVillageShopControllerTab(
  state: VillageShopControllerState,
  tabKey: VillageShopTabKey,
): VillageShopControllerState {
  const tabs = getVillageShopTabs(state.shopType);
  if (!tabs.some((tab) => tab.key === tabKey) || state.tabKey === tabKey) {
    return state;
  }

  return {
    ...state,
    tabKey,
    selectedEntryKey: null,
    renderSignature: '',
  };
}

export function selectVillageShopControllerEntry(
  state: VillageShopControllerState,
  entryKey: string,
): VillageShopControllerState {
  if (state.selectedEntryKey === entryKey) {
    return state;
  }

  return {
    ...state,
    selectedEntryKey: entryKey,
    renderSignature: '',
  };
}

export function normalizeVillageShopControllerState(
  state: VillageShopControllerState,
): VillageShopControllerState {
  const tabs = getVillageShopTabs(state.shopType);
  if (tabs.some((tab) => tab.key === state.tabKey)) {
    return state;
  }

  return {
    ...state,
    tabKey: tabs[0]?.key ?? getVillageShopDefaultTabKey(state.shopType),
    selectedEntryKey: null,
    renderSignature: '',
  };
}

export function resolveVillageShopPrimaryAction(selectedEntry: VillageShopPanelEntry | null): VillageShopPrimaryActionDecision {
  if (!selectedEntry) {
    return {
      kind: 'select-offer',
      message: 'Selectionne une offre avant de valider.',
    };
  }

  if (!selectedEntry.canTransact) {
    return {
      kind: 'blocked',
      message: selectedEntry.source === 'market-sell'
        ? 'Stock insuffisant ou transaction indisponible.'
        : 'Transaction indisponible pour le moment.',
      entry: selectedEntry,
    };
  }

  if (selectedEntry.source === 'market-buy' && selectedEntry.offerKey) {
    return {
      kind: 'buy-seed',
      offerKey: selectedEntry.offerKey,
      entry: selectedEntry,
    };
  }

  if (selectedEntry.source === 'market-sell') {
    return {
      kind: 'sell-crop',
      itemKey: selectedEntry.itemKey,
      entry: selectedEntry,
    };
  }

  if (selectedEntry.offerKey) {
    return {
      kind: 'buy-forge-item',
      offerKey: selectedEntry.offerKey,
      entry: selectedEntry,
    };
  }

  return {
    kind: 'blocked',
    message: 'Transaction indisponible pour le moment.',
    entry: selectedEntry,
  };
}

export function resolveVillageShopTalkAction(input: {
  shopType: VillageShopType;
  isAuthenticated: boolean;
  villageNpcBusy: boolean;
  villageNpcState: VillageNpcHudState;
  villageNpcRelationships: VillageNpcRelationshipHudState;
}): VillageShopTalkActionDecision {
  const npcKey = getVillageShopNpcKey(input.shopType);
  const npcLabel = getVillageShopNpcLabel(input.shopType);
  const npc = input.villageNpcState[npcKey];
  const relation = input.villageNpcRelationships[npcKey];
  const canTalk = input.isAuthenticated && npc.available && relation.canTalkToday && !input.villageNpcBusy;

  let message: string | null = null;
  if (!input.isAuthenticated) {
    message = 'Connexion requise pour parler.';
  } else if (input.villageNpcBusy) {
    message = 'Interaction en cours.';
  } else if (!npc.available) {
    message = `${npcLabel} indisponible.`;
  } else if (!relation.canTalkToday) {
    message = `${npcLabel} a deja partage ses infos du jour.`;
  }

  return {
    npcKey,
    npcLabel,
    canTalk,
    buttonLabel: getVillageShopTalkButtonLabel({
      villageNpcBusy: input.villageNpcBusy,
      isAuthenticated: input.isAuthenticated,
      npcAvailable: npc.available,
      canTalkToday: relation.canTalkToday,
    }),
    message,
  };
}

function buildVillageShopViewModel(input: {
  state: VillageShopControllerState;
  context: VillageShopControllerContext;
  tabs: VillageShopTabOption[];
  entries: VillageShopPanelEntry[];
  selectedEntry: VillageShopPanelEntry | null;
  activeError: string | null;
  talkAction: VillageShopTalkActionDecision;
  renderSignature: string;
}): VillageShopControllerViewModel {
  const selectedEntryBusy = input.selectedEntry
    ? input.selectedEntry.source === 'forge'
      ? input.context.blacksmithBusy
      : input.context.villageMarketBusy
    : false;

  const detailName = input.selectedEntry?.name ?? 'Selectionne un objet';
  const detailMeta = input.selectedEntry?.detailMeta ?? '-';
  const detailDescription = input.selectedEntry
    ? `${input.selectedEntry.description} ${input.selectedEntry.usageLabel}`
    : 'Le detail apparait ici.';
  const detailComparison = input.selectedEntry?.comparisonLabel ?? '-';
  const transactionLabel = input.selectedEntry
    ? `Action: ${input.selectedEntry.actionLabel}${input.selectedEntry.ownedQuantity === null ? '' : ` | Stock ${input.selectedEntry.ownedQuantity}`} | Or ${input.context.hudGold} po`
    : `Or actuel: ${input.context.hudGold} po`;
  const confirmButtonLabel = !input.selectedEntry
    ? 'Selectionner un objet'
    : selectedEntryBusy
      ? 'Transaction...'
      : input.selectedEntry.actionLabel;

  return {
    isVisible: input.context.frontSceneMode === 'village' && input.state.isOpen,
    shopType: input.state.shopType,
    npcKey: input.talkAction.npcKey,
    npcLabel: input.talkAction.npcLabel,
    titleLabel: getVillageShopTitleLabel(input.state.shopType),
    summaryLabel: getVillageShopSummaryLabel({
      isAuthenticated: input.context.isAuthenticated,
      villageShopType: input.state.shopType,
      villageMarketUnlocked: input.context.villageMarketUnlocked,
      villageMarketBusy: input.context.villageMarketBusy,
      villageMarketSeedOffersCount: input.context.villageMarketSeedOffers.length,
      villageMarketBuybackOffersCount: input.context.villageMarketBuybackOffers.length,
      blacksmithUnlocked: input.context.blacksmithUnlocked,
      blacksmithCurseLifted: input.context.blacksmithCurseLifted,
      blacksmithBusy: input.context.blacksmithBusy,
      blacksmithOffersCount: input.context.blacksmithOffers.length,
    }),
    activeError: input.activeError,
    tabs: input.tabs,
    activeTabKey: input.state.tabKey,
    entries: input.entries,
    selectedEntry: input.selectedEntry,
    selectedEntryKey: input.selectedEntry?.entryKey ?? null,
    selectedEntryBusy,
    detailName,
    detailMeta,
    detailDescription,
    detailComparison,
    transactionLabel,
    confirmButtonLabel,
    confirmButtonDisabled: !input.selectedEntry || !input.selectedEntry.canTransact,
    talkButtonLabel: input.talkAction.buttonLabel,
    talkButtonDisabled: !input.talkAction.canTalk,
    primaryAction: resolveVillageShopPrimaryAction(input.selectedEntry),
    talkAction: input.talkAction,
    renderSignature: input.renderSignature,
  };
}

export function resolveVillageShopController(
  state: VillageShopControllerState,
  context: VillageShopControllerContext,
): VillageShopControllerResolution {
  const activeError = getVillageShopActiveError(state.shopType, context.villageMarketError, context.blacksmithError);
  const talkAction = resolveVillageShopTalkAction({
    shopType: state.shopType,
    isAuthenticated: context.isAuthenticated,
    villageNpcBusy: context.villageNpcBusy,
    villageNpcState: context.villageNpcState,
    villageNpcRelationships: context.villageNpcRelationships,
  });

  const isVisible = context.frontSceneMode === 'village' && state.isOpen;
  if (!isVisible) {
    return {
      state: {
        ...state,
        renderSignature: '',
      },
      viewModel: {
        isVisible: false,
        shopType: state.shopType,
        npcKey: talkAction.npcKey,
        npcLabel: talkAction.npcLabel,
        titleLabel: getVillageShopTitleLabel(state.shopType),
        summaryLabel: getVillageShopSummaryLabel({
          isAuthenticated: context.isAuthenticated,
          villageShopType: state.shopType,
          villageMarketUnlocked: context.villageMarketUnlocked,
          villageMarketBusy: context.villageMarketBusy,
          villageMarketSeedOffersCount: context.villageMarketSeedOffers.length,
          villageMarketBuybackOffersCount: context.villageMarketBuybackOffers.length,
          blacksmithUnlocked: context.blacksmithUnlocked,
          blacksmithCurseLifted: context.blacksmithCurseLifted,
          blacksmithBusy: context.blacksmithBusy,
          blacksmithOffersCount: context.blacksmithOffers.length,
        }),
        activeError,
        tabs: getVillageShopTabs(state.shopType),
        activeTabKey: state.tabKey,
        entries: [],
        selectedEntry: null,
        selectedEntryKey: null,
        selectedEntryBusy: false,
        detailName: 'Selectionne un objet',
        detailMeta: '-',
        detailDescription: 'Le detail apparait ici.',
        detailComparison: '-',
        transactionLabel: `Or actuel: ${context.hudGold} po`,
        confirmButtonLabel: 'Selectionner un objet',
        confirmButtonDisabled: true,
        talkButtonLabel: talkAction.buttonLabel,
        talkButtonDisabled: !talkAction.canTalk,
        primaryAction: resolveVillageShopPrimaryAction(null),
        talkAction,
        renderSignature: '',
      },
    };
  }

  const normalizedState = normalizeVillageShopControllerState(state);
  const tabs = getVillageShopTabs(normalizedState.shopType);
  const entries = buildVillageShopEntries({
    villageShopType: normalizedState.shopType,
    villageShopTab: normalizedState.tabKey,
    villageMarketBuybackOffers: context.villageMarketBuybackOffers,
    villageMarketSeedOffers: context.villageMarketSeedOffers,
    villageMarketUnlocked: context.villageMarketUnlocked,
    villageMarketBusy: context.villageMarketBusy,
    hudGold: context.hudGold,
    blacksmithOffers: context.blacksmithOffers,
    blacksmithUnlocked: context.blacksmithUnlocked,
    blacksmithBusy: context.blacksmithBusy,
    towerHighestFloor: context.towerHighestFloor,
  });
  const selection = selectVillageShopEntry(entries, normalizedState.selectedEntryKey);
  const resolvedState =
    selection.selectedEntryKey === normalizedState.selectedEntryKey
      ? normalizedState
      : {
          ...normalizedState,
          selectedEntryKey: selection.selectedEntryKey,
          renderSignature: '',
        };
  const renderSignature = computeVillageShopRenderSignature({
    frontSceneMode: context.frontSceneMode,
    villageShopPanelOpen: resolvedState.isOpen,
    villageShopType: resolvedState.shopType,
    villageShopTab: resolvedState.tabKey,
    villageShopSelectedEntryKey: resolvedState.selectedEntryKey,
    isAuthenticated: context.isAuthenticated,
    hudGold: context.hudGold,
    blacksmithBusy: context.blacksmithBusy,
    villageMarketBusy: context.villageMarketBusy,
    villageNpcBusy: context.villageNpcBusy,
    activeError,
    selectedEntryKey: selection.selectedEntry?.entryKey ?? null,
    tabs,
    entries,
  });
  const nextState =
    renderSignature === resolvedState.renderSignature
      ? resolvedState
      : {
          ...resolvedState,
          renderSignature,
        };

  return {
    state: nextState,
    viewModel: buildVillageShopViewModel({
      state: nextState,
      context,
      tabs,
      entries,
      selectedEntry: selection.selectedEntry,
      activeError,
      talkAction,
      renderSignature,
    }),
  };
}
