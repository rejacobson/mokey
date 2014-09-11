var s = [];

s.push(
  createSuite('outOfBounds', 'utility',

  'indexOutOfBounds(100)', function() {
    grid.indexOutOfBounds(100);
  },

  'indexOutOfBounds(-100)', function() {
    grid.indexOutOfBounds(-100);
  },

  'positionOutOfBounds([100, 100])', function() {
    grid.positionOutOfBounds([100, 100]);
  },

  'positionOutOfBounds([-100, -100])', function() {
    grid.positionOutOfBounds([-100, -100]);
  })
);

s.push(
  createSuite('indexToPosition', 'utility',

  'indexToPosition(100)', function(){
    grid.indexToPosition(100);
  },

  'positionToIndex([800, 20])', function(){
    grid.positionToIndex([800, 20]);
  })
);

s.push(
  createSuite('insert', 'operations',

  'insert(100, entity)', function(){
    grid.insert(100, entity);
  },

  'insert(-100, entity) - out of bounds insert', function() {
    grid.insert(-100, entity);
  })
);

s.push(
  createSuite('remove', 'operations',

  'remove(10, grid._map[10][0])', function(){
    grid.remove(10, grid._map[10][0]);
  },

  'remove(10, entity) - non-existant entity', function() {
    grid.remove(10, entity);
  },

  'remove(-10, entity) - out of bounds entity', function() {
    grid.remove(-10, entity);
  })
);

s.push(
  createSuite('getCell', 'queries',

  'getCell(400) - by index', function(){
    grid.getCell(400);
  },

  'getCell(10) - lots of entities, by index', function(){
    grid.getCell(10);
  })
);

s.push(
  createSuite('getCells', 'queries',

  'getCells() - 1 cell', function(){
    grid.getCells([100]);
  },

  'getCells() - 7 cells', function(){
    grid.getCells([100, 200, 300, 400, 500, 600, 700]);
  })
);

s.push(
  createSuite('getAdjacentCells', 'queries',

  'getAdjacentCells(100)', function(){
    grid.getAdjacentCells(100);
  },

  'getAdjacentCells(11) - lots of entities', function(){
    grid.getAdjacentCells(11);
  })
);

s.push(
  createSuite('getAdjacentIndices', 'queries',

  'getAdjacentIndices(1000)', function(){
    grid.getAdjacentIndices(1000);
  })
);

s.push(
  createSuite('getLinearIndices', 'queries',

  'getLinearIndices(0, [1, 0])', function(){
    grid.getLinearIndices(0, [1, 0]);
  },

  'getLinearIndices(0, [0, 1])', function(){
    grid.getLinearIndices(0, [0, 1]);
  },

  'getLinearIndices(0, [1, 1])', function(){
    grid.getLinearIndices(0, [1, 1]);
  },

  'getLinearIndices(0, [1, 1], 10)', function(){
    grid.getLinearIndices(0, [1, 1], 10);
  })
);

s.push(
  createSuite('getResidents', 'queries',

  'getResidents()', function(){
    grid.getResidents();
  })
);

$(function(){
  layoutSuites(s);
});
