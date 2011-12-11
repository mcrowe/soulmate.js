beforeEach(function() {
  this.addMatchers({
    toCall: function( object, fn ) {
      
      if (typeof this.actual != 'function') {
          throw new Error('Actual is not a function');
      }
      
      this.message = function(){
        return [
          "Expected function to call " + fn + ".",
          "Expected function not to call " + fn + "."
        ];
      }

      var spy = spyOn( object, fn );
    
      this.actual();
      
      return spy.wasCalled;
    },  
    toCallWith: function( object, fn, expectedArgs ) {

      if (typeof this.actual != 'function') {
          throw new Error('Actual is not a function');
      }
      
      var spy = spyOn( object, fn );
    
      this.actual();

      this.message = function(){
        if (spy.callCount === 0) {
          return [
            "Expected function to call " + fn + ".",
            "Expected function not to call " + fn + "."
          ];
        } else {
          return [
            "Expected function to call " + fn + " with " + jasmine.pp(expectedArgs) + " but was called with " + jasmine.pp(spy.argsForCall) + ".",
            "Expected function not to call " + fn + " with " + jasmine.pp(expectedArgs) + "."
          ]
        }
      }
      
      return this.env.contains_(spy.argsForCall, expectedArgs);
    }
    
  })
});
