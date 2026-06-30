import { defineAsyncComponent } from "vue";

export const componentMap = {
  system: defineAsyncComponent(() => import("./components/StaticInfo.vue")),
  network: defineAsyncComponent(() => import("./components/SystemInfo.vue")),
  disk: defineAsyncComponent(() => import("./components/DiskUsage.vue")),
  battery: defineAsyncComponent(() => import("./components/BatteryStatus.vue")),
  monitor: defineAsyncComponent(() => import("./components/PCMonitor.vue")),
  logs: defineAsyncComponent(() => import("./components/LogViewer.vue")),
};