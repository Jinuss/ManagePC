import { defineStore } from "pinia";

export const useAppVersionStore = defineStore("appVersion", {
  state: () => ({
    hasUpdate: true,
  }),
  actions: {
    setHasUpdate(hasUpdate) {
      this.hasUpdate = hasUpdate;
    },
  },
});
