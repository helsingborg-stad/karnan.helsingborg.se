Karnan = Karnan || {};
Karnan.OnePage = Karnan.OnePage || {};

Karnan.OnePage.GoToVideo = (function ($) {
    function GoToVideo() {
        $("#go-to-live").on('click', function(e){
            e.preventDefault();
            $.scrollify.move($(this).attr('href'));
        });

        if(!$("#live-section").length) {
            $("#go-to-live").hide(0);
        }
    }
    new GoToVideo();

})(jQuery);
