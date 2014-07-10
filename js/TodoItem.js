App.TodoItem = App.Widget.mix(
{
	constructor: function( data )
	{
		App.callMethod( 'Widget.constructor', this, [ null, 'todo-item', data.id ] );
		this.initText = data.text;
		this.initChecked = data.checked;
	},
	'@template': '<li class="todo-item {{ doneclass }}" id="{{ id }}"><input type="checkbox" class="todo-check" {{ checkedattr }} /><span class="todo-label" contenteditable="true" title="Click to edit">{{ text }}</span></li>',
	'@render': function()
	{
		var checkedAttr = '',
			doneClass = '';

		if ( !!this.initChecked )
		{
			checkedAttr = 'checked="checked"';
			doneClass = 'todo-done';
		}

		App.callMethod( 'Widget.render', this, [
		{
			type: this.type,
			id: this.id,
			text: this.initText,
			checkedattr: checkedAttr,
			doneclass: doneClass
		} ] );
	}
} );