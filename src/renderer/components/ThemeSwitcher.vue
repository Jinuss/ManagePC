<template>
  <div class="theme-switcher">
    <NButton
      :size="size"
      type="text"
      class="theme-btn"
      @click="toggleTheme"
    >
      <span class="theme-icon">{{ currentIcon }}</span>
      <span class="theme-label">{{ currentLabel }}</span>
    </NButton>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTheme } from '../composables/useTheme'
import { NButton } from 'naive-ui'

const props = defineProps({
  size: {
    type: String,
    default: 'small'
  }
})

const { theme, themes, toggleTheme } = useTheme()

const currentThemeInfo = computed(() => {
  return themes.find(t => t.id === theme.value) || themes[0]
})

const currentIcon = computed(() => currentThemeInfo.value?.icon || '⚙️')
const currentLabel = computed(() => currentThemeInfo.value?.label || '主题')
</script>

<style scoped>
.theme-switcher {
  display: inline-flex;
}

.theme-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-primary);
}

.theme-icon {
  font-size: 14px;
}

.theme-label {
  font-size: 12px;
}

.theme-btn:hover {
  background: rgba(102, 126, 234, 0.1);
}
</style>