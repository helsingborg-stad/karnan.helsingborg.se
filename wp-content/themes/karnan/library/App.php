<?php
namespace karnan;

class App
{
    public function __construct()
    {
        new \karnan\Theme\Enqueue();
    }
}
