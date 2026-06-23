import { u as useI18n, o as onMounted, a as openBlock, c as createElementBlock, b as createBaseVNode, t as toDisplayString, d as unref, F as Fragment, e as renderList, n as normalizeClass, f as normalizeStyle, r as ref } from "./index-FEAGUzeJ.js";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
const _hoisted_1 = { class: "disk-usage" };
const _hoisted_2 = { class: "header" };
const _hoisted_3 = { class: "section-title" };
const _hoisted_4 = {
  key: 0,
  class: "disk-list"
};
const _hoisted_5 = { class: "disk-header" };
const _hoisted_6 = { class: "disk-name" };
const _hoisted_7 = { class: "progress-bar" };
const _hoisted_8 = { class: "disk-info" };
const _hoisted_9 = { class: "info-item" };
const _hoisted_10 = { class: "label" };
const _hoisted_11 = { class: "value" };
const _hoisted_12 = { class: "info-item" };
const _hoisted_13 = { class: "label" };
const _hoisted_14 = { class: "value used" };
const _hoisted_15 = { class: "info-item" };
const _hoisted_16 = { class: "label" };
const _hoisted_17 = { class: "value free" };
const _hoisted_18 = {
  key: 1,
  class: "empty-state"
};
const _sfc_main = {
  __name: "DiskUsage",
  setup(__props) {
    const { t } = useI18n();
    const diskList = ref([]);
    const fetchDiskUsage = async () => {
      try {
        const diskInfo = await window.electronAPI.getDiskUsage();
        diskList.value = diskInfo;
      } catch (error) {
        console.error("获取磁盘信息失败:", error);
        diskList.value = [];
      }
    };
    const getStatusClass = (percentage) => {
      if (percentage >= 90) return "danger";
      if (percentage >= 70) return "warning";
      return "normal";
    };
    const getProgressColor = (percentage) => {
      if (percentage >= 90) return "linear-gradient(90deg, #dc3545, #ff6b6b)";
      if (percentage >= 70) return "linear-gradient(90deg, #ffc107, #ffec8b)";
      return "linear-gradient(90deg, #28a745, #98fb98)";
    };
    onMounted(() => {
      fetchDiskUsage();
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          createBaseVNode("h2", _hoisted_3, "💾 " + toDisplayString(unref(t)("disk.usage")), 1),
          createBaseVNode("button", {
            class: "refresh-btn",
            onClick: fetchDiskUsage
          }, "🔄 " + toDisplayString(unref(t)("common.refresh")), 1)
        ]),
        diskList.value.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_4, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(diskList.value, (disk, index) => {
            return openBlock(), createElementBlock("div", {
              class: "disk-card",
              key: index
            }, [
              createBaseVNode("div", _hoisted_5, [
                createBaseVNode("span", _hoisted_6, toDisplayString(disk.drive), 1),
                createBaseVNode("span", {
                  class: normalizeClass(["status", getStatusClass(disk.percentage)])
                }, toDisplayString(disk.percentage.toFixed(1)) + "% ", 3)
              ]),
              createBaseVNode("div", _hoisted_7, [
                createBaseVNode("div", {
                  class: "progress-fill",
                  style: normalizeStyle({
                    width: disk.percentage + "%",
                    background: getProgressColor(disk.percentage)
                  })
                }, null, 4)
              ]),
              createBaseVNode("div", _hoisted_8, [
                createBaseVNode("div", _hoisted_9, [
                  createBaseVNode("span", _hoisted_10, toDisplayString(unref(t)("disk.totalSize")) + ":", 1),
                  createBaseVNode("span", _hoisted_11, toDisplayString(disk.total), 1)
                ]),
                createBaseVNode("div", _hoisted_12, [
                  createBaseVNode("span", _hoisted_13, toDisplayString(unref(t)("disk.used")) + ":", 1),
                  createBaseVNode("span", _hoisted_14, toDisplayString(disk.used), 1)
                ]),
                createBaseVNode("div", _hoisted_15, [
                  createBaseVNode("span", _hoisted_16, toDisplayString(unref(t)("disk.free")) + ":", 1),
                  createBaseVNode("span", _hoisted_17, toDisplayString(disk.free), 1)
                ])
              ])
            ]);
          }), 128))
        ])) : (openBlock(), createElementBlock("div", _hoisted_18, [
          _cache[0] || (_cache[0] = createBaseVNode("div", { class: "empty-icon" }, "📁", -1)),
          createBaseVNode("p", null, toDisplayString(unref(t)("disk.noDisk")), 1)
        ]))
      ]);
    };
  }
};
const DiskUsage = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-38c9c627"]]);
export {
  DiskUsage as default
};
