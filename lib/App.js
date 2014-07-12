( function( win )
{
	var _noOp = function() {},
		_getMethod = function( componentName, methodName )
		{
			var component = App[ componentName ],
				method,
				errMsg;

			if ( !component )
			{
				errMsg = 'The type "' + componentName + '" does not exist!';
			}
			else if ( methodName )
			{
				if ( component[ methodName ] )
				{
					method = component[ methodName ];
				}
				else if ( component.constructor.prototype[ methodName ] )
				{
					method = component.constructor.prototype[ methodName ];
				}

				if ( !methodName )
				{
					errMsg = 'Failed to call "' + componentName + '.' + methodName + '"!';
				}
			}

			if ( errMsg )
			{
				console.error( errMsg );
				throw ( errMsg );
			}

			return method;
		},
		_forIn = function( obj, callback )
		{
			for ( var prop in obj )
			{
				if ( obj.hasOwnProperty( prop ) && prop !== 'constructor' )
				{
					callback.call( obj, obj[ prop ], prop );
				}
			}
		};

	var App = {
		constructor: _noOp,
		create: function( componentName )
		{
			var args = [].slice.call( arguments, 1 );
			args.unshift( null );
			var constructor = Function.bind.apply( _getMethod( componentName, 'constructor' ), args );
			return new constructor();
		},
		callMethod: function( fullMethodName, component, args )
		{
			var parts = fullMethodName.split( '.' ),
				componentName = parts[ 0 ],
				methodName = parts[ 1 ],
				method = _getMethod( componentName, methodName );

			return method.apply( component, args );
		},
		mix: function( source )
		{
			var obj = {},
				app = App,
				key;

			if ( this )
			{
				app = this;
			}

			obj.constructor = source.constructor || app.constructor || _noOp;

			_forIn( app, function( value, key )
			{
				obj[ key ] = value;
			} );

			_forIn( app.constructor, function( value, key )
			{
				obj.constructor[ key ] = value;
			} );

			_forIn( app.constructor.prototype, function( value, key )
			{
				obj.constructor.prototype[ key ] = value;
			} );

			_forIn( source, function( value, key )
			{
				if ( key[ 0 ] === '@' )
				{
					obj.constructor.prototype[ key.substr( 1 ) ] = value;
				}
				else
				{
					obj[ key ] = value;
				}
			} );

			return obj;
		}
	};

	win.App = App;
}( window ) );
