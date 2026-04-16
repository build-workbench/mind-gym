# PWA / 离线策略

Mind Gym 渐进式 Web 应用实现与离线功能的完整指南。

---

## 组件概览

| 组件                 | 文件                   | 职责                     |
| -------------------- | ---------------------- | ------------------------ |
| **Web App Manifest** | `manifest.webmanifest` | 安装元信息、图标、主题色 |
| **Service Worker**   | `sw.js`                | 离线缓存、请求拦截       |

---

## Web App Manifest

### 配置内容

```json
{
  "name": "Mind Gym - 记忆力训练",
  "short_name": "Mind Gym",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "background_color": "#f8fafc",
  "theme_color": "#4f46e5",
  "description": "基于浏览器的记忆力训练，支持多种模式、自适应难度和进度追踪。",
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

| 字段               | 值           | 说明                             |
| ------------------ | ------------ | -------------------------------- |
| `name`             | 完整名称     | 在应用商店和安装提示中显示的全名 |
| `short_name`       | 简短名称     | 主屏幕图标下方显示的短名称       |
| `start_url`        | `./`         | 启动入口                         |
| `scope`            | `./`         | PWA 作用范围                     |
| `display`          | `standalone` | 独立窗口，无浏览器 UI            |
| `background_color` | `#f8fafc`    | 启动画面背景色                   |
| `theme_color`      | `#4f46e5`    | 地址栏/工具栏颜色                |
| `icons`            | SVG 图标     | 支持任意尺寸缩放                 |

---

## Service Worker

### 缓存版本

```javascript
const CACHE_NAME = 'mind-gym-v3';
```

> ⚠️ **重要**: 修改核心资源后，应更新缓存版本号以触发重新缓存。

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

#### 1. CSS 文件 — 缓存优先

```javascript
if (url.pathname.endsWith('.css')) {
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return res;
      });
    })
  );
}
```

立即返回缓存版本；如缺失则从网络获取并缓存。

#### 2. 导航请求 — 网络优先

```javascript
if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
  event.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return res;
      })
      .catch(() => {
        return caches.match(req).then(res => res || caches.match('./index.html'));
      })
  );
}
```

优先使用网络获取最新内容；失败时回退到缓存。

#### 3. 其他 GET 请求 — 缓存优先

```javascript
if (req.method === 'GET') {
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return res;
      });
    })
  );
}
```

---

## 生命周期

### 安装 (install)

```javascript
self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});
```

1. 打开缓存
2. 预缓存所有核心资源
3. 跳过等待，立即激活

### 激活 (activate)

```javascript
self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(keys.map(k => (k === CACHE_NAME ? null : caches.delete(k)))))
      .then(() => self.clients.claim())
  );
});
```

1. 删除旧版本缓存
2. 立即控制所有客户端

### 拦截 (fetch)

```javascript
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // 仅处理同源请求
  if (url.origin !== self.location.origin) return;

  // 不缓存 sw.js 自身
  if (url.pathname.endsWith('/sw.js')) return;

  // 根据请求类型选择策略...
});
```

---

## 离线能力

### 功能矩阵

| 功能      | 离线状态    | 说明               |
| --------- | ----------- | ------------------ |
| 经典配对  | ✅ 完全支持 | 完全离线可用       |
| 限时模式  | ✅ 完全支持 | 完全离线可用       |
| 每日挑战  | ⚠️ 部分支持 | 首次获取种子需联网 |
| N-back    | ✅ 完全支持 | 完全离线可用       |
| 回忆测验  | ✅ 完全支持 | 完全离线可用       |
| 统计      | ✅ 完全支持 | 本地存储           |
| 成就      | ✅ 完全支持 | 本地存储           |
| 设置      | ✅ 完全支持 | 本地存储           |
| 导入/导出 | ✅ 完全支持 | 本地操作           |

### 离线限制

| 限制     | 说明                                      |
| -------- | ----------------------------------------- |
| 首次访问 | 需要网络连接下载初始资源                  |
| CDN 资源 | Tailwind CSS CDN 首次加载后缓存供离线使用 |
| 每日挑战 | 种子基于本地日期，无服务器验证            |

