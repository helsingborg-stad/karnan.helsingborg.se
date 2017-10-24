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

        var scrollSpeed = 1200;

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

        //Bind navigation clicks
        this.bindSoftMove();
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

        //Bind navigation clicks
        this.bindInstantMove();

    }.bind(this);

    ScrollSnapping.prototype.bindSoftMove = function () {
        $("#one-page-elevator a").on("click",function(event) {

            event.preventDefault();

            if(!$("body").hasClass("lock-scroll")) {
                $.scrollify.move($(this).attr("href"));
            }

        });
    };

    ScrollSnapping.prototype.bindInstantMove = function () {
        $("#one-page-elevator a").on("click",function(event) {

            event.preventDefault();

            if(!$("body").hasClass("lock-scroll")) {
                $.scrollify.instantMove($(this).attr("href"));
            }

        });
    };

    new ScrollSnapping();

})(jQuery);
