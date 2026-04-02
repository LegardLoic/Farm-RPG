import type {
  FrontSceneMode,
  VillageSceneZoneConfig,
  VillageSceneZoneKey,
  VillageShopType,
} from '../../gameScene.types';
import type {
  VillageNpcKey,
  VillageZoneInteractionState,
} from './villageLogic';

export type VillageInteractionTargetKey = VillageSceneZoneKey | string | null | undefined;

export type VillageInteractionTargetResolution =
  | {
      kind: 'resolved';
      targetKey: VillageSceneZoneKey;
      zone: VillageSceneZoneConfig;
    }
  | {
      kind: 'missing-target';
      feedbackMessage: string;
    }
  | {
      kind: 'invalid-target';
      targetKey: string;
      feedbackMessage: string;
    };

export type VillageInteractionActionResolution =
  | {
      kind: 'open-shop';
      shopType: VillageShopType;
      feedbackMessage: string;
    }
  | {
      kind: 'talk-npc';
      npcKey: VillageNpcKey;
      successMessage: string;
    }
  | {
      kind: 'secondary-dialogue';
      feedbackMessage: string;
    }
  | {
      kind: 'switch-front-scene';
      sceneMode: Extract<FrontSceneMode, 'farm'>;
      feedbackMessage: string;
    }
  | {
      kind: 'fallback';
      feedbackMessage: string;
    }
  | {
      kind: 'invalid-action-mapping';
      feedbackMessage: string;
    };

export type VillageInteractionPlanStep =
  | {
      kind: 'select-zone';
      zoneKey: VillageSceneZoneKey;
      announceSelection: boolean;
    }
  | {
      kind: 'close-shop-panel';
    }
  | {
      kind: 'open-shop-panel';
      shopType: VillageShopType;
      feedbackMessage: string;
    }
  | {
      kind: 'talk-npc';
      npcKey: VillageNpcKey;
      successMessage: string;
    }
  | {
      kind: 'set-feedback';
      message: string;
    }
  | {
      kind: 'switch-front-scene';
      sceneMode: Extract<FrontSceneMode, 'farm'>;
      feedbackMessage: string;
    };

export type VillageInteractionPlan = {
  target: VillageInteractionTargetResolution;
  action: VillageInteractionActionResolution | null;
  steps: VillageInteractionPlanStep[];
};

const VILLAGE_ZONE_KEYS = new Set<VillageSceneZoneKey>([
  'mayor',
  'market',
  'forge',
  'calm',
  'farm_exit',
  'tower_exit',
]);

const VILLAGE_NPC_KEYS = new Set<VillageNpcKey>(['mayor', 'blacksmith', 'merchant']);

export function isVillageSceneZoneKey(value: string): value is VillageSceneZoneKey {
  return VILLAGE_ZONE_KEYS.has(value as VillageSceneZoneKey);
}

export function isVillageNpcKey(value: string): value is VillageNpcKey {
  return VILLAGE_NPC_KEYS.has(value as VillageNpcKey);
}

export function resolveVillageInteractionTarget(input: {
  targetKey: VillageInteractionTargetKey;
  selectedZoneKey: VillageSceneZoneKey | null;
  zones: VillageSceneZoneConfig[];
}): VillageInteractionTargetResolution {
  const requestedKey = input.targetKey ?? input.selectedZoneKey;
  if (requestedKey == null || requestedKey === '') {
    return {
      kind: 'missing-target',
      feedbackMessage: 'Selectionne une zone du village.',
    };
  }

  const normalizedTargetKey = String(requestedKey).trim();
  if (!isVillageSceneZoneKey(normalizedTargetKey)) {
    return {
      kind: 'invalid-target',
      targetKey: normalizedTargetKey,
      feedbackMessage: 'Selectionne une zone du village.',
    };
  }

  const zone = input.zones.find((entry) => entry.key === normalizedTargetKey) ?? null;
  if (!zone) {
    return {
      kind: 'invalid-target',
      targetKey: normalizedTargetKey,
      feedbackMessage: 'Selectionne une zone du village.',
    };
  }

  return {
    kind: 'resolved',
    targetKey: normalizedTargetKey,
    zone,
  };
}

