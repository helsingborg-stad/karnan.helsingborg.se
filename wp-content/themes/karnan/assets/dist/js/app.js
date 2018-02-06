var Karnan;

Karnan = Karnan || {};
Karnan.OnePage = Karnan.OnePage || {};

Karnan.OnePage.GalleryPopup = (function ($) {
    function GalleryPopup() {
        this.openModalOnClose();
    }

    GalleryPopup.prototype.openModalOnClose = function () {
        $('.js-close-target').on('click', function(e) {
            var hash = $(this).attr('data-close-target');

            $(document).on('closeLightBox', function() {
                setTimeout(function(){
                  window.location.hash = hash;
                }, 10);
            });
        });
    };
    new GalleryPopup();


})(jQuery);

Karnan = Karnan || {};
Karnan.OnePage = Karnan.OnePage || {};

Karnan.OnePage.GoToVideo = (function ($) {
    function GoToVideo() {
        $("#go-to-live").on('click', function(e){
            e.preventDefault();
            $.scrollify.move($(this).attr('href'));
        });

        if(!$("#live-section").length) {
            $("#go-to-live").hide(0);
        }
    }
    new GoToVideo();

})(jQuery);

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
            $('.scroll-action.scroll-up').addClass('animation-disable').fadeOut(700,function(){
                $(this).addClass('disabled').removeAttr('style').removeClass('animation-disable');
            });
        } else {
            $('.scroll-action.scroll-up').removeClass('disabled animation-disable');
        }

        //This is the last item
        if(segments == index + 1) {
            $('.scroll-action.scroll-down').addClass('animation-disable').fadeOut(700,function(){
                $(this).addClass('disabled').removeAttr('style').removeClass('animation-disable');
            });
        } else {
            $('.scroll-action.scroll-down').removeClass('disabled animation-disable');
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

Karnan.OnePage.Preloader = (function ($) {

    function Preloader() {
        if(this.inCache()) {
            $('body').addClass("page-loaded preload-quick");
        } else {
            $(window).on("load", function() {
                $('body').addClass("page-loaded").delay(1500).queue(function(next){
                    $("#preloader").hide(0);
                    next();
                });
                this.markAsCached();
            }.bind(this));
        }
    }

    Preloader.prototype.inCache = function () {
        if(this.getCookie("karnanExistsInCache") == 1) {
            return true;
        }
        return false;
    };

    Preloader.prototype.markAsCached = function() {
        this.addCookie("karnanExistsInCache", 1, 1);
    };

    Preloader.prototype.addCookie = function(name, value, days) {
        var expires;
        if (days) {
            var date = new Date();
            date.setTime(date.getTime()+(days*24*60*60*1000));
            expires = "; expires="+date.toGMTString();
        }
        else {
            expires = "";
        }
        document.cookie = name+"="+value+expires+"; path=/";
    };

    Preloader.prototype.getCookie = function (name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1,c.length);
            }
            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length,c.length);
            }
        }
        return null;
    };

    new Preloader();

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

        //Total section count (starting form 0)
        this.sectionCount = $(".onepage-section").length - 1;

        this.startState();
        this.modalEvents();

        if ($('body').hasClass('.home')) {
            $('a[href="#"]').on('click', function (e) {
                e.preventDefault();
            });
        }

    }

    ScrollSnapping.prototype.modalEvents = function () {
        this.currentSection = $.scrollify.currentIndex();

        $('html').on('openModal', function() {
            this.currentSection = $.scrollify.currentIndex();
            $.scrollify.disable();
            disableBodyScroll(true, '.modal:target');
        });

        $('html').on('closeModal', function() {
            $.scrollify.enable();
            disableBodyScroll(false, '.modal:target');
            $.scrollify.update();
            $.scrollify.instantMove(this.currentSection);
        });
    };

    ScrollSnapping.prototype.startState = function () {
        //Set last section as current if no hash is defined
        if (window.location.hash == "#r") {
            $.scrollify.instantMove(this.sectionCount);
        }

        //Add active class
        $.scrollify.current().addClass('active-section');

        //Add wrapper class
        $('#one-page-content').addClass('active-section-' + $.scrollify.currentIndex());

        //Add next class
        if ($.scrollify.currentIndex() - 1 > 0) {
            $.scrollify.current().prev().addClass('next-section');
        }

        //Add prev class
        if ($.scrollify.currentIndex() + 1 <= this.sectionCount) {
            $.scrollify.current().next().addClass('prev-section');
        }
    };

    ScrollSnapping.prototype.updateWrapper = function (index, sections) {
        //Remove old wrapper class
        $('#one-page-content').removeClass (function (index, className) {
            return (className.match (/(^|\s)active-section-\S+/g) || []).join(' ');
        });

        //Add active
        $('#one-page-content').addClass('active-section-' + index);
    };

    ScrollSnapping.prototype.updateBody = function (index, sections) {
        //Remove old wrapper class
        $('body').removeClass (function (index, className) {
            return (className.match (/(^|\s)active-item-\S+/g) || []).join(' ');
        });

        //Add active
        $('body').addClass('active-item-' + index);
    };

    ScrollSnapping.prototype.updateActive = function (index, sections) {
        //Remove active class
        if (sections[(index + 1)] && sections[(index + 1)].hasClass('active-section')) {
            sections[(index + 1)].removeClass('active-section');
        } else if (sections[(index - 1)] && sections[(index - 1)].hasClass('active-section')) {
            sections[(index - 1)].removeClass('active-section');
        }

        //Set new active class
        sections[index].addClass('active-section');
    };

    ScrollSnapping.prototype.updateNext = function (index, sections) {
        //Remove old next
        if ($('.next-section')) {
            $('.next-section').removeClass('next-section');
        }

        //Set new next
        if (sections[(index - 1)]) {
            sections[(index - 1)].addClass('next-section');
        }
    };

    ScrollSnapping.prototype.updatePrev = function (index, sections) {
        //Remove old prev
        if ($('.prev-section')) {
            $('.prev-section').removeClass('prev-section');
        }

        //Set new next
        if (sections[(index + 1)]) {
            sections[(index + 1)].addClass('prev-section');
        }
    };

    ScrollSnapping.prototype.StartSections = function () {

        var scrollSpeed = 800;

        $.scrollify({
            setHeights : true,
            section : ".onepage-section",
            sectionName : "section-name",
            scrollSpeed: scrollSpeed,
            easing: "easeOutExpo",
            standardScrollElements: ".modal-karnan",
            before: function(index, sections) {
                this.updateActive(index, sections);
                this.updateNext(index, sections);
                this.updatePrev(index, sections);
                this.updateWrapper(index, sections);
                this.updateBody(index, sections);

                $(document).trigger('scrollifyStart', [index, sections, scrollSpeed, 'onepage']);
            }.bind(this),
            after: function(index, sections) {

                $(document).trigger('scrollifyStop', [index, sections, scrollSpeed, 'onepage']);
            }.bind(this)
        });
    };

    ScrollSnapping.prototype.VirtualSections = function () {

        var scrollSpeed = 800;

        $.scrollify({
            section : ".virtual-section",
            sectionName : "section-name",
            scrollSpeed: scrollSpeed,
            before: function(index, sections) {
                $(".container", "section").not(":eq(" + index + ")").addClass('fade-out');
                $(".container", "section:eq(" + index + ")").removeClass('fade-out').addClass('fade-in');
                $(document).trigger('scrollifyStart', [index, sections, scrollSpeed, 'virtual']);
            }.bind(this),
            after: function(index, sections) {
                setTimeout(function() {
                    $(".container", "section:eq(" + index + ")").removeClass('fade-in');
                }, 800);
                $(document).trigger('scrollifyStop', [index, sections, scrollSpeed, 'virtual']);
            }.bind(this)
        });

    }.bind(this);

    new ScrollSnapping();

})(jQuery);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIl9hcHAuanMiLCJnYWxsZXJ5UG9wdXAuanMiLCJvbmVQYWdlR29Ub1ZpZGVvLmpzIiwib25lUGFnZU5hdmlnYXRpb24uanMiLCJvbmVQYWdlUHJlbG9hZGVyLmpzIiwib25lUGFnZVNjcm9sbFNuYXBwaW5nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBLYXJuYW47XG4iLCJLYXJuYW4gPSBLYXJuYW4gfHwge307XG5LYXJuYW4uT25lUGFnZSA9IEthcm5hbi5PbmVQYWdlIHx8IHt9O1xuXG5LYXJuYW4uT25lUGFnZS5HYWxsZXJ5UG9wdXAgPSAoZnVuY3Rpb24gKCQpIHtcbiAgICBmdW5jdGlvbiBHYWxsZXJ5UG9wdXAoKSB7XG4gICAgICAgIHRoaXMub3Blbk1vZGFsT25DbG9zZSgpO1xuICAgIH1cblxuICAgIEdhbGxlcnlQb3B1cC5wcm90b3R5cGUub3Blbk1vZGFsT25DbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCgnLmpzLWNsb3NlLXRhcmdldCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHZhciBoYXNoID0gJCh0aGlzKS5hdHRyKCdkYXRhLWNsb3NlLXRhcmdldCcpO1xuXG4gICAgICAgICAgICAkKGRvY3VtZW50KS5vbignY2xvc2VMaWdodEJveCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gaGFzaDtcbiAgICAgICAgICAgICAgICB9LCAxMCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBuZXcgR2FsbGVyeVBvcHVwKCk7XG5cblxufSkoalF1ZXJ5KTtcbiIsIkthcm5hbiA9IEthcm5hbiB8fCB7fTtcbkthcm5hbi5PbmVQYWdlID0gS2FybmFuLk9uZVBhZ2UgfHwge307XG5cbkthcm5hbi5PbmVQYWdlLkdvVG9WaWRlbyA9IChmdW5jdGlvbiAoJCkge1xuICAgIGZ1bmN0aW9uIEdvVG9WaWRlbygpIHtcbiAgICAgICAgJChcIiNnby10by1saXZlXCIpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgJC5zY3JvbGxpZnkubW92ZSgkKHRoaXMpLmF0dHIoJ2hyZWYnKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmKCEkKFwiI2xpdmUtc2VjdGlvblwiKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICQoXCIjZ28tdG8tbGl2ZVwiKS5oaWRlKDApO1xuICAgICAgICB9XG4gICAgfVxuICAgIG5ldyBHb1RvVmlkZW8oKTtcblxufSkoalF1ZXJ5KTtcbiIsIkthcm5hbiA9IEthcm5hbiB8fCB7fTtcbkthcm5hbi5PbmVQYWdlID0gS2FybmFuLk9uZVBhZ2UgfHwge307XG5cbkthcm5hbi5PbmVQYWdlLk5hdmlnYXRpb24gPSAoZnVuY3Rpb24gKCQpIHtcblxuICAgIGZ1bmN0aW9uIE5hdmlnYXRpb24oKSB7XG5cbiAgICAgICAgLy9Ib21lIHBhZ2Ugc29mdCBtb3ZlXG4gICAgICAgIGlmICgkKFwiLm9uZXBhZ2Utc2VjdGlvblwiKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuaGlnaHRsaWdodERpcmVjdGlvbkFycm93cygwLCAkKFwiLm9uZXBhZ2Utc2VjdGlvblwiKS5sZW5ndGgpO1xuICAgICAgICAgICAgdGhpcy5iaW5kRGlyZWN0aW9uQXJyb3coJ3NvZnQnKTtcbiAgICAgICAgICAgIHRoaXMuYmluZEVsZXZhdG9yKCdzb2Z0Jyk7XG4gICAgICAgIH1cblxuICAgICAgICAvL1ZpcnR1YWwgc2VjdGlvbnMgaW5zdGFudCBtb3ZlXG4gICAgICAgIGlmICgkKFwiLnZpcnR1YWwtc2VjdGlvblwiKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuaGlnaHRsaWdodERpcmVjdGlvbkFycm93cygwLCAkKFwiLnZpcnR1YWwtc2VjdGlvblwiKS5sZW5ndGgpO1xuICAgICAgICAgICAgdGhpcy5iaW5kRGlyZWN0aW9uQXJyb3coJ2luc3RhbnQnKTtcbiAgICAgICAgICAgIHRoaXMuYmluZEVsZXZhdG9yKCdpbnN0YW50Jyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBVc2UgaG9va3MgaW4gb25lIHBhZ2Ugc2Nyb2xsIChzdGFydClcbiAgICAgICAgJChkb2N1bWVudCkuYmluZCgnc2Nyb2xsaWZ5U3RhcnQnLGZ1bmN0aW9uKGV2ZW50LCBzZWdtZW50SW5kZXgsIHNlZ21lbnRzLCBzY3JvbGxTcGVlZCkge1xuICAgICAgICAgICAgdGhpcy5oaWdodGxpZ2h0RGlyZWN0aW9uQXJyb3dzKHNlZ21lbnRJbmRleCwgc2VnbWVudHMubGVuZ3RoKTtcbiAgICAgICAgICAgIHRoaXMuaGlnaHRsaWdodFBhZ2luYXRpb24oc2VnbWVudEluZGV4LCBzZWdtZW50cyk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgLy9BZGQgYWN0aXZlIGNsYXNzIHRvIGxhc3QgaXRlbVxuICAgICAgICBpZighJChcIi5zY3JvbGwtZXZlbGF0b3IuYWN0aXZlXCIpLmxlbmd0aCkge1xuICAgICAgICAgICAgJChcIi5zY3JvbGwtZXZlbGF0b3IuaXMtbGFzdFwiKS5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIE5hdmlnYXRpb24ucHJvdG90eXBlLmhpZ2h0bGlnaHREaXJlY3Rpb25BcnJvd3MgPSBmdW5jdGlvbiAoaW5kZXgsIHNlZ21lbnRzKSB7XG5cbiAgICAgICAgLy9UaGlzIGlzIHRoZSBmaXJzdCBpdGVtXG4gICAgICAgIGlmKGluZGV4ID09IDApIHtcbiAgICAgICAgICAgICQoJy5zY3JvbGwtYWN0aW9uLnNjcm9sbC11cCcpLmFkZENsYXNzKCdhbmltYXRpb24tZGlzYWJsZScpLmZhZGVPdXQoNzAwLGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygnZGlzYWJsZWQnKS5yZW1vdmVBdHRyKCdzdHlsZScpLnJlbW92ZUNsYXNzKCdhbmltYXRpb24tZGlzYWJsZScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKCcuc2Nyb2xsLWFjdGlvbi5zY3JvbGwtdXAnKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQgYW5pbWF0aW9uLWRpc2FibGUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vVGhpcyBpcyB0aGUgbGFzdCBpdGVtXG4gICAgICAgIGlmKHNlZ21lbnRzID09IGluZGV4ICsgMSkge1xuICAgICAgICAgICAgJCgnLnNjcm9sbC1hY3Rpb24uc2Nyb2xsLWRvd24nKS5hZGRDbGFzcygnYW5pbWF0aW9uLWRpc2FibGUnKS5mYWRlT3V0KDcwMCxmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2Rpc2FibGVkJykucmVtb3ZlQXR0cignc3R5bGUnKS5yZW1vdmVDbGFzcygnYW5pbWF0aW9uLWRpc2FibGUnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJCgnLnNjcm9sbC1hY3Rpb24uc2Nyb2xsLWRvd24nKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQgYW5pbWF0aW9uLWRpc2FibGUnKTtcbiAgICAgICAgfVxuXG4gICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgTmF2aWdhdGlvbi5wcm90b3R5cGUuaGlnaHRsaWdodFBhZ2luYXRpb24gPSBmdW5jdGlvbiAoaW5kZXgsIHNlZ21lbnRzKSB7XG4gICAgICAgICQoXCIjb25lLXBhZ2UtZWxldmF0b3IgbGlcIikucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XG4gICAgICAgICQoXCIjb25lLXBhZ2UtZWxldmF0b3IgbGk6ZXEoXCIgK2luZGV4KyBcIilcIikuYWRkQ2xhc3MoXCJhY3RpdmVcIik7XG4gICAgfTtcblxuICAgIE5hdmlnYXRpb24ucHJvdG90eXBlLmJpbmRFbGV2YXRvciA9IGZ1bmN0aW9uICh0eXBlKSB7XG5cbiAgICAgICAgaWYodHlwZSA9PSAnc29mdCcpIHtcbiAgICAgICAgICAgICQoXCIjb25lLXBhZ2UtZWxldmF0b3IgYVwiKS5vbihcImNsaWNrXCIsZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGlmKCEkKFwiYm9keVwiKS5oYXNDbGFzcyhcImxvY2stc2Nyb2xsXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICQuc2Nyb2xsaWZ5Lm1vdmUoJCh0aGlzKS5hdHRyKFwiaHJlZlwiKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZih0eXBlID09ICdpbnN0YW50Jykge1xuICAgICAgICAgICAgJChcIiNvbmUtcGFnZS1lbGV2YXRvciBhXCIpLm9uKFwiY2xpY2tcIixmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgaWYoISQoXCJib2R5XCIpLmhhc0NsYXNzKFwibG9jay1zY3JvbGxcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgJC5zY3JvbGxpZnkuaW5zdGFudE1vdmUoJCh0aGlzKS5hdHRyKFwiaHJlZlwiKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBOYXZpZ2F0aW9uLnByb3RvdHlwZS5iaW5kRGlyZWN0aW9uQXJyb3cgPSBmdW5jdGlvbiAodHlwZSkge1xuXG4gICAgICAgIGlmKHR5cGUgPT0gJ3NvZnQnKSB7XG4gICAgICAgICAgICAkKFwiLnNjcm9sbC1hY3Rpb24uc2Nyb2xsLWRvd25cIikub24oXCJjbGlja1wiLGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAkLnNjcm9sbGlmeS5uZXh0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICQoXCIuc2Nyb2xsLWFjdGlvbi5zY3JvbGwtdXBcIikub24oXCJjbGlja1wiLGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAkLnNjcm9sbGlmeS5wcmV2aW91cygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZih0eXBlID09ICdpbnN0YW50Jykge1xuICAgICAgICAgICAgJChcIi5zY3JvbGwtYWN0aW9uLnNjcm9sbC1kb3duXCIpLm9uKFwiY2xpY2tcIixmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgJC5zY3JvbGxpZnkuaW5zdGFudE5leHQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgJChcIi5zY3JvbGwtYWN0aW9uLnNjcm9sbC11cFwiKS5vbihcImNsaWNrXCIsZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICQuc2Nyb2xsaWZ5Lmluc3RhbnRQcmV2aW91cygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBuZXcgTmF2aWdhdGlvbigpO1xuXG59KShqUXVlcnkpO1xuIiwiS2FybmFuID0gS2FybmFuIHx8IHt9O1xuS2FybmFuLk9uZVBhZ2UgPSBLYXJuYW4uT25lUGFnZSB8fCB7fTtcblxuS2FybmFuLk9uZVBhZ2UuUHJlbG9hZGVyID0gKGZ1bmN0aW9uICgkKSB7XG5cbiAgICBmdW5jdGlvbiBQcmVsb2FkZXIoKSB7XG4gICAgICAgIGlmKHRoaXMuaW5DYWNoZSgpKSB7XG4gICAgICAgICAgICAkKCdib2R5JykuYWRkQ2xhc3MoXCJwYWdlLWxvYWRlZCBwcmVsb2FkLXF1aWNrXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJCh3aW5kb3cpLm9uKFwibG9hZFwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkKCdib2R5JykuYWRkQ2xhc3MoXCJwYWdlLWxvYWRlZFwiKS5kZWxheSgxNTAwKS5xdWV1ZShmdW5jdGlvbihuZXh0KXtcbiAgICAgICAgICAgICAgICAgICAgJChcIiNwcmVsb2FkZXJcIikuaGlkZSgwKTtcbiAgICAgICAgICAgICAgICAgICAgbmV4dCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMubWFya0FzQ2FjaGVkKCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgUHJlbG9hZGVyLnByb3RvdHlwZS5pbkNhY2hlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZih0aGlzLmdldENvb2tpZShcImthcm5hbkV4aXN0c0luQ2FjaGVcIikgPT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICBQcmVsb2FkZXIucHJvdG90eXBlLm1hcmtBc0NhY2hlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmFkZENvb2tpZShcImthcm5hbkV4aXN0c0luQ2FjaGVcIiwgMSwgMSk7XG4gICAgfTtcblxuICAgIFByZWxvYWRlci5wcm90b3R5cGUuYWRkQ29va2llID0gZnVuY3Rpb24obmFtZSwgdmFsdWUsIGRheXMpIHtcbiAgICAgICAgdmFyIGV4cGlyZXM7XG4gICAgICAgIGlmIChkYXlzKSB7XG4gICAgICAgICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICBkYXRlLnNldFRpbWUoZGF0ZS5nZXRUaW1lKCkrKGRheXMqMjQqNjAqNjAqMTAwMCkpO1xuICAgICAgICAgICAgZXhwaXJlcyA9IFwiOyBleHBpcmVzPVwiK2RhdGUudG9HTVRTdHJpbmcoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGV4cGlyZXMgPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGRvY3VtZW50LmNvb2tpZSA9IG5hbWUrXCI9XCIrdmFsdWUrZXhwaXJlcytcIjsgcGF0aD0vXCI7XG4gICAgfTtcblxuICAgIFByZWxvYWRlci5wcm90b3R5cGUuZ2V0Q29va2llID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgdmFyIG5hbWVFUSA9IG5hbWUgKyBcIj1cIjtcbiAgICAgICAgdmFyIGNhID0gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7Jyk7XG4gICAgICAgIGZvcih2YXIgaT0wO2kgPCBjYS5sZW5ndGg7aSsrKSB7XG4gICAgICAgICAgICB2YXIgYyA9IGNhW2ldO1xuICAgICAgICAgICAgd2hpbGUgKGMuY2hhckF0KDApID09PSAnICcpIHtcbiAgICAgICAgICAgICAgICBjID0gYy5zdWJzdHJpbmcoMSxjLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYy5pbmRleE9mKG5hbWVFUSkgPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYy5zdWJzdHJpbmcobmFtZUVRLmxlbmd0aCxjLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfTtcblxuICAgIG5ldyBQcmVsb2FkZXIoKTtcblxufSkoalF1ZXJ5KTtcbiIsIkthcm5hbiA9IEthcm5hbiB8fCB7fTtcbkthcm5hbi5PbmVQYWdlID0gS2FybmFuLk9uZVBhZ2UgfHwge307XG5cbkthcm5hbi5PbmVQYWdlLlNjcm9sbFNuYXBwaW5nID0gKGZ1bmN0aW9uICgkKSB7XG5cbiAgICBmdW5jdGlvbiBTY3JvbGxTbmFwcGluZygpIHtcbiAgICAgICAgLy9Ib21lIHBhZ2Ugc29mdCBtb3ZlXG4gICAgICAgIGlmICgkKFwiLm9uZXBhZ2Utc2VjdGlvblwiKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuU3RhcnRTZWN0aW9ucygpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9WaXJ0dWFsIHNlY3Rpb25zIGluc3RhbnQgbW92ZVxuICAgICAgICBpZiAoJChcIi52aXJ0dWFsLXNlY3Rpb25cIikubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLlZpcnR1YWxTZWN0aW9ucygpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9Ub3RhbCBzZWN0aW9uIGNvdW50IChzdGFydGluZyBmb3JtIDApXG4gICAgICAgIHRoaXMuc2VjdGlvbkNvdW50ID0gJChcIi5vbmVwYWdlLXNlY3Rpb25cIikubGVuZ3RoIC0gMTtcblxuICAgICAgICB0aGlzLnN0YXJ0U3RhdGUoKTtcbiAgICAgICAgdGhpcy5tb2RhbEV2ZW50cygpO1xuXG4gICAgICAgIGlmICgkKCdib2R5JykuaGFzQ2xhc3MoJy5ob21lJykpIHtcbiAgICAgICAgICAgICQoJ2FbaHJlZj1cIiNcIl0nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBTY3JvbGxTbmFwcGluZy5wcm90b3R5cGUubW9kYWxFdmVudHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuY3VycmVudFNlY3Rpb24gPSAkLnNjcm9sbGlmeS5jdXJyZW50SW5kZXgoKTtcblxuICAgICAgICAkKCdodG1sJykub24oJ29wZW5Nb2RhbCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2VjdGlvbiA9ICQuc2Nyb2xsaWZ5LmN1cnJlbnRJbmRleCgpO1xuICAgICAgICAgICAgJC5zY3JvbGxpZnkuZGlzYWJsZSgpO1xuICAgICAgICAgICAgZGlzYWJsZUJvZHlTY3JvbGwodHJ1ZSwgJy5tb2RhbDp0YXJnZXQnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJCgnaHRtbCcpLm9uKCdjbG9zZU1vZGFsJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkLnNjcm9sbGlmeS5lbmFibGUoKTtcbiAgICAgICAgICAgIGRpc2FibGVCb2R5U2Nyb2xsKGZhbHNlLCAnLm1vZGFsOnRhcmdldCcpO1xuICAgICAgICAgICAgJC5zY3JvbGxpZnkudXBkYXRlKCk7XG4gICAgICAgICAgICAkLnNjcm9sbGlmeS5pbnN0YW50TW92ZSh0aGlzLmN1cnJlbnRTZWN0aW9uKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIFNjcm9sbFNuYXBwaW5nLnByb3RvdHlwZS5zdGFydFN0YXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvL1NldCBsYXN0IHNlY3Rpb24gYXMgY3VycmVudCBpZiBubyBoYXNoIGlzIGRlZmluZWRcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoID09IFwiI3JcIikge1xuICAgICAgICAgICAgJC5zY3JvbGxpZnkuaW5zdGFudE1vdmUodGhpcy5zZWN0aW9uQ291bnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9BZGQgYWN0aXZlIGNsYXNzXG4gICAgICAgICQuc2Nyb2xsaWZ5LmN1cnJlbnQoKS5hZGRDbGFzcygnYWN0aXZlLXNlY3Rpb24nKTtcblxuICAgICAgICAvL0FkZCB3cmFwcGVyIGNsYXNzXG4gICAgICAgICQoJyNvbmUtcGFnZS1jb250ZW50JykuYWRkQ2xhc3MoJ2FjdGl2ZS1zZWN0aW9uLScgKyAkLnNjcm9sbGlmeS5jdXJyZW50SW5kZXgoKSk7XG5cbiAgICAgICAgLy9BZGQgbmV4dCBjbGFzc1xuICAgICAgICBpZiAoJC5zY3JvbGxpZnkuY3VycmVudEluZGV4KCkgLSAxID4gMCkge1xuICAgICAgICAgICAgJC5zY3JvbGxpZnkuY3VycmVudCgpLnByZXYoKS5hZGRDbGFzcygnbmV4dC1zZWN0aW9uJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvL0FkZCBwcmV2IGNsYXNzXG4gICAgICAgIGlmICgkLnNjcm9sbGlmeS5jdXJyZW50SW5kZXgoKSArIDEgPD0gdGhpcy5zZWN0aW9uQ291bnQpIHtcbiAgICAgICAgICAgICQuc2Nyb2xsaWZ5LmN1cnJlbnQoKS5uZXh0KCkuYWRkQ2xhc3MoJ3ByZXYtc2VjdGlvbicpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIFNjcm9sbFNuYXBwaW5nLnByb3RvdHlwZS51cGRhdGVXcmFwcGVyID0gZnVuY3Rpb24gKGluZGV4LCBzZWN0aW9ucykge1xuICAgICAgICAvL1JlbW92ZSBvbGQgd3JhcHBlciBjbGFzc1xuICAgICAgICAkKCcjb25lLXBhZ2UtY29udGVudCcpLnJlbW92ZUNsYXNzIChmdW5jdGlvbiAoaW5kZXgsIGNsYXNzTmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIChjbGFzc05hbWUubWF0Y2ggKC8oXnxcXHMpYWN0aXZlLXNlY3Rpb24tXFxTKy9nKSB8fCBbXSkuam9pbignICcpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvL0FkZCBhY3RpdmVcbiAgICAgICAgJCgnI29uZS1wYWdlLWNvbnRlbnQnKS5hZGRDbGFzcygnYWN0aXZlLXNlY3Rpb24tJyArIGluZGV4KTtcbiAgICB9O1xuXG4gICAgU2Nyb2xsU25hcHBpbmcucHJvdG90eXBlLnVwZGF0ZUJvZHkgPSBmdW5jdGlvbiAoaW5kZXgsIHNlY3Rpb25zKSB7XG4gICAgICAgIC8vUmVtb3ZlIG9sZCB3cmFwcGVyIGNsYXNzXG4gICAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcyAoZnVuY3Rpb24gKGluZGV4LCBjbGFzc05hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiAoY2xhc3NOYW1lLm1hdGNoICgvKF58XFxzKWFjdGl2ZS1pdGVtLVxcUysvZykgfHwgW10pLmpvaW4oJyAnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9BZGQgYWN0aXZlXG4gICAgICAgICQoJ2JvZHknKS5hZGRDbGFzcygnYWN0aXZlLWl0ZW0tJyArIGluZGV4KTtcbiAgICB9O1xuXG4gICAgU2Nyb2xsU25hcHBpbmcucHJvdG90eXBlLnVwZGF0ZUFjdGl2ZSA9IGZ1bmN0aW9uIChpbmRleCwgc2VjdGlvbnMpIHtcbiAgICAgICAgLy9SZW1vdmUgYWN0aXZlIGNsYXNzXG4gICAgICAgIGlmIChzZWN0aW9uc1soaW5kZXggKyAxKV0gJiYgc2VjdGlvbnNbKGluZGV4ICsgMSldLmhhc0NsYXNzKCdhY3RpdmUtc2VjdGlvbicpKSB7XG4gICAgICAgICAgICBzZWN0aW9uc1soaW5kZXggKyAxKV0ucmVtb3ZlQ2xhc3MoJ2FjdGl2ZS1zZWN0aW9uJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoc2VjdGlvbnNbKGluZGV4IC0gMSldICYmIHNlY3Rpb25zWyhpbmRleCAtIDEpXS5oYXNDbGFzcygnYWN0aXZlLXNlY3Rpb24nKSkge1xuICAgICAgICAgICAgc2VjdGlvbnNbKGluZGV4IC0gMSldLnJlbW92ZUNsYXNzKCdhY3RpdmUtc2VjdGlvbicpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9TZXQgbmV3IGFjdGl2ZSBjbGFzc1xuICAgICAgICBzZWN0aW9uc1tpbmRleF0uYWRkQ2xhc3MoJ2FjdGl2ZS1zZWN0aW9uJyk7XG4gICAgfTtcblxuICAgIFNjcm9sbFNuYXBwaW5nLnByb3RvdHlwZS51cGRhdGVOZXh0ID0gZnVuY3Rpb24gKGluZGV4LCBzZWN0aW9ucykge1xuICAgICAgICAvL1JlbW92ZSBvbGQgbmV4dFxuICAgICAgICBpZiAoJCgnLm5leHQtc2VjdGlvbicpKSB7XG4gICAgICAgICAgICAkKCcubmV4dC1zZWN0aW9uJykucmVtb3ZlQ2xhc3MoJ25leHQtc2VjdGlvbicpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9TZXQgbmV3IG5leHRcbiAgICAgICAgaWYgKHNlY3Rpb25zWyhpbmRleCAtIDEpXSkge1xuICAgICAgICAgICAgc2VjdGlvbnNbKGluZGV4IC0gMSldLmFkZENsYXNzKCduZXh0LXNlY3Rpb24nKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBTY3JvbGxTbmFwcGluZy5wcm90b3R5cGUudXBkYXRlUHJldiA9IGZ1bmN0aW9uIChpbmRleCwgc2VjdGlvbnMpIHtcbiAgICAgICAgLy9SZW1vdmUgb2xkIHByZXZcbiAgICAgICAgaWYgKCQoJy5wcmV2LXNlY3Rpb24nKSkge1xuICAgICAgICAgICAgJCgnLnByZXYtc2VjdGlvbicpLnJlbW92ZUNsYXNzKCdwcmV2LXNlY3Rpb24nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vU2V0IG5ldyBuZXh0XG4gICAgICAgIGlmIChzZWN0aW9uc1soaW5kZXggKyAxKV0pIHtcbiAgICAgICAgICAgIHNlY3Rpb25zWyhpbmRleCArIDEpXS5hZGRDbGFzcygncHJldi1zZWN0aW9uJyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgU2Nyb2xsU25hcHBpbmcucHJvdG90eXBlLlN0YXJ0U2VjdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgdmFyIHNjcm9sbFNwZWVkID0gODAwO1xuXG4gICAgICAgICQuc2Nyb2xsaWZ5KHtcbiAgICAgICAgICAgIHNldEhlaWdodHMgOiB0cnVlLFxuICAgICAgICAgICAgc2VjdGlvbiA6IFwiLm9uZXBhZ2Utc2VjdGlvblwiLFxuICAgICAgICAgICAgc2VjdGlvbk5hbWUgOiBcInNlY3Rpb24tbmFtZVwiLFxuICAgICAgICAgICAgc2Nyb2xsU3BlZWQ6IHNjcm9sbFNwZWVkLFxuICAgICAgICAgICAgZWFzaW5nOiBcImVhc2VPdXRFeHBvXCIsXG4gICAgICAgICAgICBzdGFuZGFyZFNjcm9sbEVsZW1lbnRzOiBcIi5tb2RhbC1rYXJuYW5cIixcbiAgICAgICAgICAgIGJlZm9yZTogZnVuY3Rpb24oaW5kZXgsIHNlY3Rpb25zKSB7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVBY3RpdmUoaW5kZXgsIHNlY3Rpb25zKTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZU5leHQoaW5kZXgsIHNlY3Rpb25zKTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVByZXYoaW5kZXgsIHNlY3Rpb25zKTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVdyYXBwZXIoaW5kZXgsIHNlY3Rpb25zKTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUJvZHkoaW5kZXgsIHNlY3Rpb25zKTtcblxuICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3Njcm9sbGlmeVN0YXJ0JywgW2luZGV4LCBzZWN0aW9ucywgc2Nyb2xsU3BlZWQsICdvbmVwYWdlJ10pO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgYWZ0ZXI6IGZ1bmN0aW9uKGluZGV4LCBzZWN0aW9ucykge1xuXG4gICAgICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcignc2Nyb2xsaWZ5U3RvcCcsIFtpbmRleCwgc2VjdGlvbnMsIHNjcm9sbFNwZWVkLCAnb25lcGFnZSddKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgU2Nyb2xsU25hcHBpbmcucHJvdG90eXBlLlZpcnR1YWxTZWN0aW9ucyA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICB2YXIgc2Nyb2xsU3BlZWQgPSA4MDA7XG5cbiAgICAgICAgJC5zY3JvbGxpZnkoe1xuICAgICAgICAgICAgc2VjdGlvbiA6IFwiLnZpcnR1YWwtc2VjdGlvblwiLFxuICAgICAgICAgICAgc2VjdGlvbk5hbWUgOiBcInNlY3Rpb24tbmFtZVwiLFxuICAgICAgICAgICAgc2Nyb2xsU3BlZWQ6IHNjcm9sbFNwZWVkLFxuICAgICAgICAgICAgYmVmb3JlOiBmdW5jdGlvbihpbmRleCwgc2VjdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAkKFwiLmNvbnRhaW5lclwiLCBcInNlY3Rpb25cIikubm90KFwiOmVxKFwiICsgaW5kZXggKyBcIilcIikuYWRkQ2xhc3MoJ2ZhZGUtb3V0Jyk7XG4gICAgICAgICAgICAgICAgJChcIi5jb250YWluZXJcIiwgXCJzZWN0aW9uOmVxKFwiICsgaW5kZXggKyBcIilcIikucmVtb3ZlQ2xhc3MoJ2ZhZGUtb3V0JykuYWRkQ2xhc3MoJ2ZhZGUtaW4nKTtcbiAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCdzY3JvbGxpZnlTdGFydCcsIFtpbmRleCwgc2VjdGlvbnMsIHNjcm9sbFNwZWVkLCAndmlydHVhbCddKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcbiAgICAgICAgICAgIGFmdGVyOiBmdW5jdGlvbihpbmRleCwgc2VjdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAkKFwiLmNvbnRhaW5lclwiLCBcInNlY3Rpb246ZXEoXCIgKyBpbmRleCArIFwiKVwiKS5yZW1vdmVDbGFzcygnZmFkZS1pbicpO1xuICAgICAgICAgICAgICAgIH0sIDgwMCk7XG4gICAgICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcignc2Nyb2xsaWZ5U3RvcCcsIFtpbmRleCwgc2VjdGlvbnMsIHNjcm9sbFNwZWVkLCAndmlydHVhbCddKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxuICAgICAgICB9KTtcblxuICAgIH0uYmluZCh0aGlzKTtcblxuICAgIG5ldyBTY3JvbGxTbmFwcGluZygpO1xuXG59KShqUXVlcnkpO1xuIl19
