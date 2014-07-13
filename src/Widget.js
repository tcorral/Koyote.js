( function (doc, koyote) {
  'use strict';

  var _slice = Array.prototype.slice,
    _toString = Object.prototype.toString,
    _toArray = function (arrayLike) {
      return _slice.call(arrayLike);
    },
    _isFunction = function (obj) {
      return _toString.call(obj) === '[object Function]';
    },
    _createCallback = function (widget, element, callback, targetSelector) {
      return function (event) {
        var target = event.target,
          targetElements;

        targetElements = targetSelector ? _slice.call(element.querySelectorAll(targetSelector)) : [ element ];

        while (target !== doc && targetElements.indexOf(target) === -1) {
          target = target.parentNode;
        }

        if (target !== doc) {
          callback.call(target, event, widget);
        }
      };
    },
    _renderTemplate = function (template, data) {
      var replaceTemplate = /\{\{([^\}]*)\}\}/gi,
        renderedTemplate = template,
        matches,
        docFrag = doc.createDocumentFragment(),
        layer = doc.createElement('div'),
        childrenInLayer;

      docFrag.appendChild(layer);

      while (matches = replaceTemplate.exec(template)) {
        renderedTemplate = renderedTemplate.replace(matches[ 0 ], data[ matches[ 1 ].trim() ]);
      }

      layer.innerHTML = renderedTemplate;

      childrenInLayer = _toArray(layer.childNodes);
      childrenInLayer.forEach(function (node) {
        docFrag.appendChild(node);
      });

      docFrag.removeChild(layer);

      return docFrag;
    },
    _appendElement = function (container, docFrag) {
      container.appendChild(docFrag);

      var result = container.lastChild;

      while (result && result.nodeType !== 1) {
        result = result.previousSibling;
      }

      return result;
    };

  function adapter(koyote, component) {
    return (koyote.Widget = component.mix(
      {
        constructor: function (container, type, id) {
          koyote.callMethod('Component.constructor', this, [ type || 'widget', id ]);

          this.container = container;
          this.element = null;
          this.domCallbacks = [];
        },
        '@getContainer': function () {
          if (!this.container) {
            var parent = this.getParent();
            this.container = parent && parent.getElement();
          }
          return this.container;
        },
        '@getElement': function () {
          return this.element;
        },
        '@template': '',
        '@render': function (data) {
          var docFrag = _renderTemplate(this.template, data);

          if (this.element) {
            this.removeElement();
          }

          this.element = _appendElement(this.getContainer(), docFrag);

          this.bindEvents();

          this.getChildren().forEach(function (child) {
            if (_isFunction(child.render)) {
              child.render();
            }
          });
        },
        '@removeElement': function () {
          this.getChildren().forEach(function (child) {
            if (child.element) {
              child.removeElement();
              child.container = null;
            }
          });

          this.unbindEvents();
          this.getContainer().removeChild(this.element);
          this.element = null;
        },
        '@bindEvents': function () {
          var element = this.element,
            domEvents = this.domEvents,
            domCallbacks = this.domCallbacks,
            eventParts,
            targetSelector,
            eventName,
            callback;

          for (var e in domEvents) {
            if (domEvents.hasOwnProperty(e)) {
              eventParts = e.split(':');
              targetSelector = eventParts[ 1 ] && eventParts[ 0 ];
              eventName = eventParts[ 1 ] || eventParts[ 0 ];

              callback = _createCallback(this, element, domEvents[ e ], targetSelector);
              domCallbacks.push(
                {
                  eventName: eventName,
                  callback: callback
                });
              element.addEventListener(eventName, callback);
            }
          }
        },
        '@unbindEvents': function () {
          var element = this.element;

          this.domCallbacks.forEach(function (data) {
            element.removeEventListener(data.eventName, data.callback);
          });

          this.domCallbacks = [];
        },
        '@domEvents': {},
        '@destroy': function () {
          this.unbindEvents();
          this.getContainer().removeChild(this.element);
          this.element = null;
          this.container = null;

          koyote.callMethod('Component.destroy', this);
        }
      }));
  }

  if (typeof define !== 'undefined') {
    define('koyote-widget', ['koyote', 'koyote-component'], adapter);
  } else {
    adapter(koyote, koyote.Component);
  }
}(document, Koyote) );
