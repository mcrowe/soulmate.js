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
      it('should create a unique id for the suggestion dom element', function() {
        return expect(suggestion.id).toEqual('1-soulmate-suggestion');
      });
      return it('should set the term, data, and type', function() {
        expect(suggestion.term).toEqual('mitch crowe');
        expect(suggestion.data).toEqual({});
        return expect(suggestion.type).toEqual('people');
      });
    });
    describe('#select', function() {
      return it('should call the provided callback with the term, data, and type', function() {
        callback = jasmine.createSpy();
        suggestion.select(callback);
        return expect(callback).toHaveBeenCalledWith('mitch crowe', {}, 'people');
      });
    });
    describe('#render', function() {
      it('should call the provided callback with the term, data, and type', function() {
        callback = jasmine.createSpy();
        suggestion.render(callback);
        return expect(callback).toHaveBeenCalledWith('mitch crowe', {}, 'people');
      });
      it('should return an li tag as a string', function() {
        return expect(suggestion.render(callback)).toMatch(/<li/);
      });
      it('should set the class to "soulmate-suggestion"', function() {
        return expect($(suggestion.render(callback))).toHaveClass('soulmate-suggestion');
      });
      it('should set the id to the suggestions id', function() {
        return expect($(suggestion.render(callback))).toHaveId(suggestion.id);
      });
      return it('should set the contents of the li tag to be the return value of the callback function', function() {
        callback = function() {
          return 'turtle';
        };
        return expect(suggestion.render(callback)).toMatch(/turtle/);
      });
    });
    return describe('element-related functions', function() {
      var element;
      element = null;
      beforeEach(function() {
        setFixtures(sandbox());
        $('#sandbox').html(suggestion.render(callback));
        return element = suggestion.element();
      });
      describe('#element', function() {
        return it('should get a wrapped set of the element rendered by this suggestion', function() {
          expect(element).toExist();
          return expect(element).toHaveId(suggestion.id);
        });
      });
      describe('#focus', function() {
        return it('should add the class "focus" to the element', function() {
          expect(element).not.toHaveClass('focus');
          suggestion.focus();
          return expect(element).toHaveClass('focus');
        });
      });
      return describe('#blur', function() {
        return it('should remove the class "focus" from the element', function() {
          element.addClass('focus');
          suggestion.blur();
          return expect(element).not.toHaveClass('focus');
        });
      });
    });
  });
}).call(this);
