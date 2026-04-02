import type { QuestState, QuestStatus } from '../../gameScene.stateTypes';

export function renderQuestList(params: {
  root: HTMLElement;
  isAuthenticated: boolean;
  questBusy: boolean;
  quests: QuestState[];
  getQuestStatusLabel: (status: QuestStatus) => string;
}): void {
  params.root.replaceChildren();

  if (!params.isAuthenticated) {
    const item = document.createElement('li');
    item.classList.add('quest-item', 'empty');
    item.textContent = 'Connect to see quests.';
    params.root.appendChild(item);
    return;
  }

  if (params.quests.length === 0) {
    const item = document.createElement('li');
    item.classList.add('quest-item', 'empty');
    item.textContent = params.questBusy ? 'Loading quests...' : 'No quests available.';
    params.root.appendChild(item);
    return;
  }

  for (const quest of params.quests) {
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
    badge.textContent = params.getQuestStatusLabel(quest.status);
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
      claimButton.disabled = params.questBusy;
      item.appendChild(claimButton);
    }

    params.root.appendChild(item);
  }
}
