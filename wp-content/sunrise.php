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
        $this->redirectToNonPunycode();
    }

    public function redirectToNonPunycode()
    {
        if (preg_match("/xn--krnan-gra.se/i", $_SERVER['HTTP_HOST'])) {
            header("Location: https://karnan.se" . $_SERVER['REQUEST_URI']);
            exit;
        }
    }
}

new \PunyCodeRedirect\PunyCodeRedirect();
