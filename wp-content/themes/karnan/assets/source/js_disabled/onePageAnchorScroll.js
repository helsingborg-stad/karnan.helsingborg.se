/*Karnan = Karnan || {};
Karnan.OnePage = Karnan.OnePage || {};

Karnan.OnePage.AnchorScroll = (function ($) {

    var AnchorScrollTriggers = [
        '#one-page-elevator li a'
    ];

    var AnchorScrollTargets = [
        'section.onepage-section'
    ];

    var AnchorScrollSettings = {
        scrollSpeed: 750,
        scrollOffset: 100
    };

    function AnchorScroll() {
        AnchorScrollTriggers.forEach(function(element) {
            jQuery(element).each(function(index,item) {
                if(this.isAnchorLink(jQuery(item).attr('href')) && this.anchorLinkExists(jQuery(item).attr('href'))) {
                    this.bindAnchorScroll(item,jQuery(item).attr('href'));
                }
                if(this.isAnchorLink(jQuery(item).attr('href')) && !this.anchorLinkExists(jQuery(item).attr('href')) && window.location.pathname !== '/') {
                    jQuery(item).attr('href', jQuery(".logotype").attr('href')  + "/" + jQuery(item).attr('href'));
                }
            }.bind(this));
        }.bind(this));
    }

    AnchorScroll.prototype.isAnchorLink = function (href) {
        if(/^#/.test(href) === true && href.length > 1) {
            return true;
        } else {
            return false;
        }
    };

    AnchorScroll.prototype.anchorLinkExists = function (id) {
        var linkExist = false;
        AnchorScrollTargets.forEach(function(element) {
            if(jQuery(element + id).length) {
               linkExist = true;
               return true;
            }
        }.bind(this));
        return linkExist;
    };

    AnchorScroll.prototype.bindAnchorScroll = function (trigger,target) {
        jQuery(trigger).on('click',function(event){
            event.preventDefault();
            this.updateHash(target);
            var targetOffset = jQuery(target).offset();
            jQuery('html, body').animate({scrollTop: Math.abs(targetOffset.top -Math.abs(AnchorScrollSettings.scrollOffset))}, AnchorScrollSettings.scrollSpeed);
        }.bind(this));
    };

    AnchorScroll.prototype.updateHash = function(hash) {
        if(history.pushState) {
            if(hash === "" ) {
                history.pushState(null, null, "#");
            } else {
                history.pushState(null, null, hash);
            }
        } else {
            window.location.hash = hash;
        }
    }

    new AnchorScroll();

})(jQuery);*/
