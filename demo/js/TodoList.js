( function( win, doc, app )
{
	'use strict';

	App.TodoList = App.Widget.mix(
	{
		constructor: function( container )
		{
			App.callMethod( 'Widget.constructor', this, [ container, 'todo-list' ] );
			App.Bus.subscribe( this );
		},
		'@template': '<ul id="{{ id }}" />',
		'@render': function()
		{
			App.callMethod( 'Widget.render', this, [
			{
				type: this.type,
				id: this.id
			} ] );
		},
		'@addTodos': function( todos )
		{
			var self = this,
				storeData = {
					todos: []
				};

			todos.forEach( function( todoText )
			{
				var todo = app.create( 'TodoItem',
				{
					text: todoText
				} );

				self.add( todo );

				storeData.todos.push(
				{
					id: todo.id,
					text: todo.text,
					checked: todo.checked
				} );
			} );

			this.render();

			app.Bus.publish( 'todos', 'todo:add', storeData );
		},
		'@events':
		{
			'todos':
			{
				'list:restore': function( todos )
				{
					for ( var id in todos )
					{
						if ( todos.hasOwnProperty( id ) )
						{
							var todoData = todos[ id ];
							this.add( app.create( 'TodoItem', todoData ) );
						}
					}

					app.Bus.unsubscribeFrom( 'todos', 'list:restore', this );
				},
				'list:add': function( data )
				{
					this.addTodos( data.todos );
				}
			}
		}
	} );
}( window, document, App ) );
