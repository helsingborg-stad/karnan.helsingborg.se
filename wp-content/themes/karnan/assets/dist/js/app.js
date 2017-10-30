/*!
 * jQuery Scrollify
 * Version 1.0.17
 *
 * Requires:
 * - jQuery 1.7 or higher
 *
 * https://github.com/lukehaas/Scrollify
 *
 * Copyright 2016, Luke Haas
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.



if touchScroll is false - update index

 */
(function (global,factory) {
	"use strict";
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['jquery'], function($) {
			return factory($, global, global.document);
		});
	} else if (typeof module === 'object' && module.exports) {
		// Node/CommonJS
		module.exports = factory(require('jquery'), global, global.document);
	} else {
		// Browser globals
		factory(jQuery, global, global.document);
	}
}(typeof window !== 'undefined' ? window : this, function ($, window, document, undefined) {
	"use strict";
	var heights = [],
		names = [],
		elements = [],
		overflow = [],
		index = 0,
		currentIndex = 0,
		interstitialIndex = 1,
		hasLocation = false,
		timeoutId,
		timeoutId2,
		$window = $(window),
		top = $window.scrollTop(),
		scrollable = false,
		locked = false,
		scrolled = false,
		manualScroll,
		swipeScroll,
		util,
		disabled = false,
		scrollSamples = [],
		scrollTime = new Date().getTime(),
		firstLoad = true,
		initialised = false,
		destination = 0,
		wheelEvent = 'onwheel' in document ? 'wheel' : document.onmousewheel !== undefined ? 'mousewheel' : 'DOMMouseScroll',
		settings = {
			//section should be an identifier that is the same for each section
			section: ".section",
			sectionName: "section-name",
			interstitialSection: "",
			easing: "easeOutExpo",
			scrollSpeed: 1100,
			offset: 0,
			scrollbars: true,
			target:"html,body",
			standardScrollElements: false,
			setHeights: true,
			overflowScroll:true,
			updateHash: true,
			touchScroll:true,
			before:function() {},
			after:function() {},
			afterResize:function() {},
			afterRender:function() {}
		};
	function animateScroll(index,instant,callbacks,toTop) {
		if(currentIndex===index) {
			callbacks = false;
		}
		if(disabled===true) {
			return true;
		}
		if(names[index]) {
			scrollable = false;
			if(callbacks) {
				settings.before(index,elements);
			}
			interstitialIndex = 1;
			destination = heights[index];
			if(firstLoad===false && currentIndex>index && toTop===false) {
				//We're going backwards
				if(overflow[index]) {

					interstitialIndex = parseInt(elements[index].outerHeight()/$window.height());

					destination = parseInt(heights[index])+(elements[index].outerHeight()-$window.height());
				}
			}


			if(settings.updateHash && settings.sectionName && !(firstLoad===true && index===0)) {
				if(history.pushState) {
				    try {
							history.replaceState(null, null, names[index]);
				    } catch (e) {
				    	if(window.console) {
				    		console.warn("Scrollify warning: Page must be hosted to manipulate the hash value.");
				    	}
				    }

				} else {
					window.location.hash = names[index];
				}
			}
			if(firstLoad) {
					settings.afterRender();
					firstLoad = false;
			}


			currentIndex = index;
			if(instant) {
				$(settings.target).stop().scrollTop(destination);
				if(callbacks) {
					settings.after(index,elements);
				}
			} else {
				locked = true;
				if( $().velocity ) {
					$(settings.target).stop().velocity('scroll', {
					  duration: settings.scrollSpeed,
					  easing: settings.easing,
					  offset: destination,
					  mobileHA: false
				  });
				} else {
					$(settings.target).stop().animate({
						scrollTop: destination
					}, settings.scrollSpeed,settings.easing);
				}

				if(window.location.hash.length && settings.sectionName && window.console) {
					try {
						if($(window.location.hash).length) {
							console.warn("Scrollify warning: ID matches hash value - this will cause the page to anchor.");
						}
					} catch (e) {}
				}
				$(settings.target).promise().done(function(){
					locked = false;
					firstLoad = false;
					if(callbacks) {
						settings.after(index,elements);
					}
				});
			}

		}
	}

	function isAccelerating(samples) {
				function average(num) {
					var sum = 0;

					var lastElements = samples.slice(Math.max(samples.length - num, 1));

          for(var i = 0; i < lastElements.length; i++){
              sum += lastElements[i];
          }

          return Math.ceil(sum/num);
				}

				var avEnd = average(10);
        var avMiddle = average(70);

        if(avEnd >= avMiddle) {
					return true;
				} else {
					return false;
				}
	}
	var scrollify = function(options) {
		initialised = true;
		$.easing['easeOutExpo'] = function(x, t, b, c, d) {
			return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
		};

		manualScroll = {
			handleMousedown:function() {
				if(disabled===true) {
					return true;
				}
				scrollable = false;
				scrolled = false;
			},
			handleMouseup:function() {
				if(disabled===true) {
					return true;
				}
				scrollable = true;
				if(scrolled) {
					//instant,callbacks
					manualScroll.calculateNearest(false,true);
				}
			},
			handleScroll:function() {
				if(disabled===true) {
					return true;
				}
				if(timeoutId){
					clearTimeout(timeoutId);
				}

				timeoutId = setTimeout(function(){
					scrolled = true;
					if(scrollable===false) {
						return false;
					}
					scrollable = false;
					//instant,callbacks
					manualScroll.calculateNearest(false,true);
				}, 200);
			},
			calculateNearest:function(instant,callbacks) {
				top = $window.scrollTop();
				var i =1,
					max = heights.length,
					closest = 0,
					prev = Math.abs(heights[0] - top),
					diff;
				for(;i<max;i++) {
					diff = Math.abs(heights[i] - top);

					if(diff < prev) {
						prev = diff;
						closest = i;
					}
				}
				if((atBottom() && closest>index) || atTop()) {
					index = closest;
					//index, instant, callbacks, toTop
					animateScroll(closest,instant,callbacks,false);
				}
			},
			wheelHandler:function(e) {
				if(disabled===true) {
					return true;
				} else if(settings.standardScrollElements) {
					if($(e.target).is(settings.standardScrollElements) || $(e.target).closest(settings.standardScrollElements).length) {
						return true;
					}
				}
				if(!overflow[index]) {
					e.preventDefault();
				}
				var currentScrollTime = new Date().getTime();



				e = e || window.event;
				var value = e.originalEvent.wheelDelta || -e.originalEvent.deltaY || -e.originalEvent.detail;
				var delta = Math.max(-1, Math.min(1, value));



				//delta = delta || -e.originalEvent.detail / 3 || e.originalEvent.wheelDelta / 120;


				if(scrollSamples.length > 149){
					scrollSamples.shift();
				}
				//scrollSamples.push(Math.abs(delta*10));
				scrollSamples.push(Math.abs(value));

				if((currentScrollTime-scrollTime) > 200){
					scrollSamples = [];
				}
				scrollTime = currentScrollTime;


				if(locked) {
					return false;
				}
				if(delta<0) {
					if(index<heights.length-1) {
						if(atBottom()) {
							if(isAccelerating(scrollSamples)) {
								e.preventDefault();
								index++;
								locked = true;
								//index, instant, callbacks, toTop
								animateScroll(index,false,true, false);
							} else {
								return false;
							}
						}
					}
				} else if(delta>0) {
					if(index>0) {
						if(atTop()) {
							if(isAccelerating(scrollSamples)) {
								e.preventDefault();
								index--;
								locked = true;
								//index, instant, callbacks, toTop
								animateScroll(index,false,true, false);
							} else {
								return false
							}
						}
					}
				}

			},
			keyHandler:function(e) {
				if(disabled===true || document.activeElement.readOnly===false) {
					return true;
				}
				if(locked===true) {
					return false;
				}
				if(e.keyCode==38 || e.keyCode==33) {
					if(index>0) {
						if(atTop()) {
							e.preventDefault();
							index--;
							//index, instant, callbacks, toTop
							animateScroll(index,false,true,false);
						}
					}
				} else if(e.keyCode==40 || e.keyCode==34) {
					if(index<heights.length-1) {
						if(atBottom()) {
							e.preventDefault();
							index++;
							//index, instant, callbacks, toTop
							animateScroll(index,false,true,false);
						}
					}
				}
			},
			init:function() {
				if(settings.scrollbars) {
					$window.on('mousedown', manualScroll.handleMousedown);
					$window.on('mouseup', manualScroll.handleMouseup);
					$window.on('scroll', manualScroll.handleScroll);
				} else {
					$("body").css({"overflow":"hidden"});
				}
				$window.on(wheelEvent,manualScroll.wheelHandler);
				//$(document).bind(wheelEvent,manualScroll.wheelHandler);
				$window.on('keydown', manualScroll.keyHandler);
			}
		};

		swipeScroll = {
			touches : {
				"touchstart": {"y":-1,"x":-1},
				"touchmove" : {"y":-1,"x":-1},
				"touchend"  : false,
				"direction" : "undetermined"
			},
			options:{
				"distance" : 30,
				"timeGap" : 800,
				"timeStamp" : new Date().getTime()
			},
			touchHandler: function(event) {
				if(disabled===true) {
					return true;
				} else if(settings.standardScrollElements) {
					if($(event.target).is(settings.standardScrollElements) || $(event.target).closest(settings.standardScrollElements).length) {
						return true;
					}
				}
				var touch;
				if (typeof event !== 'undefined'){
					if (typeof event.touches !== 'undefined') {
						touch = event.touches[0];
						switch (event.type) {
							case 'touchstart':
								swipeScroll.touches.touchstart.y = touch.pageY;
								swipeScroll.touches.touchmove.y = -1;

								swipeScroll.touches.touchstart.x = touch.pageX;
								swipeScroll.touches.touchmove.x = -1;

								swipeScroll.options.timeStamp = new Date().getTime();
								swipeScroll.touches.touchend = false;
							case 'touchmove':
								swipeScroll.touches.touchmove.y = touch.pageY;
								swipeScroll.touches.touchmove.x = touch.pageX;
								if(swipeScroll.touches.touchstart.y!==swipeScroll.touches.touchmove.y && (Math.abs(swipeScroll.touches.touchstart.y-swipeScroll.touches.touchmove.y)>Math.abs(swipeScroll.touches.touchstart.x-swipeScroll.touches.touchmove.x))) {
									//if(!overflow[index]) {
										event.preventDefault();
									//}
									swipeScroll.touches.direction = "y";
									if((swipeScroll.options.timeStamp+swipeScroll.options.timeGap)<(new Date().getTime()) && swipeScroll.touches.touchend == false) {

										swipeScroll.touches.touchend = true;
										if (swipeScroll.touches.touchstart.y > -1) {

											if(Math.abs(swipeScroll.touches.touchmove.y-swipeScroll.touches.touchstart.y)>swipeScroll.options.distance) {
												if(swipeScroll.touches.touchstart.y < swipeScroll.touches.touchmove.y) {

													swipeScroll.up();

												} else {
													swipeScroll.down();

												}
											}
										}
									}
								}
								break;
							case 'touchend':
								if(swipeScroll.touches[event.type]===false) {
									swipeScroll.touches[event.type] = true;
									if (swipeScroll.touches.touchstart.y > -1 && swipeScroll.touches.touchmove.y > -1 && swipeScroll.touches.direction==="y") {

										if(Math.abs(swipeScroll.touches.touchmove.y-swipeScroll.touches.touchstart.y)>swipeScroll.options.distance) {
											if(swipeScroll.touches.touchstart.y < swipeScroll.touches.touchmove.y) {
												swipeScroll.up();

											} else {
												swipeScroll.down();

											}
										}
										swipeScroll.touches.touchstart.y = -1;
										swipeScroll.touches.touchstart.x = -1;
										swipeScroll.touches.direction = "undetermined";
									}
								}
							default:
								break;
						}
					}
				}
			},
			down: function() {

				if(index<heights.length) {

					if(atBottom() && index<heights.length-1) {

						index++;
						//index, instant, callbacks, toTop
						animateScroll(index,false,true,false);
					} else {
						if(Math.floor(elements[index].height()/$window.height())>interstitialIndex) {

							interstitialScroll(parseInt(heights[index])+($window.height()*interstitialIndex));
							interstitialIndex += 1;

						} else {
							interstitialScroll(parseInt(heights[index])+(elements[index].outerHeight()-$window.height()));
						}

					}
				}
			},
			up: function() {
				if(index>=0) {
					if(atTop() && index>0) {

						index--;
						//index, instant, callbacks, toTop
						animateScroll(index,false,true,false);
					} else {

						if(interstitialIndex>2) {

							interstitialIndex -= 1;
							interstitialScroll(parseInt(heights[index])+($window.height()*interstitialIndex));

						} else {

							interstitialIndex = 1;
							interstitialScroll(parseInt(heights[index]));
						}
					}

				}
			},
			init: function() {
				if (document.addEventListener && settings.touchScroll) {
					document.addEventListener('touchstart', swipeScroll.touchHandler, false);
					document.addEventListener('touchmove', swipeScroll.touchHandler, false);
					document.addEventListener('touchend', swipeScroll.touchHandler, false);
				}
			}
		};


		util = {
			refresh:function(withCallback,scroll) {
				clearTimeout(timeoutId2);
				timeoutId2 = setTimeout(function() {
					//retain position
					sizePanels(true);
					//scroll, firstLoad
					calculatePositions(scroll,false);
					if(withCallback) {
							settings.afterResize();
					}
				},400);
			},
			handleUpdate:function() {
				//callbacks, scroll
				//changed from false,true to false,false
				util.refresh(false,false);
			},
			handleResize:function() {
				//callbacks, scroll
				util.refresh(true,false);
			},
			handleOrientation:function() {
				//callbacks, scroll
				util.refresh(true,true);
			}
		};
		settings = $.extend(settings, options);

		//retain position
		sizePanels(false);

		calculatePositions(false,true);

		if(true===hasLocation) {
			//index, instant, callbacks, toTop
			animateScroll(index,false,true,true);
		} else {
			setTimeout(function() {
				//instant,callbacks
				manualScroll.calculateNearest(true,false);
			},200);
		}
		if(heights.length) {
			manualScroll.init();
			swipeScroll.init();

			$window.on("resize",util.handleResize);
			if (document.addEventListener) {
				window.addEventListener("orientationchange", util.handleOrientation, false);
			}
		}
		function interstitialScroll(pos) {
			if( $().velocity ) {
				$(settings.target).stop().velocity('scroll', {
					duration: settings.scrollSpeed,
					easing: settings.easing,
					offset: pos,
					mobileHA: false
				});
			} else {
				$(settings.target).stop().animate({
					scrollTop: pos
				}, settings.scrollSpeed,settings.easing);
			}
		}

		function sizePanels(keepPosition) {
			if(keepPosition) {
				top = $window.scrollTop();
			}

			var selector = settings.section;
			overflow = [];
			if(settings.interstitialSection.length) {
				selector += "," + settings.interstitialSection;
			}
			if(settings.scrollbars===false) {
				settings.overflowScroll = false;
			}
			$(selector).each(function(i) {
				var $this = $(this);

				if(settings.setHeights) {
					if($this.is(settings.interstitialSection)) {
						overflow[i] = false;
					} else {
						if(($this.css("height","auto").outerHeight()<$window.height()) || $this.css("overflow")==="hidden") {
							$this.css({"height":$window.height()});

							overflow[i] = false;
						} else {

							$this.css({"height":$this.height()});

							if(settings.overflowScroll) {
								overflow[i] = true;
							} else {
								overflow[i] = false;
							}
						}

					}

				} else {

					if(($this.outerHeight()<$window.height()) || (settings.overflowScroll===false)) {
						overflow[i] = false;
					} else {
						overflow[i] = true;
					}
				}
			});
			if(keepPosition) {
				$window.scrollTop(top);
			}
		}
		function calculatePositions(scroll,firstLoad) {
			var selector = settings.section;
			if(settings.interstitialSection.length) {
				selector += "," + settings.interstitialSection;
			}
			heights = [];
			names = [];
			elements = [];
			$(selector).each(function(i){
					var $this = $(this);
					if(i>0) {
						heights[i] = parseInt($this.offset().top) + settings.offset;
					} else {
						heights[i] = parseInt($this.offset().top);
					}
					if(settings.sectionName && $this.data(settings.sectionName)) {
						names[i] = "#" + $this.data(settings.sectionName).toString().replace(/ /g,"-");
					} else {
						if($this.is(settings.interstitialSection)===false) {
							names[i] = "#" + (i + 1);
						} else {
							names[i] = "#";
							if(i===$(selector).length-1 && i>1) {

								heights[i] = heights[i-1]+(parseInt($($(selector)[i-1]).outerHeight())-parseInt($(window).height()))+parseInt($this.outerHeight());
							}
						}
					}
					elements[i] = $this;
					try {
						if($(names[i]).length && window.console) {
							console.warn("Scrollify warning: Section names can't match IDs - this will cause the browser to anchor.");
						}
					} catch (e) {}

					if(window.location.hash===names[i]) {
						index = i;
						hasLocation = true;
					}

			});

			if(true===scroll) {
				//index, instant, callbacks, toTop
				animateScroll(index,false,false,false);
			}
		}

		function atTop() {
			if(!overflow[index]) {
				return true;
			}
			top = $window.scrollTop();
			if(top>parseInt(heights[index])) {
				return false;
			} else {
				return true;
			}
		}
		function atBottom() {
			if(!overflow[index]) {
				return true;
			}
			top = $window.scrollTop();

			if(top<parseInt(heights[index])+(elements[index].outerHeight()-$window.height())-28) {

				return false;

			} else {
				return true;
			}
		}
	}

	function move(panel,instant) {
		var z = names.length;
		for(;z>=0;z--) {
			if(typeof panel === 'string') {
				if (names[z]===panel) {
					index = z;
					//index, instant, callbacks, toTop
					animateScroll(z,instant,true,true);
				}
			} else {
				if(z===panel) {
					index = z;
					//index, instant, callbacks, toTop
					animateScroll(z,instant,true,true);
				}
			}
		}
	}
	scrollify.move = function(panel) {
		if(panel===undefined) {
			return false;
		}
		if(panel.originalEvent) {
			panel = $(this).attr("href");
		}
		move(panel,false);
	};
	scrollify.instantMove = function(panel) {
		if(panel===undefined) {
			return false;
		}
		move(panel,true);
	};
	scrollify.next = function() {
		if(index<names.length) {
			index += 1;
			//index, instant, callbacks, toTop
			animateScroll(index,false,true,true);
		}
	};
	scrollify.previous = function() {
		if(index>0) {
			index -= 1;
			//index, instant, callbacks, toTop
			animateScroll(index,false,true,true);
		}
	};
	scrollify.instantNext = function() {
		if(index<names.length) {
			index += 1;
			//index, instant, callbacks, toTop
			animateScroll(index,true,true,true);
		}
	};
	scrollify.instantPrevious = function() {
		if(index>0) {
			index -= 1;
			//index, instant, callbacks, toTop
			animateScroll(index,true,true,true);
		}
	};
	scrollify.destroy = function() {
		if(!initialised) {
			return false;
		}
		if(settings.setHeights) {
			$(settings.section).each(function() {
				$(this).css("height","auto");
			});
		}
		$window.off("resize",util.handleResize);
		if(settings.scrollbars) {
			$window.off('mousedown', manualScroll.handleMousedown);
			$window.off('mouseup', manualScroll.handleMouseup);
			$window.off('scroll', manualScroll.handleScroll);
		}
		$window.off(wheelEvent,manualScroll.wheelHandler);
		$window.off('keydown', manualScroll.keyHandler);

		if (document.addEventListener && settings.touchScroll) {
			document.removeEventListener('touchstart', swipeScroll.touchHandler, false);
			document.removeEventListener('touchmove', swipeScroll.touchHandler, false);
			document.removeEventListener('touchend', swipeScroll.touchHandler, false);
		}
		heights = [];
		names = [];
		elements = [];
		overflow = [];
	};
	scrollify.update = function() {
		if(!initialised) {
			return false;
		}
		util.handleUpdate();
	};
	scrollify.current = function() {
		return elements[index];
	};
	scrollify.currentIndex = function() {
		return index;
	};
	scrollify.disable = function() {
		disabled = true;
	};
	scrollify.enable = function() {
		disabled = false;
		if (initialised) {
			//instant,callbacks
			manualScroll.calculateNearest(false,false);
		}
	};
	scrollify.isDisabled = function() {
		return disabled;
	};
	scrollify.setOptions = function(updatedOptions) {
		if(!initialised) {
			return false;
		}
		if(typeof updatedOptions === "object") {
			settings = $.extend(settings, updatedOptions);
			util.handleUpdate();
		} else if(window.console) {
			console.warn("Scrollify warning: setOptions expects an object.");
		}
	};
	$.scrollify = scrollify;
	return scrollify;
}));

