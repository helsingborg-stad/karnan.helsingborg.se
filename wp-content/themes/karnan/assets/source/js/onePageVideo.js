Karnan = Karnan || {};
Karnan.OnePage = Karnan.OnePage || {};

Karnan.OnePage.Video = (function ($) {

    var videoElement = 'one-page-video-player';
    var videoSpeed = 10;
    var videoDuration = null;

    function Video() {

        //Get video element
        this.videoElement   = document.getElementById(videoElement);

        //Calculate stuff when metadata is avabile
        this.videoElement.addEventListener('loadedmetadata', function() {
            this.videoDuration              = this.videoElement.duration;
            this.videoElement.playbackRate  = videoSpeed;
        }.bind(this));

        // Use hooks in one page scroll (start)
        $(document).bind('scrollifyStart',function(event, segmentIndex, segments, scrollSpeed) {
            //if(Math.random()%2) {
              //  this.play(segmentIndex, segments, scrollSpeed);
            //} else {
                this.rewind(segmentIndex, segments, scrollSpeed);
            //}
        }.bind(this));

        // Use hooks in one page scroll (end)
        $(document).bind('scrollifyStop',function(event, segmentIndex, segments, scrollSpeed) {
            this.stop(segmentIndex, segments, scrollSpeed);
        }.bind(this));
    };

    Video.prototype.play = function (segmentIndex, segments, scrollSpeed) {

        //Scroll to correct time in video
        this.videoElement.currentTime = this.calculateMilestone(this.videoDuration, $(segments).length, segmentIndex);
        this.videoElement.playbackRate = this.calculateSpeed(this.videoDuration, $(segments).length, scrollSpeed);

        //Do play
        this.videoElement.play();
    };

    Video.prototype.rewind = function (segmentIndex, segments, scrollSpeed) {

        //Scroll to correct time in video
        this.videoElement.currentTime = this.calculateMilestone(this.videoDuration, $(segments).length, segmentIndex);
        this.videoElement.playbackRate = -Math.abs(this.calculateSpeed(this.videoDuration, $(segments).length, scrollSpeed));

        //Do play
        this.videoElement.play();
    };

    Video.prototype.stop = function (segmentIndex, segments, scrollSpeed) {
        this.videoElement.pause();
    };

    Video.prototype.calculateMilestone = function(duration, numberOfSegments, index) {
        return (duration/numberOfSegments)*index;
    };

    Video.prototype.calculateSpeed = function(duration, numberOfSegments, animationTime) {
        return (duration/numberOfSegments/animationTime)*1000;
    };

    new Video();

})(jQuery);



/*
$("#negative").click(function() { // button function for rewind
   intervalRewind = setInterval(function(){
       video.playbackRate = 1.0;
       if(video.currentTime == 0){
           clearInterval(intervalRewind);
           video.pause();
       }
       else{
           video.currentTime += -.1;
       }
    },30);
});*/




