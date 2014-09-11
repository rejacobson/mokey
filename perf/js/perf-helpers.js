var grid;
var Entity = function() {
  this.x = 0;
  this.y = 0;
};
var entity = new Entity();

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
  grid = new GridPartition([1200, 1200], [20, 20]);
  for (var i=0; i<4000; i++) {
    grid.insert(rand(0, grid._maxindex), new Entity());
    if (i % 4 == 0) grid.insert(10, new Entity());
  };

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

