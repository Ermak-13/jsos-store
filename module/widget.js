var Mixins = OS.Mixins,
    Widget = OS.Widget,
    Configurator = OS.Configurator;

var settings = require('./settings'),
    Container = require('./container'),

    INSTALLED_STATUS = require('./constants').INSTALLED_STATUS,
    UNINSTALLED_STATUS = require('./constants').UNINSTALLED_STATUS;

var _Widget = React.createClass({
  mixins: [Mixins.WidgetHelper, Mixins.NavHelper],

  getInitialState: function () {
    return {
      tab: 'modules',
      size: settings.DEFAULT_SIZE,
      position: settings.DEFAULT_POSITION,

      lastModulesUpdatedAt: null,
      modules: [],

      lastThemesUpdatedAt: null,
      themes: []
    };
  },

  handleInstallModule: function (module, i) {
    var url = this.getInstallUrl(module.githubUrl, module.version, module.main);

    OS.installScript(url);
    var modules = this.state.modules;
    modules[i].status = INSTALLED_STATUS;

    this.setState({ modules: modules }, this.saveData);
  },

  handleRemoveModule: function (module, i) {
    var script = _.find(Scripts.all(), function (script) {
      return script.url === this.getInstallUrl(module.githubUrl, module.version, module.main);
    }.bind(this));

    OS.uninstallScript(script);
    var modules = this.state.modules;
    modules[i].status = UNINSTALLED_STATUS;

    this.setState({ modules: modules }, this.saveData);
  },

  _getData: function () {
    return {
      modules: this.state.modules,
      lastModulesUpdatedAt: this.getLastUpdatedAt(this.state.lastModulesUpdatedAt)
    };
  },

  _getSettings: function () {
    return {
      size: _.clone(this.state.size),
      position: _.clone(this.state.position)
    };
  },

  getTabs: function () {
    var modulesContent = (
          <Container
            collection={ this.state.modules }
            onInstall={ this.handleInstallModule }
            onRemove={ this.handleRemoveModule }
          />
        ),
        themesContent = (
          <Container
            collection={ this.state.themes }
            onInstall={ this.handleInstallTheme }
            onRemove={ this.handleRemoveTheme }
          />
        );

    return {
      modules: {
        navText: 'Modules',
        content: modulesContent
      },

      themes: {
        navText: 'Themes',
        content: themesContent
      }
    };
  },

  isActual: function (field) {
    return (
      moment().unix() - this.getLastUpdatedAt(field) <
      settings.CACHE_TIMEOUT
    );
  },

  getLastUpdatedAt: function (value) {
    return value ? value : 0;
  },

  getInstallUrl: function () {
    var hostname = arguments[0].replace('github.com', 'cdn.rawgit.com'),
        array = Array.prototype.slice.call(arguments, 1);

    return _.reduce(array, function (result, part) {
      return result + '/' + part;
    }, hostname);
  },

  updateModules: function (data) {
    var sModules = _.clone(data),
        lModules = _.clone(this.state.modules);

    _.each(sModules, function (sModule) {
      var index = _.findIndex(lModules, function (lModule) {
        return (
          sModule.githubUrl === lModule.githubUrl &&
          sModule.name === lModule.name
        );
      });

      if (index !== -1) {
        var status = lModules[index].status;
        sModule.status = status;
      } else {
        sModule.status = UNINSTALLED_STATUS;
      }
    });

    this.setState({
      modules: sModules,
      lastModulesUpdatedAt: moment().unix()
    }, this.saveData);
  },

  updateThemes: function (data) {
    var sThemes = _.clone(data),
        lThemes = _.clone(this.state.themes);

    _.each(sThemes, function (sTheme) {
      var index = _.findIndex(lThemes, function (lTheme) {
        return (
          sTheme.githubUrl === lTheme.githubUrl &&
          sTheme.name === lTheme.name
        );
      });

      if (index !== -1) {
        var status = lThemes[index].status;
        sTheme.status = status;
      } else {
        sTheme.status = UNINSTALLED_STATUS;
      }
    });
  },

  componentWillMount: function () {
    this.init(function () {
      if (!this.isActual(this.state.lastModulesUpdatedAt)) {
        OS.download(settings.MODULES_REPOSITORY_URL, {
          success: function (text) {
            this.updateModules(JSON.parse(text));
          }.bind(this)
        });
      }

      if (!this.isActual(this.state.lastThemesUpdatedAt)) {
        OS.download(settings.THEMES_REPOSITORY_URL, {
          success: function (text) {
            this.updateThemes(JSON.parse(text));
          }.bind(this)
        });
      }
    }.bind(this));
  },

  render: function () {
    return (
      <Widget.Widget widgetStyles={ this.getWidgetStyles() }>
        <Widget.DefaultHeader
          title="JSOS Store"
          onMouseDownPositionBtn={ this.handleStartMoving }
          onClickCloseBtn={ this.close }
          onClickConfigureBtn={ this.openConfigurator }
        />

        <Widget.Body>
          { this.getNavHTML() }

          <div>
            { this.getContentHTML() }
          </div>
        </Widget.Body>
      </Widget.Widget>
    );
  },
});

module.exports = _Widget;
