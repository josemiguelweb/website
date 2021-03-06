// Document ready
$(function(){
	
	// Generic popup defaults
	var popupDefaults = {
		height     :500,
		width      :420,
		scrollbars :0,
		toolbar    :0,
		location   :0,
		status     :'no',
		menubar    :0,
		resizable  :0,
		dependent  :0
	};
	
	window.getOptionsString = (function(options){
		if(!options)
			options = popupDefaults;
		else
			options = $.extend({}, popupDefaults, options);
		var str = '';
		for(var i in options)
			str += i + '='+ options[i] +',';
		return str;
	});
	
	// Lastfm
	new DestinyFeedConsumer({
		url: destiny.baseUrl + 'lastfm.json',
		polling: 40,
		ifModified: true,
		start: false,
		ui: '#stream-lastfm',
		success: function(data, textStatus){
			if(textStatus == 'notmodified') return;
			var entries = $('#stream-lastfm .entries:first').empty();
			if(data != null && typeof data['recenttracks'] == 'object' && data.recenttracks.track.length > 0){
				for(var i in data.recenttracks.track){
					if(i == 3){ break; };
					var track = data.recenttracks.track[i];
					var entry = $(
							'<div class="media">'+ 
								'<a class="pull-left cover-image" href="'+ track.url +'">'+ 
									'<img class="media-object" src="'+destiny.cdn+'/web/img/64x64.gif" data-src="'+ track.image[1]['#text'] +'">'+ 
								'</a>'+ 
								'<div class="media-body">'+ 
									'<div class="media-heading trackname"><a title="'+ htmlEncode(track.name) +'" href="'+ track.url +'">'+ htmlEncode(track.name) +'</a></div>'+ 
									'<div class="artist">'+ htmlEncode(track.artist['#text']) +'</div>'+ 
									'<div class="details">'+
										((i<3 && track.date_str != '') ? '<time class="pull-right" datetime="'+ track.date_str +'">'+ moment(track.date_str).fromNow() +'</time>' : '')+ 
										((i==0 && track.date_str == '') ? '<time class="pull-right" datetime="'+ track.date_str +'">now playing</time>' : '')+ 
										'<small class="album subtle">'+ track.album['#text'] +'</small>'+ 
									'</div>'+ 
								'</div>'+ 
							'</div>'
					);
					entries.append(entry);
				};
				entries.loadImages();
			};
		}
	});
	
	// Twitter
	new DestinyFeedConsumer({
		url: destiny.baseUrl + 'twitter.json',
		polling: 300,
		ifModified: true,
		start: false,
		ui: '#stream-twitter',
		success: function(tweets, textStatus){
			if(textStatus == 'notmodified') return;
			var entries = $('#stream-twitter .entries:first').empty();
			for(var i in tweets){
				if(i == 3){ break; };
				entries.append(
					'<div class="media">'+ 
						'<div class="media-body">'+ 
							'<div class="media-heading"><a target="_blank" href="'+ 'https://twitter.com/'+ tweets[i].user.screen_name +'/status/' + tweets[i].id_str +'"><i class="icon-share icon-white subtle"></i></a> '+ 
								tweets[i].html +
							'</div>'+ 
							'<time datetime="'+ tweets[i].created_at +'" pubdate>'+ moment(tweets[i].created_at).fromNow() +'</time>'+ 
						'</div>'+ 
					'</div>'
				);
			};
			entries.loadImages();
		}
	});
	
	// Youtube
	new DestinyFeedConsumer({
		url: destiny.baseUrl + 'youtube.json',
		ifModified: true,
		start: false,
		ui: '#youtube',
		success: function(data, textStatus){
			if(textStatus == 'notmodified') return;
			var ui = $('#youtube .thumbnails:first').empty();
			ui.removeClass('thumbnails-loading');
			if(typeof data == 'object'){
				for(var i in data.items){
					var title = htmlEncode(data.items[i].snippet.title);
					ui.append(
						'<li>'+
							'<div class="thumbnail" data-toggle="tooltip" title="'+ title + '">'+
								'<a href="'+ 'http://www.youtube.com/watch?v='+ data.items[i].snippet.resourceId.videoId +'">'+ 
									'<img alt="'+ title +'" src="'+destiny.cdn+'/web/img/320x240.gif" data-src="https://i.ytimg.com/vi/'+ data.items[i].snippet.resourceId.videoId +'/default.jpg" />'+
								'</a>'+
							'</div>'+
						'</li>'
					);
					ui.find('.thumbnail').tooltip({placement:'bottom'});
				};
				ui.loadImages();
			};
		}
	});
	
	// Past Broadcasts
	new DestinyFeedConsumer({
		url: destiny.baseUrl + 'broadcasts.json',
		polling: 600,
		ifModified: true,
		start: false,
		ui: '#broadcasts',
		success: function(data, textStatus){
			if(textStatus == 'notmodified') return;
			var broadcasts = $('#broadcasts'),
				ui = broadcasts.find('.thumbnails:first').empty();
			ui.removeClass('thumbnails-loading');
			if(data != null && typeof data.videos != undefined){
				for(var i in data.videos){
					var time = moment(data.videos[i].recorded_at).fromNow();
					ui.append(
						'<li>'+
							'<div class="thumbnail" data-placement="bottom" rel="tooltip" title="'+ time +'">'+
								'<a href="'+ data.videos[i].url +'">'+ 
									'<img alt="'+ time +'" src="'+destiny.cdn+'/web/img/320x240.gif" data-src="'+ data.videos[i].preview +'">'+
								'</a>'+
							'</div>'+
						'</li>'
					);
				};
				ui.loadImages();
				ui.find('[data-toggle="tooltip"]').tooltip();
			};
		}
	});
	
	var onlinebanner  = $('#online-banner-view'),
		offlinebanner = $('#offline-banner-view'),
		statusbanners = $('#status-banners');
	
	// Stream details
	new DestinyFeedConsumer({
		url: destiny.baseUrl + 'stream.json',
		polling: 30,
		ifModified: true,
		start: false,
		ui: 'body#home',
		success: function(data, textStatus){
			
			if(!data || textStatus == 'notmodified') 
				return;
			
			if(data != null && data.stream != null){
				onlinebanner.find('.preview a').attr('title', data.status);
				onlinebanner.find('.preview a').css('background-image', 'url('+data.stream.preview.medium+')');
				onlinebanner.find('.live-info-game').text(data.game);
				onlinebanner.find('.live-info-updated').text(moment(data.stream.channel.updated_at).fromNow());
				onlinebanner.find('.live-info-viewers').text(data.stream.viewers);
				onlinebanner.show().appendTo(statusbanners);
				offlinebanner.detach();
			}else{
				offlinebanner.find('.offline-status').text(data.status);
				offlinebanner.find('.offline-info-lastbroadcast').text(moment(data.lastbroadcast).fromNow());
				offlinebanner.find('.offline-info-game').text(data.game);
				
				if(data.previousbroadcast)
					offlinebanner.find('.preview a').css('background-image', 'url('+data.previousbroadcast.preview+')');
				else
					offlinebanner.find('.preview a').css('background-image', 'url('+data.video_banner+')');
				
				offlinebanner.show().appendTo(statusbanners);
				onlinebanner.detach();
			}
			
		}
	});
	
	
	// Private ads / rotation
	var pads = $('.private-ads .private-ad'), adRotateIndex = pads.length-1;
	setInterval(function(){
		$(pads[adRotateIndex]).fadeOut(500, function(){
			$(this).hide().removeClass('active');
		});
		if(adRotateIndex < pads.length-1) adRotateIndex++; else adRotateIndex = 0;
		$(pads[adRotateIndex]).hide().addClass('active').fadeIn(500);
	}, 8 * 1000);

	
	// Check if the ad has been blocked after X seconds
	var gad = $('#google-ad');
	setTimeout(function(){
		if(gad.css('display') == 'none' || parseInt(gad.height()) <= 0){
			gad.before('<div id="adblocker-message"><a>Add blocker</a><p>Please consider turning adblocker off for this website.</p></div>');
		}
	}, 8000);
	
	// Bigscreen
	$('body#bigscreen').each(function(){
		var offset = $('#main-nav').outerHeight();
		var _resize = function(){
			
			var bodyHeight    = $('body').height(),
				offset        = $('#main-nav').outerHeight(),
				contentUi     = $('#page-content'), 
				chatUi        = $('#chat-panel .stream-element'),
				streamPlayer  = $('#stream-panel .stream-element'),
				streamHeader  = $('#stream-panel .panelheader');
			
			// If we are in fullscreen mode
			if (document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen){
				streamPlayer.height("100%");
			}else{
				var offsetHeight = bodyHeight - 10;
				contentUi.height(offsetHeight - offset);
				chatUi.height(offsetHeight - (offset + streamHeader.height()));
				streamPlayer.height(offsetHeight - (offset + streamHeader.height()));
			}
		};
		
		$(window).on('resize', _resize);
		_resize();
		
		$('iframe#chat-frame').on('load', function(){
			var chatframe           = this.contentWindow,
				chatUsersPanel      = $('#chat-panel-users'),
				chatUsersPanelCount = chatUsersPanel.find('#chat-panel-usercount');
			
			if(!chatframe)
				return;
				
			chatframe.destiny.chat.gui.on('names join quit', function(e, data){
				var userCount = Object.keys(this.engine.users).length;
				if(userCount > 0){
					chatUsersPanel.show();
					chatUsersPanelCount.text("~"+userCount);
				}else{
					chatUsersPanel.hide();
				}
			});

			$('#chat-panel-tools').each(function(e){
				$(this).on('click', '.icon-share', function(){
					window.open('/embed/chat', '_blank', window.getOptionsString());
					$('body').addClass('nochat');
					$('#chat-panel').remove();
					return false;
				});
				$(this).on('click', '.icon-refresh', function(){
					chatframe.location.reload();
					return false;
				});
				$(this).on('click', '.icon-remove', function(){
					$('body').addClass('nochat');
					$('#chat-panel').remove();
					return false;
				});
			});
		});
		
		new DestinyFeedConsumer({
			url: destiny.baseUrl + 'stream.json',
			polling: 30,
			start: true,
			ui: '#stream-panel .panelheader .game',
			ifModified: true,
			success: function(data, textStatus){
				
				if(textStatus == 'notmodified') return;
				var ui = $('#stream-panel .panelheader .game');
				if(data != null && data.stream != null){
					ui.html( '<i class="icon-time icon-white subtle"></i> <span>Started '+ moment(data.stream.channel.updated_at).fromNow() +'</span>' + ((data.stream.channel.delay > 0) ? ' - ' + parseInt((data.stream.channel.delay/60)) + 'm delay':'')).show();
					return;
				}
				try{
					ui.html( '<i class="icon-time icon-white subtle"></i> <span>Last broadcast ended '+ moment(data.lastbroadcast).fromNow() +'</span>').show();
				}catch(e){
					ui.html( '<i class="icon-time icon-white subtle"></i> <span>Broadcast has ended</span>').show();
				}
			}
		});
		
	});
	
	// Add collapses
	$(".collapse").collapse();
	
	// Section collapse
	$(".collapsible").each(function(){
		var $c = $(this),
			$t = $c.find('> h3'),
			$v = $c.find('> content');
		$t.on('click', function(){
			if($c.hasClass('active')){
				$t.find('.icon-minus-sign').removeClass('icon-minus-sign').addClass('icon-plus-sign');
				$v.hide();
			}else{
				$t.find('.icon-plus-sign').removeClass('icon-plus-sign').addClass('icon-minus-sign');
				$v.show();
			}
			$c.toggleClass('active');
		});
	});
	
	// Tabs selector - dont know why I need this
	if (location.hash !== '') 
		$('a[href="' + location.hash + '"]').tab('show');

	// Set the top nav selection
	$('body').each(function(){
		$('.navbar a[rel="'+$('body').attr('id')+'"]').closest('li').addClass('active');
		$('.navbar a[rel="'+$('body').attr('class')+'"]').closest('li').addClass('active');
	});
	
	// Generic popup links
	$('body').on('click', 'a.popup', function(e){
		var a = $(this)
		a.data('popup', window.open(a.attr('href'), '_blank', window.getOptionsString(a.data('options'))) );
		e.preventDefault();
		return false;
	});
	
	// Lazy load images
	$(this).loadImages();
	$(this).find('[data-toggle="tooltip"]').tooltip();
});

