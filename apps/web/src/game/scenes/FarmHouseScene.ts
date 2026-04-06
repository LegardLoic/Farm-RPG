import Phaser from 'phaser';

type FarmHouseSceneData = {
  spawnId?: string;
  returnScene?: string;
  returnSpawnId?: string;
};

export class FarmHouseScene extends Phaser.Scene {
  private interactKey: Phaser.Input.Keyboard.Key | null = null;
  private latestData: FarmHouseSceneData | null = null;

  constructor() {
    super('farm_house');
  }

  create(data?: FarmHouseSceneData): void {
    this.latestData = data ?? null;
    const spawnLabel = data?.spawnId?.trim() || 'spawn_default';
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#17161f');
    this.add
      .rectangle(width * 0.5, height * 0.5, width * 0.86, height * 0.7, 0x2a2533, 0.94)
      .setStrokeStyle(2, 0xa491c6, 0.9);

    this.add.text(width * 0.5, height * 0.35, 'Maison de la Ferme', {
      fontFamily: 'Georgia, serif',
      fontSize: '28px',
      color: '#f4ead4',
    }).setOrigin(0.5);

    this.add.text(width * 0.5, height * 0.47, `Spawn cible: ${spawnLabel}`, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '14px',
      color: '#d6cbe9',
    }).setOrigin(0.5);

    this.add.text(width * 0.5, height * 0.58, 'E ou clic: sortir vers la ferme', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '15px',
      color: '#f0d79d',
    }).setOrigin(0.5);

    this.interactKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E) ?? null;
    this.input.on('pointerdown', this.leaveHouse, this);
  }

  update(): void {
    if (this.interactKey && Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      this.leaveHouse();
    }
  }

  private leaveHouse(): void {
    const returnScene = this.latestData?.returnScene?.trim() || 'GameScene';
    const returnSpawnId = this.latestData?.returnSpawnId?.trim() || 'spawn_house_exit';
    this.scene.start(returnScene, {
      frontSceneMode: 'farm',
      spawnId: returnSpawnId,
    });
  }
}

