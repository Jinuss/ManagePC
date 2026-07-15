#include <napi.h>
#include <windows.h>
#include <mmdeviceapi.h>
#include <endpointvolume.h>

#pragma comment(lib, "ole32.lib")
#pragma comment(lib, "mmdevapi.lib")

Napi::Object GetSpeakerVolume(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();
    Napi::Object result = Napi::Object::New(env);

    HRESULT hr = CoInitializeEx(NULL, COINIT_MULTITHREADED);
    bool comInitialized = (hr == S_OK);

    IMMDeviceEnumerator* pEnumerator = NULL;
    hr = CoCreateInstance(__uuidof(MMDeviceEnumerator), NULL, CLSCTX_ALL, __uuidof(IMMDeviceEnumerator), (void**)&pEnumerator);
    if (FAILED(hr)) {
        result.Set("success", false);
        result.Set("error", "Failed to create device enumerator");
        if (comInitialized) CoUninitialize();
        return result;
    }

    IMMDevice* pDevice = NULL;
    hr = pEnumerator->GetDefaultAudioEndpoint(eRender, eConsole, &pDevice);
    if (FAILED(hr)) {
        result.Set("success", false);
        result.Set("error", "Failed to get default audio endpoint");
        pEnumerator->Release();
        if (comInitialized) CoUninitialize();
        return result;
    }

    IAudioEndpointVolume* pEndpointVolume = NULL;
    hr = pDevice->Activate(__uuidof(IAudioEndpointVolume), CLSCTX_ALL, NULL, (void**)&pEndpointVolume);
    if (FAILED(hr)) {
        result.Set("success", false);
        result.Set("error", "Failed to activate audio endpoint");
        pDevice->Release();
        pEnumerator->Release();
        if (comInitialized) CoUninitialize();
        return result;
    }

    BOOL isMuted = FALSE;
    hr = pEndpointVolume->GetMute(&isMuted);
    if (FAILED(hr)) {
        result.Set("success", false);
        result.Set("error", "Failed to get mute status");
        pEndpointVolume->Release();
        pDevice->Release();
        pEnumerator->Release();
        if (comInitialized) CoUninitialize();
        return result;
    }

    float volume = 0.0f;
    hr = pEndpointVolume->GetMasterVolumeLevelScalar(&volume);
    if (FAILED(hr)) {
        result.Set("success", false);
        result.Set("error", "Failed to get volume");
        pEndpointVolume->Release();
        pDevice->Release();
        pEnumerator->Release();
        if (comInitialized) CoUninitialize();
        return result;
    }

    result.Set("success", true);
    result.Set("volume", (int)(volume * 100));
    result.Set("isMuted", isMuted != FALSE);

    pEndpointVolume->Release();
    pDevice->Release();
    pEnumerator->Release();
    if (comInitialized) CoUninitialize();

    return result;
}

Napi::Boolean SetSpeakerVolume(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();

    if (info.Length() < 1) {
        Napi::TypeError::New(env, "Expected volume parameter").ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }

    if (!info[0].IsNumber()) {
        Napi::TypeError::New(env, "volume must be a number").ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }

    int volume = info[0].As<Napi::Number>().Int32Value();
    if (volume < 0 || volume > 100) {
        Napi::TypeError::New(env, "volume must be between 0 and 100").ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }

    HRESULT hr = CoInitializeEx(NULL, COINIT_MULTITHREADED);
    bool comInitialized = (hr == S_OK);

    IMMDeviceEnumerator* pEnumerator = NULL;
    hr = CoCreateInstance(__uuidof(MMDeviceEnumerator), NULL, CLSCTX_ALL, __uuidof(IMMDeviceEnumerator), (void**)&pEnumerator);
    if (FAILED(hr)) {
        if (comInitialized) CoUninitialize();
        return Napi::Boolean::New(env, false);
    }

    IMMDevice* pDevice = NULL;
    hr = pEnumerator->GetDefaultAudioEndpoint(eRender, eConsole, &pDevice);
    if (FAILED(hr)) {
        pEnumerator->Release();
        if (comInitialized) CoUninitialize();
        return Napi::Boolean::New(env, false);
    }

    IAudioEndpointVolume* pEndpointVolume = NULL;
    hr = pDevice->Activate(__uuidof(IAudioEndpointVolume), CLSCTX_ALL, NULL, (void**)&pEndpointVolume);
    if (FAILED(hr)) {
        pDevice->Release();
        pEnumerator->Release();
        if (comInitialized) CoUninitialize();
        return Napi::Boolean::New(env, false);
    }

    float fVolume = (float)volume / 100.0f;
    hr = pEndpointVolume->SetMasterVolumeLevelScalar(fVolume, NULL);
    if (FAILED(hr)) {
        pEndpointVolume->Release();
        pDevice->Release();
        pEnumerator->Release();
        if (comInitialized) CoUninitialize();
        return Napi::Boolean::New(env, false);
    }

    hr = pEndpointVolume->SetMute(volume == 0, NULL);
    if (FAILED(hr)) {
        pEndpointVolume->Release();
        pDevice->Release();
        pEnumerator->Release();
        if (comInitialized) CoUninitialize();
        return Napi::Boolean::New(env, false);
    }

    pEndpointVolume->Release();
    pDevice->Release();
    pEnumerator->Release();
    if (comInitialized) CoUninitialize();

    return Napi::Boolean::New(env, true);
}

