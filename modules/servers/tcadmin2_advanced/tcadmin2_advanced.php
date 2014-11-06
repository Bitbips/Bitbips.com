<?php

/*
	tcadmin2_advanced version 1.07
	Copyright (c) 2011 Luis Alvarenga
	http://www.tcadmin.com

	Change Log
	v1.07 : Added support for WHMCS 5.3.7.
	      : Start/Stop/Restart is available from the client area.
	v1.06 : Added curl error handling
	v1.05 : Added TS3 upload and download quota attributes
	v1.04 : Values are no longer sent with HTML encoding
	v1.03 : Service password is updated when using a custom field for the TCAdmin password.
	v1.02 : Self signed certificates are supported.
	v1.01 : Added support for WHMCS 3.8.1.
	        Service password is updated correctly.
	v1.0  : Initial release.

	Permission is hereby granted, free of charge, to any person obtaining
	a copy of this software and associated documentation files (the
	"Software"), to deal in the Software without restriction, including
	without limitation the rights to use, copy, modify, merge, publish,
	distribute, sublicense, and/or sell copies of the Software, and to
	permit persons to whom the Software is furnished to do so, subject to
	the following conditions:

	The above copyright notice and this permission notice shall be included
	in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
	IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
	CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
	TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
	SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

if(count(get_included_files()) ==1) exit("Direct access not permitted.");

function tcadmin2_advanced_ConfigOptions() {
	$prodid=(int)$_GET['id'];
	$ddoptions=tcadmin2_advanced_GetOptionsList($prodid);

	# Should return an array of the module options for each product - maximum of 24
    $configarray = array(
	 "Config File" => array( "Type" => "text", "Description" => tcadmin2_advanced_GetDescription("The file that contains the default values used for the TCAdmin billing api. This file contains more options not shown here (command line parameters, service level, game switching, etc). The default file is default_values.php", "300px")."<!-- "),
	 "Test" => array( "Type" => "text", "Description" => " --><td colspan=\"2\" class=\"fieldarea\" align=\"center\"><!-- <a href=\"http://clients.tcadmin.com\" target=\"_blank\">tcadmin2_advanced documentation</a> --><link href=\"../modules/servers/tcadmin2_advanced/hints.css\" rel=\"stylesheet\" type=\"text/css\"><script type=\"text/javascript\" src=\"../modules/servers/tcadmin2_advanced/hints.js\"></script></td><tr><td align=\"center\" colspan=\"2\" style=\"font-weight:bold;\">Game Server Options</td><td align=\"center\" colspan=\"2\" style=\"font-weight:bold;\">Voice Server Options"),
	 "Game ID" => array( "Type" => "text", "Size" => "15", "Description" => tcadmin2_advanced_GetDescription("The game id that will be created. If sent blank a game server will not be created.")),
	 "Voice ID" => array( "Type" => "text", "Size" => "15", "Description" => tcadmin2_advanced_GetDescription("The voice id that will be created. To create a Teamspeak 2 virtual server the value must be TEAMSPEAK. To create a Teamspeak 3 virtual server the value must be TEAMSPEAK3. If sent blank a voice server will not be created.")),
	 "Game Slots" => array( "Type" => "dropdown", "Options" => $ddoptions, "Description" => tcadmin2_advanced_GetDescription("The number of slots that the game server will have. If sent blank a game server will not be created. This value can also include the prefixes PRI and PUB to indicate a private or public game server. For example PRI8 will create a private server with 8 slots.", "400px")),
	 "Voice Slots" => array( "Type" => "dropdown", "Options" => $ddoptions, "Description" => tcadmin2_advanced_GetDescription("The number of slots that the voice server will have. If a valid voice id is sent and this value is sent blank it will use the value of game_slots. This value can also include the prefixes PRI and PUB to indicate a private or public game server. For example PRI8 will create a private server with 8 slots.","400px")),
	 "Game Private" => array( "Type" => "dropdown", "Options" => $ddoptions, "Description" => tcadmin2_advanced_GetDescription("1/yes if the game server is private. 0/no if the game server is public. Default value is 0.") ),
	 "Voice Private" => array( "Type" => "dropdown", "Options" => $ddoptions, "Description" => tcadmin2_advanced_GetDescription("1/yes if the voice server is private. 0/no if the voice server is public. Default value is 0.") ),
	 "Game Branded" => array( "Type" => "dropdown", "Options" => $ddoptions, "Description" => tcadmin2_advanced_GetDescription("1/yes if the game server is branded. 0/no if the game server is not branded. Default value is 0.") ),
	 "Voice Branded" => array( "Type" => "dropdown", "Options" => $ddoptions, "Description" => tcadmin2_advanced_GetDescription("1/yes if the voice server is branded. 0/no if the voice server is not branded. Default value is 0.") ),
	 "Game Datacenter" => array( "Type" => "dropdown", "Options" => $ddoptions, "Description" => tcadmin2_advanced_GetDescription("The datacenter id where the game server will be created.  By default this is required if creating a game server. Set skip_page to 0 to disable.") ),
	 "Voice Datacenter" => array( "Type" => "dropdown", "Options" => $ddoptions, "Description" => tcadmin2_advanced_GetDescription("The datacenter id where the voice server will be created.  By default this is required if creating a game server. Set skip_page to 0 to disable.") ),
	 "Game Hostname" => array( "Type" => "dropdown", "Options" => $ddoptions, "Description" => tcadmin2_advanced_GetDescription("The game server\'s hostname. If the hostname is not specified it will be generated automatically. This is used only if the datacenter is specified.") ),
	 "Voice Hostname" => array( "Type" => "dropdown", "Options" => $ddoptions, "Description" => tcadmin2_advanced_GetDescription("The voice server\'s hostname. If the hostname is not specified it will be generated automatically.") ),
	 "Game RCon Password" => array( "Type" => "dropdown", "Options" => $ddoptions, "Description" => tcadmin2_advanced_GetDescription("The game server\'s RCon password. If the RCon password is not specified it will be generated automatically.") ),
	 "Voice RCon Password" => array( "Type" => "dropdown", "Options" => $ddoptions, "Description" => tcadmin2_advanced_GetDescription("The voice server\'s RCon password. If the RCon password is not specified it will be generated automatically.") ),
	 "Game Private Password" => array( "Type" => "dropdown", "Options" => $ddoptions, "Description" => tcadmin2_advanced_GetDescription("The game server\'s private password. If the private password is not specified it will be generated automatically.") ),
	 "Voice Private Password" => array( "Type" => "dropdown", "Options" => $ddoptions, "Description" => tcadmin2_advanced_GetDescription("The voice server\'s private password. If the private password is not specified it will be generated automatically.") ),
	);

	return $configarray;
}

function tcadmin2_advanced_CreateAccount($params)
{
	return tcadmin2_advanced_ExecuteTCAdminCommand($params, 'AddPendingSetup');
}

function tcadmin2_advanced_TerminateAccount($params) {
	return tcadmin2_advanced_ExecuteTCAdminCommand($params, 'DeleteGameAndVoiceByBillingID');
}

function tcadmin2_advanced_SuspendAccount($params)
{
	return tcadmin2_advanced_ExecuteTCAdminCommand($params, 'SuspendGameAndVoiceByBillingID');
}

function tcadmin2_advanced_UnsuspendAccount($params)
{
	return tcadmin2_advanced_ExecuteTCAdminCommand($params, 'UnSuspendGameAndVoiceByBillingID');
}

function tcadmin2_advanced_ChangePassword($params) {
    return tcadmin2_advanced_ExecuteTCAdminCommand($params, "ChangePassword");
}

function tcadmin2_advanced_ChangePackage($params) {
	return tcadmin2_advanced_ExecuteTCAdminCommand($params, "UpdateSettings");
}

function tcadmin2_advanced_ExecuteTCAdminCommand($params, $tcacommand) {

	/* *********** */
	/* Config file */
	/* *********** */

	$configfile = $params["configoption1"];
	if($configfile=="")
	    $configfile="default_values.php";


	$configfile=realpath(dirname(__FILE__)).DIRECTORY_SEPARATOR.$configfile;

	if(!file_exists($configfile))
		return 'The configuration file "'.$configfile.'" does not exist.';

	include $configfile;


	$billing_api_values["function"] = $tcacommand;
	$custompwd = ($billing_api_values["user_password"] != $params["password"]);

	/* ******************* */
	/* Load Service Values */
	/* ******************* */

	while( $element = each( $billing_api_values ) )
	{
	    $billing_api_values[$element['key']] = html_entity_decode(tcadmin2_advanced_GetDBValue($params['packageid'], $params['serviceid'], $element['value']));
	}

	/* *************** */
	/* Billing api url */
	/* *************** */

	$url = ($params["serversecure"]=='on' ? 'https':'http').'://'.$params["serverhostname"].'/billingapi.aspx';

	/* **************** */
	/* Post information */
	/* **************** */

	$data = tcadmin2_advanced_PostData($url, $billing_api_values);

	$successful=(tcadmin2_advanced_GetErrorCode($data)=="0");

	if ($successful) {	
		$result = "success";
		if ($tcacommand=='AddPendingSetup')
		{
			/* **************************** */
			/* Update Username and Password */
			/* **************************** */
			$encryptedpass = encrypt($billing_api_values["user_password"]);
			mysql_query("UPDATE tblhosting SET username='".mysql_real_escape_string(tcadmin2_advanced_GetReturnText($data))."', password='".mysql_real_escape_string($encryptedpass)."' WHERE id=".mysql_real_escape_string($params["serviceid"]));

			/* ****************************************************************** */
			/* Update Password if client already has a service on the same server */
			/* ****************************************************************** */
			$previouspwd=mysql_query("SELECT password FROM tblhosting WHERE password<>'' AND domainstatus='Active' AND userid=".mysql_real_escape_string($params["clientsdetails"]["userid"])." AND id <> ".mysql_real_escape_string($params["serviceid"])." AND server = (SELECT server FROM tblhosting WHERE id = ".mysql_real_escape_string($params["serviceid"]).")");
			$arraypwd=mysql_fetch_assoc($previouspwd);
			mysql_free_result($previouspwd);

			if(count($arraypwd)!=0 && $arraypwd['password']!='')
				mysql_query("UPDATE tblhosting SET password='".mysql_real_escape_string($arraypwd['password'])."' WHERE id=".mysql_real_escape_string($params["serviceid"]));
		}
		if ($tcacommand=='ChangePassword')
		{
			/* *************************************************************** */
			/* Update Password if client has other services on the same server */
			/* *************************************************************** */
			$previouspwd=mysql_query("SELECT username, password, server FROM tblhosting WHERE id = ".mysql_real_escape_string($params["serviceid"]));
			$arraypwd=mysql_fetch_assoc($previouspwd);
			mysql_free_result($previouspwd);
			mysql_query("UPDATE tblhosting SET password='".mysql_real_escape_string($arraypwd['password'])."' WHERE userid=".mysql_real_escape_string($params["clientsdetails"]["userid"])." AND id<>".mysql_real_escape_string($params["serviceid"])." AND username = '".mysql_real_escape_string($arraypwd['username'])."' AND server = ".mysql_real_escape_string($arraypwd['server']));
		}
	} else {
		$result = tcadmin2_advanced_GetErrorText($data);
		if($result=='')
			$result='No results were returned. Check your TCAdmin logs. URL used: '.$url;
	}
	return $result;
}

