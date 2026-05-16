---
title: Mind Gym Whitepaper
description: Redirects to the preferred documentation language.
---

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  const target = navigator.language?.toLowerCase().startsWith('zh') ? 'zh/' : 'en/';
  window.location.replace(new URL(target, window.location.href).toString());
});
</script>

Choose a language: [English](./en/) | [简体中文](./zh/)
