---
title: Mind Gym Whitepaper
description: Routes legacy app launches to the playable demo before locale-aware docs redirects.
---

<script setup>
import { onMounted } from 'vue';
import compatModule from './.vitepress/theme/root-compat.cjs';

const { resolveRootVisitTarget } = compatModule;

onMounted(() => {
  const target = resolveRootVisitTarget({
    href: window.location.href,
    language: navigator.language,
    baseUrl: import.meta.env.BASE_URL,
    isStandalone:
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      window.navigator?.standalone === true,
    referrer: document.referrer,
  });

  window.location.replace(target);
});
</script>

Choose a language: [English](./en/) | [简体中文](./zh/)