function tcadmin2_advanced_ClientArea($params) {
	$code = '<form action="'.($params["serversecure"]=='on' ? 'https':'http').'://'.$params["serverhostname"].'/Interface/Base/Login.aspx?ReturnUrl=%2fInterface%2fBase%2fHome.aspx%3fGoToServiceBillingID%3d'.$params["accountid"].'" method="post" target="_blank">
<input type="hidden" name="USERID" value="'.$params["username"].'" />
<input type="hidden" name="PASSWORD" value="'.$params["password"].'" />
<input type="submit" value="Login to Control Panel" />
</form>';
	return $code;
}

function tcadmin2_advanced_AdminLink($params) {
	$code = '<form action="'.($params["serversecure"]=='on' ? 'https':'http').'://'.$params["serverhostname"].'/Interface/Base/Login.aspx" method="post" target="_blank">
<input type="hidden" name="USERID" value="'.$params["serverusername"].'" />
<input type="hidden" name="PASSWORD" value="'.$params["serverpassword"].'" />
<input type="submit" value="Login to TCAdmin" />
</form>';

	//Return $code here if you want a TCAdmin login button in Configuration > Servers.
	return "";
}

function tcadmin2_advanced_LoginLink($params) {
	$code = '[<a href="'.($params["serversecure"]=='on' ? 'https':'http').'://'.$params["serverhostname"].'/Interface/Base/Home.aspx?GoToUserName='.$params["username"].'" target=\"_blank\" style=\"color:#cc0000\">Go to User</a>] ';
	echo $code;
	$code = '[<a href="'.($params["serversecure"]=='on' ? 'https':'http').'://'.$params["serverhostname"].'/Interface/Base/Home.aspx?GoToServiceBillingID='.$params["accountid"].'" target=\"_blank\" style=\"color:#cc0000\">Go to Service</a>]';
	echo $code;
}

