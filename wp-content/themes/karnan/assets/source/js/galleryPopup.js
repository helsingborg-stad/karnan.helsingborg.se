Karnan = Karnan || {};
Karnan.OnePage = Karnan.OnePage || {};

Karnan.OnePage.GalleryPopup = (function ($) {
    function GalleryPopup() {
        this.openModalOnClose();
    }

    GalleryPopup.prototype.openModalOnClose = function () {
        $('.js-close-target').on('click', function(e) {
            var hash = $(this).attr('data-close-target');

            $(document).on('closeLightBox', function() {
                setTimeout(function(){
                  window.location.hash = hash;
                }, 10);
            });
        });
    };
    new GalleryPopup();


})(jQuery);
