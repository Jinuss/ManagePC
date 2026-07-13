#include <napi.h>
#include <windows.h>
#include <set>

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
