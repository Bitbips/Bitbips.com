// JSON Web Service Access Details
var service = '../xml/WebService.php',
	session = '',
	operator = {},
	settings = {},
	cache = false,
	server = '',
	protocol = protocol,
	chatstack = { bottom: 10 },
	notification = true,
	zclip = true,
	shortcuts = true,
	messagesAjax = true,
	autoSignIn = true,
	notificationIcon = 'images/Icon64x64.png',
	visitorsGrid,
	visitorsDataView,
	visitorsColumns,
	visitors,
	visitorsTimer = true,
	visitorsTotal = 0,
	visitorsTimestamp = '',
	selectedVisitor = false,
	defaultUserImage = '/livehelp/images/UserSmall.png',
	websockets = false;

$.preloadImages = function () {
	for (var i = 0; i < arguments.length; i++) {
		$('<img>').attr('src', arguments[i]);
	}
};

function initVisitorsGrid() {

	if (visitorsGrid === undefined) {
		var groupItemMetadataProvider = new Slick.Data.GroupItemMetadataProvider(),
			options = {
			enableCellNavigation: true,
			enableColumnReorder: true,
			multiColumnSort: true,
			multiSelect: false
		};

		visitorsDataView = new Slick.Data.DataView({
			groupItemMetadataProvider: groupItemMetadataProvider
		});

		// Persist Columns
		if (visitorsGrid !== undefined) {
			visitorsColumns = visitorsGrid.getColumns();
		} else {
			visitorsColumns = [
				{id: "browser", name: "", field: "UserAgent", width: 30, resizable: false, formatter: Slick.Formatters.Browser},
				{id: "hostname", name: "Hostname / IP Address", field: "Hostname", width: 200, sortable: true, formatter: Slick.Formatters.Hostname},
				{id: "status", name: "Status", field: "Active", sortable: true, formatter: Slick.Formatters.Status},
				{id: "location", name: "Location", field: "Country", width: 150, sortable: true, formatter: Slick.Formatters.Location},
				{id: "pages", name: "# Pages", field: "PagePath", width: 30, sortable: true, formatter: Slick.Formatters.Pages},
				{id: "page", name: "Current Page", field: "CurrentPage", width: 290, sortable: true},
				{id: "referrer", name: "Referrer", field: "Referrer", width: 225, sortable: true, formatter: Slick.Formatters.Referrer},
				{id: "pagetime", name: "Page Time", field: "TimeOnPage", width: 65, sortable: true, formatter: Slick.Formatters.Seconds},
				{id: "sitetime", name: "Site Time", field: "TimeOnSite", width: 65, sortable: true, formatter: Slick.Formatters.Seconds}
			];

			var savedColumns = $.jStorage.get('visitorsColumns', [
				{ id: "browser", width: 30 },
				{ id: "hostname", width: 200 },
				{ id: "status", width: 80 },
				{ id: "location", width: 150 },
				{ id: "pages", width: 30 },
				{ id: "page", width: 290 },
				{ id: "referrer", width: 225 },
				{ id: "pagetime", width: 65 },
				{ id: "sitetime", width: 65 }
			]);

			$.each(savedColumns, function (key, savedColumn) {
				$.each(visitorsColumns, function (key, visitorColumn) {
					if (savedColumn.id === visitorColumn.id) {
						visitorColumn.width = savedColumn.width;
						return false;
					}
				});
			});
		}

		visitorsGrid = new Slick.Grid('.visitors-grid', visitorsDataView, visitorsColumns, options);
		visitorsGrid.registerPlugin(groupItemMetadataProvider);
		visitorsGrid.setSelectionModel(new Slick.RowSelectionModel());

		visitorsGrid.onColumnsResized.subscribe(function () {
			var savedColumns = [];
			$.each(visitorsGrid.getColumns(), function (key, value) {
				savedColumns.push({id: value.id, width: value.width});
			});
			$.jStorage.set('visitorsColumns', savedColumns);
		});

		visitorsGrid.onSelectedRowsChanged.subscribe(function () {
			rows = visitorsGrid.getSelectedRows();
			selectedVisitor = visitorsDataView.getItem(rows);
			if (selectedVisitor !== undefined) {
				openVisitor(selectedVisitor);
			}
		});
		
		visitorsGrid.onSort.subscribe(function (e, args) {
			var cols = args.sortCols;
			visitorsDataView.sort(function (dataRow1, dataRow2) {
				for (var i = 0, l = cols.length; i < l; i++) {
					var field = cols[i].sortCol.field;
					var sign = cols[i].sortAsc ? 1 : -1;
					var value1 = dataRow1[field], value2 = dataRow2[field];
					var result = (value1 == value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign;
					if (result !== 0) {
						return result;
					}
				}
				return 0;
			});
			visitorsGrid.invalidate();
			visitorsGrid.render();
		});
		
		visitorsDataView.onRowCountChanged.subscribe(function (e, args) {
			visitorsGrid.updateRowCount();
			visitorsGrid.render();
			
			// Select Row
			if (selectedVisitor) {
				var selected = parseInt(selectedVisitor.ID, 10);
				
				for (var i = 0; i < args.current; i++) {
					id = parseInt(visitorsDataView.mapRowsToIds([i])[0], 10);
					if (selected === id) {
						visitorsGrid.setSelectedRows([i]);
					}
				}
			}
		});

		visitorsDataView.onRowsChanged.subscribe(function (e, args) {
			visitorsGrid.invalidateRows(args.rows);
			visitorsGrid.render();
		});

		visitorsDataView.groupBy(
			function (r) {
				var status = 'Browsing';
				if (r.Active < 0) {
					status = 'Chat Ended';
				} else if (r.Session > 0) {
					status = 'Chatting';
				}
				return status;
			},
			function (g) {
				var label = ' visitor';
				if (g.count > 1) {
					label = ' visitors';
				}
				return g.value + ' - ' + g.count + label;
			},
			function (a, b) {
				return a.value - b.value;
			}
		);

	}

}

function updateVisitorsGrid(action, request, total, complete) {

	// Visitors Grid
	var homeSelected = $('.menu a[data-type="home"].selectedMenu').length,
		options = {
			enableCellNavigation: true,
			enableColumnReorder: true,
			multiColumnSort: true,
			multiSelect: false
		};

	if (session.length > 0) {

		if (action === undefined) { action = ''; }
		if (request === undefined) { request = ''; }
		if (total === undefined || total.length === 0) { total = 25; }

		// Web Service URL / Data
		var url = (server.length > 0) ? protocol + server + '/livehelp/xml/WebService.php?Visitors' : service + '?Visitors',
			post = 'Session=' + session + '&Action=' + action + '&Request=' + request + '&Record=0&Total=' + total + '&Version=4.0&Format=json';

		// Intialise Grid
		initVisitorsGrid();

		// Visitors AJAX / Grid
		$.ajax({url: url,
			data: post,
			type: 'POST',
			success: function (data) {
				// Visitors JSON
				if (data.Visitors !== null && data.Visitors !== undefined && data.Visitors.Visitor !== undefined) {

					$(document).trigger('LiveHelp.VisitorsCompleted', { newVisitors: data.Visitors.Visitor, previousVisitors: visitors });

					visitors = data.Visitors.Visitor;
					visitorsTotal = data.Visitors.TotalVisitors;
					visitorsTimestamp = Math.round(new Date().getTime() / 1000);

					// Refresh Data View
					visitorRefreshDataView(visitors);

					// Complete Callback
					if (complete) {
						complete(visitors);
					}

				} else {
					visitorRefreshDataView(null);
				}

				if (visitorsTimer === true && websockets === false) {
					window.setTimeout(updateVisitorsGrid, 15000);
				}
			},
			dataType: 'json',
			error: function (jqXHR, textStatus, errorThrown) {
				if (visitorsTimer === true && websockets === false) {
					window.setTimeout(updateVisitorsGrid, 15000);
				}
			}
		});
	} else {
		if (visitorsTimer === true && websockets === false) {
			window.setTimeout(updateVisitorsGrid, 15000);
		}
	}
}

function visitorRefreshDataView(visitors) {

	var details = $('#visitor-details .details'),
		visitor = details.data('visitor'),
		homeSelected = $('.menu a[data-type="home"].selectedMenu').length,
		id = 0,
		options = {
			enableCellNavigation: true,
			enableColumnReorder: true,
			multiColumnSort: true,
			multiSelect: false
		};

	if (visitors !== null && visitors !== undefined) {
		// Update Visitor
		if (visitor !== undefined && details.is(':visible')) {
			id = parseInt(visitor.ID, 10);
			$.each(visitors, function (key, value) {
				if (parseInt(value.ID, 10) === id) {
					details.find('#chatstatus').text(value.ChatStatus);
					details.find('#currentpage a').text(value.CurrentPage).attr('href', value.CurrentPage);
					details.find('#pagehistory').text(value.PagePath);
					var initiate = details.find('.btn.initiate');
					if (value.Active.length > 0) {
						initiate.addClass('disabled');
					} else {
						initiate.removeClass('disabled');
					}
					return false;
				}
			});
		}

		// Update Total
		if (visitorsTotal !== undefined) {
			updateTotal($('#visitortotal'), visitorsTotal);
		}

		// Update Visitor Times
		$.each(visitors, function(key, visitor) {
			var time = Math.round(new Date().getTime() / 1000) - visitorsTimestamp;
			visitor.TimeOnPage = parseInt(visitor.TimeOnPage, 10) + time;
			visitor.TimeOnSite = parseInt(visitor.TimeOnSite, 10) + time;
		});
		visitorsTimestamp = Math.round(new Date().getTime() / 1000);

		// Initialize DataView
		visitorsDataView.beginUpdate();
		visitorsDataView.setItems(visitors);
		for (var i = 0; i < visitorsDataView.getGroups().length; i++) {
			visitorsDataView.expandGroup(visitorsDataView.getGroups()[i].value);
		}
		visitorsDataView.endUpdate();
		visitorsDataView.syncGridSelection(visitorsGrid, true);

		if (homeSelected > 0 && $('.worldmap').css('display') == 'none') {
			if (visitors.length > 0) {
				$('.visitors-empty').hide();
				$('.visitors-grid, .visitors-menu').show();
			} else {
				$('.visitors-grid').hide();
				$('.visitors-empty, .visitors-menu').show();

				updateTotal($('#visitortotal'), 0);
			}
		}

		// Update Locations
		updateLocations();
	} else {

		if (homeSelected > 0 && $('.worldmap').css('display') == 'none') {
			$('.visitors-grid').hide();
			$('.visitors-empty, .visitors-menu').show();

			updateTotal($('#visitortotal'), 0);
		}
	}
}

function updateLocations() {
	var linksByOrigin = {},
		countByAirport = {},
		locationByAirport = {},
		positions = [],
		data;

	if (visitors !== undefined) {

		data = visitors.filter(function (visitor) {
			if (visitor.Longitude !== null && visitor.Latitude !== null && visitor.Longitude !== undefined && visitor.Latitude !== undefined && visitor.Longitude.length > 0 && visitor.Latitude.length > 0) {
				positions.push(projection([visitor.Longitude, visitor.Latitude]));
				return true;
			}
			return false;
		});

		var radius = 15;
		var map = locations.selectAll('g.node').data(data)
			.attr('id', function (d, i) { return parseInt(d.ID, 10); })
			.on('click', function (d) {
				if (d !== undefined) {
					openVisitor(d);
				}
			});

		locations.selectAll('circle.dot').data(data)
			.attr('class', 'dot')
			.attr('cx', function (d, i) { return positions[i][0]; })
			.attr('cy', function (d, i) { return positions[i][1]; })
			.attr('r', function (d, i) { return Math.sqrt(radius); })
			.attr('fill', 'rgba(0,187,204,0.5)');

		locations.selectAll('circle.animate').data(data)
			.attr('class', 'animate')
			.attr('cx', function (d, i) { return positions[i][0]; })
			.attr('cy', function (d, i) { return positions[i][1]; })
			.attr('r', function (d, i) { return Math.sqrt(radius); })
			.attr('fill', 'rgba(0,187,204,1.0)')
			.attr('opacity', 1.0);

		var group = map.enter().append('svg:g');

		group.data(data)
			.attr('id', function (d, i) { return parseInt(d.ID, 10); })
			.attr('class', 'node')
			.on('click', function (d) {
				if (d !== undefined) {
					openVisitor(d);
				}
			});

		group.append('svg:circle')
			.attr('class', 'dot')
			.attr('cx', function (d, i) { return positions[i][0]; })
			.attr('cy', function (d, i) { return positions[i][1]; })
			.attr('r', function (d, i) { return Math.sqrt(radius); })
			.attr('fill', 'rgba(0,187,204,0.5)');

		group.append('svg:circle')
			.attr('class', 'animate')
			.attr('cx', function (d, i) { return positions[i][0]; })
			.attr('cy', function (d, i) { return positions[i][1]; })
			.attr('r', function (d, i) { return Math.sqrt(radius); })
			.attr('fill', 'rgba(0,187,204,1.0)')
			.attr('opacity', 1.0);

		map.exit().remove();

	}
}

var projection,
	locations;

function drawWorldMap() {

	var map = $('.worldmap');
	map.empty();

	projection = d3.geo
		.equirectangular()
		.scale(map.width())
		.translate([map.width() / 2, map.height() / 2]);

	var data,
		path = d3.geo
			.path()
			.projection(projection),
		svg = d3.select('.worldmap')
			.append('svg:svg'),
		countries = svg.append('svg:g')
			.attr('id', 'countries');

	locations = svg.append('svg:g')
		.attr('id', 'locations');

	/* World Map Source: https://gist.github.com/2969317 */
	d3.json('world.json', function(collection) {
		if (collection !== null) {
			var map = countries.selectAll('path')
				.data(collection.features)
				.enter()
				.append('svg:path')
				.attr('d', path)
				.attr('fill', 'rgba(227,227,227,1)')
				.attr('stroke', 'rgba(177,175,181,1)')
				.attr('stroke-width', 1);
		}
	});
}

function initWorldMap() {

	// Draw Map
	drawWorldMap();

	var radius = 125,
		homeSelected = $('.menu a[data-type="home"].selectedMenu').length;
	
	setInterval(function() {
		if (homeSelected > 0 && $('.worldmap').css('display') == 'block') {
			locations.selectAll('circle.animate')
				.attr('r', function(d, i) { return Math.sqrt(15); })
				.attr('opacity', 1.0)
				.transition()
				.duration(1000)
				.delay(function(d, i) {
					return i * 10;
				})
				.attr('opacity', 0)
				.attr('r', function(d, i) {
					return Math.sqrt(radius);
				})
				.each('end', function() {
					d3.select(this)
						.attr('opacity', 1.0)
						.attr('r', 0);
				});
		}
	}, 2000);

}

var debounceMap = function(fn, timeout) {
	var timeoutID = -1;
	return function() {
		if (timeoutID > -1) {
			window.clearTimeout(timeoutID);
		}
		timeoutID = window.setTimeout(fn, timeout);
	};
};

var debouncedWorldMap = debounceMap(function() {
	drawWorldMap();
	updateLocations();
}, 125);

$(window).resize(debouncedWorldMap);

function openVisitor(data) {
	var visitor = $('#visitor-details');
	
	// Update Details
	if (data.title === undefined) {
		visitor.find('.details').data('visitor', data);
		visitor.find('#hostname').text(convertHostname(data));
		visitor.find('#useragent').text(data.UserAgent);

		var image = convertBrowserIcon(data.UserAgent, false);
		if (visitor.find('#useragent-image').length === 0) {
			$('<img id="useragent-image" src="' + image + '" style="float:right; width:50px; height:50px"/>').prependTo(visitor.find('.useragent.value'));
		} else {
			visitor.find('#useragent-image').attr('src', image);
		}
		visitor.find('#resolution').text(data.Resolution);
		visitor.find('#country-image').removeAttr('class').addClass(convertCountryIcon(data.Country));
		visitor.find('#country').text(convertCountry(data));
		visitor.find('#referrer a').text(convertReferrer(data.Referrer)).attr('href', data.Referrer);
		visitor.find('#currentpage a').text(data.CurrentPage).attr('href', data.CurrentPage);
		visitor.find('#chatstatus').text(data.ChatStatus);
		visitor.find('#pagehistory').text(data.PagePath);
		
		var initiate = visitor.find('.btn.initiate');
		if (data.Active.length > 0) {
			initiate.addClass('disabled');
		} else {
			initiate.removeClass('disabled');
		}

		if (visitor.width() === 0 || visitor.css('display') === 'none') {
			visitor.show();
			visitor.animate({ width: '40%', opacity: 1 }, 250);
		}
	}
}

function closeVisitor() {
	var visitor = $('#visitor-details'),
		width = visitor.width();
	visitor.animate({width:0, opacity:0}, 250, function () {
		visitor.hide();
		selectedVisitor = false;
		visitorsGrid.setSelectedRows([]);
	});
}

function sendInitiateChat() {

	var dialog = $('.initiate-dialog');
	dialog.find('.progressring').show();
	dialog.find('.title').text('Sending Initiate Chat');
	dialog.find('.description').text('One moment while your initiate chat request is sent.');
	dialog.animate({bottom: 0}, 250, 'easeInOutBack');

	var details = $('#visitor-details .details'),
		visitor = details.data('visitor'),
		id = parseInt(visitor.ID, 10);

	updateVisitorsGrid('Initiate', id, 25, function (data) {
		// Close Dialog
		dialog.animate({bottom: -90}, 250, 'easeInOutBack');
	});
}

var chatResponsesOpen = false,
	activechats = [],
	blockedchats = [];

function checkBlocked(id) {
	var blocked = false,
		dialog = $('.chat-stack .dialog');

	$.each(blockedchats, function (key, value) {
		if (value.id === id) {
			blocked = true;
			return;
		}
	});

	if (!blocked) {
		// Hide Dialog
		dialog.animate({bottom: '-145px'}, 250, function () {
			dialog.find('.unblock').hide();
			dialog.find('.progressring img').attr('src', 'images/ProgressRing.gif');
			dialog.hide();
		});
	} else {
		// Show Dialog
		dialog.find('.progressring img').attr('src', 'images/Block.png');
		dialog.find('.dialog-title').text('Chat Session Blocked');
		dialog.find('.dialog-description').text('The chat session is blocked and inactive.');
		dialog.find('.unblock').show();
		dialog.show().animate({bottom: '1px'}, 250);
	}
}

var settingsMenuClickedCallback = function (id) {
	var save = $('.settings .save.button');
	if (id === 'htmlcode') {
		save.fadeOut();
	} else {
		save.fadeIn();
	}
}

// Document Ready
$(document).ready(function () {

	// Web Sockets
	$(document).bind('LiveHelp.WebSocketsStateChanged', function (event, data) {
		websockets = data;
	});

	// Reset Chatting List Height Data
	var lists = $('.chat-list .list');
	$.each(lists, function (key, value) {
		var obj = $(value);
		if (obj.find('.visitor').length === 0) {
			obj.data('height', noVisitorsHeight);
		} else {
			obj.data('height', chattingVisitorHeight);
		}
	});

	$('#history-chat .close').click(function () {
		closeHistory();
	});
	
	$('.history .search #search').keyup(function (e) {
		if (e.which == 27) {
			$(this).val('');
		}
		historySearch = $(this).val();
		updateHistoryFilter();
	});

	$('.history .search.button').click(function () {
		historySearch = $('.history .search #search').val();
		updateHistoryFilter();
	});

	$('.VisitorsTotal, #visitortotal').click(function () {
		switchMenu('home');
	});

	$('#responses .close').click(function () {
		closeResponses();
	});

	// Accounts Back Button
	$('#account-details .back').click(function () {
		showAccounts();
	});

	// Menu LavaLamp
	//$('.menu').lavaLamp({speed: 500, easing: 'easeInOutBack', fx: 'easeInOutBack' });
	
	// Menu
	$('.menu li a').click(function() {
		var type = $(this).data('type'),
			menu = ['home', 'statistics', 'history'];

		// Menu
		switchMenu(type);

		// Type
		if ($.inArray(type, menu) > -1) {
			$.jStorage.set('menu', type);
		}
	});
	
	// Visitors List / Map
	$('.visitors-list.button').click(function() {
		$(this).css({'background': 'url(./images/ListHover.png) no-repeat', 'opacity': 1.0});
		$('.visitors-map.button').css({'background': 'url(./images/World.png) no-repeat', 'opacity': 0.2});
		$('.worldmap').hide();
		if (visitors.length > 0) {
			$('.visitors-grid').fadeIn();
		} else {
			$('.visitors-empty').fadeIn();
			updateTotal($('#visitortotal'), 0);
		}
	});
	$('.visitors-map.button').click(function() {
		$(this).css({'background': 'url(./images/WorldHover.png) no-repeat', 'opacity': 1.0});
		$('.visitors-list.button').css({'background': 'url(./images/List.png) no-repeat', 'opacity': 0.2});
		$('.visitors-empty, .visitors-grid').hide();
		$('.worldmap').fadeIn();
	});

	// Visitor Details / Initiate Chat
	$('#visitor-details button.initiate').click(function () {
		sendInitiateChat();
	});

	// Notification Events
	$('.notification .close').click(function() {
		closeNotification();
		return false;
	});

	// Settings Events
	$('.settings .close, .settings .cancel').click(function() {
		closeSettings();
		return false;
	});

	// Save Settings
	$('.settings .save').on('click', function (e) {
		saveSettings();
		e.stopPropagation();
	});
	
	$('.settingsmenu div').click(function() {
		var id = $(this).attr('id'),
			section = $('.settings-' + id),
			sections = section.parent().find('.section');
		
		settingsMenuClickedCallback(id);

		section.show();
		$.each(sections, function(key, value) {
			var element = $(value);
			if (element.attr('class').indexOf('settings-' + id) == -1) {
				element.hide();
			}
		});
	});
	
	$('.settingsmenu #htmlcode').click(function() {

		$(document).trigger('LiveHelp.SettingsHTMLCodeClick');

		// Settings HTML Code Copy
		if (zclip) {
			$('.copy.step1').zclip('remove');
			$('.copy.step1').zclip({
				path: 'scripts/ZeroClipboard.swf',
				copy: function () {
					return $('textarea#htmlcodestep1').val();
				},
				afterCopy: function () {
					$('textarea#htmlcodestep1').pulse({ backgroundColor: ['#dbf3f8', '#ffffff'] }, 500, 2);
				}
			});

			$('.copy.step2').zclip('remove');
			$('.copy.step2').zclip({
				path: 'scripts/ZeroClipboard.swf',
				copy: function () {
					return $('textarea#htmlcodestep2').val();
				},
				afterCopy: function () {
					$('textarea#htmlcodestep2').pulse({ backgroundColor: ['#dbf3f8', '#ffffff'] }, 500, 2);
				}
			});
		}
	});
	
	$('.dropdown-toggle').dropdown();
	
	$('.operator li').click(function () {
		var status = $(this).find('a').text();
		$('.operator .status').text(status);
	});
	
	// History Calendar
	$('#calendar').ical();
	
	$('#calendar').on('click', 'td', function () {
		var date = $(this).attr('id'),
			selected = $(this);

		if (date !== undefined && date.length > 0 && /^\d{4}-\d{2}-\d{2}$/i.test(date)) {
			// Save Selected Date
			$.jStorage.set('history-date', date);

			// Selected Date
			selected.closest('table').find('td').removeClass('selected-date');
			selected.addClass('selected-date');

			// Update History
			initHistoryGrid(date);
		}
	});

	// Chat History
	var history = $('#history-chat');
	history.find('.btn.unblock').click(function() {
		var chat = history.data('id'),
			dialog = history.find('.dialog');

		unblockChat(chat, dialog);
	});
	
	var chatstack = $('.chat-stack');
	chatstack.find('.dialog .btn.unblock').click(function () {
		var chats = chatstack.find('.chat'),
			dialog = chatstack.find('.dialog'),
			chat;

		$.each(chats, function (key, value) {
			if ($(value).position().left === 0) {
				chat = $(value);
				return;
			}
		});

		if (chat !== undefined && chat.length > 0) {
			chat = chat.data('id');
			unblockChat(chat, dialog);
		}
	});

	// Chats Stack
	chatstack.on('click', '.chat', function() {
		var obj = $(this),
			id = obj.data('id'),
			pos = { top: parseInt(obj.css('top'), 10), left: parseInt(obj.css('left'), 10), bottom: parseInt(obj.css('bottom'), 10) },
			zindex = parseInt(obj.css('z-index'), 10),
			scroll = obj.find('.scroll'),
			total = obj.find('.message-alert').data('total');
		
		if (zindex != 500) {
		
			// Save Scroll Position
			$('.chat-stack .chat').each(function(index, value) {
				var chat = $(value),
					left = parseInt(chat.position().left, 10);
				
				if (left === 0) {
					$(chat).data('scroll', chat.find('.scroll').scrollTop());
				}
			});
		
			// Animate Front Position
			obj.animate({'z-index':500, 'left':0, 'bottom':0, 'top':0, 'backgroundColor': '#fffff'}, 150, 'easeInOutBack', function () {
				obj.find('.inputs, input').fadeIn();
				obj.find('.inputs input').focus();
				
				var scroll = obj.data('scroll');
					
				if (total > 0) {
					scroll = obj.find('.scroll .end');
				}

				// Update Email Transcript
				var visitors = $('.chatting .visitor'),
					dropdown = $('.chat-stack .dropdown-menu.options'),
					id = obj.data('id');

				$.each(visitors, function (key, value) {
					if ($(value).data('id') === id) {
						var email = $('.chatting .visitor[data-id="' + id + '"]').data('user').Email,
							menu = dropdown.find('.EmailChatVisitor');

						menu.text('Visitor\'s Email Address (' + email + ')').data('email', email);
						menu.data('id', id);
						return;
					}
				});

				// Check Blocked Chat
				checkBlocked(id);
					
				if (scroll !== undefined) {
					obj.find('.scroll').scrollTo(scroll);
				}
			});
			
			// Close Smilies
			$('.chat-stack .smilies.button').close();

			// Hide Name / Alert
			obj.find('.name').hide();
			
			var notify = obj.find('.message-alert');
			$(notify).data('total', 0).hide();
			
			// Stack Chats
			$('.chat-stack .chat').each(function(index, value) {
				var chat = $(value),
					left = parseInt(chat.css('left'), 10),
					zorder = parseInt(chat.css('z-index'), 10),
					top = 0,
					bottom = 2,
					color = '#fafafa';
					
				if (left < pos.left) {
					if (left > 0) {
						top = 0;
						bottom = 4;
						color = '#f6f6f6';
					}
					chat.animate({'z-index':zorder - 10, 'top':top, 'left':left + 35, 'bottom':bottom, 'backgroundColor':color}, 150, 'easeInOutBack');
					chat.find('.inputs, input').fadeOut();
					chat.find('.name').fadeIn();
				}
			});
			
			scroll.scrollTo(scroll.find('.end'));
			
		}
	});

	$('#visitor-details .close').click(function () {
		closeVisitor();
	});
	
	// Keyboard Shortcuts
	var keyselector = 'body, input, textarea';
	$(keyselector).bind('keydown', 'esc', function () {
		if (shortcuts) {
			processEscKeyDown();
		}
	});

	$(keyselector).bind('keydown', 'ctrl+shift+s', function () {
		if (shortcuts) {
			openSettings();
		}
	});

	$(keyselector).bind('keydown', 'ctrl+shift+a', function () {
		if (shortcuts) {
			openAccounts();
		}
	});

	$(keyselector).bind('keydown', 'ctrl+shift+r', function () {
		if (shortcuts) {
			openResponses();
		}
	});
	
	$('#account-details .close').click(function () {
		closeAccount();
	});
	
	$('#response-list').on({
		mouseenter: function () {
			var edit = $(this).find('.edit');
			if (activechats.length > 0 && $('.chat-stack').position().top >= 0) {
				edit = $(this).find('.edit, .send');
			}
			edit.animate({opacity: 0.3}, 250);
		}, mouseleave: function () {
			var edit = $(this).find('.edit');
			if (activechats.length > 0 && $('.chat-stack').position().top >= 0) {
				edit = $(this).find('.edit, .send');
			}
			edit.animate({opacity: 0}, 250);
		}
	}, '.response');

	$('#response-list').on({
		mouseenter: function () {
			if (activechats.length > 0 && $('.chat-stack').position().top >= 0) {
				var edit = $(this);
				edit.animate({opacity: 0.6}, 250);
			}
		},
		mouseleave: function () {
			if (activechats.length > 0 && $('.chat-stack').position().top >= 0) {
				var edit = $(this);
				edit.animate({opacity: 0.3}, 250);
			}
		}
	}, '.response .edit, .response .send');

	$('#response-list').on('click', '.response .edit', function () {

		// Response
		var response = $(this).closest('.response'),
			id = response.data('id'),
			edit = $('#responses #add-response'),
			types = ['Text', 'Hyperlink', 'Image', 'PUSH', 'JavaScript'];

		response = [];
		$.each(responses, function(type, section) {
			if ($.inArray(type, types) > -1) {
				$.each(section, function(key, value) {
					if (parseInt(value.ID, 10) === id) {
						response = value;
						return false;
					}
				});
			}
		});

		$('#ResponseID').val(response.ID);
		$('#ResponseName').val(response.Name);
		$('#ResponseCategory').val(response.Category);

		// Type
		var selector = 'Text';
		switch (response.Type) {
		case 2:
			selector = 'Hyperlink';
			break;
		case 3:
			selector = 'Image';
			break;
		case 4:
			selector = 'PUSH';
			break;
		case 5:
			selector = 'JavaScript';
			break;
		}
		$('#ResponseType' + selector).attr('checked', 'checked');

		if (selector === 'Text') {
			$('#ResponseContent').val(response.Content);
			$('#add-response .URL').hide();
			$('#add-response .Content').show();
		} else {
			$('#ResponseURL').val(response.Content);
			$('#add-response .Content').hide();
			$('#add-response .URL').val(response.Content).show();
		}

		// Add Tags
		$('.add-response.tags').html('');
		addTags(response.Tags);

		showResponse();
	});

	$('.chat-stack .smilies.button').on({
		mouseenter: function () {
			$(this).css('background', 'url(images/SmiliesHover.png)');
		},
		mouseleave: function () {
			$(this).css('background', 'url(images/Smilies.png)');
		},
		click: function () {
			$(this).bubbletip($('#SmiliesTooltip'), { calculateOnShow: true }).open();
		}
	});

	$('.chat-stack').on('focus', '#message', function () {
		$('.chat-stack .smilies.button').close();
	});

	$('#SmiliesTooltip span').click(function () {
		var smilie = $(this).attr('class').replace('sprite ', ''),
			text = '',
			textarea = $('.chat-stack textarea'),
			val = textarea.val();

		switch (smilie) {
		case 'Laugh':
			text = ':D';
			break;
		case 'Smile':
			text = ':)';
			break;
		case 'Sad':
			text = ':(';
			break;
		case 'Money':
			text = '$)';
			break;
		case 'Impish':
			text = ':P';
			break;
		case 'Sweat':
			text = ':\\';
			break;
		case 'Cool':
			text = '8)';
			break;
		case 'Frown':
			text = '>:L';
			break;
		case 'Wink':
			text = ';)';
			break;
		case 'Surprise':
			text = ':O';
			break;
		case 'Woo':
			text = '8-)';
			break;
		case 'Tired':
			text = 'X-(';
			break;
		case 'Shock':
			text = '8-O';
			break;
		case 'Hysterical':
			text = 'xD';
			break;
		case 'Kissed':
			text = ':-*';
			break;
		case 'Dizzy':
			text = ':S';
			break;
		case 'Celebrate':
			text = '+O)';
			break;
		case 'Angry':
			text = '>:O';
			break;
		case 'Adore':
			text = '<3';
			break;
		case 'Sleep':
			text = 'zzZ';
			break;
		case 'Stop':
			text = ':X';
			break;
		}
		textarea.val(val + text).keyup();
	});

	// Pre-typed Responses
	loadResponses();
	
	var responsesParent = $('#responses');
	responsesParent.find('input').on('keydown', '#search', 'return', filterResponses);
	responsesParent.click(filterResponses);

	function showResponse() {
		responsesParent.find('.back, .back-background').fadeIn();
		responsesParent.find('#add-response').fadeIn();
		responsesParent.find('.header').text('Add Response');

		responsesParent.find('.search, #response-list, .button-toolbar.add').hide();
		responsesParent.find('.button-toolbar.save').fadeIn().animate({bottom: '15px'}, 250, 'easeInOutBack');
	}

	// Add Response
	responsesParent.find('.add-small, .add.button').click(function () {
		clearResponse();
		showResponse();
	});

	function clearResponse() {
		// Clear
		responsesParent.find('#ResponseID').val('');
		responsesParent.find('#ResponseName').val('');
		responsesParent.find('#ResponseCategory').val('');
		responsesParent.find('#ResponseTypeText').attr('checked', 'checked');
		responsesParent.find('#ResponseURL').val('');
		responsesParent.find('#ResponseContent').val('');
		responsesParent.find('#ResponseTags').val('');
		responsesParent.find('.add-response.tags').html('');

		// Reset Content / URL
		responsesParent.find('.URL').hide();
		responsesParent.find('.Content').show();

		// Hide Errors
		responsesParent.find('.InputError').hide();

	}

	responsesParent.find('.cancel.button').click(function () {
		// Clear
		clearResponse();

		// Close
		closeAddResponse();
	});

	// Response Delete Button
	var confirm = responsesParent.find('.confirm-delete');
	responsesParent.find('.delete-button').click(function () {
		confirm.find('.progressring img').css({opacity: 0});
		confirm.find('.buttons').show();
		confirm.find('.title').text('Confirm Response Delete');
		confirm.find('.description').text('Are you sure that you wish to delete this response?');
		confirm.animate({bottom: 0}, 250, 'easeInOutBack');
	});

	// Confirm Delete Response Button
	confirm.find('.delete').click(function () {
		// Show Progress
		confirm.find('.buttons').fadeOut();
		confirm.find('.progressring img').css({opacity: 0.5});

		// Delete Response
		deleteResponse();
	});

	// Confirm Cancel Button
	confirm.find('.cancel').click(function () {
		confirm.animate({bottom: '-90px'}, 250, 'easeInOutBack');
	});

	// Validate Required Fields
	responsesParent.find('#ResponseName').on('keydown keyup change blur', function () {
		var id = $(this).attr('id');
		validateField($(this), '#' + id + 'Error');
	});

	// Text / JavaScript
	responsesParent.find('#ResponseTypeText, #ResponseTypeJavaScript').on('click', function () {
		if ($(this).is(':checked')) {
			responsesParent.find('.URL').hide();
			responsesParent.find('.Content').show();
		}
	});

	// Hyperlink / Image / PUSH
	responsesParent.find('#ResponseTypeHyperlink, #ResponseTypeImage, #ResponseTypePUSH').on('click', function () {
		if ($(this).is(':checked')) {
			responsesParent.find('.Content').hide();
			responsesParent.find('.URL').show();
		}
	});

	function validateResponseURL(url) {
		if (responsesParent.find('#ResponseTypeHyperlink, #ResponseTypePUSH, #ResponseTypeImage').is(':checked')) {
			if (/^(?:\b(https?|file):\/\/[\-A-Z0-9+&@#\/%?=~_|$!:,.;]*[A-Z0-9+&@#\/%=~_|$])$/i.test(url)) {
				// Successful match
				responsesParent.find('#ResponseURLError').removeClass('CrossSmall').addClass('TickSmall').fadeIn(250);
			} else {
				responsesParent.find('#ResponseURLError').removeClass('TickSmall').addClass('CrossSmall').fadeIn(250);
			}
		}
	}

	// Validate Content / URL
	responsesParent.find('#ResponseContent, #ResponseURL').on('keydown keyup change blur', function () {
		var type = responsesParent.find('.checkbox input:checked').data('type'),
			url = responsesParent.find('#ResponseURL'),
			content = responsesParent.find('#ResponseContent');

		// Validate Content / URL
		if (type === 'Text' || type === 'JavaScript') {
			// Validate Content
			validateField(content, '#ResponseContentError');
		} else {
			// TODO Validate URL / Image / Link
			// TODO Show Image Preview
			validateResponseURL(url.val());
		}
	});

	function deleteResponse() {
		var id = responsesParent.find('#ResponseID');

		function deleteCompleted(data) {
			// Update Responses
			if (data !== undefined && data.Responses !== undefined) {
				updateResponses(data.Responses);
			}

			// Clear
			clearResponse();

			// Close
			closeAddResponse();

			// Hide Progress
			$('#responses .confirm-delete').animate({bottom: -90}, 250, 'easeInOutBack');
		}

		// Save Response
		if (responsesParent.find('.CrossSmall').length === 0) {

			var response = {
					Session: session,
					ID: id.val(),
					Version: '4.0',
					Format: 'json'
				};

			// Save Response
			$.ajax({url: (server.length > 0) ? protocol + server + '/livehelp/xml/WebService.php?Responses' : service + '?Responses',
				data: response,
				type: 'POST',
				success: function (data) {
					deleteCompleted(data);
				},
				dataType: 'json'
			});
		}
	}

	function saveResponse() {
		var id = responsesParent.find('#ResponseID'),
			name = responsesParent.find('#ResponseName'),
			category = responsesParent.find('#ResponseCategory'),
			type = responsesParent.find('.checkbox input:checked').data('type'),
			url = responsesParent.find('#ResponseURL'),
			content = responsesParent.find('#ResponseContent'),
			tags = responsesParent.find('#ResponseTags'),
			result = true;

		// Validate Name
		validateField(name, '#ResponseNameError');

		// Validate Content / URL
		if (type === 'Text' || type === 'JavaScript') {
			// Validate Content
			validateField(content, '#ResponseContentError');
			content = content.val();
		} else {
			// TODO Validate URL / Image / Link
			// TODO Show Image Preview
			validateResponseURL(url.val());
			content = url.val();
		}

		function saveCompleted(data) {
			// Update Responses
			if (data !== undefined && data.Responses !== undefined) {
				updateResponses(data.Responses);
			}

			// Clear
			clearResponse();

			// Close
			closeAddResponse();
		}

		// Save Response
		if (responsesParent.find('.CrossSmall').length === 0) {

			// Response Type
			switch (type) {
			case 'Text':
				type = 1;
				break;
			case 'Hyperlink':
				type = 2;
				break;
			case 'Image':
				type = 3;
				break;
			case 'PUSH':
				type = 4;
				break;
			case 'JavaScript':
				type = 5;
				break;
			}

			// Tags
			var tags = [],
				tag = '';

			$.each(responsesParent.find('.add-response .tag'), function (key, value) {
				tag = $(value).text();
				if (tag.length > 0 && $.inArray(value, tags) === -1) {
					tags.push(tag.toLowerCase());
				}
			});
			tags = tags.join(';');

			var response = {
					Session: session,
					ID: id.val(),
					Name: name.val(),
					Category: category.val(),
					Content: content,
					Type: type,
					Tags: tags,
					Version: '4.0',
					Format: 'json'
				};

			// Save Response
			$.ajax({url: (server.length > 0) ? protocol + server + '/livehelp/xml/WebService.php?Responses' : service + '?Responses',
				data: response,
				type: 'POST',
				success: function (data) {
					saveCompleted(data);
				},
				dataType: 'json'
			});
		}
	}

	responsesParent.find('.save.button').click(function () {
		saveResponse();
	});

	function addTags(tags) {
		if (tags !== undefined && tags.length > 0) {
			$.each(tags, function (key, tag) {
				responsesParent.find('.add-response.tags').append('<span class="tag"><span class="tag-icon"></span>' + tag.trim() + '<span class="delete" title="Delete"></span></span>');
			});
		}
	}

	responsesParent.find('.add-tag').click(function () {
		var field = responsesParent.find('#ResponseTags'),
			tags = field.val().split(' ');

		// Add Tags
		addTags(tags);

		// Clear Tags Field
		field.val('');
	});

	// Response Tags
	$('#responses').on({'mouseenter': function () {
		$(this).find('.delete').css({opacity: 0.3});
	}, 'mouseleave': function () {
		$(this).find('.delete').css({opacity: 0.1});
	}}, '.add-response.tags .tag');

	$('#responses').on('click', '.tag .delete', function () {
		$(this).closest('.add-response.tags .tag').remove();
	});

	function closeAddResponse() {
		responsesParent = $('#responses');
		responsesParent.find('#add-response').fadeOut();
		responsesParent.find('.header').text('Pre-typed Response');
		responsesParent.find('.back, .back-background').fadeOut();

		var save = responsesParent.find('.button-toolbar.save'),
			height = save.height();

		save.hide().css('bottom', -height + 'px');
		responsesParent.find('.search, #response-list, .button-toolbar.add').fadeIn(250, function () {
			$('#response-list .response, #responses .button-toolbar.add').show();
		});
	}

	// Close Add Response
	responsesParent.find('.back').click(function () {
		closeAddResponse();
	});

	$('.chat-stack').on('click', '.search', function () {
		chatResponsesOpen = true;
		openResponses(function () {
			$('#responses #search').focus();
		});
	});

	$(document).bind('LiveHelp.AccountsUpdated', function (event, accounts) {
		var operators = $('.operators.list .visitor');
		$.each(operators, function(key, value) {
			var operator = $(value),
				id = operator.data('id');
			
			$.each(accounts, function(key, account) {
				if (parseInt(account.ID, 10) == id) {
					operator.find('.name').text(account.Firstname);
					operator.find('.department').text(account.Department);
					
					var access = convertAccessLevel(account.Privilege);
					operator.find('.accesslevel').text(access);
				}
			});
		});
	});
	
	// Update Users
	updateUsers();
	
	function scrollToBottom(id) {
		var scroll = $('.chat-stack .chat[data-id=' + id + ']').find('.scroll'),
			end = scroll.find('div.end');
			
		scroll.scrollTo(end);
	}
	
	function processTagsMenu(id, message) {
		var words = message.split(' '),
			html = '',
			menu = false;
		
		$.each(words, function(key, value) {
			value = value.replace(/[;?.\-,!]/ig, '');
			if ($.inArray(value.toLowerCase(), tags) > -1) {
				menu = true;
			}
		});
		
		if (menu) {
			html = '<div class="responses-menu" data-message="' + id + '"><div class="close"></div><div style="font-size:28px; color:#999; padding:10px">Pre-typed Responses (<span class="tag-text"></span>)</div><div class="responses-text-heading" style="font-size:20px; color:#999; padding:5px 10px">Text</div><div class="responses-text" style="font-size:12px; color:#666; padding:10px"></div><div class="responses-hyperlink-heading" style="font-size:20px; color:#999; padding:5px 10px">Hyperlink</div><div class="responses-hyperlink" style="font-size:12px; color:#666; padding:10px"></div><div class="responses-image-heading" style="font-size:20px; color:#999; padding:5px 10px">Image</div><div class="responses-image" style="font-size:12px; color:#666; padding:10px"></div><div class="responses-push-heading" style="font-size:20px; color:#999; padding:5px 10px">PUSH</div><div class="responses-push" style="font-size:12px; color:#666; padding:10px"></div><div class="responses-javascript-heading" style="font-size:20px; color:#999; padding:5px 10px">JavaScript</div><div class="responses-javascript" style="font-size:12px; color:#666; padding:10px"></div></div>';
		}
		return html;
	}

	function processTags(id, message) {
		var words = message.split(' '),
			html = '',
			tagged = [];
		
		html = message;
		$.each(words, function(key, value) {
			value = value.replace(/[;?.\-,!]/ig, '');
			if ($.inArray(value.toLowerCase(), tags) > -1 && $.inArray(value.toLowerCase(), tagged) === -1) {
				html = html.replace(value, '<span class="tag" data-message="' + id + '"><span class="icon"></span><span class="text">' + value + '</span></span>');
				tagged.push(value.toLowerCase());
			}
		});

		return html;
	}
	
	// Messages
	(function loadMessages() {
		if (session.length > 0 && messagesAjax) {
			var url = (server.length > 0) ? protocol + server + '/livehelp/xml/WebService.php?Chats' : service + '?Chats',
				post = 'Session=' + session + '&Version=4.0',
				stack = $('.chat-stack'),
				chats = stack.find('.chat');
		
			$.each(chats, function (key, value) {
				var chat = $(value),
					id = chat.data('id'),
					closed = chat.data('closed'),
					exists = false,
					blocked = false;
				
				$.each(activechats, function (key, message) {
					if (message.id === id) {
						exists = true;
						return;
					}
				});

				$.each(blockedchats, function (key, message) {
					if (message.id === id) {
						blocked = true;
						return;
					}
				});
				
				if (!exists && !blocked && !closed) {
					activechats.push({'id': id, 'typing': 0, 'type': 0, 'message': 0});
				}
				
			});
			
			if (activechats.length > 0) {
				var data = '';
				
				$.each(activechats, function (key, chat) {
					if (data.length > 0) {
						data += '|';
					}
					data += chat.id + ',' + chat.typing + ',' + chat.type + ',' + chat.message; // ID,Typing,Type,Message|ID,Typing,Type,Message
				});
				post += '&Data=' + data + '&Format=json';
				
				$.ajax({url: url,
					data: post,
					type: 'POST',
					success: function (data) {
					
						var alert = false,
							html = '',
							lastMessageAlert = {},
							stack = $('.chat'),
							visiblechat;
					
						$.each(stack, function (key, value) {
							if ($(this).position().left === 0) {
								visiblechat = parseInt($(this).data('id'), 10);
								return false;
							}
						});

						// Messages JSON
						if (data.MultipleMessages !== undefined && data.MultipleMessages.Messages !== undefined) {
							
							$.each(data.MultipleMessages.Messages, function(key, messages) {
								if (messages !== undefined) {
								
									var id = parseInt(messages.ID, 10),
										status = parseInt(messages.Status, 10),
										typing = messages.Typing,
										chat = $('.chat-stack .chat[data-id=' + id + ']'),
										pos = 'left',
										total = 0,
										lastMessage = 0,
										typingstatus = $('.chat-stack .typing');

									$.each(activechats, function(key, value) {
										if (value.id !== undefined && value.id == id) {
											// Current Typing
											value.typing = typing;
											if (value.id == visiblechat && (value.typing == 1 || value.typing == 3)) {
												typingstatus.show();
											} else {
												typingstatus.hide();
											}
											return false;
										}
									});
								
									html = '';
									if (messages.Message !== undefined && messages.Message.length > 0) {
										$.each(messages.Message, function(key, value) {
											var messageID = parseInt(value.ID, 10),
												status = parseInt(value.Status, 10),
												message = value.Content,
												date = new moment(value.Datetime, 'YYYY-MM-DD HH-mm:ss').toDate(),
												time = date.getHours() + ':' + zeroFill(date.getMinutes(), 2);
											
											if (status > 0) {
												message = $('<div>').text(message).html();
											}
											
											// Image
											if (status === 3) {
												var regEx = /(https?|ftp|file):\/\/[\-A-Z0-9+&@#\/%?=~_|!:,.;]*[A-Z0-9+&@#\/%=~_|](\.jpg|.jpeg|\.gif|\.png)/im;
												var match = regEx.exec(message);
												if (match !== null) {
													message = '<img src="' + match[0] + '" />';
												}
											} else {
												message = message.replace(/(?!.*(?:\.jpe?g|\.gif|\.png)$)((?:(?:http(?:s?))|(?:ftp)):\/\/[^\s|<|>|'|"]*)/img, '<a href="$1" target="_blank">$1</a>');
												message = message.replace(/^(https?|ftp|file):\/\/[\-A-Z0-9+&@#\/%?=~_|!:,.;]*[A-Z0-9+&@#\/%=~_|](\.jpg|.jpeg|\.gif|\.png)$/img, '<img src="$&"/>');
											}

											message = message.replace(/(\r\n|\r|\n)/g, '<br/>');
											if (settings.Smilies !== 0) {
												message = htmlSmilies(message);
											}

											var username = value.Username;
											if (status === 1 && accounts !== undefined) {
												$.each(accounts.Operator, function (key, account) {
													if (account.Username === username) {
														username = account.Firstname;
														return;
													}
												});
											}
											username = (username.length > 0) ? 'from ' + capitaliseFirstLetter(username) : '';

											pos = (status > 0) ? 'right' : 'left';
											if (status === 0) {
												html += '<blockquote class="message ' + pos + '"><div style="margin-bottom: 3px">' + processTags(messageID, message) + '</div><div style="bottom:5px; right:5px; font-size:11px; float:right">' + username + ' at ' + time + '</div></blockquote>';
												html += processTagsMenu(messageID, message);
												total++;
												lastMessageAlert = {id: id, username: username, message: message};
											} else if (status >= 0) {
												html += '<blockquote class="message ' + pos + '"><div style="margin-bottom: 3px">' + message + '</div><div style="bottom:5px; right:5px; font-size:11px; float:right">' + username + ' at ' + time + '</div></blockquote>';
											} else if (status === -2) {
												html += '<div style="color:#666; font-size:12px; margin-left:20px; line-height:20px"><img src="http://' + server + '/livehelp/image.php?SIZE=20" style="float:left; margin-right:5px"/>' + capitaliseFirstLetter(message) + '</div>';
											} else if (status === -3) {
												var rating = parseInt(message.substring(message.length - 1), 10),
													stars = '';

												for (var i = 1; i <= 5; i++) {
													if (rating >= i) {
														stars += '<div class="rating-highlight"></div>';
													} else {
														stars += '<div class="rating"></div>';
													}
												}

												message = message.substring(0, message.length - 2);
												switch (rating) {
													case 5:
														rating = 'Excellent';
														break;
													case 4:
														rating = 'Very Good';
														break;
													case 3:
														rating = 'Good';
														break;
													case 2:
														rating = 'Poor';
														break;
													case 1:
														rating = 'Very Poor';
														break;
												}

												html += '<div style="margin-left:20px">' + message + '<span>' + stars + '<span style="margin-left:10px">' + rating + '</span></span></div>';
											}
											
											$.each(activechats, function (key, message) {
												if (message.id === id) {
													message.message = parseInt(value.ID, 10);
													lastMessage = message.message;
													activechats[key] = message;
													return;
												}
											});
											
										});
									}

									// Chat Ended
									var closed = chat.data('closed');
									if (status === -1 && !closed) {

										// Close Chat
										html = '<div style="margin-left:20px; text-align: center">The chat session has been closed.</div>';
										chat.data('closed', true);

										// Remove Chat
										chats = [];
										$.each(activechats, function (key, message) {
											if (message.id !== id) {
												chats.push(message);
												return;
											}
										});
										activechats = chats;
									}

									if (html.length > 0 && !closed) {
										$(html).appendTo(chat.find('.messages'));
										html = '';
										
										// Scroll / Sound Alert
										scrollToBottom(id);
										if (total > 0) {
											alert = true;
										}
										
										// Update Last Message
										if ($('.chat-stack').position().top === 0 && lastMessage > 0) {
											$('#chatting .visitor[data-id=' + id + ']').data('messages', lastMessage);
										}

										// Notification
										if (parseInt(chat.css('left'), 10) > 0 && total > 0) {
											var notify = chat.find('.message-alert');
											total = parseInt($(notify).data('total'), 10) + total;
											$(notify).data('total', total);
											notify.text(total).show();
										}
									}
								}
							
							});
							
						}
						
						if (alert && messageSound !== undefined) {

							// Play Sound
							messageSound.play();
							$(document).trigger('LiveHelp.PlayMessageSound', lastMessageAlert);

							alert = false;
						}
						
					},
					dataType: 'json'
				});
			}
		}

		window.setTimeout(loadMessages, 2000);
		
	})();
	
	// Send Button
	$('.chat-stack .send').on({
		click: function () {
			// Send Message
			sendMessage();

			// Close Pre-typed Responses
			var menu = $('.responses-menu');
			if (menu.css('display') != 'none') {
				menu.height(0).hide();
			}
			return false;
		},
		mouseenter: function () {
			$(this).css({'opacity': 1.0}).removeClass('sprite SendButton').addClass('sprite SendButtonHover');
		},
		mouseleave: function () {
			$(this).css({'opacity': 0.4}).removeClass('sprite SendButtonHover').addClass('sprite SendButton');
		}
	});

	var textarea = $('.chat-stack textarea');
	textarea.bind('keydown', 'return', function () {
		sendMessage();
		return false;
	}).bind('keyup', 'return', function() {
		updateTyping(false);
	}).bind('focusout', function () {
		updateTyping(false);
	}).bind('keydown', 'ctrl+return', function () {
		var input = $(this),
			value = input.val(),
			start = input.caret().start,
			end = input.caret().end;
		
		input.val(value.substr(0, start) + '\n' + value.substr(end)).caret(start + 1, start + 1);
		return false;
	}).bind('keydown', function () {
		updateTyping(true);
	});

	function updateTyping(currentlyTyping) {
		var chats = $('.chat'),
			id = 0,
			typing;

		$.each(chats, function (key, value) {
			if ($(this).position().left === 0) {
				id = parseInt($(this).data('id'), 10);
				return false;
			}
		});

		$.each(activechats, function(key, value) {
			if (value.id !== undefined && value.id == id) {

				if (currentlyTyping) {
					switch (value.typing) {
						case 0: // None
							typing = 2;
							break;
						case 1: // Guest Only
							typing = 3;
							break;
						case 2: // Operator Only
							typing = 2;
							break;
						case 3: // Both
							typing = 3;
							break;
					}
				} else {
					switch (value.typing) {
						case 0: // None
							typing = 0;
							break;
						case 1: // Guest Only
							typing = 1;
							break;
						case 2: // Operator Only
							typing = 0;
							break;
						case 3: // Both
							typing = 1;
							break;
					}
				}

				value.typing = typing;
				return false;
			}
		});
	}
	
	function toggleTaggedResponses() {
		var tag = $(this),
			id = tag.data('message'),
			menu = $('.responses-menu[data-message=' + id + ']'),
			height = 300,
			opacity = 1,
			tagtext = tag.find('.text').text();
		
		if (menu.length === 0) {
			menu = tag.parent();
		}
		
		if (menu.height() > 0) {
			height = 0;
			opacity = 0;
		} else {
			var count = 0;
			menu.find('.responses-text, .responses-hyperlink, .responses-image, .responses-push, .responses-javascript').html('').hide();
			menu.find('.responses-text-heading, .responses-hyperlink-heading, .responses-image-heading, .responses-push-heading, .responses-javascript-heading').hide();
			$.each(responses, function(key, response) {
				if (key === 'Text') {
					count = 0;
					$.each(response, function(key, text) {
						$.each(text.Tags, function(key, tag) {
							tag = tag.toLowerCase();
							if (tag === tagtext.toLowerCase()) {
								var html = '<div class="response">' + text.Content + '</div>';
								menu.find('.tag-text').text(tag);
								$(html).appendTo(menu.find('.responses-text'));
								count++;
							}
						});
					});
					if (count > 0) {
						menu.find('.responses-text-heading, .responses-text').show();
					}
				} else if (key === 'Hyperlink') {
					count = 0;
					$.each(response, function(key, text) {
						$.each(text.Tags, function(key, tag) {
							tag = tag.toLowerCase();
							if (tag === tagtext.toLowerCase()) {
								var html = '<div class="response">' + text.Content + '</div>';
								menu.find('.tag-text').text(tag);
								$(html).appendTo(menu.find('.responses-hyperlink'));
								count++;
							}
						});
					});
					if (count > 0) {
						menu.find('.responses-hyperlink-heading, .responses-hyperlink').show();
					}
				} else if (key === 'Image') {
					count = 0;
					$.each(response, function(key, text) {
						$.each(text.Tags, function(key, tag) {
							tag = tag.toLowerCase();
							if (tag === tagtext.toLowerCase()) {
								var html = '<div class="response">' + text.Content + '</div>';
								menu.find('.tag-text').text(tag);
								$(html).appendTo(menu.find('.responses-image'));
								count++;
							}
						});
					});
					if (count > 0) {
						menu.find('.responses-image-heading, .responses-image').show();
					}
				} else if (key === 'PUSH') {
					count = 0;
					$.each(response, function(key, text) {
						$.each(text.Tags, function(key, tag) {
							tag = tag.toLowerCase();
							if (tag === tagtext.toLowerCase()) {
								var html = '<div class="response">' + text.Content + '</div>';
								menu.find('.tag-text').text(tag);
								$(html).appendTo(menu.find('.responses-push'));
								count++;
							}
						});
					});
					if (count > 0) {
						menu.find('.responses-push-heading, .responses-push').show();
					}
				} else if (key === 'JavaScript') {
					count = 0;
					$.each(response, function(key, text) {
						$.each(text.Tags, function(key, tag) {
							tag = tag.toLowerCase();
							if (tag === tagtext.toLowerCase()) {
								var html = '<div class="response">' + text.Content + '</div>';
								menu.find('.tag-text').text(tag);
								$(html).appendTo(menu.find('.responses-javascript'));
								count++;
							}
						});
					});
					if (count > 0) {
						menu.find('.responses-javascript-heading, .responses-javascript').show();
					}
				}
			});
			height = '100%';
		}
		menu.animate({height:height, opacity:opacity}, 250, 'easeOutBack', function () {
			$(this).toggle();

			var chat = $(this).closest('.chat').data('id');
			scrollToBottom(chat);
		});
	}
	
	$('.chat-stack').on('click', '.responses-menu .response', function () {
		$('.chat-stack textarea').val($(this).text());
	});
	
	$(document).on('click', '.messages .tag, .responses-menu > .close', toggleTaggedResponses);
	
	$('.chat-list-heading').click(function () {
		var menu = $(this).next(),
			height = menu.height();
		
		if (height === 0) {
			height = menu.data('height');
		} else {
			menu.data('height', height);
			height = 0;
		}
		
		toggleChatMenu(menu, height);
	});

	$('.reset.password').on('click', function () {
		$('.login .signin.form, .btn-toolbar.signin, .login .error').hide();
		$('.login .reset.form, .btn-toolbar.reset').show();
		$('.login .reset.form #username').focus();
	});

	function hideResetPassword() {
		$('.login .reset.form, .btn-toolbar.reset, .login .error').hide();
		$('.login .signin.form, .btn-toolbar.signin').show();
		$('.login .signin.form #username').focus();
	}

	var resettoolbar = $('.btn-toolbar.reset');
	resettoolbar.find('.btn.back').on('click', function () {
		hideResetPassword();
	});

	resettoolbar.find('.btn.reset').on('click', function () {
		var url = (server.length > 0) ? protocol + server + '/livehelp/xml/WebService.php?Login' : service + '?ResetPassword',
			reset = $('.reset.form'),
			username = reset.find('#username').val(),
			email = reset.find('#email').val(),
			post = {'Username': username, 'Email': email, 'Version': '4.0', 'Format': 'json'};

		$.ajax({url: url,
			data: post,
			type: 'POST',
			success: function (data) {
				// Reset Password JSON
				hideResetPassword();
			},
			error: function (xhr, ajaxOptions, thrownError) {
				var login = $('.login, .inputs');
				$('.login .error .text').text('Incorrect Username or Email');

				login.find('.error').fadeIn();
				login.effect('shake', {times:3, distance: 10}, 150);
			},
			dataType: 'xml'
		});
	});

	// Initalise Administration
	initAdmin();

});

function initAdmin() {
	// Hide Loading
	$('.loading').delay(500).fadeOut();

	// Sign In / Saved Session
	var autoLogin = $.jStorage.get('session', '');
	if (autoLogin.length > 0) {
		// Update Session
		session = autoLogin;
		if (autoSignIn) {
			signIn();
		}
		$(document).trigger('LiveHelp.AutoSignIn');
	} else {
		$('.login').fadeIn();
	}

	// Metro Pivot
	$('div.metro-pivot').metroPivot({selectedItemChanged: function(index) {
		// Show Charts
		showVisitorChart();
		showChatChart();
	}, controlInitialized: function () {
		// Initialise amCharts
		//loadStatisticsChartData();
	}});

	// Images
	$.preloadImages('images/bubbletip/bubbletip.png');
	
	// Two Factor Authentication
	$('.twofactor .factor').hover(function () {
		$(this).find('span, img').animate({opacity: 1}, 250);
	}, function () {
		if (!$(this).data('selected')) {
			$(this).find('span').animate({opacity: 0}, 250);
			$(this).find('img').animate({opacity: 0.5}, 250);
		}
	}).click(function () {
		var twofactor = $('.twofactorcode'),
			login = $('.login');
		
		factor = $(this).data('factor');
		
		$(this).parent().find('.factor').each(function (key, value) {
			var element = $(value);
			if (element.data('factor') !== factor) {
				element.data('selected', false).find('img').animate({opacity: 0.5}, 250);
				element.find('span').animate({opacity: 0}, 250);
			}
		});

		$(this).data('selected', true).find('span, img').animate({opacity: 1}, 250);
		twofactor.fadeIn();
		
		if (factor === 'push') {
			twofactor.find('.code').fadeOut(function() {
				twofactor.find('.status span').text('Authenticate to send Duo PUSH request');
				twofactor.find('.status, .status img').fadeIn();
			});
		} else if (factor === 'sms' || factor === 'token') {
			if (factor === 'sms') {
				twofactor.find('.code label').text('SMS Code');
				twofactor.find('.hint-token').hide();
				twofactor.find('.hint-sms').show();
			} else {
				twofactor.find('.code label').text('Token Code');
				twofactor.find('.hint-sms').hide();
				twofactor.find('.hint-token').text('Enter your hardware token code or Duo Mobile code').show();
			}
		
			twofactor.find('.status').fadeOut(function() {
				twofactor.find('.code').fadeIn(function () {
					$('#twofactor').focus();
				});
			});
		}
		$('#twofactor').focus();
	});
	
	$('.login input').keypress(function(e){
		if (e.which === 13) {
			signIn();
			e.preventDefault();
		}
	});
	
	// Sign In
	$('.login .signin.btn').click(function () {
		signIn();
	});

	// Clear
	$('.login .clear').click(function () {
		var inputs = $('.login .inputs');
		inputs.find('.server input, .username input, .password input').val('');
		inputs.find('.server input').focus();
	});

	var account = $('#account-details');

	// Drag / Drop Events
	var animating = false;
	$(document).bind('dragover', function (e) {
		var targets = $('#account-dropzone, #account-upload'),
			dropZone = $('#account-upload'),
			timeout = window.dropZoneTimeout;

		if (!timeout) {
			dropZone.addClass('in');
		} else {
			clearTimeout(timeout);
		}
		if ($.inArray(e.target, targets) > -1) {
			dropZone.addClass('hover');
			if (!animating) {
				dropZone.pulse({backgroundColor: ['#e6f7fa', '#ffffff']}, 500, 2, function () {
					animating = false;
					$(this).css('background', 'transparent');
				});
				animating = true;
			}
		} else {
			dropZone.removeClass('hover');
		}
		window.dropZoneTimeout = setTimeout(function () {
			window.dropZoneTimeout = null;
			dropZone.removeClass('in hover');
		}, 100);
	});

	// Ignore Default Drag / Drop
	function ignoreDrag(e) {
		if (e.preventDefault) {
			e.preventDefault();
		}
		if (e.stopPropagation) {
			e.stopPropagation();
		}
		if (e.dataTransfer !== undefined) {
			e.dataTransfer.dropEffect = 'copy';
		}
		return false;
	}

	// Drop Event
	$(document).bind('drop', function (e) {
		ignoreDrag(e.originalEvent);
		var dt = e.originalEvent.dataTransfer,
			files = dt.files;

		if (dt.files.length > 0) {
			var file = dt.files[0],
				reader = new FileReader();

			reader.onload = function (e) {
				updateAccountImage(e.target.result);
			};
			accountFiles = file;
			reader.readAsDataURL(file);
		}
	});

	// Drag Over Event
	$(document).bind('drop dragover', function (e) {
		e.preventDefault();
	});

	// Account Upload
	$('#account-upload').fileupload({
		url: (server.length > 0) ? protocol + server + '/livehelp/xml/WebService.php?Operators' : service + '?Operators',
		dataType: 'json',
		singleFileUploads: true,
		dropZone: $('#account-dropzone'),
		submit: function (e, data) {
			return false;
		}
	});

	// Account Edit Button
	account.find('.edit-button').click(function () {
		var account = $('#account-details'),
			edit = account.find('.button-toolbar.edit'),
			height = account.find('.button-toolbar.edit').height();

		edit.hide().css('bottom', -height + 'px');
		account.find('.value, .label.devices').hide();
		account.find('.LiveHelpInput, .password').fadeIn();
		account.find('.button-toolbar.save').fadeIn().animate({bottom: '15px'}, 250, 'easeInOutBack');
		account.find('.InputError').removeClass('TickSmall CrossSmall');
	});

	// Account Cancel Button
	account.find('.cancel-button').click(closeAccountDetails);

	// Account Add Button
	account.find('.add-button').click(function () {
		showAddAccount();
	});

	// Account Save Button
	account.find('.save-button').click(function () {
		var header = $('#account-details .header').text();
		if (header === 'Add Account') {
			addAccount();
		} else {
			saveAccount();
		}
	});

	// Validate Required Fields
	account.find('input, select, .password').filter(':not(#AccountUsername, #AccountEmail, #ConfirmPassword)').on('keydown keyup change blur', function () {
		var id = $(this).attr('id');
		validateField($(this), '#' + id + 'Error');
	});

	// Validate Username
	account.find('#AccountUsername').on('keydown keyup change blur', function () {
		var id = $(this).attr('id');
		validateUsername($(this), '#' + id + 'Error');
	});

	// Validate Email
	account.find('#AccountEmail').on('keydown keyup change blur', function () {
		var id = $(this).attr('id');
		validateEmail($(this), '#' + id + 'Error');
	});

	// Validate Password
	account.find('#AccountPasswordConfirm').on('keydown keyup change blur', function () {
		var id = $(this).attr('id');
		validatePassword($(this), $('#AccountPassword').val(), '#' + id + 'Error');
	});

	// Account Delete Button
	var confirm = account.find('.confirm-delete');
	account.find('.delete-button').click(function () {
		confirm.animate({bottom: 0}, 250, 'easeInOutBack');
	});

	// Confirm Delete Account Button
	confirm.find('.delete').click(function () {
		// Show Progress
		confirm.find('.buttons').fadeOut();
		confirm.find('.progressring img').css({opacity: 0.5});

		// Delete Account
		deleteAccount();
	});

	// Confirm Cancel Button
	confirm.find('.cancel').click(function () {
		confirm.animate({bottom: '-90px'}, 250, 'easeInOutBack');
	});

	// Status Mode Menu
	$('.operator').on('click', '.dropdown-menu.statusmode a', function () {
		var status = $(this).attr('class');
		if (status !== 'Signout' && status !== 'Settings' && status !== 'Billing') {
			updateUsers(status, undefined, function () {
				refreshAccounts(status);
			});
		} else if (status === 'Settings') {
			switchMenu('settings');
			$('.operator .dropdown-toggle').dropdown('toggle');
			return false;
		} else if (status === 'Billing') {
			openBilling();
			$('.operator .dropdown-toggle').dropdown('toggle');
			return false;
		} else {
			signOut();
		}
	});

	// Accept Pending Chat
	$('#pending').on('click', '.visitor', $(this), function(e){
		var chat = ($(e.target).is('.visitor')) ? $(e.target) : $(e.target).parent();
		acceptChat(chat);
		closeNotification();
	});

	// Pending / Chatting Click Events
	$(document).on('click', '.chatting .visitor, .other-chatting .visitor', function(){
		var id = $(this).data('id'),
			user = $(this).data('user');
		
		openChat(id, user);
	});

	// Chat Close Event
	$('.chat-stack').on('click', '.chat .inputs > .close', function() {
		// Close Chat
		closeChats();

		// Close Chat Responses
		if (chatResponsesOpen) {
			closeResponses();
			chatResponsesOpen = false;
		}
	});

	// Resize Grids
	$(window).resize(function () {
		if (historyGrid !== undefined) {
			historyGrid.resizeCanvas();
		}
		if (accountsGrid !== undefined) {
			accountsGrid.resizeCanvas();
		}
		if (visitorsGrid !== undefined) {
			visitorsGrid.resizeCanvas();
		}
	});

	// Pre-typed Response
	$('#responses').on('click', '.response', function (e) {
		if (activechats.length > 0 && $('.chat-stack').position().top >= 0) {
			var id = $(e.target).closest('.response').data('id'),
				types = ['Text', 'Hyperlink', 'Image', 'PUSH', 'JavaScript'],
				response,
				type;

			$.each(responses, function(sectiontype, section) {
				if ($.inArray(sectiontype, types) > -1) {
					$.each(section, function(key, value) {
						if (id === parseInt(value.ID, 10)) {
							response = value;
							type = sectiontype;
							return;
						}
					});
				}
			});

			if (response !== undefined) {
				var message = $('.chat-stack #message'),
					content = response.Content;

				if (type === 'Hyperlink' || type === 'PUSH') {
					content = response.Name + ' - ' + response.Content;
				}
				message.val(content).keyup();
			}
		}
	});

	// Responses Send Button
	$('#responses').on('click', '.response .send', function () {
		var id = $(this).closest('.response').data('id'),
			types = ['Text', 'Hyperlink', 'Image', 'PUSH', 'JavaScript'],
			response,
			type;

		$.each(responses, function(sectiontype, section) {
			if ($.inArray(sectiontype, types) > -1) {
				$.each(section, function(key, value) {
					if (id === parseInt(value.ID, 10)) {
						response = value;
						type = sectiontype;
						return;
					}
				});
			}
		});

		return sendResponse(type, response);

	});
}

function sendResponse(type, response) {
	var chats = $('.chat-stack .chat'),
		chat;

	$.each(chats, function (key, value) {
		if ($(value).position().left === 0) {
			chat = $(value);
			return;
		}
	});

	if (chat !== undefined && chat.length > 0) {
		if (type === 'Text') {
			sendMessage(response.Content);
			return false;
		} else {
			var id = chat.data('id');
			sendCommand(id, type.toUpperCase(), response.Name, response.Content);
			return false;
		}
	}
	return false;
}

function acceptChat(chat) {
	var name = chat.find('.details.name'),
		id = chat.data('id'),
		user = name.text();

	$(document).trigger('LiveHelp.AcceptChat', {id: parseInt(id, 10), name: name});

	// Clear Notification
	var remove = -1;
	$.each(notifications, function (key, value) {
		if (chat.data('id') === value.id) {
			remove = key;
			value.notification.cancel();
			return false;
		}
	});

	if (typeof notifications[remove] !== 'undefined') {
		notifications.splice(remove, 1);
	}

	chat.css('background', '#e2e2e2');
	name.text('Accepting Chat');
	chat.find('.details.department').text('with ' + user);
	chat.find('.image').css({'background': 'url(images/ProgressRing.gif) no-repeat', 'opacity': 0.5, 'border': 'none', 'box-shadow': 'none'});
	chat.find('.details.accesslevel').html('&nbsp;');
	chat.delay(3000).fadeOut(function () {
		$(this).remove();
	});

	if (id > 0) {
		updateUsers('Accept', id);
	}
}

var visitorChart,
	visitorChartData = [],
	visitorChartCursor,
	visitorChartEmpty = false;

// Visitor Chat
function showVisitorChart() {

	var color = '#54c2ea';

	// Validate Chart Data
	var opacity = 1.0;

	if (visitorChartData.length === 0) {
		for (var i = 30; i > 0; i--) {
			var date = new Date(),
				chats = Math.floor(Math.random() * (80 - 30 + 1)) + 30,
				visits = Math.floor(Math.random() * (250 - 120 + 1)) + 120;

			date.setDate(date.getDate() - i);
			visitorChartData.push({
				date: date,
				chats: chats,
				visits: visits
			});
		}
		visitorChartEmpty = true;
	}

	if (visitorChartEmpty) {
		color = '#cccccc';
		opacity = 0.5;
	}

	// Opacity
	$('#visitor-chart').parent().css('opacity', opacity);

	// Serial Chart
	visitorChart = new AmCharts.AmSerialChart();
	//visitorChart.pathToImages = '../amcharts/images/';
	visitorChart.dataProvider = visitorChartData;
	visitorChart.categoryField = 'date';
	visitorChart.balloon.bulletSize = 5;

	// Chart Events
	visitorChart.addListener('dataUpdated', visitorChartDataUpdated);

	// Catgory Axis
	var categoryAxis = visitorChart.categoryAxis;
	categoryAxis.parseDates = true; // as our data is date-based, we set parseDates to true
	categoryAxis.minPeriod = 'DD'; // our data is daily, so we set minPeriod to DD
	categoryAxis.axisAlpha = 0;
	categoryAxis.dashLength = 1;
	categoryAxis.boldPeriodBeginning = false;
	categoryAxis.position = 'bottom';
	categoryAxis.axisColor = '#dadada';

	// Balloon
	var balloon = visitorChart.balloon;
	balloon.adjustBorderColor = true;
	balloon.color = color; //'#000000';
	balloon.cornerRadius = 5;
	balloon.borderAlpha = 1;
	balloon.borderColor = color; //'#000000';
	balloon.borderThickness = 1;
	balloon.fillColor = color; //'#000000';
	balloon.fillAlpha = 0.8;
	balloon.color = '#f3f3f3'; //'#ffffff';
	balloon.showBullet = true;
	balloon.fontSize = 15;
	balloon.textShadowColor = '#666';

	// Value Axis
	var valueAxis = new AmCharts.ValueAxis();
	valueAxis.axisAlpha = 0;
	valueAxis.dashLength = 1;
	valueAxis.minimum = 0;
	visitorChart.addValueAxis(valueAxis);

	// Graph
	var graph = new AmCharts.AmGraph();
	graph.type = 'line';
	graph.valueField = 'visits';
	graph.bullet = 'round';
	graph.bulletColor = '#ffffff';
	graph.bulletBorderColor = color;
	graph.bulletBorderThickness = 2;
	graph.bulletSize = 6;
	graph.fillColors = color;
	graph.fillAlphas = 0.2;
	graph.lineThickness = 2;
	graph.lineColor = color;
	graph.balloonText = '[[category]]: [[value]] visitors';
	visitorChart.addGraph(graph);
	
	var columnGraph = new AmCharts.AmGraph();
	columnGraph.type = 'column';
	columnGraph.valueField = 'chats';
	//columnGraph.lineAlpha = 0;
	columnGraph.fillColors = color;
	//columnGraph.fillAlphas = 1;
	columnGraph.fillAlphas = 0.5;
	columnGraph.lineColor = color;
	columnGraph.lineThickness = 1;
	columnGraph.balloonText = '[[value]] chats';
	columnGraph.startDuration = 1;
	visitorChart.addGraph(columnGraph);

	// Cursor
	visitorChartCursor = new AmCharts.ChartCursor();
	visitorChartCursor.cursorPosition = 'mouse';
	visitorChartCursor.pan = false;
	visitorChartCursor.zoomable = false;
	visitorChartCursor.categoryBalloonEnabled = false;
	visitorChartCursor.cursorAlpha = 0;
	visitorChartCursor.categoryBalloonDateFormat = 'EEE DD MMM YYYY';
	
	visitorChart.addChartCursor(visitorChartCursor);
	visitorChart.fontFamily = 'Segoe UI';
	visitorChart.fontSize = 14;
	visitorChart.color = '#666';

	// Output Chart
	visitorChart.write('visitor-chart');

	// Chart Empty
	if (visitorChartEmpty === true) {
		$('#visitor-empty').fadeIn();
	}
	
}

var weekdayChart,
	weekdayChartData = [],
	weekdayChartCursor,
	weekdayChartEmpty = false;

function showWeekdayChart() {

	var color = '#54c2ea';

	// Validate Chart Data
	var opacity = 1.0;

	// Sample Weekday Chart Data
	if (weekdayChartData.length === 0) {
		weekdayChartData = [
			{"Day":"Sunday","Total":3,"Average":1.5},
			{"Day":"Monday","Total":4,"Average":2},
			{"Day":"Tuesday","Total":1,"Average":1},
			{"Day":"Wednesday","Total":5,"Average":2.5},
			{"Day":"Thursday","Total":3,"Average":3},
			{"Day":"Friday","Total":5,"Average":1.7},
			{"Day":"Saturday","Total":0,"Average":1.5}
		];

		weekdayChartEmpty = true;
	}

	if (weekdayChartEmpty) {
		color = '#cccccc';
		opacity = 0.4;
	}

	// Opacity
	$('#weekday-chart').css('opacity', opacity);

	// Serial Chart
	weekdayChart = new AmCharts.AmSerialChart();
	//weekdayChart.pathToImages = '../amcharts/images/';
	weekdayChart.dataProvider = weekdayChartData;
	weekdayChart.categoryField = 'Day';
	weekdayChart.balloon.bulletSize = 5;
	weekdayChart.startDuration = 1;

	// Chart Events
	//weekdayChart.addListener('dataUpdated', weekdayChartDataUpdated);

	// Catgory Axis
	var categoryAxis = weekdayChart.categoryAxis;
	categoryAxis.parseDates = false;
	categoryAxis.minPeriod = 'DD';
	categoryAxis.axisAlpha = 0;
	categoryAxis.dashLength = 1;
	categoryAxis.boldPeriodBeginning = false;
	categoryAxis.position = 'bottom';
	categoryAxis.axisColor = '#dadada';

	// Balloon
	var balloon = weekdayChart.balloon;
	balloon.adjustBorderColor = true;
	balloon.color = color;
	balloon.cornerRadius = 5;
	balloon.borderAlpha = 1;
	balloon.borderColor = color;
	balloon.borderThickness = 1;
	balloon.fillColor = color;
	balloon.fillAlpha = 0.8;
	balloon.color = '#f3f3f3';
	balloon.showBullet = true;
	balloon.bulletSize = 4;
	balloon.fontSize = 15;
	balloon.textShadowColor = '#666';

	// Value Axis
	var valueAxis = new AmCharts.ValueAxis();
	valueAxis.axisAlpha = 0;
	valueAxis.dashLength = 1;
	valueAxis.minimum = 0;
	weekdayChart.addValueAxis(valueAxis);

	// Graph
	var graph = new AmCharts.AmGraph();
	graph.type = 'column';
	graph.valueField = 'Average';
	graph.bulletSize = 0;
	graph.fillColors = color;
	graph.fillAlphas = 0.5;
	graph.lineThickness = 1;
	graph.lineColor = color;
	graph.balloonText = '[[category]]: [[value]] chats (average)';
	weekdayChart.addGraph(graph);
	
	// Cursor
	weekdayChartCursor = new AmCharts.ChartCursor();
	weekdayChartCursor.cursorPosition = 'mouse';
	weekdayChartCursor.pan = false;
	weekdayChartCursor.zoomable = false;
	weekdayChartCursor.categoryBalloonEnabled = false;
	weekdayChartCursor.cursorAlpha = 0;
	weekdayChartCursor.categoryBalloonDateFormat = 'EEE DD MMM YYYY';
	
	weekdayChart.addChartCursor(weekdayChartCursor);
	weekdayChart.fontFamily = 'Segoe UI';
	weekdayChart.fontSize = 14;
	weekdayChart.color = '#666';

	// Output Chart
	weekdayChart.write('weekday-chart');
	
	// Chats Empty
	if (weekdayChartEmpty === true) {
		$('#weekday-empty').fadeIn();
	}

}


var chatChart,
	chatChartData = [],
	chatChartCursor,
	chatChartEmpty = false;

// Chat Chat
function showChatChart() {

	var color = '#54c2ea';

	// Validate Chart Data
	var opacity = 1.0;

	if (chatChartData.length === 0) {
		for (var i = 30; i > 0; i--) {
			var date = new Date(),
				chats = Math.floor(Math.random() * (80 - 30 + 1)) + 30;

			date.setDate(date.getDate() - i);
			chatChartData.push({
				date: date,
				chats: chats
			});
		}
		chatChartEmpty = true;
	}

	if (chatChartEmpty) {
		color = '#cccccc';
		opacity = 0.4;
	}

	// Opacity
	$('#chat-chart').css('opacity', opacity);

	// Serial Chart
	chatChart = new AmCharts.AmSerialChart();
	//chatChart.pathToImages = '../amcharts/images/';
	chatChart.dataProvider = chatChartData;
	chatChart.categoryField = 'date';
	chatChart.balloon.bulletSize = 5;
	chatChart.startDuration = 1;

	// Chart Events
	chatChart.addListener('dataUpdated', chatChartDataUpdated);

	// Catgory Axis
	var categoryAxis = chatChart.categoryAxis;
	categoryAxis.parseDates = true;
	categoryAxis.minPeriod = 'DD';
	categoryAxis.axisAlpha = 0;
	categoryAxis.dashLength = 1;
	categoryAxis.boldPeriodBeginning = false;
	categoryAxis.position = 'bottom';
	categoryAxis.axisColor = '#dadada';

	// Balloon
	var balloon = chatChart.balloon;
	balloon.adjustBorderColor = true;
	balloon.color = color;
	balloon.cornerRadius = 5;
	balloon.borderAlpha = 1;
	balloon.borderColor = color;
	balloon.borderThickness = 1;
	balloon.fillColor = color;
	balloon.fillAlpha = 0.8;
	balloon.color = '#f3f3f3';
	balloon.showBullet = true;
	balloon.bulletSize = 4;
	balloon.fontSize = 15;
	balloon.textShadowColor = '#666';

	// Value Axis
	var valueAxis = new AmCharts.ValueAxis();
	valueAxis.axisAlpha = 0;
	valueAxis.dashLength = 1;
	valueAxis.minimum = 0;
	chatChart.addValueAxis(valueAxis);

	// Graph
	var graph = new AmCharts.AmGraph();
	graph.type = 'column';
	graph.valueField = 'chats';
	graph.bulletSize = 0;
	graph.fillColors = color;
	graph.fillAlphas = 0.5;
	graph.lineThickness = 1;
	graph.lineColor = color;
	graph.balloonText = '[[category]]: [[value]] chats';
	chatChart.addGraph(graph);
	
	// Cursor
	chatChartCursor = new AmCharts.ChartCursor();
	chatChartCursor.cursorPosition = 'mouse';
	chatChartCursor.pan = false;
	chatChartCursor.zoomable = false;
	chatChartCursor.categoryBalloonEnabled = false;
	chatChartCursor.cursorAlpha = 0;
	chatChartCursor.categoryBalloonDateFormat = 'EEE DD MMM YYYY';
	
	chatChart.addChartCursor(chatChartCursor);
	chatChart.fontFamily = 'Segoe UI';
	chatChart.fontSize = 14;
	chatChart.color = '#666';

	// Output Chart
	chatChart.write('chat-chart');
	
	// Chats Empty
	if (chatChartEmpty === true) {
		$('#chat-empty').fadeIn();
	}

}

function pad(value) {
	return value < 10 ? '0' + value : value;
}

function getUTCOffset() {
	var date = new Date();
	var sign = (date.getTimezoneOffset() > 0) ? '-' : '+';
	var offset = Math.abs(date.getTimezoneOffset());
	var hours = pad(Math.floor(offset / 60));
	var minutes = pad(offset % 60);
	return sign + hours + minutes;
}

// Visitor Chart Data
function loadStatisticsChartData() {

	if (session.length > 0) {

		// Web Service / Data
		var url = (server.length > 0) ? protocol + server + '/livehelp/xml/WebService.php?Statistics' : service + '?Statistics',
			post = { 'Session': session, 'Timezone': getUTCOffset(), 'Version': '4.0', 'Format': 'json' };

		// Statistics AJAX / Charts
		$.ajax({url: url,
			data: post,
			type: 'POST',
			success: function (data) {
				// Statistics JSON
				if (data.Statistics !== null && data.Statistics !== undefined) {
					var i = 0,
						chats = data.Statistics.Chats,
						visitors = data.Statistics.Visitors,
						duration = data.Statistics.Duration,
						rating = data.Statistics.Rating,
						firstDate,
						newDate;

					// Visitors
					if (visitors !== null && visitors !== undefined) {

						firstDate = new moment(visitors.Date).add('d', 1).toDate();

						if (visitors !== null && chats !== null && chats.Data !== undefined) {
							visitors.Data = visitors.Data.reverse();
							visitorChartData = [];
							for (i = 0; i < 30; i++) {
								visitorChartData.push({
									date: new moment(firstDate).add('day', i).toDate(),
									chats: chats.Data[i],
									visits: visitors.Data[i]
								});
								visitorChartEmpty = false;
							}
						}
					}
					showVisitorChart();
					
					// Chats
					if (chats !== null && chats !== undefined && chats.Data !== undefined) {
						var alpha = 0.5;
						firstDate = new moment(chats.Date).add('day', 1).toDate();
						historyChartData = [];
						chatChartData = [];
						for (i = 0; i < 30; i++) {
							if (i > 23) {
								historyChartData.push({
									date: new moment(firstDate).add('day', i).toDate(),
									chats: chats.Data[i]
								});
							}
							
							if (i > 28) {
								color = '#00637d';
								alpha = 0.8;
							} else {
								color = '#54c2ea';
								alpha = 0.5;
							}
							
							chatChartData.push({
								date: new moment(firstDate).add('day', i).toDate(),
								color: color,
								alpha: alpha,
								chats: chats.Data[i]
							});
							chatChartEmpty = false;
						}

						// Weekday Chart
						weekdayChartData = chats.Weekday;

					}
					showChatChart();
					showHistoryChart();
					showWeekdayChart();

					// Duration
					var total = 0;
					if (duration !== null && duration !== undefined && duration.Data !== undefined) {
						$.each(duration.Data, function(key, time) {
							total += time;
						});

						var time = parseInt(total / duration.Data.length, 10);
						var hours = Math.floor(time / 3600);
						var minutes = Math.floor((time - (hours * 3600)) / 60);
						var seconds = time - (hours * 3600) - (minutes * 60) + ' seconds';

						hours = (hours > 0) ? hours + ' hours ' : '';
						minutes = minutes + ' minutes ';
						
						time = hours + minutes + seconds;
						$('.statistics .averagechattime').text(time);

					} else {
						$('.statistics .averagechattime').text(locale.unavailable);
					}

					// Rating
					total = 0;
					if (rating !== null && rating !== undefined) {
						ratingChartData = [
							{rating: 'Excellent', total: parseInt(rating.Excellent, 10)},
							{rating: 'Very Good', total: parseInt(rating.VeryGood, 10)},
							{rating: 'Good', total: parseInt(rating.Good, 10)},
							{rating: 'Poor', total: parseInt(rating.Poor, 10)},
							{rating: 'Very Poor', total: parseInt(rating.VeryPoor, 10)},
							{rating: 'Unrated', total: parseInt(rating.Unrated, 10)}
						];
						ratingChartEmpty = false;

						var average = 0;
						rating = 5;
						$.each(ratingChartData, function(key, value) {
							if (value.total > 0 && key < 5) {
								total += value.total;
								average += (rating - key) * value.total;
								rating--;
							}
						});
						if (total > 0) {
							average = (average / total).toFixed(2);
							rating = ratingChartData[5 - parseInt(average, 10)].rating;
							$('.statistics .averagechatrating').text(average + ' ' + rating);
						} else {
							$('.statistics .averagechatrating').text(locale.unavailable);
						}
					} else {
						$('.statistics .averagechatrating').text(locale.unavailable);
					}
					showRatingChart();
				}
			},
			dataType: 'json'
		});
	}
}

// Visitor Data Updated Event
function visitorChartDataUpdated() {
	if (!visitorChartEmpty) {
		$('#visitor-chart').fadeTo(1000, 1.0);
	}
}

// Chat Data Updated Event
function chatChartDataUpdated() {
	if (!chatChartEmpty) {
		$('#chat-chart').fadeTo(1000, 1.0);
	}
}

// Rating Chart
var ratingChart,
	ratingChartData = [],
	ratingChartCursor,
	ratingChartEmpty = false;

function showRatingChart() {

	// Validate Chart Data
	var empty = false,
		colors = ['#54c2ea', '#235A78', '#439494', '#4DAAAB', '#B4DCED', '#1A8BB2'],
		opacity = 0.8,
		background = '#54c2ea';

	if (ratingChartData.length === 0) {
		ratingChartData = [{rating: 'Excellent', total: 20}, {rating: 'Very Good', total: 18}, {rating: 'Good', total: 10}, {rating: 'Poor', total: 4}, {rating: 'Very Poor', total: 2}, {rating: 'Unrated', total: 8}];
		ratingChartEmpty = true;
	}

	// Empty
	if (ratingChartEmpty) {
		colors = ['#2F3540', '#666A73', '#F2EDE4', '#D9D1C7', '#8C8681', '#333333'];
		opacity = 0.1;
		background = '#CCC';
	}

	// Update Histogram
	var histogram = $('.rating.histogram'),
		total = 0,
		step = 0,
		selectors = ['.excellent', '.verygood', '.good', '.poor', '.verypoor', '.unrated'];

	$.each(ratingChartData, function(key, value) {
		total += parseInt(value.total, 10);
	});
	step = 250 / total;
	$.each(selectors, function(key, value) {
		histogram.find(value).css({background: background}).animate({'width': ratingChartData[key].total * step}, 1000, 'easeInOutBack');
	});

	ratingChart = new AmCharts.AmPieChart();
	ratingChart.dataProvider = ratingChartData;
	ratingChart.titleField = 'rating';
	ratingChart.valueField = 'total';
	ratingChart.outlineColor = '#eeedee';
	ratingChart.outlineAlpha = 1.0;
	ratingChart.outlineThickness = 2;
	ratingChart.radius = '30%';
	ratingChart.colors = colors;
	ratingChart.pieAlpha = opacity;
	ratingChart.pullOutOnlyOne = true;

	// Balloon
	var balloon = ratingChart.balloon;
	balloon.adjustBorderColor = true;
	balloon.cornerRadius = 5;
	balloon.borderAlpha = 1;
	balloon.borderColor = '#54c2ea';
	balloon.borderThickness = 1;
	balloon.fillColor = '[[color]]';
	balloon.fillAlpha = opacity;
	balloon.color = '#f3f3f3';
	balloon.showBullet = true;
	balloon.fontSize = 15;
	balloon.textShadowColor = '#666';

	// Output Chart
	ratingChart.write('rating-chart');

	// Rating Empty
	if (ratingChartEmpty) {
		$('#rating-empty').fadeIn();
	}

}

// History Chart
var historyChart,
	historyChartData = [],
	historyChartCursor;

function showHistoryChart() {

	// Validate Chart Data
	var empty = false;
	if (historyChartData.length === 0) {
		for (var i = 7; i > 0; i--) {
			var date = new Date(),
				chats = Math.floor(Math.random() * (20 - 5 + 1)) + 5;

			date.setDate(date.getDate() - i);
			historyChartData.push({
				date: date,
				chats: chats
			});
		}
		empty = true;
	}

	// Serial Chart
	historyChart = new AmCharts.AmSerialChart();
	//historyChart.pathToImages = '../amcharts/images/';
	historyChart.dataProvider = historyChartData;
	historyChart.categoryField = 'date';
	historyChart.balloon.bulletSize = 5;

	// Chart Events
	historyChart.addListener('dataUpdated', historyChartDataUpdated);

	// Catgory Axis
	var categoryAxis = historyChart.categoryAxis;
	categoryAxis.parseDates = true;
	categoryAxis.minPeriod = 'DD';
	categoryAxis.axisAlpha = 0;
	categoryAxis.dashLength = 0;
	categoryAxis.boldPeriodBeginning = false;
	categoryAxis.position = 'top';
	categoryAxis.axisColor = '#dadada';
	categoryAxis.labelsEnabled = false;
	categoryAxis.gridAlpha = 0;

	// Balloon
	var balloon = historyChart.balloon;
	balloon.adjustBorderColor = true;
	balloon.color = '#999999';
	balloon.cornerRadius = 5;
	balloon.borderAlpha = 1;
	balloon.borderColor = '#999999';
	balloon.borderThickness = 1;
	balloon.fillColor = '#999999';
	balloon.fillAlpha = 0.8;
	balloon.color = '#f3f3f3';
	balloon.showBullet = true;
	balloon.fontSize = 15;
	balloon.textShadowColor = '#666';

	// Value Axis
	var valueAxis = new AmCharts.ValueAxis();
	valueAxis.axisAlpha = 0;
	valueAxis.dashLength = 0;
	valueAxis.labelsEnabled = false;
	valueAxis.minimum = 0;
	valueAxis.gridAlpha = 0.1;
	historyChart.addValueAxis(valueAxis);

	// Graph
	var graph = new AmCharts.AmGraph();
	graph.type = 'line';
	graph.valueField = 'chats';
	graph.bullet = 'round';
	graph.bulletColor = '#ffffff';
	graph.bulletBorderColor = '#999999';
	graph.bulletBorderThickness = 2;
	graph.bulletSize = 6;
	graph.fillColors = '#999999';
	graph.fillAlphas = 0.2;
	graph.lineThickness = 2;
	graph.lineColor = '#999999';
	graph.balloonText = '[[category]]: [[value]] chats';
	historyChart.addGraph(graph);

	// Cursor
	historyChartCursor = new AmCharts.ChartCursor();
	historyChartCursor.cursorPosition = 'mouse';
	historyChartCursor.pan = false;
	historyChartCursor.zoomable = false;
	historyChartCursor.categoryBalloonEnabled = false;
	historyChartCursor.cursorAlpha = 0;
	historyChartCursor.categoryBalloonDateFormat = 'EEE DD MMM YYYY';

	historyChart.addChartCursor(historyChartCursor);
	historyChart.fontFamily = 'Segoe UI';
	historyChart.fontSize = 14;
	historyChart.color = '#666';

	// Output Chart
	historyChart.write('history-chart');

	// History Empty
	if (empty) {
		$('#history-empty').fadeIn();
	}

}

// History Data Updated Event
function historyChartDataUpdated() {
	$('#history-chart').fadeTo(1000, 1.0);
}

function ucwords(str) {
	return (str + '').replace(/^([a-z])|\s+([a-z])/g, function ($1) {
		return $1.toUpperCase();
	});
}

function strtolower(str) {
	return (str + '').toLowerCase();
}

function htmlSmilies(message) {
	var smilies = [
			{ regex: /:D/g, css: 'Laugh' },
			{ regex: /:\)/g, css: 'Smile' },
			{ regex: /:\(/g, css: 'Sad' },
			{ regex: /\$\)/g, css: 'Money' },
			{ regex: /&gt;:O/g, css: 'Angry' },
			{ regex: /:P/g, css: 'Impish' },
			{ regex: /:\\/g, css: 'Sweat' },
			{ regex: /8\)/g, css: 'Cool' },
			{ regex: /&gt;:L/g, css: 'Frown' },
			{ regex: /;\)/g, css: 'Wink' },
			{ regex: /:O/g, css: 'Surprise' },
			{ regex: /8-\)/g, css: 'Woo' },
			{ regex: /8-O/g, css: 'Shock' },
			{ regex: /xD/g, css: 'Hysterical' },
			{ regex: /:-\*/g, css: 'Kissed' },
			{ regex: /:S/g, css: 'Dizzy' },
			{ regex: /\+O\)/g, css: 'Celebrate' },
			{ regex: /&lt;3/g, css: 'Adore' },
			{ regex: /zzZ/g, css: 'Sleep' },
			{ regex: /:X/g, css: 'Stop' },
			{ regex: /X-\(/g, css: 'Tired' }
		];
	
	for (var i = 0; i < smilies.length; i++) {
		var smilie = smilies[i];
		message = message.replace(smilie.regex, '<span title="' + smilie.css + '" class="sprite ' + smilie.css + ' Smilie"></span>');
	}
	return message;
}

function openHome() {
	// Show Visitors
	$('.history, .statistics').fadeOut();

	// Check # Visitors
	if (visitors !== undefined && visitors.length > 0 && $('.worldmap').css('display') == 'none') {
		$('.visitors-empty').hide();
		$('.visitors-grid, .visitors-menu').fadeIn();
		$('.visitors-list.button').css({'background': 'url(./images/ListHover.png) no-repeat', 'opacity': 1.0});
		$('.visitors-map.button').css({'background': 'url(./images/World.png) no-repeat', 'opacity': 0.2});
	}
}

var locale = $.jStorage.get('locale', {});

function processLanguage(data) {
	locale = data;

	var elements = $('[data-lang-key]');
	$.each(elements, function (key, element) {
		var element = $(element),
			key = element.attr('data-lang-key');

		element.text(data[key]);
	});

	$.jStorage.set('locale', locale);
}

function updateLanguage(language) {

	$.ajax({url: '../locale/' + language + '/admin.json',
		type: 'GET',
		success: function (data) {
			// Process Language Pack
			if (data !== undefined) {
				processLanguage(data);
			}
		},
		error: function (jqXHR, textStatus, errorThrown) { },
		dataType: 'json'
	});
}

function loadSettings(data) {

	// Settings
	settings = data;

	// General Settings
	$('#domainname').val(data.Domain);
	$('#siteaddress').val(data.SiteAddress);
	$('#livehelpname').val(data.Name);
	if (data.VisitorTracking !== 0) {
		$('#visitortracking-enable').attr('checked', 'checked');
	} else {
		$('#visitortracking-disable').attr('checked', 'checked');
	}
	if (data.Departments !== 0) {
		$('#departments-enable').attr('checked', 'checked');
	} else {
		$('#departments-disable').attr('checked', 'checked');
	}
	$('#welcomenote').val(data.WelcomeMessage);
	$('#language').empty();

	var languages = data.Language.Available.split(', ');
	var locales = [
		{code: 'af', name: 'Afrikaans'},
		{code: 'ar', name: 'Arabic'},
		{code: 'be', name: 'Byelorussian'},
		{code: 'bg', name: 'Bulgarian'},
		{code: 'ca', name: 'Catalan'},
		{code: 'zh', name: 'Chinese Simplified'},
		{code: 'cs', name: 'Czech'},
		{code: 'da', name: 'Danish'},
		{code: 'de', name: 'German'},
		{code: 'el', name: 'Greek'},
		{code: 'en', name: 'English'},
		{code: 'es', name: 'Spanish'},
		{code: 'et', name: 'Estonian'},
		{code: 'eu', name: 'Basque'},
		{code: 'fi', name: 'Finnish'},
		{code: 'fo', name: 'Faroese'},
		{code: 'fr', name: 'French'},
		{code: 'ga', name: 'Irish'},
		{code: 'gl', name: 'Galician'},
		{code: 'hr', name: 'Croatian'},
		{code: 'hu', name: 'Hungarian'},
		{code: 'is', name: 'Icelandic'},
		{code: 'it', name: 'Italian'},
		{code: 'he', name: 'Hebrew'},
		{code: 'ja', name: 'Japanese'},
		{code: 'ko', name: 'Korean'},
		{code: 'lt', name: 'Lithuanian'},
		{code: 'lv', name: 'Latvian'},
		{code: 'mk', name: 'Macedonian'},
		{code: 'mt', name: 'Maltese'},
		{code: 'nl', name: 'Dutch'},
		{code: 'no', name: 'Norwegian'},
		{code: 'pl', name: 'Polish'},
		{code: 'pt', name: 'Portuguese'},
		{code: 'ro', name: 'Romanian'},
		{code: 'ru', name: 'Russian'},
		{code: 'sk', name: 'Slovak'},
		{code: 'sl', name: 'Slovenian'},
		{code: 'sq', name: 'Albanian'},
		{code: 'sv', name: 'Swedish'},
		{code: 'tr', name: 'Turkish'},
		{code: 'uk', name: 'Ukrainian'}
	];

	$.each(languages, function (key, language) {
		var locale = '';
		$.each(locales, function (index, value) {
			if (language == value.code) {
				locale = value.name;
				return false;
			}
		});
		$('<option value="' + language + '">' + locale + '</option>').appendTo('#language');
	});
	$('#language').val(data.Language.Locale);
	updateLanguage(data.Language.Locale);

	// Appearance Settings
	$('#template').find('option').remove();
	$.each(data.Templates, function(key, value) {
		$('#template').append('<option value="' + value.value + '">' + value.name + '</option>');
	});
	if (data.Smilies !== 0) {
		$('#smilies-enable').attr('checked', 'checked');
		enableSmilies();
	} else {
		$('#smilies-disable').attr('checked', 'checked');
		disableSmilies();
	}
	$('#backgroundcolor').val(data.BackgroundColor);
	$('#generalfont').val(data.Font.Type);
	$('#generalfontsize').val(data.Font.Size);
	$('#generalfontcolor').val(data.Font.Color);
	$('#generalfontlinkcolor').val(data.Font.LinkColor);
	$('#guestchatfont').val(data.ChatFont.Type);
	$('#guestchatfontsize').val(data.ChatFont.Size);
	$('#sentcolor').val(data.ChatFont.SentColor);
	$('#receivedcolor').val(data.ChatFont.ReceivedColor);
	$('#chatwindowsize').val(data.ChatWindowSize.Width + ' x ' + data.ChatWindowSize.Height);
	
	$("input#backgroundcolor, input#sentcolor, input#receivedcolor, input#generalfontcolor, input#generalfontlinkcolor").miniColors();
	
	// HTML5 Alerts / Safari / WebKit
	if (window.webkitNotifications) {
		$('#html5-notifications-enable').attr('checked', 'checked');
		if ($.jStorage.get('html5-notifications', true)) {
			checkHTML5NotificationsPermission();
		} else {
			$('#html5-notifications-disable').attr('checked', 'checked');
		}
	} else {
		$('#html5-notifications-disable').attr('checked', 'checked');
		$('.html5-notifications input').attr('disabled', 'disabled');
		$.jStorage.set('html5-notifications', false);
	}

	// Images
	$('#logo').val(data.Logo);
	$('#campaignimage').val(data.Campaign.Image);
	$('#campaignlink').val(data.Campaign.Link);
	$('#onlineimage').val(data.OnlineLogo);
	$('#offlineimage').val(data.OfflineLogo);
	$('#berightbackimage').val(data.BeRightBackLogo);
	$('#awayimage').val(data.AwayLogo);
	
	// HTML Code
	$('#htmlcodestep1').val(data.Code.Head);
	$('#htmlcodestep2').val(data.Code.Image);
	
	// Email
	$('#emailaddress').val(data.Email);
	$('#offlineurlredirection').val(data.OfflineEmail.Redirect);
	if (data.OfflineEmail.Enabled !== 0) {
		$('#email-enable').attr('checked', 'checked');
	} else {
		$('#email-disable').attr('checked', 'checked');
	}
	
	// Initiate Chat
	$('#autoinitiatechat-enable').click(function () {
		if ($(this).is(':checked')) {
			$('.autoinitiate-pageviews').fadeIn();
		}
	});
	$('#autoinitiatechat-disable').click(function () {
		if ($(this).is(':checked')) {
			$('.autoinitiate-pageviews').fadeOut();
		}
	});
	if (data.InitiateChat.Auto > 0) {
		$('#autoinitiatechat-enable').attr('checked', 'checked');
		$('#autoinitiatechat-pages').val(data.InitiateChat.Auto);
		$('.autoinitiate-pageviews').fadeIn();
	} else {
		$('#autoinitiatechat-disable').attr('checked', 'checked');
		$('#autoinitiatechat-pages').val(data.InitiateChat.Auto);
		$('.autoinitiate-pageviews').hide();
	}
	$('#verticalalignment').val(data.InitiateChat.Vertical);
	$('#horizontalalignment').val(data.InitiateChat.Horizontal);
	
	// Privacy
	if (data.ChatUsername !== 0) {
		$('#displaychatusername-enable').attr('checked', 'checked');
	} else {
		$('#displaychatusername-disable').attr('checked', 'checked');
	}
	if (data.LoginDetails.Required !== 0) {
		$('#guestlogindetails-required').attr('checked', 'checked');
	} else {
		if (data.LoginDetails.Enabled !== 0) {
			$('#guestlogindetails-optional').attr('checked', 'checked');
		} else {
			$('#guestlogindetails-disable').attr('checked', 'checked');
		}
	}
	if (data.LoginDetails.Email !== 0) {
		$('#guestemailaddress-enable').attr('checked', 'checked');
	} else {
		$('#guestemailaddress-disable').attr('checked', 'checked');
	}
	if (data.LoginDetails.Question !== 0) {
		$('#guestquestion-enable').attr('checked', 'checked');
	} else {
		$('#guestquestion-disable').attr('checked', 'checked');
	}
	if (data.SecurityCode !== 0) {
		$('#securitycode-enable').attr('checked', 'checked');
	} else {
		$('#securitycode-disable').attr('checked', 'checked');
	}
	$('#p3p').val(data.P3P);

	// Version
	if (data.Version !== undefined) {
		var version = data.Version.Server;
		if (version >= 4.1) {
			$('.visitors-list.button, .visitors-map.button').css('display', 'inline-block');
		}
	}

	$(document).trigger('LiveHelp.SettingsLoaded', settings);
}

function enableSmilies() {
	$('.smilies.button').show();
}

function disableSmilies() {
	$('.smilies.button').hide();
}

function checkHTML5NotificationsPermission() {
	switch(window.webkitNotifications.checkPermission()) {
		case 0:
			// Accepted
			$('.html5-notifications input').removeAttr('disabled');
			$.jStorage.set('html5-notifications', true);
			break;
		case 2:
			// Failure
			$('.html5-notifications input').attr('disabled', 'disabled');
			$.jStorage.set('html5-notifications', false);
			break;
	}
}

function openSettings() {
	var settings = $('.settings'),
		menu = $('.settingsmenu');
	if (settings.is(':hidden')) {

		// Access Level
		var menus  = $('.settingsmenu > div:not(#htmlcode, #alerts, .backLava)');
		if (operator.access >= 2) {
			menus.remove();
			menu.find('#alerts').click();
		}

		settings.show();
		$('.general').mouseover();
		$('.settings').animate({height:600, opacity:1.0}, 250, 'easeInOutBack', function () {
			$(this).find('.button-toolbar').animate({bottom: '15px'}, 250, 'easeInOutBack');
		});

		// Settings Menu
		if (menu.find('.backLava').length === 0) {
			menu.lavaLamp({target: 'div', container:'div', speed: 250, includeMargins:true, easing: 'easeOutBack', fx: 'easeOutBack' });
		}
		
		var url = (server.length > 0) ? protocol + server + '/livehelp/xml/WebService.php?Settings' : service + '?Settings',
			post = {'Session': session, 'Version': '4.0', 'Format': 'json'};

		// Settings AJAX / Grid
		$.ajax({url: url,
			data: post,
			type: 'POST',
			success: function (data) {
				// Settings JSON
				if (data.Settings !== undefined) {
					loadSettings(data.Settings);
				}
			},
			dataType: 'json'
		});

		// HTML5 Notifications
		$('.html5-notifications input').click(function () {
			if (window.webkitNotifications) {
				if ($('#html5-notifications-enable').is(':checked')) {
					window.webkitNotifications.requestPermission(checkHTML5NotificationsPermission);
				} else {
					$.jStorage.set('html5-notifications', false);
				}
			} else {
				$('.html5-notifications input').attr('disabled', 'disabled');
				$.jStorage.set('html5-notifications', false);
			}
		});
	}
	
}

function saveSettings() {

	// Access Level
	if (operator.access >= 2) {
		return;
	}

	var url = (server.length > 0) ? protocol + server + '/livehelp/xml/WebService.php?Settings' : service + '?Settings',
		smilies = ($('#settings #smilies-enable').is(':checked')) ? -1 : 0,
		visitortracking = ($('#settings #visitortracking-enable').is(':checked')) ? -1 : 0,
		departments = ($('#settings #departments-enable').is(':checked')) ? -1 : 0,
		offlineemail = ($('#settings #email-enable').is(':checked')) ? -1 : 0,
		loginemail = ($('#settings #guestemailaddress-enable').is(':checked')) ? -1 : 0,
		loginquestion = ($('#settings #guestquestion-enable').is(':checked')) ? -1 : 0,
		initiatechatauto = ($('#settings #autoinitiatechat-disable:checked').length > 0) ? -1 : $('#settings #autoinitiatechat-pages').val(),
		chatusername = ($('#settings #displaychatusername-enable').is(':checked')) ? -1 : 0,
		securitycode = ($('#settings #securitycode-enable').is(':checked')) ? -1 : 0,
		logindetails = ($('#settings #guestlogindetails-disable').is(':checked')) ? 0 : -1,
		loginrequired = ($('#settings #guestlogindetails-required').is(':checked')) ? -1 : 0,
		chatwindowsize = $('#settings select#chatwindowsize').val(),
		windowsize = {width: parseInt(chatwindowsize.substring(0, chatwindowsize.indexOf(' x ')), 10), height: parseInt(chatwindowsize.substring(chatwindowsize.indexOf(' x ') + 3), 10)},
		settings = {
			Session: session,
			Domain: $('#settings #domainname').val(),
			URL: $('#settings #siteaddress').val(),
			Email: $('#settings #emailaddress').val(),
			Name: $('#settings #livehelpname').val(),
			Logo: $('#settings #logo').val(),
			Introduction: $('#settings #welcomenote').val(),
			Smilies: smilies,
			Font: $('#settings #generalfont').val(),
			FontSize: $('#settings #generalfontsize').val(),
			FontColor: $('#settings #generalfontcolor').val(),
			ChatFont: $('#settings #guestchatfont').val(),
			SentFontColor: $('#settings #sentcolor').val(),
			ReceivedFontColor: $('#settings #receivedcolor').val(),
			LinkColor: $('#settings #generalfontlinkcolor').val(),
			BackgroundColor: $('#settings #backgroundcolor').val(),
			ChatFontSize: $('#settings #guestchatfontsize').val(),
			OfflineLogo: $('#settings #offlineimage').val(),
			OnlineLogo: $('#settings #onlineimage').val(),
			OfflineEmailLogo: $('#settings #offlineimage').val(),
			BeRightBackLogo: $('#settings #berightbackimage').val(),
			AwayLogo: $('#settings #awayimage').val(),
			LoginDetails: logindetails,
			LoginEmail: loginemail,
			LoginQuestion: loginquestion,
			OfflineEmail: offlineemail,
			OfflineEmailRedirect: $('#settings #offlineurlredirection').val(),
			SecurityCode: securitycode,
			Departments: departments,
			VisitorTracking: visitortracking,
			Locale: $('#settings #language').val(),
			InitiateChatVertical: $('#settings #verticalalignment').val(),
			InitiateChatHorizontal: $('#settings #horizontalalignment').val(),
			InitiateChatAuto: initiatechatauto,
			ChatUsername: chatusername,
			CampaignImage: $('#settings #campaignimage').val(),
			CampaignLink: $('#settings #campaignlink').val(),
			IP2Country: -1,
			P3P: $('#settings #p3p').val(),
			ChatWindowWidth: windowsize.width,
			ChatWindowHeight: windowsize.height,
			RequireGuestDetails: loginrequired,
			Template: $('#settings #template').val(),
			Format: 'json',
			Version: '4.0'
		};

	// Show Progress
	var dialog = $('.settings-dialog');
	dialog.find('.progressring').show();
	dialog.find('.dialog-title').text('Saving Settings');
	dialog.find('.dialog-description').text('One moment while your settings are saved.');
	dialog.animate({bottom: 0}, 250, 'easeInOutBack');

	// Settings AJAX / Grid
	$.ajax({url: url,
		data: settings,
		type: 'POST',
		success: function (data) {
			// Settings JSON
			if (data.Settings !== undefined) {
				loadSettings(data.Settings);

				// Settings Saved
				dialog.find('.progressring').hide();
				dialog.find('.dialog-title').text('Settings Saved Successfully');
				dialog.find('.dialog-description').text('Your settings were saved successfully.');

			}

			// Hide Progress
			dialog.delay(1000).animate({bottom: -90}, 250, 'easeInOutBack');
		},
		error: function (jqXHR, textStatus, errorThrown) {
			// Settings Error
			dialog.find('.progressring').hide();
			dialog.find('.dialog-title').text('Error Saving Settings');
			dialog.find('.dialog-description').text('An error occurred while saving the settings.  Please contact technical support.');

			// Hide Progress
			dialog.delay(3000).animate({bottom: -90}, 250, 'easeInOutBack');
		},
		dataType: 'json'
	});
}

function closeSettings() {
	$('.miniColors-selector').hide();
	$('.settings').animate({height:0, opacity:0}, 250, 'easeInOutBack', function() {
		$(this).hide();
		$(this).find('.button-toolbar').animate({bottom: '-90px'}, 250, 'easeInOutBack');
	});
	switchPreviousMenu();
}

function zeroFill(number, width) {
	width -= number.toString().length;
	if (width > 0) {
		return new Array(width + (/\./.test(number) ? 2 : 1) ).join('0') + number;
	}
	return number;
}

function capitaliseFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function openHistoryChat(data) {
	var history = $('#history-chat'),
		url = (server.length > 0) ? protocol + server + '/livehelp/xml/WebService.php?Chats' : service + '?Chats',
		chat = parseInt(data.Session, 10),
		active = parseInt(data.Active, 10),
		post = 'Session=' + session + '&Data=' + chat + ',0,0,0&Version=4.0&Format=json';
	
	// Show Chat
	if (chat > 0) {
	
		history.data('id', chat);
		history.find('.name').text(data.Username + ' - ' + $(data.Email).text());
		history.find('.messages').html('');

		// Blocked Chat
		var dialog = history.find('.dialog');
		if (active === -3) {
			dialog.show().animate({bottom: '1px'}, 250);
		} else {
			dialog.hide().animate({bottom: '-145px'}, 250);
		}
	
		// Chat AJAX
		$.ajax({url: url,
			data: post,
			type: 'POST',
			success: function (data) {
				// Messages JSON
				if (data.MultipleMessages !== undefined && data.MultipleMessages.Messages !== undefined) {
					
					var messages = data.MultipleMessages.Messages[0],
						html = '',
						pos = 'left';
					
					if (parseInt(messages.ID, 10) === chat && messages.Message.length > 0) {
						$.each(messages.Message, function(key, value) {
							var status = parseInt(value.Status, 10),
								message = value.Content,
								date = new moment(value.Datetime, 'YYYY-MM-DD HH:mm:ss').toDate(),
								time = date.getHours() + ':' + zeroFill(date.getMinutes(), 2);
							
							if (status > 0) {
								message = $('<div>').text(message).html();
							}

							// Image
							if (status === 3) {
								var regEx = /(https?|ftp|file):\/\/[\-A-Z0-9+&@#\/%?=~_|!:,.;]*[A-Z0-9+&@#\/%=~_|](\.jpg|.jpeg|\.gif|\.png)/im;
								var match = regEx.exec(message);
								if (match !== null) {
									message = '<img src="' + match[0] + '" />';
								}
							} else {
								message = message.replace(/(?!.*(?:\.jpe?g|\.gif|\.png)$)((?:(?:http(?:s?))|(?:ftp)):\/\/[^\s|<|>|'|"]*)/img, '<a href="$1" target="_blank">$1</a>');
								message = message.replace(/^(https?|ftp|file):\/\/[\-A-Z0-9+&@#\/%?=~_|!:,.;]*[A-Z0-9+&@#\/%=~_|](\.jpg|.jpeg|\.gif|\.png)$/img, '<img src="$&"/>');
							}

							if (settings.Smilies !== 0) {
								message = htmlSmilies(message);
							}

							var username = value.Username;
							if (status === 1) {
								$.each(accounts.Operator, function (key, account) {
									if (account.Username === username) {
										username = account.Firstname;
										return;
									}
								});
							}
							username = (username.length > 0) ? 'from ' + capitaliseFirstLetter(username) : '';

							pos = (status > 0) ? 'right' : 'left';
							if (status === 0) {
								html += '<blockquote class="message ' + pos + '"><div style="margin-bottom: 3px">' + message + '</div><div style="bottom:5px; right:5px; font-size:11px; float:right">' + username + ' at ' + time + '</div></blockquote>';
							} else if (status >= 0) {
								html += '<blockquote class="message ' + pos + '"><div style="margin-bottom: 3px">' + message + '</div><div style="bottom:5px; right:5px; font-size:11px; float:right">' + username + ' at ' + time + '</div></blockquote>';
							} else if (status === -2) {
								html += '<div style="color:#666; font-size:12px; margin-left:20px; line-height:20px"><img src="http://' + server + '/image.php?SIZE=20" style="float:left; margin-right:5px"/>' + capitaliseFirstLetter(message) + '</div>';
							} else if (status === -3) {
								var rating = parseInt(message.substring(message.length - 1), 10),
									stars = '';

								for (var i = 1; i <= 5; i++) {
									if (rating >= i) {
										stars += '<div class="rating-highlight"></div>';
									} else {
										stars += '<div class="rating"></div>';
									}
								}

								message = message.substring(0, message.length - 2);
								switch (rating) {
									case 5:
										rating = 'Excellent';
										break;
									case 4:
										rating = 'Very Good';
										break;
									case 3:
										rating = 'Good';
										break;
									case 2:
										rating = 'Poor';
										break;
									case 1:
										rating = 'Very Poor';
										break;
								}

								html += '<div style="margin-left:20px">' + message + '<span>' + stars + '<span style="margin-left:10px">' + rating + '</span></span></div>';
							}
						});
						$(html).appendTo('#history-chat .messages');
					}
					
				}
			},
			dataType: 'json'
		});
	
		history.show();
		history.animate({width:'40%', opacity:1}, 250);
	}
}

function closeHistory() {
	var history = $('#history-chat'),
		width = history.width();
	history.animate({width:0, opacity:0}, 250, function () {
		history.hide();
	});

	historyGrid.setSelectedRows([]);
	historyGrid.resetActiveCell();
}

var historyGrid,
	historyColumns,
	historyDataView,
	historyOptions = {
			rowHeight: 220,
			enableCellNavigation: true,
			enableColumnReorder: false,
			multiColumnSort: true,
			multiSelect: false
		};

function updateHistoryFilter() {
	historyDataView.setFilterArgs({
		searchString: historySearch
	});
	historyDataView.refresh();
}

function initHistoryGridEvents() {

	if (historyGrid === undefined) {

		var groupItemMetadataProvider = new Slick.Data.GroupItemMetadataProvider();
		historyDataView = new Slick.Data.DataView({
			groupItemMetadataProvider: groupItemMetadataProvider
		});

		// Persist Columns
		if (historyGrid !== undefined) {
			historyColumns = historyGrid.getColumns();
		} else {
			historyColumns = $.jStorage.get('historyColumns', [
				{id: "history", name: "Chat History", field: "Username", headerCssClass: "username-column-header", width: 550, formatter: renderHistoryCell, sortable: true, resizable: true},
				{id: "date", name: "Date", field: "Date", width: 150, formatter: Slick.Formatters.Date, sortable: true, resizable: true}
			]);

			// Configure Column Formatters
			historyColumns[0].formatter = renderHistoryCell;
			historyColumns[1].formatter = Slick.Formatters.Date;
		}

		historyGrid = new Slick.Grid('.history-grid', historyDataView, historyColumns, historyOptions);
		historyGrid.registerPlugin(groupItemMetadataProvider);
		historyGrid.setSelectionModel(new Slick.RowSelectionModel());
		
		historyGrid.onColumnsResized.subscribe(function () {
			$.jStorage.set('historyColumns', historyGrid.getColumns());
		});

		historyGrid.onSelectedRowsChanged.subscribe(function () {
			rows = historyGrid.getSelectedRows();
			chat = historyDataView.getItem(rows);
			if (chat !== undefined) {
				openHistoryChat(chat);
			}
		});
		
		historyGrid.onSort.subscribe(function (e, args) {
			var cols = args.sortCols;
			historyDataView.sort(function (dataRow1, dataRow2) {
				for (var i = 0, l = cols.length; i < l; i++) {
					var field = cols[i].sortCol.field;
					var sign = cols[i].sortAsc ? 1 : -1;
					var value1 = dataRow1[field], value2 = dataRow2[field];
					var result = (value1 == value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign;
					if (result !== 0) {
						return result;
					}
				}
				return 0;
			});
			historyGrid.invalidate();
			historyGrid.render();
		});
		
		historyDataView.onRowCountChanged.subscribe(function (e, args) {
			historyGrid.updateRowCount();
			historyGrid.render();
		});

		historyDataView.onRowsChanged.subscribe(function (e, args) {
			historyGrid.invalidateRows(args.rows);
			historyGrid.render();
		});
	}
}

function renderHistoryCell(row, cell, value, columnDef, dataContext) {

	var browser = 'Chrome',
		image = '',
		location = dataContext.Country;
		
	value = dataContext.UserAgent;
	if (value.indexOf('MSIE') !== -1) {
		browser = 'InternetExplorer';
	} else if (value.indexOf('Chrome') !== -1) {
		browser = 'Chrome';
	} else if (value.indexOf('Opera') !== -1) {
		browser = 'Opera';
	} else if (value.indexOf('Safari') !== -1) {
		browser = 'Safari';
	} else if (value.indexOf('Firefox') !== -1) {
		browser = 'Firefox';
	}
	dataContext.Username = ucwords(dataContext.Username.toLowerCase());
	dataContext.UserAgent = './images/' + browser + '.png';

	if (dataContext.State !== null && dataContext.State.length > 0) {
		if (dataContext.City !== null && dataContext.City.length > 0) {
			location = dataContext.City + ', ' + dataContext.State + ', ' + dataContext.Country;
		} else {
			location = dataContext.State + ', ' + dataContext.Country;
		}
	} else {
		if (dataContext.City !== null && dataContext.City.length > 0) {
			location = dataContext.City + ', ' + dataContext.Country;
		}
	}
	image = '<span class="' + convertCountryIcon(dataContext.Country) + '" style="float:left; margin: 3px 5px 3px 0; display:inline-block"></span>';
	dataContext.Location = image + location;

	if (dataContext.Department.length === 0) {
		dataContext.Department = 'Unavailable';
	}

	if (dataContext.Email.length > 0) {
		if (dataContext.Email.indexOf('mailto:') === -1 && dataContext.Email.length > 0) {
			dataContext.Email = '<a href="mailto:' + dataContext.Email + '">' + dataContext.Email + '</a>';
		}
	} else {
		dataContext.Email = 'Unavailable';
	}
	if (dataContext.CurrentPage.indexOf('href') === -1 && dataContext.CurrentPage.length > 0) {
		dataContext.CurrentPage = '<a href="' + dataContext.CurrentPage + '" target="_blank">' + dataContext.CurrentPage + '</a>';
	}

	var referrer = dataContext.Referrer,
		regEx = /^http[s]{0,1}:\/\/(?:[^.]+[\\.])*google(?:(?:.[a-z]{2,3}){1,2})[\/](?:search|url|imgres|aclk)(?:\?|.*&)q=([^&]*)/i,
		keywords = regEx.exec(referrer);

	if (keywords !== null) {
		if (keywords[1].length > 0) {
			referrer = 'Google Search (Keywords: ' + keywords[1] + ')';
		} else {
			referrer = 'Google Search';
		}
	}
	dataContext.Referrer = referrer;

	// Rating
	var rating = parseInt(dataContext.Rating, 10),
		ratingText = 'No Rating',
		ratingHtml = '';
	
	switch (rating) {
		case 1:
			ratingText = 'Very Poor';
			break;
		case 2:
			ratingText = 'Poor';
			break;
		case 3:
			ratingText = 'Good';
			break;
		case 4:
			ratingText = 'Very Good';
			break;
		case 5:
			ratingText = 'Excellent';
			break;
	}
	
	for (var i = 1; i <= 5; i++) {
		var css = '',
			disabled = '';
		
		if (rating >= i) {
			css = '-highlight';
		}
		if (rating === 0) {
			disabled = ' rating-disabled';
		}
		ratingHtml += '<div class="rating' + css + disabled + '"></div>';
	}
	
	ratingHtml += '<span style="margin-left:5px">' + ratingText + '</span>';

	var cell = '<div class="cell-inner"> \
	<div class="cell-left"> \
		<img src="' + dataContext.UserAgent + '"/> \
	</div> \
	<div class="cell-main"> \
	  <h2 style="text-transform: none">' + dataContext.Username + '</h2> \
	  <span>' + dataContext.Operator + '</span><br/> \
	  <span>' + dataContext.Department + '</span><br/> \
	  <span>' + dataContext.Hostname + '</span><br/> \
	  <span>' + dataContext.Email + '</span><br/> \
	  <span>' + dataContext.Referrer + '</span><br/> \
	  <span>' + dataContext.CurrentPage + '</span><br/> \
	  <span>' + dataContext.Location + '</span><br/> \
	  <span>' + ratingHtml + '</span><br/> \
	</div> \
</div>';

	return cell;
}

function initHistoryGrid(date) {

	// History Grid
	var history,
		historySearch = '';

	if (date === undefined) {
		// Selected Date
		date = $.jStorage.get('history-date', '');

		// Selected Date
		var calendar = $('.history #calendar');
		calendar.find('td').removeClass('selected-date');
		calendar.find('td[id="' + date + '"]').addClass('selected-date');

		date = (date.length > 0) ? new moment(date, 'YYYY-MM-DD HH:mm:ss') : new moment();
		date = date.year() + '-' + zeroFill(date.month() + 1, 2) + '-' + zeroFill(date.date(), 2);
	}

	function historyFilter(item, args) {
		var search = args.searchString.toLowerCase();
		if (search !== '' && item.Username.toLowerCase().indexOf(search) == -1 && item.Email.toLowerCase().indexOf(search) == -1 && item.Department.toLowerCase().indexOf(search) == -1 && item.Operator.toLowerCase().indexOf(search) == -1 && item.Hostname.toLowerCase().indexOf(search) == -1) {
			return false;
		}

		return true;
	}

	if (session.length > 0) {

		// Web Service / Data
		var url = (server.length > 0) ? protocol + server + '/livehelp/xml/WebService.php?History' : service + '?History',
			post = 'Session=' + session + '&StartDate=' + date + '&EndDate=' + date + '&Timezone=' + getUTCOffset() + '&Transcripts=1&ID=0&Version=4.0&Format=json';

		// Initialise Grid
		initHistoryGridEvents();

		// History AJAX / Grid
		$.ajax({url: url,
			data: post,
			type: 'POST',
			success: function (data) {
				// Chat History JSON
				if (data.ChatHistory !== undefined) {
					
					history = [];
					$.each(data.ChatHistory, function(key, value) {
						history.push(value.Visitor);
					});
					history = history.reverse();

					historyDataView.beginUpdate();
					historyDataView.setItems(history, 'Session');
					historyDataView.setFilterArgs({
						searchString: historySearch
					});
					historyDataView.setFilter(historyFilter);
					historyDataView.endUpdate();

					var chats = '',
						length = history.length;

					if (length > 1) {
						chats = ' - ' + history.length + ' chats';
					} else if (length > 0) {
						chats = ' - ' + history.length + ' chat';
					}

					if (length > 0) {
						$('.history-empty').hide();
						$('.history-grid').show();
					} else {
						//$('.history-grid').hide();
						$('.history-empty, .history-grid').show();
					}
					$('.username-column-header .slick-column-name').text('Chat History' + chats);
					
				}
			},
			dataType: 'json'
		});
	}
}

function sliderIndex() {
	// Adjust Sliders
	var sliders = $('.slider.right'),
		zindex = 0;

	if (sliders.length > 0) {
		$.each(sliders, function (key, value) {
			var element = $(value),
				i = parseInt(element.css('z-index'), 10);

			if (element.width() > 0 && i > zindex) {
				zindex = i;
			}
		});
	}
	return zindex;
}

function openResponses(opened) {

	// Open Responses
	var responses = $('#responses');
	responses.show();
	responses.css('z-index', sliderIndex() + 100);
	responses.animate({width:'40%', opacity:1}, 250, function () {
		// Callback
		if (opened) {
			opened();
		}
	});
}

function closeResponses() {
	var responses = $('#responses'),
		width = responses.width();

	responses.find('.search input').val('');
	filterResponses();

	responses.animate({width:0, opacity:0}, 250, function () {
		responses.hide();
	});
	switchPreviousMenu();
}

var accountsLoaded = false;

function lastUpdatedAccount(accounts) {
	var lastUpdated = null;
	$.each(accounts, function (key, value) {
		var updated = new moment(value.Updated, 'YYYY-MM-DD HH:mm:ss').toDate();
		if (!lastUpdated || updated > lastUpdated) {
			lastUpdated = updated;
		}
	});
	return lastUpdated;
}

function showAccountsGrid(accounts, override) {
	var storedAccounts = $.jStorage.get('accounts', []),
		storedLastUpdated = lastUpdatedAccount(storedAccounts);

	override = (override !== undefined) ? override : false;
	$.jStorage.set('accounts', accounts);
	$(document).trigger('LiveHelp.AccountsUpdated', [accounts]);
	
	var newAccount = false;
	$.each(storedAccounts, function (key, account) {
		var storedID = parseInt(account.ID, 10),
			exists = false;
		
		$.each(accounts, function (key, value) {
			var ID = parseInt(value.ID, 10);
			if (storedID === ID) {
				exists = true;
			}
		});
		
		if (!exists) {
			newAccount = true;
		}
	});
	
	var lastUpdated = lastUpdatedAccount(accounts);
	if (lastUpdated > storedLastUpdated || newAccount || storedAccounts.length != accounts.length) {
		updateAccountsGrid(accounts, override);
	} else {
		updateAccountsGrid(accounts, true);
		$(document).trigger('LiveHelp.AccountsCompleted');
	}
}

// Accounts Grid
var accountsGrid,
	accountsDataView,
	accounts,
	accountsColumns = [
		{id: 'account', name: '', field: 'Username', formatter: renderAccountCell, sortable: true}
	],
	accountsOptions = {
		rowHeight: 80,
		enableCellNavigation: true,
		enableColumnReorder: false,
		forceFitColumns: true,
		multiColumnSort: true,
		multiSelect: false
	},
	accountTemplate = null;

function renderAccountCell(row, cell, value, columnDef, dataContext) {
	var data = dataContext,
		status = parseInt(data.Status, 10);

	if (!isNaN(status)) {
		switch (status) {
			case 0:
				status = 'Offline';
				break;
			case 1:
				status = 'Online';
				break;
			case 2:
				status = 'Be Right Back';
				break;
			case 3:
				status = 'Away';
				break;
		}
		data.Status = status;
	}

	data.Mobile = 'none';
	if (data.Device.length > 0) {
		data.Mobile = 'inline-block';
	}
	
	var disabled = (data.Disabled !== 'none' && data.Disabled !== '0') ? true : false;
	if (disabled && data.Device.length === 0) {
		data.Disabled = 'inline-block; background:url(\'images/Lock.png\') no-repeat; ';
	} else {
		data.Disabled = 'none';
	}

	var size = (window.devicePixelRatio > 1) ? 200 : 100;
	data.Image = protocol + server + '/livehelp/image.php?ID=' + data.ID + '&SIZE=' + size;

	var cell = '<div class="cell-inner" data-id="' + data.ID + '"> \
	<div class="cell-left"> \
		<div class="image" style="background: url(' + data.Image + ') no-repeat; background-size: 60px auto; width: 60px; height: 60px"></div> \
	</div> \
	<div class="cell-main"> \
		<div class="cell-heading name">' + data.Firstname + ' ' + data.Lastname + '</div> \
		<span class="cell-details department">' + data.Department + '</span> \
		<span class="cell-details status">' + data.Status + '</span> \
		<span class="disabled" title="Account Disabled" style="width:22px; height:22px; display:inline-block; position:absolute; bottom:10px; right:30px; opacity:0.3; display:' + data.Disabled + '"></span> \
		<span class="sprite Smartphone" title="Logged in with Mobile App" style="position:absolute; bottom:10px; right:25px; opacity:0.5; display:' + data.Mobile + '"></span> \
	</div> \
</div>';

	return cell;
}

function initAccountsGridEvents() {

	if (accountsGrid === undefined) {

		var groupItemMetadataProvider = new Slick.Data.GroupItemMetadataProvider();
		accountsDataView = new Slick.Data.DataView({
			groupItemMetadataProvider: groupItemMetadataProvider
		});

		accountsGrid = new Slick.Grid('.accounts-grid', accountsDataView, accountsColumns, accountsOptions);
		accountsGrid.registerPlugin(groupItemMetadataProvider);
		accountsGrid.setSelectionModel(new Slick.RowSelectionModel());

		accountsGrid.onSelectedRowsChanged.subscribe(function() {
			rows = accountsGrid.getSelectedRows();
			account = accountsDataView.getItem(rows);

			if (account !== undefined) {

				var storedAccounts = $.jStorage.get('accounts', []);
				$.each(storedAccounts, function(key, value) {
					if (parseInt(account.ID, 10) === parseInt(value.ID, 10)) {
						account = value;
					}
				});

				showAccount(account);
				accountsGrid.setSelectedRows([]);
				accountsGrid.resetActiveCell();
			}
		});

		accountsGrid.onSort.subscribe(function (e, args) {
			var cols = args.sortCols;
			accountsDataView.sort(function (dataRow1, dataRow2) {
				for (var i = 0, l = cols.length; i < l; i++) {
					var field = cols[i].sortCol.field;
					var sign = cols[i].sortAsc ? 1 : -1;
					var value1 = dataRow1[field], value2 = dataRow2[field];
					var result = (value1 == value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign;
					if (result !== 0) {
						return result;
					}
				}
				return 0;
			});
			accountsGrid.invalidate();
			accountsGrid.render();
		});

		accountsDataView.onRowCountChanged.subscribe(function (e, args) {
			accountsGrid.updateRowCount();
			accountsGrid.render();
		});

		accountsDataView.onRowsChanged.subscribe(function (e, args) {
			accountsGrid.invalidateRows(args.rows);
			accountsGrid.render();
		});
	}
}

function updateAccountsGrid(accounts, override) {
	override = (override !== undefined) ? override : false;

	// Initialise Grid
	initAccountsGridEvents();

	function displayAccountsGrid() {

		$('#account-details .details').css('background', 'none');

		// Refresh Data View
		accountsDataView.beginUpdate();
		accountsDataView.setItems(accounts);
		accountsDataView.endUpdate();
	}

	// Preload Images
	var loaded = [];
	if (override) {
		displayAccountsGrid();
		$(document).trigger('LiveHelp.AccountsCompleted');
	} else if (loaded.length != accounts.length) {
		var size = (window.devicePixelRatio > 1) ? 200 : 100;
		$.each(accounts, function (key, account) {
			if (account.Image === undefined) {
				account.Image = protocol + server + '/livehelp/image.php?ID=' + account.ID + '&SIZE=' + size;
				$('<img />').load(function () {
					loaded.push(account.ID);
					if (loaded.length == accounts.length) {
						displayAccountsGrid();
						$(document).trigger('LiveHelp.AccountsOpenLoaded');
					}
				}).attr('src', account.Image);
			} else {
				override = true;
			}
		});

		if (override) {
			displayAccountsGrid();
			$(document).trigger('LiveHelp.AccountsOpenLoaded');
		}

	} else {
		$(document).trigger('LiveHelp.AccountsCompleted');
	}

}

function initAccountsGrid(showGrid) {

	if (session.length > 0) {

		// Web Service URL / Data
		var url = (server.length > 0) ? protocol + server + '/livehelp/xml/WebService.php?Operators' : service + '?Operators',
			cached = new Date().toString('yyyy-MM-dd HH:mm:ss'),
			post = 'Session=' + session + '&Cached=' + cached + '&Version=4.0&Format=json',
			storedAccounts = $.jStorage.get('accounts', []),
			storedLastUpdated = lastUpdatedAccount(storedAccounts);
		
		if (storedAccounts.length > 0 && $('#account-details').css('display') != 'none' && !accountsLoaded) {
			if (showGrid !== undefined && showGrid === true) {
				updateAccountsGrid(storedAccounts, true);
				accountsLoaded = true;
			}
		} else {
			var rows = $('.accounts-grid .cell-inner');
			$.each(rows, function (key, row) {
				var id = $(row).data('id');
				row = $(row);

				$.each(accounts.Operator, function (key, account) {
					var status = 'Offline';
					if (id === parseInt(account.ID, 10)) {
						// Status Mode
						switch(parseInt(account.Status, 10)) {
							case 1:
								status = 'Online';
								break;
							case 2:
								status = 'Be Right Back';
								break;
							case 3:
								status = 'Away';
								break;
						}
						row.find('.cell-details.name').text(account.Firstname + " " + account.Lastname);
						row.find('.cell-details.department').text(account.Department);
						row.find('.cell-details.status').text(status);
						return;
					}
				});
			});
		}

		$(document).trigger('LiveHelp.AccountsOpened');

		// Accounts AJAX / Grid
		$.ajax({url: url,
			data: post,
			type: 'POST',
			success: function (data) {
				// Accounts JSON
				if (data.Operators !== undefined && data.Operators.Operator !== undefined) {
					accounts = data.Operators;

					$.jStorage.set('accounts', accounts.Operator);
					$(document).trigger('LiveHelp.AccountsUpdated', [accounts.Operator]);

					if (showGrid !== undefined && showGrid === true) {
						showAccountsGrid(data.Operators.Operator);
					} else {
						$(document).trigger('LiveHelp.AccountsCompleted');
					}
				}
			},
			dataType: 'json'
		});
	}

}

function closeAccountDetails() {
	var account = $('#account-details'),
		save = account.find('.button-toolbar.save'),
		edit = account.find('.button-toolbar.edit'),
		heading = account.find('.header').text();
		height = save.height();

	if (heading === 'Add Account' || edit.filter(':visible').length > 0) {
		showAccounts();
		return;
	}
	account.find('.LiveHelpInput, .password').hide();
	account.find('.value, .button-toolbar.edit').fadeIn();
	save.hide().css('bottom', -height + 'px');
	edit.fadeIn().animate({bottom: '15px'}, 250, 'easeInOutBack');
}

function validateField(obj, id) {
	var value = (obj instanceof $) ? obj.val() : $(obj).val();
	if ($.trim(value) === '') {
		$(id).removeClass('TickSmall').addClass('CrossSmall').fadeIn(250);
		return false;
	} else {
		$(id).removeClass('CrossSmall').addClass('TickSmall').fadeIn(250);
		return true;
	}
}

function validateUsername(obj, id) {
	var value = (obj instanceof $) ? obj.val() : $(obj).val(),
		accounts = $.jStorage.get('accounts', []),
		exists = false,
		accountID = $('#AccountID').val();

	accountID = (accountID.length > 0) ? parseInt(accountID, 10) : 0;

	$.each(accounts, function(index, account) {
		account.ID = parseInt(account.ID, 10);
		if ((account.Username === value && accountID === 0) || (account.Username === value && accountID > 0 && accountID !== account.ID)) {
			exists = true;
		}
	});

	if ($.trim(value) === '' || exists === true) {
		$(id).removeClass('TickSmall').addClass('CrossSmall').fadeIn(250);
		return false;
	} else {
		$(id).removeClass('CrossSmall').addClass('TickSmall').fadeIn(250);
		return true;
	}
}

function validateEmail(obj, id) {
	var value = (obj instanceof $) ? obj.val() : $(obj).val();
	if (/^[\-!#$%&'*+\\.\/0-9=?A-Z\^_`a-z{|}~]+@[\-!#$%&'*+\\\/0-9=?A-Z\^_`a-z{|}~]+\.[\-!#$%&'*+\\.\/0-9=?A-Z\^_`a-z{|}~]+$/i.test(value)) {
		$(id).removeClass('CrossSmall').addClass('TickSmall').fadeIn(250);
		return true;
	} else {
		$(id).removeClass('TickSmall').addClass('CrossSmall').fadeIn(250);
		return false;
	}
}

function validatePassword(obj, password, id) {
	var value = (obj instanceof $) ? obj.val() : $(obj).val();
	if ($.trim(value) === '' || value !== password) {
		$(id).removeClass('TickSmall').addClass('CrossSmall').fadeIn(250);
		return false;
	} else {
		$(id).removeClass('CrossSmall').addClass('TickSmall').fadeIn(250);
		return true;
	}
}

function saveAccount() {

	var url = (server.length > 0) ? protocol + server + '/livehelp/xml/WebService.php?Operators' : service + '?Operators',
		storedAccounts = $.jStorage.get('accounts', []),
		storedLastUpdated = lastUpdatedAccount(storedAccounts),
		disabled = ($('#AccountStatusEnable').is(':checked')) ? 0 : -1,
		account = {
			Session: session,
			ID: $('#AccountID').val(),
			User: $('#AccountUsername').val(),
			Firstname: $('#AccountFirstname').val(),
			Lastname: $('#AccountLastname').val(),
			Email: $('#AccountEmail').val(),
			Department: $('#AccountDepartment').val(),
			Privilege: $('#AccountAccessLevel').val(),
			NewPassword: $('#AccountPassword').val(),
			Disabled: disabled,
			Cached: new moment(storedLastUpdated.toString(), 'YYYY-MM-DD HH:mm:ss').toDate(),
			Format: 'json',
			Version: '4.0'
		};

	// Save Account Validation
	validateAccount(false);
	if ($('#account-details').find('.InputError.CrossSmall').length > 0) {
		return;
	}

	// Show Progress
	var dialog = $('.account-dialog');
	dialog.find('.progressring').show();
	dialog.find('.title').text('Saving Account');
	dialog.find('.description').text('One moment while your account is saved.');
	dialog.animate({bottom: 0}, 250, 'easeInOutBack');

	function accountError() {
		// Account Error
		dialog.find('.progressring').hide();
		dialog.find('.title').text('Error Saving Account');
		dialog.find('.description').text('An error occurred while saving your account.  Please contact technical support.');

		// Hide Progress
		dialog.delay(2000).animate({bottom: -90}, 250, 'easeInOutBack');
	}

	function saveCompleted(data) {
		if (data.Operators !== null && data.Operators !== undefined && data.Operators.Operator !== undefined) {

			var accounts = data.Operators.Operator;
			$.jStorage.set('accounts', accounts);
			
			$(document).trigger('LiveHelp.AccountsUpdated', [accounts]);
			
			var newAccount = false;
			$.each(storedAccounts, function (key, account) {
				var storedID = parseInt(account.ID, 10),
					exists = false;
				
				$.each(accounts, function (key, value) {
					var ID = parseInt(value.ID, 10);
					if (storedID === ID) {
						exists = true;
					}
				});
				
				if (!exists) {
					newAccount = true;
				}
			});
			
			var lastUpdated = lastUpdatedAccount(accounts);
			if (lastUpdated > storedLastUpdated || newAccount) {
				updateAccountsGrid(accounts, true);
			}

			// Show Updated Account
			$.each(accounts, function(index, value) {
				if (value.ID === account.ID) {
					showAccount(value);
					return;
				}
			});
			closeAccountDetails();

			$(document).trigger('LiveHelp.AccountSaveCompleted');

			// Hide Progress
			var dialog = $('.account-dialog');
			dialog.animate({bottom: -90}, 250, 'easeInOutBack');
		} else {
			// Account Error
			accountError();
		}
	}

	// Save Account without Image Upload
	if (accountFiles !== undefined) {
		// Save Account / Image Upload
		$('#account-upload').fileupload('send', {formData: account, files: accountFiles }).success(function (data, textStatus, jqXHR) {
			// Account Saved
			saveCompleted(data);

			// Update Image
			if (parseInt(account.ID, 10) === operator.id) {
				$('.operators .image.photo').css({'background-image': 'url(http://' + server + '/image.php?ID=' + operator.id + '&SIZE=40&' + $.now() + ')'});
				$('.accounts-grid .photo').css({ 'background-image': 'url(http://' + server + '/livehelp/image.php?ID=' + operator.id + '&SIZE=50&' + $.now() + ')' });
			}

			$('#account-details .cell-inner[data-id="' + account.ID + '"] img').attr('src', protocol + server + '/livehelp/image.php?ID=' + account.ID + '&SIZE=60&' + $.now());

		}).error(function (jqXHR, textStatus, errorThrown) {
			// Account Error
			accountError();
		});
		accountFiles = undefined;
	} else {
		// Save Account
		$.ajax({url: url,
			data: account,
			type: 'POST',
			success: function (data) {
				saveCompleted(data);
			},
			dataType: 'json'
		});
	}
}

function showAddAccount() {
	$('.accounts-grid').fadeOut();

	var account = $('#account-details'),
		save = account.find('.button-toolbar.save'),
		height = save.height(),
		toolbars = account.find('.button-toolbar.edit, .button-toolbar.add');

	account.find('.header').text('Add Account');
	account.find('.back, .back-background').fadeIn();
	account.find('.details').css('bottom', '25px');
	account.find('.value, .label.devices').hide();
	account.find('input, select, .password').val('').fadeIn();
	account.find('.scroll, .button-toolbar.save, .LiveHelpInput, #account-upload, .upload, #account-dropzone').fadeIn();
	account.find('#AccountStatusEnable').attr('checked', 'checked');
	account.find('.InputError').removeClass('TickSmall CrossSmall');

	toolbars.css('bottom', -height + 'px').hide();
	save.fadeIn().animate({bottom: '15px'}, 250, 'easeInOutBack');

	$(document).trigger('LiveHelp.ShowAccountLoaded');

}

function validateAccount(password) {
	var account = $('#account-details'),
		required = account.find('input, select, .password').filter(':not(#AccountUsername, #AccountEmail, #AccountPasswordConfirm)');

	if (!password) {
		required = account.find('input, select').filter(':not(#AccountUsername, #AccountEmail, #AccountPasswordConfirm, #AccountPassword)');
	}

	// Validate Required Fields
	$.each(required, function (key, value) {
		var id = $(value).attr('id');
		validateField($(value), '#' + id + 'Error');
	});

	// Validate Username
	var element = $('input#AccountUsername'),
		id = element.attr('id');

	validateUsername(element, '#' + id + 'Error');

	// Validate Email
	element = $('input#AccountEmail');
	id = element.attr('id');
	validateEmail(element, '#' + id + 'Error');

	// Validate Password
	var passwordfield = $('#AccountPassword'),
		confirmpassword = $('#AccountPasswordConfirm');

	if (!password) {
		if (passwordfield.val().length === 0 && confirmpassword.val().length === 0) {
			return;
		}
	}
	id = confirmpassword.attr('id');
	validatePassword(confirmpassword, passwordfield.val(), '#' + id + 'Error');
}

function updateAccountImage(image) {
	var upload = $('#account-upload');
	upload.find('.image').css({'background': 'url(' + image + ') no-repeat', 'opacity': 1.0, 'width': '100px', 'height': '100px', 'padding': 0, 'background-size': '100px 100px'});
	upload.css({'border': 'none', 'border-radius': 0, 'background': 'transparent'}).fadeIn();
	$('.upload').hide();
}

var accountFiles;
function addAccount() {

	var account = $('#account-details'),
		disabled = account.find('#AccountStatusEnable').is(':checked') ? 0 : -1,
		post = {
			Session: session,
			User: account.find('#AccountUsername').val(),
			Firstname: account.find('#AccountFirstname').val(),
			Lastname: account.find('#AccountLastname').val(),
			Email: account.find('#AccountEmail').val(),
			Department: account.find('#AccountDepartment').val(),
			NewPassword: account.find('#AccountPassword').val(),
			Privilege: account.find('#AccountAccessLevel').val(),
			Disabled: disabled,
			Format: 'json',
			Version: '4.0'
		};

	// Add Account Validation
	validateAccount(true);
	if (account.find('.InputError.CrossSmall').length > 0) {
		return;
	}

	// Show Progress
	var dialog = $('.account-dialog');
	dialog.find('.progressring').show();
	dialog.find('.title').text('Adding Account');
	dialog.find('.description').text('One moment while you account is created.');
	dialog.animate({bottom: 0}, 250, 'easeInOutBack');

	function accountAdded(data) {
		if (data.Operators !== undefined && data.Operators.Operator !== undefined) {
			// Operators
			var operators = data.Operators.Operator;
			showAccountsGrid(operators);
			showAccounts();

			// Update Image
			var id = 0;
			$.each(operators, function(key, value) {
				if (value.Username === post.User) {
					id = parseInt(value.ID, 10);
					return false;
				}
			});
			if (id > 0) {
				$('#account-details .cell-inner[data-id="' + id + '"] img').attr('src', protocol + server + '/livehelp/image.php?ID=' + id + '&SIZE=60&' + $.now());
			}
		}

		// Hide Progress
		dialog.animate({bottom: -90}, 250, 'easeInOutBack');
	}
	function accountError() {
		// Account Error
		dialog.find('.progressring').hide();
		dialog.find('.title').text('Error Adding Account');
		dialog.find('.description').text('An error occurred while adding your account.  Please contact technical support.');
	}

	// Add Account without Image Upload
	if (accountFiles !== undefined) {
		// Add Account / Image Upload
		$('#account-upload').fileupload('send', {formData: post, files: accountFiles }).success(function (data, textStatus, jqXHR) {
			// Account Added
			accountAdded(data);
		}).error(function (jqXHR, textStatus, errorThrown) {
			// Account Error
			accountError();
		});
		accountFiles = undefined;
	} else {
		// Add Account
		$.ajax({url: (server.length > 0) ? protocol + server + '/livehelp/xml/WebService.php?Operators' : service + '?Operators',
			data: post,
			type: 'POST',
			success: function (data) {
				// Account Added
				accountAdded(data);
			},
			error: function (jqXHR, textStatus, errorThrown) {
				// Account Error
				accountError();
			},
			dataType: 'json'
		});
	}

}

function deleteAccount() {
	var url = (server.length > 0) ? protocol + server + '/livehelp/xml/WebService.php?Operators' : service + '?Operators',
		account = {
			Session: session,
			ID: $('#AccountID').val(),
			Format: 'json',
			Version: '4.0'
		};

	var dialog = $('.confirm-delete');

	function accountError() {
		// Account Error
		dialog.find('.progressring').hide();
		dialog.find('.title').text('Error Deleting Account');
		dialog.find('.description').text('An error occurred while deleting your account.  Please contact technical support.');

		// Hide Progress
		dialog.delay(2000).animate({bottom: -90}, 250, 'easeInOutBack');
	}

	function accountDeleted(data) {
		if (data.Operators !== null && data.Operators !== undefined && data.Operators.Operator !== undefined) {
			// Account Deleted
			var operators = data.Operators.Operator;
			showAccountsGrid(operators);
			showAccounts();

			// Hide Progress
			dialog.delay(2000).animate({bottom: -90}, 250, 'easeInOutBack');
		} else {
			// Account Error
			accountError();
		}
	}

	// Delete Account
	$.ajax({url: (server.length > 0) ? protocol + server + '/livehelp/xml/WebService.php?Operators' : service + '?Operators',
		data: account,
		type: 'POST',
		success: function (data) {
			// Account Deleted
			accountDeleted(data);
		},
		error: function (jqXHR, textStatus, errorThrown) {
			// Account Error
			accountError();
		},
		dataType: 'json'
	});
}

function refreshAccounts(status) {
	switch (status) {
		case "Online":
			status = 1;
			break;
		case "BRB":
			status = 2;
			break;
		case "Away":
			status = 3;
			break;
		default:
			status = 0;
			break;
	}
	$.each(accounts.Operator, function (key, account) {
		if (operator.id === parseInt(account.ID, 10)) {
			account.Status = status;
		}
	});
}

function showAccount(data) {
	$('.accounts-grid').fadeOut();

	$(document).trigger('LiveHelp.AccountLoaded', data);
	
	// Status Button
	var button = $('#account-details .details .btn-group'),
		status = 'Offline';

	// Access Level
	if (operator.access >= 2) {
		button.hide();
	} else {
		button.css('display', 'inline-block');
	}

	data.status = parseInt(data.Status, 10);
	switch(data.status) {
		case 1:
			status = 'Online';
			break;
		case 2:
			status = 'Be Right Back';
			break;
		case 3:
			status = 'Away';
			break;
	}
	button.find('.status').text(status);
	if (data.status !== 1) {
		button.find('.btn').addClass('disabled');
	} else {
		button.find('.btn').removeClass('disabled');
	}
	button.find('.dropdown-menu.statusmode li a').on('click', function () {

		// Show Dialog
		var dialog = $('.account-dialog');
		dialog.find('.progressring').show();
		dialog.find('.title').text('Updating Operator Status Mode');
		dialog.find('.description').text('One moment while the operator status mode is updated.');
		dialog.animate({bottom: 0}, 250, 'easeInOutBack');

		// Update Status
		var id = $('#account-details .details #AccountID').val(),
			button = button,
			status = $(this).attr('class');

		updateUsers(status, id, function () {
			// Accounts
			refreshAccounts(status);

			// Update Button
			status = (status === 'BRB') ? 'Be Right Back' : status;
			$('#account-details .dropdown-toggle .status').text(status);

			// Hide Progress
			dialog.delay(1000).animate({bottom: -90}, 250, 'easeInOutBack');
		});
	});

	$.jStorage.set('account', data);

	// Update Account Details
	var account = $('#account-details');
	account.find('.header').text(data.Firstname + ' ' + data.Lastname);
	account.find('.back, .back-background').fadeIn();

	var size = (window.devicePixelRatio > 1) ? 200 : 100;
	updateAccountImage(protocol + server + '/livehelp/image.php?ID=' + data.ID + '&SIZE=' + size);
	
	account.find('#AccountID').val(data.ID);
	account.find('.username.value').text(data.Username);
	account.find('#AccountUsername').val(data.Username);
	account.find('.firstname.value').text(data.Firstname);
	account.find('#AccountFirstname').val(data.Firstname);
	account.find('.lastname.value').text(data.Lastname);
	account.find('#AccountLastname').val(data.Lastname);
	account.find('.email.value').text(data.Email);
	account.find('#AccountEmail').val(data.Email);
	account.find('.department.value').text(data.Department);
	account.find('#AccountDepartment').val(data.Department);
	
	var access = parseInt(data.Privilege, 10);
	account.find('#AccountAccessLevel').val(access);

	access = convertAccessLevel(data.Privilege);
	account.find('.accesslevel.value').text(access);

	var disabled = parseInt(data.Disabled, 10),
		accountstatus = 'Disabled';

	if (disabled === 0) {
		account.find('#AccountStatusEnable').attr('checked', 'checked');
		accountstatus = 'Enabled';
	} else {
		account.find('#AccountStatusDisable').attr('checked', 'checked');
		accountstatus = 'Disabled';
	}
	account.find('.accountstatus.value').text(accountstatus);

	// Devices
	var html = '';
	if (data.Devices !== undefined) {
		$.each(data.Devices, function (key, value) {
			html += '<div class="device value">' + value.Device + ' - ' + value.OS + '</div>';
		});
	}

	if (html.length > 0) {
		account.find('.devices.value').html(html);
		account.find('.devices.label').show();
	} else {
		account.find('.devices.value').html('');
		account.find('.devices.label').hide();
	}

	account.find('.details').css('bottom', '25px');
	account.find('.value').show();
	account.find('.LiveHelpInput, .password, .button-toolbar.save').hide();
	account.find('.scroll').fadeIn();

	var edit = account.find('.button-toolbar.edit'),
		height = edit.height(),
		toolbars = account.find('.button-toolbar.add, .button-toolbar.save');

	toolbars.css('bottom', -height + 'px').hide();
	edit.fadeIn().animate({bottom: '15px'}, 250, 'easeInOutBack');
}

function showAccounts() {
	var account = $('#account-details'),
		toolbar = account.find('.button-toolbar'),
		add = account.find('.button-toolbar.add'),
		confirm = account.find('.confirm-delete'),
		upload = account.find('#account-upload'),
		height = toolbar.height();

	account.find('.header').text('Add / Edit Accounts');
	account.find('.scroll').fadeOut();
	account.find('#account-image, .upload, #account-dropzone').fadeOut();
	account.find('.back, .back-background').fadeOut();
	account.find('.details').css('bottom', 0);

	upload.hide().find('.image').css({ 'background': 'none', 'opacity': 0.5, 'width': '60px', 'height': '60px', 'padding': '20px' });
	upload.css({'border': '2px dashed #CCC', 'border-radius': '20px', 'background': '#fafafa'});

	toolbar.fadeOut().css('bottom', -height + 'px');

	// Access Level
	if (operator.access >= 2) {
		add.fadeOut();
	} else {
		add.fadeIn().animate({bottom: '15px'}, 250, 'easeInOutBack');
	}

	confirm.animate({bottom: '-90px'}, 250, 'easeInOutBack');
	$('.accounts-grid').fadeIn();

	$('#account-details .details .btn-group').hide();

	if (account.filter(':visible').length > 0) {
		$.jStorage.set('account', null);
		initAccountsGrid(true);
	}

}

function openAccounts() {
	// Open Account
	var account = $('#account-details'),
		add = account.find('.button-toolbar.add');

	// Access Level
	if (operator.access >= 2) {
		add.hide();
	}

	account.show();
	account.css('z-index', sliderIndex() + 100);
	account.animate({width:'40%', opacity:1}, 250, function () {

		var account = $.jStorage.get('account', null),
			storedAccounts = $.jStorage.get('accounts', []);
		if (account !== null) {
			$.each(storedAccounts, function(index, value) {
				if (account.ID === value.ID) {
					account = value;
				}
			});
			showAccount(account);
			return;
		}
		initAccountsGrid(true);
	});
}

function closeAccount() {
	var account = $('#account-details'),
		width = account.width();
	account.animate({width:0, opacity:0}, 250, function () {
		account.hide();
	});
	switchPreviousMenu();
}

var notifications = [];

function updateUser(section, users) {
	var html = '',
		exists = false,
		staff = false.
		hash = '',
		path = window.location.pathname;
		defaultimage = (server.length > 0) ? protocol + server + defaultUserImage : encodeURIComponent(window.location.protocol + '//' + window.location.host + path.replace(path.substring(path.indexOf('/livehelp/admin/')), defaultUserImage)),
		chatting = $('.chatting.list'),
		otherchatting = $('.other-chatting.list'),
		pending = $('.pending.list'),
		operators = $('.operators.list'),
		element = null,
		height = 0,
		alert = false,
		chatstotal = $('#chatstotal');
	
	if (section === 'Online') {
		element = otherchatting;
		// Update Total
		updateTotal(chatstotal, users.length);
	} else if (section === 'Pending' || section === 'Transferred') {
		element = pending;
		alert = true;
	} else if (section === 'Staff') {
		element = operators;
		staff = true;
	}
	
	if (element !== null) {
		if (users.length > 0) {
			$.each(users, function(key, visitor) {
				html = '';
				if (section === 'Online') {
					if (parseInt(visitor.Active, 10) === operator.id) {
						element = chatting;
					} else {
						element = otherchatting;
					}
				}
				hash = CryptoJS.MD5(visitor.Email);
				exists = false;
				$.each(element.find('.visitor'), function(key, chat) {
					var id = parseInt(visitor.ID, 10);
					if (id === $(chat).data('id')) {
						exists = true;

						// Messages
						if (section === 'Online') {
							var messages = parseInt(visitor.Messages, 10),
								currentMessages = $(chat).data('messages'),
								newMessages = messages - currentMessages,
								stack = $('.chat-stack'),
								top = stack.position().top,
								open = stack.find('.chat[data-id=' + id + ']').length,
								visible = (top < 0 || open === 0) ? false : true;

							if (newMessages > 0 && !visible) {
								$(chat).find('.message-alert').text(newMessages).fadeIn();
							}
						}
						return;
					}
				});

				if (!exists) {
					var name = ucwords(visitor.Name.toLowerCase());
					if (staff) {
						var accounts = $.jStorage.get('accounts', []),
							department = visitor.Department,
							access = (visitor.Access !== undefined) ? convertAccessLevel(visitor.Access) : '',
							css = '',
							status = parseInt(visitor.Status, 10);

						if (visitor.Firstname !== undefined && visitor.Firstname.length === 0) {
							$.each(accounts, function(index, account) {
								if (parseInt(account.ID, 10) === parseInt(visitor.ID, 10)) {
									name = account.Firstname;
									department = account.Department;
									access = convertAccessLevel(account.Privilege);
									return;
								}
							});
						} else {
							name = visitor.Firstname;
						}

						if (parseInt(visitor.ID, 10) === operator.id) {
							css = ' photo';
						}
						if (status === 1) {
							html = '<div class="visitor" data-id="' + visitor.ID + '" data-messages="0"><span class="image' + css + '" style="background-image:url(\'' + protocol + server + '/livehelp/image.php?ID=' + visitor.ID + '&SIZE=40\')"></span><span class="details name">' + name + '</span><span class="details department">' + department + '</span><span class="details accesslevel">' + access + '</span><span class="message-alert red" style="display:none">0</span></div>';
						}
					} else {
						var messages = parseInt(visitor.Messages, 10),
							id = parseInt(visitor.ID, 10);

						html = '<div class="visitor" data-id="' + id + '" data-messages="' + messages + '"><span class="image" style="background-image:url(\'https://secure.gravatar.com/avatar/' + hash + '?s=40&r=g&d=' + defaultimage + '\')"></span><span class="details name">' + name + '</span><span class="details department">' + visitor.Department + '</span><span class="details accesslevel">' + visitor.Server + '</span><span class="message-alert red" style="display:none">0</span></div>';
					
						// Stored Notifications
						var html5notify = $.jStorage.get('html5-notifications', false);
						exists = false;
						$.each(notifications, function (key, value) {
							if (value.id === id) {
								exists = true;
								return false;
							}
						});

						// Notifications
						if (section === 'Pending' || section === 'Transferred') {
							// Add Notification
							if (!exists && html5notify && window.webkitNotifications.checkPermission() === 0) {
								var text = name + ' is waiting for Live Chat';
								if (visitor.Department.length > 0) {
									text += ' (' + visitor.Department + ')';
								}
								var notification = window.webkitNotifications.createNotification(notificationIcon, section + ' Chat Request', text);

								notifications.push({id: id, section: section, notification: notification});
								notification.onclick = function (e) {
									var id = 0,
										chat = null;

									$.each(notifications, function (key, value) {
										id = value.id;
										if (id > 0) {
											chat = $('.pending .visitor[data-id=' + id + ']');
											if (chat && chat.length > 0) {
												acceptChat(chat);
											}
										}
									});
								};
								notification.show();
							}
						} else if (section === 'Online') {
							// Remove Notification
							$.each(notifications, function (key, value) {
								if (value.id === id) {
									value.notification.cancel();
									return false;
								}
							});
						}
					}

					// Pending / Transferred
					if (alert && pendingSound !== undefined) {
						pendingSound.play();
					}

				}
				if (html.length > 0) {
					element.find('.no-visitor').hide();
					var user = $(html).appendTo(element);
					$(user).data('user', visitor);
				}
			});
			
			// Adjust Height
			height = element.find('.visitor').length * 74;
			if (height > 0) {
				element.data('height', height);
				if (element.height() > 0) {
					element.animate({height:height}, 250, 'easeOutBack');
				}
			}

			// Adjust Chatting Height
			height = chatting.find('.visitor').length * 74;
			if (height > 0) {
				chatting.data('height', height);
				if (chatting.height() > 0) {
					chatting.animate({height:height}, 250, 'easeOutBack');
				}
			}
		} else {
			if (section != 'Pending' && section != 'Transferred') {
				clearUsers(element);
				if (section === 'Online') {
					clearUsers(chatting);
				}
			}

			// Remove Notifications
			if (section === 'Pending' || section === 'Transferred') {
				$.each(notifications, function (key, value) {
					if (value.section === section) {
						value.notification.cancel();
					}
				});
			}
		}
	}
}

var chattingVisitorHeight = 38;
var noVisitorsHeight = 38;

function clearUsers(element) {
	element.find('.visitor').remove();
	element.find('.no-visitor').show();
	element.height(noVisitorsHeight);
	element.data('height', noVisitorsHeight);
}

function removeVisitor(section, element) {
	// Remove Visitor
	element.remove();

	// Adjust Height
	height = section.find('.visitor').length * 74;
	if (height > 0) {
		if (section.height() > 0) {
			section.animate({height:height}, 250, 'easeOutBack');
		}
		section.data('height', height);
	}
}

var users = {},
	usersTimer;

function updateUsers(action, id, complete) {
	if (session.length > 0) {

		var url = (server.length > 0) ? protocol + server + '/livehelp/xml/WebService.php?Users' : service + '?Users';
			post = {'Session': session, 'Version': '4.0', 'Format': 'json'};

		// Validate Action / ID
		if (action !== undefined) {
			$.extend(post, {'Action': action});
		}
		if (id !== undefined) {
			$.extend(post, {'ID': id});
		}

		// Clear Timer
		window.clearTimeout(usersTimer);

		// Users AJAX
		$.ajax({url: url,
			data: post,
			type: 'POST',
			success: function (data) {
				updateUsersInterface(data, action, id);

				// Callback
				if (complete) {
					complete();
				}
			},
			dataType: 'json',
			error: function (jqXHR, textStatus, errorThrown) {
				usersTimer = window.setTimeout(updateUsers, 10000);
			}
		});
	}
}

function updateUsersInterface(data, action, id) {
	// Users JSON
	if (data.Users !== undefined) {

		// Users Event
		$(document).trigger('LiveHelp.UsersCompleted', { newUsers: data.Users, previousUsers: users });

		users = data.Users;

		// Remove Chatting Users
		var operators = $('.operators .visitor'),
			chatting = $('.chatting .visitor, .other-chatting .visitor'),
			pending = $('.pending .visitor'),
			section = $('.operators.list'),
			chatid = id;
		
		// Operators
		var staff = 0;
		$.each(operators, function (key, value) {
			var element = $(value),
				id = element.data('id'),
				exists = false;
			
			$.each(users.Staff.User, function(key, value) {
				if (parseInt(value.ID, 10) === id && parseInt(value.Status, 10) === 1) {
					exists = true;
					staff++;
				}
			});
			
			if (!exists) {
				removeVisitor(section, element);
			}
			
		});

		// Clear Operators
		if (staff === 0) {
			clearUsers(section);
		}

		// Check Accepted
		$.each(users.Online.User, function(key, value) {
			if (action === 'Accept' && chatid === parseInt(value.ID, 10) && parseInt(value.Active, 10) === operator.id) {
				openChat(id, value);
			}
		});

		// Chatting
		section = $('.chatting.list');
		if (chatting.length > 0) {
			var chats = 0;
			$.each(chatting, function (key, value) {
				var element = $(value),
					id = element.data('id'),
					exists = false;
				
				$.each(users.Online.User, function(key, value) {
					if (parseInt(value.ID, 10) === id) {
						exists = true;
					}
					if (parseInt(value.Active, 10) === operator.id) {
						chats++;
					}
				});
				
				if (!exists) {
					removeVisitor(section, element);
				}
				
			});

			if (chats === 0) {
				clearUsers(section);
			}

		} else {
			clearUsers(section);
		}
		
		// Pending / Transferred Notification
		if (users.Pending.User.length > 0) {
			showPendingNotification(users.Pending.User);
		} else {
			closeNotification();
		}

		// Pending / Transferred
		section = $('.pending.list');
		if (pending.length > 0) {
			$.each(pending, function (key, value) {
				var element = $(value),
					id = element.data('id'),
					exists = false,
					total = users.Pending.User.length + users.Transferred.User.length;
				
				$.each(users.Pending.User, function(key, value) {
					if (parseInt(value.ID, 10) === id) {
						exists = true;
						return false;
					}
				});
				
				$.each(users.Transferred.User, function(key, value) {
					if (parseInt(value.ID, 10) === id) {
						exists = true;
						return false;
					}
				});
				
				if (!exists) {
					removeVisitor(section, element);
				}

				if (total === 0) {
					clearUsers(section);
				}
			});
		} else {
			clearUsers(section);
		}

		// Add Visitors
		$.each(users, function(key, user) {
			updateUser(key, user.User);
		});

	}
	usersTimer = window.setTimeout(updateUsers, 10000);
}

function convertAccessLevel(access) {
	var privilege = parseInt(access, 10);
	switch (privilege) {
		case -1:
		case 0:
			access = 'Full Administrator';
			break;
		case 1:
			access = 'Department Administrator';
			break;
		case 2:
			access = 'Limited Administrator';
			break;
		case 3:
			access = 'Sales / Support Staff';
			break;
		case 4:
			access = 'Guest';
			break;
	}
	return access;
}

// Open Chat
function openChat(id, user) {
	var stack = $('.chat-stack'),
		chats = stack.find('.chat'),
		html = '<div class="chat" style="left:0; bottom:0; background-color:#ffffff; z-index:500" data-id="' + id + '"><div class="name"></div><span class="message-alert red" data-total="0" style="bottom:10px; right:7px; top:auto; display:none">2</span><div class="inputs"><div class="close"></div><div class="title"><span style="background: url(http://' + server + '/livehelp/image.php?SIZE=50) #fff; width:50px; height:50px; float:left; margin:5px 10px; display:block"></span><span class="title"><span></div><div class="scroll"><div class="messages"></div><div class="end"></div></div></div></div>',
		exists = false,
		collapsed = false;

	// Check Exists
	$.each(chats, function (key, value) {
		var chat = $(value),
			data = chat.data('id');
			
		if (data === id) {
			exists = true;
		}
		if (chat.height() === 0) {
			collapsed = true;
		}
	});

	// Add New Chat
	if (!exists) {
		$.each(chats, function (key, value) {
			var chat = $(value),
				zindex = chat.css('z-index'),
				left = parseInt(chat.css('left'), 10),
				name = chat.find('.name'),
				inputs = chat.find('.inputs, input'),
				data = chat.data('id');
			
			if (key === 0) {
				chat.css({'bottom': 2 + 'px', 'background-color': '#fafafa', 'left': left + 35 + 'px'});
			} else {
				chat.css({'bottom': 4 + 'px', 'background-color': '#f6f6f6', 'left': left + 35 + 'px'});
			}
			chat.css('z-index', zindex - 10);
			
			name.show();
			inputs.hide();
		});
		$(html).prependTo(stack);
		
	} else {
		if (collapsed) {
			$.each(chats, function (key, value) {
				var element = $(value),
					left = parseInt(element.css('left'), 10),
					height = element.height();

				if (height > 0) {
					if (left === 0) {
						element.find('.name').show();
						element.find('.close, .inputs').hide();
					}
					element.animate({left: left + 35}, 250);
				} else {
					element.css({height: 'auto'});
				}
			});
		}
	}

	// Open Chat Stack
	var height = $(document).height() - 10,
		chat = stack.find('.chat[data-id=' + id + ']'),
		name = ucwords(user.Name),
		title = (user.Email.length > 0) ? name + ' - ' + user.Email : name;
	
	chat.find('.name').text(name).hide();
	chat.find('.inputs').show();
	chat.find('.title').text(title);
	chat.data('closed', false);
	stack.find('.typing .name').text(name);
	
	if (parseInt(stack.css('top'), 10) !== 0) {
		chat.click();
		stack.animate({top:0, bottom:chatstack.bottom, opacity:1, height:height}, 250, function () {
			$(this).css({height:'auto'});
		});
	} else {
		var left = parseInt(chat.css('left'), 10);
		if (left === 0) {
			var delay = 50,
				easing = 'easeOutBack';
			for (i = 0; i < 3; i++) {
				chat.animate({'bottom': -5}, delay, easing).delay(delay).animate({'bottom': 0}, delay, easing);
			}
			chat.find('#message').focus();
		} else {
			chat.click();
		}
	}

	// Update Typing
	var typingstatus = stack.find('.typing');
	$.each(activechats, function(key, value) {
		if (value.id !== undefined && value.id == id && value.typing) {
			typingstatus.show();
			return false;
		} else {
			typingstatus.hide();
		}
	});

	// Close Smilies
	$('.chat-stack .smilies.button').close();

	// Check Blocked Chat
	checkBlocked(id);

	// Clear Message Alert
	var visitor = $('.visitor[data-id=' + id + ']'),
		alert = visitor.find('.message-alert'),
		messages = parseInt(visitor.data('messages'), 10) + parseInt(alert.text(), 10);

	visitor.data('messages', messages);
	alert.fadeOut();
}

// Close Chat
function closeChats() {
	var stack = $('.chat-stack'),
		height = stack.height();

	// Close Smilies
	$('.chat-stack .smilies.button').close();
	
	// Close Chats
	stack.animate({top:-height, bottom:30 + height}, 250);
	return false;
}

// Pending Notification
function showPendingNotification(users) {
	var alert = $('.notification'),
		title = 'Pending Chat',
		notify = '',
		name = '',
		server = '';

	if (users.length > 1) {
		title = 'Pending Chats';
		notify = users.length + ' visitors are pending for Live Chat';
	} else if (users.length === 1) {
		name = ucwords(users[0].Name.toLowerCase());
		server = users[0].Server;
		if (server.length > 0) {
			notify = name + ' is pending for Live Chat at ' + server;
		} else {
			notify = name + ' is pending for Live Chat';
		}
	}

	alert.off('click');
	alert.on('click', function () {
		if (users.length === 1) {
			var id = parseInt(users[0].ID, 10),
				chat = $('.pending .visitor[data-id=' + id + ']');

			acceptChat(chat);
		}
	});

	// Show Notification
	if (notify.length > 0) {
		if (alert.find('.icon').css('background-image').indexOf('ChatNotification.png') === -1) {
			alert.find('.icon').css({'background-image': 'url(images/ChatNotification.png)', 'width': '36px', 'height': '26px'});
		}
		alert.find('.notify').text(title);
		alert.find('.notify').text(notify);
		showNotification({title: title, text: notify, users: users});
	}
}

// Notification
var notificationUsers = [];
function showNotification(obj) {

	var shown = false;
	$.each(obj.users, function (key, value) {
		var id = parseInt(value.ID, 10),
			exists = false;
		
		$.each(notificationUsers, function (index, user) {
			if (id === user) {
				exists = true;
				return false;
			}
		});

		if (!exists) {
			notificationUsers.push(id);
		} else {
			shown = true;
		}
	});
	if (!shown) {
		if (notification) {
			$('.notification').animate({ top: -20 }, 250, 'easeInOutBack');
		}
		$(document).trigger('LiveHelp.Notification', obj);
	}
}

function closeNotification() {
	notificationUsers = [];
	var alert = $('.notification'),
		top = parseInt(alert.css('top'), 10);

	if (top >= -20) {
		alert.animate({top:-80}, 500,'easeInOutBack');
	}
}

function sendMessage(message) {
	var url = (server.length > 0) ? protocol + server + '/livehelp/xml/WebService.php?Send' : service + '?Send',
		textarea = $('.chat-stack textarea'),
		chats = $('.chat-stack .chat'),
		id = 0,
		text = (message !== undefined) ? message : textarea.val(),
		post = {'Session': session, 'Message': text, 'Staff': 0, 'Version': '4.0', 'Format': 'json'};

	$.each(chats, function (key, value) {
		if ($(value).position().left === 0) {
			id = $(value).data('id');
			return;
		}
	});

	if (id > 0) {
		post.ID = id;
		$.ajax({url: url,
			data: post,
			type: 'POST',
			success: function (data) {
				//console.log(data);
			},
			dataType: 'json'
		});
		textarea.val('');
	}
	return false;
}

function sendCommand(id, type, name, content) {
	var url = (server.length > 0) ? protocol + server + '/livehelp/xml/WebService.php?Send' : service + '?Send',
		post = {'Session': session, 'ID': id };

	type = (type !== undefined) ? type : '';
	name = (name !== undefined) ? name : '';
	content = (content !== undefined) ? content : '';
	$.extend(post, {'Type': type, 'Name': name, 'Content': content, 'Staff': '0', 'Version': '4.0', 'Format': 'json'});
	
	$.ajax({url: url,
		data: post,
		type: 'POST',
		success: function (data) {
			//console.log(data);
		},
		dataType: 'json'
	});
	
	return false;
}

function filterResponses() {
	var keyword = $('#responses #search').val(),
		keywords = (keyword !== undefined && keyword.length > 0) ? keyword.split(' ') : '',
		success = [],
		failure = [],
		types = ['Text', 'Hyperlink', 'Image', 'PUSH', 'JavaScript'];
	
	if (keywords.length > 0) {
		$.each(responses, function(type, value) {
			if ($.inArray(type, types) > -1) {
				$.each(value, function(key, response) {
					var id = parseInt(response.ID, 10),
					found = false;
					
					$.each(keywords, function(key, word) {
						if (response.Name.toLowerCase().indexOf(word) > -1 || response.Content.toLowerCase().indexOf(word) > -1) {
							found = true;
							return false;
						}
					});
					
					if (found) {
						success.push(id);
					} else {
						failure.push(id);
					}
				});
			}
		});
	}
	
	if (responses.length === 0) {
		success.push(failure);
	}
	
	var elements = $('#responses .response');
	if (success.length === 0 && failure.length === 0) {
		elements.show();
	} else {
		$.each(success, function(key, value) {
			elements.filter('[data-id=' + value + ']').show();
		});
		
		$.each(failure, function(key, value) {
			elements.filter('[data-id=' + value + ']').hide();
		});
	}
}

function processEscKeyDown() {
	var sliders = $('.slider.right'),
		visitor = $('#visitor-details'),
		account = $('#account-details'),
		settings = $('#settings'),
		accountgrid = $('.accounts-grid'),
		zindex = 0,
		top = null;

	// Close Settings
	if (settings.height() > 0 && settings.width() > 0) {
		closeSettings();
		return;
	}

	// Close Right Sliders
	$.each(sliders, function (key, value) {
		var element = $(value),
			i = parseInt(element.css('z-index'), 10);

		if (element.width() > 0 && i > zindex) {
			top = element;
			zindex = i;
		}
	});
	
	// Close Slider
	if (top !== null) {
		var id = top.attr('id');
		switch (id) {
			case 'responses':
				closeResponses();
				break;
			case 'visitor-details':
				closeVisitor();
				break;
			case 'account-details':
				if (accountgrid.is(':visible') === false) {
					showAccounts();
				}
				if (account.is(':visible') && account.width() > 0) {
					closeAccount();
				}
				break;
			case 'history-chat':
				closeHistory();
				break;
		}
		return;
	}
	
	// Close Chats
	if (parseInt($('.chat-stack').css('top'), 10) === 0) {
		closeChats();
		return;
	}
}

var responses = {},
	tags = [];

function updateResponses(responses) {
	var element = $('#responses .scroll #response-list'),
		types = ['Text', 'Hyperlink', 'Image', 'PUSH', 'JavaScript', 'Other'],
		sections = {};
	
	$('.chat-stack .options.dropdown-menu > li').filter('.text, .hyperlink, .image, .push, .javascript').find('> .dropdown-menu').remove();
	element.html('');

	$.each(responses, function(type, value) {
		if ($.inArray(type, types) > -1) {
			var origtype = (type === 'PUSH' || type === 'Hyperlink') ? '<span style="position: absolute; right: 40px">' + type + '</span>' : '';
			type = type.toLowerCase();
			$('<div class="' + type + '" />').appendTo(element);
			if (sections[type] === undefined) {
				sections[type] = $('#response-list .' + type);
			}
			var menu = $('.chat-stack .options.dropdown-menu .' + type);
			if (value.length > 0 && menu.find('ul').length === 0) {
				menu.addClass('dropdown-submenu');
				$('<ul class="dropdown-menu"></ul>').appendTo(menu);
			}
			menu = menu.find('.dropdown-menu');

			// Custom Responses
			var custom = false;
			if (value.length > 0 && value[0].Custom !== undefined) {
				value = value[0].Custom;
				custom = true;
			}

			$.each(value, function(key, response) {
				if (key == 'Description') {
					var optionsmenu = $('.chat-stack .options.dropdown-menu'),
						parent = optionsmenu.find('.other.menuitem');

					parent.find('> a').text(response);
					parent.show();
					optionsmenu.find('.other.divider').show();
				} else {
					var id = parseInt(response.ID, 10),
						tag = '',
						css = 'display: none',
						content = response.Content,
						submenu = $('<li class="responseitem submenu"><a href="#">' + response.Name + '</a></li>');

					submenu.data('response', response);
					if (response.Category.length > 0) {
						var menus = menu.find('li.' + type + '.category a'),
							exists = false;

						$.each(menus, function(key, value) {
							var category = $(value);
							if (category.text() === response.Category) {
								exists = category;
								return;
							}
						});
						if (!exists) {
							var category = $('<li class="' + type +' category dropdown-submenu"><a href="#">' + response.Category + '</a><ul class="dropdown-menu"></ul></li>');
							submenu.appendTo(category.find('.dropdown-menu'));
							category.appendTo(menu);
						} else {
							submenu.appendTo(exists.parent().find('ul.dropdown-menu'));
						}
					} else {
						submenu.appendTo(menu);
					}

					if (response.Tags !== undefined) {
						if (response.Tags.length > 0) {
							$.each(response.Tags, function(key, tag) {
								tag = tag.toLowerCase();
								if ($.inArray(tag, tags) === -1) {
									tags.push(tag);
								}
							});
							css = 'display: inline-block';
							tag = response.Tags.join(', ');
						} else {
							css = 'display: none';
						}
					}

					content = content.replace(/^(https?|ftp|file):\/\/[\-A-Z0-9+&@#\/%?=~_|!:,.;]*[A-Z0-9+&@#\/%=~_|](\.jpg|.jpeg|\.gif|\.png)$/img, '<img src="$&" style="max-width: 300px"/>');

					$('<div class="response" data-id="' + id + '"><div class="label">' + response.Name + origtype + '</div><div class="edit" title="Edit Response"></div><div class="content">' + content + '</div><div class="tags"><span class="tag-icon" style="' + css + '"></span><span class="tag">' + tag + '</span></div><div class="send" title="Send Response"></div></div>').appendTo(sections[type]);
				}
			});
		}
	});
}

function loadResponses() {
	if (session.length > 0) {
		// Responses AJAX
		var url = (server.length > 0) ? protocol + server + '/livehelp/xml/WebService.php?Responses' : service + '?Responses',
			post = 'Session=' + session + '&Version=4.0&Format=json';
		
		$.ajax({url: url,
			data: post,
			type: 'POST',
			success: function (data) {
				// Responses JSON
				if (data !== undefined && data.Responses !== undefined) {
					responses = data.Responses;
					updateResponses(responses);
				}

				// Responses Events
				$('.responseitem.submenu').on('click', function () {
					var response = $(this).data('response'),
						type = 'Text';

					switch (response.Type) {
						case 2:
							type = 'Hyperlink';
							break;
						case 3:
							type = 'Image';
							break;
						case 4:
							type = 'PUSH';
							break;
						case 5:
							type = 'JavaScript';
							break;
					}
					sendResponse(type, response);
				});
			},
			dataType: 'json'
		});
	}
}

function updateTotal(element, total) {
	var current = parseInt(element.data('total'), 10);
	if (total !== current) {
		element.animate({height: 0}, 350, 'easeInOutBack', function () {
			element.text(total);
			element.animate({height: 38}, 350, function () {
				element.data('total', total);
			});
		});
	}
}

function toggleChatMenu(menu, height) {
	var css = 'expander sprite sort-desc',
		id = menu.attr('id');
	
	if (height > 0) {
		css = 'expander sprite sort-asc';
	}
	$.jStorage.set(id + '.height', height);

	menu.animate({height:height}, 250, 'easeOutBack', function () {
		if (height > 0) {
			menu.show();
		} else {
			menu.hide();
		}
		$(this).prev().find('.expander').removeAttr('class').addClass(css);
	});
}

function openHistory() {
	$('.visitors-grid, .visitors-empty, .visitors-menu, .worldmap, .statistics').fadeOut();
	$('.history').fadeIn(function () {
		if (historyChartData.length > 0) {
			showHistoryChart();
		}
	});
	initHistoryGrid();
}

function openStatistics() {
	$('.visitors-grid, .visitors-empty, .visitors-menu, .worldmap, .history').fadeOut();
	$('.statistics').fadeIn(function () {
		if (ratingChartData.length > 0) {
			showRatingChart();
		}
		if (weekdayChartData.length > 0) {
			showWeekdayChart();
		}
	});
}

var previousMenu = '';

function switchMenu(type) {
	var popout = '',
		menu = ['home', 'statistics', 'history'];

	// Switch Menu
	switch (type) {
		case 'home':
			openHome();
			previousMenu = type;
			break;
		case 'statistics':
			openStatistics();
			previousMenu = type;
			break;
		case 'history':
			openHistory();
			previousMenu = type;
			break;
		case 'responses':
			openResponses();
			popout = type;
			break;
		case 'accounts':
			openAccounts();
			popout = type;
			break;
		case 'settings':
			openSettings();
			popout = type;
			break;
	}

	$(document).trigger('LiveHelp.MenuChanged', type);
	
	// Popout
	if (popout.length > 0) {
		$.jStorage.set('popout', popout);
	}

	// Highlight Menu
	var menus = $('.menu li a');
	menus.removeClass('selectedMenu');
	menus.filter('[data-type=' + type + ']').addClass('selectedMenu');
}

function switchPreviousMenu() {
	// Reset Popout
	$.jStorage.set('popout', '');

	// Select Previous Menu
	if (previousMenu.length > 0) {
		var menus = $('.menu li a');
		menus.removeClass('selectedMenu');
		menus.filter('[data-type=' + previousMenu + ']').addClass('selectedMenu');
	}
}

// Settings
function loadLocalSettings() {

	// Chatting / Pending Lists
	var lists = [{id: 'operators', height: 38}, {id: 'chatting', height: 38}, {id: 'other-chatting', height: 0}, {id: 'pending', height: 38}];
	$.each(lists, function (key, value) {
		var height = $.jStorage.get(value.id + '.height', value.height),
			menu = $('#' + value.id);
			
		toggleChatMenu(menu, height);
	});
	
	// Settings
	var menu = $.jStorage.get('menu', 'home');
	switchMenu(menu);

	// Popout
	var popout = $.jStorage.get('popout');
	switch (popout) {
		case 'responses':
			openResponses();
			break;
		case 'accounts':
			openAccounts();
			break;
		case 'settings':
			openSettings();
			break;
	}
	
}


var session = '',
	factor = '',
	error = false;

function signInComplete() {

	// Complete Login
	$('.login').fadeOut();
	$('.content').animate({ opacity: 1.0 }, 250);

	// Notification
	$(document).trigger('LiveHelp.SignInCompleted');

	// Operator Access
	if (operator.access > 3) {
		$('.menu a[data-type=statistics]').parent().hide();
		$('.menu a[data-type=history]').parent().hide();
		$('.menu a[data-type=accounts]').parent().hide();
	}

	// Setup Sounds
	if (messageSound === undefined) {
		messageSound = new buzz.sound('../sounds/New Message', {
			formats: ['ogg', 'mp3', 'wav'],
			volume: 100
		});
	}
	if (pendingSound === undefined) {
		pendingSound = new buzz.sound('../sounds/Pending Chat', {
			formats: ['ogg', 'mp3', 'wav'],
			volume: 100
		});
	}

	// Update Operator Details
	operator = $.jStorage.get('operator');
	if (operator !== undefined) {
		$('.operator .photo').css('background-image', 'url(http://' + server + '/livehelp/image.php?ID=' + operator.id + '&SIZE=50)');
		$('.operator .name').text(operator.name);
	}

	// Clear Login
	$('.login').find('input[type!=reset][type!=submit], select').val('');

	// Local Settings
	loadLocalSettings();

	// Update Users
	updateUsers();

	// Update Visitors
	updateVisitorsGrid();

	// Statistics Chart
	loadStatisticsChartData();

	// Accounts
	initAccountsGrid(false);

	// Responses
	loadResponses();

	// World Map / Locations
	initWorldMap();

	// Settings
	var url = (server.length > 0) ? protocol + server + '/livehelp/xml/WebService.php?Settings' : service + '?Settings',
	post = {'Session': session, 'Version': '4.0', 'Format': 'json'};

	// Settings AJAX
	$.ajax({url: url,
		data: post,
		type: 'POST',
		success: function (data) {
			// Settings JSON
			if (data.Settings !== undefined) {
				loadSettings(data.Settings);

				$(document).trigger('LiveHelp.SettingsInitialised', data.Settings);

				// Update Menu / Events
				var dropdown = $('.chat-stack .dropdown-menu.options');
				$('.chat-stack .dropdown-toggle.options').click(function () {
					// Offline Email
					var menu = dropdown.find('.EmailChatOffline');
					menu.text('Offline Email Address (' + data.Settings.Email + ')');

					// Visitors Email
					var chats = $('.chat-stack .chat'),
						visitors = $('.chatting .visitor'),
						id = 0;

					$.each(chats, function (key, value) {
						if ($(value).position().left === 0) {
							id = $(value).data('id');
							return;
						}
					});
					menu.data('id', id);

					$.each(visitors, function (key, value) {
						if ($(value).data('id') === id) {
							var email = $('.chatting .visitor[data-id="' + id + '"]').data('user').Email,
								menu = dropdown.find('.EmailChatVisitor');

							menu.text('Visitor\'s Email Address (' + email + ')').data('email', email);
							menu.data('id', id);
							return;
						}
					});

				});
				dropdown.find('.Close').click(function () {
					// Close Chat
					closeChat();
				});
				dropdown.find('.Block').click(function () {
					// Block Chat
					blockChat();
				});
				dropdown.find('.EmailChatOffline').click(function () {
					emailChat($(this).data('id'), '');
				});
				dropdown.find('.EmailChatVisitor').click(function () {
					emailChat($(this).data('id'), $(this).data('email'));
				});
			}
		},
		dataType: 'json'
	});
}

function closeChat() {
	var chats = $('.chat-stack .chat'),
		move = [],
		chat = null,
		id = 0;

	$.each(chats, function (key, value) {
		var element = $(value),
			left = element.position().left;

		if (left === 0) {
			id = element.data('id');
			chat = value;
			return;
		}
	});

	if (chat !== null) {

		// Show Dialog
		var dialog = $('.chat-stack .dialog');
		dialog.find('.progressring img').attr('src', 'images/ProgressRing.gif');
		dialog.find('.dialog-title').text('Closing Chat Session');
		dialog.find('.dialog-description').text('One moment while the chat session is closed.');
		dialog.show().animate({bottom: '1px'}, 250);

		// Close Chat AJAX
		updateUsers('Close', id, function () {

			// Hide Dialog
			dialog.animate({bottom: '-145px'}, 250, function () {
				$(this).hide();
			});

			if (chats.length > 1) {
				$.each(chats, function (key, value) {
					var chat = $(value),
						left = chat.position().left,
						height = chat.height();

					if (left === 0) {
						chat.animate({height:-height}, 250, function() {
							$(this).remove();
						});
						chat.find('.inputs').hide();
						return;
					} else {
						if (left == 35) {
							// Update Chat Name
							chat.find('.name').hide();
							chat.find('.inputs').show();
						}
						// Animate Other Chats
						chat.animate({left:left-35}, 250);
					}
				});
			} else {
				chats.remove();
				closeChats();
			}

			// Remove Chat
			chats = [];
			$.each(activechats, function (key, message) {
				if (message.id !== id) {
					chats.push(message);
					return;
				}
			});
			activechats = chats;

			$(document).trigger('LiveHelp.CloseChatCompleted');

		});
		return;
	}

}

function blockChat() {
	var chats = $('.chat-stack .chat'),
		move = [],
		chat = null,
		id = 0;

	$.each(chats, function (key, value) {
		var element = $(value),
			left = element.position().left;

		if (left === 0) {
			id = element.data('id');
			chat = value;
			return;
		}
	});

	if (chat !== null) {
		// Show Dialog
		var dialog = $('.chat-stack .dialog');
		dialog.find('.progressring img').attr('src', 'images/ProgressRing.gif');
		dialog.find('.dialog-title').text('Blocking Chat Session');
		dialog.find('.dialog-description').text('One moment while the chat session is blocked.');
		dialog.show().animate({bottom: '1px'}, 250);

		// Block Chat AJAX
		updateUsers('Block', id, function () {
			// Hide Dialog
			dialog.find('.progressring img').attr('src', 'images/Block.png');
			dialog.find('.unblock').fadeIn();
			dialog.find('.dialog-title').text('Chat Session Blocked');
			dialog.find('.dialog-description').text('The chat session is blocked and inactive.');

			var chat = null,
				exists = false,
				chats = [];

			$.each(activechats, function (key, message) {
				if (message.id === id) {
					chat = message;
				} else {
					chats.push(message);
				}
			});
			activechats = chats;
			
			$.each(blockedchats, function (key, message) {
				if (message.id === id) {
					exists = true;
					return;
				}
			});

			if (!exists) {
				// Blocked Chat
				if ($.inArray(id, blockedchats) === -1) {
					blockedchats.push(chat);
				}
			}

		});
	}
}

function unblockChat(id, dialog) {
	var blocked = [];

	// Update Dialog
	dialog.find('.progressring img').attr('src', 'images/ProgressRing.gif');
	dialog.find('.dialog-title').text('Unblocking Chat Session');
	dialog.find('.dialog-description').text('One moment while the chat session is unblocked.');

	// Unlock Chat AJAX
	updateUsers('Unblock', id, function () {

		// Hide Dialog
		dialog.find('.progressring img').fadeOut();
		dialog.find('.dialog-title').text('Chat Session Unblocked');
		dialog.find('.dialog-description').text('The chat session is nunblocked and can now request Live Chat.');
		dialog.animate({bottom: '1px'}, 250, function () {
			dialog.find('.unblock').hide();
			dialog.hide();
		});

		// Remove Blocked Chat
		$.each(blockedchats, function (key, chat) {
			if (chat.id === id) {
				exists = true;
				return;
			} else {
				blocked.push(chat);
			}
		});
		blockedchats = blocked;
	});

}

function emailChat(id, email) {
	var url = (server.length > 0) ? protocol + server + '/livehelp/xml/WebService.php?EmailChat' : service + '?EmailChat',
	post = {'Session': session, 'ID': id, 'Email': email, 'Version': '4.0', 'Format': 'json'};

	// Email Chat AJAX
	$.ajax({url: url,
		data: post,
		type: 'POST',
		success: function (data) {
			// TODO Email Chat Result
		},
		dataType: 'json'
	});
}

function signInError(xhr) {
	var login = $('.login, .inputs'),
		error = $('.login .error .text');

	if (xhr.status === 503 && xhr.statusText === 'License Invalid') {
		error.text('License Invalid');
		cache = true;
	} else if (xhr.getResponseHeader('X-Disabled') === '*') {
		error.text('Account Disabled');
	} else {
		error.text('Incorrect Username / Password');
	}

	login.find('.error').fadeIn();
	login.effect('shake', {times:3, distance: 10}, 150);
	error = true;
}

function signIn() {

	if (session.length > 0 && factor.length > 0) {
		twofactorAuth();
		return;
	}

	var login = $('.login');

	// Update Server
	server = login.find('input#server').val();
	protocol = login.find('input#ssl').is(':checked') ? 'https://' : 'http://';
	if ($.jStorage.get('server', '').length > 0) {
		server = $.jStorage.get('server', '');
		protocol = $.jStorage.get('protocol', 'http://');
	}

	if (document.location.protocol == 'https:') {
		protocol = 'https://';
		$.jStorage.set('protocol', protocol);
	}

	var url = (server.length > 0) ? protocol + server + '/livehelp/xml/WebService.php?Login' : service + '?Login',
		user = login.find('input#username').val(),
		pass = login.find('input#password').val(),
		status = login.find('select#status').val(),
		post = {'Version': '4.0', 'Format': 'json'};

	if (user.length > 0 && pass.length > 0) {
		$.extend(post, {'Username': user, 'Password': pass, 'Action': status});
	} else {
		// Sign In / Saved Session
		var autoLogin = $.jStorage.get('session', '');
		if (autoLogin.length > 0) {
			$.extend(post, {'Session': autoLogin});
		}
		server = $.jStorage.get('server', '');
		protocol = $.jStorage.get('protocol', 'http://');
	}

	if (server.length === 0) {
		var path = (document.location.pathname.indexOf('/livehelp') > 0) ? document.location.pathname.substring(0, document.location.pathname.indexOf('/livehelp')) : '';
		server = document.location.host + path;
	}

	if (cache) {
		$.extend(post, {'cache': ''});
	}

	$.ajax({url: url,
		data: post,
		type: 'POST',
		success: function (data) {
			// Login JSON
			if (data.Login !== undefined) {
				if (data.factors !== undefined) {
					var factors = data.factors,
						twofactor = $('.twofactor'),
						code = $('.twofactorcode'),
						available = {push: false, token: true, sms: false, telephone: false},
						height = 220;
					
					// Operator Session
					session = data.Login.Session;
					cache = false;
					
					$.each(factors, function(key, value) {
						var factor = value.factor;
						
						if (factor.indexOf('push') !== -1) {
							available.push = true;
						} else if (factor.indexOf('token') !== -1) {
							available.token = true;
						} else if (factor.indexOf('sms') !== -1) {
							available.sms = true;
							code.find('.hint-sms').text(value.details);
						} else if (factor.indexOf('telephone') !== -1) {
							available.telephone = true;
						}
					});
					
					$.each(available, function(key, factor) {
						if (!factor) {
							twofactor.find('.factor[data-factor=' + key + ']').hide();
						}
					});
					
					if (error) {
						height = height - 25;
					}
					
					login.find('.btn-toolbar .signin').text('Authenticate');
					login.find('.inputs').animate({height: $('.login .inputs').height() + height}, 250);
					login.find('.inputs .error').fadeOut();
					$('.twofactorparent').fadeIn();
				} else {

					// Operator Session
					if (data.Login.Session.length > 0) {
						// Operator Session
						session = data.Login.Session;

						$(document).trigger('LiveHelp.LoginComplete', session);

						// Username / Password
						operator = {id: data.Login.ID, username: user, name: data.Login.Name, access: parseInt(data.Login.Access, 10)};

						// Sign In / Saved Session
						$.jStorage.set('protocol', protocol);
						$.jStorage.set('server', server);
						$.jStorage.set('session', session);
						$.jStorage.set('operator', operator);

						// Complete Sign In
						signInComplete();

						// Update Status Mode
						var status = 'Offline (Hidden)';
						switch(data.Login.Status) {
						case 1:
							status = 'Online';
							break;
						case 2:
							status = 'BRB';
							break;
						case 3:
							status = 'Away';
							break;
						}

						status = (status === 'BRB') ? 'Be Right Back' : status;
						$('.operator .status').text(status);

					}
				}
				
			}
		},
		error: function (xhr, ajaxOptions, thrownError) {
			signInError(xhr);
		},
		dataType: 'json'
	});
}

function signOut() {

	// Notification
	$(document).trigger('LiveHelp.SignOut');

	// Reset Authentication
	session = '';
	$.jStorage.set('protocol', '');
	$.jStorage.set('server', '');
	$.jStorage.set('session', '');
	$.jStorage.set('accounts', '');
	$.jStorage.set('operator', '');

	// Refresh
	document.location.href = 'index.html';

	// Hide Loading
	$('.loading').hide();

	// Hide Content / Show Login
	$('.content').animate({opacity: 0}, 250);
	$('.login').fadeIn();

}

function twoFactorError() {
	var login = $('.login .inputs'),
		twofactor = $('.twofactorcode');
	
	login.effect('shake', {times:3, distance: 10}, 150);
	twofactor.find('.status').hide();
	//twofactor.find('.code label').css('margin', '10px 0');
	twofactor.find('.code').fadeIn();
}

function twofactorAuth() {
	var url = (server.length > 0) ? protocol + server + '/livehelp/admin/duo/index.php' : './duo/index.php',
		twofactor = $('.twofactorcode'),
		factorinput = twofactor.find('#twofactor'),
		code = factorinput.val(),
		post = '';

	// Operator Session
	if (session.length > 0) {
		post = 'session=' + session;
	} else {
		return;
	}

	// Two Factor Authentication Type
	if (factor.length > 0) {
		post += '&factor=' + factor;
		if (factor === 'token' || factor === 'sms') {
			twofactor.find('.code').fadeOut(function () {
				twofactor.find('.status span').text('Authenticating...');
				twofactor.find('.status').fadeIn();
			});
		}
	}
	factorinput.val('');
	
	// Two Factor Code
	if (code.length > 0) {
		post += '&code=' + code;
	}

	// Update Status
	twofactor.find('.status img').animate({opacity: 0.5}, 250);

	$.ajax({url: url,
		data: post,
		type: 'POST',
		success: function (data) {
			var twofactor = $('.twofactorcode'),
				status = twofactor.find('.status');
		
			// Two Factor Auth. JSON
			if (data.result !== undefined) {
				status.find('img').animate({opacity: 0}, 250);
				twofactor.find('.code label').text(data.status);
				if (data.result == 'allow') {
					twoFactorComplete();
				} else {
					twoFactorError();
				}
				return;
			}
			
			// Operator Session
			if (data.session.length > 0) {
				session = data.session;
				window.setTimeout(twofactorStatus, 2000);
			}
		},
		dataType: 'json'
	});
}

function twofactorStatus() {
	var url = (server.length > 0) ? protocol + server + '/livehelp/admin/duo/index.php' : './duo/index.php',
		post = '';

	// Operator Session
	if (session.length > 0) {
		post = 'session=' + session;
	} else {
		return;
	}

	$.ajax({url: url,
		data: post,
		type: 'POST',
		success: function (data) {
			var twofactor = $('.twofactorcode .status');
			
			// Two Factor Auth. JSON
			if (data.result !== undefined) {
				twofactor.find('img').animate({opacity: 0}, 250);
				twofactor.find('label').text(data.status);
				if (data.result === 'allow') {
					twoFactorComplete();
				} else {
					twoFactorError();
				}
			} else {
				window.setTimeout(twofactorStatus, 2000);
			}
			twofactor.find('label').text(data.status);
		},
		dataType: 'json'
	});
}

function twoFactorComplete() {
	$('.login').fadeOut();
	$('.content').animate({opacity: 1.0}, 250);
}

var messageSound,
	pendingSound;

function convertHostname(value) {
	var hostname = value.Hostname,
		username = ucwords(value.Username);
	if (username !== null && username.length > 0) {
		hostname = username + ' - ' + hostname;
	}
	return hostname;
}

function convertBrowserIcon(value, small) {
	var browser = 'Chrome',
		image = '';

	if (value.indexOf('MSIE') !== -1) {
		browser = 'InternetExplorer';
	} else if (value.indexOf('Chrome') !== -1) {
		browser = 'Chrome';
	} else if (value.indexOf('Opera') !== -1) {
		browser = 'Opera';
	} else if (value.indexOf('Safari') !== -1) {
		browser = 'Safari';
	} else if (value.indexOf('Firefox') !== -1) {
		browser = 'Firefox';
	}
	
	if (small) {
		image = './images/' + browser + 'Small.png';
	} else {
		image = './images/' + browser + '.png';
	}
	return image;
}

function convertReferrer(referrer) {
	var regEx = /^http[s]{0,1}:\/\/(?:[^.]+[\\.])*google(?:(?:.[a-z]{2,3}){1,2})[\/](?:search|url|imgres|aclk)(?:\?|.*&)q=([^&]*)/i;
	var keywords = regEx.exec(referrer);
	if (keywords !== null) {
		if (keywords[1].length > 0) {
			referrer = 'Google Search (Keywords: ' + keywords[1] + ')';
		} else {
			referrer = 'Google Search';
		}
	}
	return referrer;
}

function convertCountryIcon(value) {
	var countries = {"Ascension Island": "ac",
		"Andorra": "ad",
		"United Arab Emirates": "ae",
		"Afghanistan": "af",
		"Antigua And Barbuda": "ag",
		"Anguilla": "ai",
		"Albania": "al",
		"Armenia": "am",
		"Netherlands Antilles": "an",
		"Angola": "ao",
		"Antarctica": "aq",
		"Argentina": "ar",
		"American Samoa": "as",
		"Austria": "at",
		"Australia": "au",
		"Aruba": "aw",
		"Aland Islands": "ax",
		"Azerbaijan": "az",
		"Bosnia And Herzegovina": "ba",
		"Barbados": "bb",
		"Bangladesh": "bd",
		"Belgium": "be",
		"Burkina Faso": "bf",
		"Bulgaria": "bg",
		"Bahrain": "bh",
		"Burundi": "bi",
		"Benin": "bj",
		"Bermuda": "bm",
		"Brunei Darussalam": "bn",
		"Bolivia": "bo",
		"Brazil": "br",
		"Bahamas": "bs",
		"Bhutan": "bt",
		"Bouvet Island": "bv",
		"Botswana": "bw",
		"Belarus": "by",
		"Belize": "bz",
		"Canada": "ca",
		"Cocos (keeling) Islands": "cc",
		"Congo, The Democratic Republic of The": "cd",
		"Central African Republic": "cf",
		"Congo, Republic of The": "cg",
		"Switzerland": "ch",
		"Cote D'ivoire": "ci",
		"Cook Islands": "ck",
		"Chile": "cl",
		"Cameroon": "cm",
		"China": "cn",
		"Colombia": "co",
		"Costa Rica": "cr",
		"Cuba": "cu",
		"Cape Verde": "cv",
		"Christmas Island": "cx",
		"Cyprus": "cy",
		"Czech Republic": "cz",
		"Germany": "de",
		"Djibouti": "dj",
		"Denmark": "dk",
		"Dominica": "dm",
		"Dominican Republic": "do",
		"Algeria": "dz",
		"Ecuador": "ec",
		"Estonia": "ee",
		"Egypt": "eg",
		"Western Sahara": "eh",
		"Eritrea": "er",
		"Spain": "es",
		"Ethiopia": "et",
		"Europe": "eu",
		"Finland": "fi",
		"Fiji": "fj",
		"Falkland Islands ( Malvinas )": "fk",
		"Micronesia, Federated States of": "fm",
		"Faroe Islands": "fo",
		"France": "fr",
		"Gabon": "ga",
		"Grenada": "gd",
		"Georgia": "ge",
		"French Guiana": "gf",
		"Ghana": "gh",
		"Gibraltar": "gi",
		"Greenland": "gl",
		"Gambia": "gm",
		"Guinea": "gn",
		"Guadeloupe": "gp",
		"Equatorial Guinea": "gq",
		"Greece": "gr",
		"South Georgia And The South Sandwich Islands": "gs",
		"Guatemala": "gt",
		"Guam": "gu",
		"Guinea-bissau": "gw",
		"Guyana": "gy",
		"Hong Kong": "hk",
		"Heard Island And Mcdonald Islands": "hm",
		"Honduras": "hn",
		"Croatia": "hr",
		"Haiti": "ht",
		"Hungary": "hu",
		"Indonesia": "id",
		"Ireland, Republic of": "ie",
		"Ireland": "ie",
		"Israel": "il",
		"India": "in",
		"British Indian Ocean Territory": "io",
		"Iraq": "iq",
		"Iran, Islamic Republic of": "ir",
		"Iceland": "is",
		"Italy": "it",
		"Jamaica": "jm",
		"Jordan": "jo",
		"Japan": "jp",
		"Kenya": "ke",
		"Kyrgyzstan": "kg",
		"Cambodia": "kh",
		"Kiribati": "ki",
		"Comoros": "km",
		"Saint Kitts And Nevis": "kn",
		"Korea, Democratic People's Republic of": "kp",
		"Korea, Republic of": "kr",
		"Kuwait": "kw",
		"Cayman Islands": "ky",
		"Kazakhstan": "kz",
		"Lao People's Democratic Republic": "la",
		"Lebanon": "lb",
		"Saint Lucia": "lc",
		"Liechtenstein": "li",
		"Sri Lanka": "lk",
		"Liberia": "lr",
		"Lesotho": "ls",
		"Lithuania": "lt",
		"Luxembourg": "lu",
		"Latvia": "lv",
		"Libyan Arab Jamahiriya": "ly",
		"Morocco": "ma",
		"Monaco": "mc",
		"Moldova, Republic of": "md",
		"Montenegro, Republic of": "me",
		"Madagascar": "mg",
		"Marshall Islands": "mh",
		"Macedonia": "mk",
		"Macedonia, Republic of": "mk",
		"Mali": "ml",
		"Myanmar": "mm",
		"Mongolia": "mn",
		"Macau": "mo",
		"Northern Mariana Islands": "mp",
		"Martinique": "mq",
		"Mauritania": "mr",
		"Montserrat": "ms",
		"Malta": "mt",
		"Mauritius": "mu",
		"Maldives": "mv",
		"Malawi": "mw",
		"Mexico": "mx",
		"Malaysia": "my",
		"Mozambique": "mz",
		"Namibia": "na",
		"New Caledonia": "nc",
		"Niger": "ne",
		"Norfolk Island": "nf",
		"Nigeria": "ng",
		"Nicaragua": "ni",
		"Netherlands": "nl",
		"Norway": "no",
		"Nepal": "np",
		"Nauru": "nr",
		"Niue": "nu",
		"New Zealand": "nz",
		"Oman": "om",
		"Panama": "pa",
		"Peru": "pe",
		"French Polynesia": "pf",
		"Papua New Guinea": "pg",
		"Philippines": "ph",
		"Pakistan": "pk",
		"Poland": "pl",
		"Saint Pierre And Miquelon": "pm",
		"Pitcairn": "pn",
		"Puerto Rico": "pr",
		"Palestinian Territory, Occupied": "ps",
		"Palestinian Territory": "ps",
		"Portugal": "pt",
		"Palau": "pw",
		"Paraguay": "py",
		"Qatar": "qa",
		"Reunion": "re",
		"Romania": "ro",
		"Serbia": "rs",
		"Serbia, Republic of": "rs",
		"Russian Federation": "ru",
		"Rwanda": "rw",
		"Saudi Arabia": "sa",
		"Solomon Islands": "sb",
		"Seychelles": "sc",
		"Sudan": "sd",
		"Sweden": "se",
		"Singapore": "sg",
		"Saint Helena": "sh",
		"Slovenia": "si",
		"Svalbard And Jan Mayen": "sj",
		"Slovakia": "sk",
		"Sierra Leone": "sl",
		"San Marino": "sm",
		"Senegal": "sn",
		"Somalia": "so",
		"Suriname": "sr",
		"Sao Tome And Principe": "st",
		"El Salvador": "sv",
		"Syrian Arab Republic": "sy",
		"Swaziland": "sz",
		"Turks And Caicos Islands": "tc",
		"Chad": "td",
		"French Southern Territories": "tf",
		"Togo": "tg",
		"Thailand": "th",
		"Tajikistan": "tj",
		"Tokelau": "tk",
		"Timor - Leste ( East Timor )": "tl",
		"Turkmenistan": "tm",
		"Tunisia": "tn",
		"Tonga": "to",
		"Turkey": "tr",
		"Trinidad And Tobago": "tt",
		"Tuvalu": "tv",
		"Taiwan": "tw",
		"Taiwan, Province of China": "tw",
		"Tanzania, United Republic of": "tz",
		"Ukraine": "ua",
		"Uganda": "ug",
		"United Kingdom": "uk",
		"United States Minor Outlying Islands": "um",
		"United States": "us",
		"Uruguay": "uy",
		"Uzbekistan": "uz",
		"Holy See ( Atican City State )": "va",
		"Saint Vincent And The Grenadines": "vc",
		"Venezuela": "ve",
		"Virgin Islands, British": "vg",
		"Virgin Islands, United States": "vi",
		"Vietnam": "vn",
		"Vanuatu": "vu",
		"Wallis And Futuna": "wf",
		"Samoa": "ws",
		"Yemen": "ye",
		"Mayotte": "yt",
		"South Africa": "za",
		"Zambia": "zm",
		"Zimbabwe": "zw"},
		country = countries[value],
		location = value;
	
	if (country === undefined || country === 'Unavailable') {
		location = '';
	} else {
		if (country !== undefined) {
			location = 'sprite ' + country;
		}
	}
	
	return location;
}

function convertCountry(value) {
	var location = value.Country;
	if (value.State.length > 0) {
		if (value.City.length > 0) {
			location = value.City + ', ' + value.State + ', ' + value.Country;
		} else {
			location = value.State + ', ' + value.Country;
		}
	} else {
		if (value.City.length > 0) {
			location = value.City + ', ' + value.Country;
		}
	}
	return location;
}
