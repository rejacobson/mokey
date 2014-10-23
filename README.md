A javascript keyboard and mouse library.

Allows for the binding of key combinations and sequences.

``` javascript
// 'a' is pressed
Mokey.on('a', function(){});
```

``` javascript
// 'b' and then 'c' are pressed, one after the other
Mokey.on('b c', function(){});
```

``` javascript
// 'd' and 'e' are pressed at the same time
Mokey.on('d+e', function(){});
```

``` javascript
// mouse left click is pressed 4 times in a row
Mokey.on('lclickX4', function(){});
```

``` javascript
// mouse wheel is scrolled up
Mokey.on('wheelup', function(){});
```

``` javascript
// 'f' then 'g' are pressed, one after the other
// then 'h', 'i' and 'j' are pressed at the same time
Mokey.on('f g h+i+j', function(){});
```
