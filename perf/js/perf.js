var s = [];

s.push(
  createSuite('on', 'operations',

  '.on()', function() {
    Mokey.on('z', function() {});
    Mokey.bindings['z'] = undefined;
  })
);

s.push(
  createSuite('keypress', 'operations',

  'a keydown', function(){
    runEvent(a_keydown);
    runEvent(a_keyup);
  },

  'z keydown - non-existent key binding', function() {
    runEvent(z_keydown);
    runEvent(z_keyup);
  })
);

s.push(
  createSuite('combo', 'operations',

  'b+c combo', function(){
    runEvent(b_keydown);
    runEvent(c_keydown);
    runEvent(b_keyup);
    runEvent(c_keyup);
  },

  'y+z combo - non-existent key binding', function() {
    runEvent(y_keydown);
    runEvent(z_keydown);
    runEvent(y_keyup);
    runEvent(z_keyup);
  })
);

s.push(
  createSuite('sequence', 'operations',

  'd e f g sequence', function(){
    runEvent(d_keydown);
    runEvent(d_keyup);
    runEvent(e_keydown);
    runEvent(e_keyup);
    runEvent(f_keydown);
    runEvent(f_keyup);
    runEvent(g_keydown);
    runEvent(g_keyup);
  },

  'w x y z sequence - non-existent key binding', function() {
    runEvent(w_keydown);
    runEvent(w_keyup);
    runEvent(x_keydown);
    runEvent(x_keyup);
    runEvent(y_keydown);
    runEvent(y_keyup);
    runEvent(z_keydown);
    runEvent(z_keyup);
  })
);

s.push(
  createSuite('sequence_combo', 'operations',

  'h i j+k sequence, combo', function(){
    runEvent(h_keydown);
    runEvent(h_keyup);
    runEvent(i_keydown);
    runEvent(i_keyup);
    runEvent(j_keydown);
    runEvent(k_keydown);
    runEvent(j_keyup);
    runEvent(k_keyup);
  },

  'w x y+z sequence, combo - non-existent key binding', function() {
    runEvent(w_keydown);
    runEvent(w_keyup);
    runEvent(x_keydown);
    runEvent(x_keyup);
    runEvent(y_keydown);
    runEvent(y_keydown);
    runEvent(z_keyup);
    runEvent(z_keyup);
  })
);

$(function(){
  layoutSuites(s);
});
