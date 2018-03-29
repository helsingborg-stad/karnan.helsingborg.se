/*!
 * jQuery Scrollify
 * Version 1.0.19
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
    portHeight,
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
  function getportHeight() {
    return ($window.height() + settings.offset);
  }
  function animateScroll(index,instant,callbacks,toTop) {
    if(currentIndex===index) {
      callbacks = false;
    }
    if(disabled===true) {
      return true;
    }
    if(names[index]) {
      scrollable = false;
      if(firstLoad===true) {
        settings.afterRender();
        firstLoad = false;
      }
      if(callbacks) {
        if( typeof settings.before == 'function' && settings.before(index,elements) === false ){
          return true;
        }
      }
      interstitialIndex = 1;
      destination = heights[index];
      if(firstLoad===false && currentIndex>index && toTop===false) {
        //We're going backwards
        if(overflow[index]) {
          portHeight = getportHeight();

          interstitialIndex = parseInt(elements[index].outerHeight()/portHeight);

          destination = parseInt(heights[index])+(elements[index].outerHeight()-portHeight);
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
            portHeight = getportHeight();
            if(Math.floor(elements[index].height()/portHeight)>interstitialIndex) {

              interstitialScroll(parseInt(heights[index])+(portHeight*interstitialIndex));
              interstitialIndex += 1;

            } else {
              interstitialScroll(parseInt(heights[index])+(elements[index].outerHeight()-portHeight));
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
              portHeight = getportHeight();

              interstitialIndex -= 1;
              interstitialScroll(parseInt(heights[index])+(portHeight*interstitialIndex));

            } else {

              interstitialIndex = 1;
              interstitialScroll(parseInt(heights[index]));
            }
          }

        }
      },
      init: function() {
        if (document.addEventListener && settings.touchScroll) {
          var eventListenerOptions = {
            passive: false
          };
          document.addEventListener('touchstart', swipeScroll.touchHandler, eventListenerOptions);
          document.addEventListener('touchmove', swipeScroll.touchHandler, eventListenerOptions);
          document.addEventListener('touchend', swipeScroll.touchHandler, eventListenerOptions);
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
      portHeight = getportHeight();
      $(selector).each(function(i) {
        var $this = $(this);

        if(settings.setHeights) {
          if($this.is(settings.interstitialSection)) {
            overflow[i] = false;
          } else {
            if(($this.css("height","auto").outerHeight()<portHeight) || $this.css("overflow")==="hidden") {
              $this.css({"height":portHeight});

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

          if(($this.outerHeight()<portHeight) || (settings.overflowScroll===false)) {
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
                heights[i] = heights[i-1] + (parseInt($($(selector)[i-1]).outerHeight()) - parseInt($(window).height())) + parseInt($this.outerHeight());
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
      portHeight = getportHeight();

      if(top<parseInt(heights[index])+(elements[index].outerHeight()-portHeight)-28) {

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
var disableBodyScroll = (function () {

    /**
     * Private variables
     */
    var _selector = false,
        _element = false,
        _clientY;

    /**
     * Polyfills for Element.matches and Element.closest
     */
    if (!Element.prototype.matches)
        Element.prototype.matches = Element.prototype.msMatchesSelector ||
        Element.prototype.webkitMatchesSelector;

    if (!Element.prototype.closest)
        Element.prototype.closest = function (s) {
            var ancestor = this;
            if (!document.documentElement.contains(el)) return null;
            do {
                if (ancestor.matches(s)) return ancestor;
                ancestor = ancestor.parentElement;
            } while (ancestor !== null);
            return el;
        };

    /**
     * Prevent default unless within _selector
     *
     * @param  event object event
     * @return void
     */
    var preventBodyScroll = function (event) {
        if (false === _element || !event.target.closest(_selector)) {
            event.preventDefault();
        }
    };

    /**
     * Cache the clientY co-ordinates for
     * comparison
     *
     * @param  event object event
     * @return void
     */
    var captureClientY = function (event) {
        // only respond to a single touch
        if (event.targetTouches.length === 1) {
            _clientY = event.targetTouches[0].clientY;
        }
    };

    /**
     * Detect whether the element is at the top
     * or the bottom of their scroll and prevent
     * the user from scrolling beyond
     *
     * @param  event object event
     * @return void
     */
    var preventOverscroll = function (event) {
        // only respond to a single touch
        if (event.targetTouches.length !== 1) {
            return;
        }

        var clientY = event.targetTouches[0].clientY - _clientY;

        // The element at the top of its scroll,
        // and the user scrolls down
        if (_element.scrollTop === 0 && clientY > 0) {
            event.preventDefault();
        }

        // The element at the bottom of its scroll,
        // and the user scrolls up
        // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#Problems_and_solutions
        if ((_element.scrollHeight - _element.scrollTop <= _element.clientHeight) && clientY < 0) {
            event.preventDefault();
        }

    };

    /**
     * Disable body scroll. Scrolling with the selector is
     * allowed if a selector is porvided.
     *
     * @param  boolean allow
     * @param  string selector Selector to element to change scroll permission
     * @return void
     */
    return function (allow, selector) {
        if (typeof selector !== "undefined") {
            _selector = selector;
            _element = document.querySelector(selector);
        }

        if (true === allow) {
            if (false !== _element) {
                _element.addEventListener('touchstart', captureClientY, false);
                _element.addEventListener('touchmove', preventOverscroll, false);
            }
            document.body.addEventListener("touchmove", preventBodyScroll, false);
        } else {
            if (false !== _element) {
                _element.removeEventListener('touchstart', captureClientY, false);
                _element.removeEventListener('touchmove', preventOverscroll, false);
            }
            document.body.removeEventListener("touchmove", preventBodyScroll, false);
        }
    };
}());

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpxdWVyeS5zY3JvbGxpZnkuanMiLCJqcXVlcnkuc3RlbGxhci5qcyIsImRpc2FibGVCb2R5U2Nyb2xsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMzBCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNucEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJ2ZW5kb3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiFcclxuICogalF1ZXJ5IFNjcm9sbGlmeVxyXG4gKiBWZXJzaW9uIDEuMC4xOVxyXG4gKlxyXG4gKiBSZXF1aXJlczpcclxuICogLSBqUXVlcnkgMS43IG9yIGhpZ2hlclxyXG4gKlxyXG4gKiBodHRwczovL2dpdGh1Yi5jb20vbHVrZWhhYXMvU2Nyb2xsaWZ5XHJcbiAqXHJcbiAqIENvcHlyaWdodCAyMDE2LCBMdWtlIEhhYXNcclxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weSBvZlxyXG4gKiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluXHJcbiAqIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG9cclxuICogdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2ZcclxuICogdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLFxyXG4gKiBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuICpcclxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXHJcbiAqIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcbiAqXHJcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcclxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1NcclxuICogRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SXHJcbiAqIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUlxyXG4gKiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTlxyXG4gKiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxyXG5cclxuXHJcblxyXG5pZiB0b3VjaFNjcm9sbCBpcyBmYWxzZSAtIHVwZGF0ZSBpbmRleFxyXG5cclxuICovXHJcbihmdW5jdGlvbiAoZ2xvYmFsLGZhY3RvcnkpIHtcclxuICBcInVzZSBzdHJpY3RcIjtcclxuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XHJcbiAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXHJcbiAgICBkZWZpbmUoWydqcXVlcnknXSwgZnVuY3Rpb24oJCkge1xyXG4gICAgICByZXR1cm4gZmFjdG9yeSgkLCBnbG9iYWwsIGdsb2JhbC5kb2N1bWVudCk7XHJcbiAgICB9KTtcclxuICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKSB7XHJcbiAgICAvLyBOb2RlL0NvbW1vbkpTXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkocmVxdWlyZSgnanF1ZXJ5JyksIGdsb2JhbCwgZ2xvYmFsLmRvY3VtZW50KTtcclxuICB9IGVsc2Uge1xyXG4gICAgLy8gQnJvd3NlciBnbG9iYWxzXHJcbiAgICBmYWN0b3J5KGpRdWVyeSwgZ2xvYmFsLCBnbG9iYWwuZG9jdW1lbnQpO1xyXG4gIH1cclxufSh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHRoaXMsIGZ1bmN0aW9uICgkLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcclxuICBcInVzZSBzdHJpY3RcIjtcclxuICB2YXIgaGVpZ2h0cyA9IFtdLFxyXG4gICAgbmFtZXMgPSBbXSxcclxuICAgIGVsZW1lbnRzID0gW10sXHJcbiAgICBvdmVyZmxvdyA9IFtdLFxyXG4gICAgaW5kZXggPSAwLFxyXG4gICAgY3VycmVudEluZGV4ID0gMCxcclxuICAgIGludGVyc3RpdGlhbEluZGV4ID0gMSxcclxuICAgIGhhc0xvY2F0aW9uID0gZmFsc2UsXHJcbiAgICB0aW1lb3V0SWQsXHJcbiAgICB0aW1lb3V0SWQyLFxyXG4gICAgJHdpbmRvdyA9ICQod2luZG93KSxcclxuICAgIHBvcnRIZWlnaHQsXHJcbiAgICB0b3AgPSAkd2luZG93LnNjcm9sbFRvcCgpLFxyXG4gICAgc2Nyb2xsYWJsZSA9IGZhbHNlLFxyXG4gICAgbG9ja2VkID0gZmFsc2UsXHJcbiAgICBzY3JvbGxlZCA9IGZhbHNlLFxyXG4gICAgbWFudWFsU2Nyb2xsLFxyXG4gICAgc3dpcGVTY3JvbGwsXHJcbiAgICB1dGlsLFxyXG4gICAgZGlzYWJsZWQgPSBmYWxzZSxcclxuICAgIHNjcm9sbFNhbXBsZXMgPSBbXSxcclxuICAgIHNjcm9sbFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSxcclxuICAgIGZpcnN0TG9hZCA9IHRydWUsXHJcbiAgICBpbml0aWFsaXNlZCA9IGZhbHNlLFxyXG4gICAgZGVzdGluYXRpb24gPSAwLFxyXG4gICAgd2hlZWxFdmVudCA9ICdvbndoZWVsJyBpbiBkb2N1bWVudCA/ICd3aGVlbCcgOiBkb2N1bWVudC5vbm1vdXNld2hlZWwgIT09IHVuZGVmaW5lZCA/ICdtb3VzZXdoZWVsJyA6ICdET01Nb3VzZVNjcm9sbCcsXHJcbiAgICBzZXR0aW5ncyA9IHtcclxuICAgICAgLy9zZWN0aW9uIHNob3VsZCBiZSBhbiBpZGVudGlmaWVyIHRoYXQgaXMgdGhlIHNhbWUgZm9yIGVhY2ggc2VjdGlvblxyXG4gICAgICBzZWN0aW9uOiBcIi5zZWN0aW9uXCIsXHJcbiAgICAgIHNlY3Rpb25OYW1lOiBcInNlY3Rpb24tbmFtZVwiLFxyXG4gICAgICBpbnRlcnN0aXRpYWxTZWN0aW9uOiBcIlwiLFxyXG4gICAgICBlYXNpbmc6IFwiZWFzZU91dEV4cG9cIixcclxuICAgICAgc2Nyb2xsU3BlZWQ6IDExMDAsXHJcbiAgICAgIG9mZnNldDogMCxcclxuICAgICAgc2Nyb2xsYmFyczogdHJ1ZSxcclxuICAgICAgdGFyZ2V0OlwiaHRtbCxib2R5XCIsXHJcbiAgICAgIHN0YW5kYXJkU2Nyb2xsRWxlbWVudHM6IGZhbHNlLFxyXG4gICAgICBzZXRIZWlnaHRzOiB0cnVlLFxyXG4gICAgICBvdmVyZmxvd1Njcm9sbDp0cnVlLFxyXG4gICAgICB1cGRhdGVIYXNoOiB0cnVlLFxyXG4gICAgICB0b3VjaFNjcm9sbDp0cnVlLFxyXG4gICAgICBiZWZvcmU6ZnVuY3Rpb24oKSB7fSxcclxuICAgICAgYWZ0ZXI6ZnVuY3Rpb24oKSB7fSxcclxuICAgICAgYWZ0ZXJSZXNpemU6ZnVuY3Rpb24oKSB7fSxcclxuICAgICAgYWZ0ZXJSZW5kZXI6ZnVuY3Rpb24oKSB7fVxyXG4gICAgfTtcclxuICBmdW5jdGlvbiBnZXRwb3J0SGVpZ2h0KCkge1xyXG4gICAgcmV0dXJuICgkd2luZG93LmhlaWdodCgpICsgc2V0dGluZ3Mub2Zmc2V0KTtcclxuICB9XHJcbiAgZnVuY3Rpb24gYW5pbWF0ZVNjcm9sbChpbmRleCxpbnN0YW50LGNhbGxiYWNrcyx0b1RvcCkge1xyXG4gICAgaWYoY3VycmVudEluZGV4PT09aW5kZXgpIHtcclxuICAgICAgY2FsbGJhY2tzID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBpZihkaXNhYmxlZD09PXRydWUpIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBpZihuYW1lc1tpbmRleF0pIHtcclxuICAgICAgc2Nyb2xsYWJsZSA9IGZhbHNlO1xyXG4gICAgICBpZihmaXJzdExvYWQ9PT10cnVlKSB7XHJcbiAgICAgICAgc2V0dGluZ3MuYWZ0ZXJSZW5kZXIoKTtcclxuICAgICAgICBmaXJzdExvYWQgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICBpZihjYWxsYmFja3MpIHtcclxuICAgICAgICBpZiggdHlwZW9mIHNldHRpbmdzLmJlZm9yZSA9PSAnZnVuY3Rpb24nICYmIHNldHRpbmdzLmJlZm9yZShpbmRleCxlbGVtZW50cykgPT09IGZhbHNlICl7XHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaW50ZXJzdGl0aWFsSW5kZXggPSAxO1xyXG4gICAgICBkZXN0aW5hdGlvbiA9IGhlaWdodHNbaW5kZXhdO1xyXG4gICAgICBpZihmaXJzdExvYWQ9PT1mYWxzZSAmJiBjdXJyZW50SW5kZXg+aW5kZXggJiYgdG9Ub3A9PT1mYWxzZSkge1xyXG4gICAgICAgIC8vV2UncmUgZ29pbmcgYmFja3dhcmRzXHJcbiAgICAgICAgaWYob3ZlcmZsb3dbaW5kZXhdKSB7XHJcbiAgICAgICAgICBwb3J0SGVpZ2h0ID0gZ2V0cG9ydEhlaWdodCgpO1xyXG5cclxuICAgICAgICAgIGludGVyc3RpdGlhbEluZGV4ID0gcGFyc2VJbnQoZWxlbWVudHNbaW5kZXhdLm91dGVySGVpZ2h0KCkvcG9ydEhlaWdodCk7XHJcblxyXG4gICAgICAgICAgZGVzdGluYXRpb24gPSBwYXJzZUludChoZWlnaHRzW2luZGV4XSkrKGVsZW1lbnRzW2luZGV4XS5vdXRlckhlaWdodCgpLXBvcnRIZWlnaHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuXHJcbiAgICAgIGlmKHNldHRpbmdzLnVwZGF0ZUhhc2ggJiYgc2V0dGluZ3Muc2VjdGlvbk5hbWUgJiYgIShmaXJzdExvYWQ9PT10cnVlICYmIGluZGV4PT09MCkpIHtcclxuICAgICAgICBpZihoaXN0b3J5LnB1c2hTdGF0ZSkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKG51bGwsIG51bGwsIG5hbWVzW2luZGV4XSk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICBpZih3aW5kb3cuY29uc29sZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiU2Nyb2xsaWZ5IHdhcm5pbmc6IFBhZ2UgbXVzdCBiZSBob3N0ZWQgdG8gbWFuaXB1bGF0ZSB0aGUgaGFzaCB2YWx1ZS5cIik7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9IG5hbWVzW2luZGV4XTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGN1cnJlbnRJbmRleCA9IGluZGV4O1xyXG4gICAgICBpZihpbnN0YW50KSB7XHJcbiAgICAgICAgJChzZXR0aW5ncy50YXJnZXQpLnN0b3AoKS5zY3JvbGxUb3AoZGVzdGluYXRpb24pO1xyXG4gICAgICAgIGlmKGNhbGxiYWNrcykge1xyXG4gICAgICAgICAgc2V0dGluZ3MuYWZ0ZXIoaW5kZXgsZWxlbWVudHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsb2NrZWQgPSB0cnVlO1xyXG4gICAgICAgIGlmKCAkKCkudmVsb2NpdHkgKSB7XHJcbiAgICAgICAgICAkKHNldHRpbmdzLnRhcmdldCkuc3RvcCgpLnZlbG9jaXR5KCdzY3JvbGwnLCB7XHJcbiAgICAgICAgICAgIGR1cmF0aW9uOiBzZXR0aW5ncy5zY3JvbGxTcGVlZCxcclxuICAgICAgICAgICAgZWFzaW5nOiBzZXR0aW5ncy5lYXNpbmcsXHJcbiAgICAgICAgICAgIG9mZnNldDogZGVzdGluYXRpb24sXHJcbiAgICAgICAgICAgIG1vYmlsZUhBOiBmYWxzZVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICQoc2V0dGluZ3MudGFyZ2V0KS5zdG9wKCkuYW5pbWF0ZSh7XHJcbiAgICAgICAgICAgIHNjcm9sbFRvcDogZGVzdGluYXRpb25cclxuICAgICAgICAgIH0sIHNldHRpbmdzLnNjcm9sbFNwZWVkLHNldHRpbmdzLmVhc2luZyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZih3aW5kb3cubG9jYXRpb24uaGFzaC5sZW5ndGggJiYgc2V0dGluZ3Muc2VjdGlvbk5hbWUgJiYgd2luZG93LmNvbnNvbGUpIHtcclxuICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmKCQod2luZG93LmxvY2F0aW9uLmhhc2gpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIlNjcm9sbGlmeSB3YXJuaW5nOiBJRCBtYXRjaGVzIGhhc2ggdmFsdWUgLSB0aGlzIHdpbGwgY2F1c2UgdGhlIHBhZ2UgdG8gYW5jaG9yLlwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBjYXRjaCAoZSkge31cclxuICAgICAgICB9XHJcbiAgICAgICAgJChzZXR0aW5ncy50YXJnZXQpLnByb21pc2UoKS5kb25lKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICBsb2NrZWQgPSBmYWxzZTtcclxuICAgICAgICAgIGZpcnN0TG9hZCA9IGZhbHNlO1xyXG4gICAgICAgICAgaWYoY2FsbGJhY2tzKSB7XHJcbiAgICAgICAgICAgIHNldHRpbmdzLmFmdGVyKGluZGV4LGVsZW1lbnRzKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGlzQWNjZWxlcmF0aW5nKHNhbXBsZXMpIHtcclxuICAgIGZ1bmN0aW9uIGF2ZXJhZ2UobnVtKSB7XHJcbiAgICAgIHZhciBzdW0gPSAwO1xyXG5cclxuICAgICAgdmFyIGxhc3RFbGVtZW50cyA9IHNhbXBsZXMuc2xpY2UoTWF0aC5tYXgoc2FtcGxlcy5sZW5ndGggLSBudW0sIDEpKTtcclxuXHJcbiAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBsYXN0RWxlbWVudHMubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgICAgc3VtICs9IGxhc3RFbGVtZW50c1tpXTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIE1hdGguY2VpbChzdW0vbnVtKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgYXZFbmQgPSBhdmVyYWdlKDEwKTtcclxuICAgIHZhciBhdk1pZGRsZSA9IGF2ZXJhZ2UoNzApO1xyXG5cclxuICAgIGlmKGF2RW5kID49IGF2TWlkZGxlKSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuICB2YXIgc2Nyb2xsaWZ5ID0gZnVuY3Rpb24ob3B0aW9ucykge1xyXG4gICAgaW5pdGlhbGlzZWQgPSB0cnVlO1xyXG4gICAgJC5lYXNpbmdbJ2Vhc2VPdXRFeHBvJ10gPSBmdW5jdGlvbih4LCB0LCBiLCBjLCBkKSB7XHJcbiAgICAgIHJldHVybiAodD09ZCkgPyBiK2MgOiBjICogKC1NYXRoLnBvdygyLCAtMTAgKiB0L2QpICsgMSkgKyBiO1xyXG4gICAgfTtcclxuXHJcbiAgICBtYW51YWxTY3JvbGwgPSB7XHJcbiAgICAgIGhhbmRsZU1vdXNlZG93bjpmdW5jdGlvbigpIHtcclxuICAgICAgICBpZihkaXNhYmxlZD09PXRydWUpIHtcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzY3JvbGxhYmxlID0gZmFsc2U7XHJcbiAgICAgICAgc2Nyb2xsZWQgPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgICAgaGFuZGxlTW91c2V1cDpmdW5jdGlvbigpIHtcclxuICAgICAgICBpZihkaXNhYmxlZD09PXRydWUpIHtcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzY3JvbGxhYmxlID0gdHJ1ZTtcclxuICAgICAgICBpZihzY3JvbGxlZCkge1xyXG4gICAgICAgICAgLy9pbnN0YW50LGNhbGxiYWNrc1xyXG4gICAgICAgICAgbWFudWFsU2Nyb2xsLmNhbGN1bGF0ZU5lYXJlc3QoZmFsc2UsdHJ1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBoYW5kbGVTY3JvbGw6ZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYoZGlzYWJsZWQ9PT10cnVlKSB7XHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodGltZW91dElkKXtcclxuICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGltZW91dElkID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgc2Nyb2xsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgaWYoc2Nyb2xsYWJsZT09PWZhbHNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHNjcm9sbGFibGUgPSBmYWxzZTtcclxuICAgICAgICAgIC8vaW5zdGFudCxjYWxsYmFja3NcclxuICAgICAgICAgIG1hbnVhbFNjcm9sbC5jYWxjdWxhdGVOZWFyZXN0KGZhbHNlLHRydWUpO1xyXG4gICAgICAgIH0sIDIwMCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIGNhbGN1bGF0ZU5lYXJlc3Q6ZnVuY3Rpb24oaW5zdGFudCxjYWxsYmFja3MpIHtcclxuICAgICAgICB0b3AgPSAkd2luZG93LnNjcm9sbFRvcCgpO1xyXG4gICAgICAgIHZhciBpID0xLFxyXG4gICAgICAgICAgbWF4ID0gaGVpZ2h0cy5sZW5ndGgsXHJcbiAgICAgICAgICBjbG9zZXN0ID0gMCxcclxuICAgICAgICAgIHByZXYgPSBNYXRoLmFicyhoZWlnaHRzWzBdIC0gdG9wKSxcclxuICAgICAgICAgIGRpZmY7XHJcbiAgICAgICAgZm9yKDtpPG1heDtpKyspIHtcclxuICAgICAgICAgIGRpZmYgPSBNYXRoLmFicyhoZWlnaHRzW2ldIC0gdG9wKTtcclxuXHJcbiAgICAgICAgICBpZihkaWZmIDwgcHJldikge1xyXG4gICAgICAgICAgICBwcmV2ID0gZGlmZjtcclxuICAgICAgICAgICAgY2xvc2VzdCA9IGk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKChhdEJvdHRvbSgpICYmIGNsb3Nlc3Q+aW5kZXgpIHx8IGF0VG9wKCkpIHtcclxuICAgICAgICAgIGluZGV4ID0gY2xvc2VzdDtcclxuICAgICAgICAgIC8vaW5kZXgsIGluc3RhbnQsIGNhbGxiYWNrcywgdG9Ub3BcclxuICAgICAgICAgIGFuaW1hdGVTY3JvbGwoY2xvc2VzdCxpbnN0YW50LGNhbGxiYWNrcyxmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB3aGVlbEhhbmRsZXI6ZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIGlmKGRpc2FibGVkPT09dHJ1ZSkge1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSBlbHNlIGlmKHNldHRpbmdzLnN0YW5kYXJkU2Nyb2xsRWxlbWVudHMpIHtcclxuICAgICAgICAgIGlmKCQoZS50YXJnZXQpLmlzKHNldHRpbmdzLnN0YW5kYXJkU2Nyb2xsRWxlbWVudHMpIHx8ICQoZS50YXJnZXQpLmNsb3Nlc3Qoc2V0dGluZ3Muc3RhbmRhcmRTY3JvbGxFbGVtZW50cykubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZighb3ZlcmZsb3dbaW5kZXhdKSB7XHJcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBjdXJyZW50U2Nyb2xsVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG5cclxuXHJcbiAgICAgICAgZSA9IGUgfHwgd2luZG93LmV2ZW50O1xyXG4gICAgICAgIHZhciB2YWx1ZSA9IGUub3JpZ2luYWxFdmVudC53aGVlbERlbHRhIHx8IC1lLm9yaWdpbmFsRXZlbnQuZGVsdGFZIHx8IC1lLm9yaWdpbmFsRXZlbnQuZGV0YWlsO1xyXG4gICAgICAgIHZhciBkZWx0YSA9IE1hdGgubWF4KC0xLCBNYXRoLm1pbigxLCB2YWx1ZSkpO1xyXG5cclxuICAgICAgICAvL2RlbHRhID0gZGVsdGEgfHwgLWUub3JpZ2luYWxFdmVudC5kZXRhaWwgLyAzIHx8IGUub3JpZ2luYWxFdmVudC53aGVlbERlbHRhIC8gMTIwO1xyXG5cclxuICAgICAgICBpZihzY3JvbGxTYW1wbGVzLmxlbmd0aCA+IDE0OSl7XHJcbiAgICAgICAgICBzY3JvbGxTYW1wbGVzLnNoaWZ0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vc2Nyb2xsU2FtcGxlcy5wdXNoKE1hdGguYWJzKGRlbHRhKjEwKSk7XHJcbiAgICAgICAgc2Nyb2xsU2FtcGxlcy5wdXNoKE1hdGguYWJzKHZhbHVlKSk7XHJcblxyXG4gICAgICAgIGlmKChjdXJyZW50U2Nyb2xsVGltZS1zY3JvbGxUaW1lKSA+IDIwMCl7XHJcbiAgICAgICAgICBzY3JvbGxTYW1wbGVzID0gW107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNjcm9sbFRpbWUgPSBjdXJyZW50U2Nyb2xsVGltZTtcclxuXHJcblxyXG4gICAgICAgIGlmKGxvY2tlZCkge1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZihkZWx0YTwwKSB7XHJcbiAgICAgICAgICBpZihpbmRleDxoZWlnaHRzLmxlbmd0aC0xKSB7XHJcbiAgICAgICAgICAgIGlmKGF0Qm90dG9tKCkpIHtcclxuICAgICAgICAgICAgICBpZihpc0FjY2VsZXJhdGluZyhzY3JvbGxTYW1wbGVzKSkge1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgaW5kZXgrKztcclxuICAgICAgICAgICAgICAgIGxvY2tlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAvL2luZGV4LCBpbnN0YW50LCBjYWxsYmFja3MsIHRvVG9wXHJcbiAgICAgICAgICAgICAgICBhbmltYXRlU2Nyb2xsKGluZGV4LGZhbHNlLHRydWUsIGZhbHNlKTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZihkZWx0YT4wKSB7XHJcbiAgICAgICAgICBpZihpbmRleD4wKSB7XHJcbiAgICAgICAgICAgIGlmKGF0VG9wKCkpIHtcclxuICAgICAgICAgICAgICBpZihpc0FjY2VsZXJhdGluZyhzY3JvbGxTYW1wbGVzKSkge1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgaW5kZXgtLTtcclxuICAgICAgICAgICAgICAgIGxvY2tlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAvL2luZGV4LCBpbnN0YW50LCBjYWxsYmFja3MsIHRvVG9wXHJcbiAgICAgICAgICAgICAgICBhbmltYXRlU2Nyb2xsKGluZGV4LGZhbHNlLHRydWUsIGZhbHNlKTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfSxcclxuICAgICAga2V5SGFuZGxlcjpmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgaWYoZGlzYWJsZWQ9PT10cnVlIHx8IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQucmVhZE9ubHk9PT1mYWxzZSkge1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKGxvY2tlZD09PXRydWUpIHtcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoZS5rZXlDb2RlPT0zOCB8fCBlLmtleUNvZGU9PTMzKSB7XHJcbiAgICAgICAgICBpZihpbmRleD4wKSB7XHJcbiAgICAgICAgICAgIGlmKGF0VG9wKCkpIHtcclxuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgaW5kZXgtLTtcclxuICAgICAgICAgICAgICAvL2luZGV4LCBpbnN0YW50LCBjYWxsYmFja3MsIHRvVG9wXHJcbiAgICAgICAgICAgICAgYW5pbWF0ZVNjcm9sbChpbmRleCxmYWxzZSx0cnVlLGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZihlLmtleUNvZGU9PTQwIHx8IGUua2V5Q29kZT09MzQpIHtcclxuICAgICAgICAgIGlmKGluZGV4PGhlaWdodHMubGVuZ3RoLTEpIHtcclxuICAgICAgICAgICAgaWYoYXRCb3R0b20oKSkge1xyXG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgICAgICAgIC8vaW5kZXgsIGluc3RhbnQsIGNhbGxiYWNrcywgdG9Ub3BcclxuICAgICAgICAgICAgICBhbmltYXRlU2Nyb2xsKGluZGV4LGZhbHNlLHRydWUsZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBpbml0OmZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmKHNldHRpbmdzLnNjcm9sbGJhcnMpIHtcclxuICAgICAgICAgICR3aW5kb3cub24oJ21vdXNlZG93bicsIG1hbnVhbFNjcm9sbC5oYW5kbGVNb3VzZWRvd24pO1xyXG4gICAgICAgICAgJHdpbmRvdy5vbignbW91c2V1cCcsIG1hbnVhbFNjcm9sbC5oYW5kbGVNb3VzZXVwKTtcclxuICAgICAgICAgICR3aW5kb3cub24oJ3Njcm9sbCcsIG1hbnVhbFNjcm9sbC5oYW5kbGVTY3JvbGwpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAkKFwiYm9keVwiKS5jc3Moe1wib3ZlcmZsb3dcIjpcImhpZGRlblwifSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICR3aW5kb3cub24od2hlZWxFdmVudCxtYW51YWxTY3JvbGwud2hlZWxIYW5kbGVyKTtcclxuICAgICAgICAvLyQoZG9jdW1lbnQpLmJpbmQod2hlZWxFdmVudCxtYW51YWxTY3JvbGwud2hlZWxIYW5kbGVyKTtcclxuICAgICAgICAkd2luZG93Lm9uKCdrZXlkb3duJywgbWFudWFsU2Nyb2xsLmtleUhhbmRsZXIpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHN3aXBlU2Nyb2xsID0ge1xyXG4gICAgICB0b3VjaGVzIDoge1xyXG4gICAgICAgIFwidG91Y2hzdGFydFwiOiB7XCJ5XCI6LTEsXCJ4XCI6LTF9LFxyXG4gICAgICAgIFwidG91Y2htb3ZlXCIgOiB7XCJ5XCI6LTEsXCJ4XCI6LTF9LFxyXG4gICAgICAgIFwidG91Y2hlbmRcIiAgOiBmYWxzZSxcclxuICAgICAgICBcImRpcmVjdGlvblwiIDogXCJ1bmRldGVybWluZWRcIlxyXG4gICAgICB9LFxyXG4gICAgICBvcHRpb25zOntcclxuICAgICAgICBcImRpc3RhbmNlXCIgOiAzMCxcclxuICAgICAgICBcInRpbWVHYXBcIiA6IDgwMCxcclxuICAgICAgICBcInRpbWVTdGFtcFwiIDogbmV3IERhdGUoKS5nZXRUaW1lKClcclxuICAgICAgfSxcclxuICAgICAgdG91Y2hIYW5kbGVyOiBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIGlmKGRpc2FibGVkPT09dHJ1ZSkge1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSBlbHNlIGlmKHNldHRpbmdzLnN0YW5kYXJkU2Nyb2xsRWxlbWVudHMpIHtcclxuICAgICAgICAgIGlmKCQoZXZlbnQudGFyZ2V0KS5pcyhzZXR0aW5ncy5zdGFuZGFyZFNjcm9sbEVsZW1lbnRzKSB8fCAkKGV2ZW50LnRhcmdldCkuY2xvc2VzdChzZXR0aW5ncy5zdGFuZGFyZFNjcm9sbEVsZW1lbnRzKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciB0b3VjaDtcclxuICAgICAgICBpZiAodHlwZW9mIGV2ZW50ICE9PSAndW5kZWZpbmVkJyl7XHJcbiAgICAgICAgICBpZiAodHlwZW9mIGV2ZW50LnRvdWNoZXMgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIHRvdWNoID0gZXZlbnQudG91Y2hlc1swXTtcclxuICAgICAgICAgICAgc3dpdGNoIChldmVudC50eXBlKSB7XHJcbiAgICAgICAgICAgICAgY2FzZSAndG91Y2hzdGFydCc6XHJcbiAgICAgICAgICAgICAgICBzd2lwZVNjcm9sbC50b3VjaGVzLnRvdWNoc3RhcnQueSA9IHRvdWNoLnBhZ2VZO1xyXG4gICAgICAgICAgICAgICAgc3dpcGVTY3JvbGwudG91Y2hlcy50b3VjaG1vdmUueSA9IC0xO1xyXG5cclxuICAgICAgICAgICAgICAgIHN3aXBlU2Nyb2xsLnRvdWNoZXMudG91Y2hzdGFydC54ID0gdG91Y2gucGFnZVg7XHJcbiAgICAgICAgICAgICAgICBzd2lwZVNjcm9sbC50b3VjaGVzLnRvdWNobW92ZS54ID0gLTE7XHJcblxyXG4gICAgICAgICAgICAgICAgc3dpcGVTY3JvbGwub3B0aW9ucy50aW1lU3RhbXAgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgICAgICAgICAgICAgIHN3aXBlU2Nyb2xsLnRvdWNoZXMudG91Y2hlbmQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICBjYXNlICd0b3VjaG1vdmUnOlxyXG4gICAgICAgICAgICAgICAgc3dpcGVTY3JvbGwudG91Y2hlcy50b3VjaG1vdmUueSA9IHRvdWNoLnBhZ2VZO1xyXG4gICAgICAgICAgICAgICAgc3dpcGVTY3JvbGwudG91Y2hlcy50b3VjaG1vdmUueCA9IHRvdWNoLnBhZ2VYO1xyXG4gICAgICAgICAgICAgICAgaWYoc3dpcGVTY3JvbGwudG91Y2hlcy50b3VjaHN0YXJ0LnkhPT1zd2lwZVNjcm9sbC50b3VjaGVzLnRvdWNobW92ZS55ICYmIChNYXRoLmFicyhzd2lwZVNjcm9sbC50b3VjaGVzLnRvdWNoc3RhcnQueS1zd2lwZVNjcm9sbC50b3VjaGVzLnRvdWNobW92ZS55KT5NYXRoLmFicyhzd2lwZVNjcm9sbC50b3VjaGVzLnRvdWNoc3RhcnQueC1zd2lwZVNjcm9sbC50b3VjaGVzLnRvdWNobW92ZS54KSkpIHtcclxuICAgICAgICAgICAgICAgICAgLy9pZighb3ZlcmZsb3dbaW5kZXhdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgLy99XHJcbiAgICAgICAgICAgICAgICAgIHN3aXBlU2Nyb2xsLnRvdWNoZXMuZGlyZWN0aW9uID0gXCJ5XCI7XHJcbiAgICAgICAgICAgICAgICAgIGlmKChzd2lwZVNjcm9sbC5vcHRpb25zLnRpbWVTdGFtcCtzd2lwZVNjcm9sbC5vcHRpb25zLnRpbWVHYXApPChuZXcgRGF0ZSgpLmdldFRpbWUoKSkgJiYgc3dpcGVTY3JvbGwudG91Y2hlcy50b3VjaGVuZCA9PSBmYWxzZSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBzd2lwZVNjcm9sbC50b3VjaGVzLnRvdWNoZW5kID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3dpcGVTY3JvbGwudG91Y2hlcy50b3VjaHN0YXJ0LnkgPiAtMSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgIGlmKE1hdGguYWJzKHN3aXBlU2Nyb2xsLnRvdWNoZXMudG91Y2htb3ZlLnktc3dpcGVTY3JvbGwudG91Y2hlcy50b3VjaHN0YXJ0LnkpPnN3aXBlU2Nyb2xsLm9wdGlvbnMuZGlzdGFuY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoc3dpcGVTY3JvbGwudG91Y2hlcy50b3VjaHN0YXJ0LnkgPCBzd2lwZVNjcm9sbC50b3VjaGVzLnRvdWNobW92ZS55KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHN3aXBlU2Nyb2xsLnVwKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHN3aXBlU2Nyb2xsLmRvd24oKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgIGNhc2UgJ3RvdWNoZW5kJzpcclxuICAgICAgICAgICAgICAgIGlmKHN3aXBlU2Nyb2xsLnRvdWNoZXNbZXZlbnQudHlwZV09PT1mYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICBzd2lwZVNjcm9sbC50b3VjaGVzW2V2ZW50LnR5cGVdID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgaWYgKHN3aXBlU2Nyb2xsLnRvdWNoZXMudG91Y2hzdGFydC55ID4gLTEgJiYgc3dpcGVTY3JvbGwudG91Y2hlcy50b3VjaG1vdmUueSA+IC0xICYmIHN3aXBlU2Nyb2xsLnRvdWNoZXMuZGlyZWN0aW9uPT09XCJ5XCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYoTWF0aC5hYnMoc3dpcGVTY3JvbGwudG91Y2hlcy50b3VjaG1vdmUueS1zd2lwZVNjcm9sbC50b3VjaGVzLnRvdWNoc3RhcnQueSk+c3dpcGVTY3JvbGwub3B0aW9ucy5kaXN0YW5jZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgaWYoc3dpcGVTY3JvbGwudG91Y2hlcy50b3VjaHN0YXJ0LnkgPCBzd2lwZVNjcm9sbC50b3VjaGVzLnRvdWNobW92ZS55KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN3aXBlU2Nyb2xsLnVwKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3dpcGVTY3JvbGwuZG93bigpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgc3dpcGVTY3JvbGwudG91Y2hlcy50b3VjaHN0YXJ0LnkgPSAtMTtcclxuICAgICAgICAgICAgICAgICAgICBzd2lwZVNjcm9sbC50b3VjaGVzLnRvdWNoc3RhcnQueCA9IC0xO1xyXG4gICAgICAgICAgICAgICAgICAgIHN3aXBlU2Nyb2xsLnRvdWNoZXMuZGlyZWN0aW9uID0gXCJ1bmRldGVybWluZWRcIjtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgZG93bjogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIGlmKGluZGV4PGhlaWdodHMubGVuZ3RoKSB7XHJcblxyXG4gICAgICAgICAgaWYoYXRCb3R0b20oKSAmJiBpbmRleDxoZWlnaHRzLmxlbmd0aC0xKSB7XHJcblxyXG4gICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgICAgICAvL2luZGV4LCBpbnN0YW50LCBjYWxsYmFja3MsIHRvVG9wXHJcbiAgICAgICAgICAgIGFuaW1hdGVTY3JvbGwoaW5kZXgsZmFsc2UsdHJ1ZSxmYWxzZSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwb3J0SGVpZ2h0ID0gZ2V0cG9ydEhlaWdodCgpO1xyXG4gICAgICAgICAgICBpZihNYXRoLmZsb29yKGVsZW1lbnRzW2luZGV4XS5oZWlnaHQoKS9wb3J0SGVpZ2h0KT5pbnRlcnN0aXRpYWxJbmRleCkge1xyXG5cclxuICAgICAgICAgICAgICBpbnRlcnN0aXRpYWxTY3JvbGwocGFyc2VJbnQoaGVpZ2h0c1tpbmRleF0pKyhwb3J0SGVpZ2h0KmludGVyc3RpdGlhbEluZGV4KSk7XHJcbiAgICAgICAgICAgICAgaW50ZXJzdGl0aWFsSW5kZXggKz0gMTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgaW50ZXJzdGl0aWFsU2Nyb2xsKHBhcnNlSW50KGhlaWdodHNbaW5kZXhdKSsoZWxlbWVudHNbaW5kZXhdLm91dGVySGVpZ2h0KCktcG9ydEhlaWdodCkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgdXA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmKGluZGV4Pj0wKSB7XHJcbiAgICAgICAgICBpZihhdFRvcCgpICYmIGluZGV4PjApIHtcclxuXHJcbiAgICAgICAgICAgIGluZGV4LS07XHJcbiAgICAgICAgICAgIC8vaW5kZXgsIGluc3RhbnQsIGNhbGxiYWNrcywgdG9Ub3BcclxuICAgICAgICAgICAgYW5pbWF0ZVNjcm9sbChpbmRleCxmYWxzZSx0cnVlLGZhbHNlKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICBpZihpbnRlcnN0aXRpYWxJbmRleD4yKSB7XHJcbiAgICAgICAgICAgICAgcG9ydEhlaWdodCA9IGdldHBvcnRIZWlnaHQoKTtcclxuXHJcbiAgICAgICAgICAgICAgaW50ZXJzdGl0aWFsSW5kZXggLT0gMTtcclxuICAgICAgICAgICAgICBpbnRlcnN0aXRpYWxTY3JvbGwocGFyc2VJbnQoaGVpZ2h0c1tpbmRleF0pKyhwb3J0SGVpZ2h0KmludGVyc3RpdGlhbEluZGV4KSk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICBpbnRlcnN0aXRpYWxJbmRleCA9IDE7XHJcbiAgICAgICAgICAgICAgaW50ZXJzdGl0aWFsU2Nyb2xsKHBhcnNlSW50KGhlaWdodHNbaW5kZXhdKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBpbml0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAmJiBzZXR0aW5ncy50b3VjaFNjcm9sbCkge1xyXG4gICAgICAgICAgdmFyIGV2ZW50TGlzdGVuZXJPcHRpb25zID0ge1xyXG4gICAgICAgICAgICBwYXNzaXZlOiBmYWxzZVxyXG4gICAgICAgICAgfTtcclxuICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBzd2lwZVNjcm9sbC50b3VjaEhhbmRsZXIsIGV2ZW50TGlzdGVuZXJPcHRpb25zKTtcclxuICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHN3aXBlU2Nyb2xsLnRvdWNoSGFuZGxlciwgZXZlbnRMaXN0ZW5lck9wdGlvbnMpO1xyXG4gICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBzd2lwZVNjcm9sbC50b3VjaEhhbmRsZXIsIGV2ZW50TGlzdGVuZXJPcHRpb25zKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG5cclxuICAgIHV0aWwgPSB7XHJcbiAgICAgIHJlZnJlc2g6ZnVuY3Rpb24od2l0aENhbGxiYWNrLHNjcm9sbCkge1xyXG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQyKTtcclxuICAgICAgICB0aW1lb3V0SWQyID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgIC8vcmV0YWluIHBvc2l0aW9uXHJcbiAgICAgICAgICBzaXplUGFuZWxzKHRydWUpO1xyXG4gICAgICAgICAgLy9zY3JvbGwsIGZpcnN0TG9hZFxyXG4gICAgICAgICAgY2FsY3VsYXRlUG9zaXRpb25zKHNjcm9sbCxmYWxzZSk7XHJcbiAgICAgICAgICBpZih3aXRoQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICBzZXR0aW5ncy5hZnRlclJlc2l6ZSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sNDAwKTtcclxuICAgICAgfSxcclxuICAgICAgaGFuZGxlVXBkYXRlOmZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vY2FsbGJhY2tzLCBzY3JvbGxcclxuICAgICAgICAvL2NoYW5nZWQgZnJvbSBmYWxzZSx0cnVlIHRvIGZhbHNlLGZhbHNlXHJcbiAgICAgICAgdXRpbC5yZWZyZXNoKGZhbHNlLGZhbHNlKTtcclxuICAgICAgfSxcclxuICAgICAgaGFuZGxlUmVzaXplOmZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vY2FsbGJhY2tzLCBzY3JvbGxcclxuICAgICAgICB1dGlsLnJlZnJlc2godHJ1ZSxmYWxzZSk7XHJcbiAgICAgIH0sXHJcbiAgICAgIGhhbmRsZU9yaWVudGF0aW9uOmZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vY2FsbGJhY2tzLCBzY3JvbGxcclxuICAgICAgICB1dGlsLnJlZnJlc2godHJ1ZSx0cnVlKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIHNldHRpbmdzID0gJC5leHRlbmQoc2V0dGluZ3MsIG9wdGlvbnMpO1xyXG5cclxuICAgIC8vcmV0YWluIHBvc2l0aW9uXHJcbiAgICBzaXplUGFuZWxzKGZhbHNlKTtcclxuXHJcbiAgICBjYWxjdWxhdGVQb3NpdGlvbnMoZmFsc2UsdHJ1ZSk7XHJcblxyXG4gICAgaWYodHJ1ZT09PWhhc0xvY2F0aW9uKSB7XHJcbiAgICAgIC8vaW5kZXgsIGluc3RhbnQsIGNhbGxiYWNrcywgdG9Ub3BcclxuICAgICAgYW5pbWF0ZVNjcm9sbChpbmRleCxmYWxzZSx0cnVlLHRydWUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAvL2luc3RhbnQsY2FsbGJhY2tzXHJcbiAgICAgICAgbWFudWFsU2Nyb2xsLmNhbGN1bGF0ZU5lYXJlc3QodHJ1ZSxmYWxzZSk7XHJcbiAgICAgIH0sMjAwKTtcclxuICAgIH1cclxuICAgIGlmKGhlaWdodHMubGVuZ3RoKSB7XHJcbiAgICAgIG1hbnVhbFNjcm9sbC5pbml0KCk7XHJcbiAgICAgIHN3aXBlU2Nyb2xsLmluaXQoKTtcclxuXHJcbiAgICAgICR3aW5kb3cub24oXCJyZXNpemVcIix1dGlsLmhhbmRsZVJlc2l6ZSk7XHJcbiAgICAgIGlmIChkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKSB7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJvcmllbnRhdGlvbmNoYW5nZVwiLCB1dGlsLmhhbmRsZU9yaWVudGF0aW9uLCBmYWxzZSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGludGVyc3RpdGlhbFNjcm9sbChwb3MpIHtcclxuICAgICAgaWYoICQoKS52ZWxvY2l0eSApIHtcclxuICAgICAgICAkKHNldHRpbmdzLnRhcmdldCkuc3RvcCgpLnZlbG9jaXR5KCdzY3JvbGwnLCB7XHJcbiAgICAgICAgICBkdXJhdGlvbjogc2V0dGluZ3Muc2Nyb2xsU3BlZWQsXHJcbiAgICAgICAgICBlYXNpbmc6IHNldHRpbmdzLmVhc2luZyxcclxuICAgICAgICAgIG9mZnNldDogcG9zLFxyXG4gICAgICAgICAgbW9iaWxlSEE6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgJChzZXR0aW5ncy50YXJnZXQpLnN0b3AoKS5hbmltYXRlKHtcclxuICAgICAgICAgIHNjcm9sbFRvcDogcG9zXHJcbiAgICAgICAgfSwgc2V0dGluZ3Muc2Nyb2xsU3BlZWQsc2V0dGluZ3MuZWFzaW5nKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNpemVQYW5lbHMoa2VlcFBvc2l0aW9uKSB7XHJcbiAgICAgIGlmKGtlZXBQb3NpdGlvbikge1xyXG4gICAgICAgIHRvcCA9ICR3aW5kb3cuc2Nyb2xsVG9wKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBzZWxlY3RvciA9IHNldHRpbmdzLnNlY3Rpb247XHJcbiAgICAgIG92ZXJmbG93ID0gW107XHJcbiAgICAgIGlmKHNldHRpbmdzLmludGVyc3RpdGlhbFNlY3Rpb24ubGVuZ3RoKSB7XHJcbiAgICAgICAgc2VsZWN0b3IgKz0gXCIsXCIgKyBzZXR0aW5ncy5pbnRlcnN0aXRpYWxTZWN0aW9uO1xyXG4gICAgICB9XHJcbiAgICAgIGlmKHNldHRpbmdzLnNjcm9sbGJhcnM9PT1mYWxzZSkge1xyXG4gICAgICAgIHNldHRpbmdzLm92ZXJmbG93U2Nyb2xsID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICAgcG9ydEhlaWdodCA9IGdldHBvcnRIZWlnaHQoKTtcclxuICAgICAgJChzZWxlY3RvcikuZWFjaChmdW5jdGlvbihpKSB7XHJcbiAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcclxuXHJcbiAgICAgICAgaWYoc2V0dGluZ3Muc2V0SGVpZ2h0cykge1xyXG4gICAgICAgICAgaWYoJHRoaXMuaXMoc2V0dGluZ3MuaW50ZXJzdGl0aWFsU2VjdGlvbikpIHtcclxuICAgICAgICAgICAgb3ZlcmZsb3dbaV0gPSBmYWxzZTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmKCgkdGhpcy5jc3MoXCJoZWlnaHRcIixcImF1dG9cIikub3V0ZXJIZWlnaHQoKTxwb3J0SGVpZ2h0KSB8fCAkdGhpcy5jc3MoXCJvdmVyZmxvd1wiKT09PVwiaGlkZGVuXCIpIHtcclxuICAgICAgICAgICAgICAkdGhpcy5jc3Moe1wiaGVpZ2h0XCI6cG9ydEhlaWdodH0pO1xyXG5cclxuICAgICAgICAgICAgICBvdmVyZmxvd1tpXSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAkdGhpcy5jc3Moe1wiaGVpZ2h0XCI6JHRoaXMuaGVpZ2h0KCl9KTtcclxuXHJcbiAgICAgICAgICAgICAgaWYoc2V0dGluZ3Mub3ZlcmZsb3dTY3JvbGwpIHtcclxuICAgICAgICAgICAgICAgIG92ZXJmbG93W2ldID0gdHJ1ZTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgb3ZlcmZsb3dbaV0gPSBmYWxzZTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgaWYoKCR0aGlzLm91dGVySGVpZ2h0KCk8cG9ydEhlaWdodCkgfHwgKHNldHRpbmdzLm92ZXJmbG93U2Nyb2xsPT09ZmFsc2UpKSB7XHJcbiAgICAgICAgICAgIG92ZXJmbG93W2ldID0gZmFsc2U7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBvdmVyZmxvd1tpXSA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgaWYoa2VlcFBvc2l0aW9uKSB7XHJcbiAgICAgICAgJHdpbmRvdy5zY3JvbGxUb3AodG9wKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gY2FsY3VsYXRlUG9zaXRpb25zKHNjcm9sbCxmaXJzdExvYWQpIHtcclxuICAgICAgdmFyIHNlbGVjdG9yID0gc2V0dGluZ3Muc2VjdGlvbjtcclxuICAgICAgaWYoc2V0dGluZ3MuaW50ZXJzdGl0aWFsU2VjdGlvbi5sZW5ndGgpIHtcclxuICAgICAgICBzZWxlY3RvciArPSBcIixcIiArIHNldHRpbmdzLmludGVyc3RpdGlhbFNlY3Rpb247XHJcbiAgICAgIH1cclxuICAgICAgaGVpZ2h0cyA9IFtdO1xyXG4gICAgICBuYW1lcyA9IFtdO1xyXG4gICAgICBlbGVtZW50cyA9IFtdO1xyXG4gICAgICAkKHNlbGVjdG9yKS5lYWNoKGZ1bmN0aW9uKGkpe1xyXG4gICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcclxuICAgICAgICAgIGlmKGk+MCkge1xyXG4gICAgICAgICAgICBoZWlnaHRzW2ldID0gcGFyc2VJbnQoJHRoaXMub2Zmc2V0KCkudG9wKSArIHNldHRpbmdzLm9mZnNldDtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGhlaWdodHNbaV0gPSBwYXJzZUludCgkdGhpcy5vZmZzZXQoKS50b3ApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYoc2V0dGluZ3Muc2VjdGlvbk5hbWUgJiYgJHRoaXMuZGF0YShzZXR0aW5ncy5zZWN0aW9uTmFtZSkpIHtcclxuICAgICAgICAgICAgbmFtZXNbaV0gPSBcIiNcIiArICR0aGlzLmRhdGEoc2V0dGluZ3Muc2VjdGlvbk5hbWUpLnRvU3RyaW5nKCkucmVwbGFjZSgvIC9nLFwiLVwiKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmKCR0aGlzLmlzKHNldHRpbmdzLmludGVyc3RpdGlhbFNlY3Rpb24pPT09ZmFsc2UpIHtcclxuICAgICAgICAgICAgICBuYW1lc1tpXSA9IFwiI1wiICsgKGkgKyAxKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBuYW1lc1tpXSA9IFwiI1wiO1xyXG4gICAgICAgICAgICAgIGlmKGk9PT0kKHNlbGVjdG9yKS5sZW5ndGgtMSAmJiBpPjEpIHtcclxuICAgICAgICAgICAgICAgIGhlaWdodHNbaV0gPSBoZWlnaHRzW2ktMV0gKyAocGFyc2VJbnQoJCgkKHNlbGVjdG9yKVtpLTFdKS5vdXRlckhlaWdodCgpKSAtIHBhcnNlSW50KCQod2luZG93KS5oZWlnaHQoKSkpICsgcGFyc2VJbnQoJHRoaXMub3V0ZXJIZWlnaHQoKSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbGVtZW50c1tpXSA9ICR0aGlzO1xyXG4gICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYoJChuYW1lc1tpXSkubGVuZ3RoICYmIHdpbmRvdy5jb25zb2xlKSB7XHJcbiAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiU2Nyb2xsaWZ5IHdhcm5pbmc6IFNlY3Rpb24gbmFtZXMgY2FuJ3QgbWF0Y2ggSURzIC0gdGhpcyB3aWxsIGNhdXNlIHRoZSBicm93c2VyIHRvIGFuY2hvci5cIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gY2F0Y2ggKGUpIHt9XHJcblxyXG4gICAgICAgICAgaWYod2luZG93LmxvY2F0aW9uLmhhc2g9PT1uYW1lc1tpXSkge1xyXG4gICAgICAgICAgICBpbmRleCA9IGk7XHJcbiAgICAgICAgICAgIGhhc0xvY2F0aW9uID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYodHJ1ZT09PXNjcm9sbCkge1xyXG4gICAgICAgIC8vaW5kZXgsIGluc3RhbnQsIGNhbGxiYWNrcywgdG9Ub3BcclxuICAgICAgICBhbmltYXRlU2Nyb2xsKGluZGV4LGZhbHNlLGZhbHNlLGZhbHNlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGF0VG9wKCkge1xyXG4gICAgICBpZighb3ZlcmZsb3dbaW5kZXhdKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgdG9wID0gJHdpbmRvdy5zY3JvbGxUb3AoKTtcclxuICAgICAgaWYodG9wPnBhcnNlSW50KGhlaWdodHNbaW5kZXhdKSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gYXRCb3R0b20oKSB7XHJcbiAgICAgIGlmKCFvdmVyZmxvd1tpbmRleF0pIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICB0b3AgPSAkd2luZG93LnNjcm9sbFRvcCgpO1xyXG4gICAgICBwb3J0SGVpZ2h0ID0gZ2V0cG9ydEhlaWdodCgpO1xyXG5cclxuICAgICAgaWYodG9wPHBhcnNlSW50KGhlaWdodHNbaW5kZXhdKSsoZWxlbWVudHNbaW5kZXhdLm91dGVySGVpZ2h0KCktcG9ydEhlaWdodCktMjgpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbW92ZShwYW5lbCxpbnN0YW50KSB7XHJcbiAgICB2YXIgeiA9IG5hbWVzLmxlbmd0aDtcclxuICAgIGZvcig7ej49MDt6LS0pIHtcclxuICAgICAgaWYodHlwZW9mIHBhbmVsID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgIGlmIChuYW1lc1t6XT09PXBhbmVsKSB7XHJcbiAgICAgICAgICBpbmRleCA9IHo7XHJcbiAgICAgICAgICAvL2luZGV4LCBpbnN0YW50LCBjYWxsYmFja3MsIHRvVG9wXHJcbiAgICAgICAgICBhbmltYXRlU2Nyb2xsKHosaW5zdGFudCx0cnVlLHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpZih6PT09cGFuZWwpIHtcclxuICAgICAgICAgIGluZGV4ID0gejtcclxuICAgICAgICAgIC8vaW5kZXgsIGluc3RhbnQsIGNhbGxiYWNrcywgdG9Ub3BcclxuICAgICAgICAgIGFuaW1hdGVTY3JvbGwoeixpbnN0YW50LHRydWUsdHJ1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIHNjcm9sbGlmeS5tb3ZlID0gZnVuY3Rpb24ocGFuZWwpIHtcclxuICAgIGlmKHBhbmVsPT09dW5kZWZpbmVkKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGlmKHBhbmVsLm9yaWdpbmFsRXZlbnQpIHtcclxuICAgICAgcGFuZWwgPSAkKHRoaXMpLmF0dHIoXCJocmVmXCIpO1xyXG4gICAgfVxyXG4gICAgbW92ZShwYW5lbCxmYWxzZSk7XHJcbiAgfTtcclxuICBzY3JvbGxpZnkuaW5zdGFudE1vdmUgPSBmdW5jdGlvbihwYW5lbCkge1xyXG4gICAgaWYocGFuZWw9PT11bmRlZmluZWQpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgbW92ZShwYW5lbCx0cnVlKTtcclxuICB9O1xyXG4gIHNjcm9sbGlmeS5uZXh0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZihpbmRleDxuYW1lcy5sZW5ndGgpIHtcclxuICAgICAgaW5kZXggKz0gMTtcclxuICAgICAgLy9pbmRleCwgaW5zdGFudCwgY2FsbGJhY2tzLCB0b1RvcFxyXG4gICAgICBhbmltYXRlU2Nyb2xsKGluZGV4LGZhbHNlLHRydWUsdHJ1ZSk7XHJcbiAgICB9XHJcbiAgfTtcclxuICBzY3JvbGxpZnkucHJldmlvdXMgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmKGluZGV4PjApIHtcclxuICAgICAgaW5kZXggLT0gMTtcclxuICAgICAgLy9pbmRleCwgaW5zdGFudCwgY2FsbGJhY2tzLCB0b1RvcFxyXG4gICAgICBhbmltYXRlU2Nyb2xsKGluZGV4LGZhbHNlLHRydWUsdHJ1ZSk7XHJcbiAgICB9XHJcbiAgfTtcclxuICBzY3JvbGxpZnkuaW5zdGFudE5leHQgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmKGluZGV4PG5hbWVzLmxlbmd0aCkge1xyXG4gICAgICBpbmRleCArPSAxO1xyXG4gICAgICAvL2luZGV4LCBpbnN0YW50LCBjYWxsYmFja3MsIHRvVG9wXHJcbiAgICAgIGFuaW1hdGVTY3JvbGwoaW5kZXgsdHJ1ZSx0cnVlLHRydWUpO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgc2Nyb2xsaWZ5Lmluc3RhbnRQcmV2aW91cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYoaW5kZXg+MCkge1xyXG4gICAgICBpbmRleCAtPSAxO1xyXG4gICAgICAvL2luZGV4LCBpbnN0YW50LCBjYWxsYmFja3MsIHRvVG9wXHJcbiAgICAgIGFuaW1hdGVTY3JvbGwoaW5kZXgsdHJ1ZSx0cnVlLHRydWUpO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgc2Nyb2xsaWZ5LmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmKCFpbml0aWFsaXNlZCkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBpZihzZXR0aW5ncy5zZXRIZWlnaHRzKSB7XHJcbiAgICAgICQoc2V0dGluZ3Muc2VjdGlvbikuZWFjaChmdW5jdGlvbigpIHtcclxuICAgICAgICAkKHRoaXMpLmNzcyhcImhlaWdodFwiLFwiYXV0b1wiKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAkd2luZG93Lm9mZihcInJlc2l6ZVwiLHV0aWwuaGFuZGxlUmVzaXplKTtcclxuICAgIGlmKHNldHRpbmdzLnNjcm9sbGJhcnMpIHtcclxuICAgICAgJHdpbmRvdy5vZmYoJ21vdXNlZG93bicsIG1hbnVhbFNjcm9sbC5oYW5kbGVNb3VzZWRvd24pO1xyXG4gICAgICAkd2luZG93Lm9mZignbW91c2V1cCcsIG1hbnVhbFNjcm9sbC5oYW5kbGVNb3VzZXVwKTtcclxuICAgICAgJHdpbmRvdy5vZmYoJ3Njcm9sbCcsIG1hbnVhbFNjcm9sbC5oYW5kbGVTY3JvbGwpO1xyXG4gICAgfVxyXG4gICAgJHdpbmRvdy5vZmYod2hlZWxFdmVudCxtYW51YWxTY3JvbGwud2hlZWxIYW5kbGVyKTtcclxuICAgICR3aW5kb3cub2ZmKCdrZXlkb3duJywgbWFudWFsU2Nyb2xsLmtleUhhbmRsZXIpO1xyXG5cclxuICAgIGlmIChkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyICYmIHNldHRpbmdzLnRvdWNoU2Nyb2xsKSB7XHJcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBzd2lwZVNjcm9sbC50b3VjaEhhbmRsZXIsIGZhbHNlKTtcclxuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgc3dpcGVTY3JvbGwudG91Y2hIYW5kbGVyLCBmYWxzZSk7XHJcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgc3dpcGVTY3JvbGwudG91Y2hIYW5kbGVyLCBmYWxzZSk7XHJcbiAgICB9XHJcbiAgICBoZWlnaHRzID0gW107XHJcbiAgICBuYW1lcyA9IFtdO1xyXG4gICAgZWxlbWVudHMgPSBbXTtcclxuICAgIG92ZXJmbG93ID0gW107XHJcbiAgfTtcclxuICBzY3JvbGxpZnkudXBkYXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZighaW5pdGlhbGlzZWQpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdXRpbC5oYW5kbGVVcGRhdGUoKTtcclxuICB9O1xyXG4gIHNjcm9sbGlmeS5jdXJyZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gZWxlbWVudHNbaW5kZXhdO1xyXG4gIH07XHJcbiAgc2Nyb2xsaWZ5LmN1cnJlbnRJbmRleCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIGluZGV4O1xyXG4gIH07XHJcbiAgc2Nyb2xsaWZ5LmRpc2FibGUgPSBmdW5jdGlvbigpIHtcclxuICAgIGRpc2FibGVkID0gdHJ1ZTtcclxuICB9O1xyXG4gIHNjcm9sbGlmeS5lbmFibGUgPSBmdW5jdGlvbigpIHtcclxuICAgIGRpc2FibGVkID0gZmFsc2U7XHJcbiAgICBpZiAoaW5pdGlhbGlzZWQpIHtcclxuICAgICAgLy9pbnN0YW50LGNhbGxiYWNrc1xyXG4gICAgICBtYW51YWxTY3JvbGwuY2FsY3VsYXRlTmVhcmVzdChmYWxzZSxmYWxzZSk7XHJcbiAgICB9XHJcbiAgfTtcclxuICBzY3JvbGxpZnkuaXNEaXNhYmxlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIGRpc2FibGVkO1xyXG4gIH07XHJcbiAgc2Nyb2xsaWZ5LnNldE9wdGlvbnMgPSBmdW5jdGlvbih1cGRhdGVkT3B0aW9ucykge1xyXG4gICAgaWYoIWluaXRpYWxpc2VkKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGlmKHR5cGVvZiB1cGRhdGVkT3B0aW9ucyA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICBzZXR0aW5ncyA9ICQuZXh0ZW5kKHNldHRpbmdzLCB1cGRhdGVkT3B0aW9ucyk7XHJcbiAgICAgIHV0aWwuaGFuZGxlVXBkYXRlKCk7XHJcbiAgICB9IGVsc2UgaWYod2luZG93LmNvbnNvbGUpIHtcclxuICAgICAgY29uc29sZS53YXJuKFwiU2Nyb2xsaWZ5IHdhcm5pbmc6IHNldE9wdGlvbnMgZXhwZWN0cyBhbiBvYmplY3QuXCIpO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgJC5zY3JvbGxpZnkgPSBzY3JvbGxpZnk7XHJcbiAgcmV0dXJuIHNjcm9sbGlmeTtcclxufSkpO1xyXG4iLCIvKiFcbiAqIFN0ZWxsYXIuanMgdjAuNi4yXG4gKiBodHRwOi8vbWFya2RhbGdsZWlzaC5jb20vcHJvamVjdHMvc3RlbGxhci5qc1xuICpcbiAqIENvcHlyaWdodCAyMDE0LCBNYXJrIERhbGdsZWlzaFxuICogVGhpcyBjb250ZW50IGlzIHJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICogaHR0cDovL21hcmtkYWxnbGVpc2gubWl0LWxpY2Vuc2Uub3JnXG4gKi9cblxuOyhmdW5jdGlvbigkLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcblxuXHR2YXIgcGx1Z2luTmFtZSA9ICdzdGVsbGFyJyxcblx0XHRkZWZhdWx0cyA9IHtcblx0XHRcdHNjcm9sbFByb3BlcnR5OiAnc2Nyb2xsJyxcblx0XHRcdHBvc2l0aW9uUHJvcGVydHk6ICdwb3NpdGlvbicsXG5cdFx0XHRob3Jpem9udGFsU2Nyb2xsaW5nOiB0cnVlLFxuXHRcdFx0dmVydGljYWxTY3JvbGxpbmc6IHRydWUsXG5cdFx0XHRob3Jpem9udGFsT2Zmc2V0OiAwLFxuXHRcdFx0dmVydGljYWxPZmZzZXQ6IDAsXG5cdFx0XHRyZXNwb25zaXZlOiBmYWxzZSxcblx0XHRcdHBhcmFsbGF4QmFja2dyb3VuZHM6IHRydWUsXG5cdFx0XHRwYXJhbGxheEVsZW1lbnRzOiB0cnVlLFxuXHRcdFx0aGlkZURpc3RhbnRFbGVtZW50czogdHJ1ZSxcblx0XHRcdGhpZGVFbGVtZW50OiBmdW5jdGlvbigkZWxlbSkgeyAkZWxlbS5oaWRlKCk7IH0sXG5cdFx0XHRzaG93RWxlbWVudDogZnVuY3Rpb24oJGVsZW0pIHsgJGVsZW0uc2hvdygpOyB9XG5cdFx0fSxcblxuXHRcdHNjcm9sbFByb3BlcnR5ID0ge1xuXHRcdFx0c2Nyb2xsOiB7XG5cdFx0XHRcdGdldExlZnQ6IGZ1bmN0aW9uKCRlbGVtKSB7IHJldHVybiAkZWxlbS5zY3JvbGxMZWZ0KCk7IH0sXG5cdFx0XHRcdHNldExlZnQ6IGZ1bmN0aW9uKCRlbGVtLCB2YWwpIHsgJGVsZW0uc2Nyb2xsTGVmdCh2YWwpOyB9LFxuXG5cdFx0XHRcdGdldFRvcDogZnVuY3Rpb24oJGVsZW0pIHsgcmV0dXJuICRlbGVtLnNjcm9sbFRvcCgpO1x0fSxcblx0XHRcdFx0c2V0VG9wOiBmdW5jdGlvbigkZWxlbSwgdmFsKSB7ICRlbGVtLnNjcm9sbFRvcCh2YWwpOyB9XG5cdFx0XHR9LFxuXHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0Z2V0TGVmdDogZnVuY3Rpb24oJGVsZW0pIHsgcmV0dXJuIHBhcnNlSW50KCRlbGVtLmNzcygnbGVmdCcpLCAxMCkgKiAtMTsgfSxcblx0XHRcdFx0Z2V0VG9wOiBmdW5jdGlvbigkZWxlbSkgeyByZXR1cm4gcGFyc2VJbnQoJGVsZW0uY3NzKCd0b3AnKSwgMTApICogLTE7IH1cblx0XHRcdH0sXG5cdFx0XHRtYXJnaW46IHtcblx0XHRcdFx0Z2V0TGVmdDogZnVuY3Rpb24oJGVsZW0pIHsgcmV0dXJuIHBhcnNlSW50KCRlbGVtLmNzcygnbWFyZ2luLWxlZnQnKSwgMTApICogLTE7IH0sXG5cdFx0XHRcdGdldFRvcDogZnVuY3Rpb24oJGVsZW0pIHsgcmV0dXJuIHBhcnNlSW50KCRlbGVtLmNzcygnbWFyZ2luLXRvcCcpLCAxMCkgKiAtMTsgfVxuXHRcdFx0fSxcblx0XHRcdHRyYW5zZm9ybToge1xuXHRcdFx0XHRnZXRMZWZ0OiBmdW5jdGlvbigkZWxlbSkge1xuXHRcdFx0XHRcdHZhciBjb21wdXRlZFRyYW5zZm9ybSA9IGdldENvbXB1dGVkU3R5bGUoJGVsZW1bMF0pW3ByZWZpeGVkVHJhbnNmb3JtXTtcblx0XHRcdFx0XHRyZXR1cm4gKGNvbXB1dGVkVHJhbnNmb3JtICE9PSAnbm9uZScgPyBwYXJzZUludChjb21wdXRlZFRyYW5zZm9ybS5tYXRjaCgvKC0/WzAtOV0rKS9nKVs0XSwgMTApICogLTEgOiAwKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0Z2V0VG9wOiBmdW5jdGlvbigkZWxlbSkge1xuXHRcdFx0XHRcdHZhciBjb21wdXRlZFRyYW5zZm9ybSA9IGdldENvbXB1dGVkU3R5bGUoJGVsZW1bMF0pW3ByZWZpeGVkVHJhbnNmb3JtXTtcblx0XHRcdFx0XHRyZXR1cm4gKGNvbXB1dGVkVHJhbnNmb3JtICE9PSAnbm9uZScgPyBwYXJzZUludChjb21wdXRlZFRyYW5zZm9ybS5tYXRjaCgvKC0/WzAtOV0rKS9nKVs1XSwgMTApICogLTEgOiAwKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRwb3NpdGlvblByb3BlcnR5ID0ge1xuXHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0c2V0TGVmdDogZnVuY3Rpb24oJGVsZW0sIGxlZnQpIHsgJGVsZW0uY3NzKCdsZWZ0JywgbGVmdCk7IH0sXG5cdFx0XHRcdHNldFRvcDogZnVuY3Rpb24oJGVsZW0sIHRvcCkgeyAkZWxlbS5jc3MoJ3RvcCcsIHRvcCk7IH1cblx0XHRcdH0sXG5cdFx0XHR0cmFuc2Zvcm06IHtcblx0XHRcdFx0c2V0UG9zaXRpb246IGZ1bmN0aW9uKCRlbGVtLCBsZWZ0LCBzdGFydGluZ0xlZnQsIHRvcCwgc3RhcnRpbmdUb3ApIHtcblx0XHRcdFx0XHQkZWxlbVswXS5zdHlsZVtwcmVmaXhlZFRyYW5zZm9ybV0gPSAndHJhbnNsYXRlM2QoJyArIChsZWZ0IC0gc3RhcnRpbmdMZWZ0KSArICdweCwgJyArICh0b3AgLSBzdGFydGluZ1RvcCkgKyAncHgsIDApJztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHQvLyBSZXR1cm5zIGEgZnVuY3Rpb24gd2hpY2ggYWRkcyBhIHZlbmRvciBwcmVmaXggdG8gYW55IENTUyBwcm9wZXJ0eSBuYW1lXG5cdFx0dmVuZG9yUHJlZml4ID0gKGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHByZWZpeGVzID0gL14oTW96fFdlYmtpdHxLaHRtbHxPfG1zfEljYWIpKD89W0EtWl0pLyxcblx0XHRcdFx0c3R5bGUgPSAkKCdzY3JpcHQnKVswXS5zdHlsZSxcblx0XHRcdFx0cHJlZml4ID0gJycsXG5cdFx0XHRcdHByb3A7XG5cblx0XHRcdGZvciAocHJvcCBpbiBzdHlsZSkge1xuXHRcdFx0XHRpZiAocHJlZml4ZXMudGVzdChwcm9wKSkge1xuXHRcdFx0XHRcdHByZWZpeCA9IHByb3AubWF0Y2gocHJlZml4ZXMpWzBdO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmICgnV2Via2l0T3BhY2l0eScgaW4gc3R5bGUpIHsgcHJlZml4ID0gJ1dlYmtpdCc7IH1cblx0XHRcdGlmICgnS2h0bWxPcGFjaXR5JyBpbiBzdHlsZSkgeyBwcmVmaXggPSAnS2h0bWwnOyB9XG5cblx0XHRcdHJldHVybiBmdW5jdGlvbihwcm9wZXJ0eSkge1xuXHRcdFx0XHRyZXR1cm4gcHJlZml4ICsgKHByZWZpeC5sZW5ndGggPiAwID8gcHJvcGVydHkuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwcm9wZXJ0eS5zbGljZSgxKSA6IHByb3BlcnR5KTtcblx0XHRcdH07XG5cdFx0fSgpKSxcblxuXHRcdHByZWZpeGVkVHJhbnNmb3JtID0gdmVuZG9yUHJlZml4KCd0cmFuc2Zvcm0nKSxcblxuXHRcdHN1cHBvcnRzQmFja2dyb3VuZFBvc2l0aW9uWFkgPSAkKCc8ZGl2IC8+JywgeyBzdHlsZTogJ2JhY2tncm91bmQ6I2ZmZicgfSkuY3NzKCdiYWNrZ3JvdW5kLXBvc2l0aW9uLXgnKSAhPT0gdW5kZWZpbmVkLFxuXG5cdFx0c2V0QmFja2dyb3VuZFBvc2l0aW9uID0gKHN1cHBvcnRzQmFja2dyb3VuZFBvc2l0aW9uWFkgP1xuXHRcdFx0ZnVuY3Rpb24oJGVsZW0sIHgsIHkpIHtcblx0XHRcdFx0JGVsZW0uY3NzKHtcblx0XHRcdFx0XHQnYmFja2dyb3VuZC1wb3NpdGlvbi14JzogeCxcblx0XHRcdFx0XHQnYmFja2dyb3VuZC1wb3NpdGlvbi15JzogeVxuXHRcdFx0XHR9KTtcblx0XHRcdH0gOlxuXHRcdFx0ZnVuY3Rpb24oJGVsZW0sIHgsIHkpIHtcblx0XHRcdFx0JGVsZW0uY3NzKCdiYWNrZ3JvdW5kLXBvc2l0aW9uJywgeCArICcgJyArIHkpO1xuXHRcdFx0fVxuXHRcdCksXG5cblx0XHRnZXRCYWNrZ3JvdW5kUG9zaXRpb24gPSAoc3VwcG9ydHNCYWNrZ3JvdW5kUG9zaXRpb25YWSA/XG5cdFx0XHRmdW5jdGlvbigkZWxlbSkge1xuXHRcdFx0XHRyZXR1cm4gW1xuXHRcdFx0XHRcdCRlbGVtLmNzcygnYmFja2dyb3VuZC1wb3NpdGlvbi14JyksXG5cdFx0XHRcdFx0JGVsZW0uY3NzKCdiYWNrZ3JvdW5kLXBvc2l0aW9uLXknKVxuXHRcdFx0XHRdO1xuXHRcdFx0fSA6XG5cdFx0XHRmdW5jdGlvbigkZWxlbSkge1xuXHRcdFx0XHRyZXR1cm4gJGVsZW0uY3NzKCdiYWNrZ3JvdW5kLXBvc2l0aW9uJykuc3BsaXQoJyAnKTtcblx0XHRcdH1cblx0XHQpLFxuXG5cdFx0cmVxdWVzdEFuaW1GcmFtZSA9IChcblx0XHRcdHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgICAgICAgfHxcblx0XHRcdHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcblx0XHRcdHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgICAgfHxcblx0XHRcdHdpbmRvdy5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgICAgfHxcblx0XHRcdHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSAgICAgfHxcblx0XHRcdGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cdFx0XHRcdHNldFRpbWVvdXQoY2FsbGJhY2ssIDEwMDAgLyA2MCk7XG5cdFx0XHR9XG5cdFx0KTtcblxuXHRmdW5jdGlvbiBQbHVnaW4oZWxlbWVudCwgb3B0aW9ucykge1xuXHRcdHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG5cdFx0dGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIGRlZmF1bHRzLCBvcHRpb25zKTtcblxuXHRcdHRoaXMuX2RlZmF1bHRzID0gZGVmYXVsdHM7XG5cdFx0dGhpcy5fbmFtZSA9IHBsdWdpbk5hbWU7XG5cblx0XHR0aGlzLmluaXQoKTtcblx0fVxuXG5cdFBsdWdpbi5wcm90b3R5cGUgPSB7XG5cdFx0aW5pdDogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLm9wdGlvbnMubmFtZSA9IHBsdWdpbk5hbWUgKyAnXycgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxZTkpO1xuXG5cdFx0XHR0aGlzLl9kZWZpbmVFbGVtZW50cygpO1xuXHRcdFx0dGhpcy5fZGVmaW5lR2V0dGVycygpO1xuXHRcdFx0dGhpcy5fZGVmaW5lU2V0dGVycygpO1xuXHRcdFx0dGhpcy5faGFuZGxlV2luZG93TG9hZEFuZFJlc2l6ZSgpO1xuXHRcdFx0dGhpcy5fZGV0ZWN0Vmlld3BvcnQoKTtcblxuXHRcdFx0dGhpcy5yZWZyZXNoKHsgZmlyc3RMb2FkOiB0cnVlIH0pO1xuXG5cdFx0XHRpZiAodGhpcy5vcHRpb25zLnNjcm9sbFByb3BlcnR5ID09PSAnc2Nyb2xsJykge1xuXHRcdFx0XHR0aGlzLl9oYW5kbGVTY3JvbGxFdmVudCgpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5fc3RhcnRBbmltYXRpb25Mb29wKCk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRfZGVmaW5lRWxlbWVudHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKHRoaXMuZWxlbWVudCA9PT0gZG9jdW1lbnQuYm9keSkgdGhpcy5lbGVtZW50ID0gd2luZG93O1xuXHRcdFx0dGhpcy4kc2Nyb2xsRWxlbWVudCA9ICQodGhpcy5lbGVtZW50KTtcblx0XHRcdHRoaXMuJGVsZW1lbnQgPSAodGhpcy5lbGVtZW50ID09PSB3aW5kb3cgPyAkKCdib2R5JykgOiB0aGlzLiRzY3JvbGxFbGVtZW50KTtcblx0XHRcdHRoaXMuJHZpZXdwb3J0RWxlbWVudCA9ICh0aGlzLm9wdGlvbnMudmlld3BvcnRFbGVtZW50ICE9PSB1bmRlZmluZWQgPyAkKHRoaXMub3B0aW9ucy52aWV3cG9ydEVsZW1lbnQpIDogKHRoaXMuJHNjcm9sbEVsZW1lbnRbMF0gPT09IHdpbmRvdyB8fCB0aGlzLm9wdGlvbnMuc2Nyb2xsUHJvcGVydHkgPT09ICdzY3JvbGwnID8gdGhpcy4kc2Nyb2xsRWxlbWVudCA6IHRoaXMuJHNjcm9sbEVsZW1lbnQucGFyZW50KCkpICk7XG5cdFx0fSxcblx0XHRfZGVmaW5lR2V0dGVyczogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgc2VsZiA9IHRoaXMsXG5cdFx0XHRcdHNjcm9sbFByb3BlcnR5QWRhcHRlciA9IHNjcm9sbFByb3BlcnR5W3NlbGYub3B0aW9ucy5zY3JvbGxQcm9wZXJ0eV07XG5cblx0XHRcdHRoaXMuX2dldFNjcm9sbExlZnQgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIHNjcm9sbFByb3BlcnR5QWRhcHRlci5nZXRMZWZ0KHNlbGYuJHNjcm9sbEVsZW1lbnQpO1xuXHRcdFx0fTtcblxuXHRcdFx0dGhpcy5fZ2V0U2Nyb2xsVG9wID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiBzY3JvbGxQcm9wZXJ0eUFkYXB0ZXIuZ2V0VG9wKHNlbGYuJHNjcm9sbEVsZW1lbnQpO1xuXHRcdFx0fTtcblx0XHR9LFxuXHRcdF9kZWZpbmVTZXR0ZXJzOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBzZWxmID0gdGhpcyxcblx0XHRcdFx0c2Nyb2xsUHJvcGVydHlBZGFwdGVyID0gc2Nyb2xsUHJvcGVydHlbc2VsZi5vcHRpb25zLnNjcm9sbFByb3BlcnR5XSxcblx0XHRcdFx0cG9zaXRpb25Qcm9wZXJ0eUFkYXB0ZXIgPSBwb3NpdGlvblByb3BlcnR5W3NlbGYub3B0aW9ucy5wb3NpdGlvblByb3BlcnR5XSxcblx0XHRcdFx0c2V0U2Nyb2xsTGVmdCA9IHNjcm9sbFByb3BlcnR5QWRhcHRlci5zZXRMZWZ0LFxuXHRcdFx0XHRzZXRTY3JvbGxUb3AgPSBzY3JvbGxQcm9wZXJ0eUFkYXB0ZXIuc2V0VG9wO1xuXG5cdFx0XHR0aGlzLl9zZXRTY3JvbGxMZWZ0ID0gKHR5cGVvZiBzZXRTY3JvbGxMZWZ0ID09PSAnZnVuY3Rpb24nID8gZnVuY3Rpb24odmFsKSB7XG5cdFx0XHRcdHNldFNjcm9sbExlZnQoc2VsZi4kc2Nyb2xsRWxlbWVudCwgdmFsKTtcblx0XHRcdH0gOiAkLm5vb3ApO1xuXG5cdFx0XHR0aGlzLl9zZXRTY3JvbGxUb3AgPSAodHlwZW9mIHNldFNjcm9sbFRvcCA9PT0gJ2Z1bmN0aW9uJyA/IGZ1bmN0aW9uKHZhbCkge1xuXHRcdFx0XHRzZXRTY3JvbGxUb3Aoc2VsZi4kc2Nyb2xsRWxlbWVudCwgdmFsKTtcblx0XHRcdH0gOiAkLm5vb3ApO1xuXG5cdFx0XHR0aGlzLl9zZXRQb3NpdGlvbiA9IHBvc2l0aW9uUHJvcGVydHlBZGFwdGVyLnNldFBvc2l0aW9uIHx8XG5cdFx0XHRcdGZ1bmN0aW9uKCRlbGVtLCBsZWZ0LCBzdGFydGluZ0xlZnQsIHRvcCwgc3RhcnRpbmdUb3ApIHtcblx0XHRcdFx0XHRpZiAoc2VsZi5vcHRpb25zLmhvcml6b250YWxTY3JvbGxpbmcpIHtcblx0XHRcdFx0XHRcdHBvc2l0aW9uUHJvcGVydHlBZGFwdGVyLnNldExlZnQoJGVsZW0sIGxlZnQsIHN0YXJ0aW5nTGVmdCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKHNlbGYub3B0aW9ucy52ZXJ0aWNhbFNjcm9sbGluZykge1xuXHRcdFx0XHRcdFx0cG9zaXRpb25Qcm9wZXJ0eUFkYXB0ZXIuc2V0VG9wKCRlbGVtLCB0b3AsIHN0YXJ0aW5nVG9wKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH07XG5cdFx0fSxcblx0XHRfaGFuZGxlV2luZG93TG9hZEFuZFJlc2l6ZTogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgc2VsZiA9IHRoaXMsXG5cdFx0XHRcdCR3aW5kb3cgPSAkKHdpbmRvdyk7XG5cblx0XHRcdGlmIChzZWxmLm9wdGlvbnMucmVzcG9uc2l2ZSkge1xuXHRcdFx0XHQkd2luZG93LmJpbmQoJ2xvYWQuJyArIHRoaXMubmFtZSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0c2VsZi5yZWZyZXNoKCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQkd2luZG93LmJpbmQoJ3Jlc2l6ZS4nICsgdGhpcy5uYW1lLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0c2VsZi5fZGV0ZWN0Vmlld3BvcnQoKTtcblxuXHRcdFx0XHRpZiAoc2VsZi5vcHRpb25zLnJlc3BvbnNpdmUpIHtcblx0XHRcdFx0XHRzZWxmLnJlZnJlc2goKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHRyZWZyZXNoOiBmdW5jdGlvbihvcHRpb25zKSB7XG5cdFx0XHR2YXIgc2VsZiA9IHRoaXMsXG5cdFx0XHRcdG9sZExlZnQgPSBzZWxmLl9nZXRTY3JvbGxMZWZ0KCksXG5cdFx0XHRcdG9sZFRvcCA9IHNlbGYuX2dldFNjcm9sbFRvcCgpO1xuXG5cdFx0XHRpZiAoIW9wdGlvbnMgfHwgIW9wdGlvbnMuZmlyc3RMb2FkKSB7XG5cdFx0XHRcdHRoaXMuX3Jlc2V0KCk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuX3NldFNjcm9sbExlZnQoMCk7XG5cdFx0XHR0aGlzLl9zZXRTY3JvbGxUb3AoMCk7XG5cblx0XHRcdHRoaXMuX3NldE9mZnNldHMoKTtcblx0XHRcdHRoaXMuX2ZpbmRQYXJ0aWNsZXMoKTtcblx0XHRcdHRoaXMuX2ZpbmRCYWNrZ3JvdW5kcygpO1xuXG5cdFx0XHQvLyBGaXggZm9yIFdlYktpdCBiYWNrZ3JvdW5kIHJlbmRlcmluZyBidWdcblx0XHRcdGlmIChvcHRpb25zICYmIG9wdGlvbnMuZmlyc3RMb2FkICYmIC9XZWJLaXQvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkpIHtcblx0XHRcdFx0JCh3aW5kb3cpLmxvYWQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dmFyIG9sZExlZnQgPSBzZWxmLl9nZXRTY3JvbGxMZWZ0KCksXG5cdFx0XHRcdFx0XHRvbGRUb3AgPSBzZWxmLl9nZXRTY3JvbGxUb3AoKTtcblxuXHRcdFx0XHRcdHNlbGYuX3NldFNjcm9sbExlZnQob2xkTGVmdCArIDEpO1xuXHRcdFx0XHRcdHNlbGYuX3NldFNjcm9sbFRvcChvbGRUb3AgKyAxKTtcblxuXHRcdFx0XHRcdHNlbGYuX3NldFNjcm9sbExlZnQob2xkTGVmdCk7XG5cdFx0XHRcdFx0c2VsZi5fc2V0U2Nyb2xsVG9wKG9sZFRvcCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLl9zZXRTY3JvbGxMZWZ0KG9sZExlZnQpO1xuXHRcdFx0dGhpcy5fc2V0U2Nyb2xsVG9wKG9sZFRvcCk7XG5cdFx0fSxcblx0XHRfZGV0ZWN0Vmlld3BvcnQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHZpZXdwb3J0T2Zmc2V0cyA9IHRoaXMuJHZpZXdwb3J0RWxlbWVudC5vZmZzZXQoKSxcblx0XHRcdFx0aGFzT2Zmc2V0cyA9IHZpZXdwb3J0T2Zmc2V0cyAhPT0gbnVsbCAmJiB2aWV3cG9ydE9mZnNldHMgIT09IHVuZGVmaW5lZDtcblxuXHRcdFx0dGhpcy52aWV3cG9ydFdpZHRoID0gdGhpcy4kdmlld3BvcnRFbGVtZW50LndpZHRoKCk7XG5cdFx0XHR0aGlzLnZpZXdwb3J0SGVpZ2h0ID0gdGhpcy4kdmlld3BvcnRFbGVtZW50LmhlaWdodCgpO1xuXG5cdFx0XHR0aGlzLnZpZXdwb3J0T2Zmc2V0VG9wID0gKGhhc09mZnNldHMgPyB2aWV3cG9ydE9mZnNldHMudG9wIDogMCk7XG5cdFx0XHR0aGlzLnZpZXdwb3J0T2Zmc2V0TGVmdCA9IChoYXNPZmZzZXRzID8gdmlld3BvcnRPZmZzZXRzLmxlZnQgOiAwKTtcblx0XHR9LFxuXHRcdF9maW5kUGFydGljbGVzOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBzZWxmID0gdGhpcyxcblx0XHRcdFx0c2Nyb2xsTGVmdCA9IHRoaXMuX2dldFNjcm9sbExlZnQoKSxcblx0XHRcdFx0c2Nyb2xsVG9wID0gdGhpcy5fZ2V0U2Nyb2xsVG9wKCk7XG5cblx0XHRcdGlmICh0aGlzLnBhcnRpY2xlcyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdGZvciAodmFyIGkgPSB0aGlzLnBhcnRpY2xlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuXHRcdFx0XHRcdHRoaXMucGFydGljbGVzW2ldLiRlbGVtZW50LmRhdGEoJ3N0ZWxsYXItZWxlbWVudElzQWN0aXZlJywgdW5kZWZpbmVkKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnBhcnRpY2xlcyA9IFtdO1xuXG5cdFx0XHRpZiAoIXRoaXMub3B0aW9ucy5wYXJhbGxheEVsZW1lbnRzKSByZXR1cm47XG5cblx0XHRcdHRoaXMuJGVsZW1lbnQuZmluZCgnW2RhdGEtc3RlbGxhci1yYXRpb10nKS5lYWNoKGZ1bmN0aW9uKGkpIHtcblx0XHRcdFx0dmFyICR0aGlzID0gJCh0aGlzKSxcblx0XHRcdFx0XHRob3Jpem9udGFsT2Zmc2V0LFxuXHRcdFx0XHRcdHZlcnRpY2FsT2Zmc2V0LFxuXHRcdFx0XHRcdHBvc2l0aW9uTGVmdCxcblx0XHRcdFx0XHRwb3NpdGlvblRvcCxcblx0XHRcdFx0XHRtYXJnaW5MZWZ0LFxuXHRcdFx0XHRcdG1hcmdpblRvcCxcblx0XHRcdFx0XHQkb2Zmc2V0UGFyZW50LFxuXHRcdFx0XHRcdG9mZnNldExlZnQsXG5cdFx0XHRcdFx0b2Zmc2V0VG9wLFxuXHRcdFx0XHRcdHBhcmVudE9mZnNldExlZnQgPSAwLFxuXHRcdFx0XHRcdHBhcmVudE9mZnNldFRvcCA9IDAsXG5cdFx0XHRcdFx0dGVtcFBhcmVudE9mZnNldExlZnQgPSAwLFxuXHRcdFx0XHRcdHRlbXBQYXJlbnRPZmZzZXRUb3AgPSAwO1xuXG5cdFx0XHRcdC8vIEVuc3VyZSB0aGlzIGVsZW1lbnQgaXNuJ3QgYWxyZWFkeSBwYXJ0IG9mIGFub3RoZXIgc2Nyb2xsaW5nIGVsZW1lbnRcblx0XHRcdFx0aWYgKCEkdGhpcy5kYXRhKCdzdGVsbGFyLWVsZW1lbnRJc0FjdGl2ZScpKSB7XG5cdFx0XHRcdFx0JHRoaXMuZGF0YSgnc3RlbGxhci1lbGVtZW50SXNBY3RpdmUnLCB0aGlzKTtcblx0XHRcdFx0fSBlbHNlIGlmICgkdGhpcy5kYXRhKCdzdGVsbGFyLWVsZW1lbnRJc0FjdGl2ZScpICE9PSB0aGlzKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0c2VsZi5vcHRpb25zLnNob3dFbGVtZW50KCR0aGlzKTtcblxuXHRcdFx0XHQvLyBTYXZlL3Jlc3RvcmUgdGhlIG9yaWdpbmFsIHRvcCBhbmQgbGVmdCBDU1MgdmFsdWVzIGluIGNhc2Ugd2UgcmVmcmVzaCB0aGUgcGFydGljbGVzIG9yIGRlc3Ryb3kgdGhlIGluc3RhbmNlXG5cdFx0XHRcdGlmICghJHRoaXMuZGF0YSgnc3RlbGxhci1zdGFydGluZ0xlZnQnKSkge1xuXHRcdFx0XHRcdCR0aGlzLmRhdGEoJ3N0ZWxsYXItc3RhcnRpbmdMZWZ0JywgJHRoaXMuY3NzKCdsZWZ0JykpO1xuXHRcdFx0XHRcdCR0aGlzLmRhdGEoJ3N0ZWxsYXItc3RhcnRpbmdUb3AnLCAkdGhpcy5jc3MoJ3RvcCcpKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQkdGhpcy5jc3MoJ2xlZnQnLCAkdGhpcy5kYXRhKCdzdGVsbGFyLXN0YXJ0aW5nTGVmdCcpKTtcblx0XHRcdFx0XHQkdGhpcy5jc3MoJ3RvcCcsICR0aGlzLmRhdGEoJ3N0ZWxsYXItc3RhcnRpbmdUb3AnKSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRwb3NpdGlvbkxlZnQgPSAkdGhpcy5wb3NpdGlvbigpLmxlZnQ7XG5cdFx0XHRcdHBvc2l0aW9uVG9wID0gJHRoaXMucG9zaXRpb24oKS50b3A7XG5cblx0XHRcdFx0Ly8gQ2F0Y2gtYWxsIGZvciBtYXJnaW4gdG9wL2xlZnQgcHJvcGVydGllcyAodGhlc2UgZXZhbHVhdGUgdG8gJ2F1dG8nIGluIElFNyBhbmQgSUU4KVxuXHRcdFx0XHRtYXJnaW5MZWZ0ID0gKCR0aGlzLmNzcygnbWFyZ2luLWxlZnQnKSA9PT0gJ2F1dG8nKSA/IDAgOiBwYXJzZUludCgkdGhpcy5jc3MoJ21hcmdpbi1sZWZ0JyksIDEwKTtcblx0XHRcdFx0bWFyZ2luVG9wID0gKCR0aGlzLmNzcygnbWFyZ2luLXRvcCcpID09PSAnYXV0bycpID8gMCA6IHBhcnNlSW50KCR0aGlzLmNzcygnbWFyZ2luLXRvcCcpLCAxMCk7XG5cblx0XHRcdFx0b2Zmc2V0TGVmdCA9ICR0aGlzLm9mZnNldCgpLmxlZnQgLSBtYXJnaW5MZWZ0O1xuXHRcdFx0XHRvZmZzZXRUb3AgPSAkdGhpcy5vZmZzZXQoKS50b3AgLSBtYXJnaW5Ub3A7XG5cblx0XHRcdFx0Ly8gQ2FsY3VsYXRlIHRoZSBvZmZzZXQgcGFyZW50XG5cdFx0XHRcdCR0aGlzLnBhcmVudHMoKS5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHZhciAkdGhpcyA9ICQodGhpcyk7XG5cblx0XHRcdFx0XHRpZiAoJHRoaXMuZGF0YSgnc3RlbGxhci1vZmZzZXQtcGFyZW50JykgPT09IHRydWUpIHtcblx0XHRcdFx0XHRcdHBhcmVudE9mZnNldExlZnQgPSB0ZW1wUGFyZW50T2Zmc2V0TGVmdDtcblx0XHRcdFx0XHRcdHBhcmVudE9mZnNldFRvcCA9IHRlbXBQYXJlbnRPZmZzZXRUb3A7XG5cdFx0XHRcdFx0XHQkb2Zmc2V0UGFyZW50ID0gJHRoaXM7XG5cblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dGVtcFBhcmVudE9mZnNldExlZnQgKz0gJHRoaXMucG9zaXRpb24oKS5sZWZ0O1xuXHRcdFx0XHRcdFx0dGVtcFBhcmVudE9mZnNldFRvcCArPSAkdGhpcy5wb3NpdGlvbigpLnRvcDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdC8vIERldGVjdCB0aGUgb2Zmc2V0c1xuXHRcdFx0XHRob3Jpem9udGFsT2Zmc2V0ID0gKCR0aGlzLmRhdGEoJ3N0ZWxsYXItaG9yaXpvbnRhbC1vZmZzZXQnKSAhPT0gdW5kZWZpbmVkID8gJHRoaXMuZGF0YSgnc3RlbGxhci1ob3Jpem9udGFsLW9mZnNldCcpIDogKCRvZmZzZXRQYXJlbnQgIT09IHVuZGVmaW5lZCAmJiAkb2Zmc2V0UGFyZW50LmRhdGEoJ3N0ZWxsYXItaG9yaXpvbnRhbC1vZmZzZXQnKSAhPT0gdW5kZWZpbmVkID8gJG9mZnNldFBhcmVudC5kYXRhKCdzdGVsbGFyLWhvcml6b250YWwtb2Zmc2V0JykgOiBzZWxmLmhvcml6b250YWxPZmZzZXQpKTtcblx0XHRcdFx0dmVydGljYWxPZmZzZXQgPSAoJHRoaXMuZGF0YSgnc3RlbGxhci12ZXJ0aWNhbC1vZmZzZXQnKSAhPT0gdW5kZWZpbmVkID8gJHRoaXMuZGF0YSgnc3RlbGxhci12ZXJ0aWNhbC1vZmZzZXQnKSA6ICgkb2Zmc2V0UGFyZW50ICE9PSB1bmRlZmluZWQgJiYgJG9mZnNldFBhcmVudC5kYXRhKCdzdGVsbGFyLXZlcnRpY2FsLW9mZnNldCcpICE9PSB1bmRlZmluZWQgPyAkb2Zmc2V0UGFyZW50LmRhdGEoJ3N0ZWxsYXItdmVydGljYWwtb2Zmc2V0JykgOiBzZWxmLnZlcnRpY2FsT2Zmc2V0KSk7XG5cblx0XHRcdFx0Ly8gQWRkIG91ciBvYmplY3QgdG8gdGhlIHBhcnRpY2xlcyBjb2xsZWN0aW9uXG5cdFx0XHRcdHNlbGYucGFydGljbGVzLnB1c2goe1xuXHRcdFx0XHRcdCRlbGVtZW50OiAkdGhpcyxcblx0XHRcdFx0XHQkb2Zmc2V0UGFyZW50OiAkb2Zmc2V0UGFyZW50LFxuXHRcdFx0XHRcdGlzRml4ZWQ6ICR0aGlzLmNzcygncG9zaXRpb24nKSA9PT0gJ2ZpeGVkJyxcblx0XHRcdFx0XHRob3Jpem9udGFsT2Zmc2V0OiBob3Jpem9udGFsT2Zmc2V0LFxuXHRcdFx0XHRcdHZlcnRpY2FsT2Zmc2V0OiB2ZXJ0aWNhbE9mZnNldCxcblx0XHRcdFx0XHRzdGFydGluZ1Bvc2l0aW9uTGVmdDogcG9zaXRpb25MZWZ0LFxuXHRcdFx0XHRcdHN0YXJ0aW5nUG9zaXRpb25Ub3A6IHBvc2l0aW9uVG9wLFxuXHRcdFx0XHRcdHN0YXJ0aW5nT2Zmc2V0TGVmdDogb2Zmc2V0TGVmdCxcblx0XHRcdFx0XHRzdGFydGluZ09mZnNldFRvcDogb2Zmc2V0VG9wLFxuXHRcdFx0XHRcdHBhcmVudE9mZnNldExlZnQ6IHBhcmVudE9mZnNldExlZnQsXG5cdFx0XHRcdFx0cGFyZW50T2Zmc2V0VG9wOiBwYXJlbnRPZmZzZXRUb3AsXG5cdFx0XHRcdFx0c3RlbGxhclJhdGlvOiAoJHRoaXMuZGF0YSgnc3RlbGxhci1yYXRpbycpICE9PSB1bmRlZmluZWQgPyAkdGhpcy5kYXRhKCdzdGVsbGFyLXJhdGlvJykgOiAxKSxcblx0XHRcdFx0XHR3aWR0aDogJHRoaXMub3V0ZXJXaWR0aCh0cnVlKSxcblx0XHRcdFx0XHRoZWlnaHQ6ICR0aGlzLm91dGVySGVpZ2h0KHRydWUpLFxuXHRcdFx0XHRcdGlzSGlkZGVuOiBmYWxzZVxuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0X2ZpbmRCYWNrZ3JvdW5kczogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgc2VsZiA9IHRoaXMsXG5cdFx0XHRcdHNjcm9sbExlZnQgPSB0aGlzLl9nZXRTY3JvbGxMZWZ0KCksXG5cdFx0XHRcdHNjcm9sbFRvcCA9IHRoaXMuX2dldFNjcm9sbFRvcCgpLFxuXHRcdFx0XHQkYmFja2dyb3VuZEVsZW1lbnRzO1xuXG5cdFx0XHR0aGlzLmJhY2tncm91bmRzID0gW107XG5cblx0XHRcdGlmICghdGhpcy5vcHRpb25zLnBhcmFsbGF4QmFja2dyb3VuZHMpIHJldHVybjtcblxuXHRcdFx0JGJhY2tncm91bmRFbGVtZW50cyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnW2RhdGEtc3RlbGxhci1iYWNrZ3JvdW5kLXJhdGlvXScpO1xuXG5cdFx0XHRpZiAodGhpcy4kZWxlbWVudC5kYXRhKCdzdGVsbGFyLWJhY2tncm91bmQtcmF0aW8nKSkge1xuICAgICAgICAgICAgICAgICRiYWNrZ3JvdW5kRWxlbWVudHMgPSAkYmFja2dyb3VuZEVsZW1lbnRzLmFkZCh0aGlzLiRlbGVtZW50KTtcblx0XHRcdH1cblxuXHRcdFx0JGJhY2tncm91bmRFbGVtZW50cy5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgJHRoaXMgPSAkKHRoaXMpLFxuXHRcdFx0XHRcdGJhY2tncm91bmRQb3NpdGlvbiA9IGdldEJhY2tncm91bmRQb3NpdGlvbigkdGhpcyksXG5cdFx0XHRcdFx0aG9yaXpvbnRhbE9mZnNldCxcblx0XHRcdFx0XHR2ZXJ0aWNhbE9mZnNldCxcblx0XHRcdFx0XHRwb3NpdGlvbkxlZnQsXG5cdFx0XHRcdFx0cG9zaXRpb25Ub3AsXG5cdFx0XHRcdFx0bWFyZ2luTGVmdCxcblx0XHRcdFx0XHRtYXJnaW5Ub3AsXG5cdFx0XHRcdFx0b2Zmc2V0TGVmdCxcblx0XHRcdFx0XHRvZmZzZXRUb3AsXG5cdFx0XHRcdFx0JG9mZnNldFBhcmVudCxcblx0XHRcdFx0XHRwYXJlbnRPZmZzZXRMZWZ0ID0gMCxcblx0XHRcdFx0XHRwYXJlbnRPZmZzZXRUb3AgPSAwLFxuXHRcdFx0XHRcdHRlbXBQYXJlbnRPZmZzZXRMZWZ0ID0gMCxcblx0XHRcdFx0XHR0ZW1wUGFyZW50T2Zmc2V0VG9wID0gMDtcblxuXHRcdFx0XHQvLyBFbnN1cmUgdGhpcyBlbGVtZW50IGlzbid0IGFscmVhZHkgcGFydCBvZiBhbm90aGVyIHNjcm9sbGluZyBlbGVtZW50XG5cdFx0XHRcdGlmICghJHRoaXMuZGF0YSgnc3RlbGxhci1iYWNrZ3JvdW5kSXNBY3RpdmUnKSkge1xuXHRcdFx0XHRcdCR0aGlzLmRhdGEoJ3N0ZWxsYXItYmFja2dyb3VuZElzQWN0aXZlJywgdGhpcyk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoJHRoaXMuZGF0YSgnc3RlbGxhci1iYWNrZ3JvdW5kSXNBY3RpdmUnKSAhPT0gdGhpcykge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFNhdmUvcmVzdG9yZSB0aGUgb3JpZ2luYWwgdG9wIGFuZCBsZWZ0IENTUyB2YWx1ZXMgaW4gY2FzZSB3ZSBkZXN0cm95IHRoZSBpbnN0YW5jZVxuXHRcdFx0XHRpZiAoISR0aGlzLmRhdGEoJ3N0ZWxsYXItYmFja2dyb3VuZFN0YXJ0aW5nTGVmdCcpKSB7XG5cdFx0XHRcdFx0JHRoaXMuZGF0YSgnc3RlbGxhci1iYWNrZ3JvdW5kU3RhcnRpbmdMZWZ0JywgYmFja2dyb3VuZFBvc2l0aW9uWzBdKTtcblx0XHRcdFx0XHQkdGhpcy5kYXRhKCdzdGVsbGFyLWJhY2tncm91bmRTdGFydGluZ1RvcCcsIGJhY2tncm91bmRQb3NpdGlvblsxXSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c2V0QmFja2dyb3VuZFBvc2l0aW9uKCR0aGlzLCAkdGhpcy5kYXRhKCdzdGVsbGFyLWJhY2tncm91bmRTdGFydGluZ0xlZnQnKSwgJHRoaXMuZGF0YSgnc3RlbGxhci1iYWNrZ3JvdW5kU3RhcnRpbmdUb3AnKSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBDYXRjaC1hbGwgZm9yIG1hcmdpbiB0b3AvbGVmdCBwcm9wZXJ0aWVzICh0aGVzZSBldmFsdWF0ZSB0byAnYXV0bycgaW4gSUU3IGFuZCBJRTgpXG5cdFx0XHRcdG1hcmdpbkxlZnQgPSAoJHRoaXMuY3NzKCdtYXJnaW4tbGVmdCcpID09PSAnYXV0bycpID8gMCA6IHBhcnNlSW50KCR0aGlzLmNzcygnbWFyZ2luLWxlZnQnKSwgMTApO1xuXHRcdFx0XHRtYXJnaW5Ub3AgPSAoJHRoaXMuY3NzKCdtYXJnaW4tdG9wJykgPT09ICdhdXRvJykgPyAwIDogcGFyc2VJbnQoJHRoaXMuY3NzKCdtYXJnaW4tdG9wJyksIDEwKTtcblxuXHRcdFx0XHRvZmZzZXRMZWZ0ID0gJHRoaXMub2Zmc2V0KCkubGVmdCAtIG1hcmdpbkxlZnQgLSBzY3JvbGxMZWZ0O1xuXHRcdFx0XHRvZmZzZXRUb3AgPSAkdGhpcy5vZmZzZXQoKS50b3AgLSBtYXJnaW5Ub3AgLSBzY3JvbGxUb3A7XG5cdFx0XHRcdFxuXHRcdFx0XHQvLyBDYWxjdWxhdGUgdGhlIG9mZnNldCBwYXJlbnRcblx0XHRcdFx0JHRoaXMucGFyZW50cygpLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dmFyICR0aGlzID0gJCh0aGlzKTtcblxuXHRcdFx0XHRcdGlmICgkdGhpcy5kYXRhKCdzdGVsbGFyLW9mZnNldC1wYXJlbnQnKSA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRcdFx0cGFyZW50T2Zmc2V0TGVmdCA9IHRlbXBQYXJlbnRPZmZzZXRMZWZ0O1xuXHRcdFx0XHRcdFx0cGFyZW50T2Zmc2V0VG9wID0gdGVtcFBhcmVudE9mZnNldFRvcDtcblx0XHRcdFx0XHRcdCRvZmZzZXRQYXJlbnQgPSAkdGhpcztcblxuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0ZW1wUGFyZW50T2Zmc2V0TGVmdCArPSAkdGhpcy5wb3NpdGlvbigpLmxlZnQ7XG5cdFx0XHRcdFx0XHR0ZW1wUGFyZW50T2Zmc2V0VG9wICs9ICR0aGlzLnBvc2l0aW9uKCkudG9wO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0Ly8gRGV0ZWN0IHRoZSBvZmZzZXRzXG5cdFx0XHRcdGhvcml6b250YWxPZmZzZXQgPSAoJHRoaXMuZGF0YSgnc3RlbGxhci1ob3Jpem9udGFsLW9mZnNldCcpICE9PSB1bmRlZmluZWQgPyAkdGhpcy5kYXRhKCdzdGVsbGFyLWhvcml6b250YWwtb2Zmc2V0JykgOiAoJG9mZnNldFBhcmVudCAhPT0gdW5kZWZpbmVkICYmICRvZmZzZXRQYXJlbnQuZGF0YSgnc3RlbGxhci1ob3Jpem9udGFsLW9mZnNldCcpICE9PSB1bmRlZmluZWQgPyAkb2Zmc2V0UGFyZW50LmRhdGEoJ3N0ZWxsYXItaG9yaXpvbnRhbC1vZmZzZXQnKSA6IHNlbGYuaG9yaXpvbnRhbE9mZnNldCkpO1xuXHRcdFx0XHR2ZXJ0aWNhbE9mZnNldCA9ICgkdGhpcy5kYXRhKCdzdGVsbGFyLXZlcnRpY2FsLW9mZnNldCcpICE9PSB1bmRlZmluZWQgPyAkdGhpcy5kYXRhKCdzdGVsbGFyLXZlcnRpY2FsLW9mZnNldCcpIDogKCRvZmZzZXRQYXJlbnQgIT09IHVuZGVmaW5lZCAmJiAkb2Zmc2V0UGFyZW50LmRhdGEoJ3N0ZWxsYXItdmVydGljYWwtb2Zmc2V0JykgIT09IHVuZGVmaW5lZCA/ICRvZmZzZXRQYXJlbnQuZGF0YSgnc3RlbGxhci12ZXJ0aWNhbC1vZmZzZXQnKSA6IHNlbGYudmVydGljYWxPZmZzZXQpKTtcblxuXHRcdFx0XHRzZWxmLmJhY2tncm91bmRzLnB1c2goe1xuXHRcdFx0XHRcdCRlbGVtZW50OiAkdGhpcyxcblx0XHRcdFx0XHQkb2Zmc2V0UGFyZW50OiAkb2Zmc2V0UGFyZW50LFxuXHRcdFx0XHRcdGlzRml4ZWQ6ICR0aGlzLmNzcygnYmFja2dyb3VuZC1hdHRhY2htZW50JykgPT09ICdmaXhlZCcsXG5cdFx0XHRcdFx0aG9yaXpvbnRhbE9mZnNldDogaG9yaXpvbnRhbE9mZnNldCxcblx0XHRcdFx0XHR2ZXJ0aWNhbE9mZnNldDogdmVydGljYWxPZmZzZXQsXG5cdFx0XHRcdFx0c3RhcnRpbmdWYWx1ZUxlZnQ6IGJhY2tncm91bmRQb3NpdGlvblswXSxcblx0XHRcdFx0XHRzdGFydGluZ1ZhbHVlVG9wOiBiYWNrZ3JvdW5kUG9zaXRpb25bMV0sXG5cdFx0XHRcdFx0c3RhcnRpbmdCYWNrZ3JvdW5kUG9zaXRpb25MZWZ0OiAoaXNOYU4ocGFyc2VJbnQoYmFja2dyb3VuZFBvc2l0aW9uWzBdLCAxMCkpID8gMCA6IHBhcnNlSW50KGJhY2tncm91bmRQb3NpdGlvblswXSwgMTApKSxcblx0XHRcdFx0XHRzdGFydGluZ0JhY2tncm91bmRQb3NpdGlvblRvcDogKGlzTmFOKHBhcnNlSW50KGJhY2tncm91bmRQb3NpdGlvblsxXSwgMTApKSA/IDAgOiBwYXJzZUludChiYWNrZ3JvdW5kUG9zaXRpb25bMV0sIDEwKSksXG5cdFx0XHRcdFx0c3RhcnRpbmdQb3NpdGlvbkxlZnQ6ICR0aGlzLnBvc2l0aW9uKCkubGVmdCxcblx0XHRcdFx0XHRzdGFydGluZ1Bvc2l0aW9uVG9wOiAkdGhpcy5wb3NpdGlvbigpLnRvcCxcblx0XHRcdFx0XHRzdGFydGluZ09mZnNldExlZnQ6IG9mZnNldExlZnQsXG5cdFx0XHRcdFx0c3RhcnRpbmdPZmZzZXRUb3A6IG9mZnNldFRvcCxcblx0XHRcdFx0XHRwYXJlbnRPZmZzZXRMZWZ0OiBwYXJlbnRPZmZzZXRMZWZ0LFxuXHRcdFx0XHRcdHBhcmVudE9mZnNldFRvcDogcGFyZW50T2Zmc2V0VG9wLFxuXHRcdFx0XHRcdHN0ZWxsYXJSYXRpbzogKCR0aGlzLmRhdGEoJ3N0ZWxsYXItYmFja2dyb3VuZC1yYXRpbycpID09PSB1bmRlZmluZWQgPyAxIDogJHRoaXMuZGF0YSgnc3RlbGxhci1iYWNrZ3JvdW5kLXJhdGlvJykpXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHRfcmVzZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHBhcnRpY2xlLFxuXHRcdFx0XHRzdGFydGluZ1Bvc2l0aW9uTGVmdCxcblx0XHRcdFx0c3RhcnRpbmdQb3NpdGlvblRvcCxcblx0XHRcdFx0YmFja2dyb3VuZCxcblx0XHRcdFx0aTtcblxuXHRcdFx0Zm9yIChpID0gdGhpcy5wYXJ0aWNsZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcblx0XHRcdFx0cGFydGljbGUgPSB0aGlzLnBhcnRpY2xlc1tpXTtcblx0XHRcdFx0c3RhcnRpbmdQb3NpdGlvbkxlZnQgPSBwYXJ0aWNsZS4kZWxlbWVudC5kYXRhKCdzdGVsbGFyLXN0YXJ0aW5nTGVmdCcpO1xuXHRcdFx0XHRzdGFydGluZ1Bvc2l0aW9uVG9wID0gcGFydGljbGUuJGVsZW1lbnQuZGF0YSgnc3RlbGxhci1zdGFydGluZ1RvcCcpO1xuXG5cdFx0XHRcdHRoaXMuX3NldFBvc2l0aW9uKHBhcnRpY2xlLiRlbGVtZW50LCBzdGFydGluZ1Bvc2l0aW9uTGVmdCwgc3RhcnRpbmdQb3NpdGlvbkxlZnQsIHN0YXJ0aW5nUG9zaXRpb25Ub3AsIHN0YXJ0aW5nUG9zaXRpb25Ub3ApO1xuXG5cdFx0XHRcdHRoaXMub3B0aW9ucy5zaG93RWxlbWVudChwYXJ0aWNsZS4kZWxlbWVudCk7XG5cblx0XHRcdFx0cGFydGljbGUuJGVsZW1lbnQuZGF0YSgnc3RlbGxhci1zdGFydGluZ0xlZnQnLCBudWxsKS5kYXRhKCdzdGVsbGFyLWVsZW1lbnRJc0FjdGl2ZScsIG51bGwpLmRhdGEoJ3N0ZWxsYXItYmFja2dyb3VuZElzQWN0aXZlJywgbnVsbCk7XG5cdFx0XHR9XG5cblx0XHRcdGZvciAoaSA9IHRoaXMuYmFja2dyb3VuZHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcblx0XHRcdFx0YmFja2dyb3VuZCA9IHRoaXMuYmFja2dyb3VuZHNbaV07XG5cblx0XHRcdFx0YmFja2dyb3VuZC4kZWxlbWVudC5kYXRhKCdzdGVsbGFyLWJhY2tncm91bmRTdGFydGluZ0xlZnQnLCBudWxsKS5kYXRhKCdzdGVsbGFyLWJhY2tncm91bmRTdGFydGluZ1RvcCcsIG51bGwpO1xuXG5cdFx0XHRcdHNldEJhY2tncm91bmRQb3NpdGlvbihiYWNrZ3JvdW5kLiRlbGVtZW50LCBiYWNrZ3JvdW5kLnN0YXJ0aW5nVmFsdWVMZWZ0LCBiYWNrZ3JvdW5kLnN0YXJ0aW5nVmFsdWVUb3ApO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0ZGVzdHJveTogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLl9yZXNldCgpO1xuXG5cdFx0XHR0aGlzLiRzY3JvbGxFbGVtZW50LnVuYmluZCgncmVzaXplLicgKyB0aGlzLm5hbWUpLnVuYmluZCgnc2Nyb2xsLicgKyB0aGlzLm5hbWUpO1xuXHRcdFx0dGhpcy5fYW5pbWF0aW9uTG9vcCA9ICQubm9vcDtcblxuXHRcdFx0JCh3aW5kb3cpLnVuYmluZCgnbG9hZC4nICsgdGhpcy5uYW1lKS51bmJpbmQoJ3Jlc2l6ZS4nICsgdGhpcy5uYW1lKTtcblx0XHR9LFxuXHRcdF9zZXRPZmZzZXRzOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBzZWxmID0gdGhpcyxcblx0XHRcdFx0JHdpbmRvdyA9ICQod2luZG93KTtcblxuXHRcdFx0JHdpbmRvdy51bmJpbmQoJ3Jlc2l6ZS5ob3Jpem9udGFsLScgKyB0aGlzLm5hbWUpLnVuYmluZCgncmVzaXplLnZlcnRpY2FsLScgKyB0aGlzLm5hbWUpO1xuXG5cdFx0XHRpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5ob3Jpem9udGFsT2Zmc2V0ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdHRoaXMuaG9yaXpvbnRhbE9mZnNldCA9IHRoaXMub3B0aW9ucy5ob3Jpem9udGFsT2Zmc2V0KCk7XG5cdFx0XHRcdCR3aW5kb3cuYmluZCgncmVzaXplLmhvcml6b250YWwtJyArIHRoaXMubmFtZSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0c2VsZi5ob3Jpem9udGFsT2Zmc2V0ID0gc2VsZi5vcHRpb25zLmhvcml6b250YWxPZmZzZXQoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLmhvcml6b250YWxPZmZzZXQgPSB0aGlzLm9wdGlvbnMuaG9yaXpvbnRhbE9mZnNldDtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMudmVydGljYWxPZmZzZXQgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0dGhpcy52ZXJ0aWNhbE9mZnNldCA9IHRoaXMub3B0aW9ucy52ZXJ0aWNhbE9mZnNldCgpO1xuXHRcdFx0XHQkd2luZG93LmJpbmQoJ3Jlc2l6ZS52ZXJ0aWNhbC0nICsgdGhpcy5uYW1lLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRzZWxmLnZlcnRpY2FsT2Zmc2V0ID0gc2VsZi5vcHRpb25zLnZlcnRpY2FsT2Zmc2V0KCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy52ZXJ0aWNhbE9mZnNldCA9IHRoaXMub3B0aW9ucy52ZXJ0aWNhbE9mZnNldDtcblx0XHRcdH1cblx0XHR9LFxuXHRcdF9yZXBvc2l0aW9uRWxlbWVudHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHNjcm9sbExlZnQgPSB0aGlzLl9nZXRTY3JvbGxMZWZ0KCksXG5cdFx0XHRcdHNjcm9sbFRvcCA9IHRoaXMuX2dldFNjcm9sbFRvcCgpLFxuXHRcdFx0XHRob3Jpem9udGFsT2Zmc2V0LFxuXHRcdFx0XHR2ZXJ0aWNhbE9mZnNldCxcblx0XHRcdFx0cGFydGljbGUsXG5cdFx0XHRcdGZpeGVkUmF0aW9PZmZzZXQsXG5cdFx0XHRcdGJhY2tncm91bmQsXG5cdFx0XHRcdGJnTGVmdCxcblx0XHRcdFx0YmdUb3AsXG5cdFx0XHRcdGlzVmlzaWJsZVZlcnRpY2FsID0gdHJ1ZSxcblx0XHRcdFx0aXNWaXNpYmxlSG9yaXpvbnRhbCA9IHRydWUsXG5cdFx0XHRcdG5ld1Bvc2l0aW9uTGVmdCxcblx0XHRcdFx0bmV3UG9zaXRpb25Ub3AsXG5cdFx0XHRcdG5ld09mZnNldExlZnQsXG5cdFx0XHRcdG5ld09mZnNldFRvcCxcblx0XHRcdFx0aTtcblxuXHRcdFx0Ly8gRmlyc3QgY2hlY2sgdGhhdCB0aGUgc2Nyb2xsIHBvc2l0aW9uIG9yIGNvbnRhaW5lciBzaXplIGhhcyBjaGFuZ2VkXG5cdFx0XHRpZiAodGhpcy5jdXJyZW50U2Nyb2xsTGVmdCA9PT0gc2Nyb2xsTGVmdCAmJiB0aGlzLmN1cnJlbnRTY3JvbGxUb3AgPT09IHNjcm9sbFRvcCAmJiB0aGlzLmN1cnJlbnRXaWR0aCA9PT0gdGhpcy52aWV3cG9ydFdpZHRoICYmIHRoaXMuY3VycmVudEhlaWdodCA9PT0gdGhpcy52aWV3cG9ydEhlaWdodCkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLmN1cnJlbnRTY3JvbGxMZWZ0ID0gc2Nyb2xsTGVmdDtcblx0XHRcdFx0dGhpcy5jdXJyZW50U2Nyb2xsVG9wID0gc2Nyb2xsVG9wO1xuXHRcdFx0XHR0aGlzLmN1cnJlbnRXaWR0aCA9IHRoaXMudmlld3BvcnRXaWR0aDtcblx0XHRcdFx0dGhpcy5jdXJyZW50SGVpZ2h0ID0gdGhpcy52aWV3cG9ydEhlaWdodDtcblx0XHRcdH1cblxuXHRcdFx0Ly8gUmVwb3NpdGlvbiBlbGVtZW50c1xuXHRcdFx0Zm9yIChpID0gdGhpcy5wYXJ0aWNsZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcblx0XHRcdFx0cGFydGljbGUgPSB0aGlzLnBhcnRpY2xlc1tpXTtcblxuXHRcdFx0XHRmaXhlZFJhdGlvT2Zmc2V0ID0gKHBhcnRpY2xlLmlzRml4ZWQgPyAxIDogMCk7XG5cblx0XHRcdFx0Ly8gQ2FsY3VsYXRlIHBvc2l0aW9uLCB0aGVuIGNhbGN1bGF0ZSB3aGF0IHRoZSBwYXJ0aWNsZSdzIG5ldyBvZmZzZXQgd2lsbCBiZSAoZm9yIHZpc2liaWxpdHkgY2hlY2spXG5cdFx0XHRcdGlmICh0aGlzLm9wdGlvbnMuaG9yaXpvbnRhbFNjcm9sbGluZykge1xuXHRcdFx0XHRcdG5ld1Bvc2l0aW9uTGVmdCA9IChzY3JvbGxMZWZ0ICsgcGFydGljbGUuaG9yaXpvbnRhbE9mZnNldCArIHRoaXMudmlld3BvcnRPZmZzZXRMZWZ0ICsgcGFydGljbGUuc3RhcnRpbmdQb3NpdGlvbkxlZnQgLSBwYXJ0aWNsZS5zdGFydGluZ09mZnNldExlZnQgKyBwYXJ0aWNsZS5wYXJlbnRPZmZzZXRMZWZ0KSAqIC0ocGFydGljbGUuc3RlbGxhclJhdGlvICsgZml4ZWRSYXRpb09mZnNldCAtIDEpICsgcGFydGljbGUuc3RhcnRpbmdQb3NpdGlvbkxlZnQ7XG5cdFx0XHRcdFx0bmV3T2Zmc2V0TGVmdCA9IG5ld1Bvc2l0aW9uTGVmdCAtIHBhcnRpY2xlLnN0YXJ0aW5nUG9zaXRpb25MZWZ0ICsgcGFydGljbGUuc3RhcnRpbmdPZmZzZXRMZWZ0O1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG5ld1Bvc2l0aW9uTGVmdCA9IHBhcnRpY2xlLnN0YXJ0aW5nUG9zaXRpb25MZWZ0O1xuXHRcdFx0XHRcdG5ld09mZnNldExlZnQgPSBwYXJ0aWNsZS5zdGFydGluZ09mZnNldExlZnQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAodGhpcy5vcHRpb25zLnZlcnRpY2FsU2Nyb2xsaW5nKSB7XG5cdFx0XHRcdFx0bmV3UG9zaXRpb25Ub3AgPSAoc2Nyb2xsVG9wICsgcGFydGljbGUudmVydGljYWxPZmZzZXQgKyB0aGlzLnZpZXdwb3J0T2Zmc2V0VG9wICsgcGFydGljbGUuc3RhcnRpbmdQb3NpdGlvblRvcCAtIHBhcnRpY2xlLnN0YXJ0aW5nT2Zmc2V0VG9wICsgcGFydGljbGUucGFyZW50T2Zmc2V0VG9wKSAqIC0ocGFydGljbGUuc3RlbGxhclJhdGlvICsgZml4ZWRSYXRpb09mZnNldCAtIDEpICsgcGFydGljbGUuc3RhcnRpbmdQb3NpdGlvblRvcDtcblx0XHRcdFx0XHRuZXdPZmZzZXRUb3AgPSBuZXdQb3NpdGlvblRvcCAtIHBhcnRpY2xlLnN0YXJ0aW5nUG9zaXRpb25Ub3AgKyBwYXJ0aWNsZS5zdGFydGluZ09mZnNldFRvcDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRuZXdQb3NpdGlvblRvcCA9IHBhcnRpY2xlLnN0YXJ0aW5nUG9zaXRpb25Ub3A7XG5cdFx0XHRcdFx0bmV3T2Zmc2V0VG9wID0gcGFydGljbGUuc3RhcnRpbmdPZmZzZXRUb3A7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBDaGVjayB2aXNpYmlsaXR5XG5cdFx0XHRcdGlmICh0aGlzLm9wdGlvbnMuaGlkZURpc3RhbnRFbGVtZW50cykge1xuXHRcdFx0XHRcdGlzVmlzaWJsZUhvcml6b250YWwgPSAhdGhpcy5vcHRpb25zLmhvcml6b250YWxTY3JvbGxpbmcgfHwgbmV3T2Zmc2V0TGVmdCArIHBhcnRpY2xlLndpZHRoID4gKHBhcnRpY2xlLmlzRml4ZWQgPyAwIDogc2Nyb2xsTGVmdCkgJiYgbmV3T2Zmc2V0TGVmdCA8IChwYXJ0aWNsZS5pc0ZpeGVkID8gMCA6IHNjcm9sbExlZnQpICsgdGhpcy52aWV3cG9ydFdpZHRoICsgdGhpcy52aWV3cG9ydE9mZnNldExlZnQ7XG5cdFx0XHRcdFx0aXNWaXNpYmxlVmVydGljYWwgPSAhdGhpcy5vcHRpb25zLnZlcnRpY2FsU2Nyb2xsaW5nIHx8IG5ld09mZnNldFRvcCArIHBhcnRpY2xlLmhlaWdodCA+IChwYXJ0aWNsZS5pc0ZpeGVkID8gMCA6IHNjcm9sbFRvcCkgJiYgbmV3T2Zmc2V0VG9wIDwgKHBhcnRpY2xlLmlzRml4ZWQgPyAwIDogc2Nyb2xsVG9wKSArIHRoaXMudmlld3BvcnRIZWlnaHQgKyB0aGlzLnZpZXdwb3J0T2Zmc2V0VG9wO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGlzVmlzaWJsZUhvcml6b250YWwgJiYgaXNWaXNpYmxlVmVydGljYWwpIHtcblx0XHRcdFx0XHRpZiAocGFydGljbGUuaXNIaWRkZW4pIHtcblx0XHRcdFx0XHRcdHRoaXMub3B0aW9ucy5zaG93RWxlbWVudChwYXJ0aWNsZS4kZWxlbWVudCk7XG5cdFx0XHRcdFx0XHRwYXJ0aWNsZS5pc0hpZGRlbiA9IGZhbHNlO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHRoaXMuX3NldFBvc2l0aW9uKHBhcnRpY2xlLiRlbGVtZW50LCBuZXdQb3NpdGlvbkxlZnQsIHBhcnRpY2xlLnN0YXJ0aW5nUG9zaXRpb25MZWZ0LCBuZXdQb3NpdGlvblRvcCwgcGFydGljbGUuc3RhcnRpbmdQb3NpdGlvblRvcCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0aWYgKCFwYXJ0aWNsZS5pc0hpZGRlbikge1xuXHRcdFx0XHRcdFx0dGhpcy5vcHRpb25zLmhpZGVFbGVtZW50KHBhcnRpY2xlLiRlbGVtZW50KTtcblx0XHRcdFx0XHRcdHBhcnRpY2xlLmlzSGlkZGVuID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gUmVwb3NpdGlvbiBiYWNrZ3JvdW5kc1xuXHRcdFx0Zm9yIChpID0gdGhpcy5iYWNrZ3JvdW5kcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuXHRcdFx0XHRiYWNrZ3JvdW5kID0gdGhpcy5iYWNrZ3JvdW5kc1tpXTtcblxuXHRcdFx0XHRmaXhlZFJhdGlvT2Zmc2V0ID0gKGJhY2tncm91bmQuaXNGaXhlZCA/IDAgOiAxKTtcblx0XHRcdFx0YmdMZWZ0ID0gKHRoaXMub3B0aW9ucy5ob3Jpem9udGFsU2Nyb2xsaW5nID8gKHNjcm9sbExlZnQgKyBiYWNrZ3JvdW5kLmhvcml6b250YWxPZmZzZXQgLSB0aGlzLnZpZXdwb3J0T2Zmc2V0TGVmdCAtIGJhY2tncm91bmQuc3RhcnRpbmdPZmZzZXRMZWZ0ICsgYmFja2dyb3VuZC5wYXJlbnRPZmZzZXRMZWZ0IC0gYmFja2dyb3VuZC5zdGFydGluZ0JhY2tncm91bmRQb3NpdGlvbkxlZnQpICogKGZpeGVkUmF0aW9PZmZzZXQgLSBiYWNrZ3JvdW5kLnN0ZWxsYXJSYXRpbykgKyAncHgnIDogYmFja2dyb3VuZC5zdGFydGluZ1ZhbHVlTGVmdCk7XG5cdFx0XHRcdGJnVG9wID0gKHRoaXMub3B0aW9ucy52ZXJ0aWNhbFNjcm9sbGluZyA/IChzY3JvbGxUb3AgKyBiYWNrZ3JvdW5kLnZlcnRpY2FsT2Zmc2V0IC0gdGhpcy52aWV3cG9ydE9mZnNldFRvcCAtIGJhY2tncm91bmQuc3RhcnRpbmdPZmZzZXRUb3AgKyBiYWNrZ3JvdW5kLnBhcmVudE9mZnNldFRvcCAtIGJhY2tncm91bmQuc3RhcnRpbmdCYWNrZ3JvdW5kUG9zaXRpb25Ub3ApICogKGZpeGVkUmF0aW9PZmZzZXQgLSBiYWNrZ3JvdW5kLnN0ZWxsYXJSYXRpbykgKyAncHgnIDogYmFja2dyb3VuZC5zdGFydGluZ1ZhbHVlVG9wKTtcblxuXHRcdFx0XHRzZXRCYWNrZ3JvdW5kUG9zaXRpb24oYmFja2dyb3VuZC4kZWxlbWVudCwgYmdMZWZ0LCBiZ1RvcCk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRfaGFuZGxlU2Nyb2xsRXZlbnQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHNlbGYgPSB0aGlzLFxuXHRcdFx0XHR0aWNraW5nID0gZmFsc2U7XG5cblx0XHRcdHZhciB1cGRhdGUgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0c2VsZi5fcmVwb3NpdGlvbkVsZW1lbnRzKCk7XG5cdFx0XHRcdHRpY2tpbmcgPSBmYWxzZTtcblx0XHRcdH07XG5cblx0XHRcdHZhciByZXF1ZXN0VGljayA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZiAoIXRpY2tpbmcpIHtcblx0XHRcdFx0XHRyZXF1ZXN0QW5pbUZyYW1lKHVwZGF0ZSk7XG5cdFx0XHRcdFx0dGlja2luZyA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHRcblx0XHRcdHRoaXMuJHNjcm9sbEVsZW1lbnQuYmluZCgnc2Nyb2xsLicgKyB0aGlzLm5hbWUsIHJlcXVlc3RUaWNrKTtcblx0XHRcdHJlcXVlc3RUaWNrKCk7XG5cdFx0fSxcblx0XHRfc3RhcnRBbmltYXRpb25Mb29wOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBzZWxmID0gdGhpcztcblxuXHRcdFx0dGhpcy5fYW5pbWF0aW9uTG9vcCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXF1ZXN0QW5pbUZyYW1lKHNlbGYuX2FuaW1hdGlvbkxvb3ApO1xuXHRcdFx0XHRzZWxmLl9yZXBvc2l0aW9uRWxlbWVudHMoKTtcblx0XHRcdH07XG5cdFx0XHR0aGlzLl9hbmltYXRpb25Mb29wKCk7XG5cdFx0fVxuXHR9O1xuXG5cdCQuZm5bcGx1Z2luTmFtZV0gPSBmdW5jdGlvbiAob3B0aW9ucykge1xuXHRcdHZhciBhcmdzID0gYXJndW1lbnRzO1xuXHRcdGlmIChvcHRpb25zID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIG9wdGlvbnMgPT09ICdvYmplY3QnKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0aWYgKCEkLmRhdGEodGhpcywgJ3BsdWdpbl8nICsgcGx1Z2luTmFtZSkpIHtcblx0XHRcdFx0XHQkLmRhdGEodGhpcywgJ3BsdWdpbl8nICsgcGx1Z2luTmFtZSwgbmV3IFBsdWdpbih0aGlzLCBvcHRpb25zKSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0gZWxzZSBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdzdHJpbmcnICYmIG9wdGlvbnNbMF0gIT09ICdfJyAmJiBvcHRpb25zICE9PSAnaW5pdCcpIHtcblx0XHRcdHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuXHRcdFx0XHR2YXIgaW5zdGFuY2UgPSAkLmRhdGEodGhpcywgJ3BsdWdpbl8nICsgcGx1Z2luTmFtZSk7XG5cdFx0XHRcdGlmIChpbnN0YW5jZSBpbnN0YW5jZW9mIFBsdWdpbiAmJiB0eXBlb2YgaW5zdGFuY2Vbb3B0aW9uc10gPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRpbnN0YW5jZVtvcHRpb25zXS5hcHBseShpbnN0YW5jZSwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJncywgMSkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChvcHRpb25zID09PSAnZGVzdHJveScpIHtcblx0XHRcdFx0XHQkLmRhdGEodGhpcywgJ3BsdWdpbl8nICsgcGx1Z2luTmFtZSwgbnVsbCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fTtcblxuXHQkW3BsdWdpbk5hbWVdID0gZnVuY3Rpb24ob3B0aW9ucykge1xuXHRcdHZhciAkd2luZG93ID0gJCh3aW5kb3cpO1xuXHRcdHJldHVybiAkd2luZG93LnN0ZWxsYXIuYXBwbHkoJHdpbmRvdywgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSk7XG5cdH07XG5cblx0Ly8gRXhwb3NlIHRoZSBzY3JvbGwgYW5kIHBvc2l0aW9uIHByb3BlcnR5IGZ1bmN0aW9uIGhhc2hlcyBzbyB0aGV5IGNhbiBiZSBleHRlbmRlZFxuXHQkW3BsdWdpbk5hbWVdLnNjcm9sbFByb3BlcnR5ID0gc2Nyb2xsUHJvcGVydHk7XG5cdCRbcGx1Z2luTmFtZV0ucG9zaXRpb25Qcm9wZXJ0eSA9IHBvc2l0aW9uUHJvcGVydHk7XG5cblx0Ly8gRXhwb3NlIHRoZSBwbHVnaW4gY2xhc3Mgc28gaXQgY2FuIGJlIG1vZGlmaWVkXG5cdHdpbmRvdy5TdGVsbGFyID0gUGx1Z2luO1xufShqUXVlcnksIHRoaXMsIGRvY3VtZW50KSk7IiwidmFyIGRpc2FibGVCb2R5U2Nyb2xsID0gKGZ1bmN0aW9uICgpIHtcblxuICAgIC8qKlxuICAgICAqIFByaXZhdGUgdmFyaWFibGVzXG4gICAgICovXG4gICAgdmFyIF9zZWxlY3RvciA9IGZhbHNlLFxuICAgICAgICBfZWxlbWVudCA9IGZhbHNlLFxuICAgICAgICBfY2xpZW50WTtcblxuICAgIC8qKlxuICAgICAqIFBvbHlmaWxscyBmb3IgRWxlbWVudC5tYXRjaGVzIGFuZCBFbGVtZW50LmNsb3Nlc3RcbiAgICAgKi9cbiAgICBpZiAoIUVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMpXG4gICAgICAgIEVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMgPSBFbGVtZW50LnByb3RvdHlwZS5tc01hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgICBFbGVtZW50LnByb3RvdHlwZS53ZWJraXRNYXRjaGVzU2VsZWN0b3I7XG5cbiAgICBpZiAoIUVsZW1lbnQucHJvdG90eXBlLmNsb3Nlc3QpXG4gICAgICAgIEVsZW1lbnQucHJvdG90eXBlLmNsb3Nlc3QgPSBmdW5jdGlvbiAocykge1xuICAgICAgICAgICAgdmFyIGFuY2VzdG9yID0gdGhpcztcbiAgICAgICAgICAgIGlmICghZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNvbnRhaW5zKGVsKSkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgaWYgKGFuY2VzdG9yLm1hdGNoZXMocykpIHJldHVybiBhbmNlc3RvcjtcbiAgICAgICAgICAgICAgICBhbmNlc3RvciA9IGFuY2VzdG9yLnBhcmVudEVsZW1lbnQ7XG4gICAgICAgICAgICB9IHdoaWxlIChhbmNlc3RvciAhPT0gbnVsbCk7XG4gICAgICAgICAgICByZXR1cm4gZWw7XG4gICAgICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBQcmV2ZW50IGRlZmF1bHQgdW5sZXNzIHdpdGhpbiBfc2VsZWN0b3JcbiAgICAgKlxuICAgICAqIEBwYXJhbSAgZXZlbnQgb2JqZWN0IGV2ZW50XG4gICAgICogQHJldHVybiB2b2lkXG4gICAgICovXG4gICAgdmFyIHByZXZlbnRCb2R5U2Nyb2xsID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGlmIChmYWxzZSA9PT0gX2VsZW1lbnQgfHwgIWV2ZW50LnRhcmdldC5jbG9zZXN0KF9zZWxlY3RvcikpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ2FjaGUgdGhlIGNsaWVudFkgY28tb3JkaW5hdGVzIGZvclxuICAgICAqIGNvbXBhcmlzb25cbiAgICAgKlxuICAgICAqIEBwYXJhbSAgZXZlbnQgb2JqZWN0IGV2ZW50XG4gICAgICogQHJldHVybiB2b2lkXG4gICAgICovXG4gICAgdmFyIGNhcHR1cmVDbGllbnRZID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIC8vIG9ubHkgcmVzcG9uZCB0byBhIHNpbmdsZSB0b3VjaFxuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0VG91Y2hlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIF9jbGllbnRZID0gZXZlbnQudGFyZ2V0VG91Y2hlc1swXS5jbGllbnRZO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIERldGVjdCB3aGV0aGVyIHRoZSBlbGVtZW50IGlzIGF0IHRoZSB0b3BcbiAgICAgKiBvciB0aGUgYm90dG9tIG9mIHRoZWlyIHNjcm9sbCBhbmQgcHJldmVudFxuICAgICAqIHRoZSB1c2VyIGZyb20gc2Nyb2xsaW5nIGJleW9uZFxuICAgICAqXG4gICAgICogQHBhcmFtICBldmVudCBvYmplY3QgZXZlbnRcbiAgICAgKiBAcmV0dXJuIHZvaWRcbiAgICAgKi9cbiAgICB2YXIgcHJldmVudE92ZXJzY3JvbGwgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgLy8gb25seSByZXNwb25kIHRvIGEgc2luZ2xlIHRvdWNoXG4gICAgICAgIGlmIChldmVudC50YXJnZXRUb3VjaGVzLmxlbmd0aCAhPT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNsaWVudFkgPSBldmVudC50YXJnZXRUb3VjaGVzWzBdLmNsaWVudFkgLSBfY2xpZW50WTtcblxuICAgICAgICAvLyBUaGUgZWxlbWVudCBhdCB0aGUgdG9wIG9mIGl0cyBzY3JvbGwsXG4gICAgICAgIC8vIGFuZCB0aGUgdXNlciBzY3JvbGxzIGRvd25cbiAgICAgICAgaWYgKF9lbGVtZW50LnNjcm9sbFRvcCA9PT0gMCAmJiBjbGllbnRZID4gMCkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZSBlbGVtZW50IGF0IHRoZSBib3R0b20gb2YgaXRzIHNjcm9sbCxcbiAgICAgICAgLy8gYW5kIHRoZSB1c2VyIHNjcm9sbHMgdXBcbiAgICAgICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0VsZW1lbnQvc2Nyb2xsSGVpZ2h0I1Byb2JsZW1zX2FuZF9zb2x1dGlvbnNcbiAgICAgICAgaWYgKChfZWxlbWVudC5zY3JvbGxIZWlnaHQgLSBfZWxlbWVudC5zY3JvbGxUb3AgPD0gX2VsZW1lbnQuY2xpZW50SGVpZ2h0KSAmJiBjbGllbnRZIDwgMCkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIERpc2FibGUgYm9keSBzY3JvbGwuIFNjcm9sbGluZyB3aXRoIHRoZSBzZWxlY3RvciBpc1xuICAgICAqIGFsbG93ZWQgaWYgYSBzZWxlY3RvciBpcyBwb3J2aWRlZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAgYm9vbGVhbiBhbGxvd1xuICAgICAqIEBwYXJhbSAgc3RyaW5nIHNlbGVjdG9yIFNlbGVjdG9yIHRvIGVsZW1lbnQgdG8gY2hhbmdlIHNjcm9sbCBwZXJtaXNzaW9uXG4gICAgICogQHJldHVybiB2b2lkXG4gICAgICovXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChhbGxvdywgc2VsZWN0b3IpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZWxlY3RvciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgX3NlbGVjdG9yID0gc2VsZWN0b3I7XG4gICAgICAgICAgICBfZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRydWUgPT09IGFsbG93KSB7XG4gICAgICAgICAgICBpZiAoZmFsc2UgIT09IF9lbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgX2VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGNhcHR1cmVDbGllbnRZLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgX2VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgcHJldmVudE92ZXJzY3JvbGwsIGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNobW92ZVwiLCBwcmV2ZW50Qm9keVNjcm9sbCwgZmFsc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGZhbHNlICE9PSBfZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIF9lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBjYXB0dXJlQ2xpZW50WSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIF9lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHByZXZlbnRPdmVyc2Nyb2xsLCBmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0b3VjaG1vdmVcIiwgcHJldmVudEJvZHlTY3JvbGwsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH07XG59KCkpO1xuIl19
