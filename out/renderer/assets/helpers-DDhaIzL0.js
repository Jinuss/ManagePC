const formatUptime = (seconds) => {
  if (!seconds || typeof seconds !== "number") return "-";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor(seconds % 86400 / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  if (days > 0) return `${days}天 ${hours}小时`;
  if (hours > 0) return `${hours}小时 ${minutes}分钟`;
  return `${minutes}分钟`;
};
const updateHistory = (history, value, maxLength = 30) => {
  if (!Array.isArray(history)) return;
  history.push(value);
  if (history.length > maxLength) {
    history.shift();
  }
};
export {
  formatUptime as f,
  updateHistory as u
};
