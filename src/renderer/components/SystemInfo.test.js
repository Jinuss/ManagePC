const { mount } = require("@vue/test-utils")
const SystemInfo = require("./SystemInfo.vue").default

jest.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key) => ({
      "networkInfo.title": "网络信息",
      "networkInfo.ip": "IP地址",
      "networkInfo.mac": "MAC地址",
      "networkInfo.subnetMask": "子网掩码",
      "networkInfo.dhcp": "DHCP",
      "ssh.title": "SSH密钥",
      "common.yes": "是",
      "common.no": "否",
      "common.copy": "复制",
      "common.copied": "已复制",
      "common.fetchFailed": "获取失败",
      "error.title": "错误"
    }[key] || key)
  })
}))

describe("SystemInfo", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const waitForNextTick = async () => {
    await new Promise(resolve => setTimeout(resolve, 0))
  }

  test("should render network info correctly", async () => {
    const mockNetworkInfo = [
      {
        interface: "Ethernet",
        ipAddress: "192.168.1.100",
        macAddress: "AA:BB:CC:DD:EE:FF",
        netmask: "255.255.255.0",
        dhcp: true
      }
    ]
    global.electronAPI.getNetworkInfo.mockResolvedValue(mockNetworkInfo)
    global.electronAPI.getSSHKey.mockResolvedValue("ssh-rsa AAAAB3Nza...")

    const wrapper = mount(SystemInfo)
    await waitForNextTick()

    const networkCards = wrapper.findAll(".network-card")
    expect(networkCards.length).toBe(1)
    expect(networkCards[0].find(".interface-name").text()).toBe("Ethernet")
    expect(networkCards[0].find(".ip-value").text()).toBe("192.168.1.100")
    expect(networkCards[0].find(".mac-value").text()).toBe("AA:BB:CC:DD:EE:FF")
  })

  test("should render error state when network fetch fails", async () => {
    global.electronAPI.getNetworkInfo.mockRejectedValue(new Error("Network error"))
    global.electronAPI.getSSHKey.mockResolvedValue("")

    const wrapper = mount(SystemInfo)
    await waitForNextTick()

    const networkCards = wrapper.findAll(".network-card")
    expect(networkCards.length).toBe(1)
    expect(networkCards[0].find(".interface-name").text()).toBe("错误")
    expect(networkCards[0].find(".ip-value").text()).toBe("获取失败")
  })

  test("should render SSH key correctly", async () => {
    global.electronAPI.getNetworkInfo.mockResolvedValue([])
    global.electronAPI.getSSHKey.mockResolvedValue("ssh-rsa AAAAB3Nza...")

    const wrapper = mount(SystemInfo)
    await waitForNextTick()

    expect(wrapper.find(".ssh-key").text()).toBe("ssh-rsa AAAAB3Nza...")
  })

  test("should display fetch failed when SSH key fetch fails", async () => {
    global.electronAPI.getNetworkInfo.mockResolvedValue([])
    global.electronAPI.getSSHKey.mockRejectedValue(new Error("SSH error"))

    const wrapper = mount(SystemInfo)
    await waitForNextTick()

    expect(wrapper.find(".ssh-key").text()).toBe("获取失败")
  })

  test("should show copied state after clicking copy button", async () => {
    global.electronAPI.getNetworkInfo.mockResolvedValue([])
    global.electronAPI.getSSHKey.mockResolvedValue("ssh-rsa AAAAB3Nza...")
    
    const originalClipboard = navigator.clipboard
    navigator.clipboard = {
      writeText: jest.fn().mockResolvedValue()
    }

    const wrapper = mount(SystemInfo)
    await waitForNextTick()

    const copyBtn = wrapper.find(".copy-btn")
    expect(copyBtn.text()).toBe("复制")
    
    await copyBtn.trigger("click")
    await waitForNextTick()
    
    expect(copyBtn.text()).toBe("已复制")
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("ssh-rsa AAAAB3Nza...")

    navigator.clipboard = originalClipboard
  })

  test("should handle copy error gracefully", async () => {
    global.electronAPI.getNetworkInfo.mockResolvedValue([])
    global.electronAPI.getSSHKey.mockResolvedValue("ssh-rsa AAAAB3Nza...")
    
    const originalClipboard = navigator.clipboard
    navigator.clipboard = {
      writeText: jest.fn().mockRejectedValue(new Error("Copy error"))
    }

    const wrapper = mount(SystemInfo)
    await waitForNextTick()

    const copyBtn = wrapper.find(".copy-btn")
    await copyBtn.trigger("click")
    await waitForNextTick()
    
    expect(copyBtn.text()).toBe("复制")

    navigator.clipboard = originalClipboard
  })

  test("should match snapshot", async () => {
    global.electronAPI.getNetworkInfo.mockResolvedValue([
      {
        interface: "Ethernet",
        ipAddress: "192.168.1.100",
        macAddress: "AA:BB:CC:DD:EE:FF",
        netmask: "255.255.255.0",
        dhcp: true
      }
    ])
    global.electronAPI.getSSHKey.mockResolvedValue("ssh-rsa AAAAB3Nza...")

    const wrapper = mount(SystemInfo)
    await waitForNextTick()

    expect(wrapper.html()).toMatchSnapshot()
  })
})
