import type { VillageShopPanelEntry, VillageShopTabKey, VillageShopTabOption } from '../../gameScene.types';

export function renderVillageShopTabs(params: {
  root: HTMLElement;
  tabs: VillageShopTabOption[];
  activeTab: VillageShopTabKey;
}): void {
  params.root.replaceChildren();
  for (const tab of params.tabs) {
    const button = document.createElement('button');
    button.classList.add('hud-village-shop-tab');
    if (tab.key === params.activeTab) {
      button.classList.add('active');
    }
    button.dataset.villageShopAction = 'tab';
    button.dataset.shopTab = tab.key;
    button.textContent = tab.label;
    params.root.appendChild(button);
  }
}

export function renderVillageShopEntries(params: {
  root: HTMLElement;
  entries: VillageShopPanelEntry[];
  villageShopType: 'market' | 'forge';
  selectedEntryKey: string | null;
}): void {
  params.root.replaceChildren();
  if (params.entries.length === 0) {
    const empty = document.createElement('li');
    empty.classList.add('hud-village-shop-entry-empty');
    empty.textContent =
      params.villageShopType === 'market'
        ? 'Aucune offre visible pour cet onglet.'
        : 'Catalogue de forge vide pour cette categorie.';
    params.root.appendChild(empty);
    return;
  }

  for (const entry of params.entries) {
    const row = document.createElement('li');
    row.classList.add('hud-village-shop-entry-row');

    const button = document.createElement('button');
    button.classList.add('hud-village-shop-entry');
    button.dataset.villageShopAction = 'select';
    button.dataset.shopEntryKey = entry.entryKey;
    button.dataset.selected = entry.entryKey === params.selectedEntryKey ? '1' : '0';

    const header = document.createElement('div');
    header.classList.add('hud-village-shop-entry-header');
    const name = document.createElement('strong');
    name.textContent = entry.name;
    const price = document.createElement('span');
    price.textContent = entry.priceLabel;
    header.append(name, price);

    const meta = document.createElement('p');
    meta.classList.add('hud-village-shop-entry-meta');
    meta.textContent = entry.badgeLabel;

    button.append(header, meta);
    row.appendChild(button);
    params.root.appendChild(row);
  }
}

export function updateVillageShopDetails(params: {
  selectedEntry: VillageShopPanelEntry | null;
  activeError: string | null;
  gold: number;
  selectedEntryBusy: boolean;
  talkButtonLabel: string;
  canTalk: boolean;
  detailNameValue: HTMLElement | null;
  detailMetaValue: HTMLElement | null;
  detailDescriptionValue: HTMLElement | null;
  detailComparisonValue: HTMLElement | null;
  errorValue: HTMLElement | null;
  transactionValue: HTMLElement | null;
  confirmButton: HTMLButtonElement | null;
  talkButton: HTMLButtonElement | null;
}): void {
  if (params.detailNameValue) {
    params.detailNameValue.textContent = params.selectedEntry?.name ?? 'Selectionne un objet';
  }
  if (params.detailMetaValue) {
    params.detailMetaValue.textContent = params.selectedEntry?.detailMeta ?? '-';
  }
  if (params.detailDescriptionValue) {
    params.detailDescriptionValue.textContent = params.selectedEntry
      ? `${params.selectedEntry.description} ${params.selectedEntry.usageLabel}`
      : 'Le detail apparait ici.';
  }
  if (params.detailComparisonValue) {
    params.detailComparisonValue.textContent = params.selectedEntry?.comparisonLabel ?? '-';
  }

  if (params.errorValue) {
    params.errorValue.hidden = !params.activeError;
    params.errorValue.textContent = params.activeError ?? '';
  }

  if (params.transactionValue) {
    if (params.selectedEntry) {
      const stockPart = params.selectedEntry.ownedQuantity === null ? '' : ` | Stock ${params.selectedEntry.ownedQuantity}`;
      params.transactionValue.textContent = `Action: ${params.selectedEntry.actionLabel}${stockPart} | Or ${params.gold} po`;
    } else {
      params.transactionValue.textContent = `Or actuel: ${params.gold} po`;
    }
  }

  if (params.confirmButton) {
    if (!params.selectedEntry) {
      params.confirmButton.textContent = 'Selectionner un objet';
      params.confirmButton.disabled = true;
    } else {
      params.confirmButton.textContent = params.selectedEntryBusy ? 'Transaction...' : params.selectedEntry.actionLabel;
      params.confirmButton.disabled = !params.selectedEntry.canTransact;
    }
  }

  if (params.talkButton) {
    params.talkButton.disabled = !params.canTalk;
    params.talkButton.textContent = params.talkButtonLabel;
  }
}
