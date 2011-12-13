# Add context alias to describe for specs.
window.context = describe

# Add custom matchers.
beforeEach ->
  
  @addMatchers {
    
    toCall: (object, fn) ->
      
      if typeof this.actual != 'function'
        throw new Error('Actual is not a function')
      
      spy = spyOn( object, fn )
    
      this.actual()

      this.message = ->
        [
          "Expected function to call #{fn}, but it never did.",
          "Expected function not to call #{fn}, but it did."
        ]
      
      spy.wasCalled

    toCallWith: (object, fn, expectedArgs) ->

      if typeof this.actual != 'function'
        throw new Error('Actual is not a function')
      
      spy = spyOn( object, fn )
    
      this.actual()

      this.message = ->
        if spy.callCount == 0
          [
            "Expected function to call #{fn}, but it never did.",
            "Expected function not to call #{fn}, but it did."
          ]
        else
          [
            "Expected function to call #{fn} with #{jasmine.pp(expectedArgs)} but was called with #{jasmine.pp(spy.argsForCall)}.",
            "Expected function not to call #{fn} with #{jasmine.pp(expectedArgs)}."
          ]
      
      this.env.contains_(spy.argsForCall, expectedArgs)
      
  }