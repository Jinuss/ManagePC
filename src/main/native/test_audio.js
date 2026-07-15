const system = require("./build/Release/system.node");

console.log("=== Test Get Speaker Volume ===");
const speakerVolume = system.getSpeakerVolume();
if (speakerVolume.success) {
    console.log(`Speaker Volume: ${speakerVolume.volume}%, Muted: ${speakerVolume.isMuted ? "Yes" : "No"}`);
} else {
    console.log(`Get failed: ${speakerVolume.error}`);
}

console.log("\n=== Test Get Microphone Volume ===");
const micVolume = system.getMicrophoneVolume();
if (micVolume.success) {
    console.log(`Microphone Volume: ${micVolume.volume}%, Muted: ${micVolume.isMuted ? "Yes" : "No"}`);
} else {
    console.log(`Get failed: ${micVolume.error}`);
}

console.log("\n=== Test Set Speaker Volume to 50% ===");
const testSpeakerVolume = 50;
console.log(`Attempting to set speaker volume: ${testSpeakerVolume}%`);
const setSpeakerResult = system.setSpeakerVolume(testSpeakerVolume);
console.log(`Set result: ${setSpeakerResult ? "Success" : "Failed"}`);

const speakerVolumeAfter = system.getSpeakerVolume();
if (speakerVolumeAfter.success) {
    console.log(`Speaker Volume after set: ${speakerVolumeAfter.volume}%, Muted: ${speakerVolumeAfter.isMuted ? "Yes" : "No"}`);
}

console.log("\n=== Test Set Microphone Volume to 0% (should mute) ===");
const testMicVolume0 = 0;
console.log(`Attempting to set microphone volume: ${testMicVolume0}%`);
const setMicResult0 = system.setMicrophoneVolume(testMicVolume0);
console.log(`Set result: ${setMicResult0 ? "Success" : "Failed"}`);

const micVolumeAfter0 = system.getMicrophoneVolume();
if (micVolumeAfter0.success) {
    console.log(`Microphone Volume after set to 0: ${micVolumeAfter0.volume}%, Muted: ${micVolumeAfter0.isMuted ? "Yes" : "No"}`);
}

console.log("\n=== Test Set Microphone Volume to 70% (should unmute) ===");
const testMicVolume70 = 70;
console.log(`Attempting to set microphone volume: ${testMicVolume70}%`);
const setMicResult70 = system.setMicrophoneVolume(testMicVolume70);
console.log(`Set result: ${setMicResult70 ? "Success" : "Failed"}`);

const micVolumeAfter70 = system.getMicrophoneVolume();
if (micVolumeAfter70.success) {
    console.log(`Microphone Volume after set to 70: ${micVolumeAfter70.volume}%, Muted: ${micVolumeAfter70.isMuted ? "Yes" : "No"}`);
}

console.log("\n=== Test Set Speaker Volume to 0% (should mute) ===");
const testSpeakerVolume0 = 0;
console.log(`Attempting to set speaker volume: ${testSpeakerVolume0}%`);
const setSpeakerResult0 = system.setSpeakerVolume(testSpeakerVolume0);
console.log(`Set result: ${setSpeakerResult0 ? "Success" : "Failed"}`);

const speakerVolumeAfter0 = system.getSpeakerVolume();
if (speakerVolumeAfter0.success) {
    console.log(`Speaker Volume after set to 0: ${speakerVolumeAfter0.volume}%, Muted: ${speakerVolumeAfter0.isMuted ? "Yes" : "No"}`);
}

console.log("\n=== Restore Speaker Volume ===");
system.setSpeakerVolume(50);
console.log("Speaker volume restored to 50%");
