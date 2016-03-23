import inputevent from '../../src/inputevent';

describe('inputevent', () => {
  describe('Greet function', () => {
    beforeEach(() => {
      spy(inputevent, 'greet');
      inputevent.greet();
    });

    it('should have been run once', () => {
      expect(inputevent.greet).to.have.been.calledOnce;
    });

    it('should have always returned hello', () => {
      expect(inputevent.greet).to.have.always.returned('hello');
    });
  });
});
