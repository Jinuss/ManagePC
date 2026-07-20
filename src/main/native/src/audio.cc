#include <napi.h>
#include <windows.h>
#include <mmdeviceapi.h>
#include <endpointvolume.h>

#pragma comment(lib, "ole32.lib")
#pragma comment(lib, "mmdevapi.lib")

static IAudioEndpointVolume* g_pEndpointVolume = NULL;
static IMMDevice* g_pDevice = NULL;
static IMMDeviceEnumerator* g_pEnumerator = NULL;
static Napi::ThreadSafeFunction g_tsfn = nullptr;
static bool g_comInitialized = false;

class VolumeCallback : public IAudioEndpointVolumeCallback
{
public:
    VolumeCallback() : m_cRef(1) {}

    ULONG STDMETHODCALLTYPE AddRef() override
    {
        return InterlockedIncrement(&m_cRef);
    }

    ULONG STDMETHODCALLTYPE Release() override
    {
        ULONG ulRef = InterlockedDecrement(&m_cRef);
        if (ulRef == 0)
        {
            delete this;
        }
        return ulRef;
    }

    HRESULT STDMETHODCALLTYPE QueryInterface(REFIID riid, void** ppvObject) override
    {
        if (riid == __uuidof(IUnknown) || riid == __uuidof(IAudioEndpointVolumeCallback))
        {
            *ppvObject = static_cast<IAudioEndpointVolumeCallback*>(this);
            AddRef();
            return S_OK;
        }
        *ppvObject = NULL;
        return E_NOINTERFACE;
    }

    HRESULT STDMETHODCALLTYPE OnNotify(PAUDIO_VOLUME_NOTIFICATION_DATA pNotify) override
    {
        if (g_tsfn == nullptr)
        {
            return S_OK;
        }

        int volume = static_cast<int>(pNotify->fMasterVolume * 100);
        bool isMuted = pNotify->bMuted != FALSE;

        napi_status status = g_tsfn.BlockingCall(
            [volume, isMuted](Napi::Env env, Napi::Function jsCallback) {
                Napi::Object result = Napi::Object::New(env);
                result.Set("volume", volume);
                result.Set("isMuted", isMuted);
                jsCallback.Call({result});
            });

        return S_OK;
    }

private:
    LONG m_cRef;
};

static VolumeCallback* g_pCallback = NULL;

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

Napi::Boolean StartVolumeNotification(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();

    if (info.Length() < 1 || !info[0].IsFunction()) {
        Napi::TypeError::New(env, "Expected callback function").ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }

    if (g_pEndpointVolume != NULL) {
        return Napi::Boolean::New(env, true);
    }

    HRESULT hr = CoInitializeEx(NULL, COINIT_MULTITHREADED);
    g_comInitialized = (hr == S_OK);

    hr = CoCreateInstance(__uuidof(MMDeviceEnumerator), NULL, CLSCTX_ALL, __uuidof(IMMDeviceEnumerator), (void**)&g_pEnumerator);
    if (FAILED(hr)) {
        if (g_comInitialized) CoUninitialize();
        return Napi::Boolean::New(env, false);
    }

    hr = g_pEnumerator->GetDefaultAudioEndpoint(eRender, eConsole, &g_pDevice);
    if (FAILED(hr)) {
        g_pEnumerator->Release();
        g_pEnumerator = NULL;
        if (g_comInitialized) CoUninitialize();
        return Napi::Boolean::New(env, false);
    }

    hr = g_pDevice->Activate(__uuidof(IAudioEndpointVolume), CLSCTX_ALL, NULL, (void**)&g_pEndpointVolume);
    if (FAILED(hr)) {
        g_pDevice->Release();
        g_pDevice = NULL;
        g_pEnumerator->Release();
        g_pEnumerator = NULL;
        if (g_comInitialized) CoUninitialize();
        return Napi::Boolean::New(env, false);
    }

    Napi::Function callback = info[0].As<Napi::Function>();
    g_tsfn = Napi::ThreadSafeFunction::New(
        env,
        callback,
        "VolumeNotification",
        0,
        1,
        [](Napi::Env) {}
    );

    g_pCallback = new VolumeCallback();
    hr = g_pEndpointVolume->RegisterControlChangeNotify(g_pCallback);
    if (FAILED(hr)) {
        g_tsfn.Release();
        g_tsfn = nullptr;
        delete g_pCallback;
        g_pCallback = NULL;
        g_pEndpointVolume->Release();
        g_pEndpointVolume = NULL;
        g_pDevice->Release();
        g_pDevice = NULL;
        g_pEnumerator->Release();
        g_pEnumerator = NULL;
        if (g_comInitialized) CoUninitialize();
        return Napi::Boolean::New(env, false);
    }

    return Napi::Boolean::New(env, true);
}

Napi::Boolean StopVolumeNotification(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();

    if (g_pEndpointVolume != NULL && g_pCallback != NULL) {
        g_pEndpointVolume->UnregisterControlChangeNotify(g_pCallback);
        g_pCallback->Release();
        g_pCallback = NULL;
    }

    if (g_tsfn != nullptr) {
        g_tsfn.Release();
        g_tsfn = nullptr;
    }

    if (g_pEndpointVolume != NULL) {
        g_pEndpointVolume->Release();
        g_pEndpointVolume = NULL;
    }

    if (g_pDevice != NULL) {
        g_pDevice->Release();
        g_pDevice = NULL;
    }

    if (g_pEnumerator != NULL) {
        g_pEnumerator->Release();
        g_pEnumerator = NULL;
    }

    if (g_comInitialized) {
        CoUninitialize();
        g_comInitialized = false;
    }

    return Napi::Boolean::New(env, true);
}