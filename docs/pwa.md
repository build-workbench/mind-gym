# PWA / 离线策略

本文档说明 Mind Gym 的 PWA 配置和 Service Worker 缓存策略。

## 组件概览

| 组件             | 文件                   | 职责                     |
| ---------------- | ---------------------- | ------------------------ |
| Web App Manifest | `manifest.webmanifest` | 安装元信息、图标、主题色 |
| Service Worker   | `sw.js`                | 离线缓存、请求拦截       |

---

## Web App Manifest

### 配置内容

```json
{
  "name": "记忆力训练 - 翻牌配对",
  "short_name": "记忆翻牌",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "background_color": "#f8fafc",
  "theme_color": "#4f46e5",
  "description": "纯前端记忆训练小游戏：翻牌配对，多难度、排行榜、成就与离线支持。",
  "icons": [
    {
      "src": "./assets/icon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ]
}
```

### 字段说明

| 字段               | 值           | 说明                  |
| ------------------ | ------------ | --------------------- |
| `name`             | 完整名称     | 安装后显示的全名      |
| `short_name`       | 简短名称     | 主屏幕图标下方显示    |
| `start_url`        | `./`         | 启动入口              |
| `scope`            | `./`         | PWA 作用范围          |
| `display`          | `standalone` | 独立窗口，无浏览器 UI |
| `background_color` | `#f8fafc`    | 启动画面背景色        |
| `theme_color`      | `#4f46e5`    | 地址栏/状态栏颜色     |
| `icons`            | SVG 图标     | 支持任意尺寸          |

---

## Service Worker

### 缓存版本

```javascript
const CACHE_NAME = 'memory-match-v3';
```

> ⚠️ 修改核心资源后，应更新缓存版本号以触发重新缓存。

### 预缓存资源

```javascript
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './src/keys.js',
  './src/utils.js',
  './src/storage.js',
  './src/i18n.js',
  './src/effects.js',
  './src/pools.js',
  './src/timer.js',
  './src/confetti.js',
  './src/ui-events.js',
  './src/ui.js',
  './manifest.webmanifest',
  './assets/icon.svg',
  './assets/app.css',
];
```

### 缓存策略

#### 1. CSS 文件 — Cache First

```javascript
if (url.pathname.endsWith('.css')) {
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      });
    }),
  );
}
```

优先使用缓存，缓存未命中时从网络获取并缓存。

#### 2. 导航请求 — Network First

```javascript
if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      })
      .catch(() => {
        return caches.match(req).then((res) => res || caches.match('./index.html'));
      }),
  );
}
```

优先使用网络，网络失败时回退到缓存。

#### 3. 其他 GET 请求 — Cache First

```javascript
if (req.method === 'GET') {
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      });
    }),
  );
}
```

---

## 生命周期

### 安装 (install)

```javascript
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting()),
  );
});
```

1. 打开缓存
2. 预缓存所有核心资源
3. 跳过等待，立即激活

### 激活 (activate)

```javascript
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k)))))
      .then(() => self.clients.claim()),
  );
});
```

1. 删除旧版本缓存
2. 立即控制所有客户端

### 拦截 (fetch)

```javascript
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 仅处理同源请求
  if (url.origin !== self.location.origin) return;

  // 不缓存 sw.js 自身
  if (url.pathname.endsWith('/sw.js')) return;

  // 根据请求类型选择缓存策略...
});
```

---

## 离线能力

### 离线可用功能

| 功能      | 离线可用 | 说明                 |
| --------- | -------- | -------------------- |
| 经典配对  | ✅       | 完全离线             |
| 限时模式  | ✅       | 完全离线             |
| 每日挑战  | ⚠️ 部分  | 需要首次在线获取种子 |
| N-back    | ✅       | 完全离线             |
| 回忆测验  | ✅       | 完全离线             |
| 统计/成就 | ✅       | 本地存储             |
| 设置      | ✅       | 本地存储             |
| 导入/导出 | ✅       | 本地操作             |

### 离线限制

- Tailwind CSS 通过 CDN 加载，首次访问需在线
- Service Worker 会缓存 CDN 资源供后续离线使用
- 每日挑战种子基于日期，离线时使用本地日期

---

## 更新机制

### 用户侧更新

1. Service Worker 检测到新版本
2. 后台下载新资源
3. 下次访问时使用新版本

### 强制更新

用户可通过以下方式强制更新：

1. 清除浏览器缓存
2. 在开发者工具中清除 Service Worker
3. 重新访问页面

### 开发注意事项

修改核心资源后：

1. 更新 `CACHE_NAME` 版本号
2. 确保 `ASSETS` 列表包含新文件
3. 测试离线功能是否正常

---

## 调试技巧

### 查看缓存内容

```javascript
// 在浏览器控制台
caches.keys().then((names) => {
  names.forEach((name) => {
    caches.open(name).then((cache) => {
      cache.keys().then((keys) => {
        console.log(`Cache: ${name}`);
        keys.forEach((key) => console.log('  -', key.url));
      });
    });
  });
});
```

### 清除所有缓存

```javascript
caches.keys().then((names) => {
  names.forEach((name) => caches.delete(name));
});
```

### 模拟离线

Chrome DevTools → Application → Service Workers → Offline

---

## 安装提示

### 自动提示

PWA 支持浏览器的自动安装提示。用户访问时，浏览器会显示安装横幅。

### 手动安装

- **Chrome**: 地址栏右侧安装图标
- **Safari**: 分享 → 添加到主屏幕
- **Firefox**: 地址栏右侧安装图标

### 检测安装状态

```javascript
// 检测是否以 PWA 模式运行
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('Running as PWA');
}
```
