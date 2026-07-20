#pragma once

#include <napi.h>

Napi::Object GetSpeakerVolume(const Napi::CallbackInfo& info);

Napi::Boolean SetSpeakerVolume(const Napi::CallbackInfo& info);

Napi::Object GetMicrophoneVolume(const Napi::CallbackInfo& info);

Napi::Boolean SetMicrophoneVolume(const Napi::CallbackInfo& info);

Napi::Boolean StartVolumeNotification(const Napi::CallbackInfo& info);

Napi::Boolean StopVolumeNotification(const Napi::CallbackInfo& info);