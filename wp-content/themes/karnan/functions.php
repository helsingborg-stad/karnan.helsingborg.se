<?php

define('KARNAN_PATH', get_stylesheet_directory() . '/');

//Include vendor files
if (file_exists(dirname(ABSPATH) . '/vendor/autoload.php')) {
    require_once dirname(ABSPATH) . '/vendor/autoload.php';
}

add_action('after_setup_theme', function () {
    load_theme_textdomain('karnan', get_template_directory() . '/languages');
});

require_once KARNAN_PATH . 'library/Vendor/Psr4ClassLoader.php';
$loader = new karnan\Vendor\Psr4ClassLoader();
$loader->addPrefix('karnan', KARNAN_PATH . 'library');
$loader->addPrefix('karnan', KARNAN_PATH . 'source/php/');
$loader->register();

new karnan\App();

add_action('init', function () {
    $acfExportManager = new \AcfExportManager\AcfExportManager();
    $acfExportManager->setTextdomain('karnan');
    $acfExportManager->setExportFolder(KARNAN_PATH . 'library/AcfFields');
    $acfExportManager->autoExport(array(
        'theme-settings'    => 'group_59e8688a57908'
    ));
    $acfExportManager->import();
});
