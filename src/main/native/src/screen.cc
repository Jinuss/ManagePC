#include <napi.h>
#include <windows.h>
#include <set>
#include <thread>
#include <atomic>

static Napi::ThreadSafeFunction g_tsfn = nullptr;
static std::atomic<bool> g_isListening(false);
static std::thread g_listenerThread;
static HWND g_hWnd = NULL;

Napi::Object GetScreenSize(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();

    int width = GetSystemMetrics(SM_CXSCREEN);
    int height = GetSystemMetrics(SM_CYSCREEN);

    Napi::Object obj = Napi::Object::New(env);

    obj.Set("width", width);
    obj.Set("height", height);

    return obj;
}

Napi::Array GetAllScreenResolutions(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();
    Napi::Array result = Napi::Array::New(env);

    std::set<std::pair<int, int>> uniqueResolutions;

    DISPLAY_DEVICE displayDevice;
    ZeroMemory(&displayDevice, sizeof(DISPLAY_DEVICE));
    displayDevice.cb = sizeof(DISPLAY_DEVICE);

    for (DWORD deviceIndex = 0; EnumDisplayDevices(NULL, deviceIndex, &displayDevice, 0); deviceIndex++)
    {
        if (!(displayDevice.StateFlags & DISPLAY_DEVICE_ATTACHED_TO_DESKTOP))
            continue;

        DEVMODE devMode;
        ZeroMemory(&devMode, sizeof(DEVMODE));
        devMode.dmSize = sizeof(DEVMODE);

        for (DWORD modeIndex = 0; EnumDisplaySettingsEx(displayDevice.DeviceName, modeIndex, &devMode, 0); modeIndex++)
        {
            if (devMode.dmPelsWidth > 0 && devMode.dmPelsHeight > 0)
            {
                uniqueResolutions.insert(std::make_pair(devMode.dmPelsWidth, devMode.dmPelsHeight));
            }
        }
    }

    size_t index = 0;
    for (const auto& resolution : uniqueResolutions)
    {
        Napi::Object resolutionObj = Napi::Object::New(env);
        resolutionObj.Set("width", resolution.first);
        resolutionObj.Set("height", resolution.second);
        result.Set(index++, resolutionObj);
    }

    return result;
}

Napi::Boolean SetScreenResolution(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();

    if (info.Length() < 2)
    {
        Napi::TypeError::New(env, "Expected width and height parameters").ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }

    if (!info[0].IsNumber() || !info[1].IsNumber())
    {
        Napi::TypeError::New(env, "width and height must be numbers").ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }

    int width = info[0].As<Napi::Number>().Int32Value();
    int height = info[1].As<Napi::Number>().Int32Value();

    if (width <= 0 || height <= 0)
    {
        Napi::TypeError::New(env, "width and height must be positive").ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }

    DEVMODE devMode;
    ZeroMemory(&devMode, sizeof(DEVMODE));
    devMode.dmSize = sizeof(DEVMODE);
    devMode.dmPelsWidth = width;
    devMode.dmPelsHeight = height;
    devMode.dmFields = DM_PELSWIDTH | DM_PELSHEIGHT;

    LONG result = ChangeDisplaySettingsEx(
        NULL,
        &devMode,
        NULL,
        0,
        NULL
    );

    return Napi::Boolean::New(env, result == DISP_CHANGE_SUCCESSFUL);
}

LRESULT CALLBACK ResolutionWindowProc(HWND hWnd, UINT msg, WPARAM wParam, LPARAM lParam)
{
    if (msg == WM_DISPLAYCHANGE)
    {
        int width = LOWORD(lParam);
        int height = HIWORD(lParam);

        if (g_tsfn != nullptr)
        {
            g_tsfn.BlockingCall(
                [width, height](Napi::Env env, Napi::Function jsCallback) {
                    Napi::Object result = Napi::Object::New(env);
                    result.Set("width", width);
                    result.Set("height", height);
                    jsCallback.Call({ result });
                });
        }
    }

    return DefWindowProc(hWnd, msg, wParam, lParam);
}

static void ResolutionListenerThread()
{
    WNDCLASS wc = {0};
    wc.lpfnWndProc = ResolutionWindowProc;
    wc.hInstance = GetModuleHandle(NULL);
    wc.lpszClassName = "ResolutionMonitorClass";

    RegisterClass(&wc);

    g_hWnd = CreateWindowEx(
        0,
        "ResolutionMonitorClass",
        "ResolutionMonitor",
        0,
        CW_USEDEFAULT, CW_USEDEFAULT,
        CW_USEDEFAULT, CW_USEDEFAULT,
        HWND_MESSAGE,
        NULL,
        NULL,
        NULL
    );

    if (g_hWnd == NULL)
    {
        return;
    }

    MSG msg;
    while (GetMessage(&msg, g_hWnd, 0, 0) > 0)
    {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }

    DestroyWindow(g_hWnd);
    g_hWnd = NULL;
}

Napi::Boolean StartResolutionNotification(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();

    if (info.Length() < 1 || !info[0].IsFunction()) {
        Napi::TypeError::New(env, "Expected callback function").ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }

    if (g_isListening.load()) {
        return Napi::Boolean::New(env, true);
    }

    Napi::Function callback = info[0].As<Napi::Function>();
    g_tsfn = Napi::ThreadSafeFunction::New(
        env,
        callback,
        "ResolutionNotification",
        0,
        1,
        [](Napi::Env) {}
    );

    g_isListening.store(true);

    g_listenerThread = std::thread(ResolutionListenerThread);

    return Napi::Boolean::New(env, true);
}

Napi::Boolean StopResolutionNotification(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();

    if (g_hWnd != NULL) {
        PostMessage(g_hWnd, WM_QUIT, 0, 0);
    }

    if (g_listenerThread.joinable()) {
        g_listenerThread.join();
    }

    if (g_tsfn != nullptr) {
        g_tsfn.Release();
        g_tsfn = nullptr;
    }

    g_isListening.store(false);

    return Napi::Boolean::New(env, true);
}