<?php
namespace Karnan;

class App
{
    public function __construct()
    {
        new \Karnan\Theme\Redirect();
        new \Karnan\Theme\Template();
        new \Karnan\Theme\Enqueue();
        new \Karnan\Theme\Filters();

        new \Karnan\Admin\ThemeOptions();
    }
}
