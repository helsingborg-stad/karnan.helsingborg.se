/*Karnan = Karnan || {};
Karnan.AsyncContentLoader = Karnan.AsyncContentLoader || {};

Karnan.AsyncContentLoader.AsyncContentLoader = (function ($) {

    var AsyncContentEndpoint = 'wp/v2/all?slug=';

    var AsyncContentTempalte = '<div id="ajax-response" class="ajax-response"><div class="container"><div class="grid"><div class="grid-xs-12"><a class="close" href="#close"><i class="pricon pricon-close"></i></a><article class="frame"><h2>{{title}}</h2>{{content}}{{sidebar}}</article></div></div></div></div>';

    var AsyncContentTrigger = [
        '.navbar li a'
    ];

    var AsyncContentReplaceVars = [
        'title',
        'content',
        'sidebar'
    ];

    function AsyncContentLoader() {
        this.triggerAjaxOpenHash();
        this.watchAjaxClose();
        jQuery.each(AsyncContentTrigger,function(index,targetObject) {
            console.log("test link");
            jQuery(targetObject).click(function(event) {
                if(this.isLocalLink(jQuery(event.target).closest('a').attr('href'))) {
                    event.preventDefault();
                    this.loadContent(jQuery(event.target).closest('a'));
                    this.updateHash('#' + this.createIdFromHref(jQuery(event.target).closest('a').attr('href')));
                }
            }.bind(this));
        }.bind(this));
    };

    AsyncContentLoader.prototype.loadContent = function (clickedObject) {
        var $section = jQuery('#dynamic-content-wrapper');

        jQuery('#ajax-response article.frame').html('<span class="spinner spinner-dark spinner-lg" style="font-size:3em;"></span>');

        jQuery("a").removeClass('ajax-is-active');

        this.startSpinner(clickedObject);

        jQuery.get(this.createEndpointSlug(jQuery(clickedObject).attr('href')), function(dataResponse){

            //Clear area
            jQuery('.ajax-response').remove();

            //New content
            $section.append(
                this.responseTemplate(AsyncContentTempalte, dataResponse)
            );

            $section.find('article.frame').addClass('is-loaded');

            //Content loaded
            this.stopSpinner(clickedObject);

        }.bind(this));
    };

    AsyncContentLoader.prototype.createEndpointSlug = function (url) {
        return rest_url + AsyncContentEndpoint + this.parsePostName(url);
    };

    AsyncContentLoader.prototype.responseTemplate = function (contentTemplate, dataResponse) {
        AsyncContentReplaceVars.forEach(function(item) {
            contentTemplate = contentTemplate.replace("{{" + item + "}}", dataResponse[item]);
        }.bind(this));
        return contentTemplate;
    };

    AsyncContentLoader.prototype.displayTarget = function(markup, target) {
        if(jQuery(target).length) {
            jQuery(target).html(markup);
        } else {
            alert("Error: Target is missing.");
        }
    };

    AsyncContentLoader.prototype.parsePostName = function(url) {
        return url.replace(location.protocol + "//" + window.location.hostname, "");
    };

    AsyncContentLoader.prototype.isLocalLink = function(url) {
        if(url.indexOf(window.location.hostname) !== -1) {
            return true;
        }
        return false;
    };



    AsyncContentLoader.prototype.startSpinner = function(targetItem) {
        targetItem.addClass("ajax-do-spin ajax-is-active");
        targetItem.find('.box-image-container').append('<span class="pos-absolute-center spinner-container" style="width: 50px;height: 50px;"><span class="spinner" style="border: 10px solid #fff;width: 50px;height: 50px;border-left-color:transparent;"></span></span>');
    };

    AsyncContentLoader.prototype.stopSpinner = function(targetItem) {
        targetItem.removeClass("ajax-do-spin");
        targetItem.find('.spinner-container').remove();
    };



    AsyncContentLoader.prototype.createIdFromHref = function(url) {
        return this.parsePostName(url).replace(new RegExp("/", 'g'),"-").replace('-blog-',"").replace(/\-$/, '').replace(/^\-/, '');
    };



    AsyncContentLoader.prototype.watchAjaxClose = function() {
        jQuery("section").on('click', '.ajax-response .close',function(event){
            event.preventDefault();
            jQuery('html, body').animate({scrollTop: Math.abs(jQuery(event.target).closest('a').parents('section').offset().top -jQuery("#site-header").outerHeight())}, 700, jQuery.bez([0.815, 0.020, 0.080, 1.215]));
            jQuery(".ajax-response").remove();
            jQuery("a").removeClass('ajax-is-active');
            this.updateHash("");
        }.bind(this));
    };

    AsyncContentLoader.prototype.triggerAjaxOpenHash = function() {
        jQuery(window).bind("load", function() {
            jQuery.each(AsyncContentTrigger,function(index,targetObject) {
                jQuery(targetObject).each(function(linkindex, link){
                    if(this.isLocalLink(jQuery(link).closest('a').attr('href'))) {
                        if("#" + this.createIdFromHref(jQuery(link).attr('href')) === window.location.hash) {
                            this.loadContent(jQuery(link).closest('a'));
                            return false;
                        }
                    }
                }.bind(this));
            }.bind(this));
        }.bind(this));
    };

    AsyncContentLoader.prototype.updateHash = function(hash) {
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

    new AsyncContentLoader();

})(jQuery); */
