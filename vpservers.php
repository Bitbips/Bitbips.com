<?php
 
 define("CLIENTAREA",true);
 //define("FORCESSL",true); // Uncomment to force the page to use https://
 
 require("init.php");
 
 $ca = new WHMCS_ClientArea();
 
 $ca->setPageTitle("VPS Servers");
 
 $ca->addToBreadCrumb('index.php',$whmcs->get_lang('globalsystemname'));
 $ca->addToBreadCrumb('vpservers.php','VPS Servers');
 
 $ca->initPage();
 
 //$ca->requireLogin(); // Uncomment this line to require a login to access this page
 
 # To assign variables to the template system use the following syntax.
 # These can then be referenced using {$variablename} in the template.
 
 $ca->assign('variablename', $value);
 
 # Check login status
 if ($ca->isLoggedIn()) {
 
   # User is logged in - put any code you like here
 
   # Here's an example to get the currently logged in clients first name
 
   $result = mysql_query("SELECT firstname FROM tblclients WHERE id=".$ca->getUserID());
   $data = mysql_fetch_array($result);
   $clientname = $data[0];
 
   $ca->assign('clientname', $clientname);
 
 } else {
 
   # User is not logged in
 
 }
 
 # Define the template filename to be used without the .tpl extension
 
 $ca->setTemplate('vpservers');
 
 $ca->output();
 
 ?>