Napi::Object GetMicrophoneVolume(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();
    Napi::Object result = Napi::Object::New(env);

    HRESULT hr = CoInitializeEx(NULL, COINIT_MULTITHREADED);
    bool comInitialized = (hr == S_OK);

    IMMDeviceEnumerator* pEnumerator = NULL;
    hr = CoCreateInstance(__uuidof(MMDeviceEnumerator), NULL, CLSCTX_ALL, __uuidof(IMMDeviceEnumerator), (void**)&pEnumerator);
    if (FAILED(hr)) {
        result.Set("success", false);
        result.Set("error", "Failed to create device enumerator");
        if (comInitialized) CoUninitialize();
        return result;
    }

    IMMDevice* pDevice = NULL;
    hr = pEnumerator->GetDefaultAudioEndpoint(eCapture, eConsole, &pDevice);
    if (FAILED(hr)) {
        result.Set("success", false);
        result.Set("error", "Failed to get default microphone endpoint");
        pEnumerator->Release();
        if (comInitialized) CoUninitialize();
        return result;
    }

    IAudioEndpointVolume* pEndpointVolume = NULL;
    hr = pDevice->Activate(__uuidof(IAudioEndpointVolume), CLSCTX_ALL, NULL, (void**)&pEndpointVolume);
    if (FAILED(hr)) {
        result.Set("success", false);
        result.Set("error", "Failed to activate microphone endpoint");
        pDevice->Release();
        pEnumerator->Release();
        if (comInitialized) CoUninitialize();
        return result;
    }

    BOOL isMuted = FALSE;
    hr = pEndpointVolume->GetMute(&isMuted);
    if (FAILED(hr)) {
        result.Set("success", false);
        result.Set("error", "Failed to get microphone mute status");
        pEndpointVolume->Release();
        pDevice->Release();
        pEnumerator->Release();
        if (comInitialized) CoUninitialize();
        return result;
    }

    float volume = 0.0f;
    hr = pEndpointVolume->GetMasterVolumeLevelScalar(&volume);
    if (FAILED(hr)) {
        result.Set("success", false);
        result.Set("error", "Failed to get microphone volume");
        pEndpointVolume->Release();
        pDevice->Release();
        pEnumerator->Release();
        if (comInitialized) CoUninitialize();
        return result;
    }

    result.Set("success", true);
    result.Set("volume", (int)(volume * 100));
    result.Set("isMuted", isMuted != FALSE);

    pEndpointVolume->Release();
    pDevice->Release();
    pEnumerator->Release();
    if (comInitialized) CoUninitialize();

    return result;
}

Napi::Boolean SetMicrophoneVolume(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();

    if (info.Length() < 1) {
        Napi::TypeError::New(env, "Expected volume parameter").ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }

    if (!info[0].IsNumber()) {
        Napi::TypeError::New(env, "volume must be a number").ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }

    int volume = info[0].As<Napi::Number>().Int32Value();
    if (volume < 0 || volume > 100) {
        Napi::TypeError::New(env, "volume must be between 0 and 100").ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }

    HRESULT hr = CoInitializeEx(NULL, COINIT_MULTITHREADED);
    bool comInitialized = (hr == S_OK);

    IMMDeviceEnumerator* pEnumerator = NULL;
    hr = CoCreateInstance(__uuidof(MMDeviceEnumerator), NULL, CLSCTX_ALL, __uuidof(IMMDeviceEnumerator), (void**)&pEnumerator);
    if (FAILED(hr)) {
        if (comInitialized) CoUninitialize();
        return Napi::Boolean::New(env, false);
    }

    IMMDevice* pDevice = NULL;
    hr = pEnumerator->GetDefaultAudioEndpoint(eCapture, eConsole, &pDevice);
    if (FAILED(hr)) {
        pEnumerator->Release();
        if (comInitialized) CoUninitialize();
        return Napi::Boolean::New(env, false);
    }

    IAudioEndpointVolume* pEndpointVolume = NULL;
    hr = pDevice->Activate(__uuidof(IAudioEndpointVolume), CLSCTX_ALL, NULL, (void**)&pEndpointVolume);
    if (FAILED(hr)) {
        pDevice->Release();
        pEnumerator->Release();
        if (comInitialized) CoUninitialize();
        return Napi::Boolean::New(env, false);
    }

    float fVolume = (float)volume / 100.0f;
    hr = pEndpointVolume->SetMasterVolumeLevelScalar(fVolume, NULL);
    if (FAILED(hr)) {
        pEndpointVolume->Release();
        pDevice->Release();
        pEnumerator->Release();
        if (comInitialized) CoUninitialize();
        return Napi::Boolean::New(env, false);
    }

    hr = pEndpointVolume->SetMute(volume == 0, NULL);
    if (FAILED(hr)) {
        pEndpointVolume->Release();
        pDevice->Release();
        pEnumerator->Release();
        if (comInitialized) CoUninitialize();
        return Napi::Boolean::New(env, false);
    }

    pEndpointVolume->Release();
    pDevice->Release();
    pEnumerator->Release();
    if (comInitialized) CoUninitialize();

    return Napi::Boolean::New(env, true);
}
