App.TodoAdd = App.Widget.mix(
{
	constructor: function( container )
	{
		App.callMethod( 'Widget.constructor', this, [ container, 'todo-add' ] );
	},
	'@template': '<input type="text" class="todo-add" id="{{ id }}" value="" placeholder="New todo(s)..." />',
	'@render': function()
	{
		App.callMethod( 'Widget.render', this, [
		{
			type: this.type,
			id: this.id
		} ] );
	},
	'@domEvents':
	{
		'keypress': function( event )
		{
			var keyCode = event.keyCode;

			switch ( keyCode )
			{
				case 27:
					this.value = '';
					this.blur();
					break;

				case 13:
					event.preventDefault();

					this.value = this.value.trim();

					var newTodos = this.value.split( ',' ).filter( function( todoText )
					{
						return !!todoText.trim();
					} );

					if ( newTodos.length )
					{
						App.Bus.publish( 'todos', 'list:add',
						{
							todos: newTodos
						} );
					}

					this.value = '';
					break;

				default:
					break;
			}
		}
	}
} );
