App.TodoItem = App.Widget.mix(
{
	constructor: function( text )
	{
		App.callConstructor( 'Widget', this, [ null, 'todo-item' ] );
		this.text = text;
	},
	'@template': '<li class="todo-item"><input type="checkbox" id="{{ checkid }}" class="todo-check" value="{{ text }}" /><span class="todo-label" contenteditable="true" title="Edit" data-id="{{ checkid }}">{{ text }}</span></li>',
	'@render': function()
	{
		App.callProtoMethod( 'Widget', 'render', this, [
		{
			type: this.type,
			checkid: 'check-' + this.id,
			text: this.text
		} ] );
	}
} );
