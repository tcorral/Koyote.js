( function (root) {
  'use strict';
  var Koyote, isNodeEnvironment, object = 'object';

  /**
   * Wraps the typeof sentence to improve minification.
   * @param {*} mix
   * @param {String} type
   * @returns {boolean}
   * @private
   */
  function _isTypeOf(mix, type) {
    return typeof mix === type;
  }

  /**
   * Check if Hydra.js is loaded in Node.js environment
   * @type {Boolean}
   * @private
   */
  isNodeEnvironment = _isTypeOf(root.exports, object) &&
    _isTypeOf(root.module, object) &&
    _isTypeOf(root.module.exports, object) &&
    _isTypeOf(root.require, 'function');

  /**
   * Empty callback.
   * @private
   */
  function _noOp() {}

  /**
   * Returns a valid method.
   * @throws error if does not exist a valid method.
   * @param {String} componentName
   * @param {String} methodName
   * @returns {*}
   * @private
   */
  function _getMethod(componentName, methodName) {
    var component = Koyote[ componentName ],
      errMsg = !component ? 'The type "' + componentName + '" does not exist!' : '',
      method = component && methodName ? component[ methodName ] || component.constructor.prototype[ methodName ] : null;
    if (method) {
      return method;
    }
    errMsg = errMsg || 'Failed to call "' + componentName + '.' + methodName + '"!';
    console.log(errMsg);
    throw (errMsg);
  }

  /**
   * Loops an object and only executes the callback if the method is different from constructor.
   * @param {Object} obj
   * @param {Function} callback
   * @private
   */
  function _forIn(obj, callback) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop) && prop !== 'constructor') {
        callback.call(obj, obj[ prop ], prop);
      }
    }
  }

  Koyote = {
    constructor: _noOp,
    /**
     * Returns an instance of the component.
     * @param {String} componentName
     * @returns {}
     */
    create: function (componentName) {
      var args = [].slice.call(arguments, 1);
      args.unshift(null);
      return new (Function.bind.apply(_getMethod(componentName, 'constructor'), args))();
    },
    /**
     * Calls a method in the component.
     * @param {String} fullMethodName
     * @param {Object} component
     * @param {Array} args
     * @returns {*}
     */
    callMethod: function (fullMethodName, component, args) {
      var parts = fullMethodName.split('.'),
        componentName = parts[ 0 ],
        methodName = parts[ 1 ],
        method = _getMethod(componentName, methodName);

      return method.apply(component, args);
    },
    /**
     * Extends the object.
     * @param {Object} source
     * @returns {}
     */
    mix: function (source) {
      var obj = {},
        app = this || Koyote;

      obj.constructor = source.constructor || app.constructor || _noOp;

      _forIn(app, function (value, key) {
        obj[ key ] = value;
      });

      _forIn(app.constructor, function (value, key) {
        obj.constructor[ key ] = value;
      });

      _forIn(app.constructor.prototype, function (value, key) {
        obj.constructor.prototype[ key ] = value;
      });

      _forIn(source, function (value, key) {
        if (key[ 0 ] === '@') {
          obj.constructor.prototype[ key.substr(1) ] = value;
        }
        else {
          obj[ key ] = value;
        }
      });

      return obj;
    }
  };
  /**
   * Expose Koyote to be used in node.js, as AMD module or as global
   */
  root.Koyote = Koyote;
  if (isNodeEnvironment) {
    module.exports = Koyote;
  } else if (typeof define !== 'undefined') {
    define('koyote', [], function () {
      return Koyote;
    });
  }
}(this) );