<template>
  <div class="task-table-wrapper">
    <NDataTable
      v-if="tasks.length > 0"
      :columns="columns"
      :data="tasks"
      class="task-table"
    />
    <div v-else class="empty-state">
      <span class="empty-icon">📅</span>
      <p>{{ t("task.noTasks") }}</p>
    </div>
  </div>
</template>
<script setup>
import { computed, h } from "vue";
import { useI18n } from "vue-i18n";
import { NDataTable, NButton, NSwitch } from "naive-ui";

const { t } = useI18n();

defineProps({
  tasks: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["edit", "delete", "toggle"]);

const columns = [
  {
    title: t("task.content"),
    key: "content",
    ellipsis: true,
  },
  {
    title: t("task.scheduleType"),
    key: "schedule_type",
    render(row) {
      const typeMap = {
        once: t("task.once"),
        cron: t("task.daily"),
        interval: t("task.interval"),
      };
      return typeMap[row.schedule_type] || row.schedule_type;
    },
  },
  {
    title: t("task.triggerTime"),
    key: "trigger_time",
    render(row) {
      if (row.schedule_type === "once") {
        if (row.trigger_time) {
          const date = new Date(row.trigger_time);
          return isNaN(date.getTime())
            ? row.trigger_time
            : date.toLocaleString();
        }
        return "-";
      } else if (row.schedule_type === "cron") {
        return row.cron_expression || "-";
      } else if (row.schedule_type === "interval") {
        return `${row.repeat_interval} ${t(`task.${row.repeat_unit}`)}`;
      }
      return "-";
    },
  },
  {
    title: t("task.status"),
    key: "enabled",
    render(row) {
      const enabled = row.enabled === 1;
      return h("div", { class: "switch-container" }, [
        h(
          NSwitch,
          {
            value: enabled,
            onChange: (val) => emit("toggle", row.id, val),
          },
          {
            checked: () => t("task.enabled"),
            unchecked: () => t("task.disable"),
          },
        ),
      ]);
    },
  },
  {
    title: t("common.actions"),
    key: "actions",
    render(row) {
      return h("div", { class: "action-buttons" }, [
        h(
          NButton,
          {
            size: "small",
            type: "primary",
            onClick: () => emit("edit", row),
            text: true,
          },
          () => t("common.edit"),
        ),
        h(
          NButton,
          {
            size: "small",
            type: "error",
            onClick: () => emit("delete", row.id),
            text: true,
          },
          () => t("common.delete"),
        ),
      ]);
    },
  },
];
</script>
<style scoped>
.task-table-wrapper {
  flex: 1;
}
.task-table {
  height: 100%;
}
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #999;
}
.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}
.action-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
</style>
