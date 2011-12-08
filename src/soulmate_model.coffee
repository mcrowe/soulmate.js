$ = jQuery

class Query
  constructor: (@minLength) ->
    @value = ''
    @lastValue = ''
    @emptyValues = []
    
  getValue: ->
    @value
  
  setValue: (newValue) ->
    @lastValue = @value
    @value = newValue
  
  hasChanged: ->
    !(@value == @lastValue)
    
  markEmpty: ->
    @emptyValues.push( @value )
    
  willHaveResults: ->
    @_isValid() && !@_isEmpty()
    
  _isValid: ->
    @value.length >= @minLength

  # A value is empty if it starts with any of the values
  # in the emptyValues array.
  _isEmpty: ->
    for empty in @emptyValues
      return true if @value[0...empty.length] == empty
    return false
    
class Suggestion
  constructor: (index, @term, @data, @type) ->
    @id = "#{index}-soulmate-suggestion"
    
  select: (callback) ->
    callback( @term, @data, @type )
    
  focus: ->  
    @element().addClass( 'focus' )
    
  blur: ->
    @element().removeClass( 'focus' )
    
  render: (callback) ->
    """
      <span id="#{@id}" class="result">
        <span class="result-title">
          #{callback( @term, @data, @type)}
        </span>
      </span>
    """

  element: ->
    $('#' + @id)  

class SuggestionCollection
  constructor: (@renderCallback, @selectCallback) ->
    @focusedIndex = -1
    @suggestions = []
    
  update: (results) ->
    @suggestions = []
    i = 0
    
    for type, typeSuggestions of results
      for suggestion in typeSuggestions
        @suggestions.push( new Suggestion(i, suggestion.term, suggestion.data, type) )
        i += 1
            
  blurAll: ->
    @focusedIndex = -1
    suggestion.blur() for suggestion in @suggestions

  render: ->
    
    html = ''
    
    if @suggestions.length
    
      type = null
      typeIndex = -1
    
      for suggestion in @suggestions
        if suggestion.type != type
          if type != null
            html += @_renderTypeEnd( type )
            
          type = suggestion.type
          typeIndex += 1
          
          html += @_renderTypeStart( typeIndex )
          
        html += @_renderSuggestion( suggestion )
    
      html += @_renderTypeEnd(type)
      
    html
  
  count: ->
    @suggestions.length
  
  focus: (i) ->        
    if i < @count()
      @blurAll()
      if i < 0
        @focusedIndex = -1
      else
        @suggestions[i].focus()
        @focusedIndex = i
  
  focusElement: (element) ->
    index = parseInt($(element).attr('id'))
    @focus( index )

  focusNext: ->
    @focus( @focusedIndex + 1 )

  focusPrevious: ->
    @focus( @focusedIndex - 1 )

  selectFocused: ->
    if @focusedIndex >= 0
      @suggestions[@focusedIndex].select( @selectCallback )
  
  # PRIVATE
  
  _renderTypeStart: (i) ->
    rowClass = if i == 0 then 'first-row' else ''
    """
      <tr class="#{rowClass}">
        <td class='results-container'>
          <div class='results'>
    """
  
  _renderTypeEnd: (type) ->
    """
          </div>
        </td>
        <td class='results-label'>#{type}</td>
      </tr>
    """
  
  _renderSuggestion: (suggestion) ->
    suggestion.render( @renderCallback )

class Soulmate

  KEYCODES = {9: 'tab', 13: 'enter', 27: 'escape', 38: 'up', 40: 'down'}
  
  constructor: (@input, options) ->

    that = this
    
    {url, types, renderCallback, selectCallback} = options
    
    @url              = url
    @types            = types

    @maxResults       = if options.maxResults? options.maxResults         else 8
    minQueryLength    = if options.minQueryLength? options.minQueryLength else 1
    
    @xhr              = null

    @suggestions      = new SuggestionCollection( renderCallback, selectCallback )  
    @query            = new Query( minQueryLength )  
        
    $("""
        <div id='autocomplete>
          <table>
            <tbody>
            </tbody>
          </table>
        </div>
      """
    ).insertAfter(@input)
    
    @container = $('#autocomplete')
    @contents = $('tbody', @container)
      
    @container.delegate('.result',
      mouseover: -> that.suggestions.focusElement( this )
      click: (event) -> 
        event.preventDefault()
        that.suggestions.selectFocused()
        
        # Refocus the input field so it remains active after clicking a suggestion.
        that.input.focus()
    )
    
    @input.
      keydown( @handleKeydown ).
      keyup( @handleKeyup ).
      mouseover( ->
        that.suggestions.blurAll()
      )
    
  handleKeydown: (event) =>  
    
    killEvent = true
    
    switch KEYCODES[event.keyCode]

      when 'escape'
        @hideContainer()

      when 'tab', 'enter'
        @suggestions.selectFocused()

      when 'up'
        @suggestions.focusPrevious()

      when 'down'
        @suggestions.focusNext()

      else
        killEvent = false

    if killEvent
      event.stopImmediatePropagation()
      event.preventDefault()
      
  handleKeyup: (event) =>
    @query.setValue( @input.val() )
    
    if @query.hasChanged()
      
      if @query.willHaveResults()
      
        @suggestions.blurAll()
        @fetchResults()
    
      else
        @hideContainer()
      
  hideContainer: ->
    @suggestions.blurAll()
    
    @container.hide()
    
    # Stop capturing any document click events.
    $(document).unbind('click.soulmate')

  showContainer: ->
    @container.show()

    # Hide the container if the user clicks outside of it.
    $(document).bind('click.soulmate', (event) =>
      @hideContainer() unless @container.has( $(event.target) ).length
    )

  fetchResults: ->
    # Cancel any previous requests if there are any.
    @xhr.abort() if @xhr?
    
    @xhr = $.ajax({
      url: @url
      dataType: 'jsonp'
      timeout: 500
      cache: true
      data: {
        term: @query.getValue()
        types: @types
        limit: @maxResults
      }
      success: (data) =>
        @update( data.results )
    })

  update: (results) ->
    @suggestions.update(results)
    
    if @suggestions.count() > 0

      @contents.html( $(@suggestions.render()) )
              
      @showContainer()

    else
      @query.markEmpty()

      @hideContainer()

$.fn.soulmate = (options) ->
  new Soulmate($(this), options)

render = (term, data, type) ->
  term
  
select = (term, data, type) ->
  console.log("Selected #{term}")
      
$('#search-input').soulmate(
  url:            'http://soulmate.ogglexxx.com', 
  types:          ['categories', 'pornstars'], 
  renderCallback: render, 
  selectCallback: select
)