#include <napi.h>
#include <screen.h>
#include <audio.h>

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
    exports.Set(
        "getScreenSize",
        Napi::Function::New(env, GetScreenSize));

    exports.Set(
        "getAllScreenResolutions",
        Napi::Function::New(env, GetAllScreenResolutions));

    exports.Set(
        "setScreenResolution",
        Napi::Function::New(env, SetScreenResolution));

    exports.Set(
        "startResolutionNotification",
        Napi::Function::New(env, StartResolutionNotification));

    exports.Set(
        "stopResolutionNotification",
        Napi::Function::New(env, StopResolutionNotification));

    exports.Set(
        "getSpeakerVolume",
        Napi::Function::New(env, GetSpeakerVolume));

    exports.Set(
        "setSpeakerVolume",
        Napi::Function::New(env, SetSpeakerVolume));

    exports.Set(
        "getMicrophoneVolume",
        Napi::Function::New(env, GetMicrophoneVolume));

    exports.Set(
        "setMicrophoneVolume",
        Napi::Function::New(env, SetMicrophoneVolume));

    exports.Set(
        "startVolumeNotification",
        Napi::Function::New(env, StartVolumeNotification));

    exports.Set(
        "stopVolumeNotification",
        Napi::Function::New(env, StopVolumeNotification));

    return exports;
}

NODE_API_MODULE(system, Init)
