<template>
  <NModal
    :show="visible"
    @update:show="handleModalClose"
    preset="card"
    :title="isEditing ? t('task.editTask') : t('task.addTask')"
    style="width: 500px"
  >
    <NForm :model="formData" class="task-form">
      <NFormItem :label="t('task.content')" required>
        <NInput
          v-model:value="formData.content"
          :placeholder="t('task.contentPlaceholder')"
        />
      </NFormItem>
      <NFormItem :label="t('task.scheduleType')" required>
        <NSelect
          v-model:value="formData.scheduleType"
          :options="scheduleTypeOptions"
          @update:value="handleScheduleTypeChange"
        />
      </NFormItem>
      <NFormItem
        v-if="formData.scheduleType === 'once'"
        :label="t('task.triggerTime')"
        required
      >
        <NDatePicker
          v-model:value="formData.triggerTime"
          type="datetime"
          :placeholder="t('task.selectTime')"
        />
      </NFormItem>
      <NFormItem
        v-if="formData.scheduleType === 'cron'"
        :label="t('task.cronExpression')"
        required
      >
        <div style="display: flex; flex-direction: column">
          <div class="cron-inputs">
            <div class="cron-field">
              <span class="cron-label">{{ t("task.cronMinute") }}</span>
              <NInput v-model:value="formData.cronMinute" placeholder="*" />
            </div>
            <div class="cron-field">
              <span class="cron-label">{{ t("task.cronHour") }}</span>
              <NInput v-model:value="formData.cronHour" placeholder="*" />
            </div>
            <div class="cron-field">
              <span class="cron-label">{{ t("task.cronDay") }}</span>
              <NInput v-model:value="formData.cronDay" placeholder="*" />
            </div>
            <div class="cron-field">
              <span class="cron-label">{{ t("task.cronMonth") }}</span>
              <NInput v-model:value="formData.cronMonth" placeholder="*" />
            </div>
            <div class="cron-field">
              <span class="cron-label">{{ t("task.cronDayOfWeek") }}</span>
              <NInput v-model:value="formData.cronDayOfWeek" placeholder="*" />
            </div>
          </div>
          <div class="cron-preview">{{ cronPreview }}</div>
        </div>
      </NFormItem>
      <NFormItem
        v-if="formData.scheduleType === 'interval'"
        :label="t('task.repeatInterval')"
        required
      >
        <NInputNumber
          v-model:value="formData.repeatInterval"
          :min="1"
          :max="100"
        />
        <NSelect
          v-model:value="formData.repeatUnit"
          :options="repeatUnitOptions"
          class="unit-select"
        />
      </NFormItem>
      <NFormItem :label="t('task.enabled')">
        <NSwitch v-model:value="formData.enabled" />
      </NFormItem>
    </NForm>
    <template #action>
      <div class="form-action-buttons">
        <NButton @click="handleClose">{{ t("common.cancel") }}</NButton>
        <NButton type="primary" @click="handleSubmit" :loading="loading">{{
          t("common.save")
        }}</NButton>
      </div>
    </template>
  </NModal>
</template>
<script setup>
import { ref, computed, watch, reactive } from "vue";
import { useI18n } from "vue-i18n";
import {
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NDatePicker,
  NInputNumber,
  NSwitch,
  NButton,
} from "naive-ui";
import { useMessage } from "naive-ui";
const { t } = useI18n();
const message = useMessage();
const props = defineProps({
  visible: { type: Boolean, default: false },
  editData: { type: Object, default: null },
});
const emit = defineEmits(["update:visible", "submit"]);
const isEditing = ref(false);
const loading = ref(false);
const formData = reactive({
  id: null,
  content: "",
  scheduleType: "once",
  cronMinute: "*",
  cronHour: "*",
  cronDay: "*",
  cronMonth: "*",
  cronDayOfWeek: "*",
  triggerTime: null,
  repeatInterval: 1,
  repeatUnit: "hours",
  enabled: true,
});
const scheduleTypeOptions = [
  { label: t("task.once"), value: "once" },
  { label: t("task.daily"), value: "cron" },
  { label: t("task.interval"), value: "interval" },
];
const repeatUnitOptions = [
  { label: t("task.minutes"), value: "minutes" },
  { label: t("task.hours"), value: "hours" },
  { label: t("task.days"), value: "days" },
  { label: t("task.weeks"), value: "weeks" },
];

