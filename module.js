(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
  INSTALLED_STATUS: 'installed',
  UNINSTALLED_STATUS: 'uninstalled'
};



},{}],2:[function(require,module,exports){
var INSTALLED_STATUS = 'installed',
    UNINSTALLED_STATUS = 'uninstalled';

var Container = React.createClass({displayName: "Container",
  handleInstall: function (element, i, e) {
    e.preventDefault();

    this.props.onInstall(element, i);
  },

  handleRemove: function (element, i, e) {
    e.preventDefault();

    this.props.onRemove(element, i);
  },

  render: function() {
    return (
      React.createElement("table", {className: "table"}, 
        React.createElement("tbody", null, 
           this.getCollectionHTML() 
        )
      )
    );
  },

  getCollectionHTML: function () {
    return _.map(this.props.collection, function (element, i) {
      return this.getElementTrHTML(element, i);
    }.bind(this));
  },

  getElementTrHTML: function (element, i) {
    return (
      React.createElement("tr", {key:  i }, 
        React.createElement("td", null,  element.githubUrl), 

        React.createElement("td", null, 
           this.getElementBtn(element, i) 
        )
      )
    );
  },

  getElementBtn: function (element, i) {
    if (element.status === INSTALLED_STATUS) {
      return (
        React.createElement("a", {href: "#", className: "btn btn-danger btn-xs", 
          onClick:  this.handleRemove.bind(this, element, i) }, 
          React.createElement("span", {className: "fa fa-remove"})
        )
      );
    }else {
      return (
        React.createElement("a", {href: "#", className: "btn btn-success btn-xs", 
          onClick:  this.handleInstall.bind(this, element, i) }, 
          React.createElement("span", {className: "fa fa-check"})
        )
      );
    }
  }
});

module.exports = Container;


},{}],3:[function(require,module,exports){
var Widget = require('./widget'),
    Shortcut = require('./shortcut');

OS.installModule('JSOS Store', {
  Widget: Widget,
  Shortcut: Shortcut
});


},{"./shortcut":5,"./widget":6}],4:[function(require,module,exports){
(function (global){
var settings = {
  CACHE_TIMEOUT: 14 * 24 * 60 * 60,

  DEFAULT_SIZE: {
    width: '520px',
    height: '300px'
  },

  DEFAULT_POSITION: global.Settings.get('default_position'),

  MODULES_REPOSITORY_URL: 'https://rawgit.com/Ermak-13/jsos-store/master/modules.json'
};

module.exports = settings;


}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
var Link = OS.Link;

var Shortcut = React.createClass({displayName: "Shortcut",
  render: function () {
    return (
      React.createElement(Link, {
        className:  this.props.className, 
        onClick:  this.props.onClick}, 

        React.createElement("span", {className: "fa fa-shopping-cart"})
      )
    );
  }
});

module.exports = Shortcut;


},{}],6:[function(require,module,exports){
var Mixins = OS.Mixins,
    Widget = OS.Widget,
    Configurator = OS.Configurator;

var settings = require('./settings'),
    Container = require('./container'),

    INSTALLED_STATUS = require('./constants').INSTALLED_STATUS,
    UNINSTALLED_STATUS = require('./constants').UNINSTALLED_STATUS;

var _Widget = React.createClass({displayName: "_Widget",
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
        var status = lModule[index].status;
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

  componentWillMount: function () {
    this.init(function () {
      console.log(this.getData());
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
      React.createElement(Widget.Widget, {widgetStyles:  this.getWidgetStyles() }, 
        React.createElement(Widget.DefaultHeader, {
          title: "JSOS Store", 
          onMouseDownPositionBtn:  this.handleStartMoving, 
          onClickCloseBtn:  this.close, 
          onClickConfigureBtn:  this.openConfigurator}
        ), 

        React.createElement(Widget.Body, null, 
          React.createElement(Container, {
            collection:  this.state.modules, 
            onInstall:  this.handleInstallModule, 
            onRemove:  this.handleRemoveModule}
          )
        )
      )
    );
  },
});

module.exports = _Widget;


},{"./constants":1,"./container":2,"./settings":4}]},{},[3])