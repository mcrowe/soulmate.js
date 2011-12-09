(function() {
  var SuggestionCollection;
  SuggestionCollection = window._test.SuggestionCollection;
  describe('SuggestionCollection', function() {
    var callback, collection;
    collection = null;
    callback = function() {};
    beforeEach(function() {
      return collection = new SuggestionCollection(callback, callback);
    });
    describe('#initialize', function() {
      it('should set the render and select callbacks', function() {
        var renderCallback, selectCallback;
        renderCallback = function() {
          return 'render';
        };
        selectCallback = function() {
          return 'select';
        };
        collection = new SuggestionCollection(renderCallback, selectCallback);
        expect(collection.renderCallback()).toEqual('render');
        return expect(collection.selectCallback()).toEqual('select');
      });
      it('should initialize the focusedIndex to -1', function() {
        return expect(collection.focusedIndex).toEqual(-1);
      });
      return it('should initialize the suggestions to an empty array', function() {
        return expect(collection.suggestions).toEqual([]);
      });
    });
    return describe('with suggestions', function() {
      beforeEach(function() {
        var i, _results;
        _results = [];
        for (i = 0; i <= 9; i++) {
          _results.push(collection.suggestions.push(jasmine.createSpyObj('suggestion', ['blur', 'focus', 'select'])));
        }
        return _results;
      });
      describe('#count', function() {
        return it('should return the number of suggestions', function() {
          return expect(collection.count()).toEqual(10);
        });
      });
      describe('#blurAll', function() {
        return it('should call blur on all of its suggestions', function() {
          var i, _results;
          collection.blurAll();
          _results = [];
          for (i = 0; i <= 9; i++) {
            _results.push(expect(collection.suggestions[i].blur).toHaveBeenCalled());
          }
          return _results;
        });
      });
      return describe('#selectFocused', function() {
        return describe('when a suggestion is focused', function() {
          it('should call "select" on the suggestion that is focused, with the selectCallback', function() {
            collection.focus(1);
            collection.selectFocused();
            return expect(collection.suggestions[1].select).toHaveBeenCalledWith(collection.selectCallback);
          });
          return it('should do nothing if no suggestion is focused', function() {
            var i, _results;
            collection.blurAll();
            collection.selectFocused();
            _results = [];
            for (i = 0; i <= 9; i++) {
              _results.push(expect(collection.suggestions[i].select).not.toHaveBeenCalled());
            }
            return _results;
          });
        });
      });
    });
  });
}).call(this);
