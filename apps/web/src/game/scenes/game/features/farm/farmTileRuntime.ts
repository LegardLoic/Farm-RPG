import type { FarmHotbarActionIntent } from '../inventory/inGameInventoryHotbarGameplay';
import type { FarmPlotTile } from './farmTiledMap';

export type FarmTileRuntimeState = {
  tilled: boolean;
  watered: boolean;
  plantedSeedItemKey: string | null;
};

export type FarmTileRuntimeActionResult =
  | {
      handled: false;
      changed: false;
      message: string;
      state: FarmTileRuntimeState | null;
    }
  | {
      handled: true;
      changed: boolean;
      message: string;
      state: FarmTileRuntimeState;
    };

function createEmptyFarmTileRuntimeState(): FarmTileRuntimeState {
  return {
    tilled: false,
    watered: false,
    plantedSeedItemKey: null,
  };
}

export function buildFarmTileRuntimeKey(tileX: number, tileY: number): string {
  return `${Math.trunc(tileX)}:${Math.trunc(tileY)}`;
}

export function createFarmTileRuntimeStateIndex(
  tiles: Iterable<Pick<FarmPlotTile, 'tileX' | 'tileY'>>,
): Map<string, FarmTileRuntimeState> {
  const output = new Map<string, FarmTileRuntimeState>();
  for (const tile of tiles) {
    const tileKey = buildFarmTileRuntimeKey(tile.tileX, tile.tileY);
    if (!output.has(tileKey)) {
      output.set(tileKey, createEmptyFarmTileRuntimeState());
    }
  }
  return output;
}

export function applyFarmTileRuntimeAction(params: {
  tileKey: string;
  stateIndex: Map<string, FarmTileRuntimeState>;
  intent: FarmHotbarActionIntent;
}): FarmTileRuntimeActionResult {
  const state = params.stateIndex.get(params.tileKey);
  if (!state) {
    return {
      handled: false,
      changed: false,
      message: 'Tuile non cultivable.',
      state: null,
    };
  }

  if (params.intent.kind === 'none') {
    return {
      handled: false,
      changed: false,
      message: params.intent.reason === 'empty-slot'
        ? 'Slot actif vide. Selectionne une houe, un arrosoir, une faux ou une graine.'
        : 'Item actif incompatible avec les actions de ferme.',
      state,
    };
  }

  if (params.intent.kind === 'till') {
    if (state.plantedSeedItemKey) {
      return {
        handled: true,
        changed: false,
        message: 'Parcelle deja semee.',
        state,
      };
    }

    if (state.tilled) {
      return {
        handled: true,
        changed: false,
        message: state.watered ? 'Parcelle deja prete a planter.' : 'Parcelle deja labouree.',
        state,
      };
    }

    state.tilled = true;
    state.watered = false;
    state.plantedSeedItemKey = null;
    return {
      handled: true,
      changed: true,
      message: 'Terre labouree.',
      state,
    };
  }

  if (params.intent.kind === 'water') {
    if (!state.tilled) {
      return {
        handled: true,
        changed: false,
        message: 'Laboure la terre avant d arroser.',
        state,
      };
    }

    if (state.plantedSeedItemKey) {
      return {
        handled: true,
        changed: false,
        message: 'Parcelle deja semee.',
        state,
      };
    }

    if (state.watered) {
      return {
        handled: true,
        changed: false,
        message: 'Parcelle deja arrosee.',
        state,
      };
    }

    state.watered = true;
    return {
      handled: true,
      changed: true,
      message: 'Terre arrosee.',
      state,
    };
  }

  if (params.intent.kind === 'plant') {
    const seedItemKey = params.intent.seedItemKey.trim().toLowerCase();
    if (!seedItemKey) {
      return {
        handled: true,
        changed: false,
        message: 'Selectionne une graine avant de planter.',
        state,
      };
    }

    if (!state.tilled) {
      return {
        handled: true,
        changed: false,
        message: 'Laboure la terre avant de planter.',
        state,
      };
    }

    if (!state.watered) {
      return {
        handled: true,
        changed: false,
        message: 'Arrose la terre avant de planter.',
        state,
      };
    }

    if (state.plantedSeedItemKey) {
      return {
        handled: true,
        changed: false,
        message: 'Parcelle deja semee.',
        state,
      };
    }

    state.plantedSeedItemKey = seedItemKey;
    return {
      handled: true,
      changed: true,
      message: 'Graine plantee.',
      state,
    };
  }

  if (!state.plantedSeedItemKey) {
    return {
      handled: true,
      changed: false,
      message: 'Aucune recolte sur cette parcelle.',
      state,
    };
  }

  params.stateIndex.set(params.tileKey, createEmptyFarmTileRuntimeState());
  return {
    handled: true,
    changed: true,
    message: 'Recolte effectuee.',
    state: params.stateIndex.get(params.tileKey)!,
  };
}
