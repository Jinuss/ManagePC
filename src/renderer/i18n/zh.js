export default {
  common: {
    refresh: '刷新',
    ok: '确定',
    cancel: '取消',
    loading: '加载中...',
    unknown: '未知',
    empty: '空',
    yes: '是',
    no: '否',
    copy: '📋 复制',
    copied: '✓ 已复制',
    fetchFailed: '获取失败',
    checkUpdate: '更新',
    settings: '设置',
    minimize: '最小化',
    maximize: '最大化',
    restore: '还原',
    close: '关闭',
    pin: '置顶',
    unpin: '取消置顶'
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
    network: '网络位置',
    usage: '磁盘使用情况',
    totalSize: '总容量',
    noDisk: '未检测到磁盘信息'
  },
  networkInfo: {
    title: '网络信息',
    ip: 'IP 地址',
    mac: 'MAC 地址',
    interface: '接口名称',
    status: '状态',
    subnetMask: '子网掩码',
    dhcp: 'DHCP'
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
  ssh: {
    title: 'SSH 公钥',
    copySuccess: '复制成功',
    copyFailed: '复制失败'
  },
  menu: {
    monitoring: '系统监控',
    system: '系统信息',
    network: '网络信息',
    disk: '磁盘使用',
    battery: '电池状态',
    monitor: '性能监控',
    logs: '日志查看'
  },
  battery: {
    title: '电池状态',
    charging: '充电中',
    discharging: '放电中',
    voltage: '电压',
    current: '当前容量',
    max: '最大容量',
    design: '设计容量',
    health: '电池健康度',
    noBattery: '未检测到电池',
    calculating: '计算中...'
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
  },
  settings: {
    title: '设置',
    common: '通用设置',
    language: '语言',
    theme: '主题设置',
    update: '更新',
    about: '关于',
    version: '版本信息',
    noUpdate: '当前已是最新版本',
    updateError: '检查更新失败',
    checkingUpdate: '检查更新中...',
    downloading: '下载中...',
    downloadNow: '立即下载',
    remindLater: '稍后提醒',
    restartNow: '立即重启',
    restartLater: '稍后重启',
    releaseNotes: '更新说明',
    updateAvailable: '发现新版本',
    updateAvailable: '发现新版本',
    updateDownloaded: '更新已下载',
    updateDownloadedMessage: '更新已下载完成，是否立即重启应用？',
    autoStart: '开机自启动',
    autoStartDescription: '开机时自动启动应用',
    themeLight: '亮色',
    themeDark: '暗色',
    themeSystem: '跟随系统'
  },
  logViewer: {
    title: '日志查看',
    refresh: '刷新',
    clear: '清空',
    lines: '行数',
    size: '大小',
    empty: '暂无日志',
    loadError: '加载日志失败',
    clearSuccess: '日志已清空'
  }
}
