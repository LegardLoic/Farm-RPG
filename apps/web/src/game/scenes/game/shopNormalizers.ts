import type {
  BlacksmithOfferState,
  VillageCropBuybackOfferState,
  VillageSeedOfferState,
} from './frontSceneConfig';

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

