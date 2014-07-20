( function (win, koyote) {
  'use strict';

  var localStorage = win.localStorage
    , JSON = win.JSON;

  function adapter(koyote, bus, component) {
    return (koyote.TodoStorage = component.mix(
      {
        constructor: function () {
          koyote.callMethod('Component.constructor', this, [ 'todo-storage' ]);

          this.restore();

          bus.subscribe(this);
          bus.publish('todos', 'list:restore', this.todos);
        },
        '@events': {
          'todos': {
            'todo:update': function (data) {
              data.todos.forEach(this.save.bind(this));
            },
            'todo:add': function (data) {
              data.todos.forEach(this.save.bind(this));
            },
            'todo:remove': function (data) {
              this.remove(data.item);
            },
            'todo:getAll': function (data) {
              data.todos = this.todos;
            },
            'filter:get': function (data){
              data.filter = localStorage.getItem('filter') || 'all';
            },
            'filter:toggle': function (data) {
              localStorage.setItem('filter', data.filter);
            }
          }
        },
        '@remove': function (todoData) {
          delete this.todos[ todoData.id ];
          localStorage.setItem('todos', JSON.stringify(this.todos));
        },
        '@save': function (todoData) {
          this.todos[ todoData.id ] = todoData;
          localStorage.setItem('todos', JSON.stringify(this.todos));
        },
        '@restore': function () {
          this.todos = JSON.parse(localStorage.getItem('todos')) || {};
        }
      }));
  }


  if (typeof define !== 'undefined') {
    define('koyote-todo-storage', ['koyote', 'koyote-bus', 'koyote-component'], adapter);
  } else {
    adapter(koyote, koyote.Bus, koyote.Component);
  }
}(window, Koyote) );
