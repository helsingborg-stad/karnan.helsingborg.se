<?php

namespace karnan\Admin;

class ThemeOptions
{
    public function __construct()
    {
        if(!is_admin()) {
            return false;
        }

        add_action('init', array($this, 'registerOptionsPage'));
    }

    /**
     * Register options page for theme
     * @return void
     */
    public function registerOptionsPage()
    {
        if (function_exists('acf_add_options_page')) {
            $themeOptionsCapability = 'administrator';
            $themeOptionsParent = 'themes.php';

            acf_add_options_sub_page(array(
                'page_title'    => __('Kärnan options', 'municipio'),
                'menu_title'    => __('Kärnan', 'municipio'),
                'parent_slug'   => $themeOptionsParent,
                'capability'    => $themeOptionsCapability,
                'menu_slug'     => 'acf-options-karnan'
            ));
        }

    }

}
