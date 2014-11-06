<?php

/*
	tcadmin_advanced version 1.05
	Copyright (c) 2009 Luis Alvarenga
	http://www.tcadmin.com

	Change Log
	v1.05 : Added TS3 upload and download quota attributes
	v1.04 : Values are no longet sent with HTML encoding
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

$billing_api_values = array();

/* ********************************************************************************** */
/* TCAdmin V2 Values                                                                  */
/* To create a reseller package make a copy of this file.                             */
/* Set the value of your reseller role id and the package id that you want to assign. */
/* In your product configuration set the config file to the file that you created.    */
/* ********************************************************************************** */
$billing_api_values["role_id"]="";
$billing_api_values["package_id"]="";

/* ********************************************************************************** */
/* If a reseller has more than one package he can set these values to specify which   */
/* package to use for a game, voice or Teamspeak server. Leave blank to use the       */
/* packages configured in your API settings. Get the user package ids from an admin.  */
/* ********************************************************************************** */
$billing_api_values["game_user_package_id"]="";
$billing_api_values["voice_user_package_id"]="";
$billing_api_values["ts_user_package_id"]="";

/* ********************************************************************************* */
/* Custom variables: You can specify custom variable values in the following format: */
/* $billing_api_values["gamevar_VariableName"] = "value" (for game servers)          */
/* $billing_api_values["voicevar_VariableName"] = "value" (for voice servers)        */
/* ********************************************************************************* */

/* *************** */
/* Advanced Values */
/* *************** */

$billing_api_values["game_additional_slots"]="0";
$billing_api_values["voice_additional_slots"]="0";
$billing_api_values["voice_additional_arguments"]="";
$billing_api_values["voice_upload_quota"]="";
$billing_api_values["voice_download_quota"]="";

/* ************************** */
/* Client UserId and Password */
/* ************************** */

$billing_api_values["user_name"] = $params["username"];
$billing_api_values["user_password"] = $params["password"];


/* *************************************************************************************** */
/*                              DON'T CHANGE BELLOW THIS LINE                              */
/* *************************************************************************************** */


/* **************************************** */
/* Values found in the module settings page */
/* **************************************** */

$billing_api_values["game_package_id"] = $params["serviceid"];
$billing_api_values["voice_package_id"] = $params["serviceid"];
$billing_api_values["package_package_id"] = $params["serviceid"];
$billing_api_values["client_package_id"] = $params["serviceid"];


$billing_api_values["game_id"] = $params["configoption3"];
$billing_api_values["game_slots"] = $params["configoption5"];
$billing_api_values["game_private"] = $params["configoption7"];
$billing_api_values["game_branded"] = $params["configoption9"];
$billing_api_values["game_datacenter"] = $params["configoption11"];
$billing_api_values["game_hostname"] = $params["configoption13"];
$billing_api_values["game_rcon_password"] = $params["configoption15"];
$billing_api_values["game_private_password"] = $params["configoption17"];

$billing_api_values["voice_id"] = $params["configoption4"];
$billing_api_values["voice_slots"] = $params["configoption6"];
$billing_api_values["voice_private"] = $params["configoption8"];
$billing_api_values["voice_branded"] = $params["configoption10"];
$billing_api_values["voice_datacenter"] = $params["configoption12"];
$billing_api_values["voice_hostname"] = $params["configoption14"];
$billing_api_values["voice_rcon_password"] = $params["configoption16"];
$billing_api_values["voice_private_password"] = $params["configoption18"];

$billing_api_values["skip_page"]="1";

/* ****************** */
/* Client Information */
/* ****************** */

$billing_api_values["client_id"] = $params["clientsdetails"]["userid"];
$billing_api_values["user_email"] = $params["clientsdetails"]["email"];
$billing_api_values["user_fname"] = $params["clientsdetails"]["firstname"];
$billing_api_values["user_lname"] = $params["clientsdetails"]["lastname"];
$billing_api_values["user_address1"] = $params["clientsdetails"]["address1"];
$billing_api_values["user_address2"] = $params["clientsdetails"]["address2"];
$billing_api_values["user_city"] = $params["clientsdetails"]["city"];
$billing_api_values["user_state"] = $params["clientsdetails"]["state"];
$billing_api_values["user_zip"] = $params["clientsdetails"]["postcode"];
$billing_api_values["user_country"] = $params["clientsdetails"]["country"];
$billing_api_values["user_phone1"] = $params["clientsdetails"]["phonenumber"];
$billing_api_values["user_phone2"] = "";

/* ****************************** */
/* Billing API Login and Password */
/* ****************************** */
$billing_api_values["response_type"] = "text";
$billing_api_values["tcadmin_username"] = $params["serverusername"];
$billing_api_values["tcadmin_password"] = $params["serverpassword"];

?>