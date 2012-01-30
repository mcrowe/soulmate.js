(function() {
  var Suggestion;

  Suggestion = window._test.Suggestion;

  describe('Suggestion', function() {
    var callback, suggestion;
    suggestion = null;
    callback = function() {};
    beforeEach(function() {
      return suggestion = new Suggestion(1, 'mitch crowe', {}, 'people');
    });
    describe('#initialize', function() {
      it('creates a unique id for the suggestion dom element', function() {
        return expect(suggestion.id).toEqual('1-soulmate-suggestion');
      });
      return it('sets the term, data, and type', function() {
        expect(suggestion.term).toEqual('mitch crowe');
        expect(suggestion.data).toEqual({});
        return expect(suggestion.type).toEqual('people');
      });
    });
    describe('#select', function() {
      return it('calls the provided callback with the term, data, type, index, and dom id', function() {
        callback = jasmine.createSpy();
        suggestion.select(callback);
        return expect(callback).toHaveBeenCalledWith('mitch crowe', {}, 'people', 1, '1-soulmate-suggestion');
      });
    });
    describe('#render', function() {
      it('calls the provided callback with the term, data, type, index, and dom id', function() {
        callback = jasmine.createSpy();
        suggestion.render(callback);
        return expect(callback).toHaveBeenCalledWith('mitch crowe', {}, 'people', 1, '1-soulmate-suggestion');
      });
      it('returns an li tag as a string', function() {
        return expect(suggestion.render(callback)).toMatch(/<li/);
      });
      it('sets the class to "soulmate-suggestion"', function() {
        return expect($(suggestion.render(callback))).toHaveClass('soulmate-suggestion');
      });
      it('sets the id to the suggestions id', function() {
        return expect($(suggestion.render(callback))).toHaveId(suggestion.id);
      });
      return it('sets the contents of the li tag to be the return value of the callback function', function() {
        callback = function() {
          return 'turtle';
        };
        return expect(suggestion.render(callback)).toMatch(/turtle/);
      });
    });
    return context('with a dom sandbox', function() {
      var element;
      element = null;
      beforeEach(function() {
        setFixtures(sandbox());
        $('#sandbox').html(suggestion.render(callback));
        return element = suggestion.element();
      });
      describe('#element', function() {
        return it('gets a wrapped set of the element rendered by this suggestion', function() {
          expect(element).toExist();
          return expect(element).toHaveId(suggestion.id);
        });
      });
      describe('#focus', function() {
        return it('adds the class "focus" to the element', function() {
          expect(element).not.toHaveClass('focus');
          suggestion.focus();
          return expect(element).toHaveClass('focus');
        });
      });
      return describe('#blur', function() {
        return it('removes the class "focus" from the element', function() {
          element.addClass('focus');
          suggestion.blur();
          return expect(element).not.toHaveClass('focus');
        });
      });
    });
  });

}).call(this);
