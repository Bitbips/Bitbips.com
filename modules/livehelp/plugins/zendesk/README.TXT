/*

stardevelop.com Live Help International Copyright 2003-2011
Live Help Zendesk JavaScript
Requirement: jQuery 1.40.1 or above

Instructions:  Please copy the JavaScript code below into a Zendesk > Settings > Extensions > Global JavaScript Widget.
This JavaScript should be inserted on all Zendesk pages and you need to customise the following line with your server details where Live Help is installed.

LiveHelpSettings.server = 'labs.stardevelop.com';

*/

var LiveHelpSettings = {};
LiveHelpSettings.server = 'labs.stardevelop.com';
LiveHelpSettings.chatTab = true;
LiveHelpSettings.zendesk = true;

if (currentUser != 'undefined' && currentUser.isEndUser == true && currentUser.id != null && currentUser.name != 'Anonymous user') {
	LiveHelpSettings.name = currentUser.name;
	LiveHelpSettings.email = currentUser.email;
}

jQuery(document).ready(function() {

	// JavaScript
	var LiveHelp = document.createElement('script'); LiveHelp.type = 'text/javascript'; LiveHelp.async = true;
	LiveHelp.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + LiveHelpSettings.server + '/livehelp/scripts/jquery.livehelp.noconflict.js';
	var s = document.getElementsByTagName('script')[0];
	s.parentNode.insertBefore(LiveHelp, s);
	
	var Zendesk = document.createElement('script'); LiveHelp.type = 'text/javascript'; Zendesk.async = true;
	Zendesk.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + LiveHelpSettings.server + '/livehelp/plugins/zendesk/jquery.livehelp.zendesk.js';
	s.parentNode.insertBefore(Zendesk, s);

});