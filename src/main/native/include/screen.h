#pragma once

#include <napi.h>

Napi::Object GetScreenSize(const Napi::CallbackInfo& info);

Napi::Array GetAllScreenResolutions(const Napi::CallbackInfo& info);

Napi::Boolean SetScreenResolution(const Napi::CallbackInfo& info);

Napi::Boolean StartResolutionNotification(const Napi::CallbackInfo& info);

Napi::Boolean StopResolutionNotification(const Napi::CallbackInfo& info);