<?php

define('KARNAN_PATH', get_stylesheet_directory() . '/');

//Include vendor files
if (file_exists(dirname(ABSPATH) . '/vendor/autoload.php')) {
    require_once dirname(ABSPATH) . '/vendor/autoload.php';
}

add_action('after_setup_theme', function () {
    load_child_theme_textdomain('karnan', get_stylesheet_directory() . '/languages');
});

require_once KARNAN_PATH . 'library/Vendor/Psr4ClassLoader.php';
$loader = new Karnan\Vendor\Psr4ClassLoader();
$loader->addPrefix('Karnan', KARNAN_PATH . 'library');
$loader->addPrefix('Karnan', KARNAN_PATH . 'source/php/');
$loader->register();

new Karnan\App();

add_action('init', function () {
    $acfExportManager = new \AcfExportManager\AcfExportManager();
    $acfExportManager->setTextdomain('karnan');
    $acfExportManager->setExportFolder(KARNAN_PATH . 'library/AcfFields');
    $acfExportManager->autoExport(array(
        'theme-settings'    => 'group_59e8688a57908',
        'social-settings'   => 'group_5825cca7a2d15'
    ));
    $acfExportManager->import();
});
