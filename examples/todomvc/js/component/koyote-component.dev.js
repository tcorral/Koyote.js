( function (koyote) {
  'use strict';

  var _toString = Object.prototype.toString,
    _isArray = function (obj) {
      return _toString.call(obj) === '[object Array]';
    };

  function adapter(koyote) {
    return (koyote.Component = koyote.mix(
      {
        constructor: function (type, id) {
          this.type = type || 'component';
          this.id = id || ( this.type + '-' + Math.random().toString(36).substr(2, 9) );
          this.parent = null;
          this.children = [];
        },
        '@add': function (children) {
          var self = this;

          children = _isArray(children) ? children : [ children ];

          children.forEach(function (child) {
            child.parent = self;
            self.children.push(child);
          });

          return this;
        },
        '@remove': function (child) {
          var position = this.children.indexOf(child);

          if (position > -1) {
            this.children.splice(position, 1);
          }

          return this;
        },
        '@getParent': function () {
          return this.parent;
        },
        '@getChildren': function (uniqueId) {
          var result = this.children;

          if (uniqueId) {
            this.children.some(function (child, index) {
              if (uniqueId === index || child.getUniqueId() === uniqueId) {
                result = child;
                return true;
              }
            });
          }

          return result;
        },
        '@destroy': function () {
          this.children.forEach(function (child) {
            child.destroy();
          });
          this.children = [];
        }
      }));
  }

  if (typeof define !== 'undefined') {
    define('koyote-component', ['koyote'], adapter);
  } else {
    adapter(koyote);
  }
}(Koyote) );
