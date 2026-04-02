import type { FrontSceneMode, VillageSceneZoneConfig, VillageShopType } from './frontSceneConfig';

export type VillageNpcKey = 'mayor' | 'blacksmith' | 'merchant';
export type VillageNpcRelationshipTier = 'stranger' | 'familiar' | 'trusted' | 'ally';

export type VillageNpcHudEntry = {
  stateKey: string;
  available: boolean;
};

export type VillageNpcRelationshipHudEntry = {
  friendship: number;
  tier: VillageNpcRelationshipTier;
  lastInteractionDay: number | null;
  canTalkToday: boolean;
};

export type VillageNpcHudState = Record<VillageNpcKey, VillageNpcHudEntry>;
export type VillageNpcRelationshipHudState = Record<VillageNpcKey, VillageNpcRelationshipHudEntry>;

export type VillageZoneInteractionState = {
  enabled: boolean;
  reason: string;
};

export function getVillageObjectiveLabel(input: {
  isAuthenticated: boolean;
  frontSceneMode: FrontSceneMode;
  blacksmithUnlocked: boolean;
  villageMarketUnlocked: boolean;
}): string {
  if (!input.isAuthenticated) {
    return 'Connecte-toi pour activer les interactions de hub.';
  }
  if (input.frontSceneMode !== 'village') {
    return 'Sortir de la ferme pour rejoindre le village.';
  }
  if (input.blacksmithUnlocked && input.villageMarketUnlocked) {
    return 'Le hub est stabilise: parle aux PNJ puis vise la Tour.';
  }
  if (!input.blacksmithUnlocked) {
    return 'Observe la forge et les retours du Maire apres tes progres.';
  }
  if (!input.villageMarketUnlocked) {
    return 'Le marche se relance: parle a la Marchande pour suivre le rythme local.';
  }

  return 'Repere Maire, Marche, Forge, zone calme et sorties.';
}

export function getVillageInteractionFeedbackLabel(input: {
  villageNpcError: string | null;
  villageFeedbackMessage: string | null;
  frontSceneMode: FrontSceneMode;
  isAuthenticated: boolean;
  villageShopPanelOpen: boolean;
  villageShopType: VillageShopType;
}): string {
  if (input.villageNpcError) {
    return input.villageNpcError;
  }
  if (input.villageFeedbackMessage) {
    return input.villageFeedbackMessage;
  }
  if (input.frontSceneMode !== 'village') {
    return 'Sortie village disponible depuis la ferme.';
  }
  if (!input.isAuthenticated) {
    return 'Connexion requise pour parler aux PNJ et changer de zone.';
  }
  if (input.villageShopPanelOpen) {
    return input.villageShopType === 'market'
      ? 'Marche ouvert: selectionne une offre puis valide.'
      : 'Forge ouverte: compare les categories avant achat.';
  }

  return 'Approche une zone, puis E pour interagir. R pour changer de cible.';
}

export function getVillageNpcSummaryLabel(input: {
  isAuthenticated: boolean;
  villageNpcState: VillageNpcHudState;
  villageNpcRelationships: VillageNpcRelationshipHudState;
}): string {
  if (!input.isAuthenticated) {
    return 'Connexion requise';
  }

  const availableCount =
    Number(input.villageNpcState.mayor.available) +
    Number(input.villageNpcState.blacksmith.available) +
    Number(input.villageNpcState.merchant.available);
  const friendshipTotal =
    input.villageNpcRelationships.mayor.friendship +
    input.villageNpcRelationships.blacksmith.friendship +
    input.villageNpcRelationships.merchant.friendship;

  return `${availableCount}/3 accessibles | Amitie ${friendshipTotal}`;
}

export function getVillageNpcEntryLabel(input: {
  npcKey: VillageNpcKey;
  villageNpcState: VillageNpcHudState;
  villageNpcRelationships: VillageNpcRelationshipHudState;
}): string {
  const entry = input.villageNpcState[input.npcKey];
  const availability = entry.available ? 'Disponible' : 'Indisponible';
  const relationship = input.villageNpcRelationships[input.npcKey];

  return `${formatVillageNpcStateLabel(entry.stateKey)} | ${availability} | Amitie ${relationship.friendship} (${formatVillageRelationshipTierLabel(relationship.tier)})`;
}

