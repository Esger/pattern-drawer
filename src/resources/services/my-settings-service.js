export class MySettingsService {
    _isMobile = sessionStorage.getItem('isMobile') == 'true';
    _settingsName = 'pattern-creator';
    _version = 'v1.41'; // increase when settings object changes
    _defaultColor = '#DC143C';  // 'crimson',
    _defaultMode = 'worm';
    _defaultRotation = 30;
    _defaultRepetions = [3, 3];
    _defaultLineLength = 10;
    _defaultLineWidth = this._isMobile ? 3 : 4
    _settings = {};;

    constructor() {
        this._loadSettings();
    }

    saveSettings(settings) {
        localStorage.setItem(this._settingsName, JSON.stringify(settings));
        this._settings = settings;
    }

    getSettings() {
        return this._settings;
    }

    _defaultSettings() {
        return {
            version: this._version,
            draw: {
                mode: this._defaultMode,
                lineColor: this._defaultColor,
                lineWidth: this._defaultLineWidth,
                lineLength: this._defaultLineLength,
                rotation: this._defaultRotation,
                repetitions: this._defaultRepetions,
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

    _loadSettings() {
        const settings = JSON.parse(localStorage.getItem(this._settingsName));
        if (!settings || settings.version !== this._version) {
            this._settings = this._defaultSettings();
            this.saveSettings(this._settings);
        }
        else this._settings = settings;
    }
}
