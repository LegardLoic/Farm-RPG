import type Phaser from 'phaser';

export function drawFarmSceneBackdrop(graphics: Phaser.GameObjects.Graphics): void {
  graphics.fillGradientStyle(0x2f6041, 0x2f6041, 0x1f462f, 0x1f462f, 1);
  graphics.fillRect(0, 0, 1600, 900);

  graphics.fillStyle(0x3d7248, 1);
  for (let x = 0; x < 1600; x += 52) {
    for (let y = 0; y < 900; y += 52) {
      if ((x + y) % 104 === 0) {
        graphics.fillCircle(x + 20, y + 16, 2);
      }
    }
  }

  graphics.fillStyle(0x6a5530, 1);
  graphics.fillRoundedRect(426, 182, 556, 360, 16);
  graphics.fillStyle(0x7f6637, 0.9);
  graphics.fillRoundedRect(438, 194, 532, 336, 12);

  graphics.fillStyle(0x7b5130, 1);
  graphics.fillRoundedRect(92, 148, 250, 170, 16);
  graphics.fillStyle(0x9d7448, 1);
  graphics.fillTriangle(92, 148, 220, 74, 342, 148);
  graphics.fillStyle(0xd7c39a, 1);
  graphics.fillRect(202, 218, 34, 78);

  graphics.fillStyle(0x6f4b2b, 1);
  graphics.fillRoundedRect(116, 404, 204, 84, 12);
  graphics.fillStyle(0x8d6942, 1);
  graphics.fillRect(184, 404, 12, 84);
  graphics.fillRect(238, 404, 12, 84);

  graphics.fillStyle(0x886a3f, 1);
  graphics.fillRoundedRect(1168, 256, 220, 330, 18);
  graphics.fillStyle(0xb48b57, 1);
  graphics.fillRoundedRect(1192, 278, 174, 286, 14);
  graphics.fillStyle(0xd4b277, 1);
  graphics.fillTriangle(1370, 410, 1450, 440, 1370, 470);

  graphics.lineStyle(4, 0xc5a16a, 0.8);
  graphics.lineBetween(312, 254, 438, 254);
  graphics.lineBetween(312, 446, 438, 446);
  graphics.lineBetween(970, 362, 1168, 362);
}

