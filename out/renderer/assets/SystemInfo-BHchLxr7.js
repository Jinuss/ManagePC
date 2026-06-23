import { u as useI18n, o as onMounted, a as openBlock, c as createElementBlock, b as createBaseVNode, t as toDisplayString, d as unref, F as Fragment, e as renderList, r as ref } from "./index-FEAGUzeJ.js";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
const _hoisted_1 = { class: "system-info" };
const _hoisted_2 = { class: "section-title" };
const _hoisted_3 = { class: "network-cards" };
const _hoisted_4 = { class: "card-header" };
const _hoisted_5 = { class: "interface-name" };
const _hoisted_6 = { class: "card-body" };
const _hoisted_7 = { class: "info-item" };
const _hoisted_8 = { class: "label" };
const _hoisted_9 = { class: "value ip-value" };
const _hoisted_10 = { class: "info-item" };
const _hoisted_11 = { class: "label" };
const _hoisted_12 = { class: "value mac-value" };
const _hoisted_13 = { class: "info-item" };
const _hoisted_14 = { class: "label" };
const _hoisted_15 = { class: "value" };
const _hoisted_16 = { class: "info-item" };
const _hoisted_17 = { class: "label" };
const _hoisted_18 = { class: "value" };
const _hoisted_19 = { class: "section-title" };
const _hoisted_20 = { class: "ssh-card" };
const _hoisted_21 = { class: "ssh-content" };
const _hoisted_22 = { class: "ssh-key" };
const _sfc_main = {
  __name: "SystemInfo",
  setup(__props) {
    const { t } = useI18n();
    const networkInfo = ref([]);
    const sshKey = ref("");
    const copied = ref(false);
    const fetchNetworkInfo = async () => {
      try {
        const info = await window.electronAPI.getNetworkInfo();
        console.log("🚀 ~ fetchNetworkInfo ~ info:", info);
        networkInfo.value = info;
      } catch (error) {
        console.error("获取网络信息失败:", error);
        networkInfo.value = [
          {
            interface: t("error.title"),
            ipAddress: t("common.fetchFailed"),
            macAddress: "-",
            netmask: "-"
          }
        ];
      }
    };
    const fetchSSHKey = async () => {
      try {
        const key = await window.electronAPI.getSSHKey();
        sshKey.value = key;
      } catch (error) {
        console.error("获取 SSH key 失败:", error);
        sshKey.value = "获取失败";
      }
    };
    const copySSHKey = async () => {
      try {
        await navigator.clipboard.writeText(sshKey.value);
        copied.value = true;
        setTimeout(() => {
          copied.value = false;
        }, 2e3);
      } catch (error) {
        console.error("复制失败:", error);
      }
    };
    onMounted(() => {
      fetchNetworkInfo();
      fetchSSHKey();
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("h2", _hoisted_2, "📡 " + toDisplayString(unref(t)("networkInfo.title")), 1),
        createBaseVNode("div", _hoisted_3, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(networkInfo.value, (info, index) => {
            return openBlock(), createElementBlock("div", {
              class: "network-card",
              key: index
            }, [
              createBaseVNode("div", _hoisted_4, [
                createBaseVNode("span", _hoisted_5, toDisplayString(info.interface), 1)
              ]),
              createBaseVNode("div", _hoisted_6, [
                createBaseVNode("div", _hoisted_7, [
                  createBaseVNode("span", _hoisted_8, toDisplayString(unref(t)("networkInfo.ip")) + ":", 1),
                  createBaseVNode("span", _hoisted_9, toDisplayString(info.ipAddress), 1)
                ]),
                createBaseVNode("div", _hoisted_10, [
                  createBaseVNode("span", _hoisted_11, toDisplayString(unref(t)("networkInfo.mac")) + ":", 1),
                  createBaseVNode("span", _hoisted_12, toDisplayString(info.macAddress), 1)
                ]),
                createBaseVNode("div", _hoisted_13, [
                  createBaseVNode("span", _hoisted_14, toDisplayString(unref(t)("networkInfo.subnetMask")) + ":", 1),
                  createBaseVNode("span", _hoisted_15, toDisplayString(info.netmask), 1)
                ]),
                createBaseVNode("div", _hoisted_16, [
                  createBaseVNode("span", _hoisted_17, toDisplayString(unref(t)("networkInfo.dhcp")) + ":", 1),
                  createBaseVNode("span", _hoisted_18, toDisplayString(info.dhcp ? unref(t)("common.yes") : unref(t)("common.no")), 1)
                ])
              ])
            ]);
          }), 128))
        ]),
        createBaseVNode("h2", _hoisted_19, "🔑 " + toDisplayString(unref(t)("ssh.title")), 1),
        createBaseVNode("div", _hoisted_20, [
          createBaseVNode("div", _hoisted_21, [
            createBaseVNode("pre", _hoisted_22, toDisplayString(sshKey.value), 1)
          ]),
          createBaseVNode("button", {
            class: "copy-btn",
            onClick: copySSHKey
          }, toDisplayString(copied.value ? unref(t)("common.copied") : unref(t)("common.copy")), 1)
        ])
      ]);
    };
  }
};
const SystemInfo = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-a034bfc1"]]);
export {
  SystemInfo as default
};