/*!
 * Stellar.js v0.6.2
 * http://markdalgleish.com/projects/stellar.js
 *
 * Copyright 2014, Mark Dalgleish
 * This content is released under the MIT license
 * http://markdalgleish.mit-license.org
 */

;(function($, window, document, undefined) {

	var pluginName = 'stellar',
		defaults = {
			scrollProperty: 'scroll',
			positionProperty: 'position',
			horizontalScrolling: true,
			verticalScrolling: true,
			horizontalOffset: 0,
			verticalOffset: 0,
			responsive: false,
			parallaxBackgrounds: true,
			parallaxElements: true,
			hideDistantElements: true,
			hideElement: function($elem) { $elem.hide(); },
			showElement: function($elem) { $elem.show(); }
		},

		scrollProperty = {
			scroll: {
				getLeft: function($elem) { return $elem.scrollLeft(); },
				setLeft: function($elem, val) { $elem.scrollLeft(val); },

				getTop: function($elem) { return $elem.scrollTop();	},
				setTop: function($elem, val) { $elem.scrollTop(val); }
			},
			position: {
				getLeft: function($elem) { return parseInt($elem.css('left'), 10) * -1; },
				getTop: function($elem) { return parseInt($elem.css('top'), 10) * -1; }
			},
			margin: {
				getLeft: function($elem) { return parseInt($elem.css('margin-left'), 10) * -1; },
				getTop: function($elem) { return parseInt($elem.css('margin-top'), 10) * -1; }
			},
			transform: {
				getLeft: function($elem) {
					var computedTransform = getComputedStyle($elem[0])[prefixedTransform];
					return (computedTransform !== 'none' ? parseInt(computedTransform.match(/(-?[0-9]+)/g)[4], 10) * -1 : 0);
				},
				getTop: function($elem) {
					var computedTransform = getComputedStyle($elem[0])[prefixedTransform];
					return (computedTransform !== 'none' ? parseInt(computedTransform.match(/(-?[0-9]+)/g)[5], 10) * -1 : 0);
				}
			}
		},

		positionProperty = {
			position: {
				setLeft: function($elem, left) { $elem.css('left', left); },
				setTop: function($elem, top) { $elem.css('top', top); }
			},
			transform: {
				setPosition: function($elem, left, startingLeft, top, startingTop) {
					$elem[0].style[prefixedTransform] = 'translate3d(' + (left - startingLeft) + 'px, ' + (top - startingTop) + 'px, 0)';
				}
			}
		},

		// Returns a function which adds a vendor prefix to any CSS property name
		vendorPrefix = (function() {
			var prefixes = /^(Moz|Webkit|Khtml|O|ms|Icab)(?=[A-Z])/,
				style = $('script')[0].style,
				prefix = '',
				prop;

			for (prop in style) {
				if (prefixes.test(prop)) {
					prefix = prop.match(prefixes)[0];
					break;
				}
			}

			if ('WebkitOpacity' in style) { prefix = 'Webkit'; }
			if ('KhtmlOpacity' in style) { prefix = 'Khtml'; }

			return function(property) {
				return prefix + (prefix.length > 0 ? property.charAt(0).toUpperCase() + property.slice(1) : property);
			};
		}()),

		prefixedTransform = vendorPrefix('transform'),

		supportsBackgroundPositionXY = $('<div />', { style: 'background:#fff' }).css('background-position-x') !== undefined,

		setBackgroundPosition = (supportsBackgroundPositionXY ?
			function($elem, x, y) {
				$elem.css({
					'background-position-x': x,
					'background-position-y': y
				});
			} :
			function($elem, x, y) {
				$elem.css('background-position', x + ' ' + y);
			}
		),

		getBackgroundPosition = (supportsBackgroundPositionXY ?
			function($elem) {
				return [
					$elem.css('background-position-x'),
					$elem.css('background-position-y')
				];
			} :
			function($elem) {
				return $elem.css('background-position').split(' ');
			}
		),

		requestAnimFrame = (
			window.requestAnimationFrame       ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function(callback) {
				setTimeout(callback, 1000 / 60);
			}
		);

	function Plugin(element, options) {
		this.element = element;
		this.options = $.extend({}, defaults, options);

		this._defaults = defaults;
		this._name = pluginName;

		this.init();
	}

	Plugin.prototype = {
		init: function() {
			this.options.name = pluginName + '_' + Math.floor(Math.random() * 1e9);

			this._defineElements();
			this._defineGetters();
			this._defineSetters();
			this._handleWindowLoadAndResize();
			this._detectViewport();

			this.refresh({ firstLoad: true });

			if (this.options.scrollProperty === 'scroll') {
				this._handleScrollEvent();
			} else {
				this._startAnimationLoop();
			}
		},
		_defineElements: function() {
			if (this.element === document.body) this.element = window;
			this.$scrollElement = $(this.element);
			this.$element = (this.element === window ? $('body') : this.$scrollElement);
			this.$viewportElement = (this.options.viewportElement !== undefined ? $(this.options.viewportElement) : (this.$scrollElement[0] === window || this.options.scrollProperty === 'scroll' ? this.$scrollElement : this.$scrollElement.parent()) );
		},
		_defineGetters: function() {
			var self = this,
				scrollPropertyAdapter = scrollProperty[self.options.scrollProperty];

			this._getScrollLeft = function() {
				return scrollPropertyAdapter.getLeft(self.$scrollElement);
			};

			this._getScrollTop = function() {
				return scrollPropertyAdapter.getTop(self.$scrollElement);
			};
		},
		_defineSetters: function() {
			var self = this,
				scrollPropertyAdapter = scrollProperty[self.options.scrollProperty],
				positionPropertyAdapter = positionProperty[self.options.positionProperty],
				setScrollLeft = scrollPropertyAdapter.setLeft,
				setScrollTop = scrollPropertyAdapter.setTop;

			this._setScrollLeft = (typeof setScrollLeft === 'function' ? function(val) {
				setScrollLeft(self.$scrollElement, val);
			} : $.noop);

			this._setScrollTop = (typeof setScrollTop === 'function' ? function(val) {
				setScrollTop(self.$scrollElement, val);
			} : $.noop);

			this._setPosition = positionPropertyAdapter.setPosition ||
				function($elem, left, startingLeft, top, startingTop) {
					if (self.options.horizontalScrolling) {
						positionPropertyAdapter.setLeft($elem, left, startingLeft);
					}

					if (self.options.verticalScrolling) {
						positionPropertyAdapter.setTop($elem, top, startingTop);
					}
				};
		},
		_handleWindowLoadAndResize: function() {
			var self = this,
				$window = $(window);

			if (self.options.responsive) {
				$window.bind('load.' + this.name, function() {
					self.refresh();
				});
			}

			$window.bind('resize.' + this.name, function() {
				self._detectViewport();

				if (self.options.responsive) {
					self.refresh();
				}
			});
		},
		refresh: function(options) {
			var self = this,
				oldLeft = self._getScrollLeft(),
				oldTop = self._getScrollTop();

			if (!options || !options.firstLoad) {
				this._reset();
			}

			this._setScrollLeft(0);
			this._setScrollTop(0);

			this._setOffsets();
			this._findParticles();
			this._findBackgrounds();

			// Fix for WebKit background rendering bug
			if (options && options.firstLoad && /WebKit/.test(navigator.userAgent)) {
				$(window).load(function() {
					var oldLeft = self._getScrollLeft(),
						oldTop = self._getScrollTop();

					self._setScrollLeft(oldLeft + 1);
					self._setScrollTop(oldTop + 1);

					self._setScrollLeft(oldLeft);
					self._setScrollTop(oldTop);
				});
			}

			this._setScrollLeft(oldLeft);
			this._setScrollTop(oldTop);
		},
		_detectViewport: function() {
			var viewportOffsets = this.$viewportElement.offset(),
				hasOffsets = viewportOffsets !== null && viewportOffsets !== undefined;

			this.viewportWidth = this.$viewportElement.width();
			this.viewportHeight = this.$viewportElement.height();

			this.viewportOffsetTop = (hasOffsets ? viewportOffsets.top : 0);
			this.viewportOffsetLeft = (hasOffsets ? viewportOffsets.left : 0);
		},
		_findParticles: function() {
			var self = this,
				scrollLeft = this._getScrollLeft(),
				scrollTop = this._getScrollTop();

			if (this.particles !== undefined) {
				for (var i = this.particles.length - 1; i >= 0; i--) {
					this.particles[i].$element.data('stellar-elementIsActive', undefined);
				}
			}

			this.particles = [];

			if (!this.options.parallaxElements) return;

			this.$element.find('[data-stellar-ratio]').each(function(i) {
				var $this = $(this),
					horizontalOffset,
					verticalOffset,
					positionLeft,
					positionTop,
					marginLeft,
					marginTop,
					$offsetParent,
					offsetLeft,
					offsetTop,
					parentOffsetLeft = 0,
					parentOffsetTop = 0,
					tempParentOffsetLeft = 0,
					tempParentOffsetTop = 0;

				// Ensure this element isn't already part of another scrolling element
				if (!$this.data('stellar-elementIsActive')) {
					$this.data('stellar-elementIsActive', this);
				} else if ($this.data('stellar-elementIsActive') !== this) {
					return;
				}

				self.options.showElement($this);

				// Save/restore the original top and left CSS values in case we refresh the particles or destroy the instance
				if (!$this.data('stellar-startingLeft')) {
					$this.data('stellar-startingLeft', $this.css('left'));
					$this.data('stellar-startingTop', $this.css('top'));
				} else {
					$this.css('left', $this.data('stellar-startingLeft'));
					$this.css('top', $this.data('stellar-startingTop'));
				}

				positionLeft = $this.position().left;
				positionTop = $this.position().top;

				// Catch-all for margin top/left properties (these evaluate to 'auto' in IE7 and IE8)
				marginLeft = ($this.css('margin-left') === 'auto') ? 0 : parseInt($this.css('margin-left'), 10);
				marginTop = ($this.css('margin-top') === 'auto') ? 0 : parseInt($this.css('margin-top'), 10);

				offsetLeft = $this.offset().left - marginLeft;
				offsetTop = $this.offset().top - marginTop;

				// Calculate the offset parent
				$this.parents().each(function() {
					var $this = $(this);

					if ($this.data('stellar-offset-parent') === true) {
						parentOffsetLeft = tempParentOffsetLeft;
						parentOffsetTop = tempParentOffsetTop;
						$offsetParent = $this;

						return false;
					} else {
						tempParentOffsetLeft += $this.position().left;
						tempParentOffsetTop += $this.position().top;
					}
				});

				// Detect the offsets
				horizontalOffset = ($this.data('stellar-horizontal-offset') !== undefined ? $this.data('stellar-horizontal-offset') : ($offsetParent !== undefined && $offsetParent.data('stellar-horizontal-offset') !== undefined ? $offsetParent.data('stellar-horizontal-offset') : self.horizontalOffset));
				verticalOffset = ($this.data('stellar-vertical-offset') !== undefined ? $this.data('stellar-vertical-offset') : ($offsetParent !== undefined && $offsetParent.data('stellar-vertical-offset') !== undefined ? $offsetParent.data('stellar-vertical-offset') : self.verticalOffset));

				// Add our object to the particles collection
				self.particles.push({
					$element: $this,
					$offsetParent: $offsetParent,
					isFixed: $this.css('position') === 'fixed',
					horizontalOffset: horizontalOffset,
					verticalOffset: verticalOffset,
					startingPositionLeft: positionLeft,
					startingPositionTop: positionTop,
					startingOffsetLeft: offsetLeft,
					startingOffsetTop: offsetTop,
					parentOffsetLeft: parentOffsetLeft,
					parentOffsetTop: parentOffsetTop,
					stellarRatio: ($this.data('stellar-ratio') !== undefined ? $this.data('stellar-ratio') : 1),
					width: $this.outerWidth(true),
					height: $this.outerHeight(true),
					isHidden: false
				});
			});
		},
		_findBackgrounds: function() {
			var self = this,
				scrollLeft = this._getScrollLeft(),
				scrollTop = this._getScrollTop(),
				$backgroundElements;

			this.backgrounds = [];

			if (!this.options.parallaxBackgrounds) return;

			$backgroundElements = this.$element.find('[data-stellar-background-ratio]');

			if (this.$element.data('stellar-background-ratio')) {
                $backgroundElements = $backgroundElements.add(this.$element);
			}

			$backgroundElements.each(function() {
				var $this = $(this),
					backgroundPosition = getBackgroundPosition($this),
					horizontalOffset,
					verticalOffset,
					positionLeft,
					positionTop,
					marginLeft,
					marginTop,
					offsetLeft,
					offsetTop,
					$offsetParent,
					parentOffsetLeft = 0,
					parentOffsetTop = 0,
					tempParentOffsetLeft = 0,
					tempParentOffsetTop = 0;

				// Ensure this element isn't already part of another scrolling element
				if (!$this.data('stellar-backgroundIsActive')) {
					$this.data('stellar-backgroundIsActive', this);
				} else if ($this.data('stellar-backgroundIsActive') !== this) {
					return;
				}

				// Save/restore the original top and left CSS values in case we destroy the instance
				if (!$this.data('stellar-backgroundStartingLeft')) {
					$this.data('stellar-backgroundStartingLeft', backgroundPosition[0]);
					$this.data('stellar-backgroundStartingTop', backgroundPosition[1]);
				} else {
					setBackgroundPosition($this, $this.data('stellar-backgroundStartingLeft'), $this.data('stellar-backgroundStartingTop'));
				}

				// Catch-all for margin top/left properties (these evaluate to 'auto' in IE7 and IE8)
				marginLeft = ($this.css('margin-left') === 'auto') ? 0 : parseInt($this.css('margin-left'), 10);
				marginTop = ($this.css('margin-top') === 'auto') ? 0 : parseInt($this.css('margin-top'), 10);

				offsetLeft = $this.offset().left - marginLeft - scrollLeft;
				offsetTop = $this.offset().top - marginTop - scrollTop;
				
				// Calculate the offset parent
				$this.parents().each(function() {
					var $this = $(this);

					if ($this.data('stellar-offset-parent') === true) {
						parentOffsetLeft = tempParentOffsetLeft;
						parentOffsetTop = tempParentOffsetTop;
						$offsetParent = $this;

						return false;
					} else {
						tempParentOffsetLeft += $this.position().left;
						tempParentOffsetTop += $this.position().top;
					}
				});

				// Detect the offsets
				horizontalOffset = ($this.data('stellar-horizontal-offset') !== undefined ? $this.data('stellar-horizontal-offset') : ($offsetParent !== undefined && $offsetParent.data('stellar-horizontal-offset') !== undefined ? $offsetParent.data('stellar-horizontal-offset') : self.horizontalOffset));
				verticalOffset = ($this.data('stellar-vertical-offset') !== undefined ? $this.data('stellar-vertical-offset') : ($offsetParent !== undefined && $offsetParent.data('stellar-vertical-offset') !== undefined ? $offsetParent.data('stellar-vertical-offset') : self.verticalOffset));

				self.backgrounds.push({
					$element: $this,
					$offsetParent: $offsetParent,
					isFixed: $this.css('background-attachment') === 'fixed',
					horizontalOffset: horizontalOffset,
					verticalOffset: verticalOffset,
					startingValueLeft: backgroundPosition[0],
					startingValueTop: backgroundPosition[1],
					startingBackgroundPositionLeft: (isNaN(parseInt(backgroundPosition[0], 10)) ? 0 : parseInt(backgroundPosition[0], 10)),
					startingBackgroundPositionTop: (isNaN(parseInt(backgroundPosition[1], 10)) ? 0 : parseInt(backgroundPosition[1], 10)),
					startingPositionLeft: $this.position().left,
					startingPositionTop: $this.position().top,
					startingOffsetLeft: offsetLeft,
					startingOffsetTop: offsetTop,
					parentOffsetLeft: parentOffsetLeft,
					parentOffsetTop: parentOffsetTop,
					stellarRatio: ($this.data('stellar-background-ratio') === undefined ? 1 : $this.data('stellar-background-ratio'))
				});
			});
		},
		_reset: function() {
			var particle,
				startingPositionLeft,
				startingPositionTop,
				background,
				i;

			for (i = this.particles.length - 1; i >= 0; i--) {
				particle = this.particles[i];
				startingPositionLeft = particle.$element.data('stellar-startingLeft');
				startingPositionTop = particle.$element.data('stellar-startingTop');

				this._setPosition(particle.$element, startingPositionLeft, startingPositionLeft, startingPositionTop, startingPositionTop);

				this.options.showElement(particle.$element);

				particle.$element.data('stellar-startingLeft', null).data('stellar-elementIsActive', null).data('stellar-backgroundIsActive', null);
			}

			for (i = this.backgrounds.length - 1; i >= 0; i--) {
				background = this.backgrounds[i];

				background.$element.data('stellar-backgroundStartingLeft', null).data('stellar-backgroundStartingTop', null);

				setBackgroundPosition(background.$element, background.startingValueLeft, background.startingValueTop);
			}
		},
		destroy: function() {
			this._reset();

			this.$scrollElement.unbind('resize.' + this.name).unbind('scroll.' + this.name);
			this._animationLoop = $.noop;

			$(window).unbind('load.' + this.name).unbind('resize.' + this.name);
		},
		_setOffsets: function() {
			var self = this,
				$window = $(window);

			$window.unbind('resize.horizontal-' + this.name).unbind('resize.vertical-' + this.name);

			if (typeof this.options.horizontalOffset === 'function') {
				this.horizontalOffset = this.options.horizontalOffset();
				$window.bind('resize.horizontal-' + this.name, function() {
					self.horizontalOffset = self.options.horizontalOffset();
				});
			} else {
				this.horizontalOffset = this.options.horizontalOffset;
			}

			if (typeof this.options.verticalOffset === 'function') {
				this.verticalOffset = this.options.verticalOffset();
				$window.bind('resize.vertical-' + this.name, function() {
					self.verticalOffset = self.options.verticalOffset();
				});
			} else {
				this.verticalOffset = this.options.verticalOffset;
			}
		},
		_repositionElements: function() {
			var scrollLeft = this._getScrollLeft(),
				scrollTop = this._getScrollTop(),
				horizontalOffset,
				verticalOffset,
				particle,
				fixedRatioOffset,
				background,
				bgLeft,
				bgTop,
				isVisibleVertical = true,
				isVisibleHorizontal = true,
				newPositionLeft,
				newPositionTop,
				newOffsetLeft,
				newOffsetTop,
				i;

			// First check that the scroll position or container size has changed
			if (this.currentScrollLeft === scrollLeft && this.currentScrollTop === scrollTop && this.currentWidth === this.viewportWidth && this.currentHeight === this.viewportHeight) {
				return;
			} else {
				this.currentScrollLeft = scrollLeft;
				this.currentScrollTop = scrollTop;
				this.currentWidth = this.viewportWidth;
				this.currentHeight = this.viewportHeight;
			}

			// Reposition elements
			for (i = this.particles.length - 1; i >= 0; i--) {
				particle = this.particles[i];

				fixedRatioOffset = (particle.isFixed ? 1 : 0);

				// Calculate position, then calculate what the particle's new offset will be (for visibility check)
				if (this.options.horizontalScrolling) {
					newPositionLeft = (scrollLeft + particle.horizontalOffset + this.viewportOffsetLeft + particle.startingPositionLeft - particle.startingOffsetLeft + particle.parentOffsetLeft) * -(particle.stellarRatio + fixedRatioOffset - 1) + particle.startingPositionLeft;
					newOffsetLeft = newPositionLeft - particle.startingPositionLeft + particle.startingOffsetLeft;
				} else {
					newPositionLeft = particle.startingPositionLeft;
					newOffsetLeft = particle.startingOffsetLeft;
				}

				if (this.options.verticalScrolling) {
					newPositionTop = (scrollTop + particle.verticalOffset + this.viewportOffsetTop + particle.startingPositionTop - particle.startingOffsetTop + particle.parentOffsetTop) * -(particle.stellarRatio + fixedRatioOffset - 1) + particle.startingPositionTop;
					newOffsetTop = newPositionTop - particle.startingPositionTop + particle.startingOffsetTop;
				} else {
					newPositionTop = particle.startingPositionTop;
					newOffsetTop = particle.startingOffsetTop;
				}

				// Check visibility
				if (this.options.hideDistantElements) {
					isVisibleHorizontal = !this.options.horizontalScrolling || newOffsetLeft + particle.width > (particle.isFixed ? 0 : scrollLeft) && newOffsetLeft < (particle.isFixed ? 0 : scrollLeft) + this.viewportWidth + this.viewportOffsetLeft;
					isVisibleVertical = !this.options.verticalScrolling || newOffsetTop + particle.height > (particle.isFixed ? 0 : scrollTop) && newOffsetTop < (particle.isFixed ? 0 : scrollTop) + this.viewportHeight + this.viewportOffsetTop;
				}

				if (isVisibleHorizontal && isVisibleVertical) {
					if (particle.isHidden) {
						this.options.showElement(particle.$element);
						particle.isHidden = false;
					}

					this._setPosition(particle.$element, newPositionLeft, particle.startingPositionLeft, newPositionTop, particle.startingPositionTop);
				} else {
					if (!particle.isHidden) {
						this.options.hideElement(particle.$element);
						particle.isHidden = true;
					}
				}
			}

			// Reposition backgrounds
			for (i = this.backgrounds.length - 1; i >= 0; i--) {
				background = this.backgrounds[i];

				fixedRatioOffset = (background.isFixed ? 0 : 1);
				bgLeft = (this.options.horizontalScrolling ? (scrollLeft + background.horizontalOffset - this.viewportOffsetLeft - background.startingOffsetLeft + background.parentOffsetLeft - background.startingBackgroundPositionLeft) * (fixedRatioOffset - background.stellarRatio) + 'px' : background.startingValueLeft);
				bgTop = (this.options.verticalScrolling ? (scrollTop + background.verticalOffset - this.viewportOffsetTop - background.startingOffsetTop + background.parentOffsetTop - background.startingBackgroundPositionTop) * (fixedRatioOffset - background.stellarRatio) + 'px' : background.startingValueTop);

				setBackgroundPosition(background.$element, bgLeft, bgTop);
			}
		},
		_handleScrollEvent: function() {
			var self = this,
				ticking = false;

			var update = function() {
				self._repositionElements();
				ticking = false;
			};

			var requestTick = function() {
				if (!ticking) {
					requestAnimFrame(update);
					ticking = true;
				}
			};
			
			this.$scrollElement.bind('scroll.' + this.name, requestTick);
			requestTick();
		},
		_startAnimationLoop: function() {
			var self = this;

			this._animationLoop = function() {
				requestAnimFrame(self._animationLoop);
				self._repositionElements();
			};
			this._animationLoop();
		}
	};

	$.fn[pluginName] = function (options) {
		var args = arguments;
		if (options === undefined || typeof options === 'object') {
			return this.each(function () {
				if (!$.data(this, 'plugin_' + pluginName)) {
					$.data(this, 'plugin_' + pluginName, new Plugin(this, options));
				}
			});
		} else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
			return this.each(function () {
				var instance = $.data(this, 'plugin_' + pluginName);
				if (instance instanceof Plugin && typeof instance[options] === 'function') {
					instance[options].apply(instance, Array.prototype.slice.call(args, 1));
				}
				if (options === 'destroy') {
					$.data(this, 'plugin_' + pluginName, null);
				}
			});
		}
	};

	$[pluginName] = function(options) {
		var $window = $(window);
		return $window.stellar.apply($window, Array.prototype.slice.call(arguments, 0));
	};

	// Expose the scroll and position property function hashes so they can be extended
	$[pluginName].scrollProperty = scrollProperty;
	$[pluginName].positionProperty = positionProperty;

	// Expose the plugin class so it can be modified
	window.Stellar = Plugin;
}(jQuery, this, document));
var Karnan;

