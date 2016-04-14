import $ from 'jquery';

function InputEvent() {
  let globals = window || global;

  // Slightly odd way construct our object. This way methods are force bound.
  // Used to test for duplicate library.
  $.extend(this, {

    // For browsers that do not support isTrusted, assumes event is native.
    isNativeEvent: evt => {
      return evt.originalEvent && evt.originalEvent.isTrusted !== false;
    },

    fakeInputEvent: evt => {
      if (this.isNativeEvent(evt)) {
        $(evt.target).trigger('input');
      }
    },

    misbehaves: evt => {
      if (this.isNativeEvent(evt)) {
        this.behavesOk(evt);
        $(document)
          .on('change.inputevent', evt.data.selector, this.fakeInputEvent);
        this.fakeInputEvent(evt);
      }
    },

    behavesOk: evt => {
      if (this.isNativeEvent(evt)) {
        $(document) // Simply unbinds the testing handler
          .off('input.inputevent', evt.data.selector, this.behavesOk)
          .off('change.inputevent', evt.data.selector, this.misbehaves);
      }
    },

    // Bind the testing handlers
    install: () => {
      if (globals.inputEventPatched) {
        return;
      }
      globals.inputEventPatched = '0.0.3';
      for (let selector of ['select', 'input[type="checkbox"]', 'input[type="radio"]', 'input[type="file"]']) {
        $(document)
          .on('input.inputevent', selector, {selector}, this.behavesOk)
          .on('change.inputevent', selector, {selector}, this.misbehaves);
      }
    },

    uninstall: () => {
      delete globals.inputEventPatched;
      $(document).off('.inputevent');
    }

  });
};

export default new InputEvent();
