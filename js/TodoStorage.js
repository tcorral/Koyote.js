( function( win, app )
{
	'use strict';

	var _defaultTodos = {
		'go-running':
		{
			id: 'go-running',
			text: 'Go running (default)'
		},
		'drink':
		{
			id: 'drink',
			text: 'Drink (default)'
		},
		'sleep':
		{
			id: 'sleep',
			text: 'Sleep (default)'
		}
	};

	app.TodoStorage = app.Component.mix(
	{
		constructor: function()
		{
			app.callMethod( 'Component.constructor', this, [ 'todo-storage' ] );

			this.todos = {};
			this.restore();

			app.Bus.subscribe( this );
			app.Bus.publish( 'todos', 'todos:restore', this.todos );
		},
		'@events':
		{
			'todos':
			{
				'todo:toggleState': function( todoData )
				{
					this.save( todoData );
				},
				'todo:updateText': function( todoData )
				{
					this.save( todoData );
				}
			}
		},
		'@save': function( todoData )
		{
			this.todos[ todoData.id ] = todoData;
			win.localStorage.setItem( 'todos', win.JSON.stringify( this.todos ) );
		},
		'@restore': function()
		{
			this.todos = win.JSON.parse( win.localStorage.getItem( 'todos' ) ) || _defaultTodos;
		}
	} );
}( window, App ) );