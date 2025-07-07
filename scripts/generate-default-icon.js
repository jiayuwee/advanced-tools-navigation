import { createWriteStream } from 'fs';
import { createCanvas } from 'canvas';

async function generateIcon() {
  // 创建180x180像素的默认图标
  const canvas = createCanvas(180, 180);
  const ctx = canvas.getContext('2d');

  // 绘制蓝色背景
  ctx.fillStyle = '#4285f4';
  ctx.fillRect(0, 0, 180, 180);

  // 绘制白色文字"A"
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 100px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('A', 90, 90);

  // 保存为PNG文件
  const out = createWriteStream('public/apple-touch-icon.png');
  const stream = canvas.createPNGStream();
  stream.pipe(out);
  
  return new Promise((resolve, reject) => {
    out.on('finish', () => {
      console.log('默认图标已生成: public/apple-touch-icon.png');
      resolve();
    });
    out.on('error', reject);
  });
}

generateIcon().catch(console.error);
