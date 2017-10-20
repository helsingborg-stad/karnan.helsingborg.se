<?php
namespace karnan;

class App
{
    public function __construct()
    {
        new \karnan\Theme\Enqueue();

        new \karnan\Admin\ThemeOptions();

        add_action('init', array($this, 'registerTemplates'));
    }

    public function registerTemplates()
    {
    	\Municipio\Helper\Template::add(__('Virtual sections', 'karnan'), \Municipio\Helper\Template::locateTemplate('virtual-section.blade.php'));
    }
}
