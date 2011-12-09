Query = window._test.Query

describe 'Query', ->

  query = null
  
  beforeEach ->
    query = new Query(2)

  describe '#initialize', ->
    it 'should set the minLength property to the provided parameter', ->
      expect( query.minLength ).toEqual( 2 )
      
  describe '#getValue', ->
    it 'should get the current value', ->
      query.value = 'string'
      expect( query.getValue() ).toEqual( 'string' )
    
  describe '#setValue', ->
    it 'should set the current value', ->
      query.setValue( 'string' )
      expect( query.value ).toEqual( 'string' )
    
    it 'should set the last value to the old current value', ->
      query.lastValue = 'first'
      query.value = 'second'
      query.setValue( 'third' )
      expect( query.lastValue ).toEqual( 'second' )
      
  describe '#hasChanged', ->
    it 'should be true if the value has changed', ->
      query.setValue( '1' )
      query.setValue( '2' )      
      expect( query.hasChanged() ).toBeTruthy()
    
  describe '#markEmpty', ->
    it 'should add the current value to the list of values with empty results', ->
      query.setValue('empty')
      query.markEmpty()
      expect( query.emptyValues ).toContain( 'empty' )
    
  describe '#willHaveResults', ->
    it 'should be false if the current value has less than minLength characters', ->
      query.setValue('a')
      expect( query.willHaveResults() ).toBeFalsy() 
    
    it 'should be false if the current value begins with any empty queries', ->
      query.setValue('abc')
      query.markEmpty()  
      query.setValue('abcdefg')
      expect( query.willHaveResults() ).toBeFalsy()
    
    it 'should be true if the current value is not empty and is long enough', ->
      query.setValue('abc')
      expect( query.willHaveResults() ).toBeTruthy()