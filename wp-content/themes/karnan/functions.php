<?php

define('KARNAN_PATH', get_stylesheet_directory() . '/');

//Include vendor files
if (file_exists(dirname(ABSPATH) . '/vendor/autoload.php')) {
    require_once dirname(ABSPATH) . '/vendor/autoload.php';
}

require_once KARNAN_PATH . 'library/Vendor/Psr4ClassLoader.php';
$loader = new KARNAN\Vendor\Psr4ClassLoader();
$loader->addPrefix('karnan', KARNAN_PATH . 'library');
$loader->addPrefix('karnan', KARNAN_PATH . 'source/php/');
$loader->register();

new karnan\App();
