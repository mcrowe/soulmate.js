(function() {
  var $container, $containerTable, $inputField, $suggestionRows, clearFocus, emptyQueries, enabled, focusNextSuggestion, focusPreviousSuggestion, focusSuggestion, focusedIndex, getSuggestions, hasGrandChildren, hideContainer, isEmptyQuery, keyCodes, lastQuery, maxResults, minQueryLength, renderSuggestions, selectSuggestion, showContainer, startsWith, types, url, xhr;
  $container = $('#autocomplete');
  if ($container.length > 0) {
    $containerTable = $('tbody', $container);
    $inputField = $('#search-input');
    url = 'http://soulmate.ogglexxx.com';
    types = ['categories', 'pornstars'];
    maxResults = 8;
    minQueryLength = 1;
    $suggestionRows = $();
    enabled = false;
    lastQuery = '';
    focusedIndex = -1;
    emptyQueries = [];
    keyCodes = {
      tab: 9,
      enter: 13,
      escape: 27,
      up: 38,
      down: 40
    };
    $inputField.keydown(function(event) {
      if (!enabled) {
        return;
      }
      switch (event.keyCode) {
        case keyCodes.escape:
          hideContainer();
          break;
        case keyCodes.tab:
        case keyCodes.enter:
          if (focusedIndex === -1) {
            return;
          }
          selectSuggestion(focusedIndex);
          if (event.keyCode === keyCodes.tab) {
            return;
          }
          break;
        case keyCodes.up:
          focusPreviousSuggestion();
          break;
        case keyCodes.down:
          focusNextSuggestion();
          break;
        default:
          return;
      }
      event.stopImmediatePropagation();
      return event.preventDefault();
    });
    $inputField.keyup(function(event) {
      var query;
      query = $inputField.val();
      if (!(query === lastQuery || isEmptyQuery(query))) {
        lastQuery = query;
        clearFocus();
        if (query.length < minQueryLength) {
          return hideContainer();
        } else {
          return getSuggestions(query);
        }
      }
    });
    $container.delegate('.result', {
      mouseover: function() {
        return focusSuggestion($suggestionRows.index(this));
      }
    });
    $inputField.mouseover(function() {
      return clearFocus();
    });
    hideContainer = function() {
      enabled = false;
      clearFocus();
      $container.hide();
      return $(document).unbind('click.autocomplete');
    };
    showContainer = function() {
      enabled = true;
      $container.show();
      return $(document).bind('click.autocomplete', function(event) {
        if (!$container.has($(event.target)).length) {
          return hideContainer();
        }
      });
    };
    selectSuggestion = function(i) {
      if (i !== -1) {
        oggle.google_analytics.trackEvent('autocomplete', 'select-suggestion', $(this).attr('href'));
        return document.location.href = $suggestionRows.eq(i).attr('href');
      }
    };
    focusPreviousSuggestion = function() {
      if (focusedIndex !== -1) {
        if (focusedIndex === 0) {
          return clearFocus();
        } else {
          return focusSuggestion(focusedIndex - 1);
        }
      }
    };
    focusNextSuggestion = function() {
      if (focusedIndex !== $suggestionRows.length - 1) {
        return focusSuggestion(focusedIndex + 1);
      }
    };
    clearFocus = function() {
      focusedIndex = -1;
      return $suggestionRows.removeClass('focus');
    };
    focusSuggestion = function(index) {
      clearFocus();
      focusedIndex = index;
      return $suggestionRows.eq(index).addClass('focus');
    };
    xhr = null;
    getSuggestions = function(query) {
      if (xhr != null) {
        xhr.abort();
      }
      return xhr = $.ajax({
        url: url,
        dataType: 'jsonp',
        timeout: 500,
        cache: true,
        data: {
          term: query,
          types: types,
          limit: maxResults
        },
        success: function(data) {
          return renderSuggestions(data.results, query);
        }
      });
    };
    renderSuggestions = function(suggestions, query) {
      var row, suggestion, type, typeSuggestions, _i, _len;
      if (hasGrandChildren(suggestions)) {
        $containerTable.empty();
        for (type in suggestions) {
          typeSuggestions = suggestions[type];
          if (typeSuggestions.length !== 0) {
            row = "<tr>\n  <td class='results-container'>\n    <div class='results'>";
            for (_i = 0, _len = typeSuggestions.length; _i < _len; _i++) {
              suggestion = typeSuggestions[_i];
              row += "<a class='result' href='" + suggestion.data.path + "'>\n  <span class='result-title'>" + suggestion.term + "</span>\n</a>";
            }
            row += "    </div>\n  </td>\n  <td class='results-label'>" + type + "</td>\n</tr>";
            $(row).appendTo($containerTable);
          }
        }
        $('tr', $containerTable).first().addClass('first-row');
        $suggestionRows = $('.result', $container);
        return showContainer();
      } else {
        emptyQueries.push(query);
        return hideContainer();
      }
    };
    hasGrandChildren = function(object) {
      var child, grandChildren;
      for (child in object) {
        grandChildren = object[child];
        if (grandChildren.length > 0) {
          return true;
        }
      }
      return false;
    };
    isEmptyQuery = function(query) {
      var emptyQuery, _i, _len;
      for (_i = 0, _len = emptyQueries.length; _i < _len; _i++) {
        emptyQuery = emptyQueries[_i];
        if (startsWith(query, emptyQuery)) {
          return true;
        }
      }
      return false;
    };
    startsWith = function(string, start) {
      return string.slice(0, start.length) === start;
    };
  }
}).call(this);
