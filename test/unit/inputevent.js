import $ from 'jquery';
import inputevent from '../../src/inputevent';

var original = inputevent.isNativeEvent;
inputevent.isNativeEvent = function(evt) { return original(evt) || evt.fakeNative; }; // So we can fake native events
var nativeChange = () => { return $.Event('change', {fakeNative: true}); };
var nativeInput = () => { return $.Event('input', {fakeNative: true}); };

describe('inputevent', () => {
  beforeEach(inputevent.install);
  afterEach(inputevent.uninstall);

  describe('with native events', () => {
    it('triggers input events for you', () => {
      let events = [];
      $('<input type="checkbox" id="y">')
        .appendTo('body')
        .on('input change', evt => { events.push(evt.type); })
        .trigger(nativeChange())
        .trigger(nativeChange());
      expect(events).to.have.eql(['change', 'input', 'change', 'input']);
    });

    it('does not trigger input events when not needed', () => {
      let events = [];
      $('<input type="radio">')
        .appendTo('body')
        .on('input change', evt => { events.push(evt.type); })
        .trigger(nativeInput())
        .trigger(nativeChange())
        .trigger(nativeChange());
      expect(events).to.have.eql(['input', 'change', 'change']);
    });

    it('does not trigger input events multiple times if library loaded multiple times', () => {
      inputevent.install();
      var dup = new inputevent.constructor();
      dup.install();
      let events = [];
      $('<input type="radio">')
        .appendTo('body')
        .on('input change', evt => { events.push(evt.type); })
        .trigger(nativeChange())
        .trigger(nativeChange());
      expect(events).to.have.eql(['change', 'input', 'change', 'input']);
    });
  });

  describe('with synthetic events', () => {
    it('does not get confused by synthetic events', () => {
      let events = [];
      $('<input type="radio">')
        .appendTo('body')
        .on('input change', evt => { events.push(evt.type); })
        .trigger('change')
        .trigger('change');
      expect(events).to.have.eql(['change', 'change']);
    });
  });

});
