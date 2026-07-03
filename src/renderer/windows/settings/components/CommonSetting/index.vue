<template>
  <NSpace vertical>
    <LanguageSettings />
    <AutoUpdate />
    <AutoStartSettings />
  </NSpace>
</template>

<script setup>
import {NSpace} from "naive-ui";
import LanguageSettings from "./commponents/LanguageSettings.vue";
import AutoStartSettings from "./commponents/AutoStartSettings.vue";
import AutoUpdate from "./commponents/AutoUpdate.vue";
</script>

