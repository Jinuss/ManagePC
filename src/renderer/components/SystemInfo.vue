<template>
  <div class="system-info">
    <h2 class="section-title">📡 网络信息</h2>
    <div class="network-cards">
      <div class="network-card" v-for="(info, index) in networkInfo" :key="index">
        <div class="card-header">
          <span class="interface-name">{{ info.interface }}</span>
        </div>
        <div class="card-body">
          <div class="info-item">
            <span class="label">IP 地址:</span>
            <span class="value ip-value">{{ info.ipAddress }}</span>
          </div>
          <div class="info-item">
            <span class="label">MAC 地址:</span>
            <span class="value mac-value">{{ info.macAddress }}</span>
          </div>
          <div class="info-item">
            <span class="label">子网掩码:</span>
            <span class="value">{{ info.netmask }}</span>
          </div>
        </div>
      </div>
    </div>

    <h2 class="section-title">🔑 SSH 公钥</h2>
    <div class="ssh-card">
      <div class="ssh-content">
        <pre class="ssh-key">{{ sshKey }}</pre>
      </div>
      <button class="copy-btn" @click="copySSHKey">
        {{ copied ? '✓ 已复制' : '📋 复制' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const { ipcRenderer } = window.require('electron')

const networkInfo = ref([])
const sshKey = ref('')
const copied = ref(false)

const fetchNetworkInfo = async () => {
  try {
    const info = await ipcRenderer.invoke('get-network-info')
    networkInfo.value = info
  } catch (error) {
    console.error('获取网络信息失败:', error)
    networkInfo.value = [{ interface: 'Error', ipAddress: '获取失败', macAddress: '-', netmask: '-' }]
  }
}

const fetchSSHKey = async () => {
  try {
    const key = await ipcRenderer.invoke('get-ssh-key')
    sshKey.value = key
  } catch (error) {
    console.error('获取 SSH key 失败:', error)
    sshKey.value = '获取失败'
  }
}

const copySSHKey = async () => {
  try {
    await navigator.clipboard.writeText(sshKey.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    console.error('复制失败:', error)
  }
}

onMounted(() => {
  fetchNetworkInfo()
  fetchSSHKey()
})
</script>

<style scoped>
.system-info {
  padding: 20px;
}

.section-title {
  font-size: 1.4rem;
  color: #333;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.network-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
}

.network-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  min-width: 300px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-header {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #667eea;
}

.interface-name {
  font-weight: bold;
  color: #667eea;
  font-size: 1.1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.label {
  color: #666;
  font-size: 0.9rem;
}

.value {
  color: #333;
  font-weight: 500;
  font-family: 'Consolas', 'Monaco', monospace;
}

.ip-value {
  color: #28a745;
}

.mac-value {
  color: #17a2b8;
}

.ssh-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.ssh-content {
  background: #2d2d2d;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  overflow-x: auto;
}

.ssh-key {
  color: #e0e0e0;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.85rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}

.copy-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.copy-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.copy-btn:active {
  transform: translateY(0);
}
</style>
