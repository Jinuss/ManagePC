<template>
  <div class="battery-status">
    <div class="monitor-card">
      <div class="card-header">
        <span class="card-icon">🔋</span>
        <h3>{{ t('battery.title') }}</h3>
      </div>
      <div class="card-body" v-if="batteryInfo.hasBattery">
        <div class="battery-main">
          <div class="battery-icon-container">
            <div class="battery-icon" :class="getBatteryClass()">
              <div class="battery-level" :style="{ width: batteryInfo.percent + '%' }"></div>
            </div>
            <span class="battery-percent">{{ batteryInfo.percent }}%</span>
          </div>
          <div class="battery-status-text">
            <span :class="['status-badge', batteryInfo.isCharging ? 'charging' : 'discharging']">
              {{ batteryInfo.isCharging ? t('battery.charging') : t('battery.discharging') }}
            </span>
          </div>
        </div>
        
        <div class="battery-details">
          <div class="detail-row">
            <span class="detail-label">{{ t('battery.voltage') }}:</span>
            <span class="detail-value">{{ batteryInfo.voltage || 'N/A' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">{{ t('battery.current') }}:</span>
            <span class="detail-value">{{ formatCapacity(batteryInfo.currentCapacity) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">{{ t('battery.max') }}:</span>
            <span class="detail-value">{{ formatCapacity(batteryInfo.maxCapacity) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">{{ t('battery.design') }}:</span>
            <span class="detail-value">{{ formatCapacity(batteryInfo.designedCapacity) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">{{ t('battery.health') }}:</span>
            <span class="detail-value" :class="getHealthClass()">{{ getHealthpercent() }}</span>
          </div>
        </div>
      </div>
      <div class="card-body empty-state" v-else>
        <div class="empty-icon">🖥️</div>
        <p>{{ t('battery.noBattery') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const { ipcRenderer } = window.require("electron")

const batteryInfo = ref({
  hasBattery: false,
  percent: 0,
  isCharging: false,
  timeRemaining: null,
  designedCapacity: null,
  maxCapacity: null,
  currentCapacity: null
})

const fetchBatteryInfo = async () => {
  try {
    const info = await ipcRenderer.invoke('get-battery-info')
    console.log("🚀 ~ fetchBatteryInfo ~ info:", info)
    batteryInfo.value = info
  } catch (error) {
    console.error('获取电池信息失败:', error)
  }
}

const getBatteryClass = () => {
  const percent = batteryInfo.value.percent
  if (percent <= 20) return 'battery-low'
  if (percent <= 50) return 'battery-medium'
  return 'battery-high'
}

const getHealthClass = () => {
  const health = getHealthpercent()
  if (health >= 90) return 'health-good'
  if (health >= 70) return 'health-medium'
  return 'health-poor'
}

const getHealthpercent = () => {
  if (!batteryInfo.value.maxCapacity || !batteryInfo.value.designedCapacity) {
    return 'N/A'    
  }
  return ((batteryInfo.value.maxCapacity / batteryInfo.value.designedCapacity) * 100).toFixed(1) + '%'
}

const formatTimeRemaining = () => {
  const remaining = batteryInfo.value.timeRemaining
  if (remaining === null || remaining === undefined) {
    return t('battery.calculating')
  }
  if (remaining === -1) {
    return t('battery.charging')
  }
  const hours = Math.floor(remaining / 60)
  const minutes = remaining % 60
  return `${hours} ${t('time.hours')} ${minutes} ${t('time.minutes')}`
}

const formatCapacity = (capacity) => {
  if (!capacity) return 'N/A'
  return capacity + ' mAh'
}

onMounted(() => {
  fetchBatteryInfo()
})
</script>

<style scoped>
.battery-status {
  width: 100%;
}

.monitor-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 20px;
  background: linear-gradient(135deg, #f39c12 0%, #e74c3c 100%);
  color: white;
}

.card-icon {
  font-size: 1.3rem;
}

.card-header h3 {
  flex: 1;
  margin: 0;
  font-size: 1.1rem;
}

.card-body {
  padding: 20px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.empty-state p {
  color: #666;
  font-size: 1rem;
}

.battery-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.battery-icon-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.battery-icon {
  width: 100px;
  height: 50px;
  border: 3px solid #333;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  background: #f8f9fa;
}

.battery-icon::after {
  content: '';
  position: absolute;
  top: 50%;
  right: -8px;
  transform: translateY(-50%);
  width: 5px;
  height: 20px;
  background: #333;
  border-radius: 0 3px 3px 0;
}

.battery-level {
  height: 100%;
  transition: width 0.3s ease;
}

.battery-high .battery-level {
  background: linear-gradient(90deg, #28a745, #98fb98);
}

.battery-medium .battery-level {
  background: linear-gradient(90deg, #ffc107, #ffec8b);
}

.battery-low .battery-level {
  background: linear-gradient(90deg, #dc3545, #ff6b6b);
}

.battery-percent {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
}

.battery-status-text {
  margin-top: 10px;
}

.status-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.status-badge.charging {
  background: #d4edda;
  color: #155724;
}

.status-badge.discharging {
  background: #fff3cd;
  color: #856404;
}

.battery-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  color: #666;
  font-weight: 500;
}

.detail-value {
  color: #333;
  font-weight: 600;
}

.detail-value.health-good {
  color: #28a745;
}

.detail-value.health-medium {
  color: #ffc107;
}

.detail-value.health-poor {
  color: #dc3545;
}

@media (max-width: 768px) {
  .battery-icon {
    width: 80px;
    height: 40px;
  }
  
  .battery-percent {
    font-size: 1.5rem;
  }
}
</style>
