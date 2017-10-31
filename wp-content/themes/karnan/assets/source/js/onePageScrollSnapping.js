Karnan = Karnan || {};
Karnan.OnePage = Karnan.OnePage || {};

Karnan.OnePage.ScrollSnapping = (function ($) {

    function ScrollSnapping() {
        //Home page soft move
        if ($(".onepage-section").length) {
            this.StartSections();
        }

        //Virtual sections instant move
        if ($(".virtual-section").length) {
            this.VirtualSections();
        }
    }

    ScrollSnapping.prototype.StartSections = function () {

        var scrollSpeed = 800;

        $.scrollify({
            section : ".onepage-section",
            sectionName : "section-name",
            scrollSpeed: scrollSpeed,
            easing: "easeOutExpo",
            before: function(index, sections) {
                $(document).trigger('scrollifyStart', [index, sections, scrollSpeed, 'onepage']);
            }.bind(this),
            after: function(index, sections) {
                $(document).trigger('scrollifyStop', [index, sections, scrollSpeed, 'onepage']);
            }.bind(this)
        });
    }

    ScrollSnapping.prototype.VirtualSections = function () {

        var scrollSpeed = 800;

        $.scrollify({
            section : ".virtual-section",
            sectionName : "section-name",
            scrollSpeed: scrollSpeed,
            before: function(index, sections) {
                $(".container", "section").not(":eq(" + index + ")").addClass('fade-out-bck');
                $(".container", "section:eq(" + index + ")").removeClass('fade-out-bck').addClass('fade-in-fwd');
                $(document).trigger('scrollifyStart', [index, sections, scrollSpeed, 'virtual']);
            }.bind(this),
            after: function(index, sections) {
                setTimeout(function() {
                    $(".container", "section:eq(" + index + ")").removeClass('fade-in-fwd');
                }, 800);
                $(document).trigger('scrollifyStop', [index, sections, scrollSpeed, 'virtual']);
            }.bind(this)
        });

    }.bind(this);

    new ScrollSnapping();

})(jQuery);
