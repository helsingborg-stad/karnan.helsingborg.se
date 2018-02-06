Karnan = Karnan || {};
Karnan.OnePage = Karnan.OnePage || {};

Karnan.OnePage.GalleryPopup = (function ($) {
    function GalleryPopup() {
        this.openModalOnClose();
        this.disableCloseButton();
    }

    GalleryPopup.prototype.openModalOnClose = function () {
        $('.js-close-target').on('click', function(e) {
            var hash = $(this).attr('data-close-target');

            $(document).on('closeLightBox', function() {

                  window.location.hash = hash;

            });
        });
    };

    GalleryPopup.prototype.disableCloseButton = function () {
        $(document).on('click', '#lightbox .btn-close', function(e) {
            e.preventDefault();
        });
    };

    new GalleryPopup();


})(jQuery);
