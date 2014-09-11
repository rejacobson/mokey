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

  var Mokey = (function() {
    var keysdown          = {};
    var bindings          = {};
    var next_keys;

    var char_counter = (function(){
      var _timeout = 300;
      var _count;
      var _char;
      var _time;

      function _reset_count() {
        _count = _char = _time = 0;
      };

      return {
        count: function(char, timestamp) {
          if (char != _char || timestamp - _time > _timeout) _reset_count();
          _char = char;
          _time = timestamp;
          _count++;
          return _count > 1;
        },

        code: function() {
          if (_count > 1) return _char +'X'+ _count;
        }
      };
    })();

    function _bind(input, callback) {
      input = _clean_input(input);
      var keys = input.split(' ');
      var cur = bindings;

      for (var i=0, len=keys.length; i<len; i++) {
        if (!cur.keys) cur.keys = {};
        cur = cur.keys;

        var key     = keys[i];
        var isFirst = i == 0;
        var isLast  = i+1 == len;

        if (!isFirst && key.match(/\+/)) {
          key = _sort_combo(key);
          _combo_permutations_array(key.split('+')).forEach(function(k) {
            if (!cur[k]) cur[k] = 1;
          });
        }

        if (!cur[key] || cur[key] === 1) cur[key] = {};

        cur = cur[key];

        if (isLast) cur['callback'] = callback;
      }
    };

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
      return Object.getOwnPropertyNames(keysdown).sort();
    };

    function _get_combo() {
      var keys = _get_combo_keys();
      return keys.length > 1
        ? keys.join('+')
        : null;
    };

    function _reset() {
      next_keys = bindings.keys;
    };

    function _run_callback(event, key) {
      if (next_keys[key] && next_keys[key].callback) {
        event.mokey = key;
        next_keys[key].callback(event);
        return true;
      }
    };

    function _sequencer(key) {
      if (next_keys[key] && next_keys[key].keys) {
        next_keys = next_keys[key].keys;
      }
    }

    function _handle_event(event, key) {
      if (!key) return;
      if (!next_keys) _reset();
      var run_seq = true;
      if (_run_callback(event, key)) {
        if (!next_keys[key].keys) {
          _reset();
          run_seq = false;
        }
      }
      if (run_seq) _sequencer(key);
    };

    function _normalize_timestamp(e) { e._ts = Date.now(); };

    function _onkeydown(event) {
      _normalize_timestamp(event);
      var key = KEYS[event.which];
      if (keysdown[key]) return; // Return early if this key is already down
      keysdown[key] = event._ts;

      if (char_counter.count(key, event._ts)) {
        key = char_counter.code();
      }

      if (!next_keys || !next_keys[key]) _reset();

      _handle_event(event, key);

      var combo = _get_combo();
      if (combo) _handle_event(event, combo);
    };

    function _onkeyup(event) {
      _normalize_timestamp(event);
      var key = KEYS[event.which];
      event.timeDown = event._ts - keysdown[key];
      delete keysdown[key];
      _handle_event(event, 'keyup.'+ key);
    };

    function _onmousedown(event) {
      _normalize_timestamp(event);
      var key = MOUSE[event.which];
      keysdown[key] = event._ts;
      key = _get_combo() || key;
      if (char_counter.count(key, event._ts)) {
        key = char_counter.code();
      }
      if (!next_keys || !next_keys[key]) _reset();
      _handle_event(event, key);
    };

    function _onmouseup(event) {
      _normalize_timestamp(event);
      var key = MOUSE[event.which];
      event.timeDown = event._ts - keysdown[key];
      delete keysdown[key];
      _handle_event(event, 'keyup.'+ key);
    };

    function _onmousewheel(event) {
      _normalize_timestamp(event);
      event.scrollDelta = event.detail ? event.detail*(-20) : event.wheelDeltaY;
      var key           = MOUSE_WHEEL[event.scrollDelta / Math.abs(event.scrollDelta)];
      if (bindings.keys[key] && bindings.keys[key].callback) bindings.keys[key].callback(event);
    };

    function _onmousemove(event){
      //if (bindings.keys['mmove'] && bindings.keys['mmove'].callback) bindings.keys['mmove'].callback(event);
    };

    function _addEvent(object, type, callback) {
      if (object.addEventListener) {
        object.addEventListener(type, callback, false);
        return;
      }
      object.attachEvent('on'+ type, callback);
    };

    var mousewheelevent = (/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel";

    _addEvent(document, 'keydown',        _onkeydown);
    _addEvent(document, 'keyup',          _onkeyup);
    _addEvent(document, 'mousedown',      _onmousedown);
    _addEvent(document, 'mouseup',        _onmouseup);
    _addEvent(document, 'mousemove',      _onmousemove);
    _addEvent(document, mousewheelevent,  _onmousewheel);

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

      keysdown: function() {
        return Object.keys(keysdown);
      }
    };

  })();

  var MOUSE = {
    1: 'lclick',
    2: 'mclick',
    3: 'rclick'
  };

  var MOUSE_WHEEL = {
    '1':  'wheelup',
    '-1': 'wheeldown'
  };

  var KEYS = {
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

  Mokey.KEYS        = KEYS;
  Mokey.MOUSE       = MOUSE;
  Mokey.MOUSE_WHEEL = MOUSE_WHEEL;

  return Mokey;

}));
