( function( win, koyote )
{
	'use strict';

	var localStorage = win.localStorage
    , JSON = win.JSON
    , _defaultTodos = {
      'go-running':
      {
        id: 'go-running',
        text: 'Go running (default)',
        checked: false
      },
      'drink':
      {
        id: 'drink',
        text: 'Drink (default)',
        checked: false
      },
      'sleep':
      {
        id: 'sleep',
        text: 'Sleep (default)',
        checked: false
      }
    };

  function adapter(koyote, bus, component) {
    return (koyote.TodoStorage = component.mix(
      {
        constructor: function()
        {
          koyote.callMethod( 'Component.constructor', this, [ 'todo-storage' ] );

          this.todos = {};
          this.restore();

          bus.subscribe( this );
          bus.publish( 'todos', 'list:restore', this.todos );
        },
        '@events':
        {
          'todos':
          {
            'todo:update': function( data )
            {
              data.todos.forEach( this.save.bind( this ) );
            },
            'todo:add': function( data )
            {
              data.todos.forEach( this.save.bind( this ) );
            }
          }
        },
        '@save': function( todoData )
        {
          this.todos[ todoData.id ] = todoData;
          localStorage.setItem( 'todos', JSON.stringify( this.todos ) );
        },
        '@restore': function()
        {
          this.todos = JSON.parse( localStorage.getItem( 'todos' ) ) || _defaultTodos;
        }
      } ));
  }


  if (typeof define !== 'undefined') {
    define('koyote-todo-storage', ['koyote', 'koyote-bus', 'koyote-component'], adapter);
  } else {
    adapter(koyote, koyote.Bus, koyote.Component);
  }
}( window, Koyote ) );