/*Karnan = Karnan || {};
Karnan.AsyncContentLoader = Karnan.AsyncContentLoader || {};

Karnan.AsyncContentLoader.AsyncContentLoader = (function ($) {

    var AsyncContentEndpoint = 'wp/v2/all?slug=';

    var AsyncContentTempalte = '<div id="ajax-response" class="ajax-response"><div class="container"><div class="grid"><div class="grid-xs-12"><a class="close" href="#close"><i class="pricon pricon-close"></i></a><article class="frame"><h2>{{title}}</h2>{{content}}{{sidebar}}</article></div></div></div></div>';

    var AsyncContentTrigger = [
        '.navbar li a'
    ];

    var AsyncContentReplaceVars = [
        'title',
        'content',
        'sidebar'
    ];

    function AsyncContentLoader() {
        this.triggerAjaxOpenHash();
        this.watchAjaxClose();
        jQuery.each(AsyncContentTrigger,function(index,targetObject) {
            console.log("test link");
            jQuery(targetObject).click(function(event) {
                if(this.isLocalLink(jQuery(event.target).closest('a').attr('href'))) {
                    event.preventDefault();
                    this.loadContent(jQuery(event.target).closest('a'));
                    this.updateHash('#' + this.createIdFromHref(jQuery(event.target).closest('a').attr('href')));
                }
            }.bind(this));
        }.bind(this));
    };

    AsyncContentLoader.prototype.loadContent = function (clickedObject) {
        var $section = jQuery('#dynamic-content-wrapper');

        jQuery('#ajax-response article.frame').html('<span class="spinner spinner-dark spinner-lg" style="font-size:3em;"></span>');

        jQuery("a").removeClass('ajax-is-active');

        this.startSpinner(clickedObject);

        jQuery.get(this.createEndpointSlug(jQuery(clickedObject).attr('href')), function(dataResponse){

            //Clear area
            jQuery('.ajax-response').remove();

            //New content
            $section.append(
                this.responseTemplate(AsyncContentTempalte, dataResponse)
            );

            $section.find('article.frame').addClass('is-loaded');

            //Content loaded
            this.stopSpinner(clickedObject);

        }.bind(this));
    };

    AsyncContentLoader.prototype.createEndpointSlug = function (url) {
        return rest_url + AsyncContentEndpoint + this.parsePostName(url);
    };

    AsyncContentLoader.prototype.responseTemplate = function (contentTemplate, dataResponse) {
        AsyncContentReplaceVars.forEach(function(item) {
            contentTemplate = contentTemplate.replace("{{" + item + "}}", dataResponse[item]);
        }.bind(this));
        return contentTemplate;
    };

    AsyncContentLoader.prototype.displayTarget = function(markup, target) {
        if(jQuery(target).length) {
            jQuery(target).html(markup);
        } else {
            alert("Error: Target is missing.");
        }
    };

    AsyncContentLoader.prototype.parsePostName = function(url) {
        return url.replace(location.protocol + "//" + window.location.hostname, "");
    };

    AsyncContentLoader.prototype.isLocalLink = function(url) {
        if(url.indexOf(window.location.hostname) !== -1) {
            return true;
        }
        return false;
    };



    AsyncContentLoader.prototype.startSpinner = function(targetItem) {
        targetItem.addClass("ajax-do-spin ajax-is-active");
        targetItem.find('.box-image-container').append('<span class="pos-absolute-center spinner-container" style="width: 50px;height: 50px;"><span class="spinner" style="border: 10px solid #fff;width: 50px;height: 50px;border-left-color:transparent;"></span></span>');
    };

    AsyncContentLoader.prototype.stopSpinner = function(targetItem) {
        targetItem.removeClass("ajax-do-spin");
        targetItem.find('.spinner-container').remove();
    };



    AsyncContentLoader.prototype.createIdFromHref = function(url) {
        return this.parsePostName(url).replace(new RegExp("/", 'g'),"-").replace('-blog-',"").replace(/\-$/, '').replace(/^\-/, '');
    };



    AsyncContentLoader.prototype.watchAjaxClose = function() {
        jQuery("section").on('click', '.ajax-response .close',function(event){
            event.preventDefault();
            jQuery('html, body').animate({scrollTop: Math.abs(jQuery(event.target).closest('a').parents('section').offset().top -jQuery("#site-header").outerHeight())}, 700, jQuery.bez([0.815, 0.020, 0.080, 1.215]));
            jQuery(".ajax-response").remove();
            jQuery("a").removeClass('ajax-is-active');
            this.updateHash("");
        }.bind(this));
    };

    AsyncContentLoader.prototype.triggerAjaxOpenHash = function() {
        jQuery(window).bind("load", function() {
            jQuery.each(AsyncContentTrigger,function(index,targetObject) {
                jQuery(targetObject).each(function(linkindex, link){
                    if(this.isLocalLink(jQuery(link).closest('a').attr('href'))) {
                        if("#" + this.createIdFromHref(jQuery(link).attr('href')) === window.location.hash) {
                            this.loadContent(jQuery(link).closest('a'));
                            return false;
                        }
                    }
                }.bind(this));
            }.bind(this));
        }.bind(this));
    };

    AsyncContentLoader.prototype.updateHash = function(hash) {
        if(history.pushState) {
            if(hash === "" ) {
                history.pushState(null, null, "#");
            } else {
                history.pushState(null, null, hash);
            }
        } else {
            window.location.hash = hash;
        }
    }

    new AsyncContentLoader();

})(jQuery); */

