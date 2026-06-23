import { u as useI18n, o as onMounted, a as openBlock, c as createElementBlock, b as createBaseVNode, t as toDisplayString, d as unref, n as normalizeClass, f as normalizeStyle, r as ref } from "./index-FEAGUzeJ.js";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
const _hoisted_1 = { class: "battery-status" };
const _hoisted_2 = { class: "monitor-card" };
const _hoisted_3 = { class: "card-header" };
const _hoisted_4 = {
  key: 0,
  class: "card-body"
};
const _hoisted_5 = { class: "battery-main" };
const _hoisted_6 = { class: "battery-icon-container" };
const _hoisted_7 = { class: "battery-percent" };
const _hoisted_8 = { class: "battery-status-text" };
const _hoisted_9 = { class: "battery-details" };
const _hoisted_10 = { class: "detail-row" };
const _hoisted_11 = { class: "detail-label" };
const _hoisted_12 = { class: "detail-value" };
const _hoisted_13 = { class: "detail-row" };
const _hoisted_14 = { class: "detail-label" };
const _hoisted_15 = { class: "detail-value" };
const _hoisted_16 = { class: "detail-row" };
const _hoisted_17 = { class: "detail-label" };
const _hoisted_18 = { class: "detail-value" };
const _hoisted_19 = { class: "detail-row" };
const _hoisted_20 = { class: "detail-label" };
const _hoisted_21 = { class: "detail-value" };
const _hoisted_22 = { class: "detail-row" };
const _hoisted_23 = { class: "detail-label" };
const _hoisted_24 = {
  key: 1,
  class: "card-body empty-state"
};
const _sfc_main = {
  __name: "BatteryStatus",
  setup(__props) {
    const { t } = useI18n();
    const batteryInfo = ref({
      hasBattery: false,
      percent: 0,
      isCharging: false,
      timeRemaining: null,
      designedCapacity: null,
      maxCapacity: null,
      currentCapacity: null
    });
    const fetchBatteryInfo = async () => {
      try {
        const info = await window.electronAPI.getBatteryInfo();
        console.log("🚀 ~ fetchBatteryInfo ~ info:", info);
        batteryInfo.value = info;
      } catch (error) {
        console.error("获取电池信息失败:", error);
      }
    };
    const getBatteryClass = () => {
      const percent = batteryInfo.value.percent;
      if (percent <= 20) return "battery-low";
      if (percent <= 50) return "battery-medium";
      return "battery-high";
    };
    const getHealthClass = () => {
      const health = getHealthpercent();
      if (health >= 90) return "health-good";
      if (health >= 70) return "health-medium";
      return "health-poor";
    };
    const getHealthpercent = () => {
      if (!batteryInfo.value.maxCapacity || !batteryInfo.value.designedCapacity) {
        return "N/A";
      }
      return (batteryInfo.value.maxCapacity / batteryInfo.value.designedCapacity * 100).toFixed(1) + "%";
    };
    const formatCapacity = (capacity) => {
      if (!capacity) return "N/A";
      return capacity + " mAh";
    };
    onMounted(() => {
      fetchBatteryInfo();
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          createBaseVNode("div", _hoisted_3, [
            _cache[0] || (_cache[0] = createBaseVNode("span", { class: "card-icon" }, "🔋", -1)),
            createBaseVNode("h3", null, toDisplayString(unref(t)("battery.title")), 1)
          ]),
          batteryInfo.value.hasBattery ? (openBlock(), createElementBlock("div", _hoisted_4, [
            createBaseVNode("div", _hoisted_5, [
              createBaseVNode("div", _hoisted_6, [
                createBaseVNode("div", {
                  class: normalizeClass(["battery-icon", getBatteryClass()])
                }, [
                  createBaseVNode("div", {
                    class: "battery-level",
                    style: normalizeStyle({ width: batteryInfo.value.percent + "%" })
                  }, null, 4)
                ], 2),
                createBaseVNode("span", _hoisted_7, toDisplayString(batteryInfo.value.percent) + "%", 1)
              ]),
              createBaseVNode("div", _hoisted_8, [
                createBaseVNode("span", {
                  class: normalizeClass(["status-badge", batteryInfo.value.isCharging ? "charging" : "discharging"])
                }, toDisplayString(batteryInfo.value.isCharging ? unref(t)("battery.charging") : unref(t)("battery.discharging")), 3)
              ])
            ]),
            createBaseVNode("div", _hoisted_9, [
              createBaseVNode("div", _hoisted_10, [
                createBaseVNode("span", _hoisted_11, toDisplayString(unref(t)("battery.voltage")) + ":", 1),
                createBaseVNode("span", _hoisted_12, toDisplayString(batteryInfo.value.voltage || "N/A"), 1)
              ]),
              createBaseVNode("div", _hoisted_13, [
                createBaseVNode("span", _hoisted_14, toDisplayString(unref(t)("battery.current")) + ":", 1),
                createBaseVNode("span", _hoisted_15, toDisplayString(formatCapacity(batteryInfo.value.currentCapacity)), 1)
              ]),
              createBaseVNode("div", _hoisted_16, [
                createBaseVNode("span", _hoisted_17, toDisplayString(unref(t)("battery.max")) + ":", 1),
                createBaseVNode("span", _hoisted_18, toDisplayString(formatCapacity(batteryInfo.value.maxCapacity)), 1)
              ]),
              createBaseVNode("div", _hoisted_19, [
                createBaseVNode("span", _hoisted_20, toDisplayString(unref(t)("battery.design")) + ":", 1),
                createBaseVNode("span", _hoisted_21, toDisplayString(formatCapacity(batteryInfo.value.designedCapacity)), 1)
              ]),
              createBaseVNode("div", _hoisted_22, [
                createBaseVNode("span", _hoisted_23, toDisplayString(unref(t)("battery.health")) + ":", 1),
                createBaseVNode("span", {
                  class: normalizeClass(["detail-value", getHealthClass()])
                }, toDisplayString(getHealthpercent()), 3)
              ])
            ])
          ])) : (openBlock(), createElementBlock("div", _hoisted_24, [
            _cache[1] || (_cache[1] = createBaseVNode("div", { class: "empty-icon" }, "🖥️", -1)),
            createBaseVNode("p", null, toDisplayString(unref(t)("battery.noBattery")), 1)
          ]))
        ])
      ]);
    };
  }
};
const BatteryStatus = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-efa0b758"]]);
export {
  BatteryStatus as default
};
