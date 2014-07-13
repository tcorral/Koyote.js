describe('Koyote', function (){
  describe('mix', function () {
    it('should check that returns a new object', function () {
      var koyoteExtension = {}
        , koyoteExtended;

      koyoteExtended = Koyote.mix(koyoteExtension);

      expect(koyoteExtended).not.toBe(koyoteExtension);
    });
    it('should check that if we use mix with an empty object it should have have the same methods as Koyote', function () {
      var koyoteExtension = {}
        , keysKoyote = Object.keys(Koyote)
        , koyoteExtended
        , keyKoyote
        , keyExtended
        , indexKey
        , lenKeys = keysKoyote.length
        , keysExtended;

      koyoteExtended = Koyote.mix(koyoteExtension);
      keysExtended = Object.keys(koyoteExtended);

      expect(keysExtended.length).toEqual(keysKoyote.length);

      for(indexKey = 0; indexKey < lenKeys; indexKey++){
        keyKoyote = keysKoyote[indexKey];
        keyExtended = keysExtended[indexKey];
        expect(keyKoyote).toEqual(keyExtended);
        expect(typeof Koyote[keyKoyote]).toEqual(typeof Koyote[keyExtended]);
      }
    });
    it('should check that if we use mix with an object that extends the object it should have more methods', function () {
      var koyoteExtension = { my_method: function () {} }
        , keysKoyote = Object.keys(Koyote)
        , koyoteExtended
        , keyKoyote
        , keyExtended
        , indexKey
        , lenKeys = keysKoyote.length
        , keysExtended;

      koyoteExtended = Koyote.mix(koyoteExtension);
      keysExtended = Object.keys(koyoteExtended);

      expect(keysExtended.length).not.toEqual(keysKoyote.length);

      for(indexKey = 0; indexKey < lenKeys; indexKey++){
        keyKoyote = keysKoyote[indexKey];
        keyExtended = keysExtended[indexKey];
        expect(keyKoyote).toEqual(keyExtended);
        expect(typeof Koyote[keyKoyote]).toEqual(typeof Koyote[keyExtended]);
      }
      expect(koyoteExtended.my_method).toBeDefined();
    });
  });
  describe('create', function () {
    var extendedObject = {
      constructor: sinon.stub()
    };
    var param = 'test';
    Koyote.Extended = Koyote.mix(extendedObject);
    it('should check that the constructor is called', function () {
      Koyote.create('Extended');
      expect(extendedObject.constructor.callCount).toEqual(1);
    });
    it('should check that the constructor receives the arguments as expected', function (){
      Koyote.create('Extended', param);
      expect(extendedObject.constructor.calledWith(param)).toBeTruthy();
    });
  });
  describe('callMethod', function () {
    it('should check that we call my_method', function () {
      var extendedObject = {
        my_method: sinon.stub()
      };
      Koyote.Extended = Koyote.mix(extendedObject);
      Koyote.callMethod('Extended.my_method');
      expect(extendedObject.my_method.callCount).toEqual(1);
    });
    it('should check that we call my_method', function () {
      var extendedObject = {
        my_method: sinon.stub()
      };
      Koyote.Extended = Koyote.mix(extendedObject);
      Koyote.callMethod('Extended.my_method');
      expect(extendedObject.my_method.callCount).toEqual(1);
    });
    it('should check that we call my_method with arguments', function () {
      var extendedObject = {
        my_method: sinon.stub()
      };
      var test = 'test';
      var params = [test];
      Koyote.Extended = Koyote.mix(extendedObject);
      Koyote.callMethod('Extended.my_method', Koyote.Extended, params);
      expect(extendedObject.my_method.calledWith(test)).toBeTruthy();
    });
  });
});