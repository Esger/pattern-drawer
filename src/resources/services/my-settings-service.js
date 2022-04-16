export class MySettingsService {
    _settingsName = 'pattern-creator';
    _version = 'v1.41'; // increase when settings object changes
    _defaultColor = '#DC143C';  // 'crimson',
    _defaultMode = 'worm';
    _settings = {};

    saveSettings(settings) {
        localStorage.setItem(this._settingsName, JSON.stringify(settings));
        this._settings = settings;
    }

    _defaultSettings() {
        return {
            version: this._version,
            draw: {
                mode: this._defaultMode,
                lineColor: this._defaultColor,
                lineWidth: this._isMobile ? 15 : 20,
                lineLength: 1,
                repetitions: [1, 1],
            },
            visibility: {
                tools: true,
                repetitions: false,
                repetitionsY: false,
                lineWidth: false,
                lineLength: false,
            }
        }
    }

    loadSettings() {
        const settings = JSON.parse(localStorage.getItem(this._settingsName));
        if (!settings || settings.version !== this._version) this._settings = this._defaultSettings()
        else this._settings = settings;
        this.saveSettings(settings);
        return settings;
    }
}
