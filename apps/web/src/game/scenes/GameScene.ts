import Phaser from 'phaser';
import { API_BASE_URL } from '../../config/env';

type HudState = {
  day: number;
  gold: number;
  level: number;
  xp: number;
  xpToNext: number;
  towerCurrentFloor: number;
  towerHighestFloor: number;
  towerBossFloor10Defeated: boolean;
  blacksmithUnlocked: boolean;
  blacksmithCurseLifted: boolean;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  stamina: number;
  area: string;
};

type CombatStatus = 'active' | 'won' | 'lost' | 'fled';
type CombatTurn = 'player' | 'enemy';
type CombatUiStatus = CombatStatus | 'idle' | 'loading' | 'error';
type CombatActionName =
  | 'attack'
  | 'defend'
  | 'fireball'
  | 'rally'
  | 'sunder'
  | 'mend'
  | 'cleanse'
  | 'interrupt';
type QuestStatus = 'active' | 'completed' | 'claimed';
type DebugQaActionName =
  | 'grant-resources'
  | 'set-tower-floor'
  | 'apply-state-preset'
  | 'apply-loadout-preset'
  | 'complete-quests'
  | 'set-world-flags'
  | 'set-quest-status';
type DebugLoadoutPresetKey = 'starter' | 'tower_mid' | 'boss_trial';
type DebugStatePresetKey = 'village_open' | 'mid_tower' | 'act1_done';
type DebugQaStatus = 'idle' | 'loading' | 'success' | 'error';

const FIREBALL_MANA_COST = 5;
const RALLY_MANA_COST = 3;
const SUNDER_MANA_COST = 4;
const MEND_MANA_COST = 4;
const CLEANSE_MANA_COST = 3;
const INTERRUPT_MANA_COST = 5;

type CombatUnitState = {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  magicAttack: number;
  speed: number;
  defending: boolean;
};

type CombatEnemyState = {
  key: string;
  name: string;
  hp: number;
  mp: number;
  currentHp: number;
  currentMp: number;
  attack: number;
  defense: number;
  magicAttack: number;
  speed: number;
};

type CombatEncounterState = {
  id: string;
  status: CombatStatus;
  turn: CombatTurn;
  round: number;
  logs: string[];
  scriptState?: Record<string, boolean | number | string>;
  player: CombatUnitState;
  enemy: CombatEnemyState;
  lastAction: string | null;
  createdAt: string | undefined;
  updatedAt: string | undefined;
  endedAt: string | null | undefined;
};

type QuestObjectiveState = {
  key: string;
  description: string;
  current: number;
  target: number;
  completed: boolean;
};

type QuestState = {
  key: string;
  title: string;
  description: string;
  status: QuestStatus;
  canClaim: boolean;
  objectives: QuestObjectiveState[];
};

type BlacksmithOfferState = {
  offerKey: string;
  itemKey: string;
  name: string;
  description: string;
  goldPrice: number;
};

type AutoSaveState = {
  version: number;
  reason: string;
  updatedAt: string;
};

type SaveSlotState = {
  slot: number;
  exists: boolean;
  version: number | null;
  label: string | null;
  updatedAt: string | null;
  preview: SaveSlotPreview | null;
};

type SaveSlotPreview = {
  playerLevel: number | null;
  gold: number | null;
  towerCurrentFloor: number | null;
  towerHighestFloor: number | null;
  inventoryTop: Array<{ itemKey: string; quantity: number }>;
  equipmentTop: Array<{ slot: string; itemKey: string }>;
  equippedCount: number;
};

type DebugQaPresetOption = {
  key: string;
  label: string;
};

const DEBUG_QA_PRESET_OPTIONS: DebugQaPresetOption[] = [
  { key: 'starter', label: 'Starter' },
  { key: 'tower_mid', label: 'Tower mid' },
  { key: 'boss_trial', label: 'Boss trial' },
];

const DEBUG_QA_STATE_PRESET_OPTIONS: Array<{ key: DebugStatePresetKey; label: string }> = [
  { key: 'village_open', label: 'Village open' },
  { key: 'mid_tower', label: 'Mid tower' },
  { key: 'act1_done', label: 'Act 1 done' },
];

const DEBUG_QA_QUEST_STATUS_OPTIONS: Array<{ key: QuestStatus; label: string }> = [
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'claimed', label: 'Claimed' },
];

