Karnan = Karnan || {};
Karnan.OnePage = Karnan.OnePage || {};

Karnan.OnePage.ScrollButtons = (function ($) {

    var AnchorScrollTrigger = '#one-page-elevator li a';
    var ActiveAnchorScrollTrigger = '#one-page-elevator li.active';

	function ScrollButtons() {
        this.bindButton('up', '.scroll-action.scroll-up');
        this.bindButton('down', '.scroll-action.scroll-down');

        setInterval(function(){
            this.buttonToggle();
        }.bind(this),175);
    }

    ScrollButtons.prototype.bindButton = function (direction, class) {

        $(class).on('click', function(){

            //Movement
            if(direction == 'up') {
                $.scrollify.previous();
            } else {
                $.scrollify.next();
            }

            this.buttonToggle();

        }.bind(this));
    }

    ScrollButtons.prototype.buttonToggle = function() {

        //Toggles up button
        if(jQuery(ActiveAnchorScrollTrigger).hasClass('is-first')) {
            jQuery('.scroll-action.scroll-up').addClass('disabled');
        } else {
            jQuery('.scroll-action.scroll-up').removeClass('disabled');
        }

        //Toggles down button
        if(jQuery(ActiveAnchorScrollTrigger).hasClass('is-last')) {
            jQuery('.scroll-action.scroll-down').addClass('disabled');
        } else {
            jQuery('.scroll-action.scroll-down').removeClass('disabled');
        }
    }

	return new ScrollButtons();

})(jQuery);
