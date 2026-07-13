#include <napi.h>
#include <screen.h>

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

    return exports;
}

NODE_API_MODULE(system, Init)