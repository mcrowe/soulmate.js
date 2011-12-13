(function() {
  var SuggestionCollection;
  SuggestionCollection = window._test.SuggestionCollection;
  describe('SuggestionCollection', function() {
    var collection;
    collection = null;
    beforeEach(function() {
      var nullFunction;
      nullFunction = function() {};
      return collection = new SuggestionCollection(nullFunction, nullFunction);
    });
    describe('#initialize', function() {
      it('sets the render and select callbacks', function() {
        var renderCallback, selectCallback, withCallbacks;
        renderCallback = function() {
          return 'render';
        };
        selectCallback = function() {
          return 'select';
        };
        withCallbacks = new SuggestionCollection(renderCallback, selectCallback);
        expect(withCallbacks.renderCallback()).toEqual('render');
        return expect(withCallbacks.selectCallback()).toEqual('select');
      });
      it('initializes the focusedIndex to -1', function() {
        return expect(collection.focusedIndex).toEqual(-1);
      });
      it('initializes the suggestions to an empty array', function() {
        return expect(collection.suggestions).toEqual([]);
      });
      describe('#update', function() {
        var s1, s2;
        s1 = s2 = null;
        beforeEach(function() {
          collection.update(fixtures.responseWithResults.results);
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
          collection.update(fixtures.responseWithResults.results);
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
    return context('with 10 mock suggestions', function() {
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
        return it('calls blur on all of the suggestions', function() {
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
        context('when a suggestion is focused', function() {
          beforeEach(function() {
            return collection.focus(1);
          });
          return it('calls "select" on the suggestion that is focused, with the selectCallback', function() {
            collection.selectFocused();
            return expect(collection.suggestions[1].select).toHaveBeenCalledWith(collection.selectCallback);
          });
        });
        return context('when no suggestion is focused', function() {
          beforeEach(function() {
            return collection.blurAll();
          });
          return it('does nothing', function() {
            var i, _results;
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
        context('with 0 <= n < number of suggestions', function() {
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
        context('with number of suggestions < n', function() {
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
        return context('with n < 0', function() {
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
      return context('focus helpers', function() {
        beforeEach(function() {
          return collection.focus(1);
        });
        describe('#focusNext', function() {
          return it('focuses the next suggestion', function() {
            return expect(function() {
              return collection.focusNext();
            }).toCallWith(collection, 'focus', [2]);
          });
        });
        describe('#focusPrevious', function() {
          return it('focuses the previous suggestion', function() {
            return expect(function() {
              return collection.focusPrevious();
            }).toCallWith(collection, 'focus', [0]);
          });
        });
        return describe('#focusElement', function() {
          return it('focuses the suggestion whos element matches the one provided', function() {
            var element;
            element = $('<div id="73-soulmate-suggestion">');
            return expect(function() {
              return collection.focusElement(element);
            }).toCallWith(collection, 'focus', [73]);
          });
        });
      });
    });
  });
}).call(this);
