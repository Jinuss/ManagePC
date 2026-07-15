import { ref, computed, h } from "vue";
import { useI18n } from "vue-i18n";

export function useMenuOptions() {
  const { t } = useI18n();

  const activeTab = ref("system");

  const menuOptions = computed(() => [
    {
      label: t("menu.system"),
      key: "system",
      icon: () => h("span", { class: "menu-icon" }, "📊"),
    },
    {
      label: t("menu.network"),
      key: "network",
      icon: () => h("span", { class: "menu-icon" }, "📡"),
    },
    {
      label: t("menu.disk"),
      key: "disk",
      icon: () => h("span", { class: "menu-icon" }, "💾"),
    },
    {
      label: t("menu.battery"),
      key: "battery",
      icon: () => h("span", { class: "menu-icon" }, "🔋"),
    },
    {
      label: t("menu.monitor"),
      key: "monitor",
      icon: () => h("span", { class: "menu-icon" }, "📈"),
    },
    {
      label: t("menu.screen"),
      key: "screen",
      icon: () => h("span", { class: "menu-icon" }, "🖥️"),
    },
    {
      label: t("menu.audio"),
      key: "audio",
      icon: () => h("span", { class: "menu-icon" }, "🔊"),
    },
  ]);

  const handleMenuSelect = (index) => {
    activeTab.value = index;
  };

  return {
    activeTab,
    menuOptions,
    handleMenuSelect,
  };
}
