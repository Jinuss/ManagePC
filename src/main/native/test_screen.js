const system = require("./build/Release/system.node");

console.log("=== Test Get Current Screen Resolution ===");
const screenSize = system.getScreenSize();
console.log(`Width: ${screenSize.width}, Height: ${screenSize.height}`);

console.log("\n=== Test Get All Screen Resolutions ===");
const resolutions = system.getAllScreenResolutions();
console.log(`Found ${resolutions.length} resolutions:`);
for (let i = 0; i < resolutions.length; i++) {
    console.log(`${i + 1}. ${resolutions[i].width} x ${resolutions[i].height}`);
}

console.log("\n=== Test Set Screen Resolution ===");
const testWidth = 1280;
const testHeight = 720;
console.log(`Attempting to set resolution: ${testWidth} x ${testHeight}`);
const setResult = system.setScreenResolution(testWidth, testHeight);
console.log(`Set result: ${setResult ? "Success" : "Failed"}`);

console.log("\n=== Restore Original Resolution ===");
system.setScreenResolution(1920, 1080);
console.log("Resolution restored to 1920x1080");
