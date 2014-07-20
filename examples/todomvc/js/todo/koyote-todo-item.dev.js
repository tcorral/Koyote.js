(function (koyote) {
  'use strict';

  function adapter(koyote, bus, widget) {
    return (koyote.TodoItem = widget.mix(
      {
        constructor: function (data) {
          koyote.callMethod('Widget.constructor', this, [ null, 'todo-item', data.id ]);
          this.text = data.text;
          this.checked = !!data.checked;
          bus.subscribe(this);
        },
        '@template': '<li id="{{ id }}" {{ completed }}><div class="view"><input class="toggle" type="checkbox" {{ checkedAttr }}><label class="todo-label">{{ text }}</label><button class="destroy"></button></div><input class="edit" value="{{ text }}"></li>',
        '@render': function () {
          var checkedAttr = '';
          var completed = '';

          if (!!this.checked) {
            checkedAttr = 'checked';
            completed = 'class="completed"';
          }

          koyote.callMethod('Widget.render', this, [
            {
              id: this.id,
              text: this.text,
              checkedAttr: checkedAttr,
              completed: completed
            }
          ]);

          bus.publish('todos', 'filter:refresh');
        },
        update: function (todoItem, todoElement) {
          var text = todoElement.querySelector('.edit').value,
            checked = !!todoElement.querySelector('.toggle').checked;

          todoElement.querySelector('.todo-label').innerHTML = text;
          todoElement.classList.remove('editing');
          todoItem.text = text;
          todoItem.checked = checked;

          bus.publish('todos', 'todo:update',
            {
              todos: [
                {
                  id: todoElement.id,
                  text: text,
                  checked: checked
                }
              ]
            });
        },
        '@events': {
          'todos': {
            'todo:show': function (item) {
              var element = document.getElementById(item.id);
              if(element){
                element.classList.remove('hidden');
              }

              bus.publish('todos', 'todo:count');
            },
            'todo:hide': function (item) {
              var element = document.getElementById(item.id);
              if(element){
                element.classList.add('hidden');
              }
              bus.publish('todos', 'todo:count');
            },
            'todo:complete': function (item){
              var checkbox = this.element.querySelector('.toggle');
              bus.publish('todos', 'todo:update',
                {
                  todos: [
                    {
                      id: this.id,
                      text: this.text,
                      checked: false
                    }
                  ]
                });
              checkbox.removeAttribute('checked');
              checkbox.checked = false;
              this.element.classList.remove('completed');
            }
          }
        },
        '@domEvents': {
          '.toggle:change': function (event, todoItem) {
            var todoElement = this.parentNode.parentNode;
            todoElement.classList.toggle('completed');
            koyote.TodoItem.update(todoItem, todoElement);
            bus.publish('todos', 'filter:refresh');
          },
          '.todo-label:dblclick': function (event) {
            var item = this.parentNode.parentNode;
            item.classList.add('editing');
          },
          '.destroy:click': function (event, todoItem) {
            todoItem.destroy();
            bus.publish('todos', 'todo:remove', {
              item: {
                id: todoItem.id,
                text: todoItem.text,
                checked: todoItem.checked
              }
            });
            bus.publish('todos', 'filter:refresh');
          },
          '.edit:keydown': function (event, todoItem) {
            var todoElement = this.parentNode;
            if ([ 9, 13, 27 ].indexOf(event.keyCode) > -1) {
              event.preventDefault();
              this.blur();
              koyote.TodoItem.update(todoItem, todoElement);
              bus.publish('todos', 'filter:refresh');
            }
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
