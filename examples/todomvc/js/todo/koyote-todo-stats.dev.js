(function (koyote) {
  'use strict';

  function adapter(koyote, bus, widget) {
    return (koyote.TodoStats = widget.mix({
      constructor: function (element) {
        koyote.callMethod('Widget.constructor', this, [ null, 'todo-stats' ]);
        this.element = element;
        this.selected = element.querySelector('.selected');
        this.setData();
        this.filter = 'all';
        bus.publish('todos', 'filter:get', this);
        bus.subscribe(this);
        this.selected.classList.remove('selected');
        this.selected = this.element.querySelector('a[href="#/' + (this.filter === 'all' ? '' : this.filter) + '"]');
        this.selected.classList.add('selected');
      },
      '@updateCount': function (count) {
        var name = 'items';
        if(count === 1){
          name = 'item';
        }
        document.getElementById('todo-count').innerHTML = '<strong>' + count + '</strong> ' + name + ' left';
      },
      '@filtering': {
        'all': function () {
          var key;
          var item;
          this.setData();
          for (key in this.remaining) {
            if (this.remaining.hasOwnProperty(key)) {
              item = this.remaining[key];
              if(item){
                bus.publish('todos', 'todo:show', item);
              }
            }
          }
          for (key in this.completed) {
            if (this.completed.hasOwnProperty(key)) {
              item = this.completed[key];
              if(item){
                bus.publish('todos', 'todo:show', item);
              }
            }
          }
        },
        'active': function () {
          var key;
          var item;
          this.setData();
          for (key in this.remaining) {
            if (this.remaining.hasOwnProperty(key)) {
              item = this.remaining[key];
              if(item){
                bus.publish('todos', 'todo:show', item);
              }
            }
          }
          for (key in this.completed) {
            if (this.completed.hasOwnProperty(key)) {
              item = this.completed[key];
              if(item){
                bus.publish('todos', 'todo:hide', item);
              }
            }
          }
        },
        'completed': function () {
          var key;
          var item;
          this.setData();
          for (key in this.remaining) {
            if (this.remaining.hasOwnProperty(key)) {
              item = this.remaining[key];
              if(item){
                bus.publish('todos', 'todo:hide', item);
              }
            }
          }
          for (key in this.completed) {
            if (this.completed.hasOwnProperty(key)) {
              item = this.completed[key];
              if(item){
                bus.publish('todos', 'todo:show', item);
              }
            }
          }
        }
      },
      '@toggle': function (element) {
        if (element) {
          this.selected.classList.remove('selected');
          this.selected = element;
          this.selected.classList.add('selected');
        }
        this.filtering[this.filter].call(this);
      },
      '@setData': function () {
        this.setRemaining();
        this.setCompleted();
      },
      '@setRemaining': function () {
        var id;
        var todo;
        this.remaining = {};
        bus.publish('todos', 'todo:getAll', this);
        for (id in this.todos) {
          if (this.todos.hasOwnProperty(id)) {
            todo = this.todos[id];
            if (todo.checked === false) {
              this.remaining[id] = todo;
            }
          }
        }
      },
      '@setCompleted': function () {
        var id;
        var todo;
        this.completed = {};
        bus.publish('todos', 'todo:getAll', this);
        for (id in this.todos) {
          if (this.todos.hasOwnProperty(id)) {
            todo = this.todos[id];
            if (todo.checked === true) {
              this.completed[id] = todo;
            }
          }
        }
      },
      '@template': '',
      '@render': function () {
        this.bindEvents();
      },
      '@events': {
        'todos': {
          'todo:count': function (count) {
            if(typeof count === 'undefined'){
              var _data = {};
              count = 0;
              var todo;
              bus.publish('todos', 'todo:getAll', _data);
              for(var key in _data.todos){
                if(_data.todos.hasOwnProperty(key)){
                  todo = _data.todos[key];
                  if(todo.checked === false){
                    count++;
                  }
                }
              }
            }
            this.updateCount(count);
          },
          'todo:update': function () {
            this.setData();
            this.filtering[this.filter].call(this);
          },
          'list:add': function () {
            this.filtering[this.filter].call(this);
          },
          'filter:refresh': function () {
            this.filtering[this.filter].call(this);
          },
          'filter:toggle': function (data) {
            this.filter = data.filter || this.filter;
            this.toggle(data.element);
          }
        }
      },
      '@domEvents': {
        'a[href="#/"]:click': function (event) {
          bus.publish('todos', 'filter:toggle', { element: this, filter: 'all' });
          event.preventDefault();
        },
        'a[href="#/active"]:click': function (event) {
          bus.publish('todos', 'filter:toggle', { element: this, filter: 'active' });
          event.preventDefault();
        },
        'a[href="#/completed"]:click': function (event) {
          bus.publish('todos', 'filter:toggle', { element: this, filter: 'completed' });
          event.preventDefault();
        },
        '#clear-completed:click': function (event) {
          bus.publish('todos', 'todo:complete', this);
          event.preventDefault();
        }
      }
    }));
  }

  if (typeof define !== 'undefined') {
    define('koyote-todo-item', ['koyote', 'koyote-bus', 'koyote-widget'], adapter);
  } else {
    adapter(koyote, koyote.Bus, koyote.Widget);
  }
}(Koyote));