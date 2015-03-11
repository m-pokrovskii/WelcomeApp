var finalApps        = [];
var images           = [];
var indexes          = []; 
var CallbackRegistry = {};
var pkgNames         = [];

Element.prototype.setAttributes = function (attrs) {
    for (var idx in attrs) {
        if ((idx === 'styles' || idx === 'style') && typeof attrs[idx] === 'object') {
            for (var prop in attrs[idx]){this.style[prop] = attrs[idx][prop];}
        } else if (idx === 'html') {
            this.innerHTML = attrs[idx];
        } else {
            this.setAttribute(idx, attrs[idx]);
        }
    }
};

var replaceJQ = (function(){
	
	function ready(fn) {
		if (document.readyState != 'loading'){
			fn();
		} else {
			document.addEventListener('DOMContentLoaded', fn);
		}
	}

	function each (item, fn) {
		if(Object.prototype.toString.call(item) === '[object Object]') {
			for(var key in item) {
				if (item.hasOwnProperty(key)) {
					fn(key, item[key]);
				}
			}
		} else if (Array.isArray(item)) {
				item.forEach(function(val, key){
					fn(key, val);
				});
		}
	}

	return {
		ready: ready,
		each:  each
	}

}());


function scriptRequest(url, onSuccess, onError) {
 
	var scriptOk = false;

	var callbackName = 'f'+String(Math.random()).slice(2);

	url += ~url.indexOf('?') ? '&' : '?';
	url += 'callback=CallbackRegistry.'+callbackName;
 
	CallbackRegistry[callbackName] = function(data) {      
		scriptOk = true;
		delete CallbackRegistry[callbackName];
		onSuccess(data);
	};

	function checkCallback() {
		if (scriptOk) return;
		delete CallbackRegistry[callbackName];
		onError(url);
	}
 
	var script = document.createElement('script'); 
 
	script.onreadystatechange = function() {   
		if (this.readyState == 'complete' || this.readyState == 'loaded'){  
			this.onreadystatechange = null;  
			setTimeout(checkCallback, 0);
		}
	}
 
	script.onload = script.onerror = checkCallback;
	script.src = url;
 
	document.body.appendChild(script);
 }

function success_jsonp(data) {

		replaceJQ.each(data, function(key, val) {
				var dataAttr = data[key];
				replaceJQ.each(dataAttr, function(key, val) {
					pkgNames.push(val.androidPackage);	
				});
				window.location = 'appnext://pid:' + pkgNames;
				window.finalApps = dataAttr;
		});

		installedApps('com.qihoo.security'); // remove in prodaction.
}
 
function fail_jsonp(url) {
	console.log('Error in query ' + url);
}

function getURLParameter(name) {
		return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null
}


var id = getURLParameter('android_id');
if (id === undefined || id === '' || id === null) id = '61e63949-d69a-4268-8484-c9079341ceaf';

var bgc = getURLParameter('bgc');
if (bgc === undefined || bgc === '' || bgc === null) bgc = 'fff';

var bcolor = getURLParameter('bcolor');
if (bcolor === undefined || bcolor === '' || bcolor === null) bcolor = 'F78D1F';

var btitle = getURLParameter('btitle');
if (btitle === undefined || btitle === '' || btitle === null) btitle = 'Download Free!';

var cat = getURLParameter('cat');
if (cat === undefined || cat === '' || cat === null) cat = '';

var cnt = getURLParameter('cnt');
if (cnt === undefined || cnt === '' || cnt === null) cnt = '10';

var pbk = getURLParameter('pbk');
if (pbk === undefined || pbk === '' || pbk === null) pbk = '';

var appn = getURLParameter('appn');
if (appn === undefined || appn === '' || appn === null){
	appn = '';
}else{
	appn = 'Welcome to '+appn+'<br> & Discover this Free App!';
}
var title = getURLParameter('title');
if (title === undefined || title === '' || title === null) title = 'Discover this Free App!';

if (appn!='')
{
	title=appn;
}



function installedApps(apps) {
	if (apps) {
			replaceJQ.each(window.finalApps, function (i, val) {
			if (apps.split(',').indexOf(val.androidPackage) != -1) {
						indexes.push(i);
				}
			});
			for (var i = indexes.length - 1; i >= 0; i--) {
				window.finalApps.splice(indexes[i], 1);
			}
		}
		
		window.finalApps.slice(0,1).forEach(function (val1, key1) {
		if (val1){

			document.querySelector('.js-modal_title').setAttributes({
				html: title
			})
			document.querySelector('.js_app_url').setAttributes({
				'data-jsonid': key1
			});

			document.querySelector('.js-modal_main_img_itm').setAttributes({
				src:    val1.urlImg,
				onload: document.querySelector('.js-modal_inner_cust').style.display = "",
				alt:    val1.title
			});

			document.querySelector('.js-modal_itm_info_title').setAttributes({
				html: val1.title
			});

			document.querySelector('.js-modal_itm_info_text').setAttributes({
				html: val1.desc
			});
			document.querySelector('.js-modal_itm_info_btn').setAttributes({
				html: btitle,
				styles: {
					backgroundColor: '#'+bcolor
				}
			});

			var jsAppUrl = document.querySelector('.js_app_url');
			jsAppUrl.addEventListener('click', function(e) {
					e.preventDefault();
					window.location = 'appnext://app:' + JSON.stringify(window.finalApps[$(this).data('jsonid')]);
			})
		}
	});
	
	window.location = 'appnext://ready';
};

replaceJQ.ready(
	function() {
		scriptRequest("https://admin.appnext.com/offerWallApi.aspx?ext=t&id="+id+"&cnt="+cnt+"&cat="+cat+"pbk="+pbk, success_jsonp, fail_jsonp);
		var innerCust  = document.querySelectorAll('.js-modal_inner_cust')[0],
				skipButton = document.querySelectorAll('.js-modal_itm_info_foot_btn')[0];

		innerCust.style.backgroundColor = "#"+bgc;
		skipButton.addEventListener('click', function(e) {
			e.preventDefault();
			window.location = 'appnext://close_appwall';
		})
	}
);