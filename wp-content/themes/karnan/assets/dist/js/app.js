var Karnan;

//https://github.com/lukehaas/Scrollify

Karnan = Karnan || {};
Karnan.OnePage = Karnan.OnePage || {};

Karnan.OnePage.ScrollSnapping = (function ($) {

    function ScrollSnapping() {

        //Init
        $.scrollify({
            section : ".onepage-section",
            sectionName : "section-name",
            easing: "linear",
            before: function(index, sections) {
                this.hightlightPagination(index, sections);
                this.hightlightDirectionArrows(index, sections);
            }.bind(this),
            after: function(index, sections) {

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


    /* This function is not object orientated due to some wierd performance issues */
    /*var scrollTickingBool = false;

    function videoSkipOnScroll () {
        //Set tick to false (listen to new scroll event)
        scrollTickingBool = false;

        //Animate
        document.getElementById("one-page-video-player").currentTime = parseFloat(document.getElementById("one-page-video-player").duration * (window.pageYOffset / (document.body.scrollHeight - window.innerHeight))).toFixed(3);
    }

    function videoScrollListener() {
        if(!scrollTickingBool) {
            requestAnimationFrame(videoSkipOnScroll);
        }
        scrollTickingBool = true;
    }

    //Listen for scroll
    window.addEventListener('scroll', videoScrollListener, false);
*/


Karnan = Karnan || {};
Karnan.OnePage = Karnan.OnePage || {};

Karnan.OnePage.Video = (function ($) {

    var videoElement = 'one-page-video-player';
    var videoSpeed = 1.4;
    var videoDuration = null;

    function Video() {
        this.videoElement   = document.getElementById(videoElement);
        this.videoDuration  = document.getElementById(videoElement).duration;
        console.log(this.videoDuration);
    }

    Video.prototype.play = function (segmentIndex, totalSegments) {


    }.bind(this);

    new Video();

})(jQuery);
