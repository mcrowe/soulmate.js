(function() {
  var Soulmate;
  Soulmate = window._test.Soulmate;
  describe('Soulmate', function() {
    var renderCallback, selectCallback, soulmate;
    soulmate = renderCallback = selectCallback = null;
    beforeEach(function() {
      renderCallback = function(term, data, type) {
        return term;
      };
      selectCallback = function() {};
      setFixtures(sandbox());
      $('#sandbox').html($('<input type="text" id="search">'));
      return soulmate = new Soulmate($('#search'), {
        url: 'http://test.com',
        types: ['type1', 'type2', 'type3'],
        renderCallback: renderCallback,
        selectCallback: selectCallback,
        minQueryLength: 2,
        maxResults: 5
      });
    });
    describe('with a mock fetchResults method', function() {
      beforeEach(function() {
        return soulmate.fetchResults = function() {};
      });
      describe('#hideContainer', function() {
        it('blurs all the suggestions', function() {
          spyOn(soulmate.suggestions, 'blurAll');
          soulmate.hideContainer();
          return expect(soulmate.suggestions.blurAll).toHaveBeenCalled();
        });
        return it('hides the container', function() {
          soulmate.container.show();
          soulmate.hideContainer();
          return expect(soulmate.container).toBeHidden();
        });
      });
      describe('#showContainer', function() {
        it('shows the container', function() {
          soulmate.container.hide();
          soulmate.showContainer();
          return expect(soulmate.container).toBeVisible();
        });
        describe('#update', function() {
          return describe('with results', function() {
            var update;
            update = function() {
              return soulmate.update(fixtures.responseWithResults.results);
            };
            it('shows the container', function() {
              return expect(function() {
                return update();
              }).toCall(soulmate, 'showContainer');
            });
            return it('shows the new suggestions', function() {
              update();
              return expect(soulmate.container.html()).toMatch(/2012 Super Bowl/);
            });
          });
        });
        return describe('with empty results', function() {
          var update;
          update = function() {
            return soulmate.update(fixtures.responseWithNoResults.results);
          };
          it('hides the container', function() {
            return expect(function() {
              return update();
            }).toCall(soulmate, 'hideContainer');
          });
          return it('marks the current query as empty', function() {
            return expect(function() {
              return update();
            }).toCall(soulmate.query, 'markEmpty');
          });
        });
      });
      describe('pressing a key down in the input field', function() {
        var keyDown, keyDownEvent;
        keyDown = keyDownEvent = null;
        beforeEach(function() {
          keyDownEvent = $.Event('keydown');
          return keyDown = function(key) {
            var KEYCODES;
            KEYCODES = {
              tab: 9,
              enter: 13,
              escape: 27,
              up: 38,
              down: 40
            };
            keyDownEvent.keyCode = KEYCODES[key];
            return soulmate.input.trigger(keyDownEvent);
          };
        });
        describe('escape', function() {
          return it('hides the container', function() {
            return expect(function() {
              return keyDown('escape');
            }).toCall(soulmate, 'hideContainer');
          });
        });
        describe('tab', function() {
          var tab;
          tab = function() {
            return keyDown('tab');
          };
          it('selects the currently focused selection', function() {
            return expect(tab).toCall(soulmate.suggestions, 'selectFocused');
          });
          return it('prevents the default action', function() {
            return expect(tab).toCall(keyDownEvent, 'preventDefault');
          });
        });
        describe('enter', function() {
          var enter;
          enter = function() {
            return keyDown('enter');
          };
          it('selects the currently focused selection', function() {
            return expect(enter).toCall(soulmate.suggestions, 'selectFocused');
          });
          return it('prevents the default action', function() {
            return expect(enter).toCall(keyDownEvent, 'preventDefault');
          });
        });
        describe('up', function() {
          return it('focuses the previous selection', function() {
            return expect(function() {
              return keyDown('up');
            }).toCall(soulmate.suggestions, 'focusPrevious');
          });
        });
        describe('down', function() {
          return it('focuses the next selection', function() {
            return expect(function() {
              return keyDown('down');
            }).toCall(soulmate.suggestions, 'focusNext');
          });
        });
        return describe('any other key', function() {
          return it('allows the default action to occur', function() {
            return expect(function() {
              return keyDown('a');
            }).not.toCall(keyDownEvent, 'preventDefault');
          });
        });
      });
      describe('releasing a key in the input field', function() {
        var keyUp;
        keyUp = function() {
          return soulmate.input.trigger('keyup');
        };
        it('sets the current query value to the value of the input field', function() {
          return expect(keyUp).toCallWith(soulmate.query, 'setValue', [soulmate.input.val()]);
        });
        describe('when the query has not changed', function() {
          beforeEach(function() {
            return soulmate.query.hasChanged = function() {
              return false;
            };
          });
          it('should not fetch new results', function() {
            return expect(keyUp).not.toCall(soulmate, 'fetchResults');
          });
          return it('should not hide the container', function() {
            return expect(keyUp).not.toCall(soulmate, 'hideContainer');
          });
        });
        return describe('when the query has changed', function() {
          beforeEach(function() {
            return soulmate.query.hasChanged = function() {
              return true;
            };
          });
          describe('when the query will have results', function() {
            beforeEach(function() {
              return soulmate.query.willHaveResults = function() {
                return true;
              };
            });
            it('should blur the suggestions', function() {
              return expect(keyUp).toCall(soulmate.suggestions, 'blurAll');
            });
            return it('should fetch new results', function() {
              return expect(keyUp).toCall(soulmate, 'fetchResults');
            });
          });
          return describe('when the query will have no results', function() {
            beforeEach(function() {
              return soulmate.query.willHaveResults = function() {
                return false;
              };
            });
            return it('should hide the container', function() {
              return expect(keyUp).toCall(soulmate, 'hideContainer');
            });
          });
        });
      });
      describe('mousing over the input field', function() {
        return it('should blur all the suggestions', function() {
          var mouseOverInput;
          mouseOverInput = function() {
            return soulmate.input.trigger('mouseover');
          };
          return expect(mouseOverInput).toCall(soulmate.suggestions, 'blurAll');
        });
      });
      describe('with suggestions', function() {
        beforeEach(function() {
          return soulmate.update(fixtures.responseWithResults.results);
        });
        describe('mousing over a suggestion', function() {
          return it('should focus that suggestion', function() {
            var mouseover, suggestion;
            suggestion = soulmate.suggestions.suggestions[0];
            mouseover = function() {
              return suggestion.element().trigger('mouseover');
            };
            return expect(mouseover).toCall(suggestion, 'focus');
          });
        });
        return describe('clicking a suggestion', function() {
          var click, suggestion;
          click = suggestion = null;
          beforeEach(function() {
            suggestion = soulmate.suggestions.suggestions[0];
            return click = function() {
              return suggestion.element().trigger('click');
            };
          });
          it('refocuses the input field so it remains active', function() {
            click();
            debugger;
            return expect(soulmate.input.is(':focus')).toBeTruthy();
          });
          return it('selects the clicked suggestion', function() {
            return expect(click).toCall(soulmate.suggestions, 'selectFocused');
          });
        });
      });
      it('adds a container to the dom with an id of "soulmate"', function() {
        return expect($('#soulmate')).toExist();
      });
      return it('hides the container when you click outside of it and it is shown', function() {
        soulmate.showContainer();
        return expect(function() {
          return $('#sandbox').trigger('click.soulmate');
        }).toCall(soulmate, 'hideContainer');
      });
    });
    return describe('#fetchResults', function() {
      beforeEach(function() {
        soulmate.query.setValue('job');
        spyOn($, 'ajax');
        return soulmate.fetchResults();
      });
      it('requests the given url as an ajax request', function() {
        return expect($.ajax.mostRecentCall.args[0].url).toEqual(soulmate.url);
      });
      return it('calls "update" with the responses results on success', function() {
        return expect(function() {
          return $.ajax.mostRecentCall.args[0].success({
            results: {}
          });
        }).toCall(soulmate, 'update');
      });
    });
  });
}).call(this);
