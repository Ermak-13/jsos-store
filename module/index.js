var Widget = require('./widget'),
    Shortcut = require('./shortcut'),
    locales = require('./locales');

I18n.registryDict(locales);
OS.installModule('JSOS Store', {
  Widget: Widget,
  Shortcut: Shortcut
});
