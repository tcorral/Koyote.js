( function( win, app )
{
	'use strict';

	var _defaultTodos = {
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

	app.TodoStorage = app.Component.mix(
	{
		constructor: function()
		{
			app.callMethod( 'Component.constructor', this, [ 'todo-storage' ] );

			this.todos = {};
			this.restore();

			app.Bus.subscribe( this );
			app.Bus.publish( 'todos', 'list:restore', this.todos );
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
			win.localStorage.setItem( 'todos', win.JSON.stringify( this.todos ) );
		},
		'@restore': function()
		{
			this.todos = win.JSON.parse( win.localStorage.getItem( 'todos' ) ) || _defaultTodos;
		}
	} );
}( window, App ) );
