<template>
  <div class="static-info">
    <div class="monitor-card system-card">
      <div class="card-header">
        <span class="card-icon">📊</span>
        <h3>{{ t('system.title') }}</h3>
      </div>
      <div class="card-body">
        <div class="system-info">
          <div class="info-row">
            <span class="info-label">{{ t('system.hostname') }}:</span>
            <span class="info-value">{{ systemInfo?.hostname || t('common.unknown') }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('system.os') }}:</span>
            <span class="info-value">{{ systemInfo?.distro || t('common.unknown') }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('system.platform') }}:</span>
            <span class="info-value">{{ systemInfo?.platform || t('common.unknown') }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('system.cpu') }}:</span>
            <span class="info-value cpu">{{ systemInfo?.cpuModel || t('common.unknown') }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('system.cores') }}:</span>
            <span class="info-value">{{ systemInfo?.cpuCores || t('common.unknown') }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('system.uptime') }}:</span>
            <span class="info-value">{{ formatUptime(systemInfo?.uptime) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('system.memory') }}:</span>
            <span class="info-value">{{ systemInfo?.totalMemory || t('common.unknown') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from 'vue-i18n'
import { formatUptime } from '../utils/helpers'

const { t } = useI18n()

const systemInfo = ref({});

const fetchSystemInfo = async () => {
  try {
    const data = await window.electronAPI.getSystemInfo();
    systemInfo.value = data;
  } catch (error) {
    console.error("获取系统信息失败:", error);
  }
};

onMounted(async () => {
  await fetchSystemInfo();
})

</script>

<style scoped>
.static-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.refresh-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all 0.3s;
}

.refresh-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(180deg);
}

.card-body {
  padding: 20px;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 20px;
}

.disk-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.disk-item {
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
}

.disk-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.disk-name {
  font-weight: 600;
  color: #333;
}

.disk-type {
  font-size: 0.8rem;
  color: #666;
  background: #e9ecef;
  padding: 2px 8px;
  border-radius: 10px;
}

.disk-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  min-width: 45px;
  text-align: right;
}

.disk-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #666;
}

.network-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.network-item {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.network-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.network-name {
  font-weight: 600;
  color: #333;
}

.network-status {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.network-status.online,
.network-status.connected {
  background: #d4edda;
  color: #155724;
}

.network-status.offline,
.network-status.disconnected {
  background: #f8d7da;
  color: #721c24;
}

.network-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item {
  display: flex;
  gap: 8px;
  font-size: 0.9rem;
}

.detail-label {
  color: #666;
  font-weight: 500;
}

.detail-value {
  color: #333;
  font-family: monospace;
}

.detail-value.mac {
  font-size: 0.85rem;
}

.system-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  color: #666;
  font-weight: 500;
}

.info-value {
  color: #333;
  font-weight: 600;
}

.info-value.cpu {
  font-size: 0.9rem;
}

.info-row.ssh-row {
  word-break: break-all;
}

.info-value.ssh {
  font-family: monospace;
  font-size: 0.8rem;
  max-width: 200px;
  text-align: right;
}

@media (max-width: 768px) {
  .static-info {
    grid-template-columns: 1fr;
  }
}
</style>
