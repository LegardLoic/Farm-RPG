import type {
  FarmPlotLayoutFallbackEntry,
  VillageSceneZoneConfig,
  VillageShopTabOption,
} from './gameScene.types';

export const FARM_PLOT_LAYOUT_FALLBACK: FarmPlotLayoutFallbackEntry[] = [
  { plotKey: 'plot_r1_c1', row: 1, col: 1 },
  { plotKey: 'plot_r1_c2', row: 1, col: 2 },
  { plotKey: 'plot_r1_c3', row: 1, col: 3 },
  { plotKey: 'plot_r1_c4', row: 1, col: 4 },
  { plotKey: 'plot_r2_c1', row: 2, col: 1 },
  { plotKey: 'plot_r2_c2', row: 2, col: 2 },
  { plotKey: 'plot_r2_c3', row: 2, col: 3 },
  { plotKey: 'plot_r2_c4', row: 2, col: 4 },
  { plotKey: 'plot_r3_c1', row: 3, col: 1 },
  { plotKey: 'plot_r3_c2', row: 3, col: 2 },
  { plotKey: 'plot_r3_c3', row: 3, col: 3 },
  { plotKey: 'plot_r3_c4', row: 3, col: 4 },
];

export const FARM_LABEL_OVERRIDES: Record<string, string> = {
  turnip_seed: 'Graines de navet',
  carrot_seed: 'Graines de carotte',
  wheat_seed: 'Graines de ble',
  turnip: 'Navet',
  carrot: 'Carotte',
  wheat: 'Ble',
  field_medicine: 'Medecine de champ',
  focus_tonic: 'Tonique de concentration',
  healing_herb: 'Herbe de soin',
  mana_tonic: 'Tonique de mana',
};

export const FARM_SCENE_ORIGIN_X = 540;
export const FARM_SCENE_ORIGIN_Y = 260;
export const FARM_SCENE_COL_STEP = 128;
export const FARM_SCENE_ROW_STEP = 96;
export const VILLAGE_SCENE_PLAYER_SPAWN = { x: 804, y: 734 };

export const VILLAGE_SCENE_ZONES: VillageSceneZoneConfig[] = [
  {
    key: 'mayor',
    x: 286,
    y: 232,
    width: 240,
    height: 168,
    title: 'Mairie',
    role: 'Maire - narration principale',
    hint: 'Accueil du village, suivi de progression.',
    actionLabel: 'Parler au Maire',
    actionKey: 'talk-mayor',
    npcKey: 'mayor',
  },
  {
    key: 'market',
    x: 1020,
    y: 540,
    width: 256,
    height: 176,
    title: 'Marche',
    role: 'Marchande - economie locale',
    hint: 'Achete des graines, vends les recoltes, puis repars vite.',
    actionLabel: 'Ouvrir le Marche',
    actionKey: 'open-market',
    npcKey: 'merchant',
  },
  {
    key: 'forge',
    x: 1262,
    y: 238,
    width: 240,
    height: 176,
    title: 'Forge',
    role: 'Forgeron - progression materielle',
    hint: 'Compare les paliers d equipement puis investis ton or.',
    actionLabel: 'Ouvrir la Forge',
    actionKey: 'open-forge',
    npcKey: 'blacksmith',
  },
  {
    key: 'calm',
    x: 350,
    y: 610,
    width: 268,
    height: 170,
    title: 'Coin calme',
    role: 'Habitante secondaire',
    hint: 'Echanges humains et quetes secondaires.',
    actionLabel: 'Parler',
    actionKey: 'talk-secondary',
  },
  {
    key: 'tower_exit',
    x: 806,
    y: 102,
    width: 336,
    height: 124,
    title: 'Route de la Tour',
    role: 'Sortie vers la menace',
    hint: 'Transition tour/combat prevue aux lots 4+.',
    actionLabel: 'Aller vers la Tour',
    actionKey: 'go-tower',
  },
  {
    key: 'farm_exit',
    x: 808,
    y: 788,
    width: 356,
    height: 122,
    title: 'Chemin de la Ferme',
    role: 'Retour au refuge',
    hint: 'Retourner a la ferme pour cultiver et dormir.',
    actionLabel: 'Retourner a la Ferme',
    actionKey: 'go-farm',
  },
];

export const VILLAGE_MARKET_SHOP_TABS: VillageShopTabOption[] = [
  { key: 'buy', label: 'Acheter' },
  { key: 'sell', label: 'Vendre' },
];

export const VILLAGE_FORGE_SHOP_TABS: VillageShopTabOption[] = [
  { key: 'weapons', label: 'Armes' },
  { key: 'armors', label: 'Armures' },
  { key: 'accessories', label: 'Accessoires' },
];
