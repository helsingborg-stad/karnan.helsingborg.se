!function(t,e){"use strict";"function"==typeof define&&define.amd?define(["jquery"],function(o){return e(o,t,t.document)}):"object"==typeof module&&module.exports?module.exports=e(require("jquery"),t,t.document):e(jQuery,t,t.document)}("undefined"!=typeof window?window:this,function(t,e,o,n){"use strict";function i(o,n,i,s){if(v===o&&(i=!1),O===!0)return!0;if(p[o]){if(T=!1,i&&P.before(o,d),y=1,H=u[o],z===!1&&v>o&&s===!1&&g[o]&&(y=parseInt(d[o].outerHeight()/L.height()),H=parseInt(u[o])+(d[o].outerHeight()-L.height())),P.updateHash&&P.sectionName&&(z!==!0||0!==o))if(history.pushState)try{history.replaceState(null,null,p[o])}catch(r){e.console&&console.warn("Scrollify warning: Page must be hosted to manipulate the hash value.")}else e.location.hash=p[o];if(z&&(P.afterRender(),z=!1),v=o,n)t(P.target).stop().scrollTop(H),i&&P.after(o,d);else{if(b=!0,t().velocity?t(P.target).stop().velocity("scroll",{duration:P.scrollSpeed,easing:P.easing,offset:H,mobileHA:!1}):t(P.target).stop().animate({scrollTop:H},P.scrollSpeed,P.easing),e.location.hash.length&&P.sectionName&&e.console)try{t(e.location.hash).length&&console.warn("Scrollify warning: ID matches hash value - this will cause the page to anchor.")}catch(r){}t(P.target).promise().done(function(){b=!1,z=!1,i&&P.after(o,d)})}}}function s(t){function e(e){for(var o=0,n=t.slice(Math.max(t.length-e,1)),i=0;i<n.length;i++)o+=n[i];return Math.ceil(o/e)}var o=e(10),n=e(70);return o>=n}function r(t,e){for(var o=p.length;o>=0;o--)"string"==typeof t?p[o]===t&&(m=o,i(o,e,!0,!0)):o===t&&(m=o,i(o,e,!0,!0))}var a,l,c,f,h,u=[],p=[],d=[],g=[],m=0,v=0,y=1,S=!1,L=t(e),w=L.scrollTop(),T=!1,b=!1,E=!1,O=!1,_=[],k=(new Date).getTime(),z=!0,x=!1,H=0,I="onwheel"in o?"wheel":o.onmousewheel!==n?"mousewheel":"DOMMouseScroll",P={section:".section",sectionName:"section-name",interstitialSection:"",easing:"easeOutExpo",scrollSpeed:1100,offset:0,scrollbars:!0,target:"html,body",standardScrollElements:!1,setHeights:!0,overflowScroll:!0,updateHash:!0,touchScroll:!0,before:function(){},after:function(){},afterResize:function(){},afterRender:function(){}},$=function(n){function r(e){t().velocity?t(P.target).stop().velocity("scroll",{duration:P.scrollSpeed,easing:P.easing,offset:e,mobileHA:!1}):t(P.target).stop().animate({scrollTop:e},P.scrollSpeed,P.easing)}function v(e){e&&(w=L.scrollTop());var o=P.section;g=[],P.interstitialSection.length&&(o+=","+P.interstitialSection),P.scrollbars===!1&&(P.overflowScroll=!1),t(o).each(function(e){var o=t(this);P.setHeights?o.is(P.interstitialSection)?g[e]=!1:o.css("height","auto").outerHeight()<L.height()||"hidden"===o.css("overflow")?(o.css({height:L.height()}),g[e]=!1):(o.css({height:o.height()}),P.overflowScroll?g[e]=!0:g[e]=!1):o.outerHeight()<L.height()||P.overflowScroll===!1?g[e]=!1:g[e]=!0}),e&&L.scrollTop(w)}function z(o,n){var s=P.section;P.interstitialSection.length&&(s+=","+P.interstitialSection),u=[],p=[],d=[],t(s).each(function(o){var n=t(this);o>0?u[o]=parseInt(n.offset().top)+P.offset:u[o]=parseInt(n.offset().top),P.sectionName&&n.data(P.sectionName)?p[o]="#"+n.data(P.sectionName).toString().replace(/ /g,"-"):n.is(P.interstitialSection)===!1?p[o]="#"+(o+1):(p[o]="#",o===t(s).length-1&&o>1&&(u[o]=u[o-1]+(parseInt(t(t(s)[o-1]).outerHeight())-parseInt(t(e).height()))+parseInt(n.outerHeight()))),d[o]=n;try{t(p[o]).length&&e.console&&console.warn("Scrollify warning: Section names can't match IDs - this will cause the browser to anchor.")}catch(i){}e.location.hash===p[o]&&(m=o,S=!0)}),!0===o&&i(m,!1,!1,!1)}function H(){return!g[m]||(w=L.scrollTop(),!(w>parseInt(u[m])))}function $(){return!g[m]||(w=L.scrollTop(),!(w<parseInt(u[m])+(d[m].outerHeight()-L.height())-28))}x=!0,t.easing.easeOutExpo=function(t,e,o,n,i){return e==i?o+n:n*(-Math.pow(2,-10*e/i)+1)+o},c={handleMousedown:function(){return O===!0||(T=!1,void(E=!1))},handleMouseup:function(){return O===!0||(T=!0,void(E&&c.calculateNearest(!1,!0)))},handleScroll:function(){return O===!0||(a&&clearTimeout(a),void(a=setTimeout(function(){return E=!0,T!==!1&&(T=!1,void c.calculateNearest(!1,!0))},200)))},calculateNearest:function(t,e){w=L.scrollTop();for(var o,n=1,s=u.length,r=0,a=Math.abs(u[0]-w);n<s;n++)o=Math.abs(u[n]-w),o<a&&(a=o,r=n);($()&&r>m||H())&&(m=r,i(r,t,e,!1))},wheelHandler:function(o){if(O===!0)return!0;if(P.standardScrollElements&&(t(o.target).is(P.standardScrollElements)||t(o.target).closest(P.standardScrollElements).length))return!0;g[m]||o.preventDefault();var n=(new Date).getTime();o=o||e.event;var r=o.originalEvent.wheelDelta||-o.originalEvent.deltaY||-o.originalEvent.detail,a=Math.max(-1,Math.min(1,r));if(_.length>149&&_.shift(),_.push(Math.abs(r)),n-k>200&&(_=[]),k=n,b)return!1;if(a<0){if(m<u.length-1&&$()){if(!s(_))return!1;o.preventDefault(),m++,b=!0,i(m,!1,!0,!1)}}else if(a>0&&m>0&&H()){if(!s(_))return!1;o.preventDefault(),m--,b=!0,i(m,!1,!0,!1)}},keyHandler:function(t){return O===!0||o.activeElement.readOnly===!1||b!==!0&&void(38==t.keyCode||33==t.keyCode?m>0&&H()&&(t.preventDefault(),m--,i(m,!1,!0,!1)):40!=t.keyCode&&34!=t.keyCode||m<u.length-1&&$()&&(t.preventDefault(),m++,i(m,!1,!0,!1)))},init:function(){P.scrollbars?(L.on("mousedown",c.handleMousedown),L.on("mouseup",c.handleMouseup),L.on("scroll",c.handleScroll)):t("body").css({overflow:"hidden"}),L.on(I,c.wheelHandler),L.on("keydown",c.keyHandler)}},f={touches:{touchstart:{y:-1,x:-1},touchmove:{y:-1,x:-1},touchend:!1,direction:"undetermined"},options:{distance:30,timeGap:800,timeStamp:(new Date).getTime()},touchHandler:function(e){if(O===!0)return!0;if(P.standardScrollElements&&(t(e.target).is(P.standardScrollElements)||t(e.target).closest(P.standardScrollElements).length))return!0;var o;if("undefined"!=typeof e&&"undefined"!=typeof e.touches)switch(o=e.touches[0],e.type){case"touchstart":f.touches.touchstart.y=o.pageY,f.touches.touchmove.y=-1,f.touches.touchstart.x=o.pageX,f.touches.touchmove.x=-1,f.options.timeStamp=(new Date).getTime(),f.touches.touchend=!1;case"touchmove":f.touches.touchmove.y=o.pageY,f.touches.touchmove.x=o.pageX,f.touches.touchstart.y!==f.touches.touchmove.y&&Math.abs(f.touches.touchstart.y-f.touches.touchmove.y)>Math.abs(f.touches.touchstart.x-f.touches.touchmove.x)&&(e.preventDefault(),f.touches.direction="y",f.options.timeStamp+f.options.timeGap<(new Date).getTime()&&0==f.touches.touchend&&(f.touches.touchend=!0,f.touches.touchstart.y>-1&&Math.abs(f.touches.touchmove.y-f.touches.touchstart.y)>f.options.distance&&(f.touches.touchstart.y<f.touches.touchmove.y?f.up():f.down())));break;case"touchend":f.touches[e.type]===!1&&(f.touches[e.type]=!0,f.touches.touchstart.y>-1&&f.touches.touchmove.y>-1&&"y"===f.touches.direction&&(Math.abs(f.touches.touchmove.y-f.touches.touchstart.y)>f.options.distance&&(f.touches.touchstart.y<f.touches.touchmove.y?f.up():f.down()),f.touches.touchstart.y=-1,f.touches.touchstart.x=-1,f.touches.direction="undetermined"))}},down:function(){m<u.length&&($()&&m<u.length-1?(m++,i(m,!1,!0,!1)):Math.floor(d[m].height()/L.height())>y?(r(parseInt(u[m])+L.height()*y),y+=1):r(parseInt(u[m])+(d[m].outerHeight()-L.height())))},up:function(){m>=0&&(H()&&m>0?(m--,i(m,!1,!0,!1)):y>2?(y-=1,r(parseInt(u[m])+L.height()*y)):(y=1,r(parseInt(u[m]))))},init:function(){o.addEventListener&&P.touchScroll&&(o.addEventListener("touchstart",f.touchHandler,!1),o.addEventListener("touchmove",f.touchHandler,!1),o.addEventListener("touchend",f.touchHandler,!1))}},h={refresh:function(t,e){clearTimeout(l),l=setTimeout(function(){v(!0),z(e,!1),t&&P.afterResize()},400)},handleUpdate:function(){h.refresh(!1,!1)},handleResize:function(){h.refresh(!0,!1)},handleOrientation:function(){h.refresh(!0,!0)}},P=t.extend(P,n),v(!1),z(!1,!0),!0===S?i(m,!1,!0,!0):setTimeout(function(){c.calculateNearest(!0,!1)},200),u.length&&(c.init(),f.init(),L.on("resize",h.handleResize),o.addEventListener&&e.addEventListener("orientationchange",h.handleOrientation,!1))};return $.move=function(e){return e!==n&&(e.originalEvent&&(e=t(this).attr("href")),void r(e,!1))},$.instantMove=function(t){return t!==n&&void r(t,!0)},$.next=function(){m<p.length&&(m+=1,i(m,!1,!0,!0))},$.previous=function(){m>0&&(m-=1,i(m,!1,!0,!0))},$.instantNext=function(){m<p.length&&(m+=1,i(m,!0,!0,!0))},$.instantPrevious=function(){m>0&&(m-=1,i(m,!0,!0,!0))},$.destroy=function(){return!!x&&(P.setHeights&&t(P.section).each(function(){t(this).css("height","auto")}),L.off("resize",h.handleResize),P.scrollbars&&(L.off("mousedown",c.handleMousedown),L.off("mouseup",c.handleMouseup),L.off("scroll",c.handleScroll)),L.off(I,c.wheelHandler),L.off("keydown",c.keyHandler),o.addEventListener&&P.touchScroll&&(o.removeEventListener("touchstart",f.touchHandler,!1),o.removeEventListener("touchmove",f.touchHandler,!1),o.removeEventListener("touchend",f.touchHandler,!1)),u=[],p=[],d=[],void(g=[]))},$.update=function(){return!!x&&void h.handleUpdate()},$.current=function(){return d[m]},$.currentIndex=function(){return m},$.disable=function(){O=!0},$.enable=function(){O=!1,x&&c.calculateNearest(!1,!1)},$.isDisabled=function(){return O},$.setOptions=function(o){return!!x&&void("object"==typeof o?(P=t.extend(P,o),h.handleUpdate()):e.console&&console.warn("Scrollify warning: setOptions expects an object."))},t.scrollify=$,$}),function(t,e,o,n){function i(e,o){this.element=e,this.options=t.extend({},r,o),this._defaults=r,this._name=s,this.init()}var s="stellar",r={scrollProperty:"scroll",positionProperty:"position",horizontalScrolling:!0,verticalScrolling:!0,horizontalOffset:0,verticalOffset:0,responsive:!1,parallaxBackgrounds:!0,parallaxElements:!0,hideDistantElements:!0,hideElement:function(t){t.hide()},showElement:function(t){t.show()}},a={scroll:{getLeft:function(t){return t.scrollLeft()},setLeft:function(t,e){t.scrollLeft(e)},getTop:function(t){return t.scrollTop()},setTop:function(t,e){t.scrollTop(e)}},position:{getLeft:function(t){return parseInt(t.css("left"),10)*-1},getTop:function(t){return parseInt(t.css("top"),10)*-1}},margin:{getLeft:function(t){return parseInt(t.css("margin-left"),10)*-1},getTop:function(t){return parseInt(t.css("margin-top"),10)*-1}},transform:{getLeft:function(t){var e=getComputedStyle(t[0])[f];return"none"!==e?parseInt(e.match(/(-?[0-9]+)/g)[4],10)*-1:0},getTop:function(t){var e=getComputedStyle(t[0])[f];return"none"!==e?parseInt(e.match(/(-?[0-9]+)/g)[5],10)*-1:0}}},l={position:{setLeft:function(t,e){t.css("left",e)},setTop:function(t,e){t.css("top",e)}},transform:{setPosition:function(t,e,o,n,i){t[0].style[f]="translate3d("+(e-o)+"px, "+(n-i)+"px, 0)"}}},c=function(){var e,o=/^(Moz|Webkit|Khtml|O|ms|Icab)(?=[A-Z])/,n=t("script")[0].style,i="";for(e in n)if(o.test(e)){i=e.match(o)[0];break}return"WebkitOpacity"in n&&(i="Webkit"),"KhtmlOpacity"in n&&(i="Khtml"),function(t){return i+(i.length>0?t.charAt(0).toUpperCase()+t.slice(1):t)}}(),f=c("transform"),h=t("<div />",{style:"background:#fff"}).css("background-position-x")!==n,u=h?function(t,e,o){t.css({"background-position-x":e,"background-position-y":o})}:function(t,e,o){t.css("background-position",e+" "+o)},p=h?function(t){return[t.css("background-position-x"),t.css("background-position-y")]}:function(t){return t.css("background-position").split(" ")},d=e.requestAnimationFrame||e.webkitRequestAnimationFrame||e.mozRequestAnimationFrame||e.oRequestAnimationFrame||e.msRequestAnimationFrame||function(t){setTimeout(t,1e3/60)};i.prototype={init:function(){this.options.name=s+"_"+Math.floor(1e9*Math.random()),this._defineElements(),this._defineGetters(),this._defineSetters(),this._handleWindowLoadAndResize(),this._detectViewport(),this.refresh({firstLoad:!0}),"scroll"===this.options.scrollProperty?this._handleScrollEvent():this._startAnimationLoop()},_defineElements:function(){this.element===o.body&&(this.element=e),this.$scrollElement=t(this.element),this.$element=this.element===e?t("body"):this.$scrollElement,this.$viewportElement=this.options.viewportElement!==n?t(this.options.viewportElement):this.$scrollElement[0]===e||"scroll"===this.options.scrollProperty?this.$scrollElement:this.$scrollElement.parent()},_defineGetters:function(){var t=this,e=a[t.options.scrollProperty];this._getScrollLeft=function(){return e.getLeft(t.$scrollElement)},this._getScrollTop=function(){return e.getTop(t.$scrollElement)}},_defineSetters:function(){var e=this,o=a[e.options.scrollProperty],n=l[e.options.positionProperty],i=o.setLeft,s=o.setTop;this._setScrollLeft="function"==typeof i?function(t){i(e.$scrollElement,t)}:t.noop,this._setScrollTop="function"==typeof s?function(t){s(e.$scrollElement,t)}:t.noop,this._setPosition=n.setPosition||function(t,o,i,s,r){e.options.horizontalScrolling&&n.setLeft(t,o,i),e.options.verticalScrolling&&n.setTop(t,s,r)}},_handleWindowLoadAndResize:function(){var o=this,n=t(e);o.options.responsive&&n.bind("load."+this.name,function(){o.refresh()}),n.bind("resize."+this.name,function(){o._detectViewport(),o.options.responsive&&o.refresh()})},refresh:function(o){var n=this,i=n._getScrollLeft(),s=n._getScrollTop();o&&o.firstLoad||this._reset(),this._setScrollLeft(0),this._setScrollTop(0),this._setOffsets(),this._findParticles(),this._findBackgrounds(),o&&o.firstLoad&&/WebKit/.test(navigator.userAgent)&&t(e).load(function(){var t=n._getScrollLeft(),e=n._getScrollTop();n._setScrollLeft(t+1),n._setScrollTop(e+1),n._setScrollLeft(t),n._setScrollTop(e)}),this._setScrollLeft(i),this._setScrollTop(s)},_detectViewport:function(){var t=this.$viewportElement.offset(),e=null!==t&&t!==n;this.viewportWidth=this.$viewportElement.width(),this.viewportHeight=this.$viewportElement.height(),this.viewportOffsetTop=e?t.top:0,this.viewportOffsetLeft=e?t.left:0},_findParticles:function(){var e=this;this._getScrollLeft(),this._getScrollTop();if(this.particles!==n)for(var o=this.particles.length-1;o>=0;o--)this.particles[o].$element.data("stellar-elementIsActive",n);this.particles=[],this.options.parallaxElements&&this.$element.find("[data-stellar-ratio]").each(function(o){var i,s,r,a,l,c,f,h,u,p=t(this),d=0,g=0,m=0,v=0;if(p.data("stellar-elementIsActive")){if(p.data("stellar-elementIsActive")!==this)return}else p.data("stellar-elementIsActive",this);e.options.showElement(p),p.data("stellar-startingLeft")?(p.css("left",p.data("stellar-startingLeft")),p.css("top",p.data("stellar-startingTop"))):(p.data("stellar-startingLeft",p.css("left")),p.data("stellar-startingTop",p.css("top"))),r=p.position().left,a=p.position().top,l="auto"===p.css("margin-left")?0:parseInt(p.css("margin-left"),10),c="auto"===p.css("margin-top")?0:parseInt(p.css("margin-top"),10),h=p.offset().left-l,u=p.offset().top-c,p.parents().each(function(){var e=t(this);return e.data("stellar-offset-parent")===!0?(d=m,g=v,f=e,!1):(m+=e.position().left,void(v+=e.position().top))}),i=p.data("stellar-horizontal-offset")!==n?p.data("stellar-horizontal-offset"):f!==n&&f.data("stellar-horizontal-offset")!==n?f.data("stellar-horizontal-offset"):e.horizontalOffset,s=p.data("stellar-vertical-offset")!==n?p.data("stellar-vertical-offset"):f!==n&&f.data("stellar-vertical-offset")!==n?f.data("stellar-vertical-offset"):e.verticalOffset,e.particles.push({$element:p,$offsetParent:f,isFixed:"fixed"===p.css("position"),horizontalOffset:i,verticalOffset:s,startingPositionLeft:r,startingPositionTop:a,startingOffsetLeft:h,startingOffsetTop:u,parentOffsetLeft:d,parentOffsetTop:g,stellarRatio:p.data("stellar-ratio")!==n?p.data("stellar-ratio"):1,width:p.outerWidth(!0),height:p.outerHeight(!0),isHidden:!1})})},_findBackgrounds:function(){var e,o=this,i=this._getScrollLeft(),s=this._getScrollTop();this.backgrounds=[],this.options.parallaxBackgrounds&&(e=this.$element.find("[data-stellar-background-ratio]"),this.$element.data("stellar-background-ratio")&&(e=e.add(this.$element)),e.each(function(){var e,r,a,l,c,f,h,d=t(this),g=p(d),m=0,v=0,y=0,S=0;if(d.data("stellar-backgroundIsActive")){if(d.data("stellar-backgroundIsActive")!==this)return}else d.data("stellar-backgroundIsActive",this);d.data("stellar-backgroundStartingLeft")?u(d,d.data("stellar-backgroundStartingLeft"),d.data("stellar-backgroundStartingTop")):(d.data("stellar-backgroundStartingLeft",g[0]),d.data("stellar-backgroundStartingTop",g[1])),a="auto"===d.css("margin-left")?0:parseInt(d.css("margin-left"),10),l="auto"===d.css("margin-top")?0:parseInt(d.css("margin-top"),10),c=d.offset().left-a-i,f=d.offset().top-l-s,d.parents().each(function(){var e=t(this);return e.data("stellar-offset-parent")===!0?(m=y,v=S,h=e,!1):(y+=e.position().left,void(S+=e.position().top))}),e=d.data("stellar-horizontal-offset")!==n?d.data("stellar-horizontal-offset"):h!==n&&h.data("stellar-horizontal-offset")!==n?h.data("stellar-horizontal-offset"):o.horizontalOffset,r=d.data("stellar-vertical-offset")!==n?d.data("stellar-vertical-offset"):h!==n&&h.data("stellar-vertical-offset")!==n?h.data("stellar-vertical-offset"):o.verticalOffset,o.backgrounds.push({$element:d,$offsetParent:h,isFixed:"fixed"===d.css("background-attachment"),horizontalOffset:e,verticalOffset:r,startingValueLeft:g[0],startingValueTop:g[1],startingBackgroundPositionLeft:isNaN(parseInt(g[0],10))?0:parseInt(g[0],10),startingBackgroundPositionTop:isNaN(parseInt(g[1],10))?0:parseInt(g[1],10),startingPositionLeft:d.position().left,startingPositionTop:d.position().top,startingOffsetLeft:c,startingOffsetTop:f,parentOffsetLeft:m,parentOffsetTop:v,stellarRatio:d.data("stellar-background-ratio")===n?1:d.data("stellar-background-ratio")})}))},_reset:function(){var t,e,o,n,i;for(i=this.particles.length-1;i>=0;i--)t=this.particles[i],e=t.$element.data("stellar-startingLeft"),o=t.$element.data("stellar-startingTop"),this._setPosition(t.$element,e,e,o,o),this.options.showElement(t.$element),t.$element.data("stellar-startingLeft",null).data("stellar-elementIsActive",null).data("stellar-backgroundIsActive",null);for(i=this.backgrounds.length-1;i>=0;i--)n=this.backgrounds[i],n.$element.data("stellar-backgroundStartingLeft",null).data("stellar-backgroundStartingTop",null),u(n.$element,n.startingValueLeft,n.startingValueTop)},destroy:function(){this._reset(),this.$scrollElement.unbind("resize."+this.name).unbind("scroll."+this.name),this._animationLoop=t.noop,t(e).unbind("load."+this.name).unbind("resize."+this.name)},_setOffsets:function(){var o=this,n=t(e);n.unbind("resize.horizontal-"+this.name).unbind("resize.vertical-"+this.name),"function"==typeof this.options.horizontalOffset?(this.horizontalOffset=this.options.horizontalOffset(),n.bind("resize.horizontal-"+this.name,function(){o.horizontalOffset=o.options.horizontalOffset()})):this.horizontalOffset=this.options.horizontalOffset,"function"==typeof this.options.verticalOffset?(this.verticalOffset=this.options.verticalOffset(),n.bind("resize.vertical-"+this.name,function(){o.verticalOffset=o.options.verticalOffset()})):this.verticalOffset=this.options.verticalOffset},_repositionElements:function(){var t,e,o,n,i,s,r,a,l,c,f=this._getScrollLeft(),h=this._getScrollTop(),p=!0,d=!0;if(this.currentScrollLeft!==f||this.currentScrollTop!==h||this.currentWidth!==this.viewportWidth||this.currentHeight!==this.viewportHeight){for(this.currentScrollLeft=f,this.currentScrollTop=h,this.currentWidth=this.viewportWidth,this.currentHeight=this.viewportHeight,c=this.particles.length-1;c>=0;c--)t=this.particles[c],e=t.isFixed?1:0,this.options.horizontalScrolling?(s=(f+t.horizontalOffset+this.viewportOffsetLeft+t.startingPositionLeft-t.startingOffsetLeft+t.parentOffsetLeft)*-(t.stellarRatio+e-1)+t.startingPositionLeft,a=s-t.startingPositionLeft+t.startingOffsetLeft):(s=t.startingPositionLeft,a=t.startingOffsetLeft),this.options.verticalScrolling?(r=(h+t.verticalOffset+this.viewportOffsetTop+t.startingPositionTop-t.startingOffsetTop+t.parentOffsetTop)*-(t.stellarRatio+e-1)+t.startingPositionTop,l=r-t.startingPositionTop+t.startingOffsetTop):(r=t.startingPositionTop,l=t.startingOffsetTop),this.options.hideDistantElements&&(d=!this.options.horizontalScrolling||a+t.width>(t.isFixed?0:f)&&a<(t.isFixed?0:f)+this.viewportWidth+this.viewportOffsetLeft,p=!this.options.verticalScrolling||l+t.height>(t.isFixed?0:h)&&l<(t.isFixed?0:h)+this.viewportHeight+this.viewportOffsetTop),d&&p?(t.isHidden&&(this.options.showElement(t.$element),t.isHidden=!1),this._setPosition(t.$element,s,t.startingPositionLeft,r,t.startingPositionTop)):t.isHidden||(this.options.hideElement(t.$element),t.isHidden=!0);for(c=this.backgrounds.length-1;c>=0;c--)o=this.backgrounds[c],e=o.isFixed?0:1,n=this.options.horizontalScrolling?(f+o.horizontalOffset-this.viewportOffsetLeft-o.startingOffsetLeft+o.parentOffsetLeft-o.startingBackgroundPositionLeft)*(e-o.stellarRatio)+"px":o.startingValueLeft,i=this.options.verticalScrolling?(h+o.verticalOffset-this.viewportOffsetTop-o.startingOffsetTop+o.parentOffsetTop-o.startingBackgroundPositionTop)*(e-o.stellarRatio)+"px":o.startingValueTop,u(o.$element,n,i)}},_handleScrollEvent:function(){var t=this,e=!1,o=function(){t._repositionElements(),e=!1},n=function(){e||(d(o),e=!0)};this.$scrollElement.bind("scroll."+this.name,n),n()},_startAnimationLoop:function(){var t=this;this._animationLoop=function(){d(t._animationLoop),t._repositionElements()},this._animationLoop()}},t.fn[s]=function(e){var o=arguments;return e===n||"object"==typeof e?this.each(function(){t.data(this,"plugin_"+s)||t.data(this,"plugin_"+s,new i(this,e))}):"string"==typeof e&&"_"!==e[0]&&"init"!==e?this.each(function(){var n=t.data(this,"plugin_"+s);n instanceof i&&"function"==typeof n[e]&&n[e].apply(n,Array.prototype.slice.call(o,1)),"destroy"===e&&t.data(this,"plugin_"+s,null)}):void 0},t[s]=function(o){var n=t(e);return n.stellar.apply(n,Array.prototype.slice.call(arguments,0))},t[s].scrollProperty=a,t[s].positionProperty=l,e.Stellar=i}(jQuery,this,document);var disableBodyScroll=function(){var t,e=!1,o=!1;Element.prototype.matches||(Element.prototype.matches=Element.prototype.msMatchesSelector||Element.prototype.webkitMatchesSelector),Element.prototype.closest||(Element.prototype.closest=function(t){var e=this;if(!document.documentElement.contains(el))return null;do{if(e.matches(t))return e;e=e.parentElement}while(null!==e);return el});var n=function(t){!1!==o&&t.target.closest(e)||t.preventDefault()},i=function(e){1===e.targetTouches.length&&(t=e.targetTouches[0].clientY)},s=function(e){if(1===e.targetTouches.length){var n=e.targetTouches[0].clientY-t;0===o.scrollTop&&n>0&&e.preventDefault(),o.scrollHeight-o.scrollTop<=o.clientHeight&&n<0&&e.preventDefault()}};return function(t,r){"undefined"!=typeof r&&(e=r,o=document.querySelector(r)),!0===t?(!1!==o&&(o.addEventListener("touchstart",i,!1),o.addEventListener("touchmove",s,!1)),document.body.addEventListener("touchmove",n,!1)):(!1!==o&&(o.removeEventListener("touchstart",i,!1),o.removeEventListener("touchmove",s,!1)),document.body.removeEventListener("touchmove",n,!1))}}();