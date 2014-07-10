( function( win )
{
	var App = {
		constructor: function() {},
		create: function( componentName )
		{
			var args = [].slice.call( arguments, 1 );
			args.unshift( null );
			var constructor = Function.bind.apply( App[ componentName ].constructor, args );
			return new constructor();
		},
		mix: function( source )
		{
			var obj = {};
			var app = App;
			var key;

			if ( this )
			{
				app = this;
			}

			obj.constructor = source.constructor || app.constructor || function() {};

			for ( key in app )
			{
				if ( app.hasOwnProperty( key ) )
				{
					if ( key !== 'constructor' )
					{
						obj[ key ] = app[ key ];
					}
				}
			}
			for ( key in app.constructor )
			{
				if ( app.constructor.hasOwnProperty( key ) )
				{
					if ( key !== 'constructor' )
					{
						obj.constructor[ key ] = app.constructor[ key ];
					}
				}
			}
			for ( key in app.constructor.prototype )
			{
				if ( app.constructor.prototype.hasOwnProperty( key ) )
				{
					if ( key !== 'constructor' )
					{
						obj.constructor.prototype[ key ] = app.constructor.prototype[ key ];
					}
				}
			}
			for ( key in source )
			{
				if ( source.hasOwnProperty( key ) )
				{
					if ( key !== 'constructor' )
					{
						if ( key.indexOf( '@' ) === 0 )
						{
							obj.constructor.prototype[ key.replace( '@', '' ) ] = source[ key ];
						}
						else
						{
							obj[ key ] = source[ key ];
						}
					}
				}
			}

			return obj;
		},
		callConstructor: function( componentName, component, args )
		{
			App[ componentName ].constructor.apply( component, args );
		},
		callProtoMethod: function( componentName, methodName, component, args )
		{
			App[ componentName ].constructor.prototype[ methodName ].apply( component, args );
		}
	};

	win.App = App;
}( window ) );
