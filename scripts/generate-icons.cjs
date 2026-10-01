#!/usr/bin/env node
/**
 * 从 SVG 源生成 PWA PNG 图标（icon / apple-touch-icon）。
 * 需要 Node.js + sharp（npm i -D sharp）。
 * 绝不生成 SVG 伪装的假 PNG：转换工具不可用时直接报错退出。
 *
 * 注意：og-image.png 与 screenshot-*.png 不在本脚本生成范围内——
 * 它们必须用浏览器打开真实运行的页面截图（SVG 占位图渲染出来与实际界面不符），
 * 本脚本不会覆盖这些文件。
 */

const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');

// PWA 图标尺寸（统一从 icon.svg 渲染）
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// 源 SVG 文件（缺失则报错，不自动生成默认占位图）
const REQUIRED_SOURCES = ['icon.svg'];

let sharp;
try {
  sharp = require('sharp');
} catch {
  console.error('[icons] 未找到 sharp，无法生成 PNG。请先安装：npm i -D sharp');
  console.error('[icons] 或使用 rsvg-convert（librsvg）。已提交的 PNG 不会被修改。');
  process.exit(1);
}

async function renderSvg(source, outName, w, h) {
  const src = path.join(ASSETS_DIR, `${source}.svg`);
  const out = path.join(ASSETS_DIR, outName);
  await sharp(src)
    .resize(w, h, { fit: 'fill' })
    .png()
    .toFile(out);
  console.log(`  ✓ ${outName} (${w}x${h})`);
}

async function main() {
  for (const name of REQUIRED_SOURCES) {
    if (!fs.existsSync(path.join(ASSETS_DIR, name))) {
      console.error(`[icons] 缺少源文件 assets/${name}`);
      process.exit(1);
    }
  }

  for (const size of ICON_SIZES) {
    await renderSvg('icon', `icon-${size}.png`, size, size);
  }
  await renderSvg('icon', 'apple-touch-icon.png', 180, 180);

  console.log('\n[icons] PWA 图标生成完成（og-image / 截图请用浏览器对真实页面截图更新）');
}

main().catch(err => {
  console.error(`[icons] 生成失败: ${err.message}`);
  process.exit(1);
});
