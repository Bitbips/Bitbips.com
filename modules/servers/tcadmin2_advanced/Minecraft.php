<?php
include('default_values.php');
switch ($params["configoptions"]["Ram"])
{
case "512MB":
  $billing_api_values["gamevar_Xms"] = "512";
  $billing_api_values["gamevar_Xmx"] = "512";
  $billing_api_values["game_slots"] = 10;
  break;
case "512MB":
  $billing_api_values["gamevar_Xms"] = "512";
  $billing_api_values["gamevar_Xmx"] = "512";
  $billing_api_values["game_slots"] = 12;
  break;
case "512MB":
  $billing_api_values["gamevar_Xms"] = "512";
  $billing_api_values["gamevar_Xmx"] = "512";
  $billing_api_values["game_slots"] = 15;
  break;
case "1GB":
  $billing_api_values["gamevar_Xms"] = "1024";
  $billing_api_values["gamevar_Xmx"] = "1024";
  $billing_api_values["game_slots"] = 20;
  break;
case "1.5GB":
  $billing_api_values["gamevar_Xms"] = "1512";
  $billing_api_values["gamevar_Xmx"] = "1512";
  $billing_api_values["game_slots"] = 30;
  break;
case "2GB":
  $billing_api_values["gamevar_Xms"] = "2048";
  $billing_api_values["gamevar_Xmx"] = "2048";
  $billing_api_values["game_slots"] = 35;
  break;
case "2GB":
  $billing_api_values["gamevar_Xms"] = "2048";
  $billing_api_values["gamevar_Xmx"] = "2048";
  $billing_api_values["game_slots"] = 40;
  break;
}
?>
