Soulmate = window._test.Soulmate

describe 'Soulmate', ->
  
  soulmate = renderCallback = selectCallback = null
    
  beforeEach ->
    
    renderCallback = (term, data, type) -> term
    selectCallback = ->
        
    setFixtures( sandbox() )
    $('#sandbox').html($('<input type="text" id="search">'))
    
    soulmate = new Soulmate( $('#search'), {
      url:            'http://example.com'
      types:          ['type1', 'type2', 'type3']
      renderCallback: renderCallback
      selectCallback: selectCallback
      minQueryLength: 2
      maxResults: 5
    })
  
  describe '#hideContainer', ->
      
    it 'blurs all the suggestions', ->
      spyOn( soulmate.suggestions, 'blurAll' )
      soulmate.hideContainer()
      expect( soulmate.suggestions.blurAll ).toHaveBeenCalled()
      
    it 'hides the container', ->
      soulmate.container.show()
      soulmate.hideContainer()
      expect( soulmate.container ).toBeHidden()
      
  describe '#showContainer', ->
    
    it 'shows the container', ->
      soulmate.container.hide()
      soulmate.showContainer()
      expect( soulmate.container).toBeVisible()      
        
    describe '#update', ->
  
      describe 'with results', ->

        update = ->
          soulmate.update({
            "event": [
              {"data":{},"term":"2012 Super Bowl","id":673579,"score":8546.76},
              {"data":{},"term":"2012 Rose Bowl (Oregon vs Wisconsin)","id":614958,"score":1139.12},
              {"data":{},"term":"The Book of Mormon - New York","id":588497,"score":965.756}
            ]
            "venue": [
              {"data":{},"term":"Opera House (Boston)","id":2501,"score":318.21},
              {"data":{'url': 'http://www.google.com'},"term":"The Borgata Event Center ","id":435,"score":263.579},
              {"data":{},"term":"BOK Center","id":85,"score":225.843}
            ]            
          })
        
        it 'shows the container', ->
          expect( -> update() ).toCall( soulmate, 'showContainer' )
      
        it 'shows the new suggestions', ->
          update()
          expect( soulmate.container.html() ).toMatch(/2012 Super Bowl/)
  
    describe 'with empty results', ->

      update = ->
        soulmate.update({
          "event": []
          "venue": []          
        })

      it 'hides the container', ->
        expect( -> update() ).toCall( soulmate, 'hideContainer' )

      it 'marks the current query as empty', ->
        expect( -> update() ).toCall( soulmate.query, 'markEmpty' )
  
  describe 'pressing a key down in the input field', ->
    
    keyDown = keyDownEvent = null
    
    beforeEach ->
      keyDownEvent = $.Event( 'keydown' )          
      keyDown = (key) ->
        KEYCODES = {tab: 9, enter: 13, escape: 27, up: 38, down: 40}
        keyDownEvent.keyCode = KEYCODES[key]  
        soulmate.input.trigger( keyDownEvent )
    
    describe 'escape', ->
      it 'hides the container', ->    
        expect( -> keyDown('escape') ).toCall( soulmate, 'hideContainer' )

    describe 'tab', ->
      tab = -> keyDown('tab')              
      it 'selects the currently focused selection', ->
        expect( tab ).toCall( soulmate.suggestions, 'selectFocused' )    
      it 'prevents the default action', ->
        expect( tab ).toCall( keyDownEvent, 'preventDefault' )
    
    describe 'enter', ->
      enter = -> keyDown('enter')
      it 'selects the currently focused selection', ->
        expect( enter ).toCall( soulmate.suggestions, 'selectFocused' )    
      it 'prevents the default action', ->
        expect( enter ).toCall( keyDownEvent, 'preventDefault' )
    
    describe 'up', ->
      it 'focuses the previous selection', ->
        expect( -> keyDown('up') ).toCall( soulmate.suggestions, 'focusPrevious' )
        
    describe 'down', ->
      it 'focuses the next selection', ->
        expect( -> keyDown('down') ).toCall( soulmate.suggestions, 'focusNext' )
    
    describe 'any other key', ->
      it 'allows the default action to occur', ->
        expect( -> keyDown('a') ).not.toCall( keyDownEvent, 'preventDefault' )    
  
  describe 'releasing a key in the input field', ->

    keyUp = ->
      soulmate.input.trigger( 'keyup' )
    
    it 'sets the current query value to the value of the input field', ->
      expect( keyUp ).toCallWith( soulmate.query, 'setValue', [soulmate.input.val()] )
    
    describe 'when the query has not changed', ->
      
      beforeEach ->
        soulmate.query.hasChanged = -> false
      
      it 'should not fetch new results', ->
        expect( keyUp ).not.toCall( soulmate, 'fetchResults' )
        
      it 'should not hide the container', ->
        expect( keyUp ).not.toCall( soulmate, 'hideContainer' )
  
    describe 'when the query has changed', ->
      
      beforeEach ->
        soulmate.query.hasChanged = -> true
      
      describe 'when the query will have results', ->
        
        beforeEach ->
          soulmate.query.willHaveResults = -> true
        
        it 'should blur the suggestions', ->
          expect( keyUp ).toCall( soulmate.suggestions, 'blurAll' )
        
        it 'should fetch new results', ->
          expect( keyUp ).toCall( soulmate, 'fetchResults' )
          
      describe 'when the query will have no results', ->

        beforeEach ->
          soulmate.query.willHaveResults = -> false
        
        it 'should hide the container', ->
          expect( keyUp ).toCall( soulmate, 'hideContainer' )
