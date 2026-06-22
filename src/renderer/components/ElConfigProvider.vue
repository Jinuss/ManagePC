<template>
  <el-config-provider :locale="elLocale">
    <slot />
  </el-config-provider>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import zhLocale from 'element-plus/es/locale/lang/zh-cn'
import enLocale from 'element-plus/es/locale/lang/en'

const { locale } = useI18n()

const elLocale = computed(() => {
  return locale.value === 'zh' ? zhLocale : enLocale
})
</script>
