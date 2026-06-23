<template>
  <div class="pc-monitor">
    <div class="monitor-grid">
      <TrendCharts
        :cpu-history="cpuHistory"
        :memory-history="memoryHistory"
        :network-history="networkHistory"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, onActivated, onDeactivated } from "vue";
import TrendCharts from "./TrendCharts.vue";
import { updateHistory } from "../utils/helpers";

defineOptions({ name: 'PCMonitor' });

const electronAPI = window.electronAPI;

const MAX_HISTORY = 30;

const cpuHistory = ref([]);
const memoryHistory = ref([]);
const networkHistory = ref([]);

const targetValues = {
  cpu: 0,
  memory: 0,
  network: { recv: 0, sent: 0 },
};

const currentValues = {
  cpu: 0,
  memory: 0,
  network: { recv: 0, sent: 0 },
};

let animationFrameId = null;
let dataBuffer = null;
let pendingUpdate = false;

const lerp = (start, end, factor) => {
  return start + (end - start) * factor;
};

const render = () => {
  pendingUpdate = false;

  if (!dataBuffer) return;

  const { cpu, mem, network } = dataBuffer;

  targetValues.cpu = parseFloat(cpu.usage);
  targetValues.memory = parseFloat(mem.used);
  targetValues.network.recv = network.recvKbps;
  targetValues.network.sent = network.sentKbps;

  const smoothFactor = 0.15;

  currentValues.cpu = lerp(currentValues.cpu, targetValues.cpu, smoothFactor);
  currentValues.memory = lerp(
    currentValues.memory,
    targetValues.memory,
    smoothFactor,
  );
  currentValues.network.recv = lerp(
    currentValues.network.recv,
    targetValues.network.recv,
    smoothFactor,
  );
  currentValues.network.sent = lerp(
    currentValues.network.sent,
    targetValues.network.sent,
    smoothFactor,
  );

  updateHistory(
    cpuHistory.value,
    parseFloat(currentValues.cpu.toFixed(1)),
    MAX_HISTORY,
  );
  updateHistory(
    memoryHistory.value,
    parseFloat(currentValues.memory.toFixed(1)),
    MAX_HISTORY,
  );
  updateHistory(
    networkHistory.value,
    {
      recv: parseFloat(currentValues.network.recv.toFixed(1)),
      sent: parseFloat(currentValues.network.sent.toFixed(1)),
    },
    MAX_HISTORY,
  );
};

const handleSystemStats = (event, data) => {
  dataBuffer = data;

  if (!pendingUpdate) {
    pendingUpdate = true;
    animationFrameId = requestAnimationFrame(render);
  }
};

let removeListener = null;

onMounted(() => {
  removeListener = electronAPI.onSystemStats(handleSystemStats);
});

onActivated(async () => {
  await electronAPI.startMonitoring(1000);
});

onDeactivated(async () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  await electronAPI.stopMonitoring();
});

onUnmounted(() => {
  if (removeListener) {
    removeListener();
    removeListener = null;
  }
});
</script>

<style scoped>
.pc-monitor {
  width: 100%;
}

.monitor-grid {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

@media (min-width: 1200px) {
  .monitor-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}
</style>
