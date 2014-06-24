/**
 * Created by amischol on 21/06/14.
 */
App.List = App.Component.extend({
  constructor: function () {
    App.Component.constructor.apply(this, arguments);
    this.name = 'list';
  },
  '@render': function () {
    this.getContainer().appendChild(this.mainLayer);
  }
});