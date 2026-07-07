
<script setup>
import { ref, onMounted, onUnmounted, h } from "vue";
import { useNotification, NProgress } from "naive-ui";
import { usePlatform } from "../composables/usePlatform.js";
import { useDialog } from "../composables/useDialog.js";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const { isMac } = usePlatform();

const { confirm } = useDialog();

const handleUpdateAvailable = (updateInfo) => {
  console.log("🚀 ~ handleUpdateAvailable ~ updateInfo:", updateInfo);
  confirm({
    title: `${t("settings.updateAvailable")} ${updateInfo.version}`,
    content: () =>
      updateInfo.releaseNotes
        ? h("div", {
            class: "release-notes",
            innerHTML: updateInfo.releaseNotes,
          })
        : t("settings.noReleaseNotes"),
    positiveText: t("settings.downloadNow"),
    negativeText: t("settings.remindLater"),
    maskClosable: false,
    onPositive: () => {
      handleDownloadProgress();
    },
  });
};

const handleDownloadComplete = () => {
  confirm({
    title: t("settings.downloadComplete"),
    content: t("settings.exitAndInstall"),
    positiveText: t("settings.exitInstall"),
    negativeText: t("settings.installLater"),
    maskClosable: false,
    onPositive: () => {
      window.electronAPI.installUpdate();
    },
  });
};

const notification = useNotification();

const progrssNotif = ref();

const handleDownloadProgress = () => {
  progrssNotif.value = notification.create({
    title: t("settings.downloadingTitle"),
    description: t("settings.downloadingDescription"),
    content: () => h(NProgress, { percentage: 0 }),
    duration: 0,
    closable: false,
  });

  window.electronAPI.onDownloadProgress((progress) => {
    progrssNotif.value.content = () =>
      h(NProgress, {
        percentage: progress.percent.toFixed(0),
        indicatorPlacement: "inside",
        processing: true,
      });
  });
  window.electronAPI.onUpdateDownloaded(() => {
    progrssNotif.value.destroy();
    console.log("🚀 ~ handleDownloadProgress ~ onDownloadComplete");
    handleDownloadComplete();
  });
  window.electronAPI.downloadUpdate();
};

let removeUpdateAvailableListener = null;

onMounted(() => {
  // macos 不监听更新事件
  if (isMac) return;

  // 获取自动升级设置
  const autoUpdate = window.electronAPI.getAutoUpdate();
  if (autoUpdate) {
    // 监听
    removeUpdateAvailableListener = window.electronAPI.onUpdateAvailable(
      handleUpdateAvailable,
    );
    // 检查更新
    try {
      window.electronAPI.checkForUpdates();
    } catch (error) {
      console.error("检查更新失败:", error);
    }
  }
});

onUnmounted(() => {
  if (removeUpdateAvailableListener) {
    removeUpdateAvailableListener();
  }
});
</script>
