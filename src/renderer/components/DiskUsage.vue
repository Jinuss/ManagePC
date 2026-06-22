<template>
  <div class="disk-usage">
    <div class="header">
      <h2 class="section-title">💾 {{ t('disk.usage') }}</h2>
      <button class="refresh-btn" @click="fetchDiskUsage">🔄 {{ t('common.refresh') }}</button>
    </div>

    <div class="disk-list" v-if="diskList.length > 0">
      <div class="disk-card" v-for="(disk, index) in diskList" :key="index">
        <div class="disk-header">
          <span class="disk-name">{{ disk.drive }}</span>
          <span :class="['status', getStatusClass(disk.percentage)]">
            {{ disk.percentage.toFixed(1) }}%
          </span>
        </div>

        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{
              width: disk.percentage + '%',
              background: getProgressColor(disk.percentage),
            }"
          ></div>
        </div>

        <div class="disk-info">
          <div class="info-item">
            <span class="label">{{ t('disk.totalSize') }}:</span>
            <span class="value">{{ disk.total }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ t('disk.used') }}:</span>
            <span class="value used">{{ disk.used }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ t('disk.free') }}:</span>
            <span class="value free">{{ disk.free }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <div class="empty-icon">📁</div>
      <p>{{ t('disk.noDisk') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const { ipcRenderer } = window.require("electron");

const diskList = ref([]);

const fetchDiskUsage = async () => {
  try {
    const diskInfo = await ipcRenderer.invoke("get-disk-usage");
    diskList.value = diskInfo;
  } catch (error) {
    console.error("获取磁盘信息失败:", error);
    diskList.value = [];
  }
};

const getStatusClass = (percentage) => {
  if (percentage >= 90) return "danger";
  if (percentage >= 70) return "warning";
  return "normal";
};

const getProgressColor = (percentage) => {
  if (percentage >= 90) return "linear-gradient(90deg, #dc3545, #ff6b6b)";
  if (percentage >= 70) return "linear-gradient(90deg, #ffc107, #ffec8b)";
  return "linear-gradient(90deg, #28a745, #98fb98)";
};

onMounted(() => {
  fetchDiskUsage();
});
</script>

<style scoped>
.disk-usage {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 1.4rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.refresh-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.refresh-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.disk-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.disk-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.disk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.disk-name {
  font-weight: bold;
  color: #333;
  font-size: 1.1rem;
}

.status {
  font-weight: bold;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
}

.status.normal {
  background: #d4edda;
  color: #155724;
}

.status.warning {
  background: #fff3cd;
  color: #856404;
}

.status.danger {
  background: #f8d7da;
  color: #721c24;
}

.progress-bar {
  height: 12px;
  background: #e9ecef;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 15px;
}

.progress-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.5s ease;
}

.disk-info {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-size: 0.8rem;
  color: #666;
}

.value {
  font-family: "Consolas", "Monaco", monospace;
  font-weight: 500;
  color: #333;
}

.value.used {
  color: #dc3545;
}

.value.free {
  color: #28a745;
}

.empty-state {
  text-align: center;
  padding: 40px;
  background: #f8f9fa;
  border-radius: 12px;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.empty-state p {
  color: #666;
  font-size: 1rem;
}
</style>
