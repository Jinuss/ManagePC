export const commonAPI = {
  /**
   * 获取当前运行平台信息
   * @returns {Object} - 平台信息对象
   * @returns {string} returns.platform - 平台名称（darwin/win32/linux）
   * @returns {boolean} returns.isMac - 是否为 macOS
   * @returns {boolean} returns.isWindows - 是否为 Windows
   * @returns {boolean} returns.isLinux - 是否为 Linux
   */
  getPlatform: () => ({
    platform: process.platform,
    isMac: process.platform === "darwin",
    isWindows: process.platform === "win32",
    isLinux: process.platform === "linux",
  }),
};
