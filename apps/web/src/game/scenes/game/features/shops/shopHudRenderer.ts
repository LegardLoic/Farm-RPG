import type {
  BlacksmithOfferState,
  VillageCropBuybackOfferState,
  VillageSeedOfferState,
} from '../../gameScene.types';

export function renderBlacksmithOffers(params: {
  root: HTMLElement;
  isAuthenticated: boolean;
  blacksmithUnlocked: boolean;
  blacksmithCurseLifted: boolean;
  blacksmithBusy: boolean;
  gold: number;
  offers: BlacksmithOfferState[];
}): void {
  params.root.replaceChildren();

  if (!params.isAuthenticated) {
    const item = document.createElement('li');
    item.classList.add('shop-item', 'empty');
    item.textContent = 'Connect to access the shop.';
    params.root.appendChild(item);
    return;
  }

  if (!params.blacksmithUnlocked) {
    const item = document.createElement('li');
    item.classList.add('shop-item', 'empty');
    item.textContent = params.blacksmithCurseLifted
      ? 'Blacksmith is recovering. Complete progression to unlock the shop.'
      : 'Blacksmith is still cursed.';
    params.root.appendChild(item);
    return;
  }

  if (params.offers.length === 0) {
    const item = document.createElement('li');
    item.classList.add('shop-item', 'empty');
    item.textContent = params.blacksmithBusy ? 'Loading offers...' : 'No offers available.';
    params.root.appendChild(item);
    return;
  }

  for (const offer of params.offers) {
    const item = document.createElement('li');
    item.classList.add('shop-item');

    const header = document.createElement('div');
    header.classList.add('shop-item-header');

    const name = document.createElement('strong');
    name.textContent = offer.name;
    header.appendChild(name);

    const price = document.createElement('span');
    price.classList.add('shop-price');
    price.textContent = `${offer.goldPrice}g`;
    header.appendChild(price);

    item.appendChild(header);

    const description = document.createElement('p');
    description.classList.add('shop-description');
    description.textContent = offer.description;
    item.appendChild(description);

    const buyButton = document.createElement('button');
    buyButton.classList.add('hud-shop-buy');
    buyButton.textContent = `Buy (${offer.goldPrice}g)`;
    buyButton.dataset.shopAction = 'buy';
    buyButton.dataset.offerKey = offer.offerKey;
    buyButton.disabled = params.blacksmithBusy || params.gold < offer.goldPrice;
    item.appendChild(buyButton);

    params.root.appendChild(item);
  }
}

export function renderVillageMarketOffers(params: {
  seedsRoot: HTMLElement;
  buybackRoot: HTMLElement;
  isAuthenticated: boolean;
  villageMarketUnlocked: boolean;
  villageMarketBusy: boolean;
  gold: number;
  seedOffers: VillageSeedOfferState[];
  buybackOffers: VillageCropBuybackOfferState[];
}): void {
  params.seedsRoot.replaceChildren();
  params.buybackRoot.replaceChildren();

  if (!params.isAuthenticated) {
    const seedItem = document.createElement('li');
    seedItem.classList.add('shop-item', 'empty');
    seedItem.textContent = 'Connect to access seed offers.';
    params.seedsRoot.appendChild(seedItem);

    const buybackItem = document.createElement('li');
    buybackItem.classList.add('shop-item', 'empty');
    buybackItem.textContent = 'Connect to access crop buyback.';
    params.buybackRoot.appendChild(buybackItem);
    return;
  }

  if (!params.villageMarketUnlocked) {
    const lockMessage = params.villageMarketBusy
      ? 'Checking market unlock...'
      : 'Market locked. Progress intro and floor milestones.';

    const seedItem = document.createElement('li');
    seedItem.classList.add('shop-item', 'empty');
    seedItem.textContent = lockMessage;
    params.seedsRoot.appendChild(seedItem);

    const buybackItem = document.createElement('li');
    buybackItem.classList.add('shop-item', 'empty');
    buybackItem.textContent = 'Crop buyback unavailable while market is locked.';
    params.buybackRoot.appendChild(buybackItem);
    return;
  }

  if (params.seedOffers.length === 0) {
    const seedItem = document.createElement('li');
    seedItem.classList.add('shop-item', 'empty');
    seedItem.textContent = params.villageMarketBusy ? 'Loading seed offers...' : 'No seed offers available.';
    params.seedsRoot.appendChild(seedItem);
  } else {
    for (const offer of params.seedOffers) {
      const item = document.createElement('li');
      item.classList.add('shop-item');

      const header = document.createElement('div');
      header.classList.add('shop-item-header');

      const name = document.createElement('strong');
      name.textContent = offer.name;
      header.appendChild(name);

      const price = document.createElement('span');
      price.classList.add('shop-price');
      price.textContent = `${offer.goldPrice}g`;
      header.appendChild(price);
      item.appendChild(header);

      const description = document.createElement('p');
      description.classList.add('shop-description');
      description.textContent = offer.description;
      item.appendChild(description);

      const buyButton = document.createElement('button');
      buyButton.classList.add('hud-shop-buy');
      buyButton.textContent = `Buy x1 (${offer.goldPrice}g)`;
      buyButton.dataset.marketAction = 'buy-seed';
      buyButton.dataset.offerKey = offer.offerKey;
      buyButton.disabled = params.villageMarketBusy || params.gold < offer.goldPrice;
      item.appendChild(buyButton);

      params.seedsRoot.appendChild(item);
    }
  }

  if (params.buybackOffers.length === 0) {
    const buybackItem = document.createElement('li');
    buybackItem.classList.add('shop-item', 'empty');
    buybackItem.textContent = params.villageMarketBusy
      ? 'Loading crop buyback offers...'
      : 'No crop buyback offers available.';
    params.buybackRoot.appendChild(buybackItem);
    return;
  }

  for (const offer of params.buybackOffers) {
    const item = document.createElement('li');
    item.classList.add('shop-item');

    const header = document.createElement('div');
    header.classList.add('shop-item-header');

    const name = document.createElement('strong');
    name.textContent = offer.name;
    header.appendChild(name);

    const price = document.createElement('span');
    price.classList.add('shop-price');
    price.textContent = `Sell ${offer.goldValue}g`;
    header.appendChild(price);
    item.appendChild(header);

    const description = document.createElement('p');
    description.classList.add('shop-description');
    description.textContent = `${offer.description} | Owned ${offer.ownedQuantity}`;
    item.appendChild(description);

    const sellButton = document.createElement('button');
    sellButton.classList.add('hud-shop-buy');
    sellButton.textContent = `Sell x1 (${offer.goldValue}g)`;
    sellButton.dataset.marketAction = 'sell-crop';
    sellButton.dataset.itemKey = offer.itemKey;
    sellButton.disabled = params.villageMarketBusy || offer.ownedQuantity < 1;
    item.appendChild(sellButton);

    params.buybackRoot.appendChild(item);
  }
}
