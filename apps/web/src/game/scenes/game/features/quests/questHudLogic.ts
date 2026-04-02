import type { QuestState, QuestStatus } from '../../gameScene.stateTypes';

export function getQuestStatusLabel(status: QuestStatus): string {
  if (status === 'active') {
    return 'Active';
  }

  if (status === 'completed') {
    return 'Ready';
  }

  return 'Claimed';
}

export function getQuestSummaryLabel(params: {
  isAuthenticated: boolean;
  questBusy: boolean;
  quests: QuestState[];
}): string {
  if (!params.isAuthenticated) {
    return 'Login required';
  }

  if (params.questBusy && params.quests.length === 0) {
    return 'Loading...';
  }

  const active = params.quests.filter((quest) => quest.status === 'active').length;
  const completed = params.quests.filter((quest) => quest.status === 'completed').length;
  const claimed = params.quests.filter((quest) => quest.status === 'claimed').length;
  return `Active ${active} | Ready ${completed} | Claimed ${claimed}`;
}
