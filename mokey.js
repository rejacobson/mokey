(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.Mokey = factory();
    }
}(this, function () {

  var Sequence = (function() {
    var COMBO_PART           = 1;
    var FINISHED        = 2;

    var _timeout        = 1000;
    var _timer          = null;
    var _levels         = {};
    var _activeLevel    = _levels;
    var _activeSequence = '';
    var _expectedKeys   = {};

    function _permutations(input, size){
      var results = [], result, mask, total = Math.pow(2, input.length);
      for (mask = 0; mask < total; mask++) {
        result = [];
        i = input.length - 1;
        do {
          if ((mask & (1 << i)) !== 0) {
            result.push(input[i]);
          }
        } while(i--);
        if (result.length >= size) {
          results.push(result);
        }
      }

      return results;
    }

    function _combo_permutations_array(keys) {
      var perms = [];
      _permutations(keys, 1).forEach(function(k) {
        perms.push(k.sort().join('+'));
      });
      return perms;
    };

    function _combo_permutations_hash(keys) {
      var perms = {};
      _permutations(keys, 1).forEach(function(k) {
        perms[k.sort().join('+')] = true;
      });
      return perms;
    };

    function _build_sequence_levels(sequence) {
      var keys = sequence.split(' ');
      var last = _levels;

      for (var i=0, len=keys.length; i<len; i++) {
        if (last === true) {
          last = null;
          break;
        }

        var key     = keys[i];
        var isLast  = i+1 == len;

        if (key.match(/\+/)) {
          var parts = key.split('+');
          key       = parts.sort().join('+');
          _combo_permutations_array(parts).forEach(function(k) {
            if (!last[k]) last[k] = COMBO_PART;
          });
        }
        if (!last[key] || last[key] === COMBO_PART) last[key] = isLast ? FINISHED : {};

        last = last[key];
      }

      if (!last) console.log('Conflicting sequence: '+ sequence);
    };

    function _save_key(key) {
      _activeSequence += _activeSequence.length == 0
        ? key
        : ' '+ key;
    };

    function _reset() {
      _activeLevel    = _levels;
      _activeSequence = '';
      _expectedKeys   = {};
      clearTimeout(_timer);
    };

    function _extend_timer() {
      clearTimeout(_timer);
      _timer = setTimeout(_reset, _timeout);
    };

    return {
      add: function(sequence) {
        _build_sequence_levels(sequence);
      },

      reset: function() {
        _reset();
      },

      levels: function() { return _levels; },

      activeSequence: function() {
        return _activeSequence;
      },

      advance: function(key) {
        if (_activeLevel[key]) {
          _extend_timer();
          if (_activeLevel[key] !== COMBO_PART) {
            _save_key(key);
            _activeLevel = _activeLevel[key];
            _expectedKeys = {};
            if (key.match(/\w\+/)) {
              _expectedKeys = _combo_permutations_hash(key.split('+'));
            }
          }
          if (_activeLevel === FINISHED) return true;
        } else {
          if (_expectedKeys[key]) {
            delete _expectedKeys[key];
          } else {
            console.log('RESET');
            _reset();
          }
        }
      }
    };
  })();

  var Mokey = (function() {
    var keysdown          = {};
    var bindings          = {};

    function _sort_combo(combo) {
      return combo.split('+').sort().join('+');
    };

    function _clean_input(input) {
      input = input.replace(/\s+/g, ' ')   // convert multiple spaces to single space
        .replace(/(\w\+)\s(\w)/, '$1$2')  // remove left hand spaces from + signs, ie. 'shift+ x' -> 'shift+x'
        .replace(/(\w)\s(\+\w)/, '$1$2')  // remove right hand spaces from + signs, ie. 'shift +x' -> 'shift+x'
        .trim();

      if (input.match(/\s/)) {
        var parts = input.split(' ');
        parts.forEach(function(n, i){
          parts[i] = _sort_combo(n);
        });
        input = parts.join(' ');
      } else if (input.match(/\+/)) {
        input = _sort_combo(input);
      }

      return input;
    };

    function _get_combo_keys() {
      return Object.keys(keysdown).sort();
    };

    function _get_combo() {
      var keys = _get_combo_keys();
      return keys.length > 1
        ? keys.join('+')
        : null;
    };

    function _run_callbacks(event, callbacks) {
      for (var i=0, len=callbacks.length; i<len; i++) {
        callbacks[i](event);
      }
    };

    function _handle_event(event, key) {
      if (!key) return;
      if (Sequence.advance(key)) {
        _run_callbacks(event, bindings[Sequence.activeSequence()]);
        Sequence.reset();
      }
      if (bindings[key]) _run_callbacks(event, bindings[key]);
    };

    function _bind(input, callback) {
      input = _clean_input(input);
console.log('BINDING '+ input);
      if (!bindings[input]) bindings[input] = [];
      bindings[input].push(callback);
      if (input.match(/\s/)) Sequence.add(input);
    }

    return {
      on: function(input, callback) {
        input = input instanceof Array ? input : [input];
        input.forEach(function(keypress){
          _bind(keypress, callback);
        });
        return this;
      },

      bindings: function() {
        return bindings;
      },

      _onkeydown: function(event) {
        var key = _KEYS[event.which];
        if (keysdown[key]) return; // Return early if this key is already down
        keysdown[key] = event.timeStamp;
        _handle_event(event, _get_combo());
        _handle_event(event, key);
      },

      _onkeyup: function(event) {
        var key = _KEYS[event.which];
        event.timeDown = event.timeStamp - keysdown[key];
        delete keysdown[key];
        //_run_callbacks(event, bindings[key]);
      },

      _onmousedown: function(event) {
        var key = _MOUSE[event.which];
        keysdown[key] = event.timeStamp;
        _handle_event(event, _get_combo());
        _handle_event(event, key);
      },

      _onmouseup: function(event) {
        var key = _MOUSE[event.which];
        event.timeDown = event.timeStamp - keysdown[key];
        delete keysdown[key];
        //_run_callbacks(event, bindings[key]);
      },

      _onmousewheel: function(event) {
        event.scrollDelta = event.detail ? event.detail*(-20) : event.wheelDeltaY;
        var key           = _MOUSE_WHEEL[event.scrollDelta / Math.abs(event.scrollDelta)];
        if (bindings[key]) _run_callbacks(event, bindings[key]);
      },

      _onmousemove: function(event){
        if (bindings['mmove']) _run_callbacks(event, bindings['mmove']);
      }
    };

  })();

  var _MOUSE = {
    1: 'lclick',
    2: 'mclick',
    3: 'rclick'
  };

  var _MOUSE_WHEEL = {
    '1':  'wheelup',
    '-1': 'wheeldown'
  };

  var _KEYS = {
    8:    'backspace',
    9:    'tab',
    12:   'clear',
    13:   'enter',
    16:   'shift',
    17:   'ctrl',
    18:   'alt',
    27:   'esc',
    32:   'space',
    224:  'meta',
    33:   'pgup',
    34:   'pgdown',
    35:   'end',
    36:   'home',
    46:   'del',

    37:   'left',
    38:   'up',
    39:   'right',
    40:   'down',

    48: '0',
    49: '1',
    50: '2',
    51: '3',
    52: '4',
    53: '5',
    54: '6',
    55: '7',
    56: '8',
    57: '9',
    65: 'a',
    66: 'b',
    67: 'c',
    68: 'd',
    69: 'e',
    70: 'f',
    71: 'g',
    72: 'h',
    73: 'i',
    74: 'j',
    75: 'k',
    76: 'l',
    77: 'm',
    78: 'n',
    79: 'o',
    80: 'p',
    81: 'q',
    82: 'r',
    83: 's',
    84: 't',
    85: 'u',
    86: 'v',
    87: 'w',
    88: 'x',
    89: 'y',
    90: 'z',

    61:  '+',
    106: '*',
    107: '+',
    109: '-',
    110: '.',
    111: '/',
    173: '-',
    186: ';',
    187: '=',
    188: ',',
    189: '-',
    190: '.',
    191: '/',
    192: '`',
    219: '[',
    220: '\\',
    221: ']',
    222: '\'',

    96:   'kp0',
    97:   'kp1',
    98:   'kp2',
    99:   'kp3',
    100:  'kp4',
    101:  'kp5',
    102:  'kp6',
    103:  'kp7',
    104:  'kp8',
    105:  'kp9'
  };

  var _REVERSED_KEYS = (function() {
    var reversed = {};
    Object.keys(_KEYS).forEach(function(key) {
      reversed[_KEYS[key]] = key;
    });
    return reversed;
  })();

  function _addEvent(object, type, callback) {
    if (object.addEventListener) {
      object.addEventListener(type, callback, false);
      return;
    }
    object.attachEvent('on'+ type, callback);
  }

  var mousewheelevent = (/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel";

  _addEvent(document, 'keydown',        Mokey._onkeydown);
  _addEvent(document, 'keyup',          Mokey._onkeyup);
  _addEvent(document, 'mousedown',      Mokey._onmousedown);
  _addEvent(document, 'mouseup',        Mokey._onmouseup);
  _addEvent(document, 'mousemove',      Mokey._onmousemove);
  _addEvent(document, mousewheelevent,  Mokey._onmousewheel);

  return Mokey;
}));
