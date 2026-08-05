---
title: Mind Gym 技术白皮书
description: 根路径统一重定向到中文白皮书站点。
---

<script setup>
import { onMounted } from 'vue';
import compatModule from './.vitepress/theme/root-compat.cjs';

const { resolveRootVisitTarget } = compatModule;

onMounted(() => {
  const target = resolveRootVisitTarget({
    href: window.location.href,
    baseUrl: import.meta.env.BASE_URL,
    isStandalone:
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      window.navigator?.standalone === true,
    referrer: document.referrer,
  });

  window.location.replace(target);
});
</script>

前往 [中文白皮书](./zh/) 或 [在线试玩](./play/index.html)。
