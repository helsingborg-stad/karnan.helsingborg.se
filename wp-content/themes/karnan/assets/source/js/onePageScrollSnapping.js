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

        //Total section count (starting form 0)
        this.sectionCount = $(".onepage-section").length - 1;

        this.startState();
        this.modalEvents();

        if ($('body').hasClass('.home')) {
            $('a[href="#"]').on('click', function (e) {
                e.preventDefault();
            });
        }

    }

    ScrollSnapping.prototype.modalEvents = function () {
        this.currentSection = $.scrollify.currentIndex();

        $('html').on('openModal', function() {
            this.currentSection = $.scrollify.currentIndex();
            $.scrollify.disable();
        });

        $('html').on('closeModal', function() {
            $.scrollify.enable();
            $.scrollify.update();
            $.scrollify.instantMove(this.currentSection);

        });
    }

    ScrollSnapping.prototype.startState = function () {
        //Set last section as current if no hash is defined
        if (window.location.hash == "#r") {
            $.scrollify.instantMove(this.sectionCount);
        }

        //Add active class
        $.scrollify.current().addClass('active-section');

        //Add wrapper class
        $('#one-page-content').addClass('active-section-' + $.scrollify.currentIndex());

        //Add next class
        if ($.scrollify.currentIndex() - 1 > 0) {
            $.scrollify.current().prev().addClass('next-section');
        }

        //Add prev class
        if ($.scrollify.currentIndex() + 1 <= this.sectionCount) {
            $.scrollify.current().next().addClass('prev-section');
        }
    }

    ScrollSnapping.prototype.updateWrapper = function (index, sections) {
        //Remove old wrapper class
        $('#one-page-content').removeClass (function (index, className) {
            return (className.match (/(^|\s)active-section-\S+/g) || []).join(' ');
        });

        //Add active
        $('#one-page-content').addClass('active-section-' + index);
    }

    ScrollSnapping.prototype.updateBody = function (index, sections) {
        //Remove old wrapper class
        $('body').removeClass (function (index, className) {
            return (className.match (/(^|\s)active-item-\S+/g) || []).join(' ');
        });

        //Add active
        $('body').addClass('active-item-' + index);
    }

    ScrollSnapping.prototype.updateActive = function (index, sections) {
        //Remove active class
        if (sections[(index + 1)] && sections[(index + 1)].hasClass('active-section')) {
            sections[(index + 1)].removeClass('active-section');
        } else if (sections[(index - 1)] && sections[(index - 1)].hasClass('active-section')) {
            sections[(index - 1)].removeClass('active-section');
        }

        //Set new active class
        sections[index].addClass('active-section');
    }

    ScrollSnapping.prototype.updateNext = function (index, sections) {
        //Remove old next
        if ($('.next-section')) {
            $('.next-section').removeClass('next-section');
        }

        //Set new next
        if (sections[(index - 1)]) {
            sections[(index - 1)].addClass('next-section');
        }
    }

    ScrollSnapping.prototype.updatePrev = function (index, sections) {
        //Remove old prev
        if ($('.prev-section')) {
            $('.prev-section').removeClass('prev-section');
        }

        //Set new next
        if (sections[(index + 1)]) {
            sections[(index + 1)].addClass('prev-section');
        }
    }

    ScrollSnapping.prototype.StartSections = function () {

        var scrollSpeed = 800;

        $.scrollify({
            setHeights : true,
            section : ".onepage-section",
            sectionName : "section-name",
            scrollSpeed: scrollSpeed,
            easing: "easeOutExpo",
            standardScrollElements: ".modal-karnan",
            before: function(index, sections) {
                this.updateActive(index, sections);
                this.updateNext(index, sections);
                this.updatePrev(index, sections);
                this.updateWrapper(index, sections);
                this.updateBody(index, sections);

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
                $(".container", "section").not(":eq(" + index + ")").addClass('fade-out');
                $(".container", "section:eq(" + index + ")").removeClass('fade-out').addClass('fade-in');
                $(document).trigger('scrollifyStart', [index, sections, scrollSpeed, 'virtual']);
            }.bind(this),
            after: function(index, sections) {
                setTimeout(function() {
                    $(".container", "section:eq(" + index + ")").removeClass('fade-in');
                }, 800);
                $(document).trigger('scrollifyStop', [index, sections, scrollSpeed, 'virtual']);
            }.bind(this)
        });

    }.bind(this);

    new ScrollSnapping();

})(jQuery);
