<template>
  <div class="pc-monitor">
    <div class="monitor-grid">
      <TrendCharts
        :cpu-history="cpuHistory"
        :memory-history="memoryHistory"
        :network-history="networkHistory"
      />

      <StaticInfo :system-info="systemInfo" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import TrendCharts from "./TrendCharts.vue";
import StaticInfo from "./StaticInfo.vue";
import { updateHistory } from "../utils/helpers";

const { ipcRenderer } = window.require("electron");

const MAX_HISTORY = 30;

const cpuHistory = ref([]);
const memoryHistory = ref([]);
const networkHistory = ref([]);

const systemInfo = ref({});

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

const fetchSystemInfo = async () => {
  try {
    const data = await ipcRenderer.invoke("get-system-info");
    console.log("🚀 ~ fetchSystemInfo ~ data:", data)
    systemInfo.value = data;
  } catch (error) {
    console.error("获取系统信息失败:", error);
  }
};

onMounted(async () => {
  await fetchSystemInfo();

  ipcRenderer.on("system-stats", handleSystemStats);

  await ipcRenderer.invoke("start-monitoring", 1000);
});

onUnmounted(async () => {
  ipcRenderer.removeListener("system-stats", handleSystemStats);

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  await ipcRenderer.invoke("stop-monitoring");
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
