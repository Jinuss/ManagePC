export default {
  common: {
    refresh: '刷新',
    ok: '确定',
    cancel: '取消',
    loading: '加载中...',
    unknown: '未知',
    empty: '空'
  },
  header: {
    title: '系统监控',
    subtitle: 'System Monitor'
  },
  cpu: {
    title: 'CPU 使用率',
    label: 'CPU',
    unit: '%',
    core: '核心',
    usage: '使用率'
  },
  memory: {
    title: '内存使用率',
    label: '内存',
    unit: '%',
    used: '已使用',
    total: '总计',
    available: '可用'
  },
  network: {
    title: '网络流量',
    label: '网络',
    received: '接收',
    sent: '发送',
    unit: 'Kbps',
    interface: '网络接口',
    status: '状态'
  },
  disk: {
    title: '磁盘使用',
    label: '磁盘',
    used: '已用',
    total: '总计',
    free: '可用',
    type: '类型',
    local: '本地磁盘',
    network: '网络位置'
  },
  networkInfo: {
    title: '网络接口',
    ip: 'IP 地址',
    mac: 'MAC 地址',
    interface: '接口名称',
    status: '状态'
  },
  system: {
    title: '系统信息',
    version: '版本',
    hostname: '主机名',
    os: '操作系统',
    cpu: 'CPU',
    cores: '核心数',
    uptime: '运行时间',
    memory: '内存',
    ssh: 'SSH 密钥',
    platform: '平台',
    arch: '架构'
  },
  status: {
    online: '在线',
    offline: '离线',
    connected: '已连接',
    disconnected: '已断开'
  },
  error: {
    title: '错误',
    fetchFailed: '获取数据失败',
    diskError: '获取磁盘信息失败',
    networkError: '获取网络信息失败',
    systemError: '获取系统信息失败',
    sshError: '获取 SSH 密钥失败'
  },
  time: {
    seconds: '秒',
    minutes: '分钟',
    hours: '小时',
    days: '天',
    weeks: '周',
    months: '月',
    years: '年'
  }
}
