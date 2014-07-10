( function( win, doc, app )
{
	'use strict';

	var _slice = Array.prototype.slice,
		_toArray = function( arrayLike )
		{
			return _slice.call( arrayLike );
		},
		_findLastElement = function( container )
		{
			var result = container && container.lastChild;

			while ( result && result.nodeType !== 1 )
			{
				result = result.previousSibling;
			}

			return result;
		},
		_renderTemplate = function( data, widget )
		{
			var replaceTemplate = /\{\{([^\}]*)\}\}/gi,
				renderedTemplate = widget.template,
				result,
				docFrag = doc.createDocumentFragment(),
				layer = doc.createElement( 'div' ),
				childrenInLayer,
				container;

			docFrag.appendChild( layer );

			while ( result = replaceTemplate.exec( widget.template ) )
			{
				renderedTemplate = renderedTemplate.replace( result[ 0 ], data[ result[ 1 ].trim() ] );
			}

			layer.innerHTML = renderedTemplate;

			childrenInLayer = _toArray( layer.childNodes );
			childrenInLayer.forEach( function( node )
			{
				docFrag.appendChild( node );
			} );

			docFrag.removeChild( layer );

			container = widget.getContainer();
			container.appendChild( docFrag );
			widget.element = _findLastElement( container );
		},
		_bindEvents = function( widget )
		{
			var element = widget.getElement(),
				domEvents = widget.domEvents,
				domCallbacks = widget.domCallbacks,
				eventParts,
				targetSelector,
				eventName,
				callback;

			for ( var e in domEvents )
			{
				if ( domEvents.hasOwnProperty( e ) )
				{
					eventParts = e.split( ':' );
					targetSelector = eventParts[ 1 ] && eventParts[ 0 ];
					eventName = eventParts[ 1 ] || eventParts[ 0 ];

					domCallbacks[ e ] = callback = _createCallback( element, domEvents[ e ], targetSelector );
					element.addEventListener( eventName, callback );
				}
			}
		},
		_createCallback = function( element, callback, targetSelector )
		{
			return function( event )
			{
				var target = event.target,
					targetElements;

				targetElements = targetSelector ? _slice.call( element.querySelectorAll( targetSelector ) ) : [ element ];

				while ( target !== doc && targetElements.indexOf( target ) === -1 )
				{
					target = target.parentNode;
				}

				if ( target !== doc )
				{
					callback.call( target, event );
				}
			};
		};

	app.Widget = app.Component.mix(
	{
		constructor: function( container, type, id )
		{
			app.callMethod( 'Component.constructor', this, [ type || 'widget', id ] );

			this.container = container;
			this.element = null;
			this.domCallbacks = {};
		},
		'@getContainer': function()
		{
			if ( !this.container )
			{
				var parent = this.getParent();
				this.container = parent && parent.getElement();
			}

			return this.container;
		},
		'@getElement': function()
		{
			return this.element;
		},
		'@template': '',
		'@render': function( data )
		{
			_renderTemplate( data, this );
			_bindEvents( this );

			this.render = function( data )
			{
				_renderTemplate( data, this );
			};
		},
		'@domEvents': {},
		'@destroy': function()
		{
			var domCallbacks = this.domCallbacks,
				element = this.getElement();

			for ( var e in domCallbacks )
			{
				if ( domCallbacks.hasOwnProperty( e ) )
				{
					element.removeEventListener( domCallbacks[ e ] );
				}
			}

			this.getContainer().removeChild( element );
			this.element = null;
			this.container = null;

			app.callMethod( 'Component.destroy', this );
		},
		'@init': function()
		{
			//console.info( 'Widget.init', this, this.getParent() );
			this.render();
			app.callMethod( 'Component.init', this );
			return this;
		}
	} );
}( window, document, App ) );
