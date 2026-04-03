import type { QuestState, QuestStatus } from '../../gameScene.stateTypes';

export type QuestJournalCategoryKey = 'main' | 'tower' | 'village' | 'relations' | 'completed';
export type QuestJournalChangeKind = 'new' | 'updated';

type QuestJournalCategoryDefinition = {
  key: QuestJournalCategoryKey;
  label: string;
};

type QuestJournalMetaSeed = {
  category: Exclude<QuestJournalCategoryKey, 'completed'>;
  typeLabel: string;
  originLabel: string;
  zoneLabel: string;
  rewardLabels: string[];
  priority: number;
};

type QuestJournalMeta = QuestJournalMetaSeed;

type QuestRowInternal = {
  quest: QuestState;
  categoryForList: QuestJournalCategoryKey;
  meta: QuestJournalMeta;
  objectiveLabel: string;
  badgeLabel: string | null;
};

export type QuestJournalCategoryViewModel = {
  key: QuestJournalCategoryKey;
  label: string;
  count: number;
  active: boolean;
};

export type QuestJournalListEntryViewModel = {
  key: string;
  title: string;
  status: QuestStatus;
  statusLabel: string;
  badgeLabel: string | null;
  originLabel: string;
  objectiveLabel: string;
  tracked: boolean;
  selected: boolean;
};

export type QuestJournalDetailViewModel = {
  title: string;
  typeLabel: string;
  originLabel: string;
  statusLabel: string;
  badgeLabel: string | null;
  description: string;
  objectiveLabel: string;
  zoneLabel: string;
  rewardLabels: string[];
  claimQuestKey: string | null;
  trackQuestKey: string | null;
  trackActionLabel: string;
};

export type QuestJournalViewModel = {
  panelOpen: boolean;
  toggleLabel: string;
  summaryLabel: string;
  trackedLabel: string;
  categories: QuestJournalCategoryViewModel[];
  entries: QuestJournalListEntryViewModel[];
  emptyListLabel: string;
  detail: QuestJournalDetailViewModel;
  activeCategory: QuestJournalCategoryKey;
  selectedQuestKey: string | null;
  trackedQuestKey: string | null;
  renderSignature: string;
};

const QUEST_JOURNAL_CATEGORIES: readonly QuestJournalCategoryDefinition[] = [
  { key: 'main', label: 'Principale' },
  { key: 'tower', label: 'Tour / progression' },
  { key: 'village', label: 'Village / ferme' },
  { key: 'relations', label: 'Relations / secondaires' },
  { key: 'completed', label: 'Terminees' },
];

const QUEST_META_BY_KEY: Readonly<Record<string, QuestJournalMetaSeed>> = {
  main_arrival_call: {
    category: 'main',
    typeLabel: 'Quete principale',
    originLabel: 'Maire',
    zoneLabel: 'Place du village',
    rewardLabels: ['Progression narrative', 'Ouverture de la boucle village'],
    priority: 0,
  },
  main_farm_assignment: {
    category: 'main',
    typeLabel: 'Quete principale',
    originLabel: 'Maire',
    zoneLabel: 'Ferme',
    rewardLabels: ['Ferme debloquee', 'Ressources initiales'],
    priority: 1,
  },
  story_floor_3: {
    category: 'tower',
    typeLabel: 'Palier de tour',
    originLabel: 'Tour maudite',
    zoneLabel: 'Tour etage 3',
    rewardLabels: ['XP', 'Or', 'Progression monde'],
    priority: 0,
  },
  story_floor_5: {
    category: 'tower',
    typeLabel: 'Palier de tour',
    originLabel: 'Tour maudite',
    zoneLabel: 'Tour etage 5',
    rewardLabels: ['XP', 'Or', 'Deblocage shop'],
    priority: 1,
  },
  story_floor_8: {
    category: 'tower',
    typeLabel: 'Palier de tour',
    originLabel: 'Tour maudite',
    zoneLabel: 'Tour etage 8',
    rewardLabels: ['XP', 'Or', 'Variation PNJ'],
    priority: 2,
  },
  story_floor_10: {
    category: 'tower',
    typeLabel: 'Palier de tour',
    originLabel: 'Tour maudite',
    zoneLabel: 'Tour etage 10',
    rewardLabels: ['Conclusion MVP', 'Retour monde majeur'],
    priority: 3,
  },
  farm_first_harvest: {
    category: 'village',
    typeLabel: 'Quete ferme',
    originLabel: 'Ferme',
    zoneLabel: 'Parcelles de culture',
    rewardLabels: ['Validation agricole', 'Progression village'],
    priority: 0,
  },
  turnip_delivery_request: {
    category: 'village',
    typeLabel: 'Quete village / ferme',
    originLabel: 'Marchande',
    zoneLabel: 'Marche du village',
    rewardLabels: ['Or', 'Relation marchande'],
    priority: 1,
  },
  granary_restock: {
    category: 'village',
    typeLabel: 'Quete village / ferme',
    originLabel: 'Village',
    zoneLabel: 'Grenier communal',
    rewardLabels: ['XP', 'Progression du village'],
    priority: 2,
  },
  village_mayor_briefing: {
    category: 'relations',
    typeLabel: 'Quete relationnelle',
    originLabel: 'Maire',
    zoneLabel: 'Bureau du Maire',
    rewardLabels: ['Nouveau dialogue', 'Orientation scenario'],
    priority: 0,
  },
  blacksmith_forge_update: {
    category: 'relations',
    typeLabel: 'Quete relationnelle',
    originLabel: 'Forgeron',
    zoneLabel: 'Forge',
    rewardLabels: ['Shop forge ameliore', 'Relation forgeron'],
    priority: 1,
  },
  merchant_route_sync: {
    category: 'relations',
    typeLabel: 'Quete relationnelle',
    originLabel: 'Marchande',
    zoneLabel: 'Marche',
    rewardLabels: ['Nouveau dialogue', 'Bonus economique local'],
    priority: 2,
  },
};