---

## 更新机制

### 自动更新

1. 页面加载时检测到新 Service Worker
2. 后台下载新资源
3. 下次访问时应用更新

### 强制更新（用户）

1. 清除浏览器缓存
2. 在开发者工具中注销 Service Worker
3. 硬刷新（Ctrl+Shift+R / Cmd+Shift+R）

### 强制更新（开发者）

```javascript
// 在浏览器控制台执行
navigator.serviceWorker.getRegistrations().then(regs => {
  for (let reg of regs) {
    reg.unregister();
  }
});
// 然后刷新页面
```

---

## 浏览器兼容性

| 浏览器      | PWA 支持 | Service Worker | 安装提示            |
| ----------- | -------- | -------------- | ------------------- |
| Chrome 90+  | ✅ 完整  | ✅             | ✅                  |
| Firefox 90+ | ✅ 完整  | ✅             | ✅（安卓）          |
| Safari 14+  | ✅ 部分  | ✅             | ⭐ 「添加到主屏幕」 |
| Edge 90+    | ✅ 完整  | ✅             | ✅                  |

### Safari 注意事项

- 无自动安装提示；使用「分享 → 添加到主屏幕」
- 隐私模式下 Service Worker 持久性受限
- 部分 PWA 功能（如标记）不支持

---

## 调试工具

### 查看缓存内容

```javascript
// 列出所有缓存资源
caches.keys().then(names => {
  names.forEach(name => {
    caches.open(name).then(cache => {
      cache.keys().then(keys => {
        console.log(`缓存: ${name}`);
        keys.forEach(key => console.log('  -', key.url));
      });
    });
  });
});
```

### 清除所有缓存

```javascript
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
```

### Chrome 开发者工具

1. **Application** 标签页 → **Service Workers**
   - 查看已注册的工作线程
   - 强制更新
   - 模拟离线

2. **Application** 标签页 → **Cache Storage**
   - 检查缓存资源
   - 删除单个条目

3. **Network** 标签页
   - 勾选「Offline」模拟离线
   - 确认资源由 Service Worker 提供

---

## 故障排除

### 问题：应用无法安装

| 检查项         | 解决方案                                          |
| -------------- | ------------------------------------------------- |
| HTTPS          | PWA 需要 HTTPS（或 localhost）                    |
| Manifest       | 在 [PWABuilder](https://www.pwabuilder.com/) 验证 |
| Service Worker | 检查 DevTools → Application → Service Workers     |

### 问题：离线模式不工作

| 检查项   | 解决方案                       |
| -------- | ------------------------------ |
| 首次访问 | 必须在线进行初始缓存           |
| 缓存版本 | 修改后递增 `CACHE_NAME`        |
| 资源列表 | 确保 `ASSETS` 包含所有必需文件 |

### 问题：更新未生效

| 检查项   | 解决方案                                              |
| -------- | ----------------------------------------------------- |
| 硬刷新   | Ctrl+Shift+R / Cmd+Shift+R                            |
| 注销 SW  | DevTools → Application → Service Workers → Unregister |
| 清除缓存 | DevTools → Application → Clear Storage                |

---

## 最佳实践

### 开发者指南

1. **版本管理**: 修改缓存资源时务必更新 `CACHE_NAME`
2. **资源完整性**: 确保 `ASSETS` 列表完整
3. **测试**: 在无痕/隐私模式下测试离线功能
4. **灰度发布**: 考虑在功能标志后发布 Service Worker 更新

### 用户指南

1. **初始加载**: 首次访问时保持浏览器打开直到 Service Worker 安装完成
2. **更新**: 关闭并重新打开应用以接收更新
3. **存储**: 应用使用极少的 localStorage（通常 < 50KB）

---

_有关架构详情，请参见 [架构概览](./architecture.zh-CN.md)。有关数据持久化，请参见 [存储模型](./storage.zh-CN.md)。_
