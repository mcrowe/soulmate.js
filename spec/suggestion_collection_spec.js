(function() {
  var SuggestionCollection;
  SuggestionCollection = window._test.SuggestionCollection;
  describe('SuggestionCollection', function() {
    var collection;
    collection = null;
    beforeEach(function() {
      var callback;
      callback = function() {};
      return collection = new SuggestionCollection(callback, callback);
    });
    describe('#initialize', function() {
      it('sets the render and select callbacks', function() {
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
      it('initializes the focusedIndex to -1', function() {
        return expect(collection.focusedIndex).toEqual(-1);
      });
      return it('initializes the suggestions to an empty array', function() {
        return expect(collection.suggestions).toEqual([]);
      });
    });
    describe('with real data', function() {
      var response;
      response = {
        "results": {
          "event": [
            {
              "data": {},
              "term": "2012 Super Bowl",
              "id": 673579,
              "score": 8546.76
            }, {
              "data": {},
              "term": "2012 Rose Bowl (Oregon vs Wisconsin)",
              "id": 614958,
              "score": 1139.12
            }, {
              "data": {},
              "term": "The Book of Mormon - New York",
              "id": 588497,
              "score": 965.756
            }
          ],
          "venue": [
            {
              "data": {},
              "term": "Opera House (Boston)",
              "id": 2501,
              "score": 318.21
            }, {
              "data": {
                'url': 'http://www.google.com'
              },
              "term": "The Borgata Event Center ",
              "id": 435,
              "score": 263.579
            }, {
              "data": {},
              "term": "BOK Center",
              "id": 85,
              "score": 225.843
            }
          ]
        },
        "term": "bo"
      };
      describe('#update', function() {
        var s1, s2;
        s1 = null;
        s2 = null;
        beforeEach(function() {
          collection.update(response.results);
          s1 = collection.suggestions[0];
          return s2 = collection.suggestions[4];
        });
        it('adds a suggestion for each suggestion in the results', function() {
          return expect(collection.count()).toEqual(6);
        });
        it('sets the right terms', function() {
          expect(s1.term).toEqual('2012 Super Bowl');
          return expect(s2.term).toEqual('The Borgata Event Center ');
        });
        it('sets the right data', function() {
          expect(s1.data).toEqual({});
          return expect(s2.data).toEqual({
            'url': 'http://www.google.com'
          });
        });
        return it('sets the right types', function() {
          expect(s1.type).toEqual('event');
          return expect(s2.type).toEqual('venue');
        });
      });
      return describe('#render', function() {
        var rendered;
        rendered = null;
        beforeEach(function() {
          collection.update(response.results);
          return rendered = collection.render();
        });
        it('renders all of the suggestions', function() {
          return expect($('.soulmate-suggestion', $(rendered)).length).toEqual(6);
        });
        it('renders the suggestions for each type inside a ul', function() {
          var typeLists;
          typeLists = $('ul.soulmate-type-suggestions', $(rendered));
          expect(typeLists.length).toEqual(2);
          return typeLists.each(function() {
            return expect($('.soulmate-suggestion', $(this)).length).toEqual(3);
          });
        });
        it('renders a list item container for each type', function() {
          return expect($(rendered).filter('li.soulmate-type-container').length).toEqual(2);
        });
        return it('renders each type as a div with a class of "soulmate-type"', function() {
          var types;
          types = $('div.soulmate-type', $(rendered));
          expect(types.length).toEqual(2);
          return types.each(function() {
            return expect($(this).text()).toMatch(/event|venue/);
          });
        });
      });
    });
    return describe('with mock suggestions', function() {
      beforeEach(function() {
        var i, _results;
        _results = [];
        for (i = 0; i <= 9; i++) {
          _results.push(collection.suggestions.push(jasmine.createSpyObj('suggestion', ['blur', 'focus', 'select'])));
        }
        return _results;
      });
      describe('#count', function() {
        return it('returns the number of suggestions', function() {
          return expect(collection.count()).toEqual(10);
        });
      });
      describe('#blurAll', function() {
        return it('calls blur on all of its suggestions', function() {
          var i, _results;
          collection.blurAll();
          _results = [];
          for (i = 0; i <= 9; i++) {
            _results.push(expect(collection.suggestions[i].blur).toHaveBeenCalled());
          }
          return _results;
        });
      });
      describe('#selectFocused', function() {
        return describe('when a suggestion is focused', function() {
          it('calls "select" on the suggestion that is focused, with the selectCallback', function() {
            collection.focus(1);
            collection.selectFocused();
            return expect(collection.suggestions[1].select).toHaveBeenCalledWith(collection.selectCallback);
          });
          return it('does nothing if no suggestion is focused', function() {
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
      describe('#focus', function() {
        describe('with a number between 0 and the number of suggestions', function() {
          beforeEach(function() {
            spyOn(collection, 'blurAll');
            return collection.focus(3);
          });
          it('blurs all the suggestions', function() {
            return expect(collection.blurAll).toHaveBeenCalled();
          });
          it('focuses the requested suggestion', function() {
            return expect(collection.suggestions[3].focus).toHaveBeenCalled();
          });
          return it('sets the focusedIndex to refer to the requested suggestion', function() {
            return expect(collection.focusedIndex).toEqual(3);
          });
        });
        describe('with a number larger than the number of suggestions', function() {
          return it('does nothing', function() {
            var i;
            spyOn(collection, 'blurAll');
            collection.focus(37);
            expect(collection.focusedIndex).not.toEqual(37);
            for (i = 0; i <= 9; i++) {
              expect(collection.suggestions[i].focus).not.toHaveBeenCalled();
            }
            return expect(collection.blurAll).not.toHaveBeenCalled();
          });
        });
        return describe('with a number smaller than 0', function() {
          beforeEach(function() {
            spyOn(collection, 'blurAll');
            return collection.focus(-2);
          });
          it('blurs all the suggestions', function() {
            return expect(collection.blurAll).toHaveBeenCalled();
          });
          return it('does nothing else', function() {
            var i, _results;
            expect(collection.focusedIndex).not.toEqual(-2);
            _results = [];
            for (i = 0; i <= 9; i++) {
              _results.push(expect(collection.suggestions[i].focus).not.toHaveBeenCalled());
            }
            return _results;
          });
        });
      });
      return describe('focus helpers', function() {
        beforeEach(function() {
          collection.focus(1);
          return spyOn(collection, 'focus');
        });
        describe('#focusNext', function() {
          return it('focuses the next suggestion', function() {
            collection.focusNext();
            return expect(collection.focus).toHaveBeenCalledWith(2);
          });
        });
        describe('#focusPrevious', function() {
          return it('focuses the previous suggestion', function() {
            collection.focusPrevious();
            return expect(collection.focus).toHaveBeenCalledWith(0);
          });
        });
        return describe('#focusElement', function() {
          return it('focuses the suggestion whos element matches the one provided', function() {
            collection.focusElement($('<div id="73-soulmate-suggestion">'));
            return expect(collection.focus).toHaveBeenCalledWith(73);
          });
        });
      });
    });
  });
}).call(this);
