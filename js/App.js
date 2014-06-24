/**
 * Created by amischol on 21/06/14.
 */
(function () {
  var App = {
    constructor: function () {},
    getInstance: function () {
      var args = [].slice.call(arguments);
      args.unshift(null);
      var _constructor = Function.bind.apply(this.constructor, args);
      return new _constructor();
    },
    extend: function (source) {
      var obj = {};
      var _app = App;
      var key;

      if(this){
        _app = this;
      }

      obj.constructor = source.constructor || _app.constructor || function () {};

      for(key in _app) {
        if(_app.hasOwnProperty(key)) {
          if(key !== 'constructor') {
            obj[key] = _app[key];
          }
        }
      }
      for(key in _app.constructor) {
        if(_app.constructor.hasOwnProperty(key)) {
          if(key !== 'constructor') {
            obj.constructor[key] = _app.constructor[key];
          }
        }
      }
      for(key in _app.constructor.prototype) {
        if(_app.constructor.prototype.hasOwnProperty(key)) {
          if(key !== 'constructor') {
            obj.constructor.prototype[key] = _app.constructor.prototype[key];
          }
        }
      }
      for(key in source) {
        if(source.hasOwnProperty(key)) {
          if(key !== 'constructor') {
            if(key.indexOf('@') === 0){
              obj.constructor.prototype[key.replace('@', '')] = source[key];
            }else{
              obj[key] = source[key];
            }
          }
        }
      }
      return obj;
    }
  };
  window.App = App;
}());