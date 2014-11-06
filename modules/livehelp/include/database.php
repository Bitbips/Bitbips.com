<?php

ob_start();

if (!defined('WHMCS_ROOTDIR')) {
    $whmcsRootDir = realpath(dirname(__FILE__) . '/../../../');
    define('WHMCS_ROOTDIR', $whmcsRootDir);
    if (isset($templates_compiledir)) {
        $templates_compiledir2 = $templates_compiledir;
    }
    require WHMCS_ROOTDIR . '/configuration.php';
    if (isset($templates_compiledir2)) {
        $templates_compiledir = $templates_compiledir2;
    }

    define('DB_HOST', $db_host);
    define('DB_NAME', $db_name);
    define('DB_USER', $db_username);
    define('DB_PASS', $db_password);

    include_once WHMCS_ROOTDIR . '/init.php';

    $table_prefix =  'modlivehelp_';

    // Enable Plugins
    $_PLUGINS = array();
    $_PLUGINS['WHMCS'] = true;
}

ob_end_clean();

return true;
