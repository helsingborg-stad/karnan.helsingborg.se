var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

if (videoId) {
    var playerMini, playerModal;

    function onYouTubeIframeAPIReady() {
        playerMini = new YT.Player('player-mini', {
            playerVars: {
                autoplay: 1,
                showinfo: 0,
                controls: 0,
            },
            width: '100%',
            height: '100%',
            videoId: videoId,
            events: {
                'onReady': onPlayerReady
            }
        });

        playerModal = new YT.Player('player-modal', {
            playerVars: {
                autoplay: 0,
                showinfo: 0,
                controls: 1,
            },

            width: '100%',
            height: '100%',
            videoId: videoId,
            events: {
                //'onReady': onPlayerReady
            }
        });
    }

    function onPlayerReady(event) {
        event.target.playVideo();
        event.target.mute();
    }
}
