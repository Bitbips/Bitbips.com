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

/*
 * Hook class name must end with Hooks
 * i.e. ExampleHooks or TestHooks
 *
 */
class DeviceNotificationHooks {

	function DeviceNotificationHooks() {
		// Init Hook
	}

	function OnlineDevices() {

		global $SQL;
		global $_SETTINGS;

		// Online Operators
		if ((float)$_SETTINGS['SERVERVERSION'] >= 4.1) { // Multiple Device PUSH Supported
			$query = sprintf("SELECT `users`.`id` AS `id`, `users`.`device` AS `legacydevice`, `devices`.`token` AS `device`, `unique` FROM " . $_SETTINGS['TABLEPREFIX'] . "users AS `users` LEFT JOIN " . $_SETTINGS['TABLEPREFIX'] . "devices AS `devices` ON `users`.`id` = `devices`.`user` WHERE (`refresh` > DATE_SUB(NOW(), INTERVAL %d SECOND) AND `status` = '1') OR (`token` <> '' AND `status` = '1') OR (`users`.`device` <> '' AND `status` = '1') GROUP BY `devices`.`id` ORDER BY `users`.`datetime` DESC", $_SETTINGS['CONNECTIONTIMEOUT']);
		} else if ((float)$_SETTINGS['SERVERVERSION'] >= 3.80) { // iPhone PUSH Supported
			$query = sprintf("SELECT `id`, `device` FROM " . $_SETTINGS['TABLEPREFIX'] . "users WHERE (`refresh` > DATE_SUB(NOW(), INTERVAL %d SECOND) AND `status` = '1') OR (`device` <> '' AND `status` = '1')", $_SETTINGS['CONNECTIONTIMEOUT']);
		}
		$rows = $SQL->selectall($query);

		$devices = array();
		if (is_array($rows)) {
			// iPhone / Android Devices
			if ((float)$_SETTINGS['SERVERVERSION'] >= 4.1) {
				$unique = array();
				foreach ($rows as $key => $row) {
					if (!in_array($row['unique'], $unique)) {
						$unique[] = $row['unique'];
						$device = $row['device'];
						if (!empty($device)) {
							$devices[] = $device;
						}
					}
					if (!in_array($row['legacydevice'], $devices)) {
						$device = $row['legacydevice'];
						if (!empty($device)) {
							$devices[] = $device;
						}
					}
				}
			} else { // iPhone PUSH Supported
				foreach ($rows as $key => $row) {
					$device = $row['device'];
					if (!empty($device)) {
						$devices[] = $device;
					}
				}
			}
		}

		return $devices;
	}

	function SendMessageNotification($args) {

		global $SQL;
		global $_SETTINGS;

		// Arguments
		$chat = $args['chat'];
		$username = $args['username'];
		$message = $args['message'];
		$active = (isset($args['active'])) ? $args['active'] : '';

		if (!empty($active)) {

			if ((float)$_SETTINGS['SERVERVERSION'] >= 4.1) { // Multiple Device PUSH Supported
				$query = sprintf("SELECT `token` FROM " . $_SETTINGS['TABLEPREFIX'] . "users AS `users` LEFT JOIN " . $_SETTINGS['TABLEPREFIX'] . "devices AS `devices` ON `users`.`id` = `devices`.`user` WHERE `users`.`id` = '%d'", $active);
				$rows = $SQL->selectall($query);
				if (is_array($rows)) {
					foreach ($rows as $key => $row) {
						$device = $row['token'];
						if (!empty($device)) {
							$devices[] = $device;
						}
					}
				}
			} else {
				$query = sprintf("SELECT `device` FROM " . $_SETTINGS['TABLEPREFIX'] . "users WHERE `id` = '%d' LIMIT 1", $active);
				$row = $SQL->selectquery($query);
				if (is_array($row) || $total > 0) {
					$device = $row['device'];
					$devices = array($device);
				}
			}

			if (!empty($devices) && is_array($devices)) {

				// Device PUSH
				$push = new PUSH();

				// APNS Alert Options
				$push->title = 'New Message';
				$push->alert = sprintf('%s: %s', $username, $message);
				$push->sound = 'Message.wav';
				$push->custom = 'chat';
				$push->customid = $chat;
				$push->message = 'message';

				$push->send($devices);
			}

		}
	}

	function PendingChatNotification($args) {

		// Arguments
		list($username, $server, $badge, $chat, $devices) = $args;

		if (!empty($devices) && is_array($devices)) {

			// Device PUSH Notifications
			$push = new PUSH();

			// APNS Alert Options
			$push->title = 'Pending Chat';
			$push->alert = sprintf('%s is pending for Live Chat at %s', $username, $server);
			$push->sound = 'Pending.wav';
			$push->badge = $badge;
			$push->custom = 'chat';
			$push->customid = $chat;
			$push->message = 'chat';
			$push->action = 'accept';

			// Send PUSH Notification
			$push->send($devices);
		}
	}

	function AcceptChatNotification($args) {

		// Arguments
		list($name) = $args;

		// Devices
		$devices = $this->OnlineDevices();

		if (!empty($devices) && is_array($devices)) {

			// Device PUSH Notifications
			$push = new PUSH();

			// APNS Alert Options
			$push->alert = sprintf('%s accepted Live Chat', $name);
			$push->message = 'accepted';

			// Send PUSH Notification
			$push->send($devices);
		}

	}

	function CloseChatNotification($args) {

		// Arguments
		list($chat, $name) = $args;

		// Devices
		$devices = $this->OnlineDevices();

		if (!empty($devices) && is_array($devices)) {

			// Device PUSH Notifications
			$push = new PUSH();

			// APNS Alert Options
			$push->alert = sprintf('%s closed the Live Chat', $name);
			$push->message = 'closed';

			// Send PUSH Notification
			$push->send($devices);
		}

	}

}

// Add Hook Functions
// $hooks->add('ExampleHooks', 'EventName', 'FunctionName');
$class = 'DeviceNotificationHooks';

$hooks->add($class, 'SendMessage', 'SendMessageNotification');
$hooks->add($class, 'PendingChat', 'PendingChatNotification');
$hooks->add($class, 'AcceptChat', 'AcceptChatNotification');
$hooks->add($class, 'CloseChat', 'CloseChatNotification');

?>