function tcadmin2_advanced_AdminCustomButtonArray() {
# This function can define additional functions your module supports, the example here is a reboot button and then the reboot function is defined below
	$buttonarray = array(
		"Stop" => "Stop",
		"Start" => "Start",
		"Restart" => "Restart",
	);
	return $buttonarray;
}

function tcadmin2_advanced_ClientAreaCustomButtonArray() {
# This function can define additional functions your module supports, the example here is a reboot button and then the reboot function is defined below
	$buttonarray = array(
		"Stop" => "Stop",
		"Start" => "Start",
		"Restart" => "Restart",
	);
	return $buttonarray;
}

function tcadmin2_advanced_Stop($params) {
	return tcadmin2_advanced_ExecuteTCAdminCommand($params, 'StopByBillingId');
}

function tcadmin2_advanced_Start($params) {
	return tcadmin2_advanced_ExecuteTCAdminCommand($params, 'StartByBillingId');
}

function tcadmin2_advanced_Restart($params) {
	return tcadmin2_advanced_ExecuteTCAdminCommand($params, 'RestartByBillingId');
}

function tcadmin2_advanced_GetDescription($desc, $descwidth) {
	if($descwidth==null)
	  $descwidth="200px";

	return "<a href=\"#\" style=\"text-decoration:none;\" onmouseover=\"try{if(showhint)showhint('".$desc."', this, event, '".$descwidth."')}catch(err){}\">[?]</a>";
}

