# inputevent

Alleviate browser bugs for input events

[![Travis build status](http://img.shields.io/travis/marcandre/inputevent.svg?style=flat)](https://travis-ci.org/marcandre/inputevent)


## The 'input' event

The `'input'` event is awesome. It's triggerred when an input is modified.
At least it's meant to. All browsers currently have some circumstances where they fail to trigger it. See [here](https://github.com/whatwg/html/issues/601#issuecomment-178293094) for a nice summary.

### The `inputevent` library

This library alleviates this by firing the missing `'input'` events when needed.

#### Usage

* load the library

* call `inputevent.install()`

#### What's pretty cool

##### Auto detection

Iit correctly detects what needs to be patched for all browsers,
including future versions that hopefully will fix their behavior

Instead of targetting particular versions of browser,
we listen for the first `'input'` or `'change'` event triggerred
for the problematic types of inputs.

If an `'input'` event is received first, all is well.
Otherwise, we listen for future `'change'` events and
trigger a corresponding `'input'` event each time.

##### Short

It's about 50 lines of code.

#### What's less cool

##### Event order

In browsers that we "fix", the `'input'` event happens after the `'change'` event
instead of before.

##### JS events

We make a best effort to distinguish between native events and those triggered by JS code.

We ignore non-native events completely, so if you trigger a `'change'` event with JS code for a "fixed" type of input, we won't trigger an `'input`' event. Thanks to incomplete support for `event.isTrusted` in Chrome / Safari / Opera, events that are triggeried via JS and not using jQuery may not be distinguished though.

Similarly, triggering a `'change'` or an `'input'` event with JS code (not using jQuery and with a browser not supporting `isTrusted`), before an actual user interaction happens, could fool the detection code into erroneously thinking that the browser needs (or doesn't need) "fixing".
