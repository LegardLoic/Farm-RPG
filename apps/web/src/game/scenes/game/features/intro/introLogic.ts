import type {
  HeroAppearanceKey,
  HeroProfileState,
  IntroNarrativeState,
  IntroNarrativeStepKey,
} from '../../gameScene.stateTypes';

export type HeroAppearanceOption = {
  key: HeroAppearanceKey;
  label: string;
};

export type IntroPayloadParsers = {
  asRecord: (value: unknown) => Record<string, unknown> | null;
  asString: (value: unknown) => string | null;
};

export function getIntroSummaryLabel(params: {
  isAuthenticated: boolean;
  introNarrativeBusy: boolean;
  introNarrativeState: IntroNarrativeState | null;
}): string {
  if (!params.isAuthenticated) {
    return 'Connexion requise';
  }

  if (params.introNarrativeBusy && !params.introNarrativeState) {
    return 'Chargement...';
  }

  if (!params.introNarrativeState) {
    return 'Pre-intro';
  }

  if (params.introNarrativeState.completed) {
    return 'Intro terminee';
  }

  if (params.introNarrativeState.currentStep === 'arrive_village') {
    return 'Acte 1/3';
  }

  if (params.introNarrativeState.currentStep === 'meet_mayor') {
    return 'Acte 2/3';
  }

  return 'Acte 3/3';
}

export function getIntroNarrativeLabel(
  isAuthenticated: boolean,
  state: IntroNarrativeState | null,
): string {
  if (!isAuthenticated) {
    return 'Connecte toi pour lancer la sequence d intro.';
  }

  if (!state || state.currentStep === 'arrive_village') {
    return 'Tu arrives au village de Briseterre. Les habitants observent ton chariot charge de graines et de vieux outils.';
  }

  if (state.currentStep === 'meet_mayor') {
    return 'Le maire Elric te recoit sur la place. Il te presente la Tour maudite et te demande de renforcer les defenses du village.';
  }

  if (state.currentStep === 'farm_assignment') {
    return 'Le maire t attribue une parcelle a la lisiere du village. Cette ferme deviendra ta base entre deux expeditions.';
  }

  return 'Intro completee. Tu peux desormais alterner progression tour et preparation de ferme.';
}

export function getIntroHintLabel(
  isAuthenticated: boolean,
  state: IntroNarrativeState | null,
): string {
  if (!isAuthenticated) {
    return 'Connecte ton compte puis clique sur "Continuer intro".';
  }

  if (state?.completed) {
    return 'Prochaine etape: lot ferme/village pour rendre la parcelle jouable.';
  }

  return 'Clique sur "Continuer intro" pour valider la prochaine scene narrative.';
}

export function getIntroProgressLabel(state: IntroNarrativeState | null): string {
  if (!state) {
    return 'Progression: 0/3';
  }

  const completedSteps =
    Number(state.steps.arriveVillage) +
    Number(state.steps.metMayor) +
    Number(state.steps.farmAssigned);
  return `Progression: ${completedSteps}/3`;
}

export function getIntroAdvanceButtonLabel(
  isAuthenticated: boolean,
  state: IntroNarrativeState | null,
): string {
  if (!isAuthenticated) {
    return 'Connexion requise';
  }

  if (state?.completed) {
    return 'Intro completee';
  }

  return 'Continuer intro';
}

export function getHeroAppearanceLabel(
  key: HeroAppearanceKey,
  options: HeroAppearanceOption[],
): string {
  const option = options.find((entry) => entry.key === key);
  return option ? option.label : 'Fermier classique';
}

export function getHeroProfileSummaryLabel(params: {
  isAuthenticated: boolean;
  heroProfileBusy: boolean;
  heroProfile: HeroProfileState | null;
  getHeroAppearanceLabel: (key: HeroAppearanceKey) => string;
}): string {
  if (!params.isAuthenticated) {
    return 'Connexion requise';
  }

  if (params.heroProfileBusy && !params.heroProfile) {
    return 'Chargement...';
  }

  if (!params.heroProfile) {
    return 'Non cree';
  }

  return `${params.heroProfile.heroName} | ${params.getHeroAppearanceLabel(params.heroProfile.appearanceKey)}`;
}

export function normalizeGameplayIntroPayload(
  payload: unknown,
  parsers: IntroPayloadParsers,
  isIntroNarrativeStepKey: (value: string) => value is IntroNarrativeStepKey,
): IntroNarrativeState | null {
  const root = parsers.asRecord(payload);
  if (!root) {
    return null;
  }

  const introRecord = parsers.asRecord(root.intro) ?? root;
  const currentStepRaw = parsers.asString(introRecord.currentStep);
  if (!currentStepRaw || !isIntroNarrativeStepKey(currentStepRaw)) {
    return null;
  }

  const steps = parsers.asRecord(introRecord.steps);
  return {
    currentStep: currentStepRaw,
    completed: Boolean(introRecord.completed),
    steps: {
      arriveVillage: Boolean(steps?.arriveVillage),
      metMayor: Boolean(steps?.metMayor),
      farmAssigned: Boolean(steps?.farmAssigned),
    },
  };
}

