export class MySettingsService {
    _version = 'v1.4'; // increase when settings object changes
    _settings = {};

    saveSettings(settings) {
        localStorage.setItem('pattern-creator', JSON.stringify(settings));
        this._settings = settings;
    }

    defaultSettings() {
        return {
            version: this._version,
            draw: {
                mode: 'worm',
                lineColor: '#DC143C', // 'crimson',
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
        const settings = JSON.parse(localStorage.getItem('pattern-creator'));
        if (settings) {
            this._settings = settings;
            if (settings.version !== this._version) {
                this._settings = this.defaultSettings();
            }
        } else {
            this._settings = this.defaultSettings();
            this.saveSettings(this._settings);
        }
        return this._settings;
    }
}
