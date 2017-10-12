Karnan = Karnan || {};
Karnan.OnePage = Karnan.OnePage || {};

Karnan.OnePage.ScrollButtons = (function ($) {

    var AnchorScrollTrigger = '#one-page-elevator li a';
    var ActiveAnchorScrollTrigger = '#one-page-elevator li.active a';

	function ScrollButtons() {
        this.bindButton('up', '.scroll-action.scroll-up');
        this.bindButton('down', '.scroll-action.scroll-down');
    }

    ScrollButtons.prototype.bindButton = function (direction, class) {

        $(class).on('click', function(){

            //active menu item
            console.log($(ActiveAnchorScrollTrigger));
            console.log($("a", $(ActiveAnchorScrollTrigger).next()));
            $("a", $(ActiveAnchorScrollTrigger).next()).trigger('click');
        }.bind(this));
    }

	return new ScrollButtons();

})(jQuery);
