type HudSelectOption = {
  key: string;
  label: string;
};

export type CreateHudTemplateParams = {
  heroAppearanceOptions: readonly HudSelectOption[];
  debugQaEnabled: boolean;
  debugQaStatePresetOptions: readonly HudSelectOption[];
  debugQaQuestStatusOptions: readonly HudSelectOption[];
  debugQaPresetOptions: readonly HudSelectOption[];
  debugQaReplayAutoPlaySpeedOptions: readonly HudSelectOption[];
  debugQaRecapOutcomeFilterOptions: readonly HudSelectOption[];
  stripCalibrationEnabled: boolean;
  stripCalibrationPresets: readonly HudSelectOption[];
};

export function createHudTemplate(params: CreateHudTemplateParams): string {
  return `
      <div class="hud-panel hud-panel-farm-mvp" data-hud="panel">
        <div class="hud-title">Carnet du hameau</div>
        <div class="hud-farm-overview">
          <div class="hud-farm-overview-grid">
            <div class="hud-farm-overview-stat"><span>Jour</span><strong data-hud="farmDay">Jour 1</strong></div>
            <div class="hud-farm-overview-stat"><span>Cycle</span><strong data-hud="farmDayPhase">Jour</strong></div>
            <div class="hud-farm-overview-stat"><span>Zone</span><strong data-hud="farmZone">Ferme</strong></div>
            <div class="hud-farm-overview-stat"><span>Graine</span><strong data-hud="farmSeedLabel">Aucune</strong></div>
            <div class="hud-farm-overview-stat"><span>Parcelles</span><strong data-hud="farmReadyLabel">0 pretes</strong></div>
            <div class="hud-farm-overview-stat"><span>Etat</span><strong data-hud="farmSummary">Chargement...</strong></div>
          </div>
          <p class="hud-farm-story-summary" data-hud="farmStorySummary">Scenario ferme: chargement...</p>
          <p class="hud-farm-story-narrative" data-hud="farmStoryNarrative">
            La ferme reprend vie: choisis une parcelle, plante, arrose, recolte.
          </p>
          <div class="hud-farm-controls">
            <label class="hud-farm-field">
              <span>Graine selectionnee</span>
              <select data-hud="farmSeedSelect"></select>
            </label>
            <div class="hud-farm-actions">
              <button class="hud-farm-action sleep" data-farm-action="sleep">Dormir (+1 jour)</button>
              <button class="hud-farm-action" data-farm-action="toggle-craft">Ouvrir craft</button>
              <button class="hud-farm-action" data-farm-action="go-village">Sortie village</button>
            </div>
          </div>
          <div class="hud-farm-context">
            <div class="hud-farm-context-header">
              <span>Parcelle ciblee</span>
              <strong data-hud="farmContextTitle">Selectionne une parcelle</strong>
            </div>
            <p class="hud-farm-context-status" data-hud="farmContextStatus">
              Clique une parcelle dans la scene ou dans la grille ci-dessous.
            </p>
            <div class="farm-plot-actions context">
              <button class="hud-farm-action" data-hud="farmContextPlant" data-farm-action="plant">Planter</button>
              <button class="hud-farm-action water" data-hud="farmContextWater" data-farm-action="water">Arroser</button>
              <button class="hud-farm-action harvest" data-hud="farmContextHarvest" data-farm-action="harvest">Recolter</button>
            </div>
            <p class="hud-farm-context-feedback" data-hud="farmContextFeedback" role="status" aria-live="polite">
              Raccourcis: 1 planter, 2 arroser, 3 recolter, F dormir, C craft.
            </p>
          </div>
          <div class="hud-farm-error" data-hud="farmError" hidden></div>
          <ul class="hud-farm-plots" data-hud="farmPlots"></ul>
        </div>
        <div class="hud-village-overview">
          <div class="hud-village-objective">
            <span>Objectif courant</span>
            <strong data-hud="villageObjective">Retrouver les visages clefs du village.</strong>
          </div>
          <div class="hud-village-context">
            <div class="hud-village-context-header">
              <span>Cible active</span>
              <strong data-hud="villageContextTitle">Place du village</strong>
            </div>
            <p class="hud-village-context-role" data-hud="villageContextRole">
              Hub social, economique et narratif.
            </p>
            <p class="hud-village-context-hint" data-hud="villageContextHint">
              Oriente-toi vers le Maire, la Marchande, la Forge, puis les sorties.
            </p>
            <div class="hud-village-context-actions">
              <button class="hud-village-action" data-village-action="interact">Interagir (E)</button>
              <button class="hud-village-action secondary" data-village-action="cycle">Cible suivante (R)</button>
            </div>
            <p class="hud-village-context-feedback" data-hud="villageContextFeedback" role="status" aria-live="polite">
              Clique une zone du village ou approche-toi d'un lieu clef.
            </p>
          </div>
          <div class="hud-village-shop-panel" data-hud="villageShopPanel" hidden>
            <div class="hud-village-shop-header">
              <div class="hud-village-shop-identity">
                <span data-hud="villageShopNpc">Marchande</span>
                <strong data-hud="villageShopTitle">Marche du village</strong>
              </div>
              <button class="hud-village-shop-close" data-village-shop-action="close">Fermer</button>
            </div>
            <p class="hud-village-shop-summary" data-hud="villageShopSummary">
              Ouvre le Marche ou la Forge depuis la scene pour lancer des transactions.
            </p>
            <div class="hud-village-shop-tabs" data-hud="villageShopTabs"></div>
            <ul class="hud-village-shop-list" data-hud="villageShopEntries"></ul>
            <div class="hud-village-shop-detail">
              <strong data-hud="villageShopDetailName">Selectionne un objet</strong>
              <p class="hud-village-shop-detail-meta" data-hud="villageShopDetailMeta">-</p>
              <p class="hud-village-shop-detail-description" data-hud="villageShopDetailDescription">
                Le detail apparait ici.
              </p>
              <p class="hud-village-shop-detail-comparison" data-hud="villageShopDetailComparison">-</p>
            </div>
            <div class="hud-village-shop-error" data-hud="villageShopError" hidden></div>
            <div class="hud-village-shop-transaction">
              <p class="hud-village-shop-transaction-line" data-hud="villageShopTransaction">Or: 0 po</p>
              <div class="hud-village-shop-actions">
                <button class="hud-village-shop-action primary" data-village-shop-action="confirm">Valider</button>
                <button class="hud-village-shop-action secondary" data-village-shop-action="talk">Parler</button>
              </div>
            </div>
          </div>
        </div>
        <div class="hud-grid">
          <div class="hud-stat"><span>Jour</span><strong data-hud="day"></strong></div>
          <div class="hud-stat"><span>Cycle</span><strong data-hud="dayPhase"></strong></div>
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
        <div class="hud-hero-profile">
          <div class="hud-hero-profile-header">
            <span>Hero</span>
            <strong data-hud="heroProfileSummary">Non cree</strong>
          </div>
          <label class="hud-hero-profile-field">
            <span>Nom du heros</span>
            <input data-hud="heroProfileName" type="text" maxlength="24" placeholder="Arion" autocomplete="off" />
          </label>
          <label class="hud-hero-profile-field">
            <span>Apparence</span>
            <select data-hud="heroProfileAppearance">
              ${params.heroAppearanceOptions.map((option) => `<option value="${option.key}">${option.label}</option>`).join('')}
            </select>
          </label>
          <div class="hud-hero-profile-actions">
            <button class="hud-hero-profile-button" data-profile-action="save">Creer profil</button>
          </div>
          <div class="hud-hero-profile-message" data-hud="heroProfileMessage" hidden></div>
          <div class="hud-hero-profile-error" data-hud="heroProfileError" hidden></div>
        </div>
        <div class="hud-intro">
          <div class="hud-intro-header">
            <span>Intro scenario</span>
            <strong data-hud="introSummary">Connexion requise</strong>
          </div>
          <p class="hud-intro-narrative" data-hud="introNarrative">Connecte toi pour lancer la sequence d'intro.</p>
          <p class="hud-intro-hint" data-hud="introHint">MVP: arrivee au village, rencontre du maire, attribution de la ferme.</p>
          <div class="hud-intro-actions">
            <button class="hud-intro-button" data-intro-action="advance">Continuer intro</button>
          </div>
          <p class="hud-intro-progress" data-hud="introProgress">Progression: 0/3</p>
          <div class="hud-intro-error" data-hud="introError" hidden></div>
        </div>
        <div class="hud-combat">
          <div class="hud-combat-header">
            <div>
              <div class="hud-combat-kicker">Combat tour par tour</div>
              <div class="hud-combat-name" data-hud="combatName">Aucun combat actif</div>
            </div>
            <div class="hud-combat-status" data-hud="combatStatus" role="status" aria-live="polite" aria-atomic="true"></div>
          </div>
          <div class="hud-combat-meta">
            <div class="hud-combat-stat"><span>Encounter</span><strong data-hud="combatEncounterId">-</strong></div>
            <div class="hud-combat-stat"><span>Etage</span><strong data-hud="combatFloor">-</strong></div>
            <div class="hud-combat-stat"><span>Type</span><strong data-hud="combatType">-</strong></div>
            <div class="hud-combat-stat"><span>Tour</span><strong data-hud="combatTurn">-</strong></div>
            <div class="hud-combat-stat"><span>Round</span><strong data-hud="combatRound">-</strong></div>
            <div class="hud-combat-stat"><span>Resultat</span><strong data-hud="combatResult" aria-live="polite" aria-atomic="true">Aucun combat actif.</strong></div>
          </div>
          <div class="hud-combat-recap" data-hud="combatRecap" role="status" aria-live="polite" aria-atomic="true">Recap: -</div>
          <div class="hud-combat-grid">
            <div class="combat-card">
              <span>Player</span>
              <div class="combat-card-line"><span>HP</span><strong data-hud="combatPlayerHp">-</strong></div>
              <div class="combat-card-line"><span>MP</span><strong data-hud="combatPlayerMp">-</strong></div>
              <div class="combat-card-line"><span>Effects</span><strong data-hud="combatPlayerEffects">-</strong></div>
            </div>
            <div class="combat-card enemy">
              <span>Enemy</span>
              <div class="combat-enemy-visual">
                <div class="combat-enemy-strip" data-hud="combatEnemyStrip" hidden></div>
                <img data-hud="combatEnemySprite" alt="Enemy sprite" hidden />
                <span data-hud="combatEnemySpriteFallback">No enemy</span>
              </div>
              <div class="combat-card-line"><span>Name</span><strong data-hud="combatEnemyName">-</strong></div>
              <div class="combat-card-line"><span>Role</span><strong data-hud="combatEnemyRole">-</strong></div>
              <div class="combat-card-line"><span>HP</span><strong data-hud="combatEnemyHp">-</strong></div>
              <div class="combat-card-line"><span>MP</span><strong data-hud="combatEnemyMp">-</strong></div>
              <div class="combat-card-line"><span>Effects</span><strong data-hud="combatEnemyEffects">-</strong></div>
              <div class="combat-card-line"><span>Telemetry</span><strong data-hud="combatTelemetry">-</strong></div>
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
            <div class="hud-combat-actions-row root" data-hud="combatActionRoot">
              <button class="hud-combat-button primary" data-combat-action="start">Demarrer combat</button>
              <button class="hud-combat-button" data-combat-action="attack">Attack</button>
              <button class="hud-combat-button secondary" data-combat-action="defend">Defend</button>
              <button class="hud-combat-button secondary" data-combat-ui-action="open-skills">Competences</button>
              <button class="hud-combat-button secondary" data-combat-ui-action="open-items">Objets</button>
              <button class="hud-combat-button danger" data-combat-action="forfeit">Fuir</button>
            </div>
            <div class="hud-combat-actions-row skills" data-hud="combatActionSkills" hidden>
              <button class="hud-combat-button" data-combat-action="fireball">Fireball</button>
              <button class="hud-combat-button secondary" data-combat-action="mend">Mend (+HP)</button>
              <button class="hud-combat-button secondary" data-combat-action="cleanse">Cleanse</button>
              <button class="hud-combat-button" data-combat-action="interrupt">Interrupt</button>
              <button class="hud-combat-button secondary" data-combat-action="rally">Rally (+Atk)</button>
              <button class="hud-combat-button" data-combat-action="sunder">Sunder (-Def)</button>
              <button class="hud-combat-button secondary" data-combat-ui-action="back-root">Retour actions</button>
            </div>
            <div class="hud-combat-actions-row items" data-hud="combatActionItems" hidden>
              <button class="hud-combat-button secondary" disabled>Aucun objet combat equipe</button>
              <button class="hud-combat-button secondary" data-combat-ui-action="back-root">Retour actions</button>
            </div>
            <p class="hud-combat-action-hint" data-hud="combatActionHint" role="status" aria-live="polite">
              Demarre un combat, puis choisis une action.
            </p>
          </div>
          <div class="hud-combat-error" data-hud="combatError" role="alert" aria-live="assertive" hidden></div>
          <ul class="hud-combat-log" data-hud="combatLogs" role="log" aria-live="polite" aria-relevant="additions text"></ul>
        </div>
        <div class="hud-quests">
          <div class="hud-quests-header">
            <span>Quests</span>
            <strong data-hud="questsSummary">No quests loaded.</strong>
          </div>
          <div class="hud-quests-error" data-hud="questsError" hidden></div>
          <ul class="hud-quests-list" data-hud="questsList"></ul>
        </div>
        <div class="hud-village-npcs">
          <div class="hud-village-npcs-header">
            <span>Village PNJ</span>
            <strong data-hud="villageNpcSummary">3 etats suivis</strong>
          </div>
          <div class="hud-village-npc-error" data-hud="villageNpcError" hidden></div>
          <div class="hud-village-npc-grid">
            <div class="hud-village-npc-line">
              <div class="hud-village-npc-copy">
                <span>Maire</span>
                <p class="hud-village-npc-dialogue" data-hud="villageNpcMayorDialogue">-</p>
              </div>
              <div class="hud-village-npc-actions">
                <strong data-hud="villageNpcMayor">-</strong>
                <button class="hud-village-npc-button" data-village-npc-action="talk" data-npc-key="mayor">
                  Parler
                </button>
              </div>
            </div>
            <div class="hud-village-npc-line">
              <div class="hud-village-npc-copy">
                <span>Forgeron</span>
                <p class="hud-village-npc-dialogue" data-hud="villageNpcBlacksmithDialogue">-</p>
              </div>
              <div class="hud-village-npc-actions">
                <strong data-hud="villageNpcBlacksmith">-</strong>
                <button class="hud-village-npc-button" data-village-npc-action="talk" data-npc-key="blacksmith">
                  Parler
                </button>
              </div>
            </div>
            <div class="hud-village-npc-line">
              <div class="hud-village-npc-copy">
                <span>Marchand</span>
                <p class="hud-village-npc-dialogue" data-hud="villageNpcMerchantDialogue">-</p>
              </div>
              <div class="hud-village-npc-actions">
                <strong data-hud="villageNpcMerchant">-</strong>
                <button class="hud-village-npc-button" data-village-npc-action="talk" data-npc-key="merchant">
                  Parler
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="hud-blacksmith">
          <div class="hud-blacksmith-header">
            <span>Blacksmith Shop</span>
            <strong data-hud="blacksmithSummary">Locked</strong>
          </div>
          <div class="hud-blacksmith-error" data-hud="blacksmithError" hidden></div>
          <ul class="hud-blacksmith-list" data-hud="blacksmithOffers"></ul>
        </div>
        <div class="hud-village-market">
          <div class="hud-village-market-header">
            <span>Village Market</span>
            <strong data-hud="villageMarketSummary">Locked</strong>
          </div>
          <div class="hud-village-market-error" data-hud="villageMarketError" hidden></div>
          <p class="hud-village-market-subtitle">Seeds</p>
          <ul class="hud-village-market-list" data-hud="villageMarketSeedOffers"></ul>
          <p class="hud-village-market-subtitle">Crop Buyback</p>
          <ul class="hud-village-market-list" data-hud="villageMarketBuybackOffers"></ul>
        </div>
        <div class="hud-farm">
          <div class="hud-farm-header">
            <span>Farm Plots</span>
            <strong data-hud="farmSummary">Locked</strong>
          </div>
          <p class="hud-farm-story-summary" data-hud="farmStorySummary">Scenario ferme: verrouille</p>
          <p class="hud-farm-story-narrative" data-hud="farmStoryNarrative">
            Termine l intro pour declencher les premiers beats scenario de ferme.
          </p>
          <div class="hud-farm-controls">
            <label class="hud-farm-field">
              <span>Selected seed</span>
              <select data-hud="farmSeedSelect"></select>
            </label>
            <div class="hud-farm-actions">
              <button class="hud-farm-action sleep" data-farm-action="sleep">Sleep (+1 day)</button>
            </div>
          </div>
          <div class="hud-farm-error" data-hud="farmError" hidden></div>
          <ul class="hud-farm-plots" data-hud="farmPlots"></ul>
        </div>
        <div class="hud-farm-crafting">
          <div class="hud-farm-crafting-header">
            <span>Farm Crafting</span>
            <strong data-hud="farmCraftingSummary">Locked</strong>
          </div>
          <div class="hud-farm-crafting-error" data-hud="farmCraftingError" hidden></div>
          <ul class="hud-farm-crafting-list" data-hud="farmCraftingRecipes"></ul>
        </div>
        <div class="hud-loop">
          <div class="hud-loop-header">
            <span>Combat Loop</span>
            <strong data-hud="loopSummary">Loading...</strong>
          </div>
          <div class="hud-loop-grid">
            <div class="hud-loop-line">
              <span>Stage</span>
              <strong data-hud="loopStage">-</strong>
            </div>
            <div class="hud-loop-line">
              <span>Supplies</span>
              <strong data-hud="loopSupplies">-</strong>
            </div>
            <div class="hud-loop-line">
              <span>Prep</span>
              <strong data-hud="loopPreparation">-</strong>
            </div>
            <div class="hud-loop-line">
              <span>Blocker</span>
              <strong data-hud="loopBlockers">-</strong>
            </div>
          </div>
          <div class="hud-loop-actions">
            <button class="hud-loop-button" data-loop-action="prepare">Prepare combat</button>
          </div>
          <div class="hud-loop-error" data-hud="loopError" hidden></div>
        </div>
        <div class="hud-tower-story">
          <div class="hud-tower-story-header">
            <span>Tower Story</span>
            <strong data-hud="towerStorySummary">Loading...</strong>
          </div>
          <p class="hud-tower-story-narrative" data-hud="towerStoryNarrative">
            Synchronisation des beats narratifs tour...
          </p>
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
          params.debugQaEnabled
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
                ${params.debugQaStatePresetOptions.map((preset) => `<option value="${preset.key}">${preset.label}</option>`).join('')}
              </select>
            </label>
            <label class="hud-debug-qa-field debug-qa-field-wide">
              <span>Quest key</span>
              <input data-hud="debugQaQuestKey" type="text" placeholder="story_floor_8" value="story_floor_8" />
            </label>
            <label class="hud-debug-qa-field">
              <span>Quest status</span>
              <select data-hud="debugQaQuestStatus">
                ${params.debugQaQuestStatusOptions.map((option) => `<option value="${option.key}">${option.label}</option>`).join('')}
              </select>
            </label>
            <label class="hud-debug-qa-field debug-qa-field-wide">
              <span>Loadout preset</span>
              <select data-hud="debugQaLoadout">
                ${params.debugQaPresetOptions.map((preset) => `<option value="${preset.key}">${preset.label}</option>`).join('')}
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
            <label class="hud-debug-qa-field">
              <span>Step replay speed</span>
              <select data-hud="debugQaReplayAutoPlaySpeed">
                ${params.debugQaReplayAutoPlaySpeedOptions.map((option) => `<option value="${option.key}">${option.label}</option>`).join('')}
              </select>
            </label>
            <label class="hud-debug-qa-field">
              <span>Recap outcome filter</span>
              <select data-hud="debugQaRecapOutcomeFilter">
                ${params.debugQaRecapOutcomeFilterOptions.map((option) => `<option value="${option.key}">${option.label}</option>`).join('')}
              </select>
            </label>
            <label class="hud-debug-qa-field debug-qa-field-wide">
              <span>Recap enemy filter</span>
              <input data-hud="debugQaRecapEnemyFilter" type="text" placeholder="enemy key or enemy name" />
            </label>
            ${
              params.stripCalibrationEnabled
                ? `
            <label class="hud-debug-qa-field">
              <span>Strip calibration</span>
              <select data-hud="debugQaStripCalibrationPreset">
                ${params.stripCalibrationPresets.map((preset) => `<option value="${preset.key}">${preset.label}</option>`).join('')}
              </select>
            </label>
            `
                : ''
            }
          </div>
          <div class="hud-debug-qa-reference">
            <div class="hud-debug-qa-reference-header">
              <span>Combat scripted intents</span>
              <button class="hud-debug-qa-button secondary" data-debug-action="load-scripted-intents">Load reference</button>
            </div>
            <div class="hud-debug-qa-reference-filters">
              <label class="hud-debug-qa-field">
                <span>Script enemy filter</span>
                <input data-hud="debugQaScriptEnemyFilter" type="text" placeholder="enemy key or enemy name" />
              </label>
              <label class="hud-debug-qa-field">
                <span>Script intent filter</span>
                <input data-hud="debugQaScriptIntentFilter" type="text" placeholder="intent key, label or trigger" />
              </label>
            </div>
            <pre class="hud-debug-qa-reference-output" data-hud="debugQaScriptedIntents">Click "Load reference" to inspect the combat script QA payload.</pre>
          </div>
          <div class="hud-debug-qa-actions">
            <button class="hud-debug-qa-button" data-debug-action="grant-resources">Grant resources</button>
            <button class="hud-debug-qa-button secondary" data-debug-action="set-tower-floor">Set tower floor</button>
            <button class="hud-debug-qa-button secondary" data-debug-action="apply-state-preset">Apply state preset</button>
            <button class="hud-debug-qa-button" data-debug-action="apply-loadout-preset">Apply loadout</button>
            <button class="hud-debug-qa-button secondary" data-debug-action="complete-quests">Complete quests</button>
            <button class="hud-debug-qa-button secondary" data-debug-action="set-world-flags">Set world flags</button>
            <button class="hud-debug-qa-button secondary" data-debug-action="set-quest-status">Set quest status</button>
            <button class="hud-debug-qa-button secondary" data-debug-action="import-trace">Import JSON trace</button>
            <button class="hud-debug-qa-button secondary" data-debug-action="replay-trace">Replay imported trace</button>
            <button class="hud-debug-qa-button secondary" data-debug-action="replay-trace-step-start">Start step replay</button>
            <button class="hud-debug-qa-button secondary" data-debug-action="replay-trace-step-next">Next step</button>
            <button class="hud-debug-qa-button secondary" data-debug-action="replay-trace-step-autoplay">Start auto-play</button>
            <button class="hud-debug-qa-button secondary" data-debug-action="replay-trace-step-stop">Stop step replay</button>
            ${
              params.stripCalibrationEnabled
                ? `
            <button class="hud-debug-qa-button secondary" data-debug-action="apply-strip-calibration">Apply strip calibration</button>
              `
                : ''
            }
            <button class="hud-debug-qa-button export" data-debug-action="export-trace" title="Export a local JSON trace of the current QA state">
              Export JSON trace
            </button>
            <button class="hud-debug-qa-button export markdown" data-debug-action="export-markdown" title="Export markdown recap + scripted intents using active filters">
              Export Markdown recap
            </button>
            <input data-hud="debugQaImportFile" type="file" accept=".json,application/json" hidden />
          </div>
        </div>
            `
            : ''
        }
        <div class="hud-help">
          Deplacement: fleches ou ZQSD
          <br />
          Manette: D-pad/LB/RB navigue HUD, A valide, X Attack, Y Defend, B Fireball.
          <br />
          Raccourcis hub: E interagir, R changer de cible (mode village).
        </div>
      </div>
        `;
}

