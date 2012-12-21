/* gearbox.js
 * version 0.2
 * written by Steven Hunt
 * released under the MIT License. */

//create the gearbox "namespace".
var gearbox = gearbox || { version: "0.2" };

(function(g) {
	
	var instance = function(interval, threshold, initial_gear, top_gear) {
	
		//default interval is 1 second.
		this.interval = interval !== undefined ? interval : 1000;
		
		//threshold for changing the gear; default is 50 milliseconds 0f delay.
		if (threshold === undefined)
			this.threshold = { 'increment': { 'delay_above': 50, 'duration': 1 } };
		else if (isNaN(threshold))
			this.threshold = threshold;
		else
			this.threshold = { 'increment': { 'delay_above': threshold, 'duration': 1 } }; 

		//handle constructor overloading.
		if (initial_gear !== undefined && top_gear === undefined) {
			top_gear = initial_gear;
			initial_gear = 1;
		}

		//top gear to use, default is 10.
		this.top = top_gear !== undefined ? top_gear : 10;
			
		//initial gear is 1.
		var gear = initial_gear !== undefined ? initial_gear : 1;
		this.currentGear = function() { return gear; };
		
		//event handler callbacks.
		var callbacks = { 'shift': new Array() };
		
		//event handling function. Examples:
		this.on = function(event, fn) {
			
			//create an event reference if it doesn't exist.
			if (!callbacks.hasOwnProperty(event))
				callbacks[event] = new Array();
			
			//push the callback onto the array.
			callbacks[event].push(fn);
		};
		
		//triggers an event with parameters
		this.trigger = function(event, params) {
			
			//if the event isn't registered, return false.
			if (!callbacks.hasOwnProperty(event))
				return false;
			
			for (var i = 0; i < callbacks[event].length; i++) {
				callbacks[event][i].apply(this, params);
			}
			return true;
		};
		
		//shift the gears up.
		this.shiftUp = function() {
		
			if (gear >= this.top)
				return false;
		
			gear++;
			this.trigger('shift');
			return true;
		};
		
		//shift the gears back down.
		this.shiftDown = function() {

			if (gear <= 1)
				return false;

			gear--;
			this.trigger('shift');
			return true;
		};
				
		var prevInterval = 0;

		var performance = 0;
		var duration = 0;
		
		//returns the last reported delay (in milliseconds)
		this.performance = function() {
			return performance;
		};
		
		//indicates the current status of the gearbox.
		this.status = "stopped";
		
		var that = this;
		
		//calculate whether to change gears.
		var checkPerformance = function() {
			
			var items = [that.threshold.increment instanceof Array ? that.threshold.increment : new Array(that.threshold.increment),
						 that.threshold.decrement instanceof Array ? that.threshold.decrement : new Array(that.threshold.decrement)];			
			
			for (var i = 0; i < items.length; i++) {
				
				if (items[i] === undefined)
					continue;
					
				for (var j = 0; j < items[i].length; j++) {

					var c = items[i][j];

					if (c === undefined)
						continue;

					if ((c.delay_above && performance > c.delay_above) || (c.delay_below && performance < c.delay_below)) {
						
						duration++;
						
						if (!c.duration || duration >= c.duration) {
							if (i == 0)
								that.shiftUp();
							else
								that.shiftDown();
						}
						
						return;
					}
				}
			}
		};
		
		//handle timeouts
		var intervalCheck = null;		
		var timeout = function() {
			if (that.status == "stopped")
				return;
			setTimeout(intervalCheck, that.interval);
		};
		
		//calculate performance and check it.
		intervalCheck = function() {
			var currTime = new Date().getTime();
			if (prevInterval > 0) {
				performance = currTime - prevInterval - that.interval;
				checkPerformance();
			}
			prevInterval = currTime;
			timeout();
		};
		
		//starts the gearbox.
		this.start = function() {
			if (this.status == "started")
				return false;

			this.status = "started";
			timeout();
			return true;
		};
		
		//stops the gearbox.
		this.stop = function() {
			this.status = "stopped";
		};
		
		//auto-start
		this.start();
	};
	
	//track all gearboxes running on the page.
	instances = { };

	//reads a cookie by name.
	var readCookie = function(name) {
		
		var cookies = document.cookie.split('; ');
		for (var i = 0; i < cookies.length; i++) {
			var cookie = cookies[i].split('=');
			if (unescape(cookie[0]) == name)
				return unescape(cookie[1]);
		}
		
		return null;
	};

	//writes a cookie.
	var writeCookie = function(name, value, exdays) {
	
		var exdate = new Date();
		exdate.setDate(exdate.getDate() + exdays);
		var c_name = escape(name);
		var c_value = escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
		document.cookie= c_name + "=" + c_value;

	};
	
	//used to get a specific gearbox.
	g.get = function(name) {
		if (!instances.hasOwnProperty(name))
			return false;
		return instances[name];
	};
	
	//used to create a new gearbox.
	g.create = function(name, interval, threshold, initial, top) {
		
		//name already exists!
		if (instances.hasOwnProperty(name))
			return false;
		
		//check for cookie.
		var cookie = readCookie("gearbox_js_"+name);
		if (cookie)
			initial = cookie;
		
		instances[name] = new instance(interval, threshold, initial, top);
				
		return instances[name];
	};
	
	//create a default gearbox.
	g.create("default");
	
	//used to destroy a gearbox.
	g.destroy = function(name) {

		//name does not exist!
		if (!instances.hasOwnProperty(name))
			return false;
		
		//stop the instance and delete the reference to it.
		instances[name].stop();
		delete instances[name];
	
		return true;
	};
		
	//stores the value of the current gear in a cookie.
	g.save = function(name) {
		if (name === undefined) {
			var keys = Object.keys(instances);
			for (var i = 0; i < keys.length; i++) {
				writeCookie("gearbox_js_"+keys[i], instances[keys[i]].currentGear(), 7);
			}
		}
		else if (instances.hasOwnProperty(name)) {
				writeCookie("gearbox_js_"+name, instances[name].currentGear(), 7);
		}
	}
	
	//calls the name function on all instances.
	var callFnAll = function(name) {
		var result = {};
		var keys = Object.keys(instances);
		for (var i = 0; i < keys.length; i++) {
			var instance = instances[keys[i]];
			result[keys[i]] = instance[name]();
		}
		return result;
	};
	
	g.all = {
		
		start: function() {
			return callFnAll("start");
		},
		
		stop: function() {
			return callFnAll("stop");
		},
		
		shiftUp: function() {
			return callFnAll("shiftUp");
		},
		
		shiftDown: function() {
			return callFnAll("shiftDown");
		},
		
		performance: function() {
			return callFnAll("performance");
		},

		currentGear: function() {
			return callFnAll("currentGear");
		}		
	};
	
})(gearbox);