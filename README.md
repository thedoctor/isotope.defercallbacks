isotope.defercallbacks
======================
DeferCallbacks extension for Isotope
----------------------

A little jquery.isotope plugin that prevents callbacks supplied to isotope functions from being called until any animations have completed.

Usage: 
----------------------
1. Include this js file after you've loaded isotope.
 ```
 <script type="text/javascript" src="jquery.isotope.js></script>
 <script type="text/javascript" src="jquery.isotope.delaycallbacks.js></script>
 ```
2. Callbacks are not delayed by default. 
   You can delay globally by passing isotope the deferCallbacks option:
 ```
 $container.isotope({deferCallbacks: true,
                     layoutMode: 'whatever',});
 ```
 Or if you want to delay a callback from a single function call, 
 provide the callback as an object with the key 'defer':
 `$container.isotope('addItems', $items, { defer : function(){} });`
    
NOTE: If defer is NOT set on a callback, it will be called immediately after the style processor, which is not the default isotope behavior in all cases. If your behavior is broken after installing this plugin, try using the global deferCallbacks option.
	  
@author Matt Smith, [G-Men Media]: http://gmenmedia.com <matt.the.smith@gmail.com>
 