/*
 * DeferCallbacks extension for Isotope
 * A little jquery.isotope plugin that prevents callbacks supplied to isotope functions
 * from being called until any animations have completed.
 *
 * Usage: 
 * 1. Include this js file after you've loaded isotope.
 *    <script type="text/javascript" src="jquery.isotope.js></script>
 *    <script type="text/javascript" src="jquery.isotope.delaycallbacks.js></script>
 * 2. Callbacks are not delayed by default. 
 *    You can delay globally by passing isotope the deferCallbacks option:
 *    $container.isotope({deferCallbacks: true,
 *                        layoutMode: 'whatever',});
 *    
 *    Or if you want to delay a callback from a single function call, 
 *    provide the callback as an object with the key 'defer':
 *    $container.isotope('addItems', $items, { defer : function(){} });
 *    
 *    NOTE: If defer is NOT set on a callback, it will be called immediately after 
 *          the style processor, which is not the default isotope behavior in all
 *          cases. If your behavior is broken after installing this plugin, try using
 *          the global deferCallbacks option.
 *
 * @author Matt Smith, G-Men Media <matt.the.smith@gmail.com>
 */
;(function($, undefined){
    // Add setting to globally postpone callbacks
    $.extend($.Isotope.settings, {
	deferCallbacks : false,
    });

    $.extend($.Isotope.prototype, {
	// Store deferred (promise) objects for each element
	animationPromises : [],

	// DC: This function is mostly copied from the source, so I'm marking new comments with DC:
	_processStyleQueue : function( $elems, callback ) {
	    // are we animating the layout arrangement?
	    // use plugin-ish syntax for css or animate
	    var styleFn = !this.isLaidOut ? 'css' : (
		this.isUsingJQueryAnimation ? 'animate' : 'css'
	    ),
	    animOpts = this.options.animationOptions,
	    onLayout = this.options.onLayout,
	    objStyleFn, processor,
	    triggerCallbackNow, callbackFn, 
	    
	    // default styleQueue processor, may be overwritten down below
	    processor = function( i, obj ) {
		return obj.$el[ styleFn ]( obj.style, animOpts );
	    };
	    
	    if ( this._isInserting && this.isUsingJQueryAnimation ) {
		// if using styleQueue to insert items
		processor = function( i, obj ) {
		    // only animate if it not being inserted
		    objStyleFn = obj.$el.hasClass('no-transition') ? 'css' : styleFn;
		    return obj.$el[ styleFn ]( obj.style, animOpts );
		};
		
	    } 
	    
	    // DC: Run all the time. For some reason we weren't allowing callbacks on .animate() inserts???
	    if ( callback || onLayout || animOpts.complete ) {
		// has callback
		var isCallbackTriggered = false,
		callbacks = [ callback, onLayout, animOpts.complete ], // array of possible callbacks to trigger
		instance = this;

		// DC: Check for defer instructions.
		var deferCallbacks = !!this.options.deferCallbacks;
		// DC: Still have to check these to strip out the objects
		for (var i=0, len = callbacks.length; i < len; i++) {
		    if ( typeof callbacks[i] === 'object' && callbacks[i].hasOwnProperty('defer')) {
			callbacks[i] = callbacks[i].defer;
			deferCallbacks = true;
		    }
		}
		
		// trigger callback only once
		callbackFn = function() {
		    if ( isCallbackTriggered ) {
			//return;
		    }
		    var hollaback;
		    for (var i=0, len = callbacks.length; i < len; i++) {
			hollaback = callbacks[i];
			if ( typeof hollaback === 'function' ) {
			    hollaback.call( instance.element, $elems, instance );
			}
		    }
		    isCallbackTriggered = true;
		};

		if (deferCallbacks) {
		    // DC: Instead of processing right now, pass the styleQueue and processor on so we can record promises
		    this._generateAnimationDeferred(this.styleQueue, processor);
		    
		    $.when.apply(null, this.animationPromises).done(callbackFn);
		} else {
		    // DC: Defer not set, just process and run callback
		    $.each(this.styleQueue, function(i, obj){
			processor(i, obj);
		    });
		    callbackFn();
		}
	    } else {
		// DC: No callback, no worries!
		$.each(this.styleQueue, function(i, obj){
		    processor(i, obj);
		});
	    }
	    

	    // clear out queue for next time
	    this.styleQueue = [];
	},
	
	
	// DC: This is where the work is done. Run the processor and generate promises for each.
	_generateAnimationDeferred : function(styleQueue, processor) {
	    var instance = this;
	    $.each(styleQueue, function(i, obj){
		// If our processor returns a Deferred object (.animate()), then we have our Deferred object already
		defer = processor(i, obj);

		// Or, if not (.css()), make one and bind a resolve to the end of the transition for this element
		if (!$.isFunction(defer.promise)) {
		    defer = $.Deferred(function(d){
			obj.$el.on(transitionEndEvent, d.resolve);
		    });
		}

		instance.animationPromises.push(defer.promise());
	    });
	}

    });
})(jQuery)