export function resolveVillageInteractionAction(
  zone: VillageSceneZoneConfig,
  secondaryDialogueMessage = 'Habitante: "On tient encore. Merci de revenir nous parler entre deux expeditions."',
): VillageInteractionActionResolution {
  switch (zone.actionKey) {
    case 'open-market':
      return {
        kind: 'open-shop',
        shopType: 'market',
        feedbackMessage: 'Marche du village ouvert: mode achat/vente actif.',
      };
    case 'open-forge':
      return {
        kind: 'open-shop',
        shopType: 'forge',
        feedbackMessage: 'Forge ouverte: compare les categories avant achat.',
      };
    case 'talk-mayor':
      return {
        kind: 'talk-npc',
        npcKey: 'mayor',
        successMessage: 'Discussion tenue avec le Maire.',
      };
    case 'talk-merchant':
      return {
        kind: 'talk-npc',
        npcKey: 'merchant',
        successMessage: 'Discussion tenue avec la Marchande.',
      };
    case 'talk-blacksmith':
      return {
        kind: 'talk-npc',
        npcKey: 'blacksmith',
        successMessage: 'Discussion tenue avec le Forgeron.',
      };
    case 'talk-secondary':
      return {
        kind: 'secondary-dialogue',
        feedbackMessage: secondaryDialogueMessage,
      };
    case 'go-farm':
      return {
        kind: 'switch-front-scene',
        sceneMode: 'farm',
        feedbackMessage: 'Retour a la ferme confirme. La boucle reprend.',
      };
    case 'go-tower':
      return {
        kind: 'fallback',
        feedbackMessage: 'La route vers la Tour est lisible. L entree jouable arrive au lot 4.',
      };
    default: {
      const exhaustiveCheck: never = zone.actionKey;
      return {
        kind: 'invalid-action-mapping',
        feedbackMessage: `Action village inconnue: ${String(exhaustiveCheck)}.`,
      };
    }
  }
}

export function buildVillageInteractionPlan(input: {
  targetKey: VillageInteractionTargetKey;
  selectedZoneKey: VillageSceneZoneKey | null;
  zones: VillageSceneZoneConfig[];
  interactionState: VillageZoneInteractionState | null;
  villageShopPanelOpen: boolean;
  secondaryDialogueMessage: string;
}): VillageInteractionPlan {
  const target = resolveVillageInteractionTarget({
    targetKey: input.targetKey,
    selectedZoneKey: input.selectedZoneKey,
    zones: input.zones,
  });

  if (target.kind !== 'resolved') {
    return {
      target,
      action: null,
      steps: [
        {
          kind: 'set-feedback',
          message: target.feedbackMessage,
        },
      ],
    };
  }

  const action = resolveVillageInteractionAction(target.zone, input.secondaryDialogueMessage);
  const steps: VillageInteractionPlanStep[] = [
    {
      kind: 'select-zone',
      zoneKey: target.zone.key,
      announceSelection: false,
    },
  ];

  if (!input.interactionState?.enabled) {
    steps.push({
      kind: 'set-feedback',
      message: input.interactionState?.reason ?? 'Interaction village indisponible.',
    });

    return {
      target,
      action,
      steps,
    };
  }

  const shouldCloseShopPanel = input.villageShopPanelOpen && action.kind !== 'open-shop';
  if (shouldCloseShopPanel) {
    steps.push({
      kind: 'close-shop-panel',
    });
  }

  switch (action.kind) {
    case 'open-shop':
      steps.push({
        kind: 'open-shop-panel',
        shopType: action.shopType,
        feedbackMessage: action.feedbackMessage,
      });
      break;
    case 'talk-npc':
      steps.push({
        kind: 'talk-npc',
        npcKey: action.npcKey,
        successMessage: action.successMessage,
      });
      break;
    case 'secondary-dialogue':
      steps.push({
        kind: 'set-feedback',
        message: input.secondaryDialogueMessage,
      });
      break;
    case 'switch-front-scene':
      steps.push({
        kind: 'switch-front-scene',
        sceneMode: action.sceneMode,
        feedbackMessage: action.feedbackMessage,
      });
      break;
    case 'fallback':
    case 'invalid-action-mapping':
      steps.push({
        kind: 'set-feedback',
        message: action.feedbackMessage,
      });
      break;
  }

  return {
    target,
    action,
    steps,
  };
}
