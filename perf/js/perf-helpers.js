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

  return evt;
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

  return evt;
};

function runEvent(e) {
  document.dispatchEvent(e);
};

var a_keydown = simulateKeyEvent('a', 'keydown');
var a_keyup   = simulateKeyEvent('a', 'keyup');
var b_keydown = simulateKeyEvent('b', 'keydown');
var b_keyup   = simulateKeyEvent('b', 'keyup');
var c_keydown = simulateKeyEvent('v', 'keydown');
var c_keyup   = simulateKeyEvent('v', 'keyup');
var d_keydown = simulateKeyEvent('d', 'keydown');
var d_keyup   = simulateKeyEvent('d', 'keyup');
var e_keydown = simulateKeyEvent('e', 'keydown');
var e_keyup   = simulateKeyEvent('e', 'keyup');
var f_keydown = simulateKeyEvent('f', 'keydown');
var f_keyup   = simulateKeyEvent('f', 'keyup');
var g_keydown = simulateKeyEvent('g', 'keydown');
var g_keyup   = simulateKeyEvent('g', 'keyup');
var h_keydown = simulateKeyEvent('h', 'keydown');
var h_keyup   = simulateKeyEvent('h', 'keyup');
var i_keydown = simulateKeyEvent('i', 'keydown');
var i_keyup   = simulateKeyEvent('i', 'keyup');
var j_keydown = simulateKeyEvent('j', 'keydown');
var j_keyup   = simulateKeyEvent('j', 'keyup');
var k_keydown = simulateKeyEvent('k', 'keydown');
var k_keyup   = simulateKeyEvent('k', 'keyup');

var w_keydown = simulateKeyEvent('w', 'keydown');
var w_keyup   = simulateKeyEvent('w', 'keyup');
var x_keydown = simulateKeyEvent('x', 'keydown');
var x_keyup   = simulateKeyEvent('x', 'keyup');
var y_keydown = simulateKeyEvent('y', 'keydown');
var y_keyup   = simulateKeyEvent('y', 'keyup');
var z_keydown = simulateKeyEvent('z', 'keydown');
var z_keyup   = simulateKeyEvent('z', 'keyup');

Mokey.on('a', function() {});
Mokey.on('b+c', function() {});
Mokey.on('d e f g', function() {});
Mokey.on('h i j+k', function() {});

var unit_template = Handlebars.compile('\
  <div class="method">\
    <p id="{{anchor}}">\
      <b>{{name}}</b>\
      <a class="run" href="javascript:void(0);">Run This Unit</a>\
    </p>\
    <pre>{{code}}</pre>\
    <pre class="results" id="{{unit}}"></pre>\
  </div>');

function rand(min,max) {
  return Math.floor(Math.random()*(max-min+1)+min);
}

function onStart(event) {
  var names = this.map(function(o, i) { return o.name; });
  var title = '<h2>'+ names.join(' VS ') +'</h2>';
  $('#'+ this._dom_id).html('');
  $('#'+ this._dom_id).append('<p>Running...</p>');
};
function onCycle(event) {
  $('#'+ this._dom_id).append('<p>'+ String(event.target) +'</p>');
};
function onComplete(event) {
  $('#'+ this._dom_id).append('<p>Fastest is '+ this.filter('fastest').pluck('name') +'</p>');
};

function runSuite(suite) {
  suite.run({async: true});
};

function createSuite() {
  if (arguments.length == 0) return;
  var args = [];
  Array.prototype.push.apply(args, arguments);

  var suite     = new Benchmark.Suite;
  var name      = args.shift();
  var group     = args.shift();
  suite._name   = name;
  suite._group  = group;

  for (var i=0, len=args.length; i<len; i+=2) {
    var name = args[i];
    var func = args[i+1];
    suite.add(name, func);
  }

  suite.on('start',    onStart)
       .on('cycle',    onCycle)
       .on('complete', onComplete);

  return suite;
};

function _clean_code(code) {
  code = code.split("\n");
  code.pop();
  code.shift();
  code = code.map(function(c) { return c.trim(); });
  return code.join("\n");
};

function layoutSuites(suites) {
  suites.forEach(function(suite, index) {
    suite._dom_id = '_'+ index;
    var code  = suite.map(function(s) { return _clean_code(s.fn.toString()); }).join("\n\n");
    var $html = $(unit_template({
      name:   suite._name,
      anchor: suite._name.replace('#', ''),
      unit:   suite._dom_id,
      code:   code
    }));

    $('a.run', $html).on('click', function(){
      runSuite(suite);
    });

    $('body #'+ suite._group).append($html);
  });
};