function tcadmin2_advanced_GetOptionsList($prodid) {
	//if(strpos($GLOBALS["CONFIG"]["Version"], "3.7"))
	//	$ddquery="SELECT concat('CustomField:', fieldname) FROM tblcustomfields where type='product' and relid=".mysql_real_escape_string($prodid)." union SELECT concat('ConfigOption:', optionname) FROM tblproductconfigoptions where productid=".mysql_real_escape_string($prodid);
	//else
		$ddquery="SELECT concat('CustomField:', fieldname) FROM tblcustomfields where type='product' and relid=".mysql_real_escape_string($prodid)." union SELECT concat('ConfigOption:', optionname) FROM tblproductconfigoptions A, tblproductconfiglinks B WHERE A.gid = B.gid AND B.pid=".mysql_real_escape_string($prodid);

	$ddresult=mysql_query($ddquery);

	$ddoptions="";
	while ($ddrow=mysql_fetch_row($ddresult)) {
	  $ddoptions.=",".$ddrow[0];
	}
	mysql_free_result($ddresult);
	return $ddoptions;
}

function tcadmin2_advanced_GetDBValue($pid, $serviceid, $fieldname) {
	$values=explode(':', $fieldname);
	
	switch ($values[0]) {
	    case 'CustomField':
		$query = "SELECT A.fieldtype, B.value FROM tblcustomfields A, tblcustomfieldsvalues B WHERE A.id=B.fieldid AND A.type='product' AND A.relid=".mysql_real_escape_string($pid)." AND A.fieldname = '".mysql_real_escape_string($values[1])."' AND B.relid=".mysql_real_escape_string($serviceid);

		$result=mysql_query($query);
		$array=mysql_fetch_assoc($result);
		mysql_free_result($result);

		if(count($array)==0)
			return $fieldname;

		switch ($array['fieldtype']) {
		    case 'dropdown':
			return strpos($array['value'], '|') == false ? $array['value'] : substr($array['value'], 0,strpos($array['value'], '|'));
			break;
		    case 'tickbox':
			return $array["value"] == 'on' ? 1:0;
			break;
		}

		return $array["value"];
		
		break;
	    case "ConfigOption":
		//if(strpos($GLOBALS["CONFIG"]["Version"], "3.7"))
		//	$query = "SELECT A.optiontype, B.optionname, C.qty FROM tblproductconfigoptions A, tblproductconfigoptionssub B, tblhostingconfigoptions C WHERE A.id = B.configid AND B.configid= C.configid AND B.id= C.optionid AND A.productid=".mysql_real_escape_string($pid)." AND A.optionname='".mysql_real_escape_string($values[1])."' AND C.relid=".mysql_real_escape_string($serviceid);
		//else
			$query = "SELECT A.optiontype, B.optionname, C.qty FROM tblproductconfigoptions A, tblproductconfigoptionssub B, tblhostingconfigoptions C, tblproductconfiggroups D, tblproductconfiglinks E WHERE A.id = B.configid AND B.configid = C.configid AND B.id = C.optionid AND A.gid = D.id AND D.id = E.gid AND E.pid=".mysql_real_escape_string($pid)." AND A.optionname='".mysql_real_escape_string($values[1])."' AND C.relid=".mysql_real_escape_string($serviceid);

		$result=mysql_query($query);
		$array=mysql_fetch_assoc($result);
		mysql_free_result($result);

		if(count($array)==0)
			return $fieldname;

		switch ($array['optiontype']) {
		    case 1:
		    case 2:
			return strpos($array['optionname'], '|') == false ? $array['optionname'] : substr($array['optionname'], 0,strpos($array['optionname'], '|'));
			break;
		    case 3:
		    case 4:
			return $array["qty"];
			break;
		}

		break;
	    default:
		return $fieldname;
	}
}

