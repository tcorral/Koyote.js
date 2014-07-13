( function (root, koyote, und) {
  'use strict';
  var _undefined_ = 'undefined', _false_ = false, debug = _false_, channels = {}, log = console.log, Bus;

  /**
   * Returns a copy of an array
   * @param {*} likeArray
   * @returns {Array}
   * @private
   */
  function _copyArray(likeArray) {
    return likeArray.concat();
  }

  /**
   * Checks the instance of an object and a constructor.
   * @param {Object} instance
   * @param {*} constructor
   * @returns {boolean}
   * @private
   */
  function _isInstanceOf(instance, constructor) {
    return instance instanceof constructor;
  }

  /**
   * Checks if the object is an Event.
   * @param {*} obj
   * @returns {boolean}
   * @private
   */
  function _isEvent(obj) {
    try {
      return _isInstanceOf(obj, Event);
    }
    catch (error) {
      // Duck typing detection (If it sounds like a duck and it moves like a duck, it's a duck)
      if (obj.altKey !== und && ( obj.srcElement || obj.target )) {
        return true;
      }
    }
    return _false_;
  }

  /**
   * Checks if an object is jQuery.
   * @param {*} obj
   * @returns {boolean}
   * @private
   */
  function _isJqueryObject(obj) {
    var $ = root.jQuery;
    return $ ? _isInstanceOf(obj, $) : _false_;
  }

  /**
   * Wraps the typeof sentence to improve minification.
   * @param {*} mix
   * @param {String} type
   * @returns {boolean}
   * @private
   */
  function _isTypeOf(mix, type) {
    return typeof mix === type;
  }

  /**
   * Default preprocessor data.
   * @param {Object} data
   * @returns {*}
   * @private
   */
  function _preprocessorsPublishData(data) {
    return data;
  }

  /**
   * Wraps for..in to reduce duplicity.
   * @param obj
   * @param callback
   * @private
   */
  function _forIn(obj, callback) {
    for (var sKey in obj) {
      if (obj.hasOwnProperty(sKey)) {
        callback.call(obj, obj[ sKey ], sKey);
      }
    }
  }

  /**
   * Removes the subscribers and returns the number of removed items.
   * @param {Array} subscribers
   * @param {Object} subscriber
   * @returns {number}
   * @private
   */
  function _removeSubscribers(subscribers, subscriber) {
    var unsubscribed = 0, index;
    if (!_isTypeOf(subscribers, _undefined_)) {
      index = subscribers.length - 1;
      for (; index >= 0; index--) {
        if (subscribers[ index ].subscriber === subscriber) {
          unsubscribed++;
          subscribers.splice(index, 1);
        }
      }
    }
    return unsubscribed;
  }

  /**
   * Removes the subscribers of an specific event.
   * @param {Object} eventsCallbacks
   * @param {String} channelId
   * @param {Object} subscriber
   * @returns {number}
   * @private
   */
  function _removeSubscribersPerEvent(eventsCallbacks, channelId, subscriber) {
    var eventsParts, channel, eventType, unsubscribed = 0;
    _forIn(eventsCallbacks, function (item, event) {
      eventsParts = event.split(':');
      channel = channelId;
      eventType = event;
      if (eventsParts[ 0 ] === 'global') {
        channel = eventsParts[ 0 ];
        eventType = eventsParts[ 1 ];
      }
      unsubscribed += _removeSubscribers(channels[ channel ][ eventType ], subscriber);
    });
    return unsubscribed;
  }

  /**
   * Return the channel of events.
   * @param {String} channelId
   * @param {String} event
   * @returns {*}
   * @private
   */
  function _getChannelEvents(channelId, event) {
    if (channels[ channelId ] === und) {
      channels[ channelId ] = {};
    }
    if (channels[ channelId ][ event ] === und) {
      channels[ channelId ][ event ] = [];
    }
    return channels[ channelId ][ event ];
  }

  /**
   * Clones an object
   * @param {*} obj
   * @returns {*}
   */
  function clone(obj) {
    var copy;
    /*
     Handle null, undefined, DOM element, Event and jQuery objects,
     and all the objects that are instances of a constructor different from Object.
     */
    if (null == obj || // Is null or undefined
      !_isTypeOf(obj, 'object') || // Is not an object (primitive)
      obj.constructor.toString().indexOf('Object()') === -1 || // Is an instance
      _isEvent(obj) || // Is an event
      _isJqueryObject(obj) || // Is a jQuery object
      ( obj.nodeType && obj.nodeType === 1 )) { // Is a DOM element
      return obj;
    }

    // Handle Date
    if (_isInstanceOf(obj, Date)) {
      copy = new Date();
      copy.setTime(obj.getTime());
      return copy;
    }

    // Handle Array
    if (_isInstanceOf(obj, Array)) {
      copy = _copyArray(obj);
      return copy;
    }

    // Handle Object
    if (_isInstanceOf(obj, Object)) {
      copy = {};
      _forIn(obj, function (oItem, sKey) {
        copy[ sKey ] = clone(oItem);
      });
      return copy;
    }

    throw ('Unable to copy object!');
  }

  /**
   * Adds subscribers to a channel.
   * @param {Object} eventsCallbacks
   * @param {String} channelId
   * @param {Object} subscriber
   * @private
   */
  function _addSubscribers(eventsCallbacks, channelId, subscriber) {
    _forIn(eventsCallbacks, function (item, event) {
      Bus.subscribeTo(channelId, event, item, subscriber);
    });
  }

  /**
   * Executes the handler.
   * @param {Object} handlerObject
   * @param {Object} data
   * @param {String} channelId
   * @param {String} event
   * @private
   */
  function _executeHandler(handlerObject, data, channelId, event) {
    handlerObject.handler.call(handlerObject.subscriber, data);
    debug && log(channelId, event, handlerObject);
  }

  /**
   * Returns the subscriber of an event.
   * @param {String} channel
   * @param {String} eventName
   * @returns {Array}
   * @private
   */
  function _subscribersByEvent(channel, eventName) {
    var subscribers = [];
    if (!_isTypeOf(channel, _undefined_)) {
      _forIn(channel, function (item, event) {
        if (event === eventName) {
          subscribers = item;
        }
      });
    }
    return subscribers;
  }

  Bus = {
    /**
     * Get the subscribers.
     * @param {String} channelId
     * @param {String} eventName
     * @returns {Array}
     */
    subscribers: function (channelId, eventName) {
      return _subscribersByEvent(channels[ channelId ], eventName);
    },

    /**
     * Method to unsubscribe a subscriber from a channel and event type.
     * It iterates in reverse order to avoid messing with array length when removing items.
     * @param {String} channelId
     * @param {String} eventType
     * @param {Object} subscriber
     */
    unsubscribeFrom: function (channelId, eventType, subscriber) {
      var channelEvents = _getChannelEvents(channelId, eventType), item, event = channelEvents.length - 1;
      for (; event >= 0; event--) {
        item = channelEvents[ event ];
        if (item.subscriber === subscriber) {
          channelEvents.splice(event, 1);
        }
      }
    },

    /**
     * Method to add a single callback in one channel an in one event.
     * @param {String} channelId
     * @param {String} eventType
     * @param {Function} handler
     * @param {Object} subscriber
     */
    subscribeTo: function (channelId, eventType, handler, subscriber) {
      var channelEvents = _getChannelEvents(channelId, eventType);
      channelEvents.push(
        {
          subscriber: subscriber,
          handler: handler
        });
    },

    /**
     * subscribe method gets the eventsCallbacks object with all the handlers and add these handlers to the channel.
     * @param {Object} subscriber
     * @return {Boolean}
     */
    subscribe: function (subscriber) {
      var eventsCallbacks = subscriber.events;
      if (!subscriber || eventsCallbacks === und) {
        return _false_;
      }
      _forIn(eventsCallbacks, function (item, channelId) {
        if (channels[ channelId ] === und) {
          channels[ channelId ] = {};
        }
        _addSubscribers(item, channelId, subscriber);
      });

      return true;
    },

    /**
     * unsubscribe gets the eventsCallbacks methods and removes the handlers of the channel.
     * @param {Object} subscriber
     * @return {Boolean}
     */
    unsubscribe: function (subscriber) {
      var unsubscribed = 0, eventsCallbacks = subscriber.events;
      if (!subscriber || eventsCallbacks === und) {
        return _false_;
      }
      _forIn(eventsCallbacks, function (item, channelId) {
        if (channels[ channelId ] === und) {
          channels[ channelId ] = {};
        }
        unsubscribed = _removeSubscribersPerEvent(item, channelId, subscriber);
      });

      return unsubscribed > 0;
    },

    /**
     * Publish the event in one channel.
     * @param {String} channelId
     * @param {String} event
     * @param {String} data
     * @return {Boolean}
     */
    publish: function (channelId, event, data) {
      var subscribers = _copyArray(this.subscribers(channelId, event)), lenSubscribers = subscribers.length, subscriber;
      if (lenSubscribers === 0) {
        return _false_;
      }
      data = _preprocessorsPublishData(data);
      while (!!( subscriber = subscribers.shift() )) {
        _executeHandler(subscriber, data, channelId, event);
      }
      return true;
    },

    /**
     * Sets the preprocessor of data before send the data to handlers.
     * @param {Function} callback
     */
    preprocessorPublishData: function (callback) {
      _preprocessorsPublishData = function (oData) {
        return callback(oData, clone);
      };
    },

    /**
     * Reset channels to its default value.
     */
    reset: function () {
      channels = {
        global: {}
      };
    },
    /**
     * Sets the debug option to allow debugging events.
     * @param {boolean} deb
     */
    setDebug: function (deb) {
      debug = deb;
    },
    /**
     * Returns a copy of the channels.
     * @returns {*}
     */
    getCopyChannels: function () {
      return clone(channels);
    }
  };

  function adapter(koyote) {
    /**
     * Expose Bus to acces from Koyote.
     */
    return (koyote.Bus = Bus);
  }


  if (typeof define !== _undefined_) {
    define('koyote-bus', ['koyote'], adapter);
  } else {
    adapter(koyote);
  }
}(this, ( Koyote = this.Koyote || {} )) );