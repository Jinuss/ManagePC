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

    return exports;
}

NODE_API_MODULE(system, Init)