Karnan = Karnan || {};
Karnan.OnePage = Karnan.OnePage || {};

Karnan.OnePage.Navigation = (function ($) {

    function Navigation() {

        //Home page soft move
        if ($(".onepage-section").length) {
            this.hightlightDirectionArrows(0, $(".onepage-section").length);
            this.bindDirectionArrow('soft');
            this.bindElevator('soft');
        }

        //Virtual sections instant move
        if ($(".virtual-section").length) {
            this.hightlightDirectionArrows(0, $(".virtual-section").length);
            this.bindDirectionArrow('instant');
            this.bindElevator('instant');
        }

        // Use hooks in one page scroll (start)
        $(document).bind('scrollifyStart',function(event, segmentIndex, segments, scrollSpeed) {
            this.hightlightDirectionArrows(segmentIndex, segments.length);
            this.hightlightPagination(segmentIndex, segments);
        }.bind(this));

        //Add active class to last item
        if(!$(".scroll-evelator.active").length) {
            $(".scroll-evelator.is-last").addClass("active");
        }
    }

    Navigation.prototype.hightlightDirectionArrows = function (index, segments) {

        //This is the first item
        if(index == 0) {
            $('.scroll-action.scroll-up').fadeOut(700,function(){
                $(this).addClass('disabled').removeAttr('style');
            });
        } else {
            $('.scroll-action.scroll-up').removeClass('disabled');
        }

        //This is the last item
        if(segments == index + 1) {
            $('.scroll-action.scroll-down').fadeOut(700,function(){
                $(this).addClass('disabled').removeAttr('style');
            });
        } else {
            $('.scroll-action.scroll-down').removeClass('disabled');
        }

    }.bind(this);

    Navigation.prototype.hightlightPagination = function (index, segments) {
        $("#one-page-elevator li").removeClass("active");
        $("#one-page-elevator li:eq(" +index+ ")").addClass("active");
    };

    Navigation.prototype.bindElevator = function (type) {

        if(type == 'soft') {
            $("#one-page-elevator a").on("click",function(event) {
                event.preventDefault();
                if(!$("body").hasClass("lock-scroll")) {
                    $.scrollify.move($(this).attr("href"));
                }
            });
        }

        if(type == 'instant') {
            $("#one-page-elevator a").on("click",function(event) {
                event.preventDefault();
                if(!$("body").hasClass("lock-scroll")) {
                    $.scrollify.instantMove($(this).attr("href"));
                }
            });
        }

    };

    Navigation.prototype.bindDirectionArrow = function (type) {

        if(type == 'soft') {
            $(".scroll-action.scroll-down").on("click",function(event) {
                event.preventDefault();
                $.scrollify.next();
            });
            $(".scroll-action.scroll-up").on("click",function(event) {
                event.preventDefault();
                $.scrollify.previous();
            });
        }

        if(type == 'instant') {
            $(".scroll-action.scroll-down").on("click",function(event) {
                event.preventDefault();
                $.scrollify.instantNext();
            });
            $(".scroll-action.scroll-up").on("click",function(event) {
                event.preventDefault();
                $.scrollify.instantPrevious();
            });
        }

    };

    new Navigation();

})(jQuery);

