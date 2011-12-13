SuggestionCollection = window._test.SuggestionCollection

describe 'SuggestionCollection', ->

  collection = null

  beforeEach ->
    nullFunction = ->
    collection = new SuggestionCollection( nullFunction, nullFunction )

  describe '#initialize', ->
    
    it 'sets the render and select callbacks', ->
      renderCallback = -> 'render'
      selectCallback = -> 'select'
      withCallbacks = new SuggestionCollection( renderCallback, selectCallback )
      expect( withCallbacks.renderCallback() ).toEqual( 'render' )
      expect( withCallbacks.selectCallback() ).toEqual( 'select' )
      
    it 'initializes the focusedIndex to -1', ->
      expect( collection.focusedIndex ).toEqual( -1 )
      
    it 'initializes the suggestions to an empty array', ->
      expect( collection.suggestions ).toEqual( [] )

    describe '#update', ->
    
      s1 = s2 = null
    
      beforeEach ->    
        collection.update( fixtures.responseWithResults.results )
        s1 = collection.suggestions[0]
        s2 = collection.suggestions[4]
    
      it 'adds a suggestion for each suggestion in the results', ->
        expect( collection.count() ).toEqual( 6 )
    
      it 'sets the right terms', ->
        expect( s1.term ).toEqual( '2012 Super Bowl' )
        expect( s2.term ).toEqual( 'The Borgata Event Center ' )
    
      it 'sets the right data', ->
        expect( s1.data ).toEqual( {} )
        expect( s2.data ).toEqual( {'url': 'http://www.google.com'} )
    
      it 'sets the right types', ->
        expect( s1.type ).toEqual( 'event' )
        expect( s2.type ).toEqual( 'venue' )

    describe '#render', ->
      
      rendered = null
      
      beforeEach ->
        collection.update( fixtures.responseWithResults.results )
        rendered = collection.render()
      
      it 'renders all of the suggestions', ->
        expect( $('.soulmate-suggestion', $(rendered)).length ).toEqual( 6 )
      
      it 'renders the suggestions for each type inside a ul', ->
        typeLists = $('ul.soulmate-type-suggestions', $(rendered))
        expect( typeLists.length ).toEqual( 2 )
        typeLists.each ->
          expect( $('.soulmate-suggestion', $(this)).length ).toEqual( 3 )
      
      it 'renders a list item container for each type', ->
        expect( $(rendered).filter('li.soulmate-type-container').length ).toEqual( 2 )
        
      it 'renders each type as a div with a class of "soulmate-type"', ->
        types = $('div.soulmate-type', $(rendered) )
        expect( types.length ).toEqual( 2 )
        types.each ->
          expect( $(this).text() ).toMatch( /event|venue/ )
              
  context 'with 10 mock suggestions', ->
    
    beforeEach ->
      for i in [0..9]
        collection.suggestions.push( jasmine.createSpyObj('suggestion', ['blur', 'focus', 'select']) )
    
    describe '#count', ->
      
      it 'returns the number of suggestions', ->
        expect( collection.count() ).toEqual( 10 )
        
    describe '#blurAll', ->
      
      it 'calls blur on all of the suggestions', ->
        collection.blurAll()
        for i in [0..9]
          expect( collection.suggestions[i].blur ).toHaveBeenCalled()
          
    describe '#selectFocused', ->
      
      context 'when a suggestion is focused', ->
        
        beforeEach -> collection.focus( 1 )
        
        it 'calls "select" on the suggestion that is focused, with the selectCallback', ->
          collection.selectFocused()
          expect( collection.suggestions[1].select ).toHaveBeenCalledWith( collection.selectCallback )

      context 'when no suggestion is focused', ->
        
        beforeEach -> collection.blurAll()
        
        it 'does nothing', ->
          collection.selectFocused()
          for i in [0..9]
            expect( collection.suggestions[i].select ).not.toHaveBeenCalled()
    
    describe '#focus', ->
      
      context 'with 0 <= n < number of suggestions', ->
        
        beforeEach ->
          spyOn( collection, 'blurAll' )
          collection.focus( 3 )
        
        it 'blurs all the suggestions', ->
          expect( collection.blurAll ).toHaveBeenCalled()
        
        it 'focuses the requested suggestion', ->
          expect( collection.suggestions[3].focus ).toHaveBeenCalled()
        
        it 'sets the focusedIndex to refer to the requested suggestion', ->
          expect( collection.focusedIndex ).toEqual( 3 )
          
      context 'with number of suggestions < n', ->
        
        it 'does nothing', ->
          spyOn( collection, 'blurAll' )
          collection.focus( 37 )
          expect( collection.focusedIndex ).not.toEqual( 37 )
          for i in [0..9]
            expect( collection.suggestions[i].focus ).not.toHaveBeenCalled()
          expect( collection.blurAll ).not.toHaveBeenCalled()
        
      context 'with n < 0', ->
        
        beforeEach ->
          spyOn( collection, 'blurAll' )
          collection.focus( -2 )          
        
        it 'blurs all the suggestions', ->
          expect( collection.blurAll ).toHaveBeenCalled()  
        
        it 'does nothing else', ->
          expect( collection.focusedIndex ).not.toEqual( -2 )
          for i in [0..9]
            expect( collection.suggestions[i].focus ).not.toHaveBeenCalled()        
            
    context 'focus helpers', ->
      
      beforeEach ->
        collection.focus( 1 )
            
      describe '#focusNext', ->
      
        it 'focuses the next suggestion', ->
          expect( -> collection.focusNext() ).toCallWith( collection, 'focus', [2] )
        
      describe '#focusPrevious', ->
        
        it 'focuses the previous suggestion', ->
          expect( -> collection.focusPrevious() ).toCallWith( collection, 'focus', [0] )
    
      describe '#focusElement', ->
        
        it 'focuses the suggestion whos element matches the one provided', ->
          element = $('<div id="73-soulmate-suggestion">')
          expect( -> collection.focusElement( element ) ).toCallWith( collection, 'focus', [73] )