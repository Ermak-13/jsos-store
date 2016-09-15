var INSTALLED_STATUS = 'installed',
    UNINSTALLED_STATUS = 'uninstalled';

var ModulesTab = React.createClass({
  handleInstall: function (module, i, e) {
    e.preventDefault();

    this.props.onInstall(module, i);
  },

  handleRemove: function (module, i, e) {
    e.preventDefault();

    this.props.onRemove(module, i);
  },

  render: function() {
    return (
      <table className="table">
        <tbody>
          { this.getModulesHTML() }
        </tbody>
      </table>
    );
  },

  getModulesHTML: function () {
    return _.map(this.props.modules, function (module, i) {
      return this.getModuleTrHTML(module, i);
    }.bind(this));
  },

  getModuleTrHTML: function (module, i) {
    return (
      <tr key={ i }>
        <td>{ module.githubUrl }</td>

        <td>
          { this.getModuleBtn(module, i) }
        </td>
      </tr>
    );
  },

  getModuleBtn: function (module, i) {
    if (module.status === INSTALLED_STATUS) {
      return (
        <a href="#" className="btn btn-danger btn-xs"
          onClick={ this.handleRemove.bind(this, module, i) }>
          <span className="fa fa-remove" />
        </a>
      );
    }else {
      return (
        <a href="#" className="btn btn-success btn-xs"
          onClick={ this.handleInstall.bind(this, module, i) }>
          <span className="fa fa-check" />
        </a>
      );
    }
  }
});

module.exports = ModulesTab;
