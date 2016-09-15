var Mixins = OS.Mixins,
    Widget = OS.Widget,
    Configurator = OS.Configurator;

var settings = require('./settings'),
    ModulesTab = require('./modules_tab');

global.githubUrl = function () {
  var hostname = arguments[0].replace('github.com', 'cdn.rawgit.com'),
      array = Array.prototype.slice.call(arguments, 1);

  return _.reduce(array, function (result, part) {
    return result + '/' + part;
  }, hostname);
};

var _Widget = React.createClass({
  mixins: [Mixins.WidgetHelper],

  getInitialState: function () {
    return {
      size: settings.DEFAULT_SIZE,
      position: settings.DEFAULT_POSITION,

      lastModulesUpdatedAt: null,
      modules: [],
      themes: []
    };
  },

  handleInstallModule: function (module) {
  },

  handleRemoveModule: function (module) {
  },

  _getData: function () {
    return {
      modules: this.state.modules,
      lastModulesUpdatedAt: this.getLastModulesUpdatedAt()
    };
  },

  _getSettings: function () {
    return {
      size: _.clone(this.state.size),
      position: _.clone(this.state.position)
    };
  },

  isActualModules: function () {
      return (
        moment().unix() - this.getLastModulesUpdatedAt() <
        settings.CACHE_TIMEOUT
      );
  },

  getLastModulesUpdatedAt: function () {
    if (this.state.lastModulesUpdatedAt) {
      return this.state.lastModulesUpdatedAt;
    } else {
      return 0;
    }
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
        var status = lModule[index].status;
        sModule.status = status;
      } else {
        sModule.status = 'uninstalled';
      }
    });

    this.setState({
      modules: sModules,
      lastModulesUpdatedAt: moment().unix()
    }, this.saveData);
  },

  componentWillMount: function () {
    this.init(function () {
      if (!this.isActualModules) {
        OS.download(settings.MODULES_REPOSITORY_URL, {
          success: function (text) {
            this.updateModules(JSON.parse(text));
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
          <ModulesTab
            modules={ this.state.modules }
            onInstall={ this.handleInstallModule }
            onRemove={ this.handleRemoveModule }
          />
        </Widget.Body>
      </Widget.Widget>
    );
  },
});

module.exports = _Widget;
