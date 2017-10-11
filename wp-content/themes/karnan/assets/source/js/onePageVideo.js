
    /* This function is not object orientated due to some wierd performance issues */
    function skipOnScroll () {
        document.getElementById("one-page-video-player").currentTime = parseFloat(document.getElementById("one-page-video-player").duration * (window.pageYOffset / (document.body.scrollHeight - window.innerHeight))).toFixed(3);
        window.requestAnimationFrame(skipOnScroll);
    }
    if(document.getElementById("one-page-video-player") !== null) {
        window.requestAnimationFrame(skipOnScroll);
    }
