const platformInfo = window.electronAPI.getPlatform();
export function usePlatform() {
  return platformInfo
}