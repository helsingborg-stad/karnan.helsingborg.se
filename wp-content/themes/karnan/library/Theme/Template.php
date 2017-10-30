<?php

namespace Karnan\Theme;

class Template
{
    public function __construct()
    {
        add_action('init', function () {
            \Municipio\Helper\Template::add(__('Virtual sections', 'karnan'), \Municipio\Helper\Template::locateTemplate('virtual-section.blade.php'));
        });

        add_action('wp_head', array($this, 'removeMobileZoom'));
    }

    public function removeMobileZoom()
    {
        if (is_admin()) {
            return false;
        }

        echo '<meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0;" />';
    }
}
