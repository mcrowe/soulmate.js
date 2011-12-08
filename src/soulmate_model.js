(function() {
  var Query, Soulmate, Suggestion, SuggestionCollection, render, select;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Query = (function() {
    function Query(minLength) {
      this.minLength = minLength;
      this.value = '';
      this.lastValue = '';
      this.emptyValues = [];
    }
    Query.prototype.getValue = function() {
      return this.value;
    };
    Query.prototype.setValue = function(newValue) {
      this.lastValue = this.value;
      return this.value = newValue;
    };
    Query.prototype.hasChanged = function() {
      return !(this.value === this.lastValue);
    };
    Query.prototype.markEmpty = function() {
      return this.emptyValues.push(this.value);
    };
    Query.prototype.willHaveResults = function() {
      return this._isValid() && !this._isEmpty();
    };
    Query.prototype._isValid = function() {
      return this.value.length > this.minLength;
    };
    Query.prototype._isEmpty = function() {
      var empty, _i, _len, _ref;
      _ref = this.emptyValues;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        empty = _ref[_i];
        if (this.value.slice(0, empty.length) === empty) {
          return true;
        }
      }
      return false;
    };
    return Query;
  })();
  Suggestion = (function() {
    function Suggestion(index, term, data, type) {
      this.term = term;
      this.data = data;
      this.type = type;
      this.id = "" + index + "-soulmate-suggestion";
    }
    Suggestion.prototype.select = function(callback) {
      return callback(this.term, this.data, this.type);
    };
    Suggestion.prototype.focus = function() {
      return this.element().addClass('focus');
    };
    Suggestion.prototype.blur = function() {
      return this.element().removeClass('focus');
    };
    Suggestion.prototype.render = function(callback) {
      return "<span id=\"" + this.id + "\" class=\"result\">\n  <span class=\"result-title\">\n    " + (callback(this.term, this.data, this.type)) + "\n  </span>\n</span>";
    };
    Suggestion.prototype.element = function() {
      return $('#' + this.id);
    };
    return Suggestion;
  })();
  SuggestionCollection = (function() {
    function SuggestionCollection(renderCallback, selectCallback) {
      this.renderCallback = renderCallback;
      this.selectCallback = selectCallback;
      this.focusedIndex = -1;
      this.suggestions = [];
    }
    SuggestionCollection.prototype.update = function(results) {
      var i, suggestion, type, typeSuggestions, _results;
      this.suggestions = [];
      i = 0;
      _results = [];
      for (type in results) {
        typeSuggestions = results[type];
        _results.push((function() {
          var _i, _len, _results2;
          _results2 = [];
          for (_i = 0, _len = typeSuggestions.length; _i < _len; _i++) {
            suggestion = typeSuggestions[_i];
            this.suggestions.push(new Suggestion(i, suggestion.term, suggestion.data, type));
            _results2.push(i += 1);
          }
          return _results2;
        }).call(this));
      }
      return _results;
    };
    SuggestionCollection.prototype.blurAll = function() {
      var suggestion, _i, _len, _ref, _results;
      this.focusedIndex = -1;
      _ref = this.suggestions;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        suggestion = _ref[_i];
        _results.push(suggestion.blur());
      }
      return _results;
    };
    SuggestionCollection.prototype.render = function() {
      var html, suggestion, type, typeIndex, _i, _len, _ref;
      html = '';
      if (this.suggestions.length) {
        type = null;
        typeIndex = -1;
        _ref = this.suggestions;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          suggestion = _ref[_i];
          if (suggestion.type !== type) {
            if (type !== null) {
              html += this._renderTypeEnd(type);
            }
            type = suggestion.type;
            typeIndex += 1;
            html += this._renderTypeStart(typeIndex);
          }
          html += this._renderSuggestion(suggestion);
        }
        html += this._renderTypeEnd(type);
      }
      return html;
    };
    SuggestionCollection.prototype.count = function() {
      return this.suggestions.length;
    };
    SuggestionCollection.prototype.focus = function(i) {
      if (i < this.count()) {
        this.blurAll();
        if (i < 0) {
          return this.focusedIndex = -1;
        } else {
          this.suggestions[i].focus();
          return this.focusedIndex = i;
        }
      }
    };
    SuggestionCollection.prototype.focusElement = function(element) {
      var index;
      index = parseInt($(element).attr('id'));
      return this.focus(index);
    };
    SuggestionCollection.prototype.focusNext = function() {
      return this.focus(this.focusedIndex + 1);
    };
    SuggestionCollection.prototype.focusPrevious = function() {
      return this.focus(this.focusedIndex - 1);
    };
    SuggestionCollection.prototype.selectFocused = function() {
      if (this.focusedIndex >= 0) {
        return this.suggestions[this.focusedIndex].select(this.selectCallback);
      }
    };
    SuggestionCollection.prototype._renderTypeStart = function(i) {
      var rowClass;
      rowClass = i === 0 ? 'first-row' : '';
      return "<tr class=\"" + rowClass + "\">\n  <td class='results-container'>\n    <div class='results'>";
    };
    SuggestionCollection.prototype._renderTypeEnd = function(type) {
      return "    </div>\n  </td>\n  <td class='results-label'>" + type + "</td>\n</tr>";
    };
    SuggestionCollection.prototype._renderSuggestion = function(suggestion) {
      return suggestion.render(this.renderCallback);
    };
    return SuggestionCollection;
  })();
  Soulmate = (function() {
    var KEYCODES;
    KEYCODES = {
      9: 'tab',
      13: 'enter',
      27: 'escape',
      38: 'up',
      40: 'down'
    };
    function Soulmate(input, url, types, renderCallback, selectCallback, options) {
      var minQueryLength, that;
      this.input = input;
      this.url = url;
      this.types = types;
      if (options == null) {
        options = {};
      }
      this.handleKeyup = __bind(this.handleKeyup, this);
      this.handleKeydown = __bind(this.handleKeydown, this);
      that = this;
      this.maxResults = (typeof options.maxResults === "function" ? options.maxResults(options.maxResults) : void 0) ? void 0 : 8;
      minQueryLength = (typeof options.minQueryLength === "function" ? options.minQueryLength(options.minQueryLength) : void 0) ? void 0 : 1;
      this.xhr = null;
      this.suggestions = new SuggestionCollection(renderCallback, selectCallback);
      this.query = new Query(minQueryLength);
      $("<div id='autocomplete>\n  <table>\n    <tbody>\n    </tbody>\n  </table>\n</div>").insertAfter(this.input);
      this.container = $('#autocomplete');
      this.contents = $('tbody', this.container);
      this.container.delegate('.result', 'mouseover', function() {
        return that.suggestions.focusElement(this);
      });
      this.input.keydown(this.handleKeydown).keyup(this.handleKeyup).mouseover(function() {
        return that.suggestions.blurAll();
      });
    }
    Soulmate.prototype.handleKeydown = function(event) {
      var killEvent;
      killEvent = true;
      switch (KEYCODES[event.keyCode]) {
        case 'escape':
          this.hideContainer();
          break;
        case 'tab':
        case 'enter':
          this.suggestions.selectFocused();
          break;
        case 'up':
          this.suggestions.focusPrevious();
          break;
        case 'down':
          this.suggestions.focusNext();
          break;
        default:
          killEvent = false;
      }
      if (killEvent) {
        event.stopImmediatePropagation();
        return event.preventDefault();
      }
    };
    Soulmate.prototype.handleKeyup = function(event) {
      this.query.setValue(this.input.val());
      if (this.query.hasChanged()) {
        if (this.query.willHaveResults()) {
          this.suggestions.blurAll();
          return this.fetchResults();
        } else {
          return this.hideContainer();
        }
      }
    };
    Soulmate.prototype.hideContainer = function() {
      this.suggestions.blurAll();
      this.container.hide();
      return $(document).unbind('click.soulmate');
    };
    Soulmate.prototype.showContainer = function() {
      this.container.show();
      return $(document).bind('click.soulmate', __bind(function(event) {
        if (!this.container.has($(event.target)).length) {
          return this.hideContainer();
        }
      }, this));
    };
    Soulmate.prototype.fetchResults = function() {
      if (this.xhr != null) {
        this.xhr.abort();
      }
      return this.xhr = $.ajax({
        url: this.url,
        dataType: 'jsonp',
        timeout: 500,
        cache: true,
        data: {
          term: this.query.getValue(),
          types: this.types,
          limit: this.maxResults
        },
        success: __bind(function(data) {
          return this.update(data.results);
        }, this)
      });
    };
    Soulmate.prototype.update = function(results) {
      this.suggestions.update(results);
      if (this.suggestions.count() > 0) {
        this.contents.html($(this.suggestions.render()));
        return this.showContainer();
      } else {
        this.query.markEmpty();
        return this.hideContainer();
      }
    };
    return Soulmate;
  })();
  render = function(term, data, type) {
    return term;
  };
  select = function(term, data, type) {
    return console.log("Selected " + term);
  };
  new Soulmate($('#search-input'), 'http://soulmate.ogglexxx.com', ['categories', 'pornstars'], render, select);
}).call(this);
