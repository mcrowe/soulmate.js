Suggestion = window._test.Suggestion

describe 'Suggestion', ->

  suggestion = null
  callback = ->
  
  beforeEach ->
    suggestion = new Suggestion(1, 'mitch crowe', {}, 'people')

  describe '#initialize', ->
    
    it 'should create a unique id for the suggestion dom element', ->
      expect( suggestion.id ).toEqual( '1-soulmate-suggestion' )
      
    it 'should set the term, data, and type', ->
      expect( suggestion.term ).toEqual( 'mitch crowe' )
      expect( suggestion.data ).toEqual( {} )
      expect( suggestion.type ).toEqual( 'people' )
  
  describe '#select', ->
    
    it 'should call the provided callback with the term, data, and type', ->
      callback = jasmine.createSpy()
      suggestion.select( callback )
      expect( callback ).toHaveBeenCalledWith( 'mitch crowe', {}, 'people' )
    
  describe '#render', ->
    
    it 'should call the provided callback with the term, data, and type', ->
      callback = jasmine.createSpy()
      suggestion.render( callback )
      expect( callback ).toHaveBeenCalledWith( 'mitch crowe', {}, 'people' )  
    
    it 'should return an li tag as a string', ->
      expect( suggestion.render( callback ) ).toMatch(/<li/)
      
    it 'should set the class to "soulmate-suggestion"', ->
      expect( $(suggestion.render( callback )) ).toHaveClass( 'soulmate-suggestion' )
    
    it 'should set the id to the suggestions id', ->
      expect( $(suggestion.render( callback )) ).toHaveId( suggestion.id )
      
    it 'should set the contents of the li tag to be the return value of the callback function', ->
      callback = -> 'turtle'
      expect( suggestion.render( callback ) ).toMatch( /turtle/ )
  
  describe 'element-related functions', ->
    
    element = null
    
    beforeEach ->
      setFixtures( sandbox() )
      $('#sandbox').html( suggestion.render(callback) )
      element = suggestion.element()
  
    describe '#element', ->
      
      it 'should get a wrapped set of the element rendered by this suggestion', ->
        expect( element ).toExist()
        expect( element ).toHaveId( suggestion.id )
        
    describe '#focus', ->
      
      it 'should add the class "focus" to the element', ->
        expect( element ).not.toHaveClass( 'focus' )
        suggestion.focus()
        expect( element ).toHaveClass( 'focus' )
        
    describe '#blur', ->
      
      it 'should remove the class "focus" from the element', ->
        element.addClass( 'focus' )
        suggestion.blur()
        expect( element ).not.toHaveClass( 'focus' )