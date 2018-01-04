<?php

namespace Karnan\Theme;

class Enqueue
{
    public function __construct()
    {
        // Enqueue scripts and styles
        add_action('wp_enqueue_scripts', array($this, 'style'));
        add_action('wp_enqueue_scripts', array($this, 'script'));

        add_filter('script_loader_src', array($this, 'removeQueryString'), 15, 1);
        add_filter('style_loader_src', array($this, 'removeQueryString'), 15, 1);
    }

    /**
     * Enqueue styles
     * @return void
     */
    public function style()
    {
        wp_enqueue_style('karnan-css', get_stylesheet_directory_uri() . '/assets/dist/' . \Municipio\Helper\CacheBust::name('css/app.css', true, true));
    }

    /**
     * Enqueue scripts
     * @return void
     */
    public function script()
    {

        wp_enqueue_script('karnan-vendor-js', get_stylesheet_directory_uri() . '/assets/dist/' . \Municipio\Helper\CacheBust::name('js/vendor.js', true, true), array('jquery'));
        wp_enqueue_script('karnan-js', get_stylesheet_directory_uri() . '/assets/dist/' . \Municipio\Helper\CacheBust::name('js/app.js', true, true), array('jquery'));
    }

    public function removeQueryString($src)
    {
        return remove_query_arg('ver', $src);
    }
}
