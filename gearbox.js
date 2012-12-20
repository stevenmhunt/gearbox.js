/* gearbox.js
 * version 0.1
 * written by Steven Hunt
 * released under the MIT License. */

//create the gearbox "namespace".
var gearbox = gearbox || { version: "0.1" };

(function(g) {
	
	var instance = function(interval, threshold, top) {
	
		//default interval is 1 second.
		this.interval = interval !== undefined ? interval : 1000;
		
		//threshold for changing the gear; default is 50 milliseconds 0f delay.
		this.threshold = threshold !== undefined ? threshold : 50;

		//top gear to use, default is 10.
		this.top = top !== undefined ? top : 10;
		
		//initial gear is 1.
		var gear = 1;
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
		
		//returns the last reported delay (in milliseconds)
		this.performance = function() {
			return performance;
		};
		
		//indicates the current status of the gearbox.
		this.status = "started";
		
		var that = this;
		
		var intervalCheck = null;
		var timeout = function() {
			if (that.status == "stopped")
				return;
			setTimeout(intervalCheck, that.interval);
		};
		
		intervalCheck = function() {
			var currTime = new Date().getTime();
			if (prevInterval > 0) {
				performance = currTime - prevInterval - that.interval;
				if (performance > that.threshold) {
					that.shiftUp();
				}
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
	instances = { "default": new instance() };
	
	//used to get a specific gearbox.
	g.get = function(name) {
		if (!instances.hasOwnProperty(name))
			return false;
		return instances[name];
	};
	
	//used to create a new gearbox.
	g.create = function(name, interval, threshold, top) {
		
		//name already exists!
		if (instances.hasOwnProperty(name))
			return false;
			
		instances[name] = new instance(interval, threshold, top);
		return instances[name];
	};
	
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
	
})(gearbox);