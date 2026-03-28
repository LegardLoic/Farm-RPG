import Phaser from 'phaser';
import { API_BASE_URL } from '../../config/env';

type HudState = {
  day: number;
  gold: number;
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
type CombatActionName = 'attack' | 'defend' | 'fireball';

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
  player: CombatUnitState;
  enemy: CombatEnemyState;
  lastAction: string | null;
  createdAt: string | undefined;
  updatedAt: string | undefined;
  endedAt: string | null | undefined;
};

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
  private combatForfeitButton: HTMLButtonElement | null = null;
  private combatLogsList: HTMLElement | null = null;
  private combatStatusBadge: HTMLElement | null = null;
  private combatErrorValue: HTMLElement | null = null;

  private authStatus = 'Verification...';
  private isAuthenticated = false;
  private hudState: HudState = {
    day: 1,
    gold: 120,
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

  private readonly onHudClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest('button') as HTMLButtonElement | null;
    if (!button || button.disabled) {
      return;
    }

    const hudAction = button.dataset.hudAction;
    const combatAction = button.dataset.combatAction;

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

    if (combatAction === 'attack' || combatAction === 'defend' || combatAction === 'fireball') {
      void this.performCombatAction(combatAction);
      return;
    }

    if (combatAction === 'forfeit') {
      void this.forfeitCombat();
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
            </div>
            <div class="combat-card enemy">
              <span>Enemy</span>
              <div class="combat-card-line"><span>Name</span><strong data-hud="combatEnemyName">-</strong></div>
              <div class="combat-card-line"><span>HP</span><strong data-hud="combatEnemyHp">-</strong></div>
              <div class="combat-card-line"><span>MP</span><strong data-hud="combatEnemyMp">-</strong></div>
            </div>
          </div>
          <div class="hud-combat-actions">
            <button class="hud-combat-button primary" data-combat-action="start">Demarrer combat</button>
            <button class="hud-combat-button" data-combat-action="attack">Attack</button>
            <button class="hud-combat-button secondary" data-combat-action="defend">Defend</button>
            <button class="hud-combat-button" data-combat-action="fireball">Fireball</button>
            <button class="hud-combat-button danger" data-combat-action="forfeit">Fuir</button>
          </div>
          <div class="hud-combat-error" data-hud="combatError" hidden></div>
          <ul class="hud-combat-log" data-hud="combatLogs"></ul>
        </div>
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
    this.combatForfeitButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-combat-action="forfeit"]');
    this.combatLogsList = this.hudRoot.querySelector<HTMLElement>('[data-hud="combatLogs"]');
    this.combatStatusBadge = this.hudRoot.querySelector<HTMLElement>('[data-hud="combatStatus"]');
    this.combatErrorValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="combatError"]');
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
    this.combatForfeitButton = null;
    this.combatLogsList = null;
    this.combatStatusBadge = null;
    this.combatErrorValue = null;
  }
  private updateHud(): void {
    if (!this.hudRoot) {
      return;
    }

    this.setHudText('day', `Jour ${this.hudState.day}`);
    this.setHudText('gold', `${this.hudState.gold} po`);
    this.setHudText('hp', `${this.formatValue(this.hudState.hp)} / ${this.formatValue(this.hudState.maxHp)}`);
    this.setHudText('mp', `${this.formatValue(this.hudState.mp)} / ${this.formatValue(this.hudState.maxMp)}`);
    this.setHudText('stamina', `${Math.max(0, Math.round(this.hudState.stamina))} / 8`);
    this.setHudText('area', this.hudState.area);
    this.setHudText('authStatus', this.authStatus);
    this.updateCombatHud();

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
    this.setHudText('combatEnemyName', this.combatState ? this.combatState.enemy.name : '-');
    this.setHudText('combatEnemyHp', this.getCombatEnemyValue('hp'));
    this.setHudText('combatEnemyMp', this.getCombatEnemyValue('mp'));

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

  private updateCombatButtons(): void {
    const active = Boolean(this.isAuthenticated && this.combatState && this.combatState.status === 'active');
    const playerTurn = Boolean(active && this.combatState?.turn === 'player');
    const fireballReady = Boolean(playerTurn && (this.combatState?.player.mp ?? 0) >= 5);

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
      await this.refreshCombatState();
      return;
    }

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

    if (action === 'fireball' && this.combatState.player.mp < 5) {
      this.setCombatError('Pas assez de MP pour Fireball.');
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

  private clearCombatError(): void {
    this.combatError = null;
  }

  private setCombatError(message: string): void {
    this.combatError = message;
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
      player,
      enemy,
      lastAction: this.asString(value.lastAction),
      createdAt: this.asString(value.createdAt) ?? undefined,
      updatedAt: this.asString(value.updatedAt) ?? undefined,
      endedAt: this.asString(value.endedAt) ?? null,
    };
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

  private asCombatTurn(value: unknown): CombatTurn | null {
    if (value === 'player' || value === 'enemy') {
      return value;
    }

    return null;
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
