<?php

namespace Karnan\Theme;

class Template
{
    public function __construct()
    {

        //Mobile zoom settings (scrollify adaption)
        add_action('wp_head', array($this, 'removeMobileZoom'));
    }

    /**
     * Mobile adaption for scrollify
     * @return bool
     */

    public function removeMobileZoom()
    {
        if (is_admin()) {
            return false;
        }

        echo '<meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0;" />';

        return true;
    }
}
