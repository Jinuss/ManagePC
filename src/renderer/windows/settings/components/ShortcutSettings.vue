<template>
  <div class="settings-section">
    <div class="shortcut-item">
      <span class="shortcut-label">{{ t("settings.showWindowShortcut") }}</span>
      <div class="shortcut-actions">
        <div
          class="shortcut-input"
          :class="{
            'shortcut-input-active': isRecording,
            'shortcut-input-conflict': hasConflict,
          }"
          @click="startRecording"
        >
          <span v-if="isRecording">{{ t("settings.shortcutPlaceholder") }}</span>
          <span v-else-if="currentShortcut">{{ formatShortcut(currentShortcut) }}</span>
          <span v-else class="placeholder">{{ t("settings.shortcutPlaceholder") }}</span>
        </div>
        <NButton
          v-if="currentShortcut"
          text
          size="small"
          @click="resetShortcut"
        >
          {{ t("settings.shortcutReset") }}
        </NButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { NButton } from "naive-ui";

const { t } = useI18n();

const currentShortcut = ref("");
const isRecording = ref(false);
const hasConflict = ref(false);
const pressedKeys = ref([]);

const KEY_MAP = {
  Meta: "Win",
  Command: "Cmd",
  Control: "Ctrl",
  Alt: "Alt",
  Shift: "Shift",
  ArrowUp: "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
  Enter: "Enter",
  Tab: "Tab",
  Space: "Space",
  Backspace: "Backspace",
  Delete: "Del",
  Escape: "Esc",
};

const formatShortcut = (shortcut) => {
  return shortcut
    .replace("CommandOrControl", "Ctrl")
    .replace("Meta", "Win")
    .replace("Command", "Cmd");
};

const normalizeKey = (key) => {
  if (key.length === 1) {
    return key.toUpperCase();
  }
  return KEY_MAP[key] || key;
};

const startRecording = () => {
  isRecording.value = true;
  hasConflict.value = false;
  pressedKeys.value = [];
};

const stopRecording = async () => {
  isRecording.value = false;
  
  if (pressedKeys.value.length === 0) {
    return;
  }

  const accelerator = pressedKeys.value.join("+");
  const result = await window.electronAPI.setShortcut("showWindow", accelerator);
  
  if (result.success) {
    currentShortcut.value = accelerator;
    hasConflict.value = false;
  } else {
    hasConflict.value = true;
    pressedKeys.value = [];
  }
};

const resetShortcut = async () => {
  await window.electronAPI.setShortcut("showWindow", "CommandOrControl+Shift+A");
  currentShortcut.value = "CommandOrControl+Shift+A";
  hasConflict.value = false;
};

const handleKeyDown = (event) => {
  if (!isRecording.value) return;

  event.preventDefault();

  const key = event.key === " " ? "Space" : event.key;
  
  const normalizedKey = normalizeKey(key);
  
  if (
    !pressedKeys.value.includes(normalizedKey) &&
    !["AltGraph", "Fn", "CapsLock", "NumLock", "ScrollLock"].includes(key)
  ) {
    pressedKeys.value.push(normalizedKey);
  }

  if (event.key === "Escape") {
    isRecording.value = false;
    pressedKeys.value = [];
    return;
  }

  if (event.key.length === 1 || ["Enter", "Space", "Tab", "Backspace", "Delete"].includes(event.key)) {
    stopRecording();
  }
};

const handleKeyUp = () => {
  if (!isRecording.value || pressedKeys.value.length === 0) return;
};

onMounted(async () => {
  try {
    const result = await window.electronAPI.getShortcut("showWindow");
    currentShortcut.value = result.shortcut || "CommandOrControl+Shift+A";
    await window.electronAPI.registerShortcut("showWindow", currentShortcut.value);
  } catch {
    currentShortcut.value = "CommandOrControl+Shift+A";
  }

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("keyup", handleKeyUp);
});
</script>

<style scoped>
.settings-section {
  background-color: var(--color-bg-primary);
  border-radius: 8px;
  padding: 16px;
}

.shortcut-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.shortcut-label {
  color: var(--color-text-secondary);
  font-size: 13px;
}

.shortcut-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.shortcut-input {
  min-width: 180px;
  padding: 8px 16px;
  border: 2px dashed var(--color-border);
  border-radius: 8px;
  font-size: 13px;
  color: var(--color-text-secondary);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.shortcut-input:hover {
  border-color: var(--color-primary);
  background-color: rgba(var(--color-primary), 0.05);
}

.shortcut-input-active {
  border-color: var(--color-primary);
  background-color: rgba(var(--color-primary), 0.1);
  color: var(--color-primary);
  animation: pulse 1.5s infinite;
}

.shortcut-input-conflict {
  border-color: var(--color-error);
  background-color: rgba(var(--color-error), 0.1);
  color: var(--color-error);
}

.shortcut-input .placeholder {
  color: var(--color-text-placeholder);
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
</style>