function tcadmin2_advanced_GetReturnCode($results)
{
	$columns = explode("\t", $results);
	return $columns[0];
}

function tcadmin2_advanced_GetReturnText($results)
{
	$columns = explode("\t", $results);
	return $columns[1];
}

function tcadmin2_advanced_GetErrorCode($results)
{
	$columns = explode("\t", $results);
	$columns[2] = str_replace(chr(10), "", $columns[2]);
	$columns[2] = str_replace(chr(13), "", $columns[2]);
	return $columns[2];
}

function tcadmin2_advanced_GetErrorText($results)
{
	$columns = explode("\t", $results);
	return $columns[3];
}

function tcadmin2_advanced_PostData($url, $postfields)
{
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
	curl_setopt($ch, CURLOPT_CAINFO, NULL);
	curl_setopt($ch, CURLOPT_CAPATH, NULL); 
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_POST, TRUE);
	curl_setopt($ch, CURLOPT_TIMEOUT, 120);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $postfields);
        curl_setopt( $ch, CURLOPT_HTTPHEADER, array( 'Expect:','Accept-Charset: UTF-8' ) );
	$data = curl_exec($ch);
	if($data === false){
	  $data = "0\t\t-1\tCurl error: " . curl_error($ch) . " Url: " . curl_getinfo ( $ch,  CURLINFO_EFFECTIVE_URL);
	}
	curl_close($ch);
	return $data;
}
?>