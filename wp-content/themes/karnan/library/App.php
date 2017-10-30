<?php
namespace karnan;

class App
{
    public function __construct()
    {
        new \karnan\Theme\Redirect();
        new \karnan\Theme\Template();
        new \karnan\Theme\Enqueue();
        new \karnan\Theme\Api();

        new \karnan\Admin\ThemeOptions();
    }
}
