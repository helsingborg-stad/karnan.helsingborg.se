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
