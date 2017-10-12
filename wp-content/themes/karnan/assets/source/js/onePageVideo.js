
    /* This function is not object orientated due to some wierd performance issues */
    var scrollTickingBool = false;

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
