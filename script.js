var twitter_api = 'https://api.twitter.com/1.1/';
var pi_api = 'https://gateway.watsonplatform.net/personality-insights/api/';
var nlu_api = 'https://gateway.watsonplatform.net/natural-language-understanding/api/';

var bearerToken = 'AAAAAAAAAAAAAAAAAAAAADlz1QAAAAAA7905P%2BXcROiYyvvax1OLdqqgBYU%3DnJPj2LoK6USjT3yL35JvKz6JHXvYMGqXIrMgb1EsfUXC9rNhcQ';
var pi_user = '4f9173aa-1fa5-403e-a1a3-30a496554ae4';
var pi_pass = 'IKjvQxn5m2Gp';

// Call to Natural Personality Insight API
function piAnalyze(content, username) {
	//console.log(content);
	$.ajax({
		url: pi_api + 'v3/profile?version=2016-10-20',
		type: 'POST',
		headers : {
			'Content-Type': 'application/json',
			'Authorization': 'Basic NGY5MTczYWEtMWZhNS00MDNlLWExYTMtMzBhNDk2NTU0YWU0OklLanZReG41bTJHcA=='
		},
		data: content,
		async: false,
		//In case of sucess, display pop_up. If now, show the error in console. 
		success: function(result) {

			//Put all Values data into an array, ready for display
			var values = result.values;
			var _x = [], _y = [];
			for (var i = 0; i < values.length; i++) {
				_x.push(values[i].percentile);
				_y.push(values[i].name);
			}

			var data = [{
  				type: 'bar',
  				x: _x,
  				y: _y,
  				orientation: 'h'
			}];

			//Display it in pop-up using Plotly
			var layout = {title: username, margin: {l:200}};

			Plotly.newPlot('pi-result', data, layout);
			//console.log(result);
		},
		error: function(err) {
			console.log(JSON.stringify(err));
		}
	});
};

// Call to Natural Language Undertanding API
function nlu_analyze(content, username) {
	$.ajax({
		url: nlu_api + 'v1/analyze?version=2017-02-27',
		type: 'POST',
		headers : {
			'Content-Type': 'application/json',
			'Authorization': 'Basic YmUyOWM2ZGItZGM4Ni00ZDNjLTk4ZjEtOTFhOWE2YjRmODYzOlREUzBXT29BR2E3NA=='
		},
		data: content,
		async: false,
		//Sucess: show return value in console. Falure: Show reason in console
		success: function(result) {
			console.log(result);
		},
		error: function(err) {
			console.log(JSON.stringify(err));
		}
	});
};

// Replace a string 
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

// Call Tiwtter API to get user_timeline's tweet
function getUserTweets(username) {
	$.ajax({
		type: 'GET',
		headers : {
			'Authorization': 'Bearer ' + bearerToken
		},
		url: twitter_api + 'statuses/user_timeline.json?screen_name=' + username,
		async: false,
		success: function(tweets) {
			var contentItems = [];
			var nluText = '';
			for (var i = 0; i < tweets.length; i++) {
				var item = {};
				item.content = tweets[i].text;
				nluText += tweets[i].text;
				item.contenttype = 'text/plain';
				item.created = Date.parse(tweets[i].created_at);
				item.id = tweets[i].id_str;
				item.language = 'en';
				contentItems.push(item);
			}
			//console.log(nluText);
			var pi_data = '{"contentItems":' + JSON.stringify(contentItems) + '}';
			piAnalyze(pi_data, username);
			nluTextFinal = replaceAll(nluText,'"',"'");
			//console.log(nluTextFinal);
			var nlu_data = '{"text":"' + nluTextFinal
							//+ ' "features": {"sentiment": {"target":"Republican","Republicans"}'
							+ '","features": { "entities": {"emotion": true,"sentiment": true,"limit": 2 },'
    						+ '"keywords": {"emotion": true,"sentiment": true,"limit": 2}'
    						+ '}}';
    		console.log(nlu_data)
    		nlu_analyze(nlu_data, username);
		}
	});
};


//Load the Analyze button on the page
$(document).ready(function(){ 
	var items = $('#stream-items-id li.stream-item .content .stream-item-header');
	items.find('.time').after(
  		$('<small/>')
    		.attr('class', 'ex-anl')
			.addClass('time')
	);
	console.log(items);

	$('.ex-anl').append(
		$('<button/>')
			.addClass('ex-anl-btn')
			.text('Analyze')
	);

// Take the Twitter Username
	items.each(function(i) {
		var uname = $(this).find('.account-group').attr('href');
		uname = uname.slice(1);
		$(this).find('.ex-anl button.ex-anl-btn').attr('data-uname', uname);
	});
		

// Design the popup table and action when we click on the Analyze button
	var popupElement = '\
		<div class="popup">\
			<div class="popup-inner" id="pi-result">\
        		<a class="popup-close" href="#">x</a>\
			</div>\
		</div>';

	$('body').append(popupElement);

	$('button.ex-anl-btn').click(function() {
		$('div.popup').fadeIn(350);
		$('div.myButton').fadeIn(350);
		var uname = $(this).attr('data-uname');
		console.log(uname);
		getUserTweets(uname);
	});

	$('a.popup-close').click(function() {
		$('div.popup').fadeOut(350);
	});

	console.log('\nDone');
});