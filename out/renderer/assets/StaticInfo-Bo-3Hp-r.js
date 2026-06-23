import { u as useI18n, o as onMounted, a as openBlock, c as createElementBlock, b as createBaseVNode, t as toDisplayString, d as unref, r as ref } from "./index-FEAGUzeJ.js";
import { f as formatUptime } from "./helpers-DDhaIzL0.js";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
const _hoisted_1 = { class: "static-info" };
const _hoisted_2 = { class: "monitor-card system-card" };
const _hoisted_3 = { class: "card-header" };
const _hoisted_4 = { class: "card-body" };
const _hoisted_5 = { class: "system-info" };
const _hoisted_6 = { class: "info-row" };
const _hoisted_7 = { class: "info-label" };
const _hoisted_8 = { class: "info-value" };
const _hoisted_9 = { class: "info-row" };
const _hoisted_10 = { class: "info-label" };
const _hoisted_11 = { class: "info-value" };
const _hoisted_12 = { class: "info-row" };
const _hoisted_13 = { class: "info-label" };
const _hoisted_14 = { class: "info-value" };
const _hoisted_15 = { class: "info-row" };
const _hoisted_16 = { class: "info-label" };
const _hoisted_17 = { class: "info-value cpu" };
const _hoisted_18 = { class: "info-row" };
const _hoisted_19 = { class: "info-label" };
const _hoisted_20 = { class: "info-value" };
const _hoisted_21 = { class: "info-row" };
const _hoisted_22 = { class: "info-label" };
const _hoisted_23 = { class: "info-value" };
const _hoisted_24 = { class: "info-row" };
const _hoisted_25 = { class: "info-label" };
const _hoisted_26 = { class: "info-value" };
const _sfc_main = {
  __name: "StaticInfo",
  setup(__props) {
    const { t } = useI18n();
    const systemInfo = ref({});
    const fetchSystemInfo = async () => {
      try {
        const data = await window.electronAPI.getSystemInfo();
        console.log("🚀 ~ fetchSystemInfo ~ data:", data);
        systemInfo.value = data;
      } catch (error) {
        console.error("获取系统信息失败:", error);
      }
    };
    onMounted(async () => {
      await fetchSystemInfo();
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          createBaseVNode("div", _hoisted_3, [
            _cache[0] || (_cache[0] = createBaseVNode("span", { class: "card-icon" }, "📊", -1)),
            createBaseVNode("h3", null, toDisplayString(unref(t)("system.title")), 1)
          ]),
          createBaseVNode("div", _hoisted_4, [
            createBaseVNode("div", _hoisted_5, [
              createBaseVNode("div", _hoisted_6, [
                createBaseVNode("span", _hoisted_7, toDisplayString(unref(t)("system.hostname")) + ":", 1),
                createBaseVNode("span", _hoisted_8, toDisplayString(systemInfo.value?.hostname || unref(t)("common.unknown")), 1)
              ]),
              createBaseVNode("div", _hoisted_9, [
                createBaseVNode("span", _hoisted_10, toDisplayString(unref(t)("system.os")) + ":", 1),
                createBaseVNode("span", _hoisted_11, toDisplayString(systemInfo.value?.distro || unref(t)("common.unknown")), 1)
              ]),
              createBaseVNode("div", _hoisted_12, [
                createBaseVNode("span", _hoisted_13, toDisplayString(unref(t)("system.platform")) + ":", 1),
                createBaseVNode("span", _hoisted_14, toDisplayString(systemInfo.value?.platform || unref(t)("common.unknown")), 1)
              ]),
              createBaseVNode("div", _hoisted_15, [
                createBaseVNode("span", _hoisted_16, toDisplayString(unref(t)("system.cpu")) + ":", 1),
                createBaseVNode("span", _hoisted_17, toDisplayString(systemInfo.value?.cpuModel || unref(t)("common.unknown")), 1)
              ]),
              createBaseVNode("div", _hoisted_18, [
                createBaseVNode("span", _hoisted_19, toDisplayString(unref(t)("system.cores")) + ":", 1),
                createBaseVNode("span", _hoisted_20, toDisplayString(systemInfo.value?.cpuCores || unref(t)("common.unknown")), 1)
              ]),
              createBaseVNode("div", _hoisted_21, [
                createBaseVNode("span", _hoisted_22, toDisplayString(unref(t)("system.uptime")) + ":", 1),
                createBaseVNode("span", _hoisted_23, toDisplayString(unref(formatUptime)(systemInfo.value?.uptime)), 1)
              ]),
              createBaseVNode("div", _hoisted_24, [
                createBaseVNode("span", _hoisted_25, toDisplayString(unref(t)("system.memory")) + ":", 1),
                createBaseVNode("span", _hoisted_26, toDisplayString(systemInfo.value?.totalMemory || unref(t)("common.unknown")), 1)
              ])
            ])
          ])
        ])
      ]);
    };
  }
};
const StaticInfo = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-026531c0"]]);
export {
  StaticInfo as default
};
