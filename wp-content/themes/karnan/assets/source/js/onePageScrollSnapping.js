Karnan = Karnan || {};
Karnan.OnePage = Karnan.OnePage || {};

Karnan.OnePage.ScrollSnapping = (function ($) {

    var scrollSpeed = 3000;

    function ScrollSnapping() {

        //Init
        var scrollHandler = $.scrollify({
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

        //Bind nav click
        this.bindPagination();
        this.hightlightDirectionArrows(0, $(".onepage-section").length);
    }

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

    ScrollSnapping.prototype.bindPagination = function () {
        $("#one-page-elevator a").on("click",function() {
            $.scrollify.move($(this).attr("href"));
        });
    };

    new ScrollSnapping();

})(jQuery);
