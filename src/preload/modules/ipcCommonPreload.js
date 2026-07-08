export const commonAPI = {
  getPlatform: () => ({
    platform: process.platform,
    isMac: process.platform === "darwin",
    isWindows: process.platform === "win32",
    isLinux: process.platform === "linux",
  }),
};
