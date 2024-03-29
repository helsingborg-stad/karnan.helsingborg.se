Karnan = Karnan || {};
Karnan.OnePage = Karnan.OnePage || {};

Karnan.OnePage.Preloader = (function ($) {

    function Preloader() {
        if(this.inCache()) {
            $('body').addClass("page-loaded preload-quick");
        } else {
            $(window).on("load", function() {
                $('body').addClass("page-loaded").delay(1500).queue(function(next){
                    $("#preloader").hide(0);
                    next();
                });
                this.markAsCached();
            }.bind(this));
        }
    }

    Preloader.prototype.inCache = function () {
        if(this.getCookie("karnanExistsInCache") == 1) {
            return true;
        }
        return false;
    };

    Preloader.prototype.markAsCached = function() {
        this.addCookie("karnanExistsInCache", 1, 1);
    };

    Preloader.prototype.addCookie = function(name, value, days) {
        var expires;
        if (days) {
            var date = new Date();
            date.setTime(date.getTime()+(days*24*60*60*1000));
            expires = "; expires="+date.toGMTString();
        }
        else {
            expires = "";
        }
        document.cookie = name+"="+value+expires+"; path=/";
    };

    Preloader.prototype.getCookie = function (name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1,c.length);
            }
            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length,c.length);
            }
        }
        return null;
    };

    new Preloader();

})(jQuery);
