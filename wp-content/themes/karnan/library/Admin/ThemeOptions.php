<?php

namespace karnan\Admin;

class ThemeOptions
{
    public function __construct()
    {
        if (!is_admin()) {
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
            acf_add_options_page(array(
                'page_title'    => __('Kärnan options', 'municipio'),
                'menu_title'    => __('Kärnan', 'municipio'),
                'capability'    => 'edit_pages',
                'menu_slug'     => 'acf-options-karnan',
                'position'      => '10',
                'icon_url'          => 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iNTEycHgiIGhlaWdodD0iNTEycHgiPjxnPjxnPjxwYXRoIGQ9Ik0zMzEsMHYzMGgtMzBWMGgtOTB2MzBoLTMwVjBIOTF2NTEyaDMzMFYwSDMzMXogTTI3MSw0ODJoLTMwVjM4MmgzMFY0ODJ6IE0zOTEsNDgyaC05MFYzNTJoLTkwdjEzMGgtOTBWMTIwaDMwdjMwaDMwdi0zMCAgICBoMzB2MzBoMzB2LTMwaDMwdjMwaDMwdi0zMGgzMHYzMGgzMHYtMzBoMzBWNDgyeiBNMzkxLDkwSDEyMVYzMGgzMHYzMGg5MFYzMGgzMHYzMGg5MFYzMGgzMFY5MHoiIGZpbGw9IiNGRkZGRkYiLz48L2c+PC9nPjxnPjxnPjxwYXRoIGQ9Ik0yMTEsMjAydjkwaDkwdi05MEgyMTF6IE0yNzEsMjYyaC0zMHYtMzBoMzBWMjYyeiIgZmlsbD0iI0ZGRkZGRiIvPjwvZz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PC9zdmc+'
            ));
        }
    }
}
