<?php
/*
stardevelop.com Live Help
International Copyright stardevelop.com

You may not distribute this program in any manner,
modified or otherwise, without the express, written
consent from stardevelop.com

You may make modifications, but only for your own 
use and within the confines of the License Agreement.
All rights reserved.

Selling the code for this program without prior 
written consent is expressly forbidden. Obtain 
permission before redistributing this program over 
the Internet or in any other medium.  In all cases 
copyright and header must remain intact.  
*/

$installed = false;
$database = include('../include/database.php');
if ($database) {
	include('../include/spiders.php');
	include('../include/class.mysql.php');
	include('../include/class.aes.php');
	include('../include/class.cookie.php');
	$installed = include('../include/config.php');
} else {
	$installed = false;
}

if ($installed == false) {
	header('Location: ./default.php');
}

header('Content-type: text/css');

if (file_exists('../locale/' . LANGUAGE . '/guest.php')) {
	include('../locale/' . LANGUAGE . '/guest.php');
}
else {
	include('../locale/en/guest.php');
}

if (!isset($_SETTINGS['DIRECTION'])) { $_SETTINGS['DIRECTION'] = 'ltr'; }
?>

div, p, td {
	font-family: <?php echo($_SETTINGS['FONT']); ?>;
	font-size: <?php echo($_SETTINGS['FONTSIZE']); ?>;
	color: <?php echo($_SETTINGS['FONTCOLOR']); ?>;
	direction: <?php echo($_SETTINGS['DIRECTION']); ?>;
}
body {
	background-color: <?php echo($_SETTINGS['BACKGROUNDCOLOR']); ?>;
	color: <?php echo($_SETTINGS['FONTCOLOR']); ?>;
}
input, textarea {
	font-family:<?php echo($_SETTINGS['CHATFONT']); ?>; 
    font-size: <?php echo($_SETTINGS['CHATFONTSIZE']); ?>;
}
a.normlink:link, a.normlink:visited, a.normlink:active {
	color: <?php echo($_SETTINGS['LINKCOLOR']); ?>;
	text-decoration: none;
	font-family: <?php echo($_SETTINGS['FONT']); ?>;
	border-bottom-width: 0.05em;
	border-bottom-style: solid;
	border-bottom-color: #CCCCCC;
}
a.normlink:hover {
	color: <?php echo($_SETTINGS['LINKCOLOR']); ?>;
	text-decoration: none;
	font-family: <?php echo($_SETTINGS['FONT']); ?>;
	border-bottom-width: 0.05em;
	border-bottom-style: solid;
	border-bottom-color: <?php echo($_SETTINGS['LINKCOLOR']); ?>;
}
.heading {
	font-family: <?php echo($_SETTINGS['FONT']); ?>;
	font-size: 16px;
}
.small {
	font-size: 10px;
}
.headingusers {
	font-family: <?php echo($_SETTINGS['FONT']); ?>;
	font-size: 18px;
}
.smallusers {
	font-family: <?php echo($_SETTINGS['FONT']); ?>;
	font-size: 10px;
	color: #CBCBCB;
}
.message {
	font-family: <?php echo($_SETTINGS['CHATFONT']); ?>;
	font-size: <?php echo($_SETTINGS['CHATFONTSIZE']); ?>;
}
a.message:link, a.message:visited, a.message:active {
	color: <?php echo($_SETTINGS['LINKCOLOR']); ?>;
	text-decoration: none;
	font-family: <?php echo($_SETTINGS['CHATFONT']); ?>;
	font-size: <?php echo($_SETTINGS['CHATFONTSIZE']); ?>;
	border-bottom-width: 0.05em;
	border-bottom-style: solid;
	border-bottom-color: #CCCCCC;
}
a.message:hover {
	color: <?php echo($_SETTINGS['LINKCOLOR']); ?>;
	text-decoration: none;
	font-family: <?php echo($_SETTINGS['CHATFONT']); ?>;
	font-size: <?php echo($_SETTINGS['CHATFONTSIZE']); ?>;
	border-bottom-width: 0.05em;
	border-bottom-style: solid;
	border-bottom-color: <?php echo($_SETTINGS['LINKCOLOR']); ?>;
}
a.tooltip {
	position: relative;
	font-family: <?php echo($_SETTINGS['FONT']); ?>;
	font-size: 10px;
	z-index: 100;
	color: #000000;
	text-decoration: none;
	border-bottom-width: 0.05em;
	border-bottom-style: dashed;
	border-bottom-color: #CCCCCC;
}
a.tooltip:hover {
	z-index: 150;
	background-color: #FFFFFF;
}
a.tooltip span {
	display: none
}
a.tooltip:hover span {
    display: block;
    position: absolute;
    top: 15px;
	left: -100px;
	width: 175px;
	padding: 5px;
	margin: 10px;
    border: 1px dashed #339;
    background-color: #E8EAFC;
	color: #000000;
    text-align: center
}
.box {
	border-style: solid;
	border-width: 1px;
	border-color: #FFFF77;
	background-color: #FFFFCC;
	margin-top: 10px;
}