(function(){
	
	var twitch         = $('#twitchpanel'),
		popoutChatBtn  = twitch.find('#popoutchat'),
		popoutVideoBtn = twitch.find('#popoutvideo'), 
		twitchElements = twitch.find('#stream-element-wrap'),
		chat           = twitch.find('#chat-embed'), 
		player         = twitch.find('#player-embed');
	
	var twitchChat = {
		popup: null,
		toggle: function(){
			if(this.popup == null) 
				this.popOut(); 
			else 
				this.popIn();
		},
		popOut: function(){
			if(twitchElements.children().length <= 1)
				twitch.removeClass('split-view single-view').addClass('no-view');
			else
				twitch.removeClass('split-view').addClass('single-view');
			chat.detach();
			this.popup = window.open('/embed/chat','_blank',window.getOptionsString({height:500, width:420}));
		},
		popIn: function(){
			if(twitchElements.children().length <= 0)
				twitch.removeClass('split-view').addClass('single-view');
			else
				twitch.addClass('split-view').removeClass('single-view');
			
			if(this.popup != null){
				this.popup.close();
				this.popup = null;
			}
			chat.appendTo(twitchElements);
		}
	};

	var twitchVideo = {
		popup: null,
		toggle: function(){
			if(this.popup == null) this.popOut(); else this.popIn();
		},
		popOut: function(){
			if(twitchElements.children().length <= 1)
				twitch.removeClass('split-view single-view').addClass('no-view');
			else
				twitch.removeClass('split-view').addClass('single-view');
			player.detach();
			this.popup = window.open('http://www.twitch.tv/destiny/popout','_blank',window.getOptionsString({height:420, width:720}));
		},
		popIn: function(){
			if(twitchElements.children().length <= 0)
				twitch.removeClass('split-view').addClass('single-view');
			else
				twitch.addClass('split-view').removeClass('single-view');
			if(this.popup != null){
				this.popup.close();
				this.popup = null;
			}
			player.prependTo(twitchElements);
		}
	};

	popoutChatBtn.on('click', function(){ 
		twitchChat.toggle(); 
		return false; 
	});
	popoutVideoBtn.on('click', function(){ 
		twitchVideo.toggle(); 
		return false; 
	});
	
})();

