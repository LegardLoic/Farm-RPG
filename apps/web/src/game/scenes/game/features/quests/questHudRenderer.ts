import type {
  QuestJournalCategoryViewModel,
  QuestJournalListEntryViewModel,
  QuestJournalViewModel,
} from './questJournalLogic';

export type QuestJournalRenderElements = {
  panelRoot: HTMLElement | null;
  toggleButton: HTMLButtonElement | null;
  summaryValue: HTMLElement | null;
  trackedValue: HTMLElement | null;
  categoriesRoot: HTMLElement | null;
  listRoot: HTMLElement | null;
  detailTitleValue: HTMLElement | null;
  detailTypeValue: HTMLElement | null;
  detailOriginValue: HTMLElement | null;
  detailStatusValue: HTMLElement | null;
  detailDescriptionValue: HTMLElement | null;
  detailObjectiveValue: HTMLElement | null;
  detailZoneValue: HTMLElement | null;
  detailRewardsRoot: HTMLElement | null;
  trackButton: HTMLButtonElement | null;
  claimButton: HTMLButtonElement | null;
};

function renderCategories(root: HTMLElement, categories: QuestJournalCategoryViewModel[]): void {
  root.replaceChildren();

  for (const category of categories) {
    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('quest-journal-category');
    if (category.active) {
      button.classList.add('active');
    }
    button.dataset.questJournalAction = 'set-category';
    button.dataset.category = category.key;

    const label = document.createElement('span');
    label.textContent = category.label;
    button.appendChild(label);

    const count = document.createElement('strong');
    count.textContent = `${category.count}`;
    button.appendChild(count);

    root.appendChild(button);
  }
}

function renderQuestEntries(root: HTMLElement, entries: QuestJournalListEntryViewModel[], emptyLabel: string): void {
  root.replaceChildren();

  if (entries.length === 0) {
    const empty = document.createElement('li');
    empty.classList.add('quest-journal-entry', 'empty');
    empty.textContent = emptyLabel;
    root.appendChild(empty);
    return;
  }

  for (const entry of entries) {
    const row = document.createElement('li');
    row.classList.add('quest-journal-entry');
    row.dataset.status = entry.status;
    if (entry.selected) {
      row.dataset.selected = '1';
    }
    if (entry.tracked) {
      row.dataset.tracked = '1';
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('quest-journal-entry-button');
    button.dataset.questJournalAction = 'select-quest';
    button.dataset.questKey = entry.key;

    const header = document.createElement('div');
    header.classList.add('quest-journal-entry-header');

    const title = document.createElement('strong');
    title.textContent = entry.title;
    header.appendChild(title);

    const status = document.createElement('span');
    status.classList.add('quest-journal-entry-status');
    status.textContent = entry.statusLabel;
    header.appendChild(status);

    button.appendChild(header);

    const objective = document.createElement('p');
    objective.classList.add('quest-journal-entry-objective');
    objective.textContent = entry.objectiveLabel;
    button.appendChild(objective);

    const meta = document.createElement('div');
    meta.classList.add('quest-journal-entry-meta');

    const origin = document.createElement('span');
    origin.textContent = entry.originLabel;
    meta.appendChild(origin);

    if (entry.badgeLabel) {
      const badge = document.createElement('span');
      badge.classList.add('quest-journal-badge');
      badge.textContent = entry.badgeLabel;
      meta.appendChild(badge);
    }

    if (entry.tracked) {
      const tracked = document.createElement('span');
      tracked.classList.add('quest-journal-track-pill');
      tracked.textContent = 'Suivie';
      meta.appendChild(tracked);
    }

    button.appendChild(meta);
    row.appendChild(button);
    root.appendChild(row);
  }
}

function renderQuestRewards(root: HTMLElement, rewards: string[]): void {
  root.replaceChildren();
  for (const reward of rewards) {
    const item = document.createElement('li');
    item.textContent = reward;
    root.appendChild(item);
  }
}

export function renderQuestJournal(input: {
  elements: QuestJournalRenderElements;
  viewModel: QuestJournalViewModel;
  questBusy: boolean;
}): void {
  const { elements, viewModel } = input;

  if (elements.toggleButton) {
    elements.toggleButton.textContent = viewModel.toggleLabel;
  }
  if (elements.summaryValue) {
    elements.summaryValue.textContent = viewModel.summaryLabel;
  }
  if (elements.trackedValue) {
    elements.trackedValue.textContent = viewModel.trackedLabel;
  }
  if (elements.panelRoot) {
    elements.panelRoot.hidden = !viewModel.panelOpen;
  }

  if (!viewModel.panelOpen) {
    return;
  }

  if (elements.categoriesRoot) {
    renderCategories(elements.categoriesRoot, viewModel.categories);
  }
  if (elements.listRoot) {
    renderQuestEntries(elements.listRoot, viewModel.entries, viewModel.emptyListLabel);
  }
  if (elements.detailTitleValue) {
    elements.detailTitleValue.textContent = viewModel.detail.title;
  }
  if (elements.detailTypeValue) {
    elements.detailTypeValue.textContent = viewModel.detail.typeLabel;
  }
  if (elements.detailOriginValue) {
    elements.detailOriginValue.textContent = viewModel.detail.originLabel;
  }
  if (elements.detailStatusValue) {
    elements.detailStatusValue.textContent = viewModel.detail.badgeLabel
      ? `${viewModel.detail.statusLabel} | ${viewModel.detail.badgeLabel}`
      : viewModel.detail.statusLabel;
  }
  if (elements.detailDescriptionValue) {
    elements.detailDescriptionValue.textContent = viewModel.detail.description;
  }
  if (elements.detailObjectiveValue) {
    elements.detailObjectiveValue.textContent = viewModel.detail.objectiveLabel;
  }
  if (elements.detailZoneValue) {
    elements.detailZoneValue.textContent = viewModel.detail.zoneLabel;
  }
  if (elements.detailRewardsRoot) {
    renderQuestRewards(elements.detailRewardsRoot, viewModel.detail.rewardLabels);
  }
  if (elements.trackButton) {
    elements.trackButton.textContent = viewModel.detail.trackActionLabel;
    elements.trackButton.disabled = viewModel.detail.trackQuestKey === null;
  }
  if (elements.claimButton) {
    elements.claimButton.disabled = viewModel.detail.claimQuestKey === null || input.questBusy;
    if (viewModel.detail.claimQuestKey) {
      elements.claimButton.dataset.questAction = 'claim';
      elements.claimButton.dataset.questKey = viewModel.detail.claimQuestKey;
    } else {
      delete elements.claimButton.dataset.questAction;
      delete elements.claimButton.dataset.questKey;
    }
  }
}
