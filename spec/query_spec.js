(function() {
  var Query;
  Query = window._test.Query;
  describe('Query', function() {
    var query;
    query = null;
    beforeEach(function() {
      return query = new Query(2);
    });
    describe('#initialize', function() {
      return it('sets the minLength property to the provided parameter', function() {
        return expect(query.minLength).toEqual(2);
      });
    });
    describe('#getValue', function() {
      return it('gets the current value', function() {
        query.value = 'string';
        return expect(query.getValue()).toEqual('string');
      });
    });
    describe('#setValue', function() {
      it('sets the current value', function() {
        query.setValue('string');
        return expect(query.value).toEqual('string');
      });
      return it('sets the last value to the old current value', function() {
        query.lastValue = 'first';
        query.value = 'second';
        query.setValue('third');
        return expect(query.lastValue).toEqual('second');
      });
    });
    describe('#hasChanged', function() {
      return it('is true if the value has changed', function() {
        query.setValue('1');
        query.setValue('2');
        return expect(query.hasChanged()).toBeTruthy();
      });
    });
    describe('#markEmpty', function() {
      return it('adds the current value to the list of values with empty results', function() {
        query.setValue('empty');
        query.markEmpty();
        return expect(query.emptyValues).toContain('empty');
      });
    });
    return describe('#willHaveResults', function() {
      it('is false if the current value has less than minLength characters', function() {
        query.setValue('a');
        return expect(query.willHaveResults()).toBeFalsy();
      });
      it('is false if the current value begins with any empty queries', function() {
        query.setValue('abc');
        query.markEmpty();
        query.setValue('abcdefg');
        return expect(query.willHaveResults()).toBeFalsy();
      });
      return it('is true if the current value is not empty and is long enough', function() {
        query.setValue('abc');
        return expect(query.willHaveResults()).toBeTruthy();
      });
    });
  });
}).call(this);
