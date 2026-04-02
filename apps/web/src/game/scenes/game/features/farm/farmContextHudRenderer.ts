import type { FarmContextViewModel } from './farmContextLogic';

export function updateFarmContextPanel(params: {
  context: FarmContextViewModel;
  titleValue: HTMLElement | null;
  statusValue: HTMLElement | null;
  plantButton: HTMLButtonElement | null;
  waterButton: HTMLButtonElement | null;
  harvestButton: HTMLButtonElement | null;
}): void {
  if (params.titleValue) {
    params.titleValue.textContent = params.context.title;
  }

  if (params.statusValue) {
    params.statusValue.textContent = params.context.status;
  }
  const selectedPlotKey = params.context.selectedPlotKey;

  const plantButton = params.plantButton;
  if (plantButton) {
    plantButton.dataset.farmAction = 'plant';
    if (selectedPlotKey) {
      plantButton.dataset.plotKey = selectedPlotKey;
    } else {
      delete plantButton.dataset.plotKey;
    }
    plantButton.textContent = params.context.plantLabel;
    plantButton.disabled = !params.context.canPlant;
  }

  const waterButton = params.waterButton;
  if (waterButton) {
    waterButton.dataset.farmAction = 'water';
    if (selectedPlotKey) {
      waterButton.dataset.plotKey = selectedPlotKey;
    } else {
      delete waterButton.dataset.plotKey;
    }
    waterButton.disabled = !params.context.canWater;
  }

  const harvestButton = params.harvestButton;
  if (harvestButton) {
    harvestButton.dataset.farmAction = 'harvest';
    if (selectedPlotKey) {
      harvestButton.dataset.plotKey = selectedPlotKey;
    } else {
      delete harvestButton.dataset.plotKey;
    }
    harvestButton.disabled = !params.context.canHarvest;
  }
}
