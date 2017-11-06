<?php

/*
Plugin Name:    Punycode redirecter
Description:    Redirects from punycode to non-punycode
Version:        1.0
Author:         Sebastian Thulin
*/

namespace PunyCodeRedirect;

class punyCodeRedirect
{
    public function __construct()
    {
        add_filter('muplugins_loaded', array($this, 'redirectToNonPunycode'), 50);
    }

    public function redirectToNonPunycode()
    {
        if (strpos($_SERVER['HTTP_HOST'], "xn--krnan-gra") !== false) {
            header("Location: https://kärnan.se" . $_SERVER['REQUEST_URI']);
            exit;
        }
    }
}

new \PunyCodeRedirect\PunyCodeRedirect();
