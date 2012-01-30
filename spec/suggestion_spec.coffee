Suggestion = window._test.Suggestion

describe 'Suggestion', ->

  suggestion = null
  callback = ->
  
  beforeEach ->
    suggestion = new Suggestion(1, 'mitch crowe', {}, 'people')

  describe '#initialize', ->
    
    it 'creates a unique id for the suggestion dom element', ->
      expect( suggestion.id ).toEqual( '1-soulmate-suggestion' )
      
    it 'sets the term, data, and type', ->
      expect( suggestion.term ).toEqual( 'mitch crowe' )
      expect( suggestion.data ).toEqual( {} )
      expect( suggestion.type ).toEqual( 'people' )
  
  describe '#select', ->
    
    it 'calls the provided callback with the term, data, type, index, and dom id', ->
      callback = jasmine.createSpy()
      suggestion.select( callback )
      expect( callback ).toHaveBeenCalledWith( 'mitch crowe', {}, 'people', 1, '1-soulmate-suggestion' )
    
  describe '#render', ->
    
    it 'calls the provided callback with the term, data, type, index, and dom id', ->
      callback = jasmine.createSpy()
      suggestion.render( callback )
      expect( callback ).toHaveBeenCalledWith( 'mitch crowe', {}, 'people', 1, '1-soulmate-suggestion' )  
    
    it 'returns an li tag as a string', ->
      expect( suggestion.render( callback ) ).toMatch(/<li/)
      
    it 'sets the class to "soulmate-suggestion"', ->
      expect( $(suggestion.render( callback )) ).toHaveClass( 'soulmate-suggestion' )
    
    it 'sets the id to the suggestions id', ->
      expect( $(suggestion.render( callback )) ).toHaveId( suggestion.id )
      
    it 'sets the contents of the li tag to be the return value of the callback function', ->
      callback = -> 'turtle'
      expect( suggestion.render( callback ) ).toMatch( /turtle/ )
  
  context 'with a dom sandbox', ->
    
    element = null
    
    beforeEach ->
      setFixtures( sandbox() )
      $('#sandbox').html( suggestion.render(callback) )
      element = suggestion.element()
  
    describe '#element', ->
      
      it 'gets a wrapped set of the element rendered by this suggestion', ->
        expect( element ).toExist()
        expect( element ).toHaveId( suggestion.id )
        
    describe '#focus', ->
      
      it 'adds the class "focus" to the element', ->
        expect( element ).not.toHaveClass( 'focus' )
        suggestion.focus()
        expect( element ).toHaveClass( 'focus' )
        
    describe '#blur', ->
      
      it 'removes the class "focus" from the element', ->
        element.addClass( 'focus' )
        suggestion.blur()
        expect( element ).not.toHaveClass( 'focus' )