Karnan = Karnan || {};
Karnan.OnePage = Karnan.OnePage || {};

Karnan.OnePage.Parallax = (function ($) {

    function Parallax() {
        if($(".parallax-enabled").length) {
            this.Init();
        }
    }

    Parallax.prototype.Init = function (index, segments) {
        $("body").stellar({
            horizontalScrolling: false,
        });
    }.bind(this);

    new Parallax();

})(jQuery);

Karnan = Karnan || {};
Karnan.OnePage = Karnan.OnePage || {};

Karnan.OnePage.ScrollSnapping = (function ($) {

    function ScrollSnapping() {
        //Home page soft move
        if ($(".onepage-section").length) {
            this.StartSections();
        }

        //Virtual sections instant move
        if ($(".virtual-section").length) {
            this.VirtualSections();
        }
    }

    ScrollSnapping.prototype.StartSections = function () {

        var scrollSpeed = 800;

        $.scrollify({
            section : ".onepage-section",
            sectionName : "section-name",
            scrollSpeed: scrollSpeed,
            easing: "easeOutExpo",
            before: function(index, sections) {
                $(document).trigger('scrollifyStart', [index, sections, scrollSpeed, 'onepage']);
            }.bind(this),
            after: function(index, sections) {
                $(document).trigger('scrollifyStop', [index, sections, scrollSpeed, 'onepage']);
            }.bind(this)
        });

    }

    ScrollSnapping.prototype.VirtualSections = function () {

        var scrollSpeed = 550;

        $.scrollify({
            section : ".virtual-section",
            sectionName : "section-name",
            scrollSpeed: scrollSpeed,
            before: function(index, sections) {
                $(".container", "section").not(":eq(" + index + ")").fadeOut(100);
                $(".container", "section:eq(" + index + ")").fadeIn(800);
                $(document).trigger('scrollifyStart', [index, sections, scrollSpeed, 'virtual']);
            }.bind(this),
            after: function(index, sections) {
                $(document).trigger('scrollifyStop', [index, sections, scrollSpeed, 'virtual']);
            }.bind(this)
        });

    }.bind(this);

    new ScrollSnapping();

})(jQuery);
