f = open(r'd:\1Awork\ManagePC\src\main\modules\window\windowManager.js', 'r', encoding='utf-8')
c = f.read()
f.close()

# Add openDevTools in dev mode
c = c.replace(
    'this.settingsWindow.loadURL("http://localhost:5173/windows/settings/index.html")',
    'this.settingsWindow.loadURL("http://localhost:5173/windows/settings/index.html")\n      this.settingsWindow.webContents.openDevTools()'
)

# Add method
c = c.replace(
    'closeSettingsWindow() {\n    if (this.settingsWindow && !this.settingsWindow.isDestroyed()) {\n      this.settingsWindow.close()\n      this.settingsWindow = null\n    }\n  }\n\n  getSettingsWindow() {',
    'closeSettingsWindow() {\n    if (this.settingsWindow && !this.settingsWindow.isDestroyed()) {\n      this.settingsWindow.close()\n      this.settingsWindow = null\n    }\n  }\n\n  openSettingsDevTools() {\n    if (this.settingsWindow && !this.settingsWindow.isDestroyed()) {\n      this.settingsWindow.webContents.openDevTools()\n    }\n  }\n\n  getSettingsWindow() {'
)

f = open(r'd:\1Awork\ManagePC\src\main\modules\window\windowManager.js', 'w', encoding='utf-8')
f.write(c)
f.close()

print('Done')
