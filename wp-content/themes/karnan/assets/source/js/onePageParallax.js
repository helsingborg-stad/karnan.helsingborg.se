Karnan = Karnan || {};
Karnan.OnePage = Karnan.OnePage || {};

Karnan.OnePage.Parallax = (function ($) {

    function Parallax() {
        if($(".parallax-enabled").length) {
            this.Init();
        }
    }

    Parallax.prototype.Init = function (index, segments) {
        $("body").stellar({
            horizontalScrolling: false,
        });
    }.bind(this);

    new Parallax();

})(jQuery);
