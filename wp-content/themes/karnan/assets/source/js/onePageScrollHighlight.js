Karnan = Karnan || {};
Karnan.OnePage = Karnan.OnePage || {};

Karnan.OnePage.ScrollHighlight = (function ($) {

    var ScrollTopValue = 0;

    var ScrollTopOffset = 50;

    var ScrollMenuWrapperActiveClass = 'active';

    var ScrollHighlightTrigger = 'section.onepage-section';

    var ScrollMenuWrapper = [
        '#one-page-elevator'
    ];

    function ScrollHighlight() {
        ScrollTopValue = jQuery(window).scrollTop();
        jQuery(window).on('scroll', function (e) {
            var scrolledToItem = null;
            ScrollTopValue = jQuery(window).scrollTop() + ScrollTopOffset + jQuery("#site-header").outerHeight();
            jQuery(ScrollHighlightTrigger).each(function (index,item) {
                if(ScrollTopValue >= jQuery(item).offset().top) {
                    scrolledToItem = item;
                    return;
                }
            });
            this.cleanHighlight();
            this.highlightMenuItem("#" + jQuery(scrolledToItem).attr('id'));
        }.bind(this));
    }

    ScrollHighlight.prototype.highlightMenuItem = function (id) {
        if(this.isAnchorLink(id) && this.anchorLinkExists(id)){
            ScrollMenuWrapper.forEach(function(element) {
                jQuery("a[href='" + id + "']", element).parent('li').addClass(ScrollMenuWrapperActiveClass);
            });
        }
    };

    ScrollHighlight.prototype.isAnchorLink = function (href) {
        if(/^#/.test(href) === true && href.length > 1) {
            return true;
        } else {
            return false;
        }
    };

    ScrollHighlight.prototype.anchorLinkExists = function (id) {
        var linkExist = false;
        ScrollMenuWrapper.forEach(function(element) {
            if(jQuery("a[href='" + id + "']",element).length) {
                linkExist = true;
                return true;
            }
        }.bind(this));
        return linkExist;
    };

    ScrollHighlight.prototype.cleanHighlight = function () {
        ScrollMenuWrapper.forEach(function(element) {
            jQuery("li",element).removeClass(ScrollMenuWrapperActiveClass);
        }.bind(this));
    };

    new ScrollHighlight();

})(jQuery);
