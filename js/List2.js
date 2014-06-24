/**
 * Created by amischol on 21/06/14.
 */
App.List2 = App.List.extend({
  constructor: function () {
    App.List.constructor.apply(this, arguments);
    this.name = 'list2';
  },
  '@render': function () {
    alert('ein');
    this.getContainer().appendChild(this.mainLayer);
  }
});