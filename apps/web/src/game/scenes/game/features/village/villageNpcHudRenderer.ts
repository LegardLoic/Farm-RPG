import {
  getVillageNpcDialogueLabel as getVillageNpcDialogueLabelFromLogic,
  getVillageNpcEntryLabel as getVillageNpcEntryLabelFromLogic,
  getVillageNpcSummaryLabel as getVillageNpcSummaryLabelFromLogic,
  type VillageNpcHudState,
  type VillageNpcKey,
  type VillageNpcRelationshipHudState,
} from './villageLogic';

type VillageNpcHudElements = {
  summaryValue: HTMLElement | null;
  mayorValue: HTMLElement | null;
  blacksmithValue: HTMLElement | null;
  merchantValue: HTMLElement | null;
  mayorDialogueValue: HTMLElement | null;
  blacksmithDialogueValue: HTMLElement | null;
  merchantDialogueValue: HTMLElement | null;
  errorValue: HTMLElement | null;
  talkMayorButton: HTMLButtonElement | null;
  talkBlacksmithButton: HTMLButtonElement | null;
  talkMerchantButton: HTMLButtonElement | null;
};

export function updateVillageNpcHud(params: {
  isAuthenticated: boolean;
  villageNpcBusy: boolean;
  villageNpcError: string | null;
  villageNpcState: VillageNpcHudState;
  villageNpcRelationships: VillageNpcRelationshipHudState;
  elements: VillageNpcHudElements;
}): void {
  if (params.elements.summaryValue) {
    params.elements.summaryValue.textContent = getVillageNpcSummaryLabelFromLogic({
      isAuthenticated: params.isAuthenticated,
      villageNpcState: params.villageNpcState,
      villageNpcRelationships: params.villageNpcRelationships,
    });
  }

  if (params.elements.mayorValue) {
    params.elements.mayorValue.textContent = getVillageNpcEntryLabelFromLogic({
      npcKey: 'mayor',
      villageNpcState: params.villageNpcState,
      villageNpcRelationships: params.villageNpcRelationships,
    });
  }

  if (params.elements.blacksmithValue) {
    params.elements.blacksmithValue.textContent = getVillageNpcEntryLabelFromLogic({
      npcKey: 'blacksmith',
      villageNpcState: params.villageNpcState,
      villageNpcRelationships: params.villageNpcRelationships,
    });
  }

  if (params.elements.merchantValue) {
    params.elements.merchantValue.textContent = getVillageNpcEntryLabelFromLogic({
      npcKey: 'merchant',
      villageNpcState: params.villageNpcState,
      villageNpcRelationships: params.villageNpcRelationships,
    });
  }

  if (params.elements.mayorDialogueValue) {
    params.elements.mayorDialogueValue.textContent = getVillageNpcDialogueLabelFromLogic({
      isAuthenticated: params.isAuthenticated,
      npcKey: 'mayor',
      villageNpcState: params.villageNpcState,
      villageNpcRelationships: params.villageNpcRelationships,
    });
  }

  if (params.elements.blacksmithDialogueValue) {
    params.elements.blacksmithDialogueValue.textContent = getVillageNpcDialogueLabelFromLogic({
      isAuthenticated: params.isAuthenticated,
      npcKey: 'blacksmith',
      villageNpcState: params.villageNpcState,
      villageNpcRelationships: params.villageNpcRelationships,
    });
  }

  if (params.elements.merchantDialogueValue) {
    params.elements.merchantDialogueValue.textContent = getVillageNpcDialogueLabelFromLogic({
      isAuthenticated: params.isAuthenticated,
      npcKey: 'merchant',
      villageNpcState: params.villageNpcState,
      villageNpcRelationships: params.villageNpcRelationships,
    });
  }

  if (params.elements.errorValue) {
    params.elements.errorValue.hidden = !params.villageNpcError;
    params.elements.errorValue.textContent = params.villageNpcError ?? '';
  }

  updateVillageNpcTalkButton({
    npcKey: 'mayor',
    button: params.elements.talkMayorButton,
    isAuthenticated: params.isAuthenticated,
    villageNpcBusy: params.villageNpcBusy,
    villageNpcState: params.villageNpcState,
    villageNpcRelationships: params.villageNpcRelationships,
  });
  updateVillageNpcTalkButton({
    npcKey: 'blacksmith',
    button: params.elements.talkBlacksmithButton,
    isAuthenticated: params.isAuthenticated,
    villageNpcBusy: params.villageNpcBusy,
    villageNpcState: params.villageNpcState,
    villageNpcRelationships: params.villageNpcRelationships,
  });
  updateVillageNpcTalkButton({
    npcKey: 'merchant',
    button: params.elements.talkMerchantButton,
    isAuthenticated: params.isAuthenticated,
    villageNpcBusy: params.villageNpcBusy,
    villageNpcState: params.villageNpcState,
    villageNpcRelationships: params.villageNpcRelationships,
  });
}

function updateVillageNpcTalkButton(params: {
  npcKey: VillageNpcKey;
  button: HTMLButtonElement | null;
  isAuthenticated: boolean;
  villageNpcBusy: boolean;
  villageNpcState: VillageNpcHudState;
  villageNpcRelationships: VillageNpcRelationshipHudState;
}): void {
  if (!params.button) {
    return;
  }

  const relation = params.villageNpcRelationships[params.npcKey];
  const npc = params.villageNpcState[params.npcKey];
  const canTalk = params.isAuthenticated && npc.available && relation.canTalkToday;
  params.button.disabled = params.villageNpcBusy || !canTalk;
  if (params.villageNpcBusy) {
    params.button.textContent = 'Parler...';
    return;
  }
  if (!params.isAuthenticated) {
    params.button.textContent = 'Login';
    return;
  }
  if (!npc.available) {
    params.button.textContent = 'Indispo';
    return;
  }
  params.button.textContent = relation.canTalkToday ? 'Parler' : 'Deja vu';
}
