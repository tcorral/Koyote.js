App.TodoList = App.Widget.mix(
{
	constructor: function( container )
	{
		App.callConstructor( 'Widget', this, [ container, 'todo-list' ] );
	},
	'@template': '<ul id="{{ id }}" />',
	'@render': function()
	{
		App.callProtoMethod( 'Widget', 'render', this, [
		{
			type: this.type,
			id: this.id
		} ] );
	},
	'@domEvents':
	{
		'.todo-check:change': function( event )
		{
			this.parentNode.classList.toggle( 'todo-done' );

			App.Bus.publish( 'todos', 'todo:toggle',
			{
				id: this.id,
				checked: !!this.checked
			} );
		},
		'.todo-label:keypress': function( event )
		{
			if ( [ 13, 27 ].indexOf( event.keyCode ) > -1 )
			{
				event.preventDefault();
				this.blur();
				return;
			}
		},
		'.todo-label:input': function( event )
		{
			App.Bus.publish( 'todos', 'todo:update',
			{
				id: this.getAttribute( 'data-id' ),
				text: this.innerHTML
			} );
		}
	}
} );
