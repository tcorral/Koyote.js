( function( root, ns, und )
{
	var sNotDefined = 'undefined';
	var bDebug = true;
	var oChannels = {};
	var _false_ = false;
	var sObjectType = 'object';
	var Bus;
	var ErrorHandler = console;

	function copyArray( oLikeArray )
	{
		return [].slice.call( oLikeArray, 0 );
	}

	function isInstanceOf( oInstance, oConstructor )
	{
		return oInstance instanceof oConstructor;
	}

	function isEvent( oObj )
	{
		try
		{
			return isInstanceOf( oObj, Event );
		}
		catch ( erError )
		{
			// Duck typing detection (If it sounds like a duck and it moves like a duck, it's a duck)
			if ( oObj.altKey !== und && ( oObj.srcElement || oObj.target ) )
			{
				return true;
			}
		}
		return _false_;
	}

	function isJqueryObject( oObj )
	{
		var isJquery = _false_,
			$ = root.jQuery;
		if ( $ )
		{
			isJquery = isInstanceOf( oObj, $ );
		}
		return isJquery;
	}

	function isTypeOf( oMix, sType )
	{
		return typeof oMix === sType;
	}

	function preprocessorsPublishData( oData )
	{
		return oData;
	}

	function iterateObject( oObject, fpProcess )
	{
		var sKey;

		for ( sKey in oObject )
		{
			if ( oObject.hasOwnProperty( sKey ) )
			{
				fpProcess( oObject[ sKey ], sKey );
			}
		}
	}

	function _removeSubscribers( aSubscribers, oSubscriber )
	{
		var nUnsubscribed = 0,
			nIndex;
		if ( !isTypeOf( aSubscribers, sNotDefined ) )
		{
			nIndex = aSubscribers.length - 1;
			for ( ; nIndex >= 0; nIndex-- )
			{
				if ( aSubscribers[ nIndex ].subscriber === oSubscriber )
				{
					nUnsubscribed++;
					aSubscribers.splice( nIndex, 1 );
				}
			}
		}
		return nUnsubscribed;
	}

	function _removeSubscribersPerEvent( oEventsCallbacks, sChannelId, oSubscriber )
	{
		var aEventsParts, sChannel, sEventType, nUnsubscribed = 0;
		iterateObject( oEventsCallbacks, function( oItem, sEvent )
		{
			aEventsParts = sEvent.split( ':' );
			sChannel = sChannelId;
			sEventType = sEvent;
			if ( aEventsParts[ 0 ] === 'global' )
			{
				sChannel = aEventsParts[ 0 ];
				sEventType = aEventsParts[ 1 ];
			}
			nUnsubscribed += _removeSubscribers( oChannels[ sChannel ][ sEventType ], oSubscriber );
		} );
		return nUnsubscribed;
	}

	function _getChannelEvents( sChannelId, sEvent )
	{
		if ( oChannels[ sChannelId ] === und )
		{
			oChannels[ sChannelId ] = {};
		}
		if ( oChannels[ sChannelId ][ sEvent ] === und )
		{
			oChannels[ sChannelId ][ sEvent ] = [];
		}
		return oChannels[ sChannelId ][ sEvent ];
	}

	function clone( oObject )
	{
		var oCopy;
		/*
     Handle null, undefined, DOM element, Event and jQuery objects,
     and all the objects that are instances of a constructor different from Object.
     */
		if ( null == oObject || // Is null or undefined
			!isTypeOf( oObject, sObjectType ) || // Is not an object (primitive)
			oObject.constructor.toString().indexOf( 'Object()' ) === -1 || // Is an instance
			isEvent( oObject ) || // Is an event
			isJqueryObject( oObject ) || // Is a jQuery object
			( oObject.nodeType && oObject.nodeType === 1 ) )
		{ // Is a DOM element
			return oObject;
		}

		// Handle Date
		if ( isInstanceOf( oObject, Date ) )
		{
			oCopy = new Date();
			oCopy.setTime( oObject.getTime() );
			return oCopy;
		}

		// Handle Array
		if ( isInstanceOf( oObject, Array ) )
		{
			oCopy = copyArray( oObject );
			return oCopy;
		}

		// Handle Object
		if ( isInstanceOf( oObject, Object ) )
		{
			oCopy = {};
			iterateObject( oObject, function( oItem, sKey )
			{
				oCopy[ sKey ] = clone( oItem );
			} );
			return oCopy;
		}

		throw new Error( 'Unable to copy object!' );
	}

	function _addSubscribers( oEventsCallbacks, sChannelId, oSubscriber )
	{
		iterateObject( oEventsCallbacks, function( oItem, sEvent )
		{
			Bus.subscribeTo( sChannelId, sEvent, oItem, oSubscriber );
		} );
	}

	function _executeHandler( oHandlerObject, oData, sChannelId, sEvent )
	{
		oHandlerObject.handler.call( oHandlerObject.subscriber, oData );
		if ( bDebug )
		{
			ErrorHandler.log( sChannelId, sEvent, oHandlerObject );
		}
	}

	function subscribersByEvent( oChannel, sEventName )
	{
		var aSubscribers = [];
		if ( !isTypeOf( oChannel, sNotDefined ) )
		{
			iterateObject( oChannel, function( oItem, sKey )
			{
				if ( sKey === sEventName )
				{
					aSubscribers = oItem;
				}
			} );
		}
		return aSubscribers;
	}
	Bus = {
		subscribers: function( sChannelId, sEventName )
		{
			return subscribersByEvent( oChannels[ sChannelId ], sEventName );
		},

		/**
		 * Method to unsubscribe a subscriber from a channel and event type.
		 * It iterates in reverse order to avoid messing with array length when removing items.
		 * @param {String} sChannelId
		 * @param {String} sEventType
		 * @param {Object} oSubscriber
		 */
		unsubscribeFrom: function( sChannelId, sEventType, oSubscriber )
		{
			var aChannelEvents = _getChannelEvents( sChannelId, sEventType ),
				oItem,
				nEvent = aChannelEvents.length - 1;

			for ( ; nEvent >= 0; nEvent-- )
			{
				oItem = aChannelEvents[ nEvent ];
				if ( oItem.subscriber === oSubscriber )
				{
					aChannelEvents.splice( nEvent, 1 );
				}
			}
		},

		/**
		 * Method to add a single callback in one channel an in one event.
		 * @param {String} sChannelId
		 * @param {String} sEventType
		 * @param {Function} fpHandler
		 * @param {Object} oSubscriber
		 */
		subscribeTo: function( sChannelId, sEventType, fpHandler, oSubscriber )
		{
			var aChannelEvents = _getChannelEvents( sChannelId, sEventType );
			aChannelEvents.push(
			{
				subscriber: oSubscriber,
				handler: fpHandler
			} );
		},

		/**
		 * subscribe method gets the oEventsCallbacks object with all the handlers and add these handlers to the channel.
		 * @param {Object} oSubscriber
		 * @return {Boolean}
		 */
		subscribe: function( oSubscriber )
		{
			console.info( 'Bus.subscribe', arguments );
			var oEventsCallbacks = oSubscriber.events;
			if ( !oSubscriber || oEventsCallbacks === und )
			{
				return _false_;
			}
			iterateObject( oEventsCallbacks, function( oItem, sChannelId )
			{
				if ( oChannels[ sChannelId ] === und )
				{
					oChannels[ sChannelId ] = {};
				}
				_addSubscribers( oItem, sChannelId, oSubscriber );
			} );

			return true;
		},

		/**
		 * unsubscribe gets the oEventsCallbacks methods and removes the handlers of the channel.
		 * @param {Object} oSubscriber
		 * @return {Boolean}
		 */
		unsubscribe: function( oSubscriber )
		{
			var nUnsubscribed = 0,
				oEventsCallbacks = oSubscriber.events;
			if ( !oSubscriber || oEventsCallbacks === und )
			{
				return _false_;
			}
			iterateObject( oEventsCallbacks, function( oItem, sChannelId )
			{
				if ( oChannels[ sChannelId ] === und )
				{
					oChannels[ sChannelId ] = {};
				}
				nUnsubscribed = _removeSubscribersPerEvent( oItem, sChannelId, oSubscriber );
			} );

			return nUnsubscribed > 0;
		},

		/**
		 * Publish the event in one channel.
		 * @param {String} sChannelId
		 * @param {String} sEvent
		 * @param {String} oData
		 * @return {Boolean}
		 */
		publish: function( sChannelId, sEvent, oData )
		{
			console.info( 'Bus.publish', arguments );
			var aSubscribers = copyArray( this.subscribers( sChannelId, sEvent ) ),
				oSubscriber,
				nLenSubscribers = aSubscribers.length;
			if ( nLenSubscribers === 0 )
			{
				return _false_;
			}
			oData = preprocessorsPublishData( oData );
			while ( !!( oSubscriber = aSubscribers.shift() ) )
			{
				_executeHandler( oSubscriber, oData, sChannelId, sEvent );
			}
			return true;
		},

		/**
		 * Sets the preprocessor of data before send the data to handlers.
		 * @param {Function} fpCallback
		 */
		preprocessorPublishData: function( fpCallback )
		{
			preprocessorsPublishData = function( oData )
			{
				return fpCallback( oData, clone );
			};
		},

		/**
		 * Reset channels
		 */
		reset: function()
		{
			oChannels = {
				global:
				{}
			};
		},
		getCopyChannels: function()
		{
			return clone( oChannels );
		},
		__type__: 'bus'
	};
	ns.Bus = Bus;
}( window, ( App = window.App ||
{} ) ) );