// Change time on selected elements
(function(){
	var applyMomentToElement = function(e){
		
		var ui = $(e), 
			datetime = ui.data('datetime') || ui.attr('datetime') || ui.text(),
			format = ui.data('format') || 'MMMM Do, h:mm:ss a';
		
		if(ui.data('moment-fromnow')){
			ui.addClass('moment-update');
			ui.html(moment(datetime).fromNow());
		}else{
			ui.html(moment(datetime).format(format));
		}
		
		ui.data('datetime', datetime).addClass('moment-set');
	};
	window.setInterval(function(){
		$('time.moment-update').each(function(){
			applyMomentToElement(this);
		});
	}, 30000);
	$('time[data-moment="true"]:not(.moment-set)').each(function(){
		applyMomentToElement(this);
	});
})();


//Ping
(function(){
	window.setInterval(function(){
		$.ajax({
			url: '/ping',
			method: 'get'
		});
	}, 10*60*1000);
})();

//Remember dismissed permanent alert boxes
(function() {
	
	$.cookie.json = true;
	$('.alert .close.persist').each(function() {
		
		var parent = $(this).parent('.alert'),
		    id     = parent.attr('id');
		
		if (!id)
			return;
		
		id = 'alert-dismissed-' + id;
		
		$(this).click(function() {
			$.cookie(id, true, {expires: 365})
		});
		
		if ($.cookie(id))
			parent.remove();
		
	})
	
})();

