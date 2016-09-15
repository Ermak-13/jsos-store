var settings = {
  CACHE_TIMEOUT: 14 * 24 * 60 * 60,

  DEFAULT_SIZE: {
    width: '520px',
    height: '300px'
  },

  DEFAULT_POSITION: global.Settings.get('default_position'),

  MODULES_REPOSITORY_URL: 'https://rawgit.com/Ermak-13/jsos-store/master/modules.json',
  THEMES_REPOSITORY_URL: 'https://rawgit.com/Ermak-13/jsos-store/master/themes.json'
};

module.exports = settings;
