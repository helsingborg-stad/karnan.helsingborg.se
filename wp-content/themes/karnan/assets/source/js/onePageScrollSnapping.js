Karnan = Karnan || {};
Karnan.OnePage = Karnan.OnePage || {};

Karnan.OnePage.ScrollSnapping = (function ($) {

    var scrollSpeed = 3000;

    function ScrollSnapping() {
        //Home page soft move
        if ($(".onepage-section").length) {
            this.StartSections();
        }

        //Virtual sections instant move
        if ($(".virtual-section").length) {
            this.StartSections();
        }
    }

    ScrollSnapping.prototype.StartSections = function () {

        $.scrollify({
            section : ".onepage-section",
            sectionName : "section-name",
            scrollSpeed: scrollSpeed,
            before: function(index, sections) {
                this.hightlightPagination(index, sections);
                this.hightlightDirectionArrows(index, sections);

                $(document).trigger('scrollifyStart', [index, sections, scrollSpeed]);
            }.bind(this),
            after: function(index, sections) {
                $(document).trigger('scrollifyStop', [index, sections, scrollSpeed]);
            }.bind(this)
        });

        //Bind navigation clicks
        this.bindSoftMove();
        this.hightlightDirectionArrows(0, $(".onepage-section").length);
    }

    ScrollSnapping.prototype.VirtualSections = function () {

        $.scrollify({
            section : ".virtual-section",
            sectionName : "section-name",
            scrollSpeed: 550,
            before: function(index, sections) {
                $(".container", "section").not(":eq(" + index + ")").fadeOut(100);
                $(".container", "section:eq(" + index + ")").fadeIn(800);

                this.hightlightPagination(index, sections);
                this.hightlightDirectionArrows(index, sections);
            }.bind(this),
            after: function(index, sections) {

            }.bind(this)
        });

        //Bind navigation clicks
        this.bindInstantMove();
        this.hightlightDirectionArrows(0, $(".virtual-section").length);

    }.bind(this);

    ScrollSnapping.prototype.hightlightDirectionArrows = function (index, sections) {

        //This is the first item
        if(index == 0) {
            jQuery('.scroll-action.scroll-up').addClass('disabled');
        } else {
            jQuery('.scroll-action.scroll-up').removeClass('disabled');
        }

        //This is the last item
        if(sections == index + 1) {
            jQuery('.scroll-action.scroll-down').addClass('disabled');
        } else {
            jQuery('.scroll-action.scroll-down').removeClass('disabled');
        }

    }.bind(this);

    ScrollSnapping.prototype.hightlightPagination = function (index, sections) {
        $("#one-page-elevator li").removeClass("active");
        $("#one-page-elevator li:eq(" +index+ ")").addClass("active");
    };

    ScrollSnapping.prototype.bindSoftMove = function () {
        $("#one-page-elevator a").on("click",function() {
            if(!$("body").hasClass("lock-scroll")) {
                $.scrollify.move($(this).attr("href"));
            }
        });
    };

    ScrollSnapping.prototype.bindInstantMove = function () {
        $("#one-page-elevator a").on("click",function() {
            if(!$("body").hasClass("lock-scroll")) {
                $.scrollify.instantMove($(this).attr("href"));
            }
        });
    };

    new ScrollSnapping();

})(jQuery);