/* BubbleTip CSS */

.bubbletip {
	position: absolute;
	z-index: 90000000;
	width: auto;
	border-collapse: collapse;
	margin: 0;
	border: none;
	-webkit-border-radius: 0; -moz-border-radius: 0; border-radius: 0;
}
.bubbletip td, .bubbletip th, .bubbletip table, .bubbletip table td, .bubbletip table th {
	border: none;
	margin: 0;
	padding: 0;
	width: auto;
	line-height: normal;
}
.bubbletip td.bt-topleft {
	background: transparent url(../images/bubbletip/bubbletip.png) no-repeat scroll 0px 0px;
	height: 33px;
	width: 33px;
}
.bubbletip td.bt-top {
	background: transparent url(../images/bubbletip/bubbletip-T-B.png) repeat-x scroll 0px 0px;
	height: 33px;
}
.bubbletip td.bt-topright {
	background: transparent url(../images/bubbletip/bubbletip.png) no-repeat scroll -73px 0px;
	height: 33px;
	width: 33px;
}
.bubbletip td.bt-left-tail div.bt-left, .bubbletip td.bt-left {
	background: transparent url(../images/bubbletip/bubbletip-L-R.png) repeat-y scroll 0px 0px;
	width: 33px;
}
.bubbletip td.bt-left-tail div.bt-left-tail {
	background: transparent url(../images/bubbletip/bubbletip.png) no-repeat scroll 0px -33px;
	width: 33px;
	height: 40px;
}
.bubbletip td.bt-right-tail div.bt-right, .bubbletip td.bt-right {
	background: transparent url(../images/bubbletip/bubbletip-L-R.png) repeat-y scroll -33px 0px;
	width: 33px;
}
.bubbletip td.bt-right-tail div.bt-right-tail {
	background: transparent url(../images/bubbletip/bubbletip.png) no-repeat scroll -73px -33px;
	width: 33px;
	height: 40px;
}
.bubbletip td.bt-bottomleft {
	background: transparent url(../images/bubbletip/bubbletip.png) no-repeat scroll 0px -73px;
	height: 33px;
	width: 33px;
}
.bubbletip td.bt-bottom {
	background: transparent url(../images/bubbletip/bubbletip-T-B.png) repeat-x scroll 0px -33px;
	height: 33px;
}
.bubbletip td.bt-bottomright {
	background: transparent url(../images/bubbletip/bubbletip.png) no-repeat scroll -73px -73px;
	height: 33px;
	width: 33px;
}
.bubbletip table.bt-top, .bubbletip table.bt-bottom {
	width: 100%;
}
.bubbletip table.bt-top th {
	width: 50%;
	background: transparent url(../images/bubbletip/bubbletip-T-B.png) repeat-x scroll 0px 0px;
}
.bubbletip table.bt-bottom th {
	width: 50%;
	background: transparent url(../images/bubbletip/bubbletip-T-B.png) repeat-x scroll 0px -33px;
}
.bubbletip table.bt-top td div {
	background: transparent url(../images/bubbletip/bubbletip.png) no-repeat scroll -33px 0px;
	width: 40px;
	height: 33px;
}
.bubbletip table.bt-bottom td div {
	background: transparent url(../images/bubbletip/bubbletip.png) no-repeat scroll -33px -73px;
	width: 40px;
	height: 33px;
}
.bubbletip td.bt-content {
	background-color: #fff;
	vertical-align: middle;
}

