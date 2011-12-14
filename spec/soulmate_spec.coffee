Soulmate = window._test.Soulmate

describe 'Soulmate', ->
    
  soulmate = renderCallback = selectCallback = null
    
  beforeEach ->
    renderCallback = (term, data, type) -> term
    selectCallback = ->
        
    setFixtures( sandbox() )
    $('#sandbox').html($('<input type="text" id="search">'))
    
    soulmate = new Soulmate( $('#search'), {
      url:            'http://localhost'
      types:          ['type1', 'type2', 'type3']
      renderCallback: renderCallback
      selectCallback: selectCallback
      minQueryLength: 2
      maxResults: 5
    })
  
  context 'with a mocked fetchResults method', ->
    
    beforeEach ->
      soulmate.fetchResults = ->
    
    it 'adds a container to the dom with an id of "soulmate"', ->      
      expect( $('#soulmate') ).toExist()
    
    describe 'mousing over the input field', ->

      it 'should blur all the suggestions', ->
        expect(-> soulmate.input.trigger( 'mouseover' ) ).toCall( soulmate.suggestions, 'blurAll' )
      
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

        context 'when no suggestion is focused', ->

          beforeEach -> 
            soulmate.suggestions.allBlured = -> true

          it 'submits the form', ->
            expect( enter ).not.toCall( keyDownEvent, 'preventDefault' )
            
        context 'when a suggestion is focused', ->
                    
          beforeEach -> 
            soulmate.suggestions.allBlured = -> false
                    
          it 'doesnt submit the form', ->
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

      keyUp = -> soulmate.input.trigger( 'keyup' )

      it 'sets the current query value to the value of the input field', ->
        expect( keyUp ).toCallWith( soulmate.query, 'setValue', [soulmate.input.val()] )

      context 'when the query has not changed', ->

        beforeEach ->
          soulmate.query.hasChanged = -> false

        it 'should not fetch new results', ->
          expect( keyUp ).not.toCall( soulmate, 'fetchResults' )

        it 'should not hide the container', ->
          expect( keyUp ).not.toCall( soulmate, 'hideContainer' )

      context 'when the query has changed', ->

        beforeEach ->
          soulmate.query.hasChanged = -> true

        context 'when the query will have results', ->

          beforeEach ->
            soulmate.query.willHaveResults = -> true

          it 'should blur the suggestions', ->
            expect( keyUp ).toCall( soulmate.suggestions, 'blurAll' )

          it 'should fetch new results', ->
            expect( keyUp ).toCall( soulmate, 'fetchResults' )

        context 'when the query will have no results', ->

          beforeEach ->
            soulmate.query.willHaveResults = -> false

          it 'should hide the container', ->
            expect( keyUp ).toCall( soulmate, 'hideContainer' )
    
    context 'showing suggestions', ->

      beforeEach ->
        soulmate.update( fixtures.responseWithResults.results )

      describe 'clicking outside of the container', ->

        it 'hides the container', ->
          expect( -> $('#sandbox').trigger( 'click.soulmate') ).toCall( soulmate, 'hideContainer' )

      describe 'mousing over a suggestion', ->

        it 'should focus that suggestion', ->
          suggestion = soulmate.suggestions.suggestions[0]
          mouseover = -> suggestion.element().trigger( 'mouseover' )
          expect( mouseover ).toCall( suggestion, 'focus' )

      describe 'clicking a suggestion', ->

        click = suggestion = null

        beforeEach ->
          suggestion = soulmate.suggestions.suggestions[0]
          click = -> suggestion.element().trigger( 'click' )

        it 'refocuses the input field so it remains active', ->
          click()
          expect( soulmate.input.is(':focus') ).toBeTruthy()

        it 'selects the clicked suggestion', ->
          expect( click ).toCall( soulmate.suggestions, 'selectFocused')
    
    describe '#hideContainer', ->
      
      it 'blurs all the suggestions', ->
        expect( -> soulmate.hideContainer() ).toCall( soulmate.suggestions, 'blurAll' )
      
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

      context 'with a non-empty result set', ->

        update = -> soulmate.update( fixtures.responseWithResults.results )
      
        it 'shows the container', ->
          expect( update ).toCall( soulmate, 'showContainer' )  
            
        it 'shows the new suggestions', ->
          update()
          expect( soulmate.container.html() ).toMatch(/2012 Super Bowl/)

      context 'with an empty result set', ->

        update = -> soulmate.update( fixtures.responseWithNoResults.results )

        it 'hides the container', ->
          expect( update ).toCall( soulmate, 'hideContainer' )
          
        it 'marks the current query as empty', ->
          expect( update ).toCall( soulmate.query, 'markEmpty' )  
    
  # NOTE: Spec-ing jsonp requests is challenging, and these tests are sparse.
  describe '#fetchResults', ->
    
    beforeEach ->
      soulmate.query.setValue( 'job' )
      spyOn( $, 'ajax' )
      soulmate.fetchResults()
      
    it 'requests the given url as an ajax request', ->
      expect( $.ajax.mostRecentCall.args[0].url ).toEqual( soulmate.url )

    it 'calls "update" with the responses results on success', ->
      expect( -> $.ajax.mostRecentCall.args[0].success( {results: {}} ) ).toCall( soulmate, 'update' )
      