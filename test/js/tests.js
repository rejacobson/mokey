$(function() {

  var KEYS        = invert(Mokey.KEYS);
  var MOUSE       = invert(Mokey.MOUSE);
  var MOUSE_WHEEL = invert(Mokey.MOUSE_WHEEL);

  var isFirefox       = (/Firefox/i.test(navigator.userAgent));
  var mousewheelevent = isFirefox ? "DOMMouseScroll" : "mousewheel";

  function invert(obj) {
    var new_obj = {};

    for (var prop in obj) {
      if(obj.hasOwnProperty(prop)) {
        new_obj[obj[prop]] = prop;
      }
    }

    return new_obj;
  };

  function simulateMouseEvent(character, type) {
    var evt = document.createEvent('MouseEvent');
    evt.initMouseEvent(type, true, true, window,
                       type == mousewheelevent ? 120 * -MOUSE_WHEEL[character] : 1,
                       800, 600, 290, 260,
                       false, false, false, false,
                       type == mousewheelevent ? MOUSE_WHEEL[character] : (MOUSE[character]-1),
                       null);

    document.dispatchEvent(evt);
  };

  function simulateKeyEvent(character, type) {
    var evt = document.createEvent('KeyboardEvent');
    var k   = KEYS[character];

    // Chromium Hack
    Object.defineProperty(evt, 'keyCode', {
                get: function() {
                    return this.keyCodeVal;
                }
    });
    Object.defineProperty(evt, 'which', {
                get: function() {
                    return this.keyCodeVal;
                }
    });

    (evt.initKeyEvent || evt.initKeyboardEvent).call(evt, type, true, true, window,
                      0, 0, 0, 0,
                      k,
                      character.charCodeAt(0));

    evt.keyCodeVal = k;

    if (evt.keyCode !== k) {
      alert("keyCode mismatch " + evt.keyCode + "(" + evt.which + ")");
    }

    document.dispatchEvent(evt);
  };

  var results = {};
  function clear() { results = {}; };

  Mokey.on('q', function() {
    console.log('q');
    results['q'] = 1;
  });

  Mokey.on('keyup.w', function() {
    console.log('keyup.w');
    results['keyup.w'] = 1;
  });

  Mokey.on('e r', function() {
    console.log('e r');
    results['e r'] = 1;
  });

  Mokey.on('t+y', function() {
    console.log('t+y');
    results['t+y'] = 1;
  });

  Mokey.on('a s d+f', function() {
    console.log('a s d+f');
    results['a s d+f'] = 1;
  });

  Mokey.on('g+h j+k', function() {
    console.log('g+h j+k');
    results['g+h j+k'] = 1;
  });

  Mokey.on('z x c', function() {
    console.log('z x c');
    results['z x c'] = 1;
  });

  Mokey.on('z x', function() {
    console.log('z x');
    results['z x'] = 1;
  });

  Mokey.on('v b', function() {
    console.log('v b');
    results['v b'] = 1;
  });

  Mokey.on(['nX2', 'nX3', 'nX4'], function(e) {
    if (e.mokey == 'nX2') {
      console.log('nX2');
      results['nX2'] = 1;
    }
    if (e.mokey == 'nX3') {
      console.log('nX3');
      results['nX3'] = 1;
    }
    if (e.mokey == 'nX4') {
      console.log('nX4');
      results['nX4'] = 1;
    }
  });

  Mokey.on('a b mX2', function() {
    console.log('a b mx2');
    results['a b mX2'] = 1;
  });

  Mokey.on('lclick', function() {
    console.log('lclick');
    results['lclick'] = 1;
  });

  Mokey.on('wheelup', function() {
    console.log('wheelup');
    results['wheelup'] = 1;
  });

  Mokey.on('wheeldown', function() {
    console.log('wheeldown');
    results['wheeldown'] = 1;
  });

  Mokey.on('lclick+b', function() {
    console.log('lclick+b');
    results['lclick+b'] = 1;
  });

  Mokey.on('lclick c', function() {
    console.log('lclick c');
    results['lclick c'] = 1;
  });

  module('Keypresses');

  test('q', function() {
    simulateKeyEvent('q', 'keydown');
    simulateKeyEvent('q', 'keyup');
    ok(results['q'] == 1, 'passed');
    clear();
  });

  test('keyup.w', function() {
    simulateKeyEvent('w', 'keydown');
    simulateKeyEvent('w', 'keyup');
    ok(results['keyup.w'] == 1, 'passed');
    clear();
  });

  test('e r', function() {
    simulateKeyEvent('e', 'keydown');
    simulateKeyEvent('e', 'keyup');
    simulateKeyEvent('r', 'keydown');
    simulateKeyEvent('r', 'keyup');
    ok(results['e r'] == 1, 'passed');
    clear();
  });

  test('t+y', function() {
    ok(results['t+y'] == undefined, 'not triggered yet');

    simulateKeyEvent('t', 'keydown');
    simulateKeyEvent('t', 'keyup');
    simulateKeyEvent('y', 'keydown');
    simulateKeyEvent('y', 'keyup');

    ok(results['t+y'] == undefined, 'not triggered yet');

    simulateKeyEvent('t', 'keydown');
    simulateKeyEvent('u', 'keydown');
    simulateKeyEvent('y', 'keydown');
    simulateKeyEvent('u', 'keyup');
    simulateKeyEvent('t', 'keyup');
    simulateKeyEvent('y', 'keyup');

    ok(results['t+y'] == undefined, 'not triggered yet');

    simulateKeyEvent('t', 'keydown');
    simulateKeyEvent('y', 'keydown');
    simulateKeyEvent('t', 'keyup');
    simulateKeyEvent('y', 'keyup');

    ok(results['t+y'] == 1, 'passed');
    clear();
  });

  test('a s d+f', function() {
    simulateKeyEvent('a', 'keydown');
    simulateKeyEvent('a', 'keyup');
    simulateKeyEvent('s', 'keydown');
    simulateKeyEvent('s', 'keyup');
    simulateKeyEvent('d', 'keydown');
    simulateKeyEvent('f', 'keydown');
    simulateKeyEvent('d', 'keyup');
    simulateKeyEvent('f', 'keyup');

    ok(results['a s d+f'] == 1, 'passed');
    clear();
  });

  test('g+h j+k', function() {
    simulateKeyEvent('g', 'keydown');
    simulateKeyEvent('h', 'keydown');
    simulateKeyEvent('g', 'keyup');
    simulateKeyEvent('h', 'keyup');

    simulateKeyEvent('j', 'keydown');
    simulateKeyEvent('k', 'keydown');
    simulateKeyEvent('j', 'keyup');
    simulateKeyEvent('k', 'keyup');

    ok(results['g+h j+k'] == 1, 'passed');
    clear();
  });

  test('z x, z x c', function() {
    simulateKeyEvent('z', 'keydown');
    simulateKeyEvent('z', 'keyup');
    simulateKeyEvent('x', 'keydown');
    simulateKeyEvent('x', 'keyup');
    simulateKeyEvent('c', 'keydown');
    simulateKeyEvent('c', 'keyup');

    ok(results['z x'] == 1,   'z x - passed');
    ok(results['z x c'] == 1, 'z x c - passed');
    clear();
  });

  test('v b - Keys actually pressed: z x v b', function() {
    simulateKeyEvent('z', 'keydown');
    simulateKeyEvent('z', 'keyup');
    simulateKeyEvent('x', 'keydown');
    simulateKeyEvent('x', 'keyup');
    simulateKeyEvent('v', 'keydown');
    simulateKeyEvent('v', 'keyup');
    simulateKeyEvent('b', 'keydown');
    simulateKeyEvent('b', 'keyup');

    ok(results['v b'] == 1, 'passed');
    clear();
  });

  test('nX2, nX3, nX4', function() {
    simulateKeyEvent('n', 'keydown');
    simulateKeyEvent('n', 'keyup');

    simulateKeyEvent('n', 'keydown');
    simulateKeyEvent('n', 'keyup');

    simulateKeyEvent('n', 'keydown');
    simulateKeyEvent('n', 'keyup');

    simulateKeyEvent('n', 'keydown');
    simulateKeyEvent('n', 'keyup');

    simulateKeyEvent('n', 'keydown');
    simulateKeyEvent('n', 'keyup');

    ok(results['nX2'] == 1, 'nX2 - passed');
    ok(results['nX3'] == 1, 'nX3 - passed');
    ok(results['nX4'] == 1, 'nX4 - passed');
    clear();
  });

  test('lclick - Mouse Event', function() {
    simulateMouseEvent('lclick', 'mousedown');
    simulateMouseEvent('lclick', 'mouseup');
    ok(results['lclick'] == 1, 'passed');
    clear();
  });

  test('wheeldown - Mouse Wheel Event', function() {
    simulateMouseEvent('wheeldown', mousewheelevent);
    ok(results['wheeldown'] == 1, 'passed');
    clear();
  });

  test('wheelup - Mouse Wheel Event', function() {
    simulateMouseEvent('wheelup', mousewheelevent);
    ok(results['wheelup'] == 1, 'passed');
    clear();
  });

  test('lclick+b', function() {
    simulateMouseEvent('lclick', 'mousedown');
    simulateKeyEvent('b', 'keydown');
    simulateMouseEvent('lclick', 'mouseup');
    simulateKeyEvent('b', 'keyup');
    ok(results['lclick+b'] == 1, 'passed');
    clear();
  });

  test('lclick c', function() {
    simulateMouseEvent('lclick', 'mousedown');
    simulateMouseEvent('lclick', 'mouseup');
    simulateKeyEvent('c', 'keydown');
    simulateKeyEvent('c', 'keyup');
    ok(results['lclick c'] == 1, 'passed');
    clear();
  });

});
