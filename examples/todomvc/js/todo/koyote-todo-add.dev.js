(function (koyote) {
  'use strict';
  function adapter(koyote, bus, widget) {
    return (koyote.TodoAdd = widget.mix(
      {
        constructor: function (element) {
          koyote.callMethod('Widget.constructor', this, [ null, 'todo-add' ]);
          this.element = element;
        },
        '@template': '',
        '@render': function () {
          this.bindEvents();
        },
        '@domEvents': {
          'keydown': function (event) {
            var keyCode = event.keyCode;

            switch (keyCode) {
              case 27:
                this.value = '';
                this.blur();
                break;

              case 9:
              case 13:
                event.preventDefault();

                this.value = this.value.trim();

                if (this.value.length) {
                  bus.publish('todos', 'list:add',
                    {
                      item: [this.value]
                    });
                }

                this.value = '';
                break;

              default:
                break;
            }
          }
        }
      }));
  }

  if (typeof define !== 'undefined') {
    define('koyote-todo-add', ['koyote', 'koyote-bus', 'koyote-widget'], adapter);
  } else {
    adapter(koyote, koyote.Bus, koyote.Widget);
  }
}(Koyote));