(function(){

	/**
	 * Iterate over browser variants of the given fullscreen API function string,
	 * and if found, call it on the given element.
	 */	
	var fullscreenFn = function(fn, elem) {
		var agents = ["webkit", "moz", "ms", "o", ""];
		for (var i = agents.length - 1; i >= 0; i--) {
			var agent  = agents[i],
			    fullFn = null;
			
			if (!agent) // if no agent the function starts with a lower case letter
				fullFn = fn.substr(0,1).toLowerCase() + fn.substr(1);
			else // just preprend the agent to the function
				fullFn = agent + fn;
			
			if (typeof elem[fullFn] != "function")
				continue;
			
			elem[fullFn]();
			break;
		};
	};
	
	// Toggles player fullscreen using the global fullscreen flag
	var toggleFullscreen = function(event, element) {
		if(document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen){
			fullscreenFn("CancelFullScreen", document);
			$(element).removeClass('fullscreened');
		} else {
			fullscreenFn("RequestFullScreen", element);
			$(element).addClass('fullscreened');
		}
	}
	
	// Global fullscreen change event (using ESC to cancel fullscreen
	$(document).on("fullscreenchange mozfullscreenchange webkitfullscreenchange", function () {
		if(!(document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen)){
			$('.fullscreened').removeClass('fullscreened');
		}
	});
	
	// Stream overloays
	$('.stream-overlay.to-main').on('dblclick', function(e){
		toggleFullscreen(e, $(this).parent().get(0));
		return false;
	});
	$('.stream-overlay.fsbtn').on('click', function(e){
		toggleFullscreen(e, $(this).parent().get(0));
		return false;
	});
	
})();
