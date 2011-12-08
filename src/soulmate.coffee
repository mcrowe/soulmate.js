$container = $('#autocomplete')


if $container.length > 0

  $containerTable    = $('tbody', $container)
  $inputField        = $('#search-input')
  url                = 'http://soulmate.ogglexxx.com'
  types              = ['categories', 'pornstars']
  maxResults         = 8
  minQueryLength     = 1
  
  $suggestionRows    = $()
  enabled            = false
  lastQuery          = ''
  focusedIndex       = -1
  emptyQueries       = []

  keyCodes           = {tab: 9, enter: 13, escape: 27, up: 38, down: 40}

  $inputField.keydown( (event) ->
    return unless enabled

    switch event.keyCode
    
      when keyCodes.escape
        hideContainer()
        
      when keyCodes.tab, keyCodes.enter
        return if focusedIndex == -1
        selectSuggestion(focusedIndex)
        return if event.keyCode == keyCodes.tab
        
      when keyCodes.up
        focusPreviousSuggestion()
        
      when keyCodes.down
        focusNextSuggestion()
        
      else
        return

    event.stopImmediatePropagation()
    event.preventDefault()
  )
    
  $inputField.keyup( (event) ->
    
    query = $inputField.val()
    
    unless query == lastQuery || isEmptyQuery(query)
      
      lastQuery = query
        
      clearFocus()
      
      if query.length < minQueryLength
        hideContainer()
        
      else
        getSuggestions(query)
          
  )

  $container.delegate('.result', {
    # click: -> 
    #   selectSuggestion( $suggestionRows.index(this) )
    mouseover: -> 
      focusSuggestion( $suggestionRows.index(this) )
  })
  

  # Clear focused suggestions when the user moves their mouse
  # back over the input field.
  $inputField.mouseover( ->
    clearFocus()
  )

  hideContainer = ->
    enabled = false
    
    clearFocus()
    
    $container.hide()
    
    # Stop capturing any document click events.
    $(document).unbind('click.autocomplete')

  showContainer = ->
    enabled = true
    
    $container.show()

    # Hide the container if the user clicks outside of it.
    $(document).bind('click.autocomplete', (event) ->
      hideContainer() unless $container.has( $(event.target) ).length
    )

  selectSuggestion = (i) ->
    unless i == -1
      # Note that this track may not work because of loading a new page.
      oggle.google_analytics.trackEvent('autocomplete', 'select-suggestion', $(this).attr('href'))
      document.location.href = $suggestionRows.eq(i).attr('href')

  focusPreviousSuggestion = ->
    unless focusedIndex == -1
      if focusedIndex == 0
        clearFocus()
      else
        focusSuggestion(focusedIndex - 1)

  focusNextSuggestion = ->
    unless focusedIndex == $suggestionRows.length - 1
      focusSuggestion(focusedIndex + 1)

  clearFocus = ->
    focusedIndex = -1
    $suggestionRows.removeClass('focus')

  focusSuggestion = (index) ->
    clearFocus()
    focusedIndex = index
    $suggestionRows.eq(index).addClass('focus')


  xhr = null
  getSuggestions = (query) ->
    
    # Cancel any previous requests if there are any.
    xhr.abort() if xhr?
    
    # Get the results for the given query, store in 'results'
    # and render them.
    xhr = $.ajax({
      url: url
      dataType: 'jsonp'
      timeout: 500
      cache: true
      data: {
        term: query
        types: types
        limit: maxResults
      }
      success: (data) ->
        renderSuggestions(data.results, query)
    })

  renderSuggestions = (suggestions, query) ->

    if hasGrandChildren(suggestions)

      $containerTable.empty()

      for type, typeSuggestions of suggestions
        unless typeSuggestions.length == 0
          row = """
            <tr>
              <td class='results-container'>
                <div class='results'>
          """
          for suggestion in typeSuggestions
            row += """
                  <a class='result' href='#{suggestion.data.path}'>
                    <span class='result-title'>#{suggestion.term}</span>
                  </a>
            """
          row += """
                </div>
              </td>
              <td class='results-label'>#{type}</td>
            </tr>
          """

          $(row).appendTo($containerTable)
    
      # Identify the first fow
      $('tr', $containerTable).first().addClass('first-row')
      
      $suggestionRows = $('.result', $container)
        
      showContainer()

    else 
      emptyQueries.push(query)
      hideContainer()
      
  # Check if any attributes of an object have non-empty attributes themselves.
  hasGrandChildren = (object) ->
    for child, grandChildren of object
      return true if grandChildren.length > 0
    return false
    
  # If the query starts with any queries we have determined to have empty results
  # then it will have an empty result too, so don't bother searching for it.
  isEmptyQuery = (query) ->
    for emptyQuery in emptyQueries
      return true if startsWith(query, emptyQuery)
    return false
  
  # True if 'string' starts with 'start'
  startsWith = (string, start) ->
    string[0...start.length] == start
    
