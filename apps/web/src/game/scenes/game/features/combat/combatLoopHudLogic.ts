import type { GameplayLoopState } from '../../services/payloadNormalizers';

export function getLoopSummaryLabel(params: {
  isAuthenticated: boolean;
  loopBusy: boolean;
  loopState: GameplayLoopState | null;
}): string {
  if (!params.isAuthenticated) {
    return 'Login required';
  }

  if (params.loopBusy && !params.loopState) {
    return 'Loading...';
  }

  if (!params.loopState) {
    return 'No data';
  }

  if (params.loopState.preparation.active) {
    return 'Preparation active';
  }

  return params.loopState.preparation.ready ? 'Preparation ready' : 'Preparation blocked';
}

export function getLoopSuppliesLabel(loopState: GameplayLoopState | null): string {
  if (!loopState) {
    return '-';
  }

  return `Herb ${loopState.supplies.healingHerb} | Tonic ${loopState.supplies.manaTonic}`;
}

export function getLoopPreparationLabel(loopState: GameplayLoopState | null): string {
  if (!loopState) {
    return '-';
  }

  const prep = loopState.preparation;
  if (!prep.active) {
    return prep.ready ? 'Ready to apply' : 'Inactive';
  }

  const bonuses: string[] = [];
  if (prep.hpBoostActive) {
    bonuses.push('+HP');
  }
  if (prep.mpBoostActive) {
    bonuses.push('+MP');
  }
  if (prep.attackBoostActive) {
    bonuses.push('+ATK');
  }

  return bonuses.length > 0 ? bonuses.join(' / ') : 'Active';
}

export function getLoopBlockersLabel(loopState: GameplayLoopState | null): string {
  if (!loopState) {
    return '-';
  }

  if (loopState.preparation.blockers.length > 0) {
    return loopState.preparation.blockers[0] ?? '-';
  }

  return loopState.preparation.nextStep;
}
