$('#search-input').focus();

render = function(term, data, type){
  return term;
}
  
select = function(term, data, type){
  console.log("Selected #{term}");
}
      
$('#search-input').soulmate({
  url:            'http://soulmate.ogglexxx.com', 
  types:          ['categories', 'pornstars'], 
  renderCallback: render, 
  selectCallback: select
});