export function getVillageNpcDialogueLabel(input: {
  isAuthenticated: boolean;
  npcKey: VillageNpcKey;
  villageNpcState: VillageNpcHudState;
  villageNpcRelationships: VillageNpcRelationshipHudState;
}): string {
  if (!input.isAuthenticated) {
    return 'Connecte-toi pour ecouter les echos du village.';
  }

  const npc = input.villageNpcState[input.npcKey];
  const relationship = input.villageNpcRelationships[input.npcKey];

  if (!npc.available) {
    return getVillageNpcUnavailableDialogue(input.npcKey, npc.stateKey);
  }

  if (!relationship.canTalkToday) {
    return getVillageNpcCooldownDialogue(input.npcKey, relationship.tier);
  }

  if (input.npcKey === 'mayor') {
    return getMayorContextDialogue(relationship.tier, npc.stateKey);
  }

  if (input.npcKey === 'blacksmith') {
    return getBlacksmithContextDialogue(relationship.tier, npc.stateKey);
  }

  return getMerchantContextDialogue(relationship.tier, npc.stateKey);
}

export function getVillageNpcUnavailableDialogue(npcKey: VillageNpcKey, stateKey: string): string {
  if (npcKey === 'mayor') {
    if (stateKey === 'offscreen') {
      return 'Le maire est en tournee, laisse un rapport au tableau.';
    }
    if (stateKey === 'awaiting_meeting') {
      return 'Le maire attend encore ton premier compte-rendu.';
    }
  }

  if (npcKey === 'blacksmith') {
    if (stateKey === 'cursed') {
      return 'La forge grince sous la malediction, la lame devra attendre.';
    }
    if (stateKey === 'recovering') {
      return 'Le forgeron reprend son souffle; reviens apres une nouvelle expedition.';
    }
  }

  if (npcKey === 'merchant') {
    if (stateKey === 'absent') {
      return 'Le marchand est encore sur les routes, sans etal aujourd hui.';
    }
    if (stateKey === 'setting_stall') {
      return 'Le marchand installe ses caisses, le marche ouvre bientot.';
    }
  }

  return `${getVillageNpcDisplayName(npcKey)} n est pas disponible pour parler.`;
}

export function getVillageNpcCooldownDialogue(
  npcKey: VillageNpcKey,
  tier: VillageNpcRelationshipTier,
): string {
  if (tier === 'ally') {
    return `${getVillageNpcDisplayName(npcKey)} a deja partage les infos du jour.`;
  }
  if (tier === 'trusted') {
    return `${getVillageNpcDisplayName(npcKey)} t a deja briefe pour cette journee.`;
  }
  if (tier === 'familiar') {
    return `${getVillageNpcDisplayName(npcKey)} te reconnait, mais rien de neuf aujourd hui.`;
  }

  return `${getVillageNpcDisplayName(npcKey)} reste reserve pour le reste de la journee.`;
}

export function getMayorContextDialogue(tier: VillageNpcRelationshipTier, stateKey: string): string {
  if (stateKey === 'tower_strategist') {
    if (tier === 'ally') {
      return 'Maire: "Ton rapport fixe notre plan. On coordonne ferme et tour ensemble."';
    }
    if (tier === 'trusted') {
      return 'Maire: "Priorite au palier suivant. Ravitaille le village avant la montee."';
    }

    return 'Maire: "Observe les mouvements en tour et reviens avec des details."';
  }

  if (tier === 'ally') {
    return 'Maire: "Bon retour. La population suit ton rythme, continue ainsi."';
  }
  if (tier === 'trusted') {
    return 'Maire: "Tes decisions stabilisent le village, on peut viser plus haut."';
  }
  if (tier === 'familiar') {
    return 'Maire: "Tu prends ta place dans la garde. Un rapport chaque soir."';
  }

  return 'Maire: "Bienvenue. Commence par securiser des ressources de base."';
}

