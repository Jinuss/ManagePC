<template>
  <div class="trend-charts">
    <div class="monitor-card">
      <TrendChart 
        :title="t('cpu.title')" 
        icon="🖥️" 
        :data="cpuHistory" 
        color="#667eea"
      />
    </div>

    <div class="monitor-card">
      <TrendChart 
        :title="t('memory.title')" 
        icon="💾" 
        :data="memoryHistory" 
        color="#28a745"
      />
    </div>

    <div class="monitor-card">
      <TrendChart 
        :title="t('network.title')" 
        icon="🌐" 
        :data="networkHistory" 
        :colors="['#28a745', '#17a2b8']"
        :has-multiple-series="true"
        :series-names="[t('network.received'), t('network.sent')]"
      />
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import TrendChart from './TrendChart.vue'

const { t } = useI18n()

defineProps({
  cpuHistory: {
    type: Array,
    required: true
  },
  memoryHistory: {
    type: Array,
    required: true
  },
  networkHistory: {
    type: Array,
    required: true
  }
})
</script>

<style scoped>
.trend-charts {
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
</style>
