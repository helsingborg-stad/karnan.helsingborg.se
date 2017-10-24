<?php

namespace karnan\Theme;

class Template
{
    public function __construct()
    {
        add_action('init', function () {
            \Municipio\Helper\Template::add(__('Virtual sections', 'karnan'), \Municipio\Helper\Template::locateTemplate('virtual-section.blade.php'));
        });
    }
}
