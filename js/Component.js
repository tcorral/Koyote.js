/**
 * Created by amischol on 21/06/14.
 */
App.Component = App.extend({
  constructor: function () {
    var uniqueId = (function (rnd) {
      return '_' + rnd.toString(36).substr(2, 9);
    }(Math.random()));
    var parent = null;
    var Bus = null;
    var container = null;
    this.name = '';
    this.mainLayer = null;
    this.components = [];
    this.events = {};
    this.listening = {};
    this.getBus = function () {
      return Bus;
    };
    this.setBus = function (oBus) {
      Bus = oBus;
      return this;
    };
    this.setContainer = function (cont) {
      container = cont;
      return this;
    };
    this.getContainer = function () {
      return container;
    };
    this.getUniqueId = function () {
      return uniqueId;
    };
    this.setParent = function (parentComponent, component){
      parent = parentComponent;
      component.setBus(parent.getBus());
      component.components.forEach(function (child) {
        child.setParent(component, child);
      });
      component.setContainer(parent.mainLayer);
    };
    this.getParent = function () {
      return parent;
    };
  },
  '@template': '',
  '@renderTemplate': function (data) {
    var replaceTemplate = /\{\{([^\}]*)\}\}/gi;
    var renderedTemplate = this.template;
    var result;
    var docFrag = document.createDocumentFragment();
    var layer = document.createElement('div');
    docFrag.appendChild(layer);
    while(result = replaceTemplate.exec(this.template)) {
      renderedTemplate = renderedTemplate.replace(result[0], data[result[1]]);
    }
    layer.innerHTML = renderedTemplate;
    var childrenInLayer = [].slice.call(layer.childNodes);
    childrenInLayer.forEach(function (node) {
      docFrag.appendChild(node);
    });
    docFrag.removeChild(layer);
    return {
      html: renderedTemplate,
      doc: docFrag
    };
  },
  '@getChannelName': function () {
    var parent = this.getParent();
    var channelName;
    while(parent){
      if(parent.getParent() === null) {
        channelName = parent.getUniqueId();
      }
      parent = parent.getParent();
    }
    return channelName;
  },
  '@_setEvents': function () {
    var channel = this.getChannelName();
    if(typeof channel === 'undefined'){
      channel = this.getUniqueId();
    }
    if(!this.events[channel]) {
      this.events[channel] = {};
    }
    this.events[channel] = this.listening;
    this.getBus().subscribe(this);
  },
  '@publish': function publish(event, data) {
    console.log(this.getChannelName(), event, data);
    this.getBus().publish(this.getChannelName(), event, data);
  },
  '@setMainLayer': function (tag) {
    this.mainLayer = document.createElement(tag);
    return this;
  },
  '@add': function (component) {
    component.setParent(this, component);
    this.components.push(component);
    return this;
  },
  '@remove': function (component) {
    var position = this.components.indexOf(component);
    if(position !== -1){
      component.destroy();
      this.components.splice(position, 1);
    }
  },
  '@getChild': function (uniqueId) {
    var component = null;
    this.components.forEach(function (comp, index) {
      if(uniqueId === index || comp.getUniqueId() === uniqueId){
        component = comp;
      }
    });
    return component;
  },
  '@destroy': function () {
    this.getContainer().removeChild(this.mainLayer);
    this.setContainer(null);
    this.getBus().unsubscribe(this);
  },
  '@render': function () {
    throw new Error('Render method should be overwritten by components');
  },
  '@init': function () {
    this._setEvents();
    this.render();
    console.log(':::', this.name, this.events);
    this.components.forEach(function(child) {
      child.init();
    });
  }
});