export function getBlacksmithContextDialogue(tier: VillageNpcRelationshipTier, stateKey: string): string {
  if (stateKey === 'masterwork_ready') {
    if (tier === 'ally') {
      return 'Forgeron: "La maitrise est prete. On forge pour les boss maintenant."';
    }
    if (tier === 'trusted') {
      return 'Forgeron: "Apporte des composants rares, je pousse ton equipement plus loin."';
    }

    return 'Forgeron: "La forge tourne a plein regime, choisis bien ton prochain achat."';
  }

  if (tier === 'ally') {
    return 'Forgeron: "Ta progression est propre. Je peux anticiper ton prochain set."';
  }
  if (tier === 'trusted') {
    return 'Forgeron: "Bon timing. Plus de minerai = meilleures options en boutique."';
  }
  if (tier === 'familiar') {
    return 'Forgeron: "Je note tes besoins. Reviens apres quelques combats."';
  }

  return 'Forgeron: "Une lame solide avant tout. Le reste viendra."';
}

export function getMerchantContextDialogue(tier: VillageNpcRelationshipTier, stateKey: string): string {
  if (stateKey === 'traveling_buyer') {
    if (tier === 'ally') {
      return 'Marchand: "Je couvre les routes longues. Ta ferme garantit nos stocks."';
    }
    if (tier === 'trusted') {
      return 'Marchand: "On optimise les trajets: livre regulierement et je maintiens les prix."';
    }

    return 'Marchand: "Les routes sont ouvertes, garde un flux constant de recoltes."';
  }

  if (tier === 'ally') {
    return 'Marchand: "Transactions nettes. Tes livraisons donnent du souffle au village."';
  }
  if (tier === 'trusted') {
    return 'Marchand: "Bon partenariat. Plus de volume, meilleure marge collective."';
  }
  if (tier === 'familiar') {
    return 'Marchand: "Je peux reprendre tes recoltes, commence petit et regulier."';
  }

  return 'Marchand: "Montre-moi ce que ta ferme peut fournir, puis on negocie."';
}

export function formatVillageNpcStateLabel(stateKey: string): string {
  switch (stateKey) {
    case 'offscreen':
      return 'Hors village';
    case 'awaiting_meeting':
      return 'Attend rencontre';
    case 'briefing':
      return 'Briefing';
    case 'village_overseer':
      return 'Supervision village';
    case 'tower_strategist':
      return 'Strategie tour';
    case 'cursed':
      return 'Maudit';
    case 'recovering':
      return 'Recuperation';
    case 'open':
      return 'Ouvert';
    case 'masterwork_ready':
      return 'Maitrise';
    case 'absent':
      return 'Absent';
    case 'setting_stall':
      return 'Installe etal';
    case 'traveling_buyer':
      return 'Achat itinerant';
    default:
      return stateKey.replace(/_/g, ' ');
  }
}

export function formatVillageRelationshipTierLabel(tier: VillageNpcRelationshipTier): string {
  switch (tier) {
    case 'stranger':
      return 'Inconnu';
    case 'familiar':
      return 'Connu';
    case 'trusted':
      return 'Confiant';
    case 'ally':
      return 'Allie';
    default:
      return tier;
  }
}

export function getVillageNpcDisplayName(npcKey: VillageNpcKey): string {
  if (npcKey === 'mayor') {
    return 'Mayor';
  }
  if (npcKey === 'blacksmith') {
    return 'Blacksmith';
  }

  return 'Merchant';
}

