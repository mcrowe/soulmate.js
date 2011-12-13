$('#search-input').focus()

render = (term, data, type) -> term
select = (term, data, type) -> console.log("Selected #{term}")
      
$('#search-input').soulmate {
  url:            'http://seatgeek.com/autocomplete'
  types:          ['teamband', 'event', 'venue', 'tournament']
  renderCallback: render
  selectCallback: select
  minQueryLength: 2
  maxResults:     5
}

# $('#search-input').focus();
# 
# render = function(term, data, type){
#   return term;
# }
#   
# select = function(term, data, type){
#   console.log("Selected #{term}");
# }
#       
# $('#search-input').soulmate({
#   url:            'http://seatgeek.com/autocomplete', 
#   types:          ['teamband', 'event', 'venue', 'tournament'], 
#   renderCallback: render, 
#   selectCallback: select,
#   minQueryLength: 2,
#   maxResults: 5
# });