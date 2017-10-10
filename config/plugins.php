<?php

/**
 * Turn of admin panel for ACF.
 * @var bool
 */
if(strpos($_SERVER['SERVER_NAME'],".dev") === false) {
    define('ACF_LITE', true);
}
