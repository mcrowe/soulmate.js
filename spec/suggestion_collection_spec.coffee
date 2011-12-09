SuggestionCollection = window._test.SuggestionCollection

describe 'SuggestionCollection', ->

  collection = null

  beforeEach ->
    callback = ->
    collection = new SuggestionCollection( callback, callback )

  describe '#initialize', ->
    
    it 'should set the render and select callbacks', ->
      renderCallback = -> 'render'
      selectCallback = -> 'select'
      collection = new SuggestionCollection( renderCallback, selectCallback )
      expect( collection.renderCallback() ).toEqual( 'render' )
      expect( collection.selectCallback() ).toEqual( 'select' )
      
    it 'should initialize the focusedIndex to -1', ->
      expect( collection.focusedIndex ).toEqual( -1 )
      
    it 'should initialize the suggestions to an empty array', ->
      expect( collection.suggestions ).toEqual( [] )
      
  describe 'with suggestions', ->
    
    beforeEach ->
      for i in [0..9]
        collection.suggestions.push( jasmine.createSpyObj('suggestion', ['blur', 'focus', 'select']) )
    
    describe '#count', ->
      
      it 'should return the number of suggestions', ->
        expect( collection.count() ).toEqual( 10 )
        
    describe '#blurAll', ->
      
      it 'should call blur on all of its suggestions', ->
        collection.blurAll()
        for i in [0..9]
          expect( collection.suggestions[i].blur ).toHaveBeenCalled()
          
    describe '#selectFocused', ->
      
      describe 'when a suggestion is focused', ->
        
        it 'should call "select" on the suggestion that is focused, with the selectCallback', ->
          collection.focus(1)
          collection.selectFocused()
          expect( collection.suggestions[1].select ).toHaveBeenCalledWith( collection.selectCallback )
          
        it 'should do nothing if no suggestion is focused', ->
          collection.blurAll()
          collection.selectFocused()
          for i in [0..9]
            expect( collection.suggestions[i].select ).not.toHaveBeenCalled()
            
    describe 'focus helpers', ->
      
      beforeEach ->
        collection.focus(1)
        spyOn(collection, 'focus')
            
      describe '#focusNext', ->
      
        it 'should focus the next suggestion', ->
          collection.focusNext()
          expect( collection.focus ).toHaveBeenCalledWith( 2 )
        
      describe '#focusPrevious', ->
        
        it 'should focus the previous suggestion', ->
          collection.focusPrevious()
          expect( collection.focus ).toHaveBeenCalledWith( 0 )            
    
      describe '#focusElement', ->
        
        it 'should focus the suggestion whos element matches the one provided', ->
          collection.focusElement( $('<div id="73-soulmate-suggestion">') )
          expect( collection.focus ).toHaveBeenCalledWith( 73 )