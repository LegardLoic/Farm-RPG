import type Phaser from 'phaser';

export function drawVillageSceneBackdrop(graphics: Phaser.GameObjects.Graphics): void {
  graphics.fillGradientStyle(0x5d675f, 0x5d675f, 0x2f3331, 0x2f3331, 1);
  graphics.fillRect(0, 0, 1600, 900);

  graphics.fillStyle(0x657068, 1);
  for (let x = 0; x < 1600; x += 58) {
    for (let y = 0; y < 900; y += 58) {
      if ((x + y) % 116 === 0) {
        graphics.fillCircle(x + 18, y + 22, 2);
      }
    }
  }

  graphics.fillStyle(0x64543d, 1);
  graphics.fillRoundedRect(532, 208, 536, 470, 22);
  graphics.fillStyle(0x7b684f, 1);
  graphics.fillRoundedRect(558, 234, 484, 418, 18);

  graphics.fillStyle(0x5f4a35, 1);
  graphics.fillRoundedRect(136, 124, 298, 206, 16);
  graphics.fillStyle(0x7f6445, 1);
  graphics.fillTriangle(136, 124, 284, 52, 434, 124);
  graphics.fillStyle(0xd5c6a3, 1);
  graphics.fillRect(258, 212, 50, 108);

  graphics.fillStyle(0x6b5032, 1);
  graphics.fillRoundedRect(1140, 128, 276, 214, 16);
  graphics.fillStyle(0x8e6f48, 1);
  graphics.fillTriangle(1140, 128, 1278, 58, 1416, 128);
  graphics.fillStyle(0x513a24, 1);
  graphics.fillRect(1224, 210, 26, 124);
  graphics.fillRect(1290, 210, 26, 124);

  graphics.fillStyle(0x7f6542, 1);
  graphics.fillRoundedRect(882, 468, 310, 206, 16);
  graphics.fillStyle(0xbc8d56, 1);
  graphics.fillTriangle(900, 468, 1038, 420, 1176, 468);
  graphics.fillStyle(0xb37a40, 1);
  graphics.fillRect(924, 556, 248, 22);

  graphics.fillStyle(0x4f5f4e, 1);
  graphics.fillRoundedRect(188, 520, 336, 220, 18);
  graphics.fillStyle(0x678267, 1);
  graphics.fillCircle(230, 536, 34);
  graphics.fillCircle(292, 704, 28);
  graphics.fillCircle(466, 538, 30);
  graphics.fillStyle(0x6f5e46, 1);
  graphics.fillRoundedRect(286, 604, 118, 30, 8);

  graphics.fillStyle(0x302d2b, 0.96);
  graphics.fillRoundedRect(666, 22, 286, 132, 22);
  graphics.fillStyle(0x4a433f, 0.92);
  graphics.fillRoundedRect(704, 52, 212, 86, 18);

  graphics.fillStyle(0x6a593f, 1);
  graphics.fillRoundedRect(636, 742, 332, 128, 18);
  graphics.fillStyle(0x8a704a, 1);
  graphics.fillRect(668, 760, 268, 18);

  graphics.lineStyle(5, 0xc4ac82, 0.72);
  graphics.lineBetween(518, 438, 884, 438);
  graphics.lineBetween(808, 152, 808, 742);
  graphics.lineBetween(492, 604, 632, 728);
  graphics.lineBetween(1048, 554, 980, 674);
}

