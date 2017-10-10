<?php

define('KARNAN_PATH', get_stylesheet_directory() . '/');

//Include vendor files
if (file_exists(dirname(ABSPATH) . '/vendor/autoload.php')) {
    require_once dirname(ABSPATH) . '/vendor/autoload.php';
}

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
        'theme-settings'    => 'group_59dcbee046030',
        'front-page'    => 'group_59dcbf10ae25f',
    ));
    $acfExportManager->import();
});

new karnan\App();
