( function (koyote) {
  'use strict';

  function adapter(koyote, bus, widget) {
    return (koyote.TodoList = widget.mix(
      {
        constructor: function (container) {
          koyote.callMethod('Widget.constructor', this, [ container, 'todo-list' ]);
          bus.subscribe(this);
        },
        '@template': '<ul id="{{ id }}" />',
        '@render': function () {
          koyote.callMethod('Widget.render', this, [
            {
              type: this.type,
              id: this.id
            }
          ]);
        },
        '@addTodos': function (todos) {
          var self = this,
            storeData = {
              todos: []
            };

          todos.forEach(function (todoText) {
            var todo = koyote.create('TodoItem',
              {
                text: todoText
              });

            self.add(todo);

            storeData.todos.push(
              {
                id: todo.id,
                text: todo.text,
                checked: todo.checked
              });
          });

          this.render();

          bus.publish('todos', 'todo:add', storeData);
        },
        '@events': {
          'todos': {
            'list:restore': function (todos) {
              for (var id in todos) {
                if (todos.hasOwnProperty(id)) {
                  var todoData = todos[ id ];
                  this.add(koyote.create('TodoItem', todoData));
                }
              }

              bus.unsubscribeFrom('todos', 'list:restore', this);
            },
            'list:add': function (data) {
              this.addTodos(data.todos);
            }
          }
        }
      }));
  }

  if (typeof define !== 'undefined') {
    define('koyote-todo-list', ['koyote', 'koyote-bus', 'koyote-widget'], adapter);
  } else {
    adapter(koyote, koyote.Bus, koyote.Widget);
  }
}(Koyote) );
