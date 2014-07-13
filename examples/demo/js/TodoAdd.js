(function (koyote) {
  'use strict';
  function adapter(koyote, bus, widget){
    return (koyote.TodoAdd = widget.mix(
      {
        constructor: function( container )
        {
          koyote.callMethod( 'Widget.constructor', this, [ container, 'todo-add' ] );
        },
        '@template': '<input type="text" class="todo-add" id="{{ id }}" value="" placeholder="New todo(s)..." />',
        '@render': function()
        {
          koyote.callMethod( 'Widget.render', this, [
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
                  bus.publish( 'todos', 'list:add',
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
      } ));
  }

  if (typeof define !== 'undefined') {
    define('koyote-todo-add', ['koyote', 'koyote-bus', 'koyote-widget'], adapter);
  } else {
    adapter(koyote, koyote.Bus, koyote.Widget);
  }
}(Koyote));
