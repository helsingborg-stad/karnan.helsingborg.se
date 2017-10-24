Karnan = Karnan || {};
Karnan.OnePage = Karnan.OnePage || {};

Karnan.OnePage.Navigation = (function ($) {

    function Navigation() {

        this.hightlightDirectionArrows(0, $(".onepage-section").length);
        this.bindDirectionArrows();

        // Use hooks in one page scroll (start)
        $(document).bind('scrollifyStart',function(event, segmentIndex, segments, scrollSpeed) {
            this.hightlightDirectionArrows(segmentIndex, segments);
            this.hightlightPagination(segmentIndex, segments);
        }.bind(this));

        $(document).bind('scrollifyStop',function(event, segmentIndex, segments, scrollSpeed) {

        }.bind(this));

    }

    Navigation.prototype.hightlightDirectionArrows = function (index, segments) {

        //This is the first item
        if(index == 0) {
            jQuery('.scroll-action.scroll-up').addClass('disabled');
        } else {
            jQuery('.scroll-action.scroll-up').removeClass('disabled');
        }

        //This is the last item
        if(segments.length == index + 1) {
            jQuery('.scroll-action.scroll-down').addClass('disabled');
        } else {
            jQuery('.scroll-action.scroll-down').removeClass('disabled');
        }

    }.bind(this);

    Navigation.prototype.hightlightPagination = function (index, segments) {
        $("#one-page-elevator li").removeClass("active");
        $("#one-page-elevator li:eq(" +index+ ")").addClass("active");
    };

    Navigation.prototype.bindDirectionArrows = function () {
        $("#one-page-elevator a").on("click",function() {
            if(!$("body").hasClass("lock-scroll")) {
                $.scrollify.instantMove($(this).attr("href"));
            }
        });
    };

    new Navigation();

})(jQuery);
