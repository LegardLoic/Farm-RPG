import type { HeroAppearanceKey, HeroProfileState, IntroNarrativeState } from '../../gameScene.stateTypes';

type FetchJson = (path: string, init?: RequestInit) => Promise<unknown>;
type HudUpdater = () => void;
type AsyncRefresh = () => Promise<void>;
type ErrorMessageFormatter = (error: unknown, fallback: string) => string;

export async function runSaveHeroProfileAction(input: {
  isAuthenticated: boolean;
  heroProfileBusy: boolean;
  heroProfileNameDraft: string;
  heroProfileAppearanceDraft: HeroAppearanceKey;
  fetchJson: FetchJson;
  normalizeHeroProfilePayload: (payload: unknown) => HeroProfileState | null;
  setHeroProfileBusy: (busy: boolean) => void;
  setHeroProfileError: (error: string | null) => void;
  setHeroProfileMessage: (message: string | null) => void;
  setHeroProfile: (profile: HeroProfileState | null) => void;
  setHeroProfileNameDraft: (name: string) => void;
  setHeroProfileAppearanceDraft: (appearance: HeroAppearanceKey) => void;
  getErrorMessage: ErrorMessageFormatter;
  updateHud: HudUpdater;
}): Promise<void> {
  if (!input.isAuthenticated) {
    input.setHeroProfileError('Login required to create hero profile.');
    input.updateHud();
    return;
  }

  if (input.heroProfileBusy) {
    return;
  }

  const heroName = input.heroProfileNameDraft.trim();
  if (heroName.length < 2 || heroName.length > 24) {
    input.setHeroProfileError('Hero name must contain 2-24 characters.');
    input.updateHud();
    return;
  }

  input.setHeroProfileBusy(true);
  input.setHeroProfileError(null);
  input.setHeroProfileMessage(null);
  input.updateHud();

  try {
    const payload = await input.fetchJson('/profile', {
      method: 'PUT',
      body: JSON.stringify({
        heroName,
        appearanceKey: input.heroProfileAppearanceDraft,
      }),
    });
    const profile = input.normalizeHeroProfilePayload(payload);
    if (profile) {
      input.setHeroProfile(profile);
      input.setHeroProfileNameDraft(profile.heroName);
      input.setHeroProfileAppearanceDraft(profile.appearanceKey);
      input.setHeroProfileMessage('Profil hero sauvegarde.');
    } else {
      input.setHeroProfileError('Profile payload missing in response.');
    }
  } catch (error) {
    input.setHeroProfileError(input.getErrorMessage(error, 'Unable to save hero profile.'));
  } finally {
    input.setHeroProfileBusy(false);
    input.updateHud();
  }
}

export async function runAdvanceIntroNarrativeAction(input: {
  isAuthenticated: boolean;
  introNarrativeBusy: boolean;
  introNarrativeCompleted: boolean;
  fetchJson: FetchJson;
  normalizeGameplayIntroPayload: (payload: unknown) => IntroNarrativeState | null;
  refreshGameplayState: AsyncRefresh;
  setIntroNarrativeBusy: (busy: boolean) => void;
  setIntroNarrativeError: (error: string | null) => void;
  setIntroNarrativeState: (state: IntroNarrativeState) => void;
  getErrorMessage: ErrorMessageFormatter;
  updateHud: HudUpdater;
}): Promise<void> {
  if (!input.isAuthenticated) {
    input.setIntroNarrativeError('Login required to continue intro.');
    input.updateHud();
    return;
  }

  if (input.introNarrativeBusy || input.introNarrativeCompleted) {
    return;
  }

  input.setIntroNarrativeBusy(true);
  input.setIntroNarrativeError(null);
  input.updateHud();

  try {
    const payload = await input.fetchJson('/gameplay/intro/advance', {
      method: 'POST',
    });
    const introState = input.normalizeGameplayIntroPayload(payload);
    if (introState) {
      input.setIntroNarrativeState(introState);
    }

    await input.refreshGameplayState();
  } catch (error) {
    input.setIntroNarrativeError(input.getErrorMessage(error, 'Unable to continue intro sequence.'));
  } finally {
    input.setIntroNarrativeBusy(false);
    input.updateHud();
  }
}
