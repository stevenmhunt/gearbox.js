Gearbox.js: Throttle the performance of your Web Application
============================================================

**Version 0.1**

Features
--------

Runs a continuous timing check to estimate delays in the JavaScript event queue.

Provides events to your application about performance impacts in real-time.

Uses the concept of "gears" for communicating what your application should do to accommodate performance problems.

How To Use
----------

1) Include the gearbox.js file in your project.

2) Create a new gearbox:
```javascript

/* Gearbox Parameters */
var timing = 1000; //how often to check for delays.
var delay = 50; //maximum acceptible delay.
var gearCount = 10; //maximum number of gears.

/* Gearbox Creation */
var gears = gearbox.create('my gearbox', timing, delay, gearCount);
```

Note that these are the default values, so if you do not provide these parameters the gearbox will be configured this way by default.

3) Use the gear number to tell your app how to act, or use event handling:
```

//get the gear number in your app
var gearNumber = gears.currentGear();
...

//use event handling to receive notification when gear changes.
gears.on('shift', function() {
	var gearNumber = this.currentGear();
	...
});

```

4) Manually change the gears:
```

gears.shiftUp();

gears.shiftDown();

```

Roadmap
-------
More sophisticated gear changing mechanisms.