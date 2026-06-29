import { defineAsyncComponent } from "vue";

export const componentMap = {
  common: defineAsyncComponent(() => import("./components/CommonSetting/index.vue")),
  
  theme: defineAsyncComponent(() => import("./components/ThemeSettings.vue")),

  about: defineAsyncComponent(() => import("./components/AboutSettings.vue")),
};
