import { ref, onMounted, onUnmounted, h } from "vue";
import { useNotification, NProgress } from "naive-ui";
import { usePlatform } from "./usePlatform";
import { useDialog } from "./useDialog";
import { useI18n } from "vue-i18n";

export function useAppUpdate() {
  const { t } = useI18n();
  const { isMac } = usePlatform();
  const { confirm } = useDialog();
  const notification = useNotification();
  const progressNotif = ref();
  let removeUpdateAvailableListener = null;

  const handleUpdateAvailable = (updateInfo) => {
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

  const handleDownloadProgress = () => {
    progressNotif.value = notification.create({
      title: t("settings.downloadingTitle"),
      description: t("settings.downloadingDescription"),
      content: () => h(NProgress, { percentage: 0 }),
      duration: 0,
      closable: false,
    });

    window.electronAPI.onDownloadProgress((progress) => {
      progressNotif.value.content = () =>
        h(NProgress, {
          percentage: progress.percent.toFixed(0),
          indicatorPlacement: "inside",
          processing: true,
        });
    });

    window.electronAPI.onUpdateDownloaded(() => {
      progressNotif.value.destroy();
      handleDownloadComplete();
    });

    window.electronAPI.downloadUpdate();
  };

  const setupUpdateListener = () => {
    if (isMac) return;

    removeUpdateAvailableListener = window.electronAPI.onUpdateAvailable({
      callback: handleUpdateAvailable,
    });
  };

  const cleanupUpdateListener = () => {
    if (removeUpdateAvailableListener) {
      removeUpdateAvailableListener();
      removeUpdateAvailableListener = null;
    }
  };

  onMounted(() => {
    setupUpdateListener();
  });

  onUnmounted(() => {
    cleanupUpdateListener();
  });

  return {
    handleUpdateAvailable,
    handleDownloadComplete,
    handleDownloadProgress,
    setupUpdateListener,
    cleanupUpdateListener,
  };
}
