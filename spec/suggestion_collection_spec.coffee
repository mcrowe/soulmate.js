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

  describe 'with real data', ->
    
    response = {
      "results":
        "event": [
          {"data":{},"term":"2012 Super Bowl","id":673579,"score":8546.76},
          {"data":{},"term":"2012 Rose Bowl (Oregon vs Wisconsin)","id":614958,"score":1139.12},
          {"data":{},"term":"The Book of Mormon - New York","id":588497,"score":965.756}
        ],
        "venue": [
          {"data":{},"term":"Opera House (Boston)","id":2501,"score":318.21},
          {"data":{'url': 'http://www.google.com'},"term":"The Borgata Event Center ","id":435,"score":263.579},
          {"data":{},"term":"BOK Center","id":85,"score":225.843}
        ]
      "term":"bo"
    }

    describe '#update', ->
    
      s1 = null
      s2 = null
    
      beforeEach ->    
        collection.update( response.results )
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
        collection.update( response.results )
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
              
  describe 'with mock suggestions', ->
    
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
    
    describe '#focus', ->
      
      describe 'with a number between 0 and the number of suggestions', ->
        
        beforeEach ->
          spyOn( collection, 'blurAll' )
          collection.focus( 3 )
        
        it 'should blur all the suggestions', ->
          expect( collection.blurAll ).toHaveBeenCalled()
        
        it 'should focus the requested suggestion', ->
          expect( collection.suggestions[3].focus ).toHaveBeenCalled()
        
        it 'should set the focusedIndex to refer to the requested suggestion', ->
          expect( collection.focusedIndex ).toEqual( 3 )
          
      describe 'with a number larger than the number of suggestions', ->
        
        it 'should do nothing', ->
          spyOn( collection, 'blurAll' )
          collection.focus( 37 )
          expect( collection.focusedIndex ).not.toEqual( 37 )
          for i in [0..9]
            expect( collection.suggestions[i].focus ).not.toHaveBeenCalled()
          expect( collection.blurAll ).not.toHaveBeenCalled()
        
      describe 'with a number smaller than 0', ->
        
        beforeEach ->
          spyOn( collection, 'blurAll' )
          collection.focus( -2 )          
        
        it 'should blur all the suggestions', ->
          expect( collection.blurAll ).toHaveBeenCalled()  
        
        it 'should do nothing else', ->
          expect( collection.focusedIndex ).not.toEqual( -2 )
          for i in [0..9]
            expect( collection.suggestions[i].focus ).not.toHaveBeenCalled()        
            
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
    