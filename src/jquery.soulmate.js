(function() {
  var $, Query, Soulmate, Suggestion, SuggestionCollection;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  $ = jQuery;
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
      return this.value.length >= this.minLength;
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
      return "<li id=\"" + this.id + "\" class=\"soulmate-suggestion\">\n  " + (callback(this.term, this.data, this.type)) + "\n</li>";
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
      var i, result, type, typeResults, _results;
      this.suggestions = [];
      i = 0;
      _results = [];
      for (type in results) {
        typeResults = results[type];
        _results.push((function() {
          var _i, _len, _results2;
          _results2 = [];
          for (_i = 0, _len = typeResults.length; _i < _len; _i++) {
            result = typeResults[_i];
            this.suggestions.push(new Suggestion(i, result.term, result.data, type));
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
      var h, suggestion, type, _i, _len, _ref;
      h = '';
      if (this.suggestions.length) {
        type = null;
        _ref = this.suggestions;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          suggestion = _ref[_i];
          if (suggestion.type !== type) {
            if (type !== null) {
              h += this._renderTypeEnd(type);
            }
            type = suggestion.type;
            h += this._renderTypeStart();
          }
          h += this._renderSuggestion(suggestion);
        }
        h += this._renderTypeEnd(type);
      }
      return h;
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
    SuggestionCollection.prototype._renderTypeStart = function() {
      return "<li class=\"soulmate-type-container\">\n  <ul class=\"soulmate-type-suggestions\">";
    };
    SuggestionCollection.prototype._renderTypeEnd = function(type) {
      return "  </ul>\n  <div class=\"soulmate-type\">" + type + "</div>\n</li>";
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
    function Soulmate(input, options) {
      var maxResults, minQueryLength, renderCallback, selectCallback, that, types, url;
      this.input = input;
      this.handleKeyup = __bind(this.handleKeyup, this);
      this.handleKeydown = __bind(this.handleKeydown, this);
      that = this;
      url = options.url, types = options.types, renderCallback = options.renderCallback, selectCallback = options.selectCallback, maxResults = options.maxResults, minQueryLength = options.minQueryLength;
      this.url = url;
      this.types = types;
      this.maxResults = maxResults;
      this.xhr = null;
      this.suggestions = new SuggestionCollection(renderCallback, selectCallback);
      this.query = new Query(minQueryLength);
      this.container = $('<ul id="soulmate">').insertAfter(this.input);
      this.container.delegate('.soulmate-suggestion', {
        mouseover: function() {
          return that.suggestions.focusElement(this);
        },
        click: function(event) {
          event.preventDefault();
          that.suggestions.selectFocused();
          return that.input.focus();
        }
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
        this.container.html($(this.suggestions.render()));
        return this.showContainer();
      } else {
        this.query.markEmpty();
        return this.hideContainer();
      }
    };
    return Soulmate;
  })();
  $.fn.soulmate = function(options) {
    new Soulmate($(this), options);
    return $(this);
  };
}).call(this);