function isDebugQaActionName(value: string): value is DebugQaActionName {
  return (
    value === 'grant-resources' ||
    value === 'set-tower-floor' ||
    value === 'apply-state-preset' ||
    value === 'apply-loadout-preset' ||
    value === 'complete-quests' ||
    value === 'set-world-flags' ||
    value === 'set-quest-status'
  );
}

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };

  private hudRoot: HTMLElement | null = null;
  private loginButton: HTMLButtonElement | null = null;
  private logoutButton: HTMLButtonElement | null = null;
  private combatStartButton: HTMLButtonElement | null = null;
  private combatAttackButton: HTMLButtonElement | null = null;
  private combatDefendButton: HTMLButtonElement | null = null;
  private combatFireballButton: HTMLButtonElement | null = null;
  private combatRallyButton: HTMLButtonElement | null = null;
  private combatSunderButton: HTMLButtonElement | null = null;
  private combatMendButton: HTMLButtonElement | null = null;
  private combatCleanseButton: HTMLButtonElement | null = null;
  private combatInterruptButton: HTMLButtonElement | null = null;
  private combatForfeitButton: HTMLButtonElement | null = null;
  private combatLogsList: HTMLElement | null = null;
  private combatStatusBadge: HTMLElement | null = null;
  private combatErrorValue: HTMLElement | null = null;
  private questsSummaryValue: HTMLElement | null = null;
  private questsListRoot: HTMLElement | null = null;
  private questsErrorValue: HTMLElement | null = null;
  private blacksmithSummaryValue: HTMLElement | null = null;
  private blacksmithOffersRoot: HTMLElement | null = null;
  private blacksmithErrorValue: HTMLElement | null = null;
  private autosaveSummaryValue: HTMLElement | null = null;
  private autosaveMetaValue: HTMLElement | null = null;
  private autosaveActionsRoot: HTMLElement | null = null;
  private autosaveErrorValue: HTMLElement | null = null;
  private saveSlotsSummaryValue: HTMLElement | null = null;
  private saveSlotsListRoot: HTMLElement | null = null;
  private saveSlotsErrorValue: HTMLElement | null = null;

  private authStatus = 'Verification...';
  private isAuthenticated = false;
  private hudState: HudState = {
    day: 1,
    gold: 120,
    level: 1,
    xp: 0,
    xpToNext: 100,
    towerCurrentFloor: 1,
    towerHighestFloor: 1,
    towerBossFloor10Defeated: false,
    blacksmithUnlocked: false,
    blacksmithCurseLifted: false,
    hp: 32,
    maxHp: 32,
    mp: 15,
    maxMp: 15,
    stamina: 8,
    area: 'Ferme',
  };

  private combatEncounterId: string | null = null;
  private combatStatus: CombatUiStatus = 'idle';
  private combatState: CombatEncounterState | null = null;
  private combatLogs: string[] = [];
  private combatMessage = 'Aucun combat actif.';
  private combatError: string | null = null;
  private combatBusy = false;
  private quests: QuestState[] = [];
  private questBusy = false;
  private questError: string | null = null;
  private questsRenderSignature = '';
  private blacksmithOffers: BlacksmithOfferState[] = [];
  private blacksmithBusy = false;
  private blacksmithError: string | null = null;
  private blacksmithRenderSignature = '';
  private autosave: AutoSaveState | null = null;
  private autosaveBusy = false;
  private autosaveRestoreSlotBusy: number | null = null;
  private autosaveError: string | null = null;
  private autosaveRenderSignature = '';
  private saveSlots: SaveSlotState[] = [];
  private saveSlotsBusy = false;
  private saveSlotsActionBusyKey: string | null = null;
  private saveSlotsLoadConfirmSlot: number | null = null;
  private saveSlotsError: string | null = null;
  private saveSlotsRenderSignature = '';

  private debugQaPanelRoot: HTMLElement | null = null;
  private debugQaStatusValue: HTMLElement | null = null;
  private debugQaMessageValue: HTMLElement | null = null;
  private debugQaGrantXpInput: HTMLInputElement | null = null;
  private debugQaGrantGoldInput: HTMLInputElement | null = null;
  private debugQaTowerFloorInput: HTMLInputElement | null = null;
  private debugQaStatePresetSelect: HTMLSelectElement | null = null;
  private debugQaQuestKeyInput: HTMLInputElement | null = null;
  private debugQaQuestStatusSelect: HTMLSelectElement | null = null;
  private debugQaLoadoutPresetSelect: HTMLSelectElement | null = null;
  private debugQaWorldFlagsInput: HTMLTextAreaElement | null = null;
  private debugQaWorldFlagsRemoveInput: HTMLTextAreaElement | null = null;
  private debugQaWorldFlagsReplaceInput: HTMLInputElement | null = null;
  private debugQaGrantButton: HTMLButtonElement | null = null;
  private debugQaTowerFloorButton: HTMLButtonElement | null = null;
  private debugQaStatePresetButton: HTMLButtonElement | null = null;
  private debugQaSetQuestStatusButton: HTMLButtonElement | null = null;
  private debugQaLoadoutButton: HTMLButtonElement | null = null;
  private debugQaCompleteQuestsButton: HTMLButtonElement | null = null;
  private debugQaSetWorldFlagsButton: HTMLButtonElement | null = null;
  private debugQaBusyAction: DebugQaActionName | null = null;
  private debugQaStatus: DebugQaStatus = 'idle';
  private debugQaMessage: string | null = null;
  private debugQaError: string | null = null;
  private readonly debugQaEnabled = import.meta.env.DEV || import.meta.env.MODE === 'staging';

  private readonly onHudClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest('button') as HTMLButtonElement | null;
    if (!button || button.disabled) {
      return;
    }

    const hudAction = button.dataset.hudAction;
    const combatAction = button.dataset.combatAction;
    const questAction = button.dataset.questAction;
    const shopAction = button.dataset.shopAction;
    const saveAction = button.dataset.saveAction;
    const debugAction = button.dataset.debugAction;

    if (hudAction === 'login') {
      window.location.href = `${API_BASE_URL}/auth/google`;
      return;
    }

    if (hudAction === 'logout') {
      void this.logout();
      return;
    }

    if (combatAction === 'start') {
      void this.startCombat();
      return;
    }

    if (
      combatAction === 'attack' ||
      combatAction === 'defend' ||
      combatAction === 'fireball' ||
      combatAction === 'cleanse' ||
      combatAction === 'interrupt' ||
      combatAction === 'rally' ||
      combatAction === 'sunder' ||
      combatAction === 'mend'
    ) {
      void this.performCombatAction(combatAction);
      return;
    }

    if (combatAction === 'forfeit') {
      void this.forfeitCombat();
      return;
    }

    if (questAction === 'claim') {
      const questKey = button.dataset.questKey;
      if (questKey) {
        void this.claimQuest(questKey);
      }
      return;
    }

    if (shopAction === 'buy') {
      const offerKey = button.dataset.offerKey;
      if (offerKey) {
        void this.buyBlacksmithOffer(offerKey);
      }
      return;
    }

    if (saveAction) {
      const rawSlot = button.dataset.slot;
      const slot = rawSlot ? Number(rawSlot) : NaN;
      if (!Number.isInteger(slot) || slot < 1 || slot > 3) {
        return;
      }

      if (saveAction === 'restore') {
        void this.restoreAutoSaveToSlot(slot);
        return;
      }

      if (saveAction === 'capture') {
        void this.captureSaveSlot(slot);
        return;
      }

      if (saveAction === 'load') {
        this.toggleLoadSaveSlotConfirmation(slot);
        return;
      }

      if (saveAction === 'confirm-load') {
        void this.loadSaveSlot(slot);
        return;
      }

      if (saveAction === 'cancel-load') {
        this.clearLoadSaveSlotConfirmation(slot);
        return;
      }

      if (saveAction === 'delete') {
        void this.deleteSaveSlot(slot);
      }
    }

    if (debugAction && isDebugQaActionName(debugAction)) {
      void this.handleDebugQaAction(debugAction);
    }
  };

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.setupWorld();
    this.setupPlayer();
    this.setupInput();
    this.setupHud();
    void this.bootstrapSessionState();
    this.setupCamera();
    this.drawDecor();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.teardownHud();
    });
  }

  update(): void {
    const speed = 140;
    const body = this.player.body;

    if (!body) {
      return;
    }

    const left = this.cursors.left?.isDown || this.wasd.left.isDown;
    const right = this.cursors.right?.isDown || this.wasd.right.isDown;
    const up = this.cursors.up?.isDown || this.wasd.up.isDown;
    const down = this.cursors.down?.isDown || this.wasd.down.isDown;

    let velocityX = 0;
    let velocityY = 0;

    if (left) {
      velocityX -= speed;
    }
    if (right) {
      velocityX += speed;
    }
    if (up) {
      velocityY -= speed;
    }
    if (down) {
      velocityY += speed;
    }

    body.setVelocity(velocityX, velocityY);

    if (velocityX !== 0 && velocityY !== 0) {
      body.velocity.normalize().scale(speed);
    }

    if (velocityX !== 0 || velocityY !== 0) {
      this.hudState.stamina = Math.max(0, this.hudState.stamina - 0.01);
    }

    this.player.setTint(velocityX !== 0 || velocityY !== 0 ? 0xd8f1ff : 0xffffff);
    this.updateHud();
  }

  private setupWorld(): void {
    this.physics.world.setBounds(0, 0, 1600, 900);
    this.cameras.main.setBounds(0, 0, 1600, 900);
  }

  private setupPlayer(): void {
    const textureKey = 'player-hero';
    if (!this.textures.exists(textureKey)) {
      const graphics = this.add.graphics();
      graphics.fillStyle(0x9fd2ff, 1);
      graphics.fillRoundedRect(0, 0, 18, 26, 5);
      graphics.lineStyle(2, 0xf2d6a2, 1);
      graphics.strokeRoundedRect(0, 0, 18, 26, 5);
      graphics.generateTexture(textureKey, 18, 26);
      graphics.destroy();
    }

    this.player = this.physics.add.sprite(240, 220, textureKey);
    this.player.setCollideWorldBounds(true);
    this.player.setSize(14, 22);
    this.player.setOffset(2, 2);

    const obstacles = [
      this.createObstacle(360, 220, 84, 28),
      this.createObstacle(510, 260, 36, 96),
      this.createObstacle(890, 180, 120, 34),
      this.createObstacle(1180, 520, 110, 30),
      this.createObstacle(1250, 620, 34, 120),
    ];

    for (const obstacle of obstacles) {
      this.physics.add.collider(this.player, obstacle);
    }
  }

  private setupInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  private setupHud(): void {
    this.hudRoot = document.getElementById('hud-root');
    if (!this.hudRoot) {
      throw new Error('HUD root not found. Expected #hud-root in index.html.');
    }

    this.hudRoot.innerHTML = `
      <div class="hud-panel">
        <div class="hud-title">Journal de ferme</div>
        <div class="hud-grid">
          <div class="hud-stat"><span>Jour</span><strong data-hud="day"></strong></div>
          <div class="hud-stat"><span>Or</span><strong data-hud="gold"></strong></div>
          <div class="hud-stat"><span>Niveau</span><strong data-hud="level"></strong></div>
          <div class="hud-stat"><span>XP</span><strong data-hud="xp"></strong></div>
          <div class="hud-stat"><span>Etage</span><strong data-hud="towerFloor"></strong></div>
          <div class="hud-stat"><span>Boss 10</span><strong data-hud="towerBoss10"></strong></div>
          <div class="hud-stat"><span>Forgeron</span><strong data-hud="blacksmithStatus"></strong></div>
          <div class="hud-stat"><span>PV</span><strong data-hud="hp"></strong></div>
          <div class="hud-stat"><span>PM</span><strong data-hud="mp"></strong></div>
          <div class="hud-stat"><span>Endurance</span><strong data-hud="stamina"></strong></div>
        </div>
        <div class="hud-location">
          <span>Zone</span>
          <strong data-hud="area"></strong>
        </div>
        <div class="hud-auth">
          <span class="hud-auth-status" data-hud="authStatus"></span>
          <div class="hud-auth-actions">
            <button class="hud-auth-button" data-hud-action="login">Connexion Google</button>
            <button class="hud-auth-button secondary" data-hud-action="logout" hidden>Se deconnecter</button>
          </div>
        </div>
        <div class="hud-combat">
          <div class="hud-combat-header">
            <div>
              <div class="hud-combat-kicker">Combat tour par tour</div>
              <div class="hud-combat-name" data-hud="combatName">Aucun combat actif</div>
            </div>
            <div class="hud-combat-status" data-hud="combatStatus"></div>
          </div>
          <div class="hud-combat-meta">
            <div class="hud-combat-stat"><span>Encounter</span><strong data-hud="combatEncounterId">-</strong></div>
            <div class="hud-combat-stat"><span>Tour</span><strong data-hud="combatTurn">-</strong></div>
            <div class="hud-combat-stat"><span>Round</span><strong data-hud="combatRound">-</strong></div>
            <div class="hud-combat-stat"><span>Resultat</span><strong data-hud="combatResult">Aucun combat actif.</strong></div>
          </div>
          <div class="hud-combat-grid">
            <div class="combat-card">
              <span>Player</span>
              <div class="combat-card-line"><span>HP</span><strong data-hud="combatPlayerHp">-</strong></div>
              <div class="combat-card-line"><span>MP</span><strong data-hud="combatPlayerMp">-</strong></div>
              <div class="combat-card-line"><span>Effects</span><strong data-hud="combatPlayerEffects">-</strong></div>
            </div>
            <div class="combat-card enemy">
              <span>Enemy</span>
              <div class="combat-card-line"><span>Name</span><strong data-hud="combatEnemyName">-</strong></div>
              <div class="combat-card-line"><span>HP</span><strong data-hud="combatEnemyHp">-</strong></div>
              <div class="combat-card-line"><span>MP</span><strong data-hud="combatEnemyMp">-</strong></div>
              <div class="combat-card-line"><span>Effects</span><strong data-hud="combatEnemyEffects">-</strong></div>
              <div class="combat-card-line"><span>Intent</span><strong data-hud="combatEnemyIntent">-</strong></div>
              <div class="combat-card-line"><span>Next</span><strong data-hud="combatEnemyIntentNext">-</strong></div>
            </div>
          </div>
          <div class="hud-intent-help">
            <button type="button" class="hud-intent-help-trigger" aria-label="Aide tags intent">
              ? Tags Intent
            </button>
            <div class="hud-intent-help-popover" role="note">
              <div class="hud-intent-help-line"><strong>ATK</strong><span>attaque physique</span></div>
              <div class="hud-intent-help-line"><strong>MAG</strong><span>attaque magique</span></div>
              <div class="hud-intent-help-line"><strong>CLN</strong><span>retire un debuff ennemi</span></div>
              <div class="hud-intent-help-line"><strong>DSP</strong><span>retire un buff joueur</span></div>
              <div class="hud-intent-help-line"><strong>ULT</strong><span>attaque ultime</span></div>
            </div>
          </div>
          <div class="hud-loot-legend" aria-label="Legende des raretes de loot">
            <div class="hud-loot-legend-header">
              <span>Raretés loot</span>
              <strong>Code couleur</strong>
            </div>
            <div class="hud-loot-legend-pills" role="list">
              <span class="loot-rarity-pill" data-rarity="common" role="listitem">Common</span>
              <span class="loot-rarity-pill" data-rarity="uncommon" role="listitem">Uncommon</span>
              <span class="loot-rarity-pill" data-rarity="rare" role="listitem">Rare</span>
              <span class="loot-rarity-pill" data-rarity="epic" role="listitem">Epic</span>
              <span class="loot-rarity-pill" data-rarity="legendary" role="listitem">Legendary</span>
            </div>
          </div>
          <div class="hud-combat-actions">
            <button class="hud-combat-button primary" data-combat-action="start">Demarrer combat</button>
            <button class="hud-combat-button" data-combat-action="attack">Attack</button>
            <button class="hud-combat-button secondary" data-combat-action="defend">Defend</button>
            <button class="hud-combat-button" data-combat-action="fireball">Fireball</button>
            <button class="hud-combat-button secondary" data-combat-action="mend">Mend (+HP)</button>
            <button class="hud-combat-button secondary" data-combat-action="cleanse">Cleanse</button>
            <button class="hud-combat-button" data-combat-action="interrupt">Interrupt</button>
            <button class="hud-combat-button secondary" data-combat-action="rally">Rally (+Atk)</button>
            <button class="hud-combat-button" data-combat-action="sunder">Sunder (-Def)</button>
            <button class="hud-combat-button danger" data-combat-action="forfeit">Fuir</button>
          </div>
          <div class="hud-combat-error" data-hud="combatError" hidden></div>
          <ul class="hud-combat-log" data-hud="combatLogs"></ul>
        </div>
        <div class="hud-quests">
          <div class="hud-quests-header">
            <span>Quests</span>
            <strong data-hud="questsSummary">No quests loaded.</strong>
          </div>
          <div class="hud-quests-error" data-hud="questsError" hidden></div>
          <ul class="hud-quests-list" data-hud="questsList"></ul>
        </div>
        <div class="hud-blacksmith">
          <div class="hud-blacksmith-header">
            <span>Blacksmith Shop</span>
            <strong data-hud="blacksmithSummary">Locked</strong>
          </div>
          <div class="hud-blacksmith-error" data-hud="blacksmithError" hidden></div>
          <ul class="hud-blacksmith-list" data-hud="blacksmithOffers"></ul>
        </div>
        <div class="hud-autosave">
          <div class="hud-autosave-header">
            <span>Autosave</span>
            <strong data-hud="autosaveSummary">No autosave</strong>
          </div>
          <div class="hud-autosave-meta" data-hud="autosaveMeta">-</div>
          <div class="hud-autosave-error" data-hud="autosaveError" hidden></div>
          <div class="hud-autosave-actions" data-hud="autosaveActions"></div>
        </div>
        <div class="hud-saves">
          <div class="hud-saves-header">
            <span>Save Slots</span>
            <strong data-hud="savesSummary">No slot data</strong>
          </div>
          <div class="hud-saves-error" data-hud="savesError" hidden></div>
          <ul class="hud-saves-list" data-hud="savesList"></ul>
        </div>
        ${
          this.debugQaEnabled
            ? `
        <div class="hud-debug-qa">
          <div class="hud-debug-qa-header">
            <span>Debug QA</span>
            <strong data-hud="debugQaStatus">Idle</strong>
          </div>
          <div class="hud-debug-qa-message" data-hud="debugQaMessage" hidden></div>
          <div class="hud-debug-qa-grid">
            <label class="hud-debug-qa-field">
              <span>Grant XP</span>
              <input data-hud="debugQaXp" type="number" min="0" step="10" value="250" />
            </label>
            <label class="hud-debug-qa-field">
              <span>Grant Gold</span>
              <input data-hud="debugQaGold" type="number" min="0" step="10" value="500" />
            </label>
            <label class="hud-debug-qa-field">
              <span>Tower Floor</span>
              <input data-hud="debugQaFloor" type="number" min="1" max="10" step="1" value="10" />
            </label>
            <label class="hud-debug-qa-field debug-qa-field-wide">
              <span>State preset</span>
              <select data-hud="debugQaStatePreset">
                ${DEBUG_QA_STATE_PRESET_OPTIONS.map((preset) => `<option value="${preset.key}">${preset.label}</option>`).join('')}
              </select>
            </label>
            <label class="hud-debug-qa-field debug-qa-field-wide">
              <span>Quest key</span>
              <input data-hud="debugQaQuestKey" type="text" placeholder="story_floor_8" value="story_floor_8" />
            </label>
            <label class="hud-debug-qa-field">
              <span>Quest status</span>
              <select data-hud="debugQaQuestStatus">
                ${DEBUG_QA_QUEST_STATUS_OPTIONS.map((option) => `<option value="${option.key}">${option.label}</option>`).join('')}
              </select>
            </label>
            <label class="hud-debug-qa-field debug-qa-field-wide">
              <span>Loadout preset</span>
              <select data-hud="debugQaLoadout">
                ${DEBUG_QA_PRESET_OPTIONS.map((preset) => `<option value="${preset.key}">${preset.label}</option>`).join('')}
              </select>
            </label>
            <label class="hud-debug-qa-field debug-qa-field-wide">
              <span>World flags (add)</span>
              <textarea
                data-hud="debugQaWorldFlags"
                rows="2"
                placeholder="blacksmith_shop_tier_1_unlocked, story_floor_8_cleared"
              ></textarea>
            </label>
            <label class="hud-debug-qa-field debug-qa-field-wide">
              <span>World flags (remove)</span>
              <textarea
                data-hud="debugQaWorldFlagsRemove"
                rows="2"
                placeholder="blacksmith_curse_lifted"
              ></textarea>
            </label>
            <label class="hud-debug-qa-field debug-qa-field-wide hud-debug-qa-toggle">
              <span>Replace all flags</span>
              <input data-hud="debugQaWorldFlagsReplace" type="checkbox" />
            </label>
          </div>
          <div class="hud-debug-qa-actions">
            <button class="hud-debug-qa-button" data-debug-action="grant-resources">Grant resources</button>
            <button class="hud-debug-qa-button secondary" data-debug-action="set-tower-floor">Set tower floor</button>
            <button class="hud-debug-qa-button secondary" data-debug-action="apply-state-preset">Apply state preset</button>
            <button class="hud-debug-qa-button" data-debug-action="apply-loadout-preset">Apply loadout</button>
            <button class="hud-debug-qa-button secondary" data-debug-action="complete-quests">Complete quests</button>
            <button class="hud-debug-qa-button secondary" data-debug-action="set-world-flags">Set world flags</button>
            <button class="hud-debug-qa-button secondary" data-debug-action="set-quest-status">Set quest status</button>
          </div>
        </div>
            `
            : ''
        }
        <div class="hud-help">
          Deplacement: fleches ou ZQSD
          <br />
          Prototype: ferme, village et tour a venir
        </div>
      </div>
    `;

    this.loginButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-hud-action="login"]');
    this.logoutButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-hud-action="logout"]');
    this.combatStartButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-combat-action="start"]');
    this.combatAttackButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-combat-action="attack"]');
    this.combatDefendButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-combat-action="defend"]');
    this.combatFireballButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-combat-action="fireball"]');
    this.combatMendButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-combat-action="mend"]');
    this.combatCleanseButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-combat-action="cleanse"]');
    this.combatInterruptButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-combat-action="interrupt"]');
    this.combatRallyButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-combat-action="rally"]');
    this.combatSunderButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-combat-action="sunder"]');
    this.combatForfeitButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-combat-action="forfeit"]');
    this.combatLogsList = this.hudRoot.querySelector<HTMLElement>('[data-hud="combatLogs"]');
    this.combatStatusBadge = this.hudRoot.querySelector<HTMLElement>('[data-hud="combatStatus"]');
    this.combatErrorValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="combatError"]');
    this.questsSummaryValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="questsSummary"]');
    this.questsListRoot = this.hudRoot.querySelector<HTMLElement>('[data-hud="questsList"]');
    this.questsErrorValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="questsError"]');
    this.blacksmithSummaryValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="blacksmithSummary"]');
    this.blacksmithOffersRoot = this.hudRoot.querySelector<HTMLElement>('[data-hud="blacksmithOffers"]');
    this.blacksmithErrorValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="blacksmithError"]');
    this.autosaveSummaryValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="autosaveSummary"]');
    this.autosaveMetaValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="autosaveMeta"]');
    this.autosaveActionsRoot = this.hudRoot.querySelector<HTMLElement>('[data-hud="autosaveActions"]');
    this.autosaveErrorValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="autosaveError"]');
    this.saveSlotsSummaryValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="savesSummary"]');
    this.saveSlotsListRoot = this.hudRoot.querySelector<HTMLElement>('[data-hud="savesList"]');
    this.saveSlotsErrorValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="savesError"]');
    this.debugQaPanelRoot = this.hudRoot.querySelector<HTMLElement>('.hud-debug-qa');
    this.debugQaStatusValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="debugQaStatus"]');
    this.debugQaMessageValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="debugQaMessage"]');
    this.debugQaGrantXpInput = this.hudRoot.querySelector<HTMLInputElement>('[data-hud="debugQaXp"]');
    this.debugQaGrantGoldInput = this.hudRoot.querySelector<HTMLInputElement>('[data-hud="debugQaGold"]');
    this.debugQaTowerFloorInput = this.hudRoot.querySelector<HTMLInputElement>('[data-hud="debugQaFloor"]');
    this.debugQaStatePresetSelect = this.hudRoot.querySelector<HTMLSelectElement>('[data-hud="debugQaStatePreset"]');
    this.debugQaQuestKeyInput = this.hudRoot.querySelector<HTMLInputElement>('[data-hud="debugQaQuestKey"]');
    this.debugQaQuestStatusSelect = this.hudRoot.querySelector<HTMLSelectElement>('[data-hud="debugQaQuestStatus"]');
    this.debugQaLoadoutPresetSelect = this.hudRoot.querySelector<HTMLSelectElement>('[data-hud="debugQaLoadout"]');
    this.debugQaWorldFlagsInput = this.hudRoot.querySelector<HTMLTextAreaElement>('[data-hud="debugQaWorldFlags"]');
    this.debugQaWorldFlagsRemoveInput = this.hudRoot.querySelector<HTMLTextAreaElement>('[data-hud="debugQaWorldFlagsRemove"]');
    this.debugQaWorldFlagsReplaceInput = this.hudRoot.querySelector<HTMLInputElement>('[data-hud="debugQaWorldFlagsReplace"]');
    this.debugQaGrantButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-debug-action="grant-resources"]');
    this.debugQaTowerFloorButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-debug-action="set-tower-floor"]');
    this.debugQaStatePresetButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-debug-action="apply-state-preset"]');
    this.debugQaSetQuestStatusButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-debug-action="set-quest-status"]');
    this.debugQaLoadoutButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-debug-action="apply-loadout-preset"]');
    this.debugQaCompleteQuestsButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-debug-action="complete-quests"]');
    this.debugQaSetWorldFlagsButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-debug-action="set-world-flags"]');
    this.hudRoot.addEventListener('click', this.onHudClick);
    this.updateHud();
  }

  private teardownHud(): void {
    if (this.hudRoot) {
      this.hudRoot.removeEventListener('click', this.onHudClick);
      this.hudRoot.innerHTML = '';
      this.hudRoot = null;
    }

    this.loginButton = null;
    this.logoutButton = null;
    this.combatStartButton = null;
    this.combatAttackButton = null;
    this.combatDefendButton = null;
    this.combatFireballButton = null;
    this.combatMendButton = null;
    this.combatCleanseButton = null;
    this.combatInterruptButton = null;
    this.combatRallyButton = null;
    this.combatSunderButton = null;
    this.combatForfeitButton = null;
    this.combatLogsList = null;
    this.combatStatusBadge = null;
    this.combatErrorValue = null;
    this.questsSummaryValue = null;
    this.questsListRoot = null;
    this.questsErrorValue = null;
    this.blacksmithSummaryValue = null;
    this.blacksmithOffersRoot = null;
    this.blacksmithErrorValue = null;
    this.autosaveSummaryValue = null;
    this.autosaveMetaValue = null;
    this.autosaveActionsRoot = null;
    this.autosaveErrorValue = null;
    this.saveSlotsSummaryValue = null;
    this.saveSlotsListRoot = null;
    this.saveSlotsErrorValue = null;
    this.debugQaPanelRoot = null;
    this.debugQaStatusValue = null;
    this.debugQaMessageValue = null;
    this.debugQaGrantXpInput = null;
    this.debugQaGrantGoldInput = null;
    this.debugQaTowerFloorInput = null;
    this.debugQaStatePresetSelect = null;
    this.debugQaQuestKeyInput = null;
    this.debugQaQuestStatusSelect = null;
    this.debugQaLoadoutPresetSelect = null;
    this.debugQaWorldFlagsInput = null;
    this.debugQaWorldFlagsRemoveInput = null;
    this.debugQaWorldFlagsReplaceInput = null;
    this.debugQaGrantButton = null;
    this.debugQaTowerFloorButton = null;
    this.debugQaStatePresetButton = null;
    this.debugQaSetQuestStatusButton = null;
    this.debugQaLoadoutButton = null;
    this.debugQaCompleteQuestsButton = null;
    this.debugQaSetWorldFlagsButton = null;
    this.questsRenderSignature = '';
    this.blacksmithRenderSignature = '';
    this.autosaveRenderSignature = '';
    this.saveSlotsRenderSignature = '';
    this.debugQaBusyAction = null;
    this.debugQaStatus = 'idle';
    this.debugQaMessage = null;
    this.debugQaError = null;
  }
  private updateHud(): void {
    if (!this.hudRoot) {
      return;
    }

    this.setHudText('day', `Jour ${this.hudState.day}`);
    this.setHudText('gold', `${this.hudState.gold} po`);
    this.setHudText('level', `${this.hudState.level}`);
    this.setHudText('xp', `${this.hudState.xp} / ${this.hudState.xpToNext}`);
    this.setHudText('towerFloor', `${this.hudState.towerCurrentFloor} (best ${this.hudState.towerHighestFloor})`);
    this.setHudText('towerBoss10', this.hudState.towerBossFloor10Defeated ? 'Defeated' : 'Pending');
    this.setHudText('blacksmithStatus', this.getBlacksmithStatusLabel());
    this.setHudText('hp', `${this.formatValue(this.hudState.hp)} / ${this.formatValue(this.hudState.maxHp)}`);
    this.setHudText('mp', `${this.formatValue(this.hudState.mp)} / ${this.formatValue(this.hudState.maxMp)}`);
    this.setHudText('stamina', `${Math.max(0, Math.round(this.hudState.stamina))} / 8`);
    this.setHudText('area', this.hudState.area);
    this.setHudText('authStatus', this.authStatus);
    this.updateCombatHud();
    this.updateQuestHud();
    this.updateBlacksmithHud();
    this.updateAutoSaveHud();
    this.updateSaveSlotsHud();
    this.updateDebugQaHud();

    if (this.loginButton) {
      this.loginButton.hidden = this.isAuthenticated;
    }

    if (this.logoutButton) {
      this.logoutButton.hidden = !this.isAuthenticated;
    }
  }

  private updateCombatHud(): void {
    this.setHudText('combatName', this.getCombatName());
    this.setHudText('combatStatus', this.getCombatStatusLabel());
    this.setHudText('combatEncounterId', this.combatEncounterId ?? '-');
    this.setHudText('combatTurn', this.getCombatTurnLabel());
    this.setHudText('combatRound', this.combatState ? `${this.combatState.round}` : '-');
    this.setHudText('combatResult', this.combatMessage);
    this.setHudText('combatPlayerHp', this.getCombatUnitValue(this.hudState.hp, this.hudState.maxHp));
    this.setHudText('combatPlayerMp', this.getCombatUnitValue(this.hudState.mp, this.hudState.maxMp));
    this.setHudText('combatPlayerEffects', this.getCombatPlayerEffectsLabel());
    this.setHudText('combatEnemyName', this.combatState ? this.combatState.enemy.name : '-');
    this.setHudText('combatEnemyHp', this.getCombatEnemyValue('hp'));
    this.setHudText('combatEnemyMp', this.getCombatEnemyValue('mp'));
    this.setHudText('combatEnemyEffects', this.getCombatEnemyEffectsLabel());
    this.renderCombatEnemyTelegraphs();

    if (this.combatStatusBadge) {
      this.combatStatusBadge.dataset.status = this.combatStatus;
    }

    if (this.combatErrorValue) {
      this.combatErrorValue.hidden = !this.combatError;
      this.combatErrorValue.textContent = this.combatError ?? '';
    }

    this.renderCombatLogs();
    this.updateCombatButtons();
  }

  private updateQuestHud(): void {
    if (this.questsSummaryValue) {
      this.questsSummaryValue.textContent = this.getQuestSummaryLabel();
    }

    if (this.questsErrorValue) {
      this.questsErrorValue.hidden = !this.questError;
      this.questsErrorValue.textContent = this.questError ?? '';
    }

    this.renderQuestList();
  }

  private updateBlacksmithHud(): void {
    if (this.blacksmithSummaryValue) {
      this.blacksmithSummaryValue.textContent = this.getBlacksmithShopSummaryLabel();
    }

    if (this.blacksmithErrorValue) {
      this.blacksmithErrorValue.hidden = !this.blacksmithError;
      this.blacksmithErrorValue.textContent = this.blacksmithError ?? '';
    }

    this.renderBlacksmithOffers();
  }

  private updateAutoSaveHud(): void {
    if (this.autosaveSummaryValue) {
      this.autosaveSummaryValue.textContent = this.getAutoSaveSummaryLabel();
    }

    if (this.autosaveMetaValue) {
      this.autosaveMetaValue.textContent = this.getAutoSaveMetaLabel();
    }

    if (this.autosaveErrorValue) {
      this.autosaveErrorValue.hidden = !this.autosaveError;
      this.autosaveErrorValue.textContent = this.autosaveError ?? '';
    }

    this.renderAutoSaveActions();
  }

  private updateSaveSlotsHud(): void {
    if (this.saveSlotsSummaryValue) {
      this.saveSlotsSummaryValue.textContent = this.getSaveSlotsSummaryLabel();
    }

    if (this.saveSlotsErrorValue) {
      this.saveSlotsErrorValue.hidden = !this.saveSlotsError;
      this.saveSlotsErrorValue.textContent = this.saveSlotsError ?? '';
    }

    this.renderSaveSlotsList();
  }

  private updateDebugQaHud(): void {
    if (!this.debugQaEnabled || !this.debugQaPanelRoot) {
      return;
    }

    if (this.debugQaStatusValue) {
      this.debugQaStatusValue.textContent = this.getDebugQaStatusLabel();
      this.debugQaStatusValue.dataset.status = this.debugQaStatus;
    }

    if (this.debugQaMessageValue) {
      const message = this.debugQaError ?? this.debugQaMessage;
      this.debugQaMessageValue.hidden = !message;
      this.debugQaMessageValue.textContent = message ?? '';
      this.debugQaMessageValue.dataset.variant = this.debugQaError ? 'error' : this.debugQaStatus === 'success' ? 'success' : 'info';
    }

    const disabled = !this.isAuthenticated || this.debugQaStatus === 'loading';
    if (this.debugQaGrantXpInput) {
      this.debugQaGrantXpInput.disabled = disabled;
    }
    if (this.debugQaGrantGoldInput) {
      this.debugQaGrantGoldInput.disabled = disabled;
    }
    if (this.debugQaTowerFloorInput) {
      this.debugQaTowerFloorInput.disabled = disabled;
    }
    if (this.debugQaStatePresetSelect) {
      this.debugQaStatePresetSelect.disabled = disabled;
    }
    if (this.debugQaQuestKeyInput) {
      this.debugQaQuestKeyInput.disabled = disabled;
    }
    if (this.debugQaQuestStatusSelect) {
      this.debugQaQuestStatusSelect.disabled = disabled;
    }
    if (this.debugQaLoadoutPresetSelect) {
      this.debugQaLoadoutPresetSelect.disabled = disabled;
    }
    if (this.debugQaWorldFlagsInput) {
      this.debugQaWorldFlagsInput.disabled = disabled;
    }
    if (this.debugQaWorldFlagsRemoveInput) {
      this.debugQaWorldFlagsRemoveInput.disabled = disabled;
    }
    if (this.debugQaWorldFlagsReplaceInput) {
      this.debugQaWorldFlagsReplaceInput.disabled = disabled;
    }

    if (this.debugQaGrantButton) {
      this.debugQaGrantButton.disabled = disabled;
      this.debugQaGrantButton.textContent =
        this.debugQaBusyAction === 'grant-resources' ? 'Granting...' : 'Grant resources';
    }
    if (this.debugQaTowerFloorButton) {
      this.debugQaTowerFloorButton.disabled = disabled;
      this.debugQaTowerFloorButton.textContent =
        this.debugQaBusyAction === 'set-tower-floor' ? 'Applying...' : 'Set tower floor';
    }
    if (this.debugQaStatePresetButton) {
      this.debugQaStatePresetButton.disabled = disabled;
      this.debugQaStatePresetButton.textContent =
        this.debugQaBusyAction === 'apply-state-preset' ? 'Applying...' : 'Apply state preset';
    }
    if (this.debugQaSetQuestStatusButton) {
      this.debugQaSetQuestStatusButton.disabled = disabled;
      this.debugQaSetQuestStatusButton.textContent =
        this.debugQaBusyAction === 'set-quest-status' ? 'Applying...' : 'Set quest status';
    }
    if (this.debugQaLoadoutButton) {
      this.debugQaLoadoutButton.disabled = disabled;
      this.debugQaLoadoutButton.textContent =
        this.debugQaBusyAction === 'apply-loadout-preset' ? 'Applying...' : 'Apply loadout';
    }
    if (this.debugQaCompleteQuestsButton) {
      this.debugQaCompleteQuestsButton.disabled = disabled;
      this.debugQaCompleteQuestsButton.textContent =
        this.debugQaBusyAction === 'complete-quests' ? 'Completing...' : 'Complete quests';
    }
    if (this.debugQaSetWorldFlagsButton) {
      this.debugQaSetWorldFlagsButton.disabled = disabled;
      this.debugQaSetWorldFlagsButton.textContent =
        this.debugQaBusyAction === 'set-world-flags' ? 'Applying...' : 'Set world flags';
    }
  }

  private renderAutoSaveActions(): void {
    if (!this.autosaveActionsRoot) {
      return;
    }

    const signature = this.computeAutoSaveRenderSignature();
    if (signature === this.autosaveRenderSignature) {
      return;
    }
    this.autosaveRenderSignature = signature;

    this.autosaveActionsRoot.replaceChildren();

    if (!this.isAuthenticated || !this.autosave) {
      return;
    }

    for (const slot of [1, 2, 3]) {
      const button = document.createElement('button');
      button.classList.add('hud-autosave-restore');
      button.dataset.saveAction = 'restore';
      button.dataset.slot = `${slot}`;
      button.textContent = this.autosaveRestoreSlotBusy === slot ? `Restoring S${slot}...` : `Restore to Slot ${slot}`;
      button.disabled = this.autosaveBusy || this.autosaveRestoreSlotBusy !== null;
      this.autosaveActionsRoot.appendChild(button);
    }
  }

  private renderSaveSlotsList(): void {
    if (!this.saveSlotsListRoot) {
      return;
    }

    const signature = this.computeSaveSlotsRenderSignature();
    if (signature === this.saveSlotsRenderSignature) {
      return;
    }
    this.saveSlotsRenderSignature = signature;

    this.saveSlotsListRoot.replaceChildren();

    if (!this.isAuthenticated) {
      const item = document.createElement('li');
      item.classList.add('save-slot-item', 'empty');
      item.textContent = 'Connect to manage save slots.';
      this.saveSlotsListRoot.appendChild(item);
      return;
    }

    const slotStates = this.getSafeSlotStates();
    for (const slotState of slotStates) {
      const item = document.createElement('li');
      item.classList.add('save-slot-item');
      item.dataset.exists = slotState.exists ? '1' : '0';

      const header = document.createElement('div');
      header.classList.add('save-slot-header');

      const title = document.createElement('strong');
      title.textContent = `Slot ${slotState.slot}`;
      header.appendChild(title);

      const badge = document.createElement('span');
      badge.classList.add('save-slot-state');
      badge.textContent = slotState.exists ? `v${slotState.version ?? 1}` : 'Empty';
      header.appendChild(badge);
      item.appendChild(header);

      const meta = document.createElement('p');
      meta.classList.add('save-slot-meta');
      meta.textContent = this.getSaveSlotMetaLabel(slotState);
      item.appendChild(meta);

      if (slotState.exists) {
        const preview = document.createElement('div');
        preview.classList.add('save-slot-preview');

        const previewStats = document.createElement('p');
        previewStats.classList.add('save-slot-preview-line');
        previewStats.textContent = this.getSaveSlotStatsPreviewLabel(slotState);
        preview.appendChild(previewStats);

        const previewInventory = document.createElement('p');
        previewInventory.classList.add('save-slot-preview-line');
        previewInventory.textContent = this.getSaveSlotInventoryPreviewLabel(slotState);
        preview.appendChild(previewInventory);

        const previewEquipment = document.createElement('p');
        previewEquipment.classList.add('save-slot-preview-line');
        previewEquipment.textContent = this.getSaveSlotEquipmentPreviewLabel(slotState);
        preview.appendChild(previewEquipment);

        item.appendChild(preview);
      }

      const actions = document.createElement('div');
      actions.classList.add('save-slot-actions');

      const captureBusy = this.saveSlotsActionBusyKey === `capture:${slotState.slot}`;
      const loadBusy = this.saveSlotsActionBusyKey === `load:${slotState.slot}`;
      const deleteBusy = this.saveSlotsActionBusyKey === `delete:${slotState.slot}`;
      const hasBusyAction = this.saveSlotsActionBusyKey !== null;
      const isLoadConfirmOpen = this.saveSlotsLoadConfirmSlot === slotState.slot;
      const hasLoadConfirmOpen = this.saveSlotsLoadConfirmSlot !== null;

      const captureButton = document.createElement('button');
      captureButton.classList.add('hud-save-action', 'capture');
      captureButton.dataset.saveAction = 'capture';
      captureButton.dataset.slot = `${slotState.slot}`;
      captureButton.textContent = captureBusy ? 'Saving...' : 'Capture';
      captureButton.disabled = this.saveSlotsBusy || hasBusyAction || hasLoadConfirmOpen;
      actions.appendChild(captureButton);

      const loadButton = document.createElement('button');
      loadButton.classList.add('hud-save-action');
      loadButton.dataset.saveAction = 'load';
      loadButton.dataset.slot = `${slotState.slot}`;
      loadButton.textContent = loadBusy ? 'Loading...' : (isLoadConfirmOpen ? 'Selected' : 'Load');
      loadButton.disabled =
        this.saveSlotsBusy ||
        hasBusyAction ||
        !slotState.exists ||
        (hasLoadConfirmOpen && !isLoadConfirmOpen);
      actions.appendChild(loadButton);

      const deleteButton = document.createElement('button');
      deleteButton.classList.add('hud-save-action', 'danger');
      deleteButton.dataset.saveAction = 'delete';
      deleteButton.dataset.slot = `${slotState.slot}`;
      deleteButton.textContent = deleteBusy ? 'Deleting...' : 'Delete';
      deleteButton.disabled = this.saveSlotsBusy || hasBusyAction || !slotState.exists || hasLoadConfirmOpen;
      actions.appendChild(deleteButton);

      item.appendChild(actions);

      if (isLoadConfirmOpen) {
        const confirmPanel = document.createElement('div');
        confirmPanel.classList.add('save-slot-load-confirm');

        const confirmMessage = document.createElement('p');
        confirmMessage.classList.add('save-slot-load-confirm-message');
        confirmMessage.textContent = `Load Slot ${slotState.slot}? This will replace your current progression.`;
        confirmPanel.appendChild(confirmMessage);

        const confirmActions = document.createElement('div');
        confirmActions.classList.add('save-slot-load-confirm-actions');

        const confirmButton = document.createElement('button');
        confirmButton.classList.add('hud-save-action', 'confirm');
        confirmButton.dataset.saveAction = 'confirm-load';
        confirmButton.dataset.slot = `${slotState.slot}`;
        confirmButton.textContent = loadBusy ? 'Loading...' : 'Confirm Load';
        confirmButton.disabled = this.saveSlotsBusy || hasBusyAction;
        confirmActions.appendChild(confirmButton);

        const cancelButton = document.createElement('button');
        cancelButton.classList.add('hud-save-action', 'cancel');
        cancelButton.dataset.saveAction = 'cancel-load';
        cancelButton.dataset.slot = `${slotState.slot}`;
        cancelButton.textContent = 'Cancel';
        cancelButton.disabled = this.saveSlotsBusy || hasBusyAction;
        confirmActions.appendChild(cancelButton);

        confirmPanel.appendChild(confirmActions);
        item.appendChild(confirmPanel);
      }

      this.saveSlotsListRoot.appendChild(item);
    }
  }

  private renderBlacksmithOffers(): void {
    if (!this.blacksmithOffersRoot) {
      return;
    }

    const signature = this.computeBlacksmithRenderSignature();
    if (signature === this.blacksmithRenderSignature) {
      return;
    }
    this.blacksmithRenderSignature = signature;

    this.blacksmithOffersRoot.replaceChildren();

    if (!this.isAuthenticated) {
      const item = document.createElement('li');
      item.classList.add('shop-item', 'empty');
      item.textContent = 'Connect to access the shop.';
      this.blacksmithOffersRoot.appendChild(item);
      return;
    }

    if (!this.hudState.blacksmithUnlocked) {
      const item = document.createElement('li');
      item.classList.add('shop-item', 'empty');
      item.textContent = this.hudState.blacksmithCurseLifted
        ? 'Blacksmith is recovering. Complete progression to unlock the shop.'
        : 'Blacksmith is still cursed.';
      this.blacksmithOffersRoot.appendChild(item);
      return;
    }

    if (this.blacksmithOffers.length === 0) {
      const item = document.createElement('li');
      item.classList.add('shop-item', 'empty');
      item.textContent = this.blacksmithBusy ? 'Loading offers...' : 'No offers available.';
      this.blacksmithOffersRoot.appendChild(item);
      return;
    }

    for (const offer of this.blacksmithOffers) {
      const item = document.createElement('li');
      item.classList.add('shop-item');

      const header = document.createElement('div');
      header.classList.add('shop-item-header');

      const name = document.createElement('strong');
      name.textContent = offer.name;
      header.appendChild(name);

      const price = document.createElement('span');
      price.classList.add('shop-price');
      price.textContent = `${offer.goldPrice}g`;
      header.appendChild(price);

      item.appendChild(header);

      const description = document.createElement('p');
      description.classList.add('shop-description');
      description.textContent = offer.description;
      item.appendChild(description);

      const buyButton = document.createElement('button');
      buyButton.classList.add('hud-shop-buy');
      buyButton.textContent = `Buy (${offer.goldPrice}g)`;
      buyButton.dataset.shopAction = 'buy';
      buyButton.dataset.offerKey = offer.offerKey;
      buyButton.disabled = this.blacksmithBusy || this.hudState.gold < offer.goldPrice;
      item.appendChild(buyButton);

      this.blacksmithOffersRoot.appendChild(item);
    }
  }

  private renderQuestList(): void {
    if (!this.questsListRoot) {
      return;
    }

    const signature = this.computeQuestRenderSignature();
    if (signature === this.questsRenderSignature) {
      return;
    }
    this.questsRenderSignature = signature;

    this.questsListRoot.replaceChildren();

    if (!this.isAuthenticated) {
      const item = document.createElement('li');
      item.classList.add('quest-item', 'empty');
      item.textContent = 'Connect to see quests.';
      this.questsListRoot.appendChild(item);
      return;
    }

    if (this.quests.length === 0) {
      const item = document.createElement('li');
      item.classList.add('quest-item', 'empty');
      item.textContent = this.questBusy ? 'Loading quests...' : 'No quests available.';
      this.questsListRoot.appendChild(item);
      return;
    }

    for (const quest of this.quests) {
      const item = document.createElement('li');
      item.classList.add('quest-item');
      item.dataset.status = quest.status;

      const header = document.createElement('div');
      header.classList.add('quest-item-header');

      const title = document.createElement('strong');
      title.textContent = quest.title;
      header.appendChild(title);

      const badge = document.createElement('span');
      badge.classList.add('quest-status');
      badge.textContent = this.getQuestStatusLabel(quest.status);
      header.appendChild(badge);

      item.appendChild(header);

      const description = document.createElement('p');
      description.classList.add('quest-description');
      description.textContent = quest.description;
      item.appendChild(description);

      const objectives = document.createElement('ul');
      objectives.classList.add('quest-objectives');
      for (const objective of quest.objectives) {
        const objectiveItem = document.createElement('li');
        objectiveItem.textContent = `${objective.description}: ${objective.current}/${objective.target}`;
        if (objective.completed) {
          objectiveItem.classList.add('completed');
        }
        objectives.appendChild(objectiveItem);
      }
      item.appendChild(objectives);

      if (quest.canClaim) {
        const claimButton = document.createElement('button');
        claimButton.classList.add('hud-quest-claim');
        claimButton.textContent = 'Claim';
        claimButton.dataset.questAction = 'claim';
        claimButton.dataset.questKey = quest.key;
        claimButton.disabled = this.questBusy;
        item.appendChild(claimButton);
      }

      this.questsListRoot.appendChild(item);
    }
  }

  private getQuestSummaryLabel(): string {
    if (!this.isAuthenticated) {
      return 'Login required';
    }

    if (this.questBusy && this.quests.length === 0) {
      return 'Loading...';
    }

    const active = this.quests.filter((quest) => quest.status === 'active').length;
    const completed = this.quests.filter((quest) => quest.status === 'completed').length;
    const claimed = this.quests.filter((quest) => quest.status === 'claimed').length;
    return `Active ${active} | Ready ${completed} | Claimed ${claimed}`;
  }

  private getBlacksmithShopSummaryLabel(): string {
    if (!this.isAuthenticated) {
      return 'Login required';
    }

    if (!this.hudState.blacksmithUnlocked) {
      return this.hudState.blacksmithCurseLifted ? 'Recovering' : 'Locked';
    }

    return this.blacksmithBusy
      ? 'Refreshing...'
      : `${this.blacksmithOffers.length} offers | Gold ${this.hudState.gold}`;
  }

  private getAutoSaveSummaryLabel(): string {
    if (!this.isAuthenticated) {
      return 'Login required';
    }

    if (this.autosaveBusy && !this.autosave) {
      return 'Loading...';
    }

    if (!this.autosave) {
      return 'No autosave';
    }

    return `v${this.autosave.version} | ${this.autosave.reason}`;
  }

  private getAutoSaveMetaLabel(): string {
    if (!this.isAuthenticated) {
      return 'Connect to view autosave.';
    }

    if (!this.autosave) {
      return 'No milestone autosave available yet.';
    }

    return `Updated: ${this.formatIsoForHud(this.autosave.updatedAt)}`;
  }

  private getSaveSlotsSummaryLabel(): string {
    if (!this.isAuthenticated) {
      return 'Login required';
    }

    if (this.saveSlotsBusy && this.saveSlots.length === 0) {
      return 'Loading...';
    }

    const usedCount = this.saveSlots.filter((slot) => slot.exists).length;
    return `${usedCount}/3 used`;
  }

  private getSafeSlotStates(): SaveSlotState[] {
    const bySlot = new Map<number, SaveSlotState>();
    for (const slotState of this.saveSlots) {
      bySlot.set(slotState.slot, slotState);
    }

    return [1, 2, 3].map((slot) => {
      const entry = bySlot.get(slot);
      if (entry) {
        return entry;
      }

      return {
        slot,
        exists: false,
        version: null,
        label: null,
        updatedAt: null,
        preview: null,
      };
    });
  }

  private hasExistingSaveSlot(slot: number): boolean {
    const slotState = this.getSafeSlotStates().find((entry) => entry.slot === slot);
    return Boolean(slotState?.exists);
  }

  private getSaveSlotMetaLabel(slotState: SaveSlotState): string {
    if (!slotState.exists) {
      return 'Empty slot.';
    }

    const label = slotState.label?.trim() ? slotState.label.trim() : 'Manual save';
    const updated = slotState.updatedAt ? this.formatIsoForHud(slotState.updatedAt) : 'Unknown';
    return `${label} | Updated: ${updated}`;
  }

  private getSaveSlotStatsPreviewLabel(slotState: SaveSlotState): string {
    if (!slotState.preview) {
      return 'Stats: preview unavailable.';
    }

    const level = slotState.preview.playerLevel !== null ? `${slotState.preview.playerLevel}` : '?';
    const gold = slotState.preview.gold !== null ? `${slotState.preview.gold}` : '?';
    const floorCurrent = slotState.preview.towerCurrentFloor !== null ? `${slotState.preview.towerCurrentFloor}` : '?';
    const floorHighest = slotState.preview.towerHighestFloor !== null ? `${slotState.preview.towerHighestFloor}` : '?';

    return `Stats: Lvl ${level} | Gold ${gold} | Floor ${floorCurrent}/${floorHighest}`;
  }

  private getSaveSlotInventoryPreviewLabel(slotState: SaveSlotState): string {
    if (!slotState.preview) {
      return 'Inventory: preview unavailable.';
    }

    if (slotState.preview.inventoryTop.length === 0) {
      return 'Inventory: empty.';
    }

    const items = slotState.preview.inventoryTop.map((entry) => `${entry.itemKey} x${entry.quantity}`).join(', ');
    return `Inventory: ${items}`;
  }

  private getSaveSlotEquipmentPreviewLabel(slotState: SaveSlotState): string {
    if (!slotState.preview) {
      return 'Equipment: preview unavailable.';
    }

    if (slotState.preview.equippedCount === 0) {
      return 'Equipment: none equipped.';
    }

    const equipped = slotState.preview.equipmentTop
      .map((entry) => `${entry.slot}:${entry.itemKey}`)
      .join(', ');
    return `Equipment: ${slotState.preview.equippedCount} equipped (${equipped})`;
  }

  private computeQuestRenderSignature(): string {
    const questParts = this.quests.map((quest) => {
      const objectiveParts = quest.objectives.map((objective) => (
        `${objective.key}:${objective.current}/${objective.target}:${objective.completed ? '1' : '0'}`
      ));

      return `${quest.key}:${quest.status}:${quest.canClaim ? '1' : '0'}:${objectiveParts.join(',')}`;
    });

    return [
      this.isAuthenticated ? '1' : '0',
      this.questBusy ? '1' : '0',
      this.questError ?? '',
      questParts.join(';'),
    ].join('|');
  }

  private computeBlacksmithRenderSignature(): string {
    const offers = this.blacksmithOffers.map((offer) => (
      `${offer.offerKey}:${offer.goldPrice}:${offer.name}:${offer.description}`
    ));

    return [
      this.isAuthenticated ? '1' : '0',
      this.blacksmithBusy ? '1' : '0',
      this.hudState.blacksmithUnlocked ? '1' : '0',
      this.hudState.blacksmithCurseLifted ? '1' : '0',
      this.hudState.gold,
      this.blacksmithError ?? '',
      offers.join(';'),
    ].join('|');
  }

  private computeAutoSaveRenderSignature(): string {
    return [
      this.isAuthenticated ? '1' : '0',
      this.autosaveBusy ? '1' : '0',
      this.autosaveRestoreSlotBusy ?? '-',
      this.autosaveError ?? '',
      this.autosave
        ? `${this.autosave.version}:${this.autosave.reason}:${this.autosave.updatedAt}`
        : 'none',
    ].join('|');
  }

  private computeSaveSlotsRenderSignature(): string {
    const slots = this.getSafeSlotStates()
      .map((slot) => {
        const preview = slot.preview
          ? `${slot.preview.playerLevel ?? '-'}:${slot.preview.gold ?? '-'}:${slot.preview.towerCurrentFloor ?? '-'}:${slot.preview.towerHighestFloor ?? '-'}:${slot.preview.inventoryTop.map((entry) => `${entry.itemKey}:${entry.quantity}`).join(',')}:${slot.preview.equipmentTop.map((entry) => `${entry.slot}:${entry.itemKey}`).join(',')}:${slot.preview.equippedCount}`
          : 'none';

        return `${slot.slot}:${slot.exists ? '1' : '0'}:${slot.version ?? '-'}:${slot.label ?? '-'}:${slot.updatedAt ?? '-'}:${preview}`;
      })
      .join(';');

    return [
      this.isAuthenticated ? '1' : '0',
      this.saveSlotsBusy ? '1' : '0',
      this.saveSlotsActionBusyKey ?? '-',
      this.saveSlotsLoadConfirmSlot ?? '-',
      this.saveSlotsError ?? '',
      slots,
    ].join('|');
  }

  private getQuestStatusLabel(status: QuestStatus): string {
    if (status === 'active') {
      return 'Active';
    }

    if (status === 'completed') {
      return 'Ready';
    }

    return 'Claimed';
  }

  private updateCombatButtons(): void {
    const active = Boolean(this.isAuthenticated && this.combatState && this.combatState.status === 'active');
    const playerTurn = Boolean(active && this.combatState?.turn === 'player');
    const mana = this.combatState?.player.mp ?? 0;
    const hp = this.combatState?.player.hp ?? 0;
    const maxHp = this.combatState?.player.maxHp ?? 0;
    const silenced = this.getCombatScriptTurns('playerSilencedTurns') > 0;
    const fireballReady = Boolean(playerTurn && mana >= FIREBALL_MANA_COST && !silenced);
    const mendReady = Boolean(playerTurn && mana >= MEND_MANA_COST && hp < maxHp);
    const cleanseReady = Boolean(playerTurn && mana >= CLEANSE_MANA_COST && this.hasCleanseableDebuffs());
    const interruptReady = Boolean(
      playerTurn &&
      mana >= INTERRUPT_MANA_COST &&
      !silenced &&
      this.hasInterruptibleEnemyIntent(),
    );
    const rallyReady = Boolean(playerTurn && mana >= RALLY_MANA_COST && !silenced);
    const sunderReady = Boolean(playerTurn && mana >= SUNDER_MANA_COST && !silenced);
    const effectiveMendReady = Boolean(mendReady && !silenced);

    if (this.combatStartButton) {
      this.combatStartButton.disabled = !this.isAuthenticated || this.combatBusy;
    }

    if (this.combatAttackButton) {
      this.combatAttackButton.disabled = !playerTurn || this.combatBusy;
    }

    if (this.combatDefendButton) {
      this.combatDefendButton.disabled = !playerTurn || this.combatBusy;
    }

    if (this.combatFireballButton) {
      this.combatFireballButton.disabled = !fireballReady || this.combatBusy;
    }

    if (this.combatMendButton) {
      this.combatMendButton.disabled = !effectiveMendReady || this.combatBusy;
    }

    if (this.combatCleanseButton) {
      this.combatCleanseButton.disabled = !cleanseReady || this.combatBusy;
    }

    if (this.combatInterruptButton) {
      this.combatInterruptButton.disabled = !interruptReady || this.combatBusy;
    }

    if (this.combatRallyButton) {
      this.combatRallyButton.disabled = !rallyReady || this.combatBusy;
    }

    if (this.combatSunderButton) {
      this.combatSunderButton.disabled = !sunderReady || this.combatBusy;
    }

    if (this.combatForfeitButton) {
      this.combatForfeitButton.disabled = !active || this.combatBusy;
    }
  }

  private renderCombatLogs(): void {
    if (!this.combatLogsList) {
      return;
    }

    this.combatLogsList.replaceChildren();
    const entries = this.combatLogs.length > 0 ? this.combatLogs : [this.getCombatLogsFallback()];

    for (const entry of entries) {
      const item = document.createElement('li');
      item.textContent = entry;
      if (this.combatLogs.length === 0) {
        item.classList.add('combat-log-empty');
      }
      this.combatLogsList.appendChild(item);
    }
  }

  private getCombatLogsFallback(): string {
    if (!this.isAuthenticated) {
      return 'Connecte toi pour lancer un combat.';
    }

    if (this.combatBusy) {
      return 'Chargement du combat...';
    }

    return this.combatState ? 'Aucun log de combat pour le moment.' : 'Aucun combat actif.';
  }

  private setHudText(key: string, value: string): void {
    const element = this.hudRoot?.querySelector<HTMLElement>(`[data-hud="${key}"]`);
    if (element) {
      element.textContent = value;
    }
  }

  private async bootstrapSessionState(): Promise<void> {
    const authenticated = await this.refreshAuthState();
    if (authenticated) {
      await this.refreshGameplayState();
      await this.refreshAutoSaveState();
      await this.refreshSaveSlotsState();
      await this.refreshBlacksmithState();
      await this.refreshQuestState();
      await this.refreshCombatState();
      return;
    }

    this.resetGameplayHudState();
    this.resetAutoSaveState();
    this.resetSaveSlotsState();
    this.resetBlacksmithState();
    this.resetQuestState();
    this.resetCombatState();
    this.updateHud();
  }

  private async refreshAuthState(): Promise<boolean> {
    try {
      const payload = await this.fetchJson<{ user?: { displayName?: string; email?: string } }>('/auth/me', {
        method: 'GET',
      });

      const displayName = payload.user?.displayName ?? payload.user?.email ?? 'Joueur';
      this.authStatus = `Connecte: ${displayName}`;
      this.isAuthenticated = true;
    } catch {
      this.authStatus = 'Non connecte';
      this.isAuthenticated = false;
    } finally {
      this.updateHud();
    }

    return this.isAuthenticated;
  }

  private async refreshGameplayState(): Promise<void> {
    if (!this.isAuthenticated) {
      this.resetGameplayHudState();
      this.updateHud();
      return;
    }

    try {
      const payload = await this.fetchJson<unknown>('/gameplay/state', {
        method: 'GET',
      });
      this.applyGameplaySnapshot(payload);
    } catch {
      // Keep previous HUD progression values if gameplay refresh fails.
    } finally {
      this.updateHud();
    }
  }

  private async refreshQuestState(): Promise<void> {
    if (!this.isAuthenticated) {
      this.resetQuestState();
      this.updateHud();
      return;
    }

    this.questBusy = true;
    this.questError = null;
    this.updateHud();

    try {
      const payload = await this.fetchJson<unknown>('/quests', {
        method: 'GET',
      });
      this.quests = this.normalizeQuestsPayload(payload);
    } catch (error) {
      this.questError = this.getErrorMessage(error, 'Unable to load quests.');
      if (this.quests.length === 0) {
        this.quests = [];
      }
    } finally {
      this.questBusy = false;
      this.updateHud();
    }
  }

  private async refreshBlacksmithState(): Promise<void> {
    if (!this.isAuthenticated) {
      this.resetBlacksmithState();
      this.updateHud();
      return;
    }

    this.blacksmithBusy = true;
    this.blacksmithError = null;
    this.updateHud();

    try {
      const payload = await this.fetchJson<unknown>('/shops/blacksmith', {
        method: 'GET',
      });

      const parsed = this.normalizeBlacksmithPayload(payload);
      this.blacksmithOffers = parsed.offers;
    } catch (error) {
      this.blacksmithError = this.getErrorMessage(error, 'Unable to load blacksmith shop.');
      if (this.blacksmithOffers.length === 0) {
        this.blacksmithOffers = [];
      }
    } finally {
      this.blacksmithBusy = false;
      this.updateHud();
    }
  }

  private async refreshAutoSaveState(): Promise<void> {
    if (!this.isAuthenticated) {
      this.resetAutoSaveState();
      this.updateHud();
      return;
    }

    this.autosaveBusy = true;
    this.autosaveError = null;
    this.updateHud();

    try {
      const payload = await this.fetchJson<unknown>('/saves/auto/latest', {
        method: 'GET',
      });

      this.autosave = this.normalizeAutoSavePayload(payload);
    } catch (error) {
      this.autosaveError = this.getErrorMessage(error, 'Unable to load autosave.');
      this.autosave = null;
    } finally {
      this.autosaveBusy = false;
      this.updateHud();
    }
  }

  private async refreshSaveSlotsState(): Promise<void> {
    if (!this.isAuthenticated) {
      this.resetSaveSlotsState();
      this.updateHud();
      return;
    }

    this.saveSlotsBusy = true;
    this.saveSlotsError = null;
    this.updateHud();

    try {
      const payload = await this.fetchJson<unknown>('/saves', {
        method: 'GET',
      });
      const slots = this.normalizeSaveSlotsPayload(payload);
      const previewsBySlot = await this.loadSaveSlotPreviews(slots);
      this.saveSlots = slots.map((slot) => ({
        ...slot,
        preview: slot.exists ? (previewsBySlot.get(slot.slot) ?? null) : null,
      }));

      if (
        this.saveSlotsLoadConfirmSlot !== null &&
        !this.saveSlots.some((slot) => slot.slot === this.saveSlotsLoadConfirmSlot && slot.exists)
      ) {
        this.saveSlotsLoadConfirmSlot = null;
      }
    } catch (error) {
      this.saveSlotsError = this.getErrorMessage(error, 'Unable to load save slots.');
      if (this.saveSlots.length === 0) {
        this.saveSlots = [];
      }
    } finally {
      this.saveSlotsBusy = false;
      this.updateHud();
    }
  }

  private async loadSaveSlotPreviews(slots: SaveSlotState[]): Promise<Map<number, SaveSlotPreview | null>> {
    const previewsBySlot = new Map<number, SaveSlotPreview | null>();
    const existingSlots = slots.filter((slot) => slot.exists);

    await Promise.all(
      existingSlots.map(async (slot) => {
        try {
          const payload = await this.fetchJson<unknown>(`/saves/${slot.slot}`, {
            method: 'GET',
          });
          previewsBySlot.set(slot.slot, this.normalizeSaveSlotPreviewPayload(payload));
        } catch {
          previewsBySlot.set(slot.slot, null);
        }
      }),
    );

    return previewsBySlot;
  }

  private async refreshCombatState(): Promise<void> {
    if (!this.isAuthenticated) {
      this.resetCombatState();
      this.updateHud();
      return;
    }

    this.combatBusy = true;
    this.combatStatus = 'loading';
    this.combatMessage = 'Chargement du combat...';
    this.clearCombatError();
    this.updateHud();

    try {
      const payload = await this.fetchJson<unknown>('/combat/current', {
        method: 'GET',
      });
      const encounter = this.normalizeCombatPayload(payload);

      if (encounter) {
        this.applyCombatSnapshot(encounter);
      } else {
        this.resetCombatState();
      }
    } catch (error) {
      const message = this.getErrorMessage(error, 'Impossible de charger le combat.');
      this.setCombatError(message);
      if (!this.combatState) {
        this.combatStatus = 'error';
        this.combatMessage = message;
      }
    } finally {
      this.combatBusy = false;
      if (this.combatState) {
        this.combatStatus = this.combatState.status;
      }
      this.updateHud();
    }
  }

  private async startCombat(): Promise<void> {
    if (!this.isAuthenticated) {
      this.setCombatError('Connecte toi pour demarrer un combat.');
      this.updateHud();
      return;
    }

    this.combatBusy = true;
    this.combatStatus = 'loading';
    this.combatMessage = 'Demarrage du combat...';
    this.clearCombatError();
    this.updateHud();

    try {
      const payload = await this.fetchJson<unknown>('/combat/start', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const encounter = this.normalizeCombatPayload(payload);

      if (!encounter) {
        throw new Error('Combat start returned an empty payload.');
      }

      this.applyCombatSnapshot(encounter);
      await this.refreshGameplayState();
      await this.refreshAutoSaveState();
      await this.refreshBlacksmithState();
      await this.refreshQuestState();
    } catch (error) {
      this.setCombatError(this.getErrorMessage(error, 'Impossible de demarrer le combat.'));
      if (this.combatState) {
        this.combatStatus = this.combatState.status;
      } else {
        this.combatStatus = 'error';
      }
    } finally {
      this.combatBusy = false;
      if (this.combatState) {
        this.combatStatus = this.combatState.status;
      }
      this.updateHud();
    }
  }

  private async performCombatAction(action: CombatActionName): Promise<void> {
    if (!this.isAuthenticated) {
      this.setCombatError('Connecte toi pour agir en combat.');
      this.updateHud();
      return;
    }

    if (!this.combatState || this.combatState.status !== 'active') {
      this.setCombatError('Aucun combat actif.');
      this.updateHud();
      return;
    }

    if (this.combatState.turn !== 'player') {
      this.setCombatError('Ce nest pas ton tour.');
      this.updateHud();
      return;
    }

    if (action === 'fireball' && this.combatState.player.mp < FIREBALL_MANA_COST) {
      this.setCombatError('Pas assez de MP pour Fireball.');
      this.updateHud();
      return;
    }

    if (action === 'rally' && this.combatState.player.mp < RALLY_MANA_COST) {
      this.setCombatError('Pas assez de MP pour Rally.');
      this.updateHud();
      return;
    }

    if (action === 'sunder' && this.combatState.player.mp < SUNDER_MANA_COST) {
      this.setCombatError('Pas assez de MP pour Sunder.');
      this.updateHud();
      return;
    }

    if (action === 'mend' && this.combatState.player.mp < MEND_MANA_COST) {
      this.setCombatError('Pas assez de MP pour Mend.');
      this.updateHud();
      return;
    }

    if (action === 'mend' && this.combatState.player.hp >= this.combatState.player.maxHp) {
      this.setCombatError('Tes PV sont deja au maximum.');
      this.updateHud();
      return;
    }

    if (action === 'cleanse' && this.combatState.player.mp < CLEANSE_MANA_COST) {
      this.setCombatError('Pas assez de MP pour Cleanse.');
      this.updateHud();
      return;
    }

    if (action === 'cleanse' && !this.hasCleanseableDebuffs()) {
      this.setCombatError('Aucun debuff a retirer.');
      this.updateHud();
      return;
    }

    if (action === 'interrupt' && this.combatState.player.mp < INTERRUPT_MANA_COST) {
      this.setCombatError('Pas assez de MP pour Interrupt.');
      this.updateHud();
      return;
    }

    const silenced = this.getCombatScriptTurns('playerSilencedTurns') > 0;
    const blockedBySilence =
      action === 'fireball' ||
      action === 'rally' ||
      action === 'sunder' ||
      action === 'mend' ||
      action === 'interrupt';
    if (silenced && blockedBySilence) {
      this.setCombatError('Tu es sous Silence et ne peux pas lancer ce skill.');
      this.updateHud();
      return;
    }

    if (action === 'interrupt' && !this.hasInterruptibleEnemyIntent()) {
      this.setCombatError('Aucune intention ennemie interruptible.');
      this.updateHud();
      return;
    }

    this.combatBusy = true;
    this.combatStatus = 'loading';
    this.combatMessage = 'Action en cours...';
    this.clearCombatError();
    this.updateHud();

    try {
      const encounterId = this.combatEncounterId ?? this.combatState.id;
      const payload = await this.fetchJson<unknown>(`/combat/${encounterId}/action`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
      const encounter = this.normalizeCombatPayload(payload);

      if (!encounter) {
        throw new Error('Combat action returned an empty payload.');
      }

      this.applyCombatSnapshot(encounter);
      await this.refreshGameplayState();
      await this.refreshAutoSaveState();
      await this.refreshBlacksmithState();
      await this.refreshQuestState();
    } catch (error) {
      this.setCombatError(this.getErrorMessage(error, 'Impossible de jouer cette action.'));
      if (this.combatState) {
        this.combatStatus = this.combatState.status;
      } else {
        this.combatStatus = 'error';
      }
    } finally {
      this.combatBusy = false;
      if (this.combatState) {
        this.combatStatus = this.combatState.status;
      }
      this.updateHud();
    }
  }

  private async forfeitCombat(): Promise<void> {
    if (!this.isAuthenticated) {
      this.setCombatError('Connecte toi pour fuir un combat.');
      this.updateHud();
      return;
    }

    if (!this.combatState || this.combatState.status !== 'active') {
      this.setCombatError('Aucun combat actif.');
      this.updateHud();
      return;
    }

    this.combatBusy = true;
    this.combatStatus = 'loading';
    this.combatMessage = 'Fuite en cours...';
    this.clearCombatError();
    this.updateHud();

    try {
      const encounterId = this.combatEncounterId ?? this.combatState.id;
      const payload = await this.fetchJson<unknown>(`/combat/${encounterId}/forfeit`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'Player chose to flee from the UI.' }),
      });
      const encounter = this.normalizeCombatPayload(payload);

      if (!encounter) {
        throw new Error('Combat forfeit returned an empty payload.');
      }

      this.applyCombatSnapshot(encounter);
      await this.refreshGameplayState();
      await this.refreshAutoSaveState();
      await this.refreshBlacksmithState();
      await this.refreshQuestState();
    } catch (error) {
      this.setCombatError(this.getErrorMessage(error, 'Impossible de fuir le combat.'));
      if (this.combatState) {
        this.combatStatus = this.combatState.status;
      } else {
        this.combatStatus = 'error';
      }
    } finally {
      this.combatBusy = false;
      if (this.combatState) {
        this.combatStatus = this.combatState.status;
      }
      this.updateHud();
    }
  }

  private async logout(): Promise<void> {
    try {
      await this.fetchJson('/auth/logout', {
        method: 'POST',
      });
    } catch {
      // Ignore logout errors and re-sync state below.
    } finally {
      await this.bootstrapSessionState();
    }
  }

  private async claimQuest(questKey: string): Promise<void> {
    if (!this.isAuthenticated) {
      this.questError = 'Login required to claim quests.';
      this.updateHud();
      return;
    }

    this.questBusy = true;
    this.questError = null;
    this.updateHud();

    try {
      await this.fetchJson(`/quests/${questKey}/claim`, {
        method: 'POST',
      });
      await this.refreshGameplayState();
      await this.refreshBlacksmithState();
      await this.refreshQuestState();
    } catch (error) {
      this.questError = this.getErrorMessage(error, 'Unable to claim this quest.');
    } finally {
      this.questBusy = false;
      this.updateHud();
    }
  }

  private async buyBlacksmithOffer(offerKey: string): Promise<void> {
    if (!this.isAuthenticated) {
      this.blacksmithError = 'Login required to buy items.';
      this.updateHud();
      return;
    }

    if (!this.hudState.blacksmithUnlocked) {
      this.blacksmithError = 'Blacksmith shop is locked.';
      this.updateHud();
      return;
    }

    this.blacksmithBusy = true;
    this.blacksmithError = null;
    this.updateHud();

    try {
      await this.fetchJson('/shops/blacksmith/buy', {
        method: 'POST',
        body: JSON.stringify({
          offerKey,
          quantity: 1,
        }),
      });
      await this.refreshGameplayState();
      await this.refreshBlacksmithState();
    } catch (error) {
      this.blacksmithError = this.getErrorMessage(error, 'Unable to buy this item.');
    } finally {
      this.blacksmithBusy = false;
      this.updateHud();
    }
  }

  private async restoreAutoSaveToSlot(slot: number): Promise<void> {
    if (!this.isAuthenticated) {
      this.autosaveError = 'Login required to restore autosave.';
      this.updateHud();
      return;
    }

    if (!this.autosave) {
      this.autosaveError = 'No autosave available.';
      this.updateHud();
      return;
    }

    this.saveSlotsLoadConfirmSlot = null;
    this.autosaveRestoreSlotBusy = slot;
    this.autosaveError = null;
    this.updateHud();

    try {
      await this.fetchJson(`/saves/auto/restore/${slot}`, {
        method: 'POST',
      });
      await this.refreshAutoSaveState();
      await this.refreshSaveSlotsState();
    } catch (error) {
      this.autosaveError = this.getErrorMessage(error, `Unable to restore autosave to slot ${slot}.`);
    } finally {
      this.autosaveRestoreSlotBusy = null;
      this.updateHud();
    }
  }

  private toggleLoadSaveSlotConfirmation(slot: number): void {
    if (!this.isAuthenticated) {
      this.saveSlotsError = 'Login required to load saves.';
      this.updateHud();
      return;
    }

    if (!this.hasExistingSaveSlot(slot)) {
      this.saveSlotsError = `Slot ${slot} is empty.`;
      this.updateHud();
      return;
    }

    if (this.saveSlotsActionBusyKey) {
      return;
    }

    this.saveSlotsError = null;
    this.saveSlotsLoadConfirmSlot = this.saveSlotsLoadConfirmSlot === slot ? null : slot;
    this.updateHud();
  }

  private clearLoadSaveSlotConfirmation(slot: number): void {
    if (this.saveSlotsLoadConfirmSlot === slot) {
      this.saveSlotsLoadConfirmSlot = null;
      this.updateHud();
    }
  }

  private async captureSaveSlot(slot: number): Promise<void> {
    if (!this.isAuthenticated) {
      this.saveSlotsError = 'Login required to capture saves.';
      this.updateHud();
      return;
    }

    this.saveSlotsLoadConfirmSlot = null;
    this.saveSlotsActionBusyKey = `capture:${slot}`;
    this.saveSlotsError = null;
    this.updateHud();

    try {
      await this.fetchJson(`/saves/${slot}/capture`, {
        method: 'POST',
      });
      await this.refreshSaveSlotsState();
    } catch (error) {
      this.saveSlotsError = this.getErrorMessage(error, `Unable to capture slot ${slot}.`);
    } finally {
      this.saveSlotsActionBusyKey = null;
      this.updateHud();
    }
  }

  private async loadSaveSlot(slot: number): Promise<void> {
    if (!this.isAuthenticated) {
      this.saveSlotsError = 'Login required to load saves.';
      this.updateHud();
      return;
    }

    if (!this.hasExistingSaveSlot(slot)) {
      this.saveSlotsError = `Slot ${slot} is empty.`;
      this.saveSlotsLoadConfirmSlot = null;
      this.updateHud();
      return;
    }

    if (this.saveSlotsLoadConfirmSlot !== slot) {
      this.saveSlotsError = `Confirm load for slot ${slot} first.`;
      this.saveSlotsLoadConfirmSlot = slot;
      this.updateHud();
      return;
    }

    this.saveSlotsLoadConfirmSlot = null;
    this.saveSlotsActionBusyKey = `load:${slot}`;
    this.saveSlotsError = null;
    this.updateHud();

    try {
      await this.fetchJson(`/saves/${slot}/load`, {
        method: 'POST',
      });
      await this.refreshGameplayState();
      await this.refreshCombatState();
      await this.refreshQuestState();
      await this.refreshBlacksmithState();
      await this.refreshAutoSaveState();
      await this.refreshSaveSlotsState();
    } catch (error) {
      this.saveSlotsError = this.getErrorMessage(error, `Unable to load slot ${slot}.`);
    } finally {
      this.saveSlotsActionBusyKey = null;
      this.updateHud();
    }
  }

  private async deleteSaveSlot(slot: number): Promise<void> {
    if (!this.isAuthenticated) {
      this.saveSlotsError = 'Login required to delete saves.';
      this.updateHud();
      return;
    }

    this.saveSlotsLoadConfirmSlot = null;
    this.saveSlotsActionBusyKey = `delete:${slot}`;
    this.saveSlotsError = null;
    this.updateHud();

    try {
      await this.fetchJson(`/saves/${slot}`, {
        method: 'DELETE',
      });
      await this.refreshSaveSlotsState();
    } catch (error) {
      this.saveSlotsError = this.getErrorMessage(error, `Unable to delete slot ${slot}.`);
    } finally {
      this.saveSlotsActionBusyKey = null;
      this.updateHud();
    }
  }

  private applyGameplaySnapshot(payload: unknown): void {
    if (!this.isRecord(payload)) {
      return;
    }

    const world = this.asRecord(payload.world);
    if (world) {
      const day = this.asNumber(world.day);
      const zone = this.asString(world.zone);

      if (day !== null) {
        this.hudState.day = Math.max(1, Math.round(day));
      }

      if (zone) {
        this.hudState.area = zone;
      }
    }

    const progression = this.asRecord(payload.progression);
    if (!progression) {
      return;
    }

    const gold = this.asNumber(progression.gold);
    const level = this.asNumber(progression.level);
    const experience = this.asNumber(progression.experience);
    const experienceToNextLevel = this.asNumber(progression.experienceToNextLevel);

    if (gold !== null) {
      this.hudState.gold = Math.max(0, Math.round(gold));
    }

    if (level !== null) {
      this.hudState.level = Math.max(1, Math.round(level));
    }

    if (experience !== null) {
      this.hudState.xp = Math.max(0, Math.round(experience));
    }

    if (experienceToNextLevel !== null) {
      this.hudState.xpToNext = Math.max(1, Math.round(experienceToNextLevel));
    }

    const village = this.asRecord(payload.village);
    if (village) {
      const blacksmith = this.asRecord(village.blacksmith);
      if (blacksmith) {
        this.hudState.blacksmithUnlocked = Boolean(blacksmith.unlocked);
        this.hudState.blacksmithCurseLifted = Boolean(blacksmith.curseLifted);
      }
    }

    const tower = this.asRecord(payload.tower);
    if (tower) {
      const currentFloor = this.asNumber(tower.currentFloor);
      const highestFloor = this.asNumber(tower.highestFloor);
      const bossFloor10Defeated = tower.bossFloor10Defeated;

      if (currentFloor !== null) {
        this.hudState.towerCurrentFloor = Math.max(1, Math.round(currentFloor));
      }

      if (highestFloor !== null) {
        this.hudState.towerHighestFloor = Math.max(1, Math.round(highestFloor));
      }

      this.hudState.towerBossFloor10Defeated = Boolean(bossFloor10Defeated);
    }
  }

  private resetGameplayHudState(): void {
    this.hudState.day = 1;
    this.hudState.area = 'Ferme';
    this.hudState.gold = 120;
    this.hudState.level = 1;
    this.hudState.xp = 0;
    this.hudState.xpToNext = 100;
    this.hudState.towerCurrentFloor = 1;
    this.hudState.towerHighestFloor = 1;
    this.hudState.towerBossFloor10Defeated = false;
    this.hudState.blacksmithUnlocked = false;
    this.hudState.blacksmithCurseLifted = false;
  }

  private resetAutoSaveState(): void {
    this.autosave = null;
    this.autosaveBusy = false;
    this.autosaveRestoreSlotBusy = null;
    this.autosaveError = null;
    this.autosaveRenderSignature = '';
  }

  private resetSaveSlotsState(): void {
    this.saveSlots = [];
    this.saveSlotsBusy = false;
    this.saveSlotsActionBusyKey = null;
    this.saveSlotsLoadConfirmSlot = null;
    this.saveSlotsError = null;
    this.saveSlotsRenderSignature = '';
  }

  private resetBlacksmithState(): void {
    this.blacksmithOffers = [];
    this.blacksmithBusy = false;
    this.blacksmithError = null;
    this.blacksmithRenderSignature = '';
  }

  private resetQuestState(): void {
    this.quests = [];
    this.questBusy = false;
    this.questError = null;
    this.questsRenderSignature = '';
  }

  private applyCombatSnapshot(snapshot: CombatEncounterState): void {
    this.combatEncounterId = snapshot.id;
    this.combatState = snapshot;
    this.combatStatus = snapshot.status;
    this.combatLogs = snapshot.logs.slice(-20);
    this.combatMessage = this.resolveCombatMessage(snapshot);
    this.combatError = null;
    this.syncHudStateFromCombat(snapshot);
  }

  private resetCombatState(): void {
    this.combatEncounterId = null;
    this.combatState = null;
    this.combatLogs = [];
    this.combatStatus = 'idle';
    this.combatMessage = this.isAuthenticated ? 'Aucun combat actif.' : 'Connecte toi pour lancer un combat.';
    this.combatError = null;
    this.syncHudStateFromCombat(null);
  }

  private syncHudStateFromCombat(snapshot: CombatEncounterState | null): void {
    if (!snapshot) {
      this.hudState.hp = 32;
      this.hudState.maxHp = 32;
      this.hudState.mp = 15;
      this.hudState.maxMp = 15;
      return;
    }

    this.hudState.hp = snapshot.player.hp;
    this.hudState.maxHp = snapshot.player.maxHp;
    this.hudState.mp = snapshot.player.mp;
    this.hudState.maxMp = snapshot.player.maxMp;
  }

  private resolveCombatMessage(snapshot: CombatEncounterState): string {
    const latestLog = snapshot.logs[snapshot.logs.length - 1];
    if (latestLog) {
      return latestLog;
    }

    if (snapshot.status === 'active') {
      return snapshot.turn === 'player' ? 'A toi de jouer.' : 'Tour ennemi.';
    }

    if (snapshot.status === 'won') {
      return 'Victoire. Combat termine.';
    }

    if (snapshot.status === 'lost') {
      return 'Defaite. Reviens plus fort.';
    }

    if (snapshot.status === 'fled') {
      return 'Tu as fui le combat.';
    }

    return 'Combat termine.';
  }

  private getCombatName(): string {
    if (!this.combatState) {
      return this.isAuthenticated ? 'Aucun combat actif' : 'Connecte toi pour combattre';
    }

    return this.combatState.enemy.name;
  }

  private getCombatStatusLabel(): string {
    switch (this.combatStatus) {
      case 'loading':
        return 'Chargement';
      case 'idle':
        return 'Inactif';
      case 'error':
        return 'Erreur';
      case 'active':
        return 'En cours';
      case 'won':
        return 'Victoire';
      case 'lost':
        return 'Defaite';
      case 'fled':
        return 'Fuite';
      default:
        return 'Inactif';
    }
  }

  private getCombatTurnLabel(): string {
    if (!this.combatState) {
      return '-';
    }

    return this.combatState.turn === 'player' ? 'Joueur' : 'Ennemi';
  }

  private getCombatUnitValue(current: number, max: number): string {
    return `${this.formatValue(current)} / ${this.formatValue(max)}`;
  }

  private getCombatEnemyValue(stat: 'hp' | 'mp'): string {
    if (!this.combatState) {
      return '-';
    }

    if (stat === 'hp') {
      return this.getCombatUnitValue(this.combatState.enemy.currentHp, this.combatState.enemy.hp);
    }

    return this.getCombatUnitValue(this.combatState.enemy.currentMp, this.combatState.enemy.mp);
  }

  private getCombatPlayerEffectsLabel(): string {
    if (!this.combatState) {
      return '-';
    }

    const effects: string[] = [];

    const rallyTurns = this.getCombatScriptTurns('playerRallyTurns');
    if (rallyTurns > 0) {
      effects.push(`Rally ${rallyTurns}t`);
    }

    const burningTurns = this.getCombatScriptTurns('playerBurningTurns');
    if (burningTurns > 0) {
      effects.push(`Burning ${burningTurns}t`);
    }

    const silencedTurns = this.getCombatScriptTurns('playerSilencedTurns');
    if (silencedTurns > 0) {
      effects.push(`Silenced ${silencedTurns}t`);
    }

    return effects.length > 0 ? effects.join(' | ') : 'None';
  }

  private getCombatEnemyEffectsLabel(): string {
    if (!this.combatState) {
      return '-';
    }

    const effects: string[] = [];
    const shatterTurns = this.getCombatScriptTurns('enemyShatterTurns');
    if (shatterTurns > 0) {
      effects.push(`Sunder ${shatterTurns}t`);
    }

    if (this.getCombatScriptFlag('avatarEnraged')) {
      effects.push('Enraged');
    }

    return effects.length > 0 ? effects.join(' | ') : 'None';
  }

  private renderCombatEnemyTelegraphs(): void {
    this.renderCombatEnemyIntentChip('[data-hud="combatEnemyIntent"]', 'enemyTelegraphIntent', false);
    this.renderCombatEnemyIntentChip('[data-hud="combatEnemyIntentNext"]', 'enemyTelegraphNextIntent', true);
  }

  private renderCombatEnemyIntentChip(
    selector: string,
    intentKey: 'enemyTelegraphIntent' | 'enemyTelegraphNextIntent',
    isPreview: boolean,
  ): void {
    const element = this.hudRoot?.querySelector<HTMLElement>(selector);
    if (!element) {
      return;
    }

    const intentUi = this.getCombatEnemyIntentUi(intentKey, isPreview);
    element.classList.add('combat-intent-chip');
    element.replaceChildren();
    if (intentUi.icon !== 'none') {
      const icon = document.createElement('span');
      icon.classList.add('combat-intent-icon');
      icon.dataset.intentIcon = intentUi.icon;
      icon.textContent = intentUi.iconLabel;
      const iconTooltip = this.getCombatIntentIconTooltip(intentUi.iconLabel);
      icon.title = iconTooltip;
      icon.setAttribute('aria-label', iconTooltip);
      element.appendChild(icon);
    }

    const text = document.createElement('span');
    text.classList.add('combat-intent-text');
    text.textContent = intentUi.label;
    element.appendChild(text);

    element.dataset.intentTone = intentUi.tone;
    element.dataset.intentPulse = intentUi.pulse ? '1' : '0';
    element.dataset.intentLayer = isPreview ? 'next' : 'current';
  }

  private getCombatEnemyIntentUi(
    intentKey: 'enemyTelegraphIntent' | 'enemyTelegraphNextIntent',
    isPreview: boolean,
  ): {
    label: string;
    tone: 'neutral' | 'calm' | 'warning' | 'danger' | 'utility';
    pulse: boolean;
    icon: 'none' | 'attack' | 'magic' | 'cleanse' | 'dispel' | 'ulti';
    iconLabel: string;
  } {
    if (!this.combatState || this.combatState.status !== 'active' || this.combatState.turn !== 'player') {
      return { label: '-', tone: 'neutral', pulse: false, icon: 'none', iconLabel: '-' };
    }

    const intent = this.combatState.scriptState?.[intentKey];
    if (typeof intent !== 'string' || intent.length === 0) {
      return isPreview
        ? { label: 'NO PREVIEW', tone: 'neutral', pulse: false, icon: 'none', iconLabel: '-' }
        : { label: 'UNCLEAR', tone: 'warning', pulse: false, icon: 'none', iconLabel: '?' };
    }

    const mapped = this.mapEnemyIntentUi(intent);
    if (!mapped) {
      return { label: 'UNCLEAR', tone: 'warning', pulse: false, icon: 'none', iconLabel: '?' };
    }

    return {
      label: isPreview ? `NEXT: ${mapped.preview}` : mapped.current,
      tone: mapped.tone,
      pulse: isPreview ? false : mapped.pulse,
      icon: mapped.icon,
      iconLabel: mapped.iconLabel,
    };
  }

  private mapEnemyIntentUi(intent: string):
    | {
      current: string;
      preview: string;
      tone: 'calm' | 'warning' | 'danger' | 'utility';
      pulse: boolean;
      icon: 'attack' | 'magic' | 'cleanse' | 'dispel' | 'ulti';
      iconLabel: string;
    }
    | null {
    switch (intent) {
      case 'basic_strike':
        return {
          current: 'ATK: STRIKE',
          preview: 'STRIKE',
          tone: 'calm',
          pulse: false,
          icon: 'attack',
          iconLabel: 'ATK',
        };
      case 'root_smash':
        return {
          current: 'SKILL: ROOT SMASH',
          preview: 'ROOT SMASH',
          tone: 'danger',
          pulse: true,
          icon: 'attack',
          iconLabel: 'ATK',
        };
      case 'opening_punish':
        return {
          current: 'SKILL: PUNISH',
          preview: 'PUNISH',
          tone: 'warning',
          pulse: false,
          icon: 'attack',
          iconLabel: 'ATK',
        };
      case 'cinder_burst':
        return {
          current: 'SKILL: CINDER BURST',
          preview: 'CINDER BURST',
          tone: 'danger',
          pulse: true,
          icon: 'magic',
          iconLabel: 'MAG',
        };
      case 'molten_shell':
        return {
          current: 'UTILITY: CLEANSE',
          preview: 'CLEANSE',
          tone: 'utility',
          pulse: false,
          icon: 'cleanse',
          iconLabel: 'CLN',
        };
      case 'twin_slash':
        return {
          current: 'SKILL: TWIN SLASH',
          preview: 'TWIN SLASH',
          tone: 'danger',
          pulse: true,
          icon: 'attack',
          iconLabel: 'ATK',
        };
      case 'iron_recenter':
        return {
          current: 'UTILITY: CLEANSE',
          preview: 'CLEANSE',
          tone: 'utility',
          pulse: false,
          icon: 'cleanse',
          iconLabel: 'CLN',
        };
      case 'cataclysm_ray':
        return {
          current: 'ULT: CATACLYSM RAY',
          preview: 'CATACLYSM RAY',
          tone: 'danger',
          pulse: true,
          icon: 'ulti',
          iconLabel: 'ULT',
        };
      case 'cursed_claw':
        return {
          current: 'ATK: CURSED CLAW',
          preview: 'CURSED CLAW',
          tone: 'warning',
          pulse: false,
          icon: 'attack',
          iconLabel: 'ATK',
        };
      case 'null_sigil':
        return {
          current: 'UTILITY: DISPEL',
          preview: 'DISPEL',
          tone: 'utility',
          pulse: false,
          icon: 'dispel',
          iconLabel: 'DSP',
        };
      default:
        return null;
    }
  }

  private getCombatIntentIconTooltip(iconLabel: string): string {
    switch (iconLabel) {
      case 'ATK':
        return 'ATK: attaque physique';
      case 'MAG':
        return 'MAG: attaque magique';
      case 'CLN':
        return 'CLN: retire un debuff ennemi';
      case 'DSP':
        return 'DSP: retire un buff joueur';
      case 'ULT':
        return 'ULT: attaque ultime';
      default:
        return iconLabel;
    }
  }

  private getCombatScriptTurns(key: string): number {
    const raw = this.combatState?.scriptState?.[key];
    if (typeof raw !== 'number' || !Number.isFinite(raw)) {
      return 0;
    }

    return Math.max(0, Math.floor(raw));
  }

  private getCombatScriptFlag(key: string): boolean {
    return this.combatState?.scriptState?.[key] === true;
  }

  private hasCleanseableDebuffs(): boolean {
    return this.getCombatScriptTurns('playerBurningTurns') > 0 || this.getCombatScriptTurns('playerSilencedTurns') > 0;
  }

  private hasInterruptibleEnemyIntent(): boolean {
    if (!this.combatState || this.combatState.status !== 'active' || this.combatState.turn !== 'player') {
      return false;
    }

    const raw = this.combatState.scriptState?.enemyTelegraphIntent;
    if (typeof raw !== 'string' || raw.length === 0) {
      return false;
    }

    return this.isInterruptibleEnemyIntent(raw);
  }

  private isInterruptibleEnemyIntent(intent: string): boolean {
    return (
      intent === 'cinder_burst' ||
      intent === 'molten_shell' ||
      intent === 'iron_recenter' ||
      intent === 'null_sigil' ||
      intent === 'cataclysm_ray' ||
      intent === 'root_smash'
    );
  }

  private clearCombatError(): void {
    this.combatError = null;
  }

  private setCombatError(message: string): void {
    this.combatError = message;
  }

  private getDebugQaStatusLabel(): string {
    if (this.debugQaStatus === 'loading') {
      return 'Loading...';
    }

    if (this.debugQaStatus === 'error') {
      return 'Error';
    }

    if (this.debugQaStatus === 'success') {
      return 'Done';
    }

    return 'Idle';
  }

  private async handleDebugQaAction(action: DebugQaActionName): Promise<void> {
    if (!this.debugQaEnabled) {
      return;
    }

    if (!this.isAuthenticated) {
      this.debugQaError = 'Connecte toi pour utiliser le debug QA.';
      this.debugQaMessage = null;
      this.debugQaStatus = 'error';
      this.updateHud();
      return;
    }

    const request = this.buildDebugQaRequest(action);
    if (!request) {
      this.debugQaError = 'Debug QA values are invalid.';
      this.debugQaMessage = null;
      this.debugQaStatus = 'error';
      this.updateHud();
      return;
    }

    this.debugQaBusyAction = action;
    this.debugQaStatus = 'loading';
    this.debugQaError = null;
    this.debugQaMessage = request.loadingLabel;
    this.updateHud();

    try {
      const responsePayload = await this.fetchJson<unknown>(request.path, {
        method: 'POST',
        body: JSON.stringify(request.body),
      });
      this.debugQaStatus = 'success';
      this.debugQaMessage = this.getDebugQaSuccessMessage(action, responsePayload, request.successLabel);
      await this.bootstrapSessionState();
    } catch (error) {
      this.debugQaStatus = 'error';
      this.debugQaError = this.getErrorMessage(error, request.failureLabel);
      this.debugQaMessage = null;
    } finally {
      this.debugQaBusyAction = null;
      this.updateHud();
    }
  }

  private buildDebugQaRequest(
    action: DebugQaActionName,
  ):
    | {
        path: string;
        body: Record<string, unknown>;
        loadingLabel: string;
        successLabel: string;
        failureLabel: string;
      }
    | null {
    switch (action) {
      case 'grant-resources': {
        const xp = this.readDebugQaNumber(this.debugQaGrantXpInput, 250);
        const gold = this.readDebugQaNumber(this.debugQaGrantGoldInput, 500);
        return {
          path: '/debug/admin/grant-resources',
          body: {
            experience: xp,
            gold,
            items: [],
          },
          loadingLabel: `Granting ${xp} XP / ${gold} gold...`,
          successLabel: `Granted ${xp} XP / ${gold} gold.`,
          failureLabel: 'Unable to grant debug resources.',
        };
      }
      case 'set-tower-floor': {
        const floor = this.readDebugQaNumber(this.debugQaTowerFloorInput, 10, 1, 10);
        return {
          path: '/debug/admin/set-tower-floor',
          body: { floor },
          loadingLabel: `Setting tower floor to ${floor}...`,
          successLabel: `Tower floor set to ${floor}.`,
          failureLabel: 'Unable to set tower floor.',
        };
      }
      case 'apply-state-preset': {
        const presetKey = (this.debugQaStatePresetSelect?.value.trim() || 'mid_tower') as DebugStatePresetKey;
        return {
          path: '/debug/admin/apply-state-preset',
          body: { presetKey },
          loadingLabel: `Applying ${presetKey} state preset...`,
          successLabel: `State preset ${presetKey} applied.`,
          failureLabel: 'Unable to apply state preset.',
        };
      }
      case 'apply-loadout-preset': {
        const presetKey = this.debugQaLoadoutPresetSelect?.value.trim() || 'tower_mid';
        return {
          path: '/debug/admin/apply-loadout-preset',
          body: { presetKey },
          loadingLabel: `Applying ${presetKey} loadout...`,
          successLabel: `Loadout preset ${presetKey} applied.`,
          failureLabel: 'Unable to apply loadout preset.',
        };
      }
      case 'complete-quests': {
        return {
          path: '/debug/admin/complete-quests',
          body: {},
          loadingLabel: 'Completing quests...',
          successLabel: 'Quests marked as completed.',
          failureLabel: 'Unable to complete quests.',
        };
      }
      case 'set-world-flags': {
        const flags = this.readDebugQaFlagList(this.debugQaWorldFlagsInput);
        const removeFlags = this.readDebugQaFlagList(this.debugQaWorldFlagsRemoveInput);
        const replace = Boolean(this.debugQaWorldFlagsReplaceInput?.checked);
        if (!replace && flags.length === 0 && removeFlags.length === 0) {
          return null;
        }

        return {
          path: '/debug/admin/set-world-flags',
          body: {
            flags,
            removeFlags,
            replace,
          },
          loadingLabel: replace ? 'Replacing world flags...' : 'Updating world flags...',
          successLabel: replace ? 'World flags replaced.' : 'World flags updated.',
          failureLabel: 'Unable to set world flags.',
        };
      }
      case 'set-quest-status': {
        const questKey = this.debugQaQuestKeyInput?.value.trim() ?? '';
        const status = this.debugQaQuestStatusSelect?.value.trim() as QuestStatus;
        if (!questKey || !this.isQuestStatusValue(status)) {
          return null;
        }

        return {
          path: '/debug/admin/set-quest-status',
          body: {
            questKey,
            status,
          },
          loadingLabel: `Setting quest ${questKey} to ${status}...`,
          successLabel: `Quest ${questKey} set to ${status}.`,
          failureLabel: 'Unable to set quest status.',
        };
      }
      default:
        return null;
    }
  }

  private getDebugQaSuccessMessage(
    action: DebugQaActionName,
    payload: unknown,
    fallback: string,
  ): string {
    if (action === 'apply-state-preset') {
      const message = this.formatApplyStatePresetSuccess(payload);
      if (message) {
        return message;
      }
    }

    if (action === 'set-world-flags') {
      const message = this.formatSetWorldFlagsSuccess(payload);
      if (message) {
        return message;
      }
    }

    if (action === 'set-quest-status') {
      const message = this.formatSetQuestStatusSuccess(payload);
      if (message) {
        return message;
      }
    }

    return fallback;
  }

  private formatApplyStatePresetSuccess(payload: unknown): string | null {
    const root = this.asRecord(payload);
    const statePreset = this.asRecord(root?.statePreset);
    const preset = this.asRecord(statePreset?.preset);
    const tower = this.asRecord(statePreset?.tower);
    const towerBefore = this.asRecord(tower?.before);
    const towerAfter = this.asRecord(tower?.after);
    const worldFlags = this.asRecord(statePreset?.worldFlags);

    const presetKey = this.asString(preset?.key);
    const floorBefore = this.asNumber(towerBefore?.currentFloor);
    const floorAfter = this.asNumber(towerAfter?.currentFloor);
    const addedFlags = this.asStringArray(worldFlags?.added);
    const removedFlags = this.asStringArray(worldFlags?.removed);

    if (!presetKey || floorBefore === null || floorAfter === null) {
      return null;
    }

    const addedPreview = this.formatDebugQaFlagPreview(addedFlags);
    const removedPreview = this.formatDebugQaFlagPreview(removedFlags);
    return `Preset ${presetKey}: floor ${Math.round(floorBefore)} -> ${Math.round(floorAfter)} | +${addedFlags.length} (${addedPreview}) / -${removedFlags.length} (${removedPreview})`;
  }

  private formatSetWorldFlagsSuccess(payload: unknown): string | null {
    const root = this.asRecord(payload);
    const worldFlags = this.asRecord(root?.worldFlags);
    const addedFlags = this.asStringArray(worldFlags?.added);
    const removedFlags = this.asStringArray(worldFlags?.removed);
    const afterFlags = this.asStringArray(worldFlags?.after);

    if (!worldFlags) {
      return null;
    }

    const addedPreview = this.formatDebugQaFlagPreview(addedFlags);
    const removedPreview = this.formatDebugQaFlagPreview(removedFlags);
    return `World flags updated: total ${afterFlags.length} | +${addedFlags.length} (${addedPreview}) / -${removedFlags.length} (${removedPreview})`;
  }

  private formatSetQuestStatusSuccess(payload: unknown): string | null {
    const root = this.asRecord(payload);
    const quest = this.asRecord(root?.quest);

    const questKey = this.asString(quest?.questKey);
    const previousStatus = this.asString(quest?.previousStatus);
    const nextStatus = this.asString(quest?.nextStatus);
    if (!questKey || !previousStatus || !nextStatus) {
      return null;
    }

    return `Quest ${questKey}: ${previousStatus} -> ${nextStatus}`;
  }

  private formatDebugQaFlagPreview(flags: string[]): string {
    if (flags.length === 0) {
      return 'none';
    }

    const preview = flags.slice(0, 3).join(', ');
    if (flags.length <= 3) {
      return preview;
    }

    return `${preview}, ...`;
  }

  private readDebugQaNumber(
    input: HTMLInputElement | null,
    fallback: number,
    min?: number,
    max?: number,
  ): number {
    const raw = input?.value?.trim();
    const parsed = raw ? Number(raw) : fallback;
    if (!Number.isFinite(parsed)) {
      return fallback;
    }

    const rounded = Math.round(parsed);
    if (typeof min === 'number' && rounded < min) {
      return min;
    }
    if (typeof max === 'number' && rounded > max) {
      return max;
    }

    return Math.max(0, rounded);
  }

  private isQuestStatusValue(value: string): value is QuestStatus {
    return value === 'active' || value === 'completed' || value === 'claimed';
  }

  private readDebugQaFlagList(input: HTMLTextAreaElement | null): string[] {
    const raw = input?.value ?? '';
    if (!raw.trim()) {
      return [];
    }

    const values = raw
      .split(/[\n,;]+/g)
      .map((entry) => entry.trim().toLowerCase())
      .filter((entry) => entry.length > 0);

    return [...new Set(values)];
  }

  private getBlacksmithStatusLabel(): string {
    if (!this.hudState.blacksmithCurseLifted) {
      return 'Cursed';
    }

    if (!this.hudState.blacksmithUnlocked) {
      return 'Recovering';
    }

    return 'Unlocked';
  }

  private async fetchJson<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set('Accept', 'application/json');

    if (init.body !== undefined && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
      credentials: 'include',
    });

    const rawBody = await response.text();
    const payload = rawBody.length > 0 ? this.safeParseJson(rawBody) : null;

    if (!response.ok) {
      const message = this.getPayloadMessage(payload) ?? `Request failed (${response.status})`;
      throw new Error(message);
    }

    return payload as T;
  }

  private safeParseJson(rawBody: string): unknown {
    try {
      return JSON.parse(rawBody) as unknown;
    } catch {
      return rawBody;
    }
  }

  private getPayloadMessage(payload: unknown): string | null {
    if (typeof payload === 'string' && payload.trim().length > 0) {
      return payload.trim();
    }

    if (!this.isRecord(payload)) {
      return null;
    }

    const message = payload.message;
    if (typeof message === 'string' && message.trim().length > 0) {
      return message.trim();
    }

    if (Array.isArray(message)) {
      const parts = message
        .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
        .map((entry) => entry.trim());
      if (parts.length > 0) {
        return parts.join(', ');
      }
    }

    const error = payload.error;
    if (typeof error === 'string' && error.trim().length > 0) {
      return error.trim();
    }

    return null;
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message.trim().length > 0) {
      return error.message;
    }

    if (typeof error === 'string' && error.trim().length > 0) {
      return error.trim();
    }

    return fallback;
  }

  private normalizeQuestsPayload(payload: unknown): QuestState[] {
    if (!this.isRecord(payload)) {
      return [];
    }

    const rawQuests = payload.quests;
    if (!Array.isArray(rawQuests)) {
      return [];
    }

    return rawQuests
      .map((entry) => this.normalizeQuestState(entry))
      .filter((entry): entry is QuestState => entry !== null);
  }

  private normalizeBlacksmithPayload(payload: unknown): { offers: BlacksmithOfferState[] } {
    if (!this.isRecord(payload)) {
      return { offers: [] };
    }

    const shop = this.asRecord(payload.shop);
    if (!shop) {
      return { offers: [] };
    }

    const rawOffers = shop.offers;
    if (!Array.isArray(rawOffers)) {
      return { offers: [] };
    }

    const offers = rawOffers
      .map((entry) => this.normalizeBlacksmithOffer(entry))
      .filter((entry): entry is BlacksmithOfferState => entry !== null);

    return { offers };
  }

  private normalizeSaveSlotsPayload(payload: unknown): SaveSlotState[] {
    if (!this.isRecord(payload)) {
      return [];
    }

    const rawSlots = payload.slots;
    if (!Array.isArray(rawSlots)) {
      return [];
    }

    return rawSlots
      .map((entry) => this.normalizeSaveSlot(entry))
      .filter((entry): entry is SaveSlotState => entry !== null)
      .sort((left, right) => left.slot - right.slot);
  }

  private normalizeAutoSavePayload(payload: unknown): AutoSaveState | null {
    if (!this.isRecord(payload)) {
      return null;
    }

    const autosave = this.asRecord(payload.autosave);
    if (!autosave) {
      return null;
    }

    const version = this.asNumber(autosave.version);
    const reason = this.asString(autosave.reason);
    const updatedAt = this.asString(autosave.updatedAt);

    if (version === null || !reason || !updatedAt) {
      return null;
    }

    return {
      version: Math.max(1, Math.round(version)),
      reason,
      updatedAt,
    };
  }

  private normalizeSaveSlot(value: unknown): SaveSlotState | null {
    if (!this.isRecord(value)) {
      return null;
    }

    const slotValue = this.asNumber(value.slot);
    if (slotValue === null) {
      return null;
    }

    const slot = Math.round(slotValue);
    if (slot < 1 || slot > 3) {
      return null;
    }

    const exists = Boolean(value.exists);
    const versionValue = this.asNumber(value.version);
    const version = exists && versionValue !== null ? Math.max(1, Math.round(versionValue)) : null;
    const label = this.asString(value.label);
    const updatedAt = this.asString(value.updatedAt);

    return {
      slot,
      exists,
      version,
      label,
      updatedAt,
      preview: null,
    };
  }

  private normalizeSaveSlotPreviewPayload(payload: unknown): SaveSlotPreview | null {
    if (!this.isRecord(payload)) {
      return null;
    }

    const save = this.asRecord(payload.save);
    if (!save) {
      return null;
    }

    const snapshot = this.asRecord(save.snapshot);
    if (!snapshot) {
      return null;
    }

    return this.normalizeSaveSlotPreview(snapshot);
  }

  private normalizeSaveSlotPreview(snapshot: Record<string, unknown>): SaveSlotPreview | null {
    const player = this.asRecord(snapshot.player);
    const tower = this.asRecord(snapshot.tower);

    if (!player && !tower && !Array.isArray(snapshot.inventory) && !Array.isArray(snapshot.equipment)) {
      return null;
    }

    const levelValue = player ? this.asNumber(player.level) : null;
    const goldValue = player ? this.asNumber(player.gold) : null;
    const floorCurrentValue = tower ? this.asNumber(tower.currentFloor) : null;
    const floorHighestValue = tower ? this.asNumber(tower.highestFloor) : null;

    const rawInventory = Array.isArray(snapshot.inventory) ? snapshot.inventory : [];
    const inventory = rawInventory
      .map((entry) => this.normalizeSaveSlotPreviewInventoryItem(entry))
      .filter((entry): entry is { itemKey: string; quantity: number } => entry !== null)
      .sort((left, right) => right.quantity - left.quantity || left.itemKey.localeCompare(right.itemKey));

    const rawEquipment = Array.isArray(snapshot.equipment) ? snapshot.equipment : [];
    const equipment = rawEquipment
      .map((entry) => this.normalizeSaveSlotPreviewEquipmentItem(entry))
      .filter((entry): entry is { slot: string; itemKey: string } => entry !== null)
      .sort((left, right) => left.slot.localeCompare(right.slot));

    return {
      playerLevel: levelValue !== null ? Math.max(1, Math.round(levelValue)) : null,
      gold: goldValue !== null ? Math.max(0, Math.round(goldValue)) : null,
      towerCurrentFloor: floorCurrentValue !== null ? Math.max(1, Math.round(floorCurrentValue)) : null,
      towerHighestFloor: floorHighestValue !== null ? Math.max(1, Math.round(floorHighestValue)) : null,
      inventoryTop: inventory.slice(0, 3),
      equipmentTop: equipment.slice(0, 3),
      equippedCount: equipment.length,
    };
  }

  private normalizeSaveSlotPreviewInventoryItem(value: unknown): { itemKey: string; quantity: number } | null {
    if (!this.isRecord(value)) {
      return null;
    }

    const itemKey = this.asString(value.itemKey);
    const quantity = this.asNumber(value.quantity);
    if (!itemKey || quantity === null) {
      return null;
    }

    const roundedQuantity = Math.round(quantity);
    if (roundedQuantity <= 0) {
      return null;
    }

    return {
      itemKey,
      quantity: roundedQuantity,
    };
  }

  private normalizeSaveSlotPreviewEquipmentItem(value: unknown): { slot: string; itemKey: string } | null {
    if (!this.isRecord(value)) {
      return null;
    }

    const slot = this.asString(value.slot);
    const itemKey = this.asString(value.itemKey);
    if (!slot || !itemKey) {
      return null;
    }

    return {
      slot,
      itemKey,
    };
  }

  private normalizeBlacksmithOffer(value: unknown): BlacksmithOfferState | null {
    if (!this.isRecord(value)) {
      return null;
    }

    const offerKey = this.asString(value.offerKey);
    const itemKey = this.asString(value.itemKey);
    const name = this.asString(value.name);
    const description = this.asString(value.description);
    const goldPrice = this.asNumber(value.goldPrice);

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

  private normalizeQuestState(value: unknown): QuestState | null {
    if (!this.isRecord(value)) {
      return null;
    }

    const key = this.asString(value.key);
    const title = this.asString(value.title);
    const description = this.asString(value.description);
    const status = this.asQuestStatus(value.status);
    const rawObjectives = value.objectives;

    if (!key || !title || !description || !status || !Array.isArray(rawObjectives)) {
      return null;
    }

    const objectives = rawObjectives
      .map((objective) => this.normalizeQuestObjective(objective))
      .filter((objective): objective is QuestObjectiveState => objective !== null);

    return {
      key,
      title,
      description,
      status,
      canClaim: Boolean(value.canClaim),
      objectives,
    };
  }

  private normalizeQuestObjective(value: unknown): QuestObjectiveState | null {
    if (!this.isRecord(value)) {
      return null;
    }

    const key = this.asString(value.key);
    const description = this.asString(value.description);
    const current = this.asNumber(value.current);
    const target = this.asNumber(value.target);

    if (!key || !description || current === null || target === null) {
      return null;
    }

    return {
      key,
      description,
      current: Math.max(0, Math.round(current)),
      target: Math.max(1, Math.round(target)),
      completed: Boolean(value.completed),
    };
  }

  private normalizeCombatPayload(payload: unknown): CombatEncounterState | null {
    if (!this.isRecord(payload)) {
      return null;
    }

    const directEncounter = this.extractCombatStateCandidate(payload.encounter);
    if (directEncounter) {
      return directEncounter;
    }

    const nestedState = this.extractCombatStateCandidate(payload.state);
    if (nestedState) {
      return nestedState;
    }

    const dataState = this.extractCombatStateCandidate(payload.data);
    if (dataState) {
      return dataState;
    }

    return this.normalizeCombatState(payload);
  }

  private extractCombatStateCandidate(value: unknown): CombatEncounterState | null {
    if (!this.isRecord(value)) {
      return null;
    }

    if (this.isRecord(value.encounter)) {
      const fromEncounter = this.normalizeCombatState(value.encounter);
      if (fromEncounter) {
        return fromEncounter;
      }
    }

    if (this.isRecord(value.state)) {
      const fromState = this.normalizeCombatState(value.state);
      if (fromState) {
        return fromState;
      }
    }

    if (this.isRecord(value.data)) {
      const fromData = this.normalizeCombatState(value.data);
      if (fromData) {
        return fromData;
      }
    }

    return this.normalizeCombatState(value);
  }

  private normalizeCombatState(value: unknown): CombatEncounterState | null {
    if (!this.isRecord(value)) {
      return null;
    }

    const id = this.asString(value.id);
    const status = this.asCombatStatus(value.status);
    const turn = this.asCombatTurn(value.turn) ?? 'player';
    const round = this.asNumber(value.round) ?? 1;
    const playerRecord = this.asRecord(value.player);
    const enemyRecord = this.asRecord(value.enemy);

    if (!id || !status || !playerRecord || !enemyRecord) {
      return null;
    }

    const player = this.normalizePlayerState(playerRecord);
    const enemy = this.normalizeEnemyState(enemyRecord);

    if (!player || !enemy) {
      return null;
    }

    return {
      id,
      status,
      turn,
      round,
      logs: this.asStringArray(value.logs).slice(-20),
      scriptState: this.normalizeCombatScriptState(value.scriptState),
      player,
      enemy,
      lastAction: this.asString(value.lastAction),
      createdAt: this.asString(value.createdAt) ?? undefined,
      updatedAt: this.asString(value.updatedAt) ?? undefined,
      endedAt: this.asString(value.endedAt) ?? null,
    };
  }

  private normalizeCombatScriptState(value: unknown): Record<string, boolean | number | string> {
    if (!this.isRecord(value)) {
      return {};
    }

    const normalized: Record<string, boolean | number | string> = {};
    for (const [key, entryValue] of Object.entries(value)) {
      if (
        typeof entryValue === 'boolean' ||
        typeof entryValue === 'number' ||
        typeof entryValue === 'string'
      ) {
        normalized[key] = entryValue;
      }
    }

    return normalized;
  }

  private normalizePlayerState(value: Record<string, unknown>): CombatUnitState | null {
    const hp = this.asNumber(value.hp);
    const maxHp = this.asNumber(value.maxHp) ?? hp;
    const mp = this.asNumber(value.mp);
    const maxMp = this.asNumber(value.maxMp) ?? mp;

    if (hp === null || maxHp === null || mp === null || maxMp === null) {
      return null;
    }

    return {
      hp,
      maxHp,
      mp,
      maxMp,
      attack: this.asNumber(value.attack) ?? 0,
      defense: this.asNumber(value.defense) ?? 0,
      magicAttack: this.asNumber(value.magicAttack) ?? 0,
      speed: this.asNumber(value.speed) ?? 0,
      defending: Boolean(value.defending),
    };
  }

  private normalizeEnemyState(value: Record<string, unknown>): CombatEnemyState | null {
    const baseHp = this.asNumber(value.hp);
    const baseMp = this.asNumber(value.mp);
    const currentHp = this.asNumber(value.currentHp) ?? baseHp;
    const currentMp = this.asNumber(value.currentMp) ?? baseMp;

    if (baseHp === null || baseMp === null || currentHp === null || currentMp === null) {
      return null;
    }

    return {
      key: this.asString(value.key) ?? 'enemy',
      name: this.asString(value.name) ?? 'Enemy',
      hp: baseHp,
      mp: baseMp,
      currentHp,
      currentMp,
      attack: this.asNumber(value.attack) ?? 0,
      defense: this.asNumber(value.defense) ?? 0,
      magicAttack: this.asNumber(value.magicAttack) ?? 0,
      speed: this.asNumber(value.speed) ?? 0,
    };
  }

  private asRecord(value: unknown): Record<string, unknown> | null {
    return this.isRecord(value) ? value : null;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private asString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
  }

  private asStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
      .map((entry) => entry.trim());
  }

  private asNumber(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  }

  private asCombatStatus(value: unknown): CombatStatus | null {
    if (value === 'active' || value === 'won' || value === 'lost' || value === 'fled') {
      return value;
    }

    return null;
  }

  private asQuestStatus(value: unknown): QuestStatus | null {
    if (value === 'active' || value === 'completed' || value === 'claimed') {
      return value;
    }

    return null;
  }

  private asCombatTurn(value: unknown): CombatTurn | null {
    if (value === 'player' || value === 'enemy') {
      return value;
    }

    return null;
  }

  private formatIsoForHud(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    const dd = `${date.getDate()}`.padStart(2, '0');
    const mm = `${date.getMonth() + 1}`.padStart(2, '0');
    const yyyy = date.getFullYear();
    const hh = `${date.getHours()}`.padStart(2, '0');
    const min = `${date.getMinutes()}`.padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  }

  private formatValue(value: number): string {
    return `${Math.max(0, Math.round(value))}`;
  }

  private setupCamera(): void {
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setDeadzone(80, 50);
  }

  private drawDecor(): void {
    const graphics = this.add.graphics();

    graphics.fillStyle(0x1a6a3f, 1);
    graphics.fillRect(0, 0, 1600, 900);

    graphics.fillStyle(0x5c9a58, 1);
    for (let x = 0; x < 1600; x += 64) {
      for (let y = 0; y < 900; y += 64) {
        const offset = (x + y) % 2 === 0 ? 6 : 0;
        graphics.fillRect(x + offset, y + offset, 56, 56);
      }
    }

    graphics.lineStyle(1, 0x88a97d, 0.3);
    for (let x = 0; x <= 1600; x += 64) {
      graphics.lineBetween(x, 0, x, 900);
    }
    for (let y = 0; y <= 900; y += 64) {
      graphics.lineBetween(0, y, 1600, y);
    }

    graphics.fillStyle(0x8a6d3b, 1);
    graphics.fillRoundedRect(180, 140, 140, 90, 12);
    graphics.fillStyle(0xb98b4d, 1);
    graphics.fillRoundedRect(178, 138, 144, 10, 4);
    graphics.fillStyle(0xd9c28b, 1);
    graphics.fillRect(232, 174, 32, 56);

    graphics.fillStyle(0x4a6fa5, 1);
    graphics.fillRoundedRect(820, 420, 170, 110, 14);
    graphics.fillStyle(0x9dc0eb, 1);
    graphics.fillRect(900, 454, 28, 44);

    graphics.fillStyle(0x754d2b, 1);
    graphics.fillRoundedRect(1120, 120, 160, 130, 14);
    graphics.fillStyle(0x493022, 1);
    graphics.fillRect(1182, 170, 36, 80);

    graphics.destroy();
  }

  private createObstacle(x: number, y: number, width: number, height: number): Phaser.GameObjects.Rectangle {
    const obstacle = this.add.rectangle(x, y, width, height, 0x354b2f, 0.35);
    this.physics.add.existing(obstacle, true);
    return obstacle;
  }
}
