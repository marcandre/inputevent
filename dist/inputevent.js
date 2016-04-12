/**
 * inputevent - Alleviate browser bugs for input events
 * https://github.com/marcandre/inputevent
 * @version v0.0.1 - (built Tue, Apr 12th 2016, 4:31 pm)
 * @author Marc-Andre Lafortune <github@marc-andre.ca>
 * @license MIT
 */
'use strict';

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery')) : typeof define === 'function' && define.amd ? define(['jquery'], factory) : global.inputevent = factory(global.$);
})(undefined, function ($) {
  'use strict';

  function InputEvent() {
    var _this = this;

    var globals = window || global;

    // Slightly odd way to have the object constructed have method force bound.
    // Used to test duplicate library
    $.extend(this, {

      inputsToCheck: ['select', 'input[type="checkbox"]', 'input[type="radio"]'],

      // For browsers that do not support isTrusted, assumes event is native.
      isNativeEvent: function isNativeEvent(evt) {
        return evt.originalEvent && evt.originalEvent.isTrusted !== false;
      },

      fakeInputEvent: function fakeInputEvent(evt) {
        if (_this.isNativeEvent(evt)) {
          $(evt.target).trigger('input');
        }
      },

      misbehaves: function misbehaves(evt) {
        if (_this.isNativeEvent(evt)) {
          _this.behavesOk(evt);
          $(document).on('change.inputevent', evt.data.selector, _this.fakeInputEvent);
          _this.fakeInputEvent(evt);
        }
      },

      behavesOk: function behavesOk(evt) {
        if (_this.isNativeEvent(evt)) {
          $(document) // Simply unbinds the testing handler
          .off('input.inputevent', evt.data.selector, _this.behavesOk).off('change.inputevent', evt.data.selector, _this.misbehaves);
        }
      },

      // Bind the testing handlers
      install: function install() {
        if (globals.inputEventPatched) {
          return;
        }
        globals.inputEventPatched = 1;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = _this.inputsToCheck[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var selector = _step.value;

            $(document).on('input.inputevent', selector, { selector: selector }, _this.behavesOk).on('change.inputevent', selector, { selector: selector }, _this.misbehaves);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator['return']) {
              _iterator['return']();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      },

      uninstall: function uninstall() {
        delete globals.inputEventPatched;
        $(document).off('.inputevent');
      }

    });
  };

  var inputevent = new InputEvent();

  return inputevent;
});
//# sourceMappingURL=inputevent.js.map
