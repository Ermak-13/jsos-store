var INSTALLED_STATUS = require('./constants').INSTALLED_STATUS,
    UNINSTALLED_STATUS = require('./constants').UNINSTALLED_STATUS;

var Container = React.createClass({
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
      <table className="table">
        <tbody>
          { this.getCollectionHTML() }
        </tbody>
      </table>
    );
  },

  getCollectionHTML: function () {
    return _.map(this.props.collection, function (element, i) {
      return this.getElementTrHTML(element, i);
    }.bind(this));
  },

  getElementTrHTML: function (element, i) {
    return (
      <tr key={ i }>
        <td>{ element.githubUrl }</td>

        <td>
          { this.getElementBtn(element, i) }
        </td>
      </tr>
    );
  },

  getElementBtn: function (element, i) {
    if (element.status === INSTALLED_STATUS) {
      return (
        <a href="#" className="btn btn-danger btn-xs"
          onClick={ this.handleRemove.bind(this, element, i) }>
          <span className="fa fa-remove" />
        </a>
      );
    }else {
      return (
        <a href="#" className="btn btn-success btn-xs"
          onClick={ this.handleInstall.bind(this, element, i) }>
          <span className="fa fa-check" />
        </a>
      );
    }
  }
});

module.exports = Container;
