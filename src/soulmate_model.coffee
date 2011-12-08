# Helpers
default = (input, default_value) ->
  if input? 
    input 
  else
    default_value

# True if 'string' starts with 'start'
startsWith = (string, start) ->
  string[0...start.length] == start

class Suggestion
  constructor: (index, @term, @type, @data) ->
    @id = "#{index}-soulmate-suggestion"
    
  select: (callback) ->
    callback( @term, @type, @data )
    
  focus: ->
    @element().addClass( 'focus' )
    
  blur: ->
    @element().removeClass( 'focus' )
    
  render: (callback) ->
    """
      <span id="#{id}" class="result">
        <span class="result-title">
          #{callback( @term, @type, @data )}
        </span>
      </span>
    """
    
  element: ->
    $(@id)  

class SuggestionCollection
  constructor: (@renderCallback, @selectCallback) ->
    @focusedIndex = -1
    @types = []
    @suggestions = []
    
  update: (results) ->
    
    @types = []
    @suggestions = []
    i = 0
    
    for type, typeSuggestions of results
      @types.push( type )
      
      for suggestion in typeSuggestions
        
        @suggestions.push( new Suggestion(i, suggestion.term, suggestion.type, suggestion.data) )
        i += 1
            
  blurAll: ->
    suggestion.blur() for suggestion in @suggestions

  render: ->
    
    if @suggestions.length
    
      type = null
      typeIndex = -1
    
      for suggestion in @suggestions
        if suggestion.type != type
          if type != null
            @_renderTypeEnd( type )
            
          type = suggestion.type
          typeIndex += 1
          
          @_renderTypeStart( typeIndex )
          
        @_renderSuggestion( suggestion )
    
      @_renderTypeEnd(type)
  
  count: ->
    @suggestions.length
  
  focus: (i) ->
    unless i < 0 || i > @count() - 1
      @suggestions[i].focus()
      @focusedIndex = i
  
  focusElement: (element) ->
    index = parseInt(element.attr('id'))
    @focus( index )

  focusNext: ->
    @focus( @focusedIndex + 1 )

  focusPrevious: ->
    @focus( @focusedIndex - 1 )

  selectFocused: ->
    if @focusedIndex > 0
      @suggestions[@focusedIndex].select( selectCallback )
  
  # PRIVATE
  
  _renderTypeStart: (i) ->
    rowClass = if i == 0 'first-row' else ''
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
  

class window.Soulmate

  KEYCODES = {9: 'tab', 13: 'enter', 27: 'escape', 38: 'up', 40: 'down'}
  
  constructor: (input, url, types, renderCallback, selectCallback) ->

    that = this
      
    @input            = input
    @url              = url
    
    @maxResults       = default( options.maxResults, 8 )
    @minQueryLength   = default( options.minQueryLength, 1 )

    @suggestions      = new SuggestionCollection( renderCallback, selectCallback)
    
    @lastQuery        = ''
    @emptyQueries     = []
    @xhr              = null
  
    @input.
      keydown( @handleKeydown ).
      keyup( @handleKeyup ).
      mouseover( ->
        that.suggestions.blurAll()
      )
    
    @container = $("""
        <div id='autocomplete>
          <table>
            <tbody>
            </tbody>
          </table>
        </div>
      """
    ).insertAfter(@input)
    
    @contents = $('tbody', @container)
    
    @container.delegate('.result', 'mouseover', ->
      that.suggestions.focusElement( this )
    })
    
  handleKeydown: (event) ->  
    
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
      
  handleKeyup: (event) ->
    
    @query.value( @input.val() )
    
    if @query.hasChanged()
      
      if @query.willHaveResults()
        
        @suggestions.blurAll()
        @fetch( @query )
        
    
    query = @input.val()

    if query != @lastQuery && !@isEmptyQuery(query)

      @lastQuery = query

      @suggestions.blurAll()

      if query.length >= @minQueryLength
        @fetch(query)

      else
        hideContainer()    
      
  hideContainer: ->
    @suggestions.blurAll()
    
    @container.hide()
    
    # Stop capturing any document click events.
    $(document).unbind('click.soulmate')

  showContainer: ->
    @container.show()

    # Hide the container if the user clicks outside of it.
    $(document).bind('click.soulmate', (event) ->
      @hideContainer() unless @container.has( $(event.target) ).length
    )

  fetch: (query) ->
    
    # Cancel any previous requests if there are any.
    @xhr.abort() if @xhr?
    
    # Get the results for the given query, store in 'results'
    # and render them.
    @xhr = $.ajax({
      url: @url
      dataType: 'jsonp'
      timeout: 500
      cache: true
      data: {
        term: query
        types: @types
        limit: @maxResults
      }
      success: (data) ->
        @update( data.results, query )
    })

  update: (results, query) ->
    @suggestions.update(results)
    
    if @suggestions.count() > 0

      @contents.html( $(@suggestions.render()) )
        
      @showContainer()

    else 
      @emptyQueries.push( query )
      @hideContainer()
    
  # If the query starts with any queries we have determined to have empty results
  # then it will have an empty result too, so don't bother searching for it.
  isEmptyQuery: (query) ->
    for emptyQuery in @emptyQueries
      return true if startsWith( query, emptyQuery )
    return false