const STATUS_ORDER: Readonly<Record<QuestStatus, number>> = {
  completed: 0,
  active: 1,
  claimed: 2,
};

function capitalizeWords(raw: string): string {
  return raw
    .split('_')
    .filter((part) => part.length > 0)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function resolveFallbackMeta(key: string): QuestJournalMeta {
  const normalized = key.trim().toLowerCase();
  if (normalized.startsWith('main_')) {
    return {
      category: 'main',
      typeLabel: 'Quete principale',
      originLabel: 'Village',
      zoneLabel: 'Village',
      rewardLabels: ['Progression principale'],
      priority: 99,
    };
  }

  if (normalized.startsWith('story_floor_') || normalized.includes('tower')) {
    return {
      category: 'tower',
      typeLabel: 'Palier de tour',
      originLabel: 'Tour maudite',
      zoneLabel: 'Tour',
      rewardLabels: ['Progression tour'],
      priority: 99,
    };
  }

  if (
    normalized.startsWith('farm_') ||
    normalized.includes('turnip') ||
    normalized.includes('granary') ||
    normalized.includes('harvest')
  ) {
    return {
      category: 'village',
      typeLabel: 'Quete village / ferme',
      originLabel: 'Ferme',
      zoneLabel: 'Ferme et village',
      rewardLabels: ['Ressources', 'Progression locale'],
      priority: 99,
    };
  }

  return {
    category: 'relations',
    typeLabel: 'Quete secondaire',
    originLabel: 'PNJ du village',
    zoneLabel: 'Village',
    rewardLabels: ['Relation', 'Deblocage local'],
    priority: 99,
  };
}

function resolveQuestMeta(key: string): QuestJournalMeta {
  return QUEST_META_BY_KEY[key] ?? resolveFallbackMeta(key);
}

function resolveQuestObjectiveLabel(quest: QuestState): string {
  if (quest.objectives.length === 0) {
    return 'Aucun objectif detaille.';
  }

  const currentObjective = quest.objectives.find((objective) => !objective.completed) ?? quest.objectives[0];
  if (!currentObjective) {
    return 'Aucun objectif detaille.';
  }

  if (currentObjective.target <= 1) {
    return currentObjective.description;
  }

  return `${currentObjective.description} (${currentObjective.current}/${currentObjective.target})`;
}

function resolveBadgeLabel(
  quest: QuestState,
  changeByKey: ReadonlyMap<string, QuestJournalChangeKind>,
): string | null {
  const change = changeByKey.get(quest.key);
  if (change === 'new') {
    return 'Nouveau';
  }

  if (change === 'updated') {
    return 'Mis a jour';
  }

  if (quest.canClaim || quest.status === 'completed') {
    return 'A rendre';
  }

  if (quest.status === 'claimed') {
    return 'Terminee';
  }

  return null;
}

function resolveCategoryForList(quest: QuestState, meta: QuestJournalMeta): QuestJournalCategoryKey {
  if (quest.status === 'claimed') {
    return 'completed';
  }

  return meta.category;
}

function buildQuestRows(
  quests: QuestState[],
  changeByKey: ReadonlyMap<string, QuestJournalChangeKind>,
): QuestRowInternal[] {
  return quests.map((quest) => {
    const meta = resolveQuestMeta(quest.key);
    return {
      quest,
      meta,
      categoryForList: resolveCategoryForList(quest, meta),
      objectiveLabel: resolveQuestObjectiveLabel(quest),
      badgeLabel: resolveBadgeLabel(quest, changeByKey),
    };
  });
}

function sortQuestRows(left: QuestRowInternal, right: QuestRowInternal): number {
  const leftStatus = STATUS_ORDER[left.quest.status];
  const rightStatus = STATUS_ORDER[right.quest.status];
  if (leftStatus !== rightStatus) {
    return leftStatus - rightStatus;
  }

  if (left.meta.priority !== right.meta.priority) {
    return left.meta.priority - right.meta.priority;
  }

  return left.quest.title.localeCompare(right.quest.title);
}

function buildQuestContentSignature(quest: QuestState): string {
  const objectiveSignature = quest.objectives.map((objective) => (
    `${objective.key}:${objective.current}/${objective.target}:${objective.completed ? '1' : '0'}`
  ));
  return [
    quest.status,
    quest.canClaim ? '1' : '0',
    objectiveSignature.join(','),
  ].join('|');
}

export function isQuestJournalCategoryKey(value: string): value is QuestJournalCategoryKey {
  return QUEST_JOURNAL_CATEGORIES.some((entry) => entry.key === value);
}

export function getQuestStatusLabel(status: QuestStatus): string {
  if (status === 'active') {
    return 'Active';
  }

  if (status === 'completed') {
    return 'A rendre';
  }

  return 'Terminee';
}

export function getQuestSummaryLabel(params: {
  isAuthenticated: boolean;
  questBusy: boolean;
  quests: QuestState[];
}): string {
  if (!params.isAuthenticated) {
    return 'Connexion requise';
  }

  if (params.questBusy && params.quests.length === 0) {
    return 'Chargement...';
  }

  const active = params.quests.filter((quest) => quest.status === 'active').length;
  const ready = params.quests.filter((quest) => quest.status === 'completed' || quest.canClaim).length;
  const done = params.quests.filter((quest) => quest.status === 'claimed').length;
  return `Actives ${active} | A rendre ${ready} | Terminees ${done}`;
}

export function computeQuestContentSignatures(quests: QuestState[]): Map<string, string> {
  const signatures = new Map<string, string>();
  for (const quest of quests) {
    signatures.set(quest.key, buildQuestContentSignature(quest));
  }
  return signatures;
}

export function computeQuestChangeMap(input: {
  previousSignatures: ReadonlyMap<string, string>;
  quests: QuestState[];
}): {
  nextSignatures: Map<string, string>;
  changeByKey: Map<string, QuestJournalChangeKind>;
} {
  const nextSignatures = computeQuestContentSignatures(input.quests);
  const changeByKey = new Map<string, QuestJournalChangeKind>();

  for (const [questKey, signature] of nextSignatures) {
    const previous = input.previousSignatures.get(questKey);
    if (!previous) {
      changeByKey.set(questKey, 'new');
      continue;
    }

    if (previous !== signature) {
      changeByKey.set(questKey, 'updated');
    }
  }

  return {
    nextSignatures,
    changeByKey,
  };
}

function buildEmptyDetail(): QuestJournalDetailViewModel {
  return {
    title: 'Selectionne une quete',
    typeLabel: '-',
    originLabel: '-',
    statusLabel: '-',
    badgeLabel: null,
    description: 'Le detail apparait ici avec objectif, recompenses et zone.',
    objectiveLabel: 'Objectif courant: -',
    zoneLabel: '-',
    rewardLabels: ['-'],
    claimQuestKey: null,
    trackQuestKey: null,
    trackActionLabel: 'Suivre',
  };
}

export function buildQuestJournalViewModel(input: {
  isAuthenticated: boolean;
  questBusy: boolean;
  quests: QuestState[];
  panelOpen: boolean;
  activeCategory: QuestJournalCategoryKey;
  selectedQuestKey: string | null;
  trackedQuestKey: string | null;
  changeByKey: ReadonlyMap<string, QuestJournalChangeKind>;
}): QuestJournalViewModel {
  const summaryLabel = getQuestSummaryLabel({
    isAuthenticated: input.isAuthenticated,
    questBusy: input.questBusy,
    quests: input.quests,
  });

  const rows = buildQuestRows(input.quests, input.changeByKey).sort(sortQuestRows);
  const allQuestKeys = new Set(rows.map((row) => row.quest.key));
  const trackedQuestKey = input.trackedQuestKey && allQuestKeys.has(input.trackedQuestKey)
    ? input.trackedQuestKey
    : null;

  const rowsByCategory = rows.filter((row) => row.categoryForList === input.activeCategory);
  const resolvedSelectedQuestKey = input.selectedQuestKey && rowsByCategory.some((row) => row.quest.key === input.selectedQuestKey)
    ? input.selectedQuestKey
    : (rowsByCategory[0]?.quest.key ?? null);
  const selectedRow = resolvedSelectedQuestKey
    ? rowsByCategory.find((row) => row.quest.key === resolvedSelectedQuestKey) ?? null
    : null;
  const trackedRow = trackedQuestKey ? rows.find((row) => row.quest.key === trackedQuestKey) ?? null : null;

  const categories: QuestJournalCategoryViewModel[] = QUEST_JOURNAL_CATEGORIES.map((definition) => ({
    key: definition.key,
    label: definition.label,
    count: rows.filter((row) => row.categoryForList === definition.key).length,
    active: definition.key === input.activeCategory,
  }));

  const entries: QuestJournalListEntryViewModel[] = rowsByCategory.map((row) => ({
    key: row.quest.key,
    title: row.quest.title,
    status: row.quest.status,
    statusLabel: getQuestStatusLabel(row.quest.status),
    badgeLabel: row.badgeLabel,
    originLabel: row.meta.originLabel,
    objectiveLabel: row.objectiveLabel,
    tracked: trackedQuestKey === row.quest.key,
    selected: resolvedSelectedQuestKey === row.quest.key,
  }));

  let detail = buildEmptyDetail();
  if (selectedRow) {
    const isTracked = trackedQuestKey === selectedRow.quest.key;
    detail = {
      title: selectedRow.quest.title,
      typeLabel: selectedRow.meta.typeLabel,
      originLabel: selectedRow.meta.originLabel,
      statusLabel: getQuestStatusLabel(selectedRow.quest.status),
      badgeLabel: selectedRow.badgeLabel,
      description: selectedRow.quest.description,
      objectiveLabel: selectedRow.objectiveLabel,
      zoneLabel: selectedRow.meta.zoneLabel,
      rewardLabels: selectedRow.meta.rewardLabels,
      claimQuestKey: selectedRow.quest.canClaim ? selectedRow.quest.key : null,
      trackQuestKey: selectedRow.quest.key,
      trackActionLabel: isTracked ? 'Ne plus suivre' : 'Suivre cette quete',
    };
  }

  const emptyListLabel = !input.isAuthenticated
    ? 'Connecte toi pour consulter le journal.'
    : input.questBusy && rows.length === 0
      ? 'Chargement des quetes...'
      : rowsByCategory.length === 0
        ? 'Aucune quete dans cette categorie.'
        : '';

  const trackedLabel = !input.isAuthenticated
    ? 'Quete suivie: connexion requise.'
    : trackedRow
      ? `Quete suivie: ${trackedRow.quest.title}`
      : 'Quete suivie: aucune.';

  const signatureParts = [
    input.isAuthenticated ? 'auth:1' : 'auth:0',
    input.questBusy ? 'busy:1' : 'busy:0',
    input.panelOpen ? 'open:1' : 'open:0',
    input.activeCategory,
    resolvedSelectedQuestKey ?? '-',
    trackedQuestKey ?? '-',
    ...entries.map((entry) => (
      `${entry.key}:${entry.status}:${entry.badgeLabel ?? '-'}:${entry.selected ? '1' : '0'}:${entry.tracked ? '1' : '0'}`
    )),
    ...categories.map((entry) => `${entry.key}:${entry.count}`),
  ];

  return {
    panelOpen: input.panelOpen,
    toggleLabel: input.panelOpen ? 'Fermer journal (J)' : 'Journal de quetes (J)',
    summaryLabel,
    trackedLabel,
    categories,
    entries,
    emptyListLabel,
    detail,
    activeCategory: input.activeCategory,
    selectedQuestKey: resolvedSelectedQuestKey,
    trackedQuestKey,
    renderSignature: signatureParts.join('|'),
  };
}

export function clearQuestChangeByKey(questKey: string, changeByKey: Map<string, QuestJournalChangeKind>): void {
  changeByKey.delete(questKey);
}

export function getQuestFallbackTitle(questKey: string): string {
  return capitalizeWords(questKey);
}
