import type { FarmPlotStateLike } from './farmLogic';

export type FarmContextViewModel = {
  title: string;
  status: string;
  selectedPlotKey: string | null;
  plantLabel: string;
  canPlant: boolean;
  canWater: boolean;
  canHarvest: boolean;
};

export function buildFarmContextViewModel(params: {
  isAuthenticated: boolean;
  farmUnlocked: boolean;
  selectedPlot: FarmPlotStateLike | null;
  selectedSeedItemKey: string;
  farmBusy: boolean;
  getFarmPlotStatusLabel: (plot: FarmPlotStateLike) => string;
  formatFarmLabel: (raw: string) => string;
}): FarmContextViewModel {
  const canUseFarm = Boolean(params.isAuthenticated && params.farmUnlocked);

  const title = params.selectedPlot
    ? `Parcelle ${params.selectedPlot.row}-${params.selectedPlot.col}`
    : !canUseFarm
      ? 'Ferme indisponible'
      : 'Selectionne une parcelle';

  let status = '';
  if (!params.isAuthenticated) {
    status = 'Connecte-toi pour lancer la boucle agricole.';
  } else if (!params.farmUnlocked) {
    status = 'Termine l intro pour recuperer officiellement la ferme.';
  } else if (!params.selectedPlot) {
    status = 'Selectionne une parcelle depuis la scene ou la grille.';
  } else {
    status = params.getFarmPlotStatusLabel(params.selectedPlot);
  }

  const canPlant = Boolean(
    canUseFarm &&
      params.selectedPlot &&
      !params.selectedPlot.cropKey &&
      params.selectedSeedItemKey,
  );
  const canWater = Boolean(canUseFarm && params.selectedPlot?.cropKey && !params.selectedPlot.wateredToday);
  const canHarvest = Boolean(
    canUseFarm &&
      params.selectedPlot?.cropKey &&
      params.selectedPlot.readyToHarvest,
  );

  return {
    title,
    status,
    selectedPlotKey: params.selectedPlot?.plotKey ?? null,
    plantLabel: params.selectedSeedItemKey
      ? `Planter (${params.formatFarmLabel(params.selectedSeedItemKey)})`
      : 'Planter',
    canPlant: !params.farmBusy && canPlant,
    canWater: !params.farmBusy && canWater,
    canHarvest: !params.farmBusy && canHarvest,
  };
}
