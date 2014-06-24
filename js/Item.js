/**
 * Created by amischol on 21/06/14.
 */
App.Item = App.Component.extend({
  constructor: function (text, href) {
    App.Component.constructor.apply(this, arguments);
    this.name = 'item';
    this.href = href;
    this.text = text;
    this.listening = {
      "link:click": function (data) {
        console.log(this.getUniqueId(), data.target);
      }
    };
  },
  '@template': '<a href="{{href}}">{{text}}</a>',
  '@render': function () {
    var item = this.mainLayer;
    var that = this;
    var template = this.renderTemplate({
      href: this.href,
      text: this.text
    });
    var link = template.doc.querySelector('a');
    link.addEventListener('click', function (event) {
      event.preventDefault();
      alert('Item');
      that.publish('link:click', event);
    }, false);

    item.appendChild(template.doc);
    this.getContainer().appendChild(item);
  }
});