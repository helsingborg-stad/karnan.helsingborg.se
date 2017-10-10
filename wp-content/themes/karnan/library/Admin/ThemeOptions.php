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
    }

}