#SmiliesTooltip span, .Smilie { display:inline-block; margin: 1px }

.sprite{background:url('../images/Sprite.png') no-repeat}
.sprite.AdoreSmall{width:16px;height:16px;background-position:-111px -464px}
.sprite.Adore{width:24px;height:24px;background-position:-98px -422px}
.sprite.AngrySmall{width:16px;height:16px;background-position:-90px -464px}
.sprite.Angry{width:24px;height:24px;background-position:-69px -422px}
.sprite.CancelButton{width:91px;height:39px;background-position:-419px -397px}
.sprite.CancelButtonHover{width:91px;height:39px;background-position:-323px -397px}
.sprite.CelebrateSmall{width:16px;height:16px;background-position:-69px -464px}
.sprite.Celebrate{width:24px;height:24px;background-position:-573px -393px}
.sprite.ChatActionText{width:124px;height:64px;background-position:-326px -117px}
.sprite.CloseButton{width:11px;height:11px;background-position:-326px -199px}
.sprite.Collapse{width:9px;height:16px;background-position:-600px -128px}
.sprite.ConnectButton{width:116px;height:42px;background-position:-121px -353px}
.sprite.ConnectButtonHover{width:116px;height:42px;background-position:-0px -322px}
.sprite.CoolSmall{width:16px;height:16px;background-position:-596px -443px}
.sprite.Cool{width:24px;height:24px;background-position:-544px -393px}
.sprite.Cross{width:24px;height:24px;background-position:-515px -393px}
.sprite.CrossSmall{width:16px;height:16px;background-position:-575px -443px}
.sprite.CrySmall{width:16px;height:16px;background-position:-554px -443px}
.sprite.Cry{width:24px;height:24px;background-position:-69px -393px}
.sprite.Disconnect{width:16px;height:16px;background-position:-533px -443px}
.sprite.DisconnectButton{width:119px;height:39px;background-position:-366px -353px}
.sprite.DisconnectButtonHover{width:119px;height:39px;background-position:-242px -353px}
.sprite.DizzySmall{width:16px;height:16px;background-position:-512px -443px}
.sprite.Dizzy{width:24px;height:24px;background-position:-577px -364px}
.sprite.Email{width:16px;height:16px;background-position:-491px -443px}
.sprite.Expand{width:9px;height:16px;background-position:-600px -107px}
.sprite.Facebook{width:202px;height:26px;background-position:-317px -322px}
.sprite.Feedback{width:16px;height:16px;background-position:-470px -443px}
.sprite.FileTransferActionText{width:550px;height:112px;background-position:-0px -0px}
.sprite.FileTransferDocument{width:167px;height:198px;background-position:-0px -117px}
.sprite.FileTransferDocumentText{width:76px;height:51px;background-position:-242px -397px}
.sprite.FrownSmall{width:16px;height:16px;background-position:-449px -443px}
.sprite.Frown{width:24px;height:24px;background-position:-548px -364px}
.sprite.HystericalSmall{width:16px;height:16px;background-position:-428px -443px}
.sprite.Hysterical{width:24px;height:24px;background-position:-519px -364px}
.sprite.ImpishSmall{width:16px;height:16px;background-position:-407px -443px}
.sprite.Impish{width:24px;height:24px;background-position:-490px -364px}
.sprite.KissedSmall{width:16px;height:16px;background-position:-386px -443px}
.sprite.Kissed{width:24px;height:24px;background-position:-582px -335px}
.sprite.LaughSmall{width:16px;height:16px;background-position:-365px -443px}
.sprite.Laugh{width:24px;height:24px;background-position:-553px -335px}
.sprite.LiveChatIcon{width:54px;height:55px;background-position:-555px -0px}
.sprite.Magnify{width:74px;height:74px;background-position:-455px -117px}
.sprite.MoneySmall{width:16px;height:16px;background-position:-344px -443px}
.sprite.Money{width:24px;height:24px;background-position:-524px -335px}
.sprite.Notification{width:22px;height:22px;background-position:-593px -172px}
.sprite.OfflineButton{width:140px;height:39px;background-position:-172px -291px}
.sprite.OfflineButtonHover{width:140px;height:39px;background-position:-346px -247px}
.sprite.OfflineStamp{width:149px;height:93px;background-position:-172px -117px}
.sprite.OfflineSuggestions{width:344px;height:27px;background-position:-172px -215px}
.sprite.Online{width:64px;height:18px;background-position:-521px -219px}
.sprite.OperatorForeground{width:61px;height:50px;background-position:-534px -117px}
.sprite.Play{width:64px;height:64px;background-position:-0px -397px}
.sprite.Popup{width:16px;height:16px;background-position:-323px -443px}
.sprite.PoweredByLiveHelp{width:169px;height:33px;background-position:-172px -247px}
.sprite.Refresh{width:16px;height:16px;background-position:-211px -443px}
.sprite.SadSmall{width:16px;height:16px;background-position:-190px -443px}
.sprite.Sad{width:24px;height:24px;background-position:-582px -306px}
.sprite.SendButton{width:54px;height:42px;background-position:-534px -172px}
.sprite.SendButtonHover{width:54px;height:42px;background-position:-555px -60px}
.sprite.SendFile{width:16px;height:16px;background-position:-169px -443px}
.sprite.ShockSmall{width:16px;height:16px;background-position:-148px -443px}
.sprite.Shock{width:24px;height:24px;background-position:-553px -306px}
.sprite.SleepSmall{width:16px;height:16px;background-position:-127px -443px}
.sprite.Sleep{width:24px;height:24px;background-position:-524px -306px}
.sprite.SmileSmall{width:16px;height:16px;background-position:-599px -422px}
.sprite.Smile{width:24px;height:24px;background-position:-582px -277px}
.sprite.SmilieButton{width:16px;height:16px;background-position:-578px -422px}
.sprite.SoundOff{width:16px;height:16px;background-position:-557px -422px}
.sprite.SoundOn{width:16px;height:16px;background-position:-536px -422px}
.sprite.StopSmall{width:16px;height:16px;background-position:-515px -422px}
.sprite.Stop{width:24px;height:24px;background-position:-553px -277px}
.sprite.StudySmall{width:16px;height:16px;background-position:-211px -422px}
.sprite.Study{width:24px;height:24px;background-position:-524px -277px}
.sprite.SurpriseSmall{width:16px;height:16px;background-position:-190px -422px}
.sprite.Surprise{width:24px;height:24px;background-position:-578px -248px}
.sprite.SweatSmall{width:16px;height:16px;background-position:-169px -422px}
.sprite.Sweat{width:24px;height:24px;background-position:-549px -248px}
.sprite.TickSmall{width:16px;height:16px;background-position:-148px -422px}
.sprite.TiredSmall{width:16px;height:16px;background-position:-127px -422px}
.sprite.Tired{width:24px;height:24px;background-position:-520px -248px}
.sprite.Twitter{width:202px;height:26px;background-position:-317px -291px}
.sprite.Typing{width:13px;height:10px;background-position:-600px -149px}
.sprite.WinkSmall{width:16px;height:16px;background-position:-98px -393px}
.sprite.Wink{width:24px;height:24px;background-position:-491px -248px}
.sprite.WooSmall{width:16px;height:16px;background-position:-593px -199px}
.sprite.Woo{width:24px;height:24px;background-position:-590px -219px}