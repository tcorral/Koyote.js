requirejs.config({
  paths: {
    "koyote": '../../lib/Koyote',
    "koyote-bus": '../../lib/Bus',
    "koyote-component": '../../lib/Component',
    "koyote-widget": '../../lib/Widget',
    "koyote-todo-add": '../../demo/js/TodoAdd',
    "koyote-todo-item": '../../demo/js/TodoItem',
    "koyote-todo-list": '../../demo/js/TodoList',
    "koyote-todo-storage": '../../demo/js/TodoStorage',
  }
});
requirejs(['koyote', 'koyote-todo-item', 'koyote-todo-list', 'koyote-todo-storage', 'koyote-todo-add'],
  function (koyote) {
    'use strict';
    var form = document.getElementById('todo-form'),
      todoList = koyote.create('TodoList', form),
      addInput = koyote.create('TodoAdd', form),
      storage = koyote.create('TodoStorage');

    addInput.render();
    todoList.add(storage).render();
  });