export function getVillageZoneInteractionState(input: {
  isAuthenticated: boolean;
  zone: VillageSceneZoneConfig;
  villageMarketUnlocked: boolean;
  blacksmithUnlocked: boolean;
  blacksmithCurseLifted: boolean;
  villageNpcState: VillageNpcHudState;
  villageNpcRelationships: VillageNpcRelationshipHudState;
}): VillageZoneInteractionState {
  if (!input.isAuthenticated) {
    return { enabled: false, reason: 'Connexion requise pour interagir dans le village.' };
  }

  if (input.zone.key === 'market') {
    return {
      enabled: true,
      reason: input.villageMarketUnlocked
        ? 'Marche pret: achete des graines ou vends tes recoltes.'
        : 'Marche encore limite. Les premiers paliers du monde debloquent les echanges.',
    };
  }

  if (input.zone.key === 'forge') {
    return {
      enabled: true,
      reason: input.blacksmithUnlocked
        ? 'Forge active: compare les paliers puis equipe-toi.'
        : input.blacksmithCurseLifted
          ? 'Forge en reprise: catalogue encore fragile.'
          : 'Forge entravee: avance dans la Tour pour la relancer.',
    };
  }

  if (input.zone.npcKey) {
    const npc = input.villageNpcState[input.zone.npcKey];
    const relation = input.villageNpcRelationships[input.zone.npcKey];
    if (!npc.available) {
      return {
        enabled: false,
        reason: `${getVillageNpcDisplayName(input.zone.npcKey)} indisponible (${formatVillageNpcStateLabel(npc.stateKey)}).`,
      };
    }
    if (!relation.canTalkToday) {
      return {
        enabled: false,
        reason: `${getVillageNpcDisplayName(input.zone.npcKey)} a deja partage ses infos du jour.`,
      };
    }
  }

  return { enabled: true, reason: '' };
}

export function getVillageZoneStateLabel(input: {
  isAuthenticated: boolean;
  zone: VillageSceneZoneConfig;
  villageMarketUnlocked: boolean;
  villageMarketSeedOffersCount: number;
  blacksmithUnlocked: boolean;
  blacksmithCurseLifted: boolean;
  villageNpcState: VillageNpcHudState;
  villageNpcRelationships: VillageNpcRelationshipHudState;
}): string {
  if (input.zone.key === 'market') {
    if (!input.isAuthenticated) {
      return 'Connexion requise';
    }
    if (!input.villageMarketUnlocked) {
      return 'Marche limite';
    }

    return `${input.villageMarketSeedOffersCount} graines visibles`;
  }

  if (input.zone.key === 'forge') {
    if (!input.isAuthenticated) {
      return 'Connexion requise';
    }
    if (input.blacksmithUnlocked) {
      return 'Forge active';
    }

    return input.blacksmithCurseLifted ? 'Reprise fragile' : 'Forge entravee';
  }

  if (input.zone.npcKey) {
    if (!input.isAuthenticated) {
      return 'Connexion requise';
    }
    const npc = input.villageNpcState[input.zone.npcKey];
    const relation = input.villageNpcRelationships[input.zone.npcKey];
    if (!npc.available) {
      return formatVillageNpcStateLabel(npc.stateKey);
    }
    if (!relation.canTalkToday) {
      return 'Deja parle aujourd hui';
    }

    return 'Disponible';
  }

  if (input.zone.key === 'calm') {
    return input.isAuthenticated ? 'Coin vivant' : 'Connexion requise';
  }

  if (input.zone.key === 'farm_exit') {
    return input.isAuthenticated ? 'Retour possible' : 'Connexion requise';
  }

  return input.isAuthenticated ? 'Menace active' : 'Connexion requise';
}

export function getVillageZoneStateColor(input: {
  isAuthenticated: boolean;
  zone: VillageSceneZoneConfig;
  villageMarketUnlocked: boolean;
  blacksmithUnlocked: boolean;
  interactionState: VillageZoneInteractionState;
}): string {
  if (input.zone.key === 'tower_exit') {
    return '#f0c5d6';
  }
  if (input.zone.key === 'market' && !input.villageMarketUnlocked) {
    return '#f2d5a8';
  }
  if (input.zone.key === 'forge' && !input.blacksmithUnlocked) {
    return '#f2bead';
  }
  if (input.interactionState.enabled) {
    return '#c8f2da';
  }
  if (!input.isAuthenticated) {
    return '#f2c9a7';
  }

  return '#f2b8b8';
}

export function getVillageSecondaryDialogue(input: { isAuthenticated: boolean; towerHighestFloor: number }): string {
  if (!input.isAuthenticated) {
    return 'Connexion requise pour discuter avec les habitants.';
  }
  if (input.towerHighestFloor >= 5) {
    return 'Habitante: "Le village respire un peu mieux depuis tes retours de la Tour."';
  }

  return 'Habitante: "On tient encore. Merci de revenir nous parler entre deux expeditions."';
}
