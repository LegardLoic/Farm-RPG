export function updateLoopHud(params: {
  loopSummaryLabel: string;
  loopStageLabel: string;
  loopSuppliesLabel: string;
  loopPreparationLabel: string;
  loopBlockersLabel: string;
  loopError: string | null;
  canPrepare: boolean;
  loopBusy: boolean;
  summaryValue: HTMLElement | null;
  stageValue: HTMLElement | null;
  suppliesValue: HTMLElement | null;
  prepValue: HTMLElement | null;
  blockersValue: HTMLElement | null;
  errorValue: HTMLElement | null;
  prepareButton: HTMLButtonElement | null;
}): void {
  if (params.summaryValue) {
    params.summaryValue.textContent = params.loopSummaryLabel;
  }
  if (params.stageValue) {
    params.stageValue.textContent = params.loopStageLabel;
  }
  if (params.suppliesValue) {
    params.suppliesValue.textContent = params.loopSuppliesLabel;
  }
  if (params.prepValue) {
    params.prepValue.textContent = params.loopPreparationLabel;
  }
  if (params.blockersValue) {
    params.blockersValue.textContent = params.loopBlockersLabel;
  }
  if (params.errorValue) {
    params.errorValue.hidden = !params.loopError;
    params.errorValue.textContent = params.loopError ?? '';
  }
  if (params.prepareButton) {
    params.prepareButton.disabled = !params.canPrepare || params.loopBusy;
    params.prepareButton.textContent = params.loopBusy ? 'Preparing...' : 'Prepare combat';
  }
}
