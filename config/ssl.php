<?php
if(strpos($_SERVER['SERVER_NAME'],".dev") === false) {
    define('SSL_PROXY', true);
} else {
    define('SSL_PROXY', false);
}
