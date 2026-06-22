const si = require('systeminformation')

async function getBatteryInfo() {
  try {
    const battery = await si.battery()
    console.log("🚀 ~ getBatteryInfo ~ battery:", battery)
    return {
      ...battery,
    }
  } catch (error) {
    console.error('获取电池信息失败:', error)
    return {
      hasBattery: false,
      percentage: 0,
      isCharging: false,
      timeRemaining: null,
      designCapacity: null,
      maxCapacity: null,
      currentCapacity: null
    }
  }
}


console.log(getBatteryInfo())