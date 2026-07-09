<template>
  <div class="task-scheduler-page">
    <div class="task-header">
      <h2>{{ t("task.title") }}</h2>
      <NButton type="primary" @click="openAddDialog">
        {{ t("task.addTask") }}
      </NButton>
    </div>

    <TaskTable
      :tasks="tasks"
      @edit="handleEdit"
      @delete="handleDelete"
      @toggle="handleToggle"
    />

    <TaskDialog
      v-model:visible="showDialog"
      :edit-data="editRow"
      @submit="handleSubmit"
    />
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { NButton } from "naive-ui";
import { useMessage } from "naive-ui";
import TaskTable from "./TaskTable.vue";
import TaskDialog from "./TaskDialog.vue";

const { t } = useI18n();
const message = useMessage();

const tasks = ref([]);
const showDialog = ref(false);
const editRow = ref(null);

async function loadTasks() {
  try {
    const result = await window.electronAPI.getAll();
    if (result.success) {
      tasks.value = result.data;
    } else {
      message.error(t("task.loadFailed"));
    }
  } catch (error) {
    message.error(t("task.loadFailed"));
  }
}

function openAddDialog() {
  editRow.value = null;
  showDialog.value = true;
}

function handleEdit(row) {
  editRow.value = row;
  showDialog.value = true;
}

async function handleSubmit(data) {
  try {
    console.log('[TaskSchedulerPage] handleSubmit - data:', data);
    console.log('[TaskSchedulerPage] handleSubmit - triggerTime:', data.triggerTime, '类型:', typeof data.triggerTime);
    let result;
    if (data.id) {
      console.log('[TaskSchedulerPage] 调用 update，triggerTime:', data.triggerTime);
      result = await window.electronAPI.update(data.id, {
        content: data.content,
        scheduleType: data.scheduleType,
        cronExpression: data.cronExpression,
        triggerTime: data.triggerTime,
        repeatInterval: data.repeatInterval,
        repeatUnit: data.repeatUnit,
        enabled: data.enabled,
      });
      if (result.success) message.success(t("task.editSuccess"));
    } else {
      console.log('[TaskSchedulerPage] 调用 add，triggerTime:', data.triggerTime);
      result = await window.electronAPI.add({
        content: data.content,
        scheduleType: data.scheduleType,
        cronExpression: data.cronExpression,
        triggerTime: data.triggerTime,
        repeatInterval: data.repeatInterval,
        repeatUnit: data.repeatUnit,
        enabled: data.enabled,
      });
      if (result.success) message.success(t("task.addSuccess"));
    }
    if (result.success) {
      showDialog.value = false;
      loadTasks();
    } else {
      message.error(result.error || t("task.saveFailed"));
    }
  } catch (error) {
    message.error(t("task.saveFailed"));
  }
}

async function handleDelete(id) {
  try {
    const result = await window.electronAPI.delete(id);
    if (result.success) {
      message.success(t("task.deleteSuccess"));
      loadTasks();
    } else {
      message.error(t("task.deleteFailed"));
    }
  } catch (error) {
    message.error(t("task.deleteFailed"));
  }
}

async function handleToggle(id, enabled) {
  try {
    const result = await window.electronAPI.toggle(id, enabled);
    if (result.success) {
      message.success(enabled ? t("task.enableSuccess") : t("task.disableSuccess"));
      loadTasks();
    } else {
      message.error(t("task.toggleFailed"));
    }
  } catch (error) {
    message.error(t("task.toggleFailed"));
  }
}

onMounted(() => {
  loadTasks();
});
</script>
<style scoped>
.task-scheduler-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.task-header h2 {
  font-size: 1.5rem;
  margin: 0;
}
</style>