const cronPreview = computed(
  () =>
    `${formData.cronMinute} ${formData.cronHour} ${formData.cronDay} ${formData.cronMonth} ${formData.cronDayOfWeek}`,
);
function resetForm() {
  isEditing.value = false;
  Object.assign(formData, {
    id: null,
    content: "",
    scheduleType: "once",
    cronMinute: "*",
    cronHour: "*",
    cronDay: "*",
    cronMonth: "*",
    cronDayOfWeek: "*",
    triggerTime: null,
    repeatInterval: 1,
    repeatUnit: "hours",
    enabled: true,
  });
}
function handleClose() {
  emit("update:visible", false);
}
function handleModalClose(event) {
  emit("update:visible", event);
}
function handleScheduleTypeChange() {
  if (formData.scheduleType !== "once") formData.triggerTime = null;
  if (formData.scheduleType !== "interval") {
    formData.repeatInterval = 1;
    formData.repeatUnit = "hours";
  }
}
function handleSubmit() {
  if (!formData.content) {
    message.warning(t("task.contentRequired"));
    return;
  }
  loading.value = true;
  const cronExpression = `${formData.cronMinute} ${formData.cronHour} ${formData.cronDay} ${formData.cronMonth} ${formData.cronDayOfWeek}`;
  let triggerTime = null;
  const timeValue = formData.triggerTime;
  if (timeValue) {
    if (timeValue instanceof Date) {
      triggerTime = timeValue.toISOString();
    } else if (typeof timeValue === "string" || typeof timeValue === "number") {
      triggerTime = new Date(timeValue).toISOString();
    }
  }
  emit("submit", {
    id: formData.id,
    content: formData.content,
    scheduleType: formData.scheduleType,
    cronExpression,
    triggerTime,
    repeatInterval: formData.repeatInterval || null,
    repeatUnit: formData.repeatUnit || null,
    enabled: formData.enabled,
  });
  loading.value = false;
}
watch(
  () => props.editData,
  (newVal) => {
    if (newVal) {
      isEditing.value = true;
      let cronParts = ["*", "*", "*", "*", "*"];
      if (newVal.cron_expression) cronParts = newVal.cron_expression.split(" ");
      Object.assign(formData, {
        id: newVal.id,
        content: newVal.content,
        scheduleType: newVal.schedule_type,
        cronMinute: cronParts[0] || "*",
        cronHour: cronParts[1] || "*",
        cronDay: cronParts[2] || "*",
        cronMonth: cronParts[3] || "*",
        cronDayOfWeek: cronParts[4] || "*",
        triggerTime: newVal.trigger_time ? new Date(newVal.trigger_time) : null,
        repeatInterval: newVal.repeat_interval || 1,
        repeatUnit: newVal.repeat_unit || "hours",
        enabled: newVal.enabled === 1,
      });
      console.log("formData:", formData);
    }
  },
  { immediate: true },
);
watch(
  () => props.visible,
  (newVal) => {
    if (!newVal) resetForm();
  },
);
</script>
<style scoped>
.task-form {
  max-height: 400px;
  overflow-y: auto;
}
.cron-inputs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.cron-field {
  flex: 1;
  min-width: 70px;
}
.cron-label {
  font-size: 0.75rem;
  color: #999;
  margin-bottom: 4px;
  display: block;
}
.cron-preview {
  margin-top: 12px;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9rem;
  color: #666;
}
.unit-select {
  width: 120px;
  margin-left: 8px;
}
.form-action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>