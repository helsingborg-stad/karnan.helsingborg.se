var Karnan;

Karnan = Karnan || {};
Karnan.OnePage = Karnan.OnePage || {};

Karnan.OnePage.GalleryPopup = (function ($) {
    function GalleryPopup() {
        this.openModalOnClose();
        this.disableCloseButton();
    }

    GalleryPopup.prototype.openModalOnClose = function () {
        $('.js-close-target').on('click', function(e) {
            var hash = $(this).attr('data-close-target');

            $(document).on('closeLightBox', function() {

                  window.location.hash = hash;

            });
        });
    };

    GalleryPopup.prototype.disableCloseButton = function () {
        $(document).on('click', '#lightbox .btn-close', function(e) {
            e.preventDefault();
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
            if (!$('html').hasClass('gallery-hidden')) {
                $.scrollify.enable();
                disableBodyScroll(false, '.modal:target');
                $.scrollify.update();
                $.scrollify.instantMove(this.currentSection);
            }
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIl9hcHAuanMiLCJnYWxsZXJ5UG9wdXAuanMiLCJvbmVQYWdlR29Ub1ZpZGVvLmpzIiwib25lUGFnZU5hdmlnYXRpb24uanMiLCJvbmVQYWdlUHJlbG9hZGVyLmpzIiwib25lUGFnZVNjcm9sbFNuYXBwaW5nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIEthcm5hbjtcbiIsIkthcm5hbiA9IEthcm5hbiB8fCB7fTtcbkthcm5hbi5PbmVQYWdlID0gS2FybmFuLk9uZVBhZ2UgfHwge307XG5cbkthcm5hbi5PbmVQYWdlLkdhbGxlcnlQb3B1cCA9IChmdW5jdGlvbiAoJCkge1xuICAgIGZ1bmN0aW9uIEdhbGxlcnlQb3B1cCgpIHtcbiAgICAgICAgdGhpcy5vcGVuTW9kYWxPbkNsb3NlKCk7XG4gICAgICAgIHRoaXMuZGlzYWJsZUNsb3NlQnV0dG9uKCk7XG4gICAgfVxuXG4gICAgR2FsbGVyeVBvcHVwLnByb3RvdHlwZS5vcGVuTW9kYWxPbkNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAkKCcuanMtY2xvc2UtdGFyZ2V0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdmFyIGhhc2ggPSAkKHRoaXMpLmF0dHIoJ2RhdGEtY2xvc2UtdGFyZ2V0Jyk7XG5cbiAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKCdjbG9zZUxpZ2h0Qm94JywgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gaGFzaDtcblxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBHYWxsZXJ5UG9wdXAucHJvdG90eXBlLmRpc2FibGVDbG9zZUJ1dHRvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJyNsaWdodGJveCAuYnRuLWNsb3NlJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgbmV3IEdhbGxlcnlQb3B1cCgpO1xuXG5cbn0pKGpRdWVyeSk7XG4iLCJLYXJuYW4gPSBLYXJuYW4gfHwge307XG5LYXJuYW4uT25lUGFnZSA9IEthcm5hbi5PbmVQYWdlIHx8IHt9O1xuXG5LYXJuYW4uT25lUGFnZS5Hb1RvVmlkZW8gPSAoZnVuY3Rpb24gKCQpIHtcbiAgICBmdW5jdGlvbiBHb1RvVmlkZW8oKSB7XG4gICAgICAgICQoXCIjZ28tdG8tbGl2ZVwiKS5vbignY2xpY2snLCBmdW5jdGlvbihlKXtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICQuc2Nyb2xsaWZ5Lm1vdmUoJCh0aGlzKS5hdHRyKCdocmVmJykpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZighJChcIiNsaXZlLXNlY3Rpb25cIikubGVuZ3RoKSB7XG4gICAgICAgICAgICAkKFwiI2dvLXRvLWxpdmVcIikuaGlkZSgwKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBuZXcgR29Ub1ZpZGVvKCk7XG5cbn0pKGpRdWVyeSk7XG4iLCJLYXJuYW4gPSBLYXJuYW4gfHwge307XG5LYXJuYW4uT25lUGFnZSA9IEthcm5hbi5PbmVQYWdlIHx8IHt9O1xuXG5LYXJuYW4uT25lUGFnZS5OYXZpZ2F0aW9uID0gKGZ1bmN0aW9uICgkKSB7XG5cbiAgICBmdW5jdGlvbiBOYXZpZ2F0aW9uKCkge1xuXG4gICAgICAgIC8vSG9tZSBwYWdlIHNvZnQgbW92ZVxuICAgICAgICBpZiAoJChcIi5vbmVwYWdlLXNlY3Rpb25cIikubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLmhpZ2h0bGlnaHREaXJlY3Rpb25BcnJvd3MoMCwgJChcIi5vbmVwYWdlLXNlY3Rpb25cIikubGVuZ3RoKTtcbiAgICAgICAgICAgIHRoaXMuYmluZERpcmVjdGlvbkFycm93KCdzb2Z0Jyk7XG4gICAgICAgICAgICB0aGlzLmJpbmRFbGV2YXRvcignc29mdCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9WaXJ0dWFsIHNlY3Rpb25zIGluc3RhbnQgbW92ZVxuICAgICAgICBpZiAoJChcIi52aXJ0dWFsLXNlY3Rpb25cIikubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLmhpZ2h0bGlnaHREaXJlY3Rpb25BcnJvd3MoMCwgJChcIi52aXJ0dWFsLXNlY3Rpb25cIikubGVuZ3RoKTtcbiAgICAgICAgICAgIHRoaXMuYmluZERpcmVjdGlvbkFycm93KCdpbnN0YW50Jyk7XG4gICAgICAgICAgICB0aGlzLmJpbmRFbGV2YXRvcignaW5zdGFudCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVXNlIGhvb2tzIGluIG9uZSBwYWdlIHNjcm9sbCAoc3RhcnQpXG4gICAgICAgICQoZG9jdW1lbnQpLmJpbmQoJ3Njcm9sbGlmeVN0YXJ0JyxmdW5jdGlvbihldmVudCwgc2VnbWVudEluZGV4LCBzZWdtZW50cywgc2Nyb2xsU3BlZWQpIHtcbiAgICAgICAgICAgIHRoaXMuaGlnaHRsaWdodERpcmVjdGlvbkFycm93cyhzZWdtZW50SW5kZXgsIHNlZ21lbnRzLmxlbmd0aCk7XG4gICAgICAgICAgICB0aGlzLmhpZ2h0bGlnaHRQYWdpbmF0aW9uKHNlZ21lbnRJbmRleCwgc2VnbWVudHMpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIC8vQWRkIGFjdGl2ZSBjbGFzcyB0byBsYXN0IGl0ZW1cbiAgICAgICAgaWYoISQoXCIuc2Nyb2xsLWV2ZWxhdG9yLmFjdGl2ZVwiKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICQoXCIuc2Nyb2xsLWV2ZWxhdG9yLmlzLWxhc3RcIikuYWRkQ2xhc3MoXCJhY3RpdmVcIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBOYXZpZ2F0aW9uLnByb3RvdHlwZS5oaWdodGxpZ2h0RGlyZWN0aW9uQXJyb3dzID0gZnVuY3Rpb24gKGluZGV4LCBzZWdtZW50cykge1xuXG4gICAgICAgIC8vVGhpcyBpcyB0aGUgZmlyc3QgaXRlbVxuICAgICAgICBpZihpbmRleCA9PSAwKSB7XG4gICAgICAgICAgICAkKCcuc2Nyb2xsLWFjdGlvbi5zY3JvbGwtdXAnKS5hZGRDbGFzcygnYW5pbWF0aW9uLWRpc2FibGUnKS5mYWRlT3V0KDcwMCxmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2Rpc2FibGVkJykucmVtb3ZlQXR0cignc3R5bGUnKS5yZW1vdmVDbGFzcygnYW5pbWF0aW9uLWRpc2FibGUnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJCgnLnNjcm9sbC1hY3Rpb24uc2Nyb2xsLXVwJykucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkIGFuaW1hdGlvbi1kaXNhYmxlJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvL1RoaXMgaXMgdGhlIGxhc3QgaXRlbVxuICAgICAgICBpZihzZWdtZW50cyA9PSBpbmRleCArIDEpIHtcbiAgICAgICAgICAgICQoJy5zY3JvbGwtYWN0aW9uLnNjcm9sbC1kb3duJykuYWRkQ2xhc3MoJ2FuaW1hdGlvbi1kaXNhYmxlJykuZmFkZU91dCg3MDAsZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdkaXNhYmxlZCcpLnJlbW92ZUF0dHIoJ3N0eWxlJykucmVtb3ZlQ2xhc3MoJ2FuaW1hdGlvbi1kaXNhYmxlJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQoJy5zY3JvbGwtYWN0aW9uLnNjcm9sbC1kb3duJykucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkIGFuaW1hdGlvbi1kaXNhYmxlJyk7XG4gICAgICAgIH1cblxuICAgIH0uYmluZCh0aGlzKTtcblxuICAgIE5hdmlnYXRpb24ucHJvdG90eXBlLmhpZ2h0bGlnaHRQYWdpbmF0aW9uID0gZnVuY3Rpb24gKGluZGV4LCBzZWdtZW50cykge1xuICAgICAgICAkKFwiI29uZS1wYWdlLWVsZXZhdG9yIGxpXCIpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xuICAgICAgICAkKFwiI29uZS1wYWdlLWVsZXZhdG9yIGxpOmVxKFwiICtpbmRleCsgXCIpXCIpLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xuICAgIH07XG5cbiAgICBOYXZpZ2F0aW9uLnByb3RvdHlwZS5iaW5kRWxldmF0b3IgPSBmdW5jdGlvbiAodHlwZSkge1xuXG4gICAgICAgIGlmKHR5cGUgPT0gJ3NvZnQnKSB7XG4gICAgICAgICAgICAkKFwiI29uZS1wYWdlLWVsZXZhdG9yIGFcIikub24oXCJjbGlja1wiLGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBpZighJChcImJvZHlcIikuaGFzQ2xhc3MoXCJsb2NrLXNjcm9sbFwiKSkge1xuICAgICAgICAgICAgICAgICAgICAkLnNjcm9sbGlmeS5tb3ZlKCQodGhpcykuYXR0cihcImhyZWZcIikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYodHlwZSA9PSAnaW5zdGFudCcpIHtcbiAgICAgICAgICAgICQoXCIjb25lLXBhZ2UtZWxldmF0b3IgYVwiKS5vbihcImNsaWNrXCIsZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGlmKCEkKFwiYm9keVwiKS5oYXNDbGFzcyhcImxvY2stc2Nyb2xsXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICQuc2Nyb2xsaWZ5Lmluc3RhbnRNb3ZlKCQodGhpcykuYXR0cihcImhyZWZcIikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgTmF2aWdhdGlvbi5wcm90b3R5cGUuYmluZERpcmVjdGlvbkFycm93ID0gZnVuY3Rpb24gKHR5cGUpIHtcblxuICAgICAgICBpZih0eXBlID09ICdzb2Z0Jykge1xuICAgICAgICAgICAgJChcIi5zY3JvbGwtYWN0aW9uLnNjcm9sbC1kb3duXCIpLm9uKFwiY2xpY2tcIixmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgJC5zY3JvbGxpZnkubmV4dCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAkKFwiLnNjcm9sbC1hY3Rpb24uc2Nyb2xsLXVwXCIpLm9uKFwiY2xpY2tcIixmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgJC5zY3JvbGxpZnkucHJldmlvdXMoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYodHlwZSA9PSAnaW5zdGFudCcpIHtcbiAgICAgICAgICAgICQoXCIuc2Nyb2xsLWFjdGlvbi5zY3JvbGwtZG93blwiKS5vbihcImNsaWNrXCIsZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICQuc2Nyb2xsaWZ5Lmluc3RhbnROZXh0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICQoXCIuc2Nyb2xsLWFjdGlvbi5zY3JvbGwtdXBcIikub24oXCJjbGlja1wiLGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAkLnNjcm9sbGlmeS5pbnN0YW50UHJldmlvdXMoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgbmV3IE5hdmlnYXRpb24oKTtcblxufSkoalF1ZXJ5KTtcbiIsIkthcm5hbiA9IEthcm5hbiB8fCB7fTtcbkthcm5hbi5PbmVQYWdlID0gS2FybmFuLk9uZVBhZ2UgfHwge307XG5cbkthcm5hbi5PbmVQYWdlLlByZWxvYWRlciA9IChmdW5jdGlvbiAoJCkge1xuXG4gICAgZnVuY3Rpb24gUHJlbG9hZGVyKCkge1xuICAgICAgICBpZih0aGlzLmluQ2FjaGUoKSkge1xuICAgICAgICAgICAgJCgnYm9keScpLmFkZENsYXNzKFwicGFnZS1sb2FkZWQgcHJlbG9hZC1xdWlja1wiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQod2luZG93KS5vbihcImxvYWRcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJCgnYm9keScpLmFkZENsYXNzKFwicGFnZS1sb2FkZWRcIikuZGVsYXkoMTUwMCkucXVldWUoZnVuY3Rpb24obmV4dCl7XG4gICAgICAgICAgICAgICAgICAgICQoXCIjcHJlbG9hZGVyXCIpLmhpZGUoMCk7XG4gICAgICAgICAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLm1hcmtBc0NhY2hlZCgpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIFByZWxvYWRlci5wcm90b3R5cGUuaW5DYWNoZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYodGhpcy5nZXRDb29raWUoXCJrYXJuYW5FeGlzdHNJbkNhY2hlXCIpID09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgUHJlbG9hZGVyLnByb3RvdHlwZS5tYXJrQXNDYWNoZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5hZGRDb29raWUoXCJrYXJuYW5FeGlzdHNJbkNhY2hlXCIsIDEsIDEpO1xuICAgIH07XG5cbiAgICBQcmVsb2FkZXIucHJvdG90eXBlLmFkZENvb2tpZSA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBkYXlzKSB7XG4gICAgICAgIHZhciBleHBpcmVzO1xuICAgICAgICBpZiAoZGF5cykge1xuICAgICAgICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgZGF0ZS5zZXRUaW1lKGRhdGUuZ2V0VGltZSgpKyhkYXlzKjI0KjYwKjYwKjEwMDApKTtcbiAgICAgICAgICAgIGV4cGlyZXMgPSBcIjsgZXhwaXJlcz1cIitkYXRlLnRvR01UU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBleHBpcmVzID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBkb2N1bWVudC5jb29raWUgPSBuYW1lK1wiPVwiK3ZhbHVlK2V4cGlyZXMrXCI7IHBhdGg9L1wiO1xuICAgIH07XG5cbiAgICBQcmVsb2FkZXIucHJvdG90eXBlLmdldENvb2tpZSA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIHZhciBuYW1lRVEgPSBuYW1lICsgXCI9XCI7XG4gICAgICAgIHZhciBjYSA9IGRvY3VtZW50LmNvb2tpZS5zcGxpdCgnOycpO1xuICAgICAgICBmb3IodmFyIGk9MDtpIDwgY2EubGVuZ3RoO2krKykge1xuICAgICAgICAgICAgdmFyIGMgPSBjYVtpXTtcbiAgICAgICAgICAgIHdoaWxlIChjLmNoYXJBdCgwKSA9PT0gJyAnKSB7XG4gICAgICAgICAgICAgICAgYyA9IGMuc3Vic3RyaW5nKDEsYy5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGMuaW5kZXhPZihuYW1lRVEpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGMuc3Vic3RyaW5nKG5hbWVFUS5sZW5ndGgsYy5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG5cbiAgICBuZXcgUHJlbG9hZGVyKCk7XG5cbn0pKGpRdWVyeSk7XG4iLCJLYXJuYW4gPSBLYXJuYW4gfHwge307XG5LYXJuYW4uT25lUGFnZSA9IEthcm5hbi5PbmVQYWdlIHx8IHt9O1xuXG5LYXJuYW4uT25lUGFnZS5TY3JvbGxTbmFwcGluZyA9IChmdW5jdGlvbiAoJCkge1xuXG4gICAgZnVuY3Rpb24gU2Nyb2xsU25hcHBpbmcoKSB7XG4gICAgICAgIC8vSG9tZSBwYWdlIHNvZnQgbW92ZVxuICAgICAgICBpZiAoJChcIi5vbmVwYWdlLXNlY3Rpb25cIikubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLlN0YXJ0U2VjdGlvbnMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vVmlydHVhbCBzZWN0aW9ucyBpbnN0YW50IG1vdmVcbiAgICAgICAgaWYgKCQoXCIudmlydHVhbC1zZWN0aW9uXCIpLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5WaXJ0dWFsU2VjdGlvbnMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vVG90YWwgc2VjdGlvbiBjb3VudCAoc3RhcnRpbmcgZm9ybSAwKVxuICAgICAgICB0aGlzLnNlY3Rpb25Db3VudCA9ICQoXCIub25lcGFnZS1zZWN0aW9uXCIpLmxlbmd0aCAtIDE7XG5cbiAgICAgICAgdGhpcy5zdGFydFN0YXRlKCk7XG4gICAgICAgIHRoaXMubW9kYWxFdmVudHMoKTtcblxuICAgICAgICBpZiAoJCgnYm9keScpLmhhc0NsYXNzKCcuaG9tZScpKSB7XG4gICAgICAgICAgICAkKCdhW2hyZWY9XCIjXCJdJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgU2Nyb2xsU25hcHBpbmcucHJvdG90eXBlLm1vZGFsRXZlbnRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmN1cnJlbnRTZWN0aW9uID0gJC5zY3JvbGxpZnkuY3VycmVudEluZGV4KCk7XG5cbiAgICAgICAgJCgnaHRtbCcpLm9uKCdvcGVuTW9kYWwnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNlY3Rpb24gPSAkLnNjcm9sbGlmeS5jdXJyZW50SW5kZXgoKTtcbiAgICAgICAgICAgICQuc2Nyb2xsaWZ5LmRpc2FibGUoKTtcbiAgICAgICAgICAgIGRpc2FibGVCb2R5U2Nyb2xsKHRydWUsICcubW9kYWw6dGFyZ2V0Jyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICQoJ2h0bWwnKS5vbignY2xvc2VNb2RhbCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKCEkKCdodG1sJykuaGFzQ2xhc3MoJ2dhbGxlcnktaGlkZGVuJykpIHtcbiAgICAgICAgICAgICAgICAkLnNjcm9sbGlmeS5lbmFibGUoKTtcbiAgICAgICAgICAgICAgICBkaXNhYmxlQm9keVNjcm9sbChmYWxzZSwgJy5tb2RhbDp0YXJnZXQnKTtcbiAgICAgICAgICAgICAgICAkLnNjcm9sbGlmeS51cGRhdGUoKTtcbiAgICAgICAgICAgICAgICAkLnNjcm9sbGlmeS5pbnN0YW50TW92ZSh0aGlzLmN1cnJlbnRTZWN0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIFNjcm9sbFNuYXBwaW5nLnByb3RvdHlwZS5zdGFydFN0YXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvL1NldCBsYXN0IHNlY3Rpb24gYXMgY3VycmVudCBpZiBubyBoYXNoIGlzIGRlZmluZWRcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoID09IFwiI3JcIikge1xuICAgICAgICAgICAgJC5zY3JvbGxpZnkuaW5zdGFudE1vdmUodGhpcy5zZWN0aW9uQ291bnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9BZGQgYWN0aXZlIGNsYXNzXG4gICAgICAgICQuc2Nyb2xsaWZ5LmN1cnJlbnQoKS5hZGRDbGFzcygnYWN0aXZlLXNlY3Rpb24nKTtcblxuICAgICAgICAvL0FkZCB3cmFwcGVyIGNsYXNzXG4gICAgICAgICQoJyNvbmUtcGFnZS1jb250ZW50JykuYWRkQ2xhc3MoJ2FjdGl2ZS1zZWN0aW9uLScgKyAkLnNjcm9sbGlmeS5jdXJyZW50SW5kZXgoKSk7XG5cbiAgICAgICAgLy9BZGQgbmV4dCBjbGFzc1xuICAgICAgICBpZiAoJC5zY3JvbGxpZnkuY3VycmVudEluZGV4KCkgLSAxID4gMCkge1xuICAgICAgICAgICAgJC5zY3JvbGxpZnkuY3VycmVudCgpLnByZXYoKS5hZGRDbGFzcygnbmV4dC1zZWN0aW9uJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvL0FkZCBwcmV2IGNsYXNzXG4gICAgICAgIGlmICgkLnNjcm9sbGlmeS5jdXJyZW50SW5kZXgoKSArIDEgPD0gdGhpcy5zZWN0aW9uQ291bnQpIHtcbiAgICAgICAgICAgICQuc2Nyb2xsaWZ5LmN1cnJlbnQoKS5uZXh0KCkuYWRkQ2xhc3MoJ3ByZXYtc2VjdGlvbicpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIFNjcm9sbFNuYXBwaW5nLnByb3RvdHlwZS51cGRhdGVXcmFwcGVyID0gZnVuY3Rpb24gKGluZGV4LCBzZWN0aW9ucykge1xuICAgICAgICAvL1JlbW92ZSBvbGQgd3JhcHBlciBjbGFzc1xuICAgICAgICAkKCcjb25lLXBhZ2UtY29udGVudCcpLnJlbW92ZUNsYXNzIChmdW5jdGlvbiAoaW5kZXgsIGNsYXNzTmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIChjbGFzc05hbWUubWF0Y2ggKC8oXnxcXHMpYWN0aXZlLXNlY3Rpb24tXFxTKy9nKSB8fCBbXSkuam9pbignICcpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvL0FkZCBhY3RpdmVcbiAgICAgICAgJCgnI29uZS1wYWdlLWNvbnRlbnQnKS5hZGRDbGFzcygnYWN0aXZlLXNlY3Rpb24tJyArIGluZGV4KTtcbiAgICB9O1xuXG4gICAgU2Nyb2xsU25hcHBpbmcucHJvdG90eXBlLnVwZGF0ZUJvZHkgPSBmdW5jdGlvbiAoaW5kZXgsIHNlY3Rpb25zKSB7XG4gICAgICAgIC8vUmVtb3ZlIG9sZCB3cmFwcGVyIGNsYXNzXG4gICAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcyAoZnVuY3Rpb24gKGluZGV4LCBjbGFzc05hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiAoY2xhc3NOYW1lLm1hdGNoICgvKF58XFxzKWFjdGl2ZS1pdGVtLVxcUysvZykgfHwgW10pLmpvaW4oJyAnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9BZGQgYWN0aXZlXG4gICAgICAgICQoJ2JvZHknKS5hZGRDbGFzcygnYWN0aXZlLWl0ZW0tJyArIGluZGV4KTtcbiAgICB9O1xuXG4gICAgU2Nyb2xsU25hcHBpbmcucHJvdG90eXBlLnVwZGF0ZUFjdGl2ZSA9IGZ1bmN0aW9uIChpbmRleCwgc2VjdGlvbnMpIHtcbiAgICAgICAgLy9SZW1vdmUgYWN0aXZlIGNsYXNzXG4gICAgICAgIGlmIChzZWN0aW9uc1soaW5kZXggKyAxKV0gJiYgc2VjdGlvbnNbKGluZGV4ICsgMSldLmhhc0NsYXNzKCdhY3RpdmUtc2VjdGlvbicpKSB7XG4gICAgICAgICAgICBzZWN0aW9uc1soaW5kZXggKyAxKV0ucmVtb3ZlQ2xhc3MoJ2FjdGl2ZS1zZWN0aW9uJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoc2VjdGlvbnNbKGluZGV4IC0gMSldICYmIHNlY3Rpb25zWyhpbmRleCAtIDEpXS5oYXNDbGFzcygnYWN0aXZlLXNlY3Rpb24nKSkge1xuICAgICAgICAgICAgc2VjdGlvbnNbKGluZGV4IC0gMSldLnJlbW92ZUNsYXNzKCdhY3RpdmUtc2VjdGlvbicpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9TZXQgbmV3IGFjdGl2ZSBjbGFzc1xuICAgICAgICBzZWN0aW9uc1tpbmRleF0uYWRkQ2xhc3MoJ2FjdGl2ZS1zZWN0aW9uJyk7XG4gICAgfTtcblxuICAgIFNjcm9sbFNuYXBwaW5nLnByb3RvdHlwZS51cGRhdGVOZXh0ID0gZnVuY3Rpb24gKGluZGV4LCBzZWN0aW9ucykge1xuICAgICAgICAvL1JlbW92ZSBvbGQgbmV4dFxuICAgICAgICBpZiAoJCgnLm5leHQtc2VjdGlvbicpKSB7XG4gICAgICAgICAgICAkKCcubmV4dC1zZWN0aW9uJykucmVtb3ZlQ2xhc3MoJ25leHQtc2VjdGlvbicpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9TZXQgbmV3IG5leHRcbiAgICAgICAgaWYgKHNlY3Rpb25zWyhpbmRleCAtIDEpXSkge1xuICAgICAgICAgICAgc2VjdGlvbnNbKGluZGV4IC0gMSldLmFkZENsYXNzKCduZXh0LXNlY3Rpb24nKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBTY3JvbGxTbmFwcGluZy5wcm90b3R5cGUudXBkYXRlUHJldiA9IGZ1bmN0aW9uIChpbmRleCwgc2VjdGlvbnMpIHtcbiAgICAgICAgLy9SZW1vdmUgb2xkIHByZXZcbiAgICAgICAgaWYgKCQoJy5wcmV2LXNlY3Rpb24nKSkge1xuICAgICAgICAgICAgJCgnLnByZXYtc2VjdGlvbicpLnJlbW92ZUNsYXNzKCdwcmV2LXNlY3Rpb24nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vU2V0IG5ldyBuZXh0XG4gICAgICAgIGlmIChzZWN0aW9uc1soaW5kZXggKyAxKV0pIHtcbiAgICAgICAgICAgIHNlY3Rpb25zWyhpbmRleCArIDEpXS5hZGRDbGFzcygncHJldi1zZWN0aW9uJyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgU2Nyb2xsU25hcHBpbmcucHJvdG90eXBlLlN0YXJ0U2VjdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgdmFyIHNjcm9sbFNwZWVkID0gODAwO1xuXG4gICAgICAgICQuc2Nyb2xsaWZ5KHtcbiAgICAgICAgICAgIHNldEhlaWdodHMgOiB0cnVlLFxuICAgICAgICAgICAgc2VjdGlvbiA6IFwiLm9uZXBhZ2Utc2VjdGlvblwiLFxuICAgICAgICAgICAgc2VjdGlvbk5hbWUgOiBcInNlY3Rpb24tbmFtZVwiLFxuICAgICAgICAgICAgc2Nyb2xsU3BlZWQ6IHNjcm9sbFNwZWVkLFxuICAgICAgICAgICAgZWFzaW5nOiBcImVhc2VPdXRFeHBvXCIsXG4gICAgICAgICAgICBzdGFuZGFyZFNjcm9sbEVsZW1lbnRzOiBcIi5tb2RhbC1rYXJuYW5cIixcbiAgICAgICAgICAgIGJlZm9yZTogZnVuY3Rpb24oaW5kZXgsIHNlY3Rpb25zKSB7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVBY3RpdmUoaW5kZXgsIHNlY3Rpb25zKTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZU5leHQoaW5kZXgsIHNlY3Rpb25zKTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVByZXYoaW5kZXgsIHNlY3Rpb25zKTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVdyYXBwZXIoaW5kZXgsIHNlY3Rpb25zKTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUJvZHkoaW5kZXgsIHNlY3Rpb25zKTtcblxuICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3Njcm9sbGlmeVN0YXJ0JywgW2luZGV4LCBzZWN0aW9ucywgc2Nyb2xsU3BlZWQsICdvbmVwYWdlJ10pO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgYWZ0ZXI6IGZ1bmN0aW9uKGluZGV4LCBzZWN0aW9ucykge1xuXG4gICAgICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcignc2Nyb2xsaWZ5U3RvcCcsIFtpbmRleCwgc2VjdGlvbnMsIHNjcm9sbFNwZWVkLCAnb25lcGFnZSddKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgU2Nyb2xsU25hcHBpbmcucHJvdG90eXBlLlZpcnR1YWxTZWN0aW9ucyA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICB2YXIgc2Nyb2xsU3BlZWQgPSA4MDA7XG5cbiAgICAgICAgJC5zY3JvbGxpZnkoe1xuICAgICAgICAgICAgc2VjdGlvbiA6IFwiLnZpcnR1YWwtc2VjdGlvblwiLFxuICAgICAgICAgICAgc2VjdGlvbk5hbWUgOiBcInNlY3Rpb24tbmFtZVwiLFxuICAgICAgICAgICAgc2Nyb2xsU3BlZWQ6IHNjcm9sbFNwZWVkLFxuICAgICAgICAgICAgYmVmb3JlOiBmdW5jdGlvbihpbmRleCwgc2VjdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAkKFwiLmNvbnRhaW5lclwiLCBcInNlY3Rpb25cIikubm90KFwiOmVxKFwiICsgaW5kZXggKyBcIilcIikuYWRkQ2xhc3MoJ2ZhZGUtb3V0Jyk7XG4gICAgICAgICAgICAgICAgJChcIi5jb250YWluZXJcIiwgXCJzZWN0aW9uOmVxKFwiICsgaW5kZXggKyBcIilcIikucmVtb3ZlQ2xhc3MoJ2ZhZGUtb3V0JykuYWRkQ2xhc3MoJ2ZhZGUtaW4nKTtcbiAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCdzY3JvbGxpZnlTdGFydCcsIFtpbmRleCwgc2VjdGlvbnMsIHNjcm9sbFNwZWVkLCAndmlydHVhbCddKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcbiAgICAgICAgICAgIGFmdGVyOiBmdW5jdGlvbihpbmRleCwgc2VjdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAkKFwiLmNvbnRhaW5lclwiLCBcInNlY3Rpb246ZXEoXCIgKyBpbmRleCArIFwiKVwiKS5yZW1vdmVDbGFzcygnZmFkZS1pbicpO1xuICAgICAgICAgICAgICAgIH0sIDgwMCk7XG4gICAgICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcignc2Nyb2xsaWZ5U3RvcCcsIFtpbmRleCwgc2VjdGlvbnMsIHNjcm9sbFNwZWVkLCAndmlydHVhbCddKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxuICAgICAgICB9KTtcblxuICAgIH0uYmluZCh0aGlzKTtcblxuICAgIG5ldyBTY3JvbGxTbmFwcGluZygpO1xuXG59KShqUXVlcnkpO1xuIl19
