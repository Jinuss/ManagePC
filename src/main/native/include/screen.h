#pragma once

#include <napi.h>

// 获取当前分辨率
Napi::Object GetScreenSize(const Napi::CallbackInfo& info);

// 获取所有分辨率
Napi::Array GetAllScreenResolutions(const Napi::CallbackInfo& info);

// 设置分辨率
Napi::Boolean SetScreenResolution(const Napi::CallbackInfo& info);