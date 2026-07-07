import { defineStore } from "pinia";

export const useAppVersionStore = defineStore("appVersion", {
  state: () => ({
    hasUpdate: false,
  }),
  actions: {
    setHasUpdate(hasUpdate) {
      this.hasUpdate = hasUpdate;
    },
  },
});
