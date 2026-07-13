const system = require("./build/Release/system.node");

console.log("=== 测试获取当前屏幕分辨率 ===");
const screenSize = system.getScreenSize();
console.log(`宽度: ${screenSize.width}, 高度: ${screenSize.height}`);

console.log("\n=== 测试获取所有屏幕分辨率 ===");
const resolutions = system.getAllScreenResolutions();
console.log(`共找到 ${resolutions.length} 种分辨率:`);
for (let i = 0; i < resolutions.length; i++) {
    console.log(`${i + 1}. ${resolutions[i].width} x ${resolutions[i].height}`);
}

console.log("\n=== 测试设置屏幕分辨率 ===");
const testWidth = 1280;
const testHeight = 720;
console.log(`尝试设置分辨率: ${testWidth} x ${testHeight}`);
const setResult = system.setScreenResolution(testWidth, testHeight);
console.log(`设置结果: ${setResult ? "成功" : "失败"}`);