( function( win, doc, app )
{
	'use strict';

	App.TodoList = App.Widget.mix(
	{
		constructor: function( container )
		{
			var self = this;

			App.callMethod( 'Widget.constructor', this, [ container, 'todo-list' ] );

			App.Bus.subscribeTo( 'todos', 'todos:restore', function( todos )
			{
				for ( var id in todos )
				{
					if ( todos.hasOwnProperty( id ) )
					{
						var todo = todos[ id ];
						self.add( App.create( 'TodoItem', todo ) );
					}
				}
			} );
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
		publishUpdates: function( todoItem )
		{
			App.Bus.publish( 'todos', 'todo:toggleState',
			{
				id: todoItem.id,
				checked: !!todoItem.querySelector( '.todo-check' ).checked,
				text: todoItem.querySelector( '.todo-label' ).innerHTML
			} );
		},
		'@domEvents':
		{
			'.todo-check:change': function( event )
			{
				var todoItem = this.parentNode;
				todoItem.classList.toggle( 'todo-done' );
				App.TodoList.publishUpdates( todoItem );
			},
			'.todo-label:input': function( event )
			{
				App.TodoList.publishUpdates( this.parentNode );
			},
			'.todo-label:keypress': function( event )
			{
				if ( [ 13, 27 ].indexOf( event.keyCode ) > -1 )
				{
					event.preventDefault();
					this.blur();
					return;
				}
			}
		}
	} );
}( window, document, App ) );