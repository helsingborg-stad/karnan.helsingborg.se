
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
