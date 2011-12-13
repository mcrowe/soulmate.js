(function() {
  window.context = describe;
  beforeEach(function() {
    return this.addMatchers({
      toCall: function(object, fn) {
        var spy;
        if (typeof this.actual !== 'function') {
          throw new Error('Actual is not a function');
        }
        spy = spyOn(object, fn);
        this.actual();
        this.message = function() {
          return ["Expected function to call " + fn + ", but it never did.", "Expected function not to call " + fn + ", but it did."];
        };
        return spy.wasCalled;
      },
      toCallWith: function(object, fn, expectedArgs) {
        var spy;
        if (typeof this.actual !== 'function') {
          throw new Error('Actual is not a function');
        }
        spy = spyOn(object, fn);
        this.actual();
        this.message = function() {
          if (spy.callCount === 0) {
            return ["Expected function to call " + fn + ", but it never did.", "Expected function not to call " + fn + ", but it did."];
          } else {
            return ["Expected function to call " + fn + " with " + (jasmine.pp(expectedArgs)) + " but was called with " + (jasmine.pp(spy.argsForCall)) + ".", "Expected function not to call " + fn + " with " + (jasmine.pp(expectedArgs)) + "."];
          }
        };
        return this.env.contains_(spy.argsForCall, expectedArgs);
      }
    });
  });
}).call(this);
