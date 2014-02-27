function initialize() {
	var mapOptions = {
		center : new google.maps.LatLng(51, 7),
		zoom : 8
	};
	map = new google.maps.Map($("#map")[0], mapOptions);
}

function clearAllMarkers() {
	if (markers) {
		for (i in markers) {
			markers[i].setMap(null);
		}
		markers.length = 0;
	}
}

function addMarker(marker) {
	this.markers.push(marker);
}

function addUser(form) {
	console.log(user.toString());
	console.log(password_validate.toString());
	console.log(captcha.toString());
	if (user && password_validate && captcha) {

		$.ajax({
			url : 'http://localhost/FAPServer/addUser',
			type : 'POST',
			dataType : 'json',
			contentType : 'application/json',
			data : JSON.stringify({
				'loginName' : $('#username').val(),
				'passwort' : {
					'passwort' : $('#password').val()
				},
				'vorname' : $('#surname').val(),
				'nachname' : $('#name').val(),
				'strasse' : $('#street').val(),
				'plz' : $('#postal').val(),
				'ort' : $('#city').val(),
				'land' : $('#country').val(),
				'telefon' : '012345678979',
				'email' : {
					'adresse' : $('#mail').val()
				}
			}),
			success : function(data) {
				if (data) {
					alert('User erfolgreich angelegt');
				} else {
					alert('User nicht erfolgreich angelegt');
				}
			}
		});
	} else {
		if (!user) {
			alert('Benutzer nicht verfügbar');
		} else if (!password_validate) {
			alert('Passwörter stimmen nicht überein');
		} else if (!captcha) {
			alert('Captcha Eingabe ist falsch');
		}
	};
}

function checkUsername() {
	var user;
	$.ajax({
		url : 'http://localhost/FAPServer/checkLoginName',
		dataType : 'json',
		async : false,
		contentType : 'application/json',
		data : {
			id : $('#username').val()
		},
		error : function(xhr, status) {
			console.log(status);
		},
		success : function(data) {
			console.log('success');
			if (data) {
				user = false;
			} else {
				user = true;
			}
		}
	});
	return user;
	console.log('fertig');

}

function passwordCheck() {

	var password = $('#password').val();
	var password_check = $('#password_check').val();
	if (password == password_check) {
		$('#password_validate').text('Passwörter stimmen überein');
		password_validate = true;
	} else {
		$('#password_validate').text('Passwörter stimmen nicht überein');
		password_validate = false;
	};
}

function getLocationByPostal() {

	$.ajax({
		url : 'http://api.geonames.org/postalCodeSearchJSON?username=Babbafett',
		dataType : 'jsonp',
		data : {
			postalcode : $('#postal').val(),
			style : 'full',
			maxRows : 12,
			lang : 'de'
		},
		success : function(data) {
			$('#city').val(data.postalCodes[0].placeName);
			$.ajax({
				url : 'http://api.geonames.org/searchJSON?username=Babbafett',
				dataType : 'jsonp',
				data : {
					name_equals : $('#city').val(),
					featureClass : 'P',
					style : 'full',
					country : 'DE',
					maxRows : 12,
					lang : 'de'
				},
				success : function(data) {
					$('#country').val(data.geonames[0].countryName);
					var latlng = new google.maps.LatLng(data.geonames[0].lat, data.geonames[0].lng);
					map.setZoom(13);
					map.setCenter(latlng);
					clearAllMarkers();
					addMarker(new google.maps.Marker({
						map : map,
						position : latlng
					}));

				}
			});
		}
	});

}

function getLocationByCity() {
	$.ajax({
		url : 'http://api.geonames.org/searchJSON?username=Babbafett',
		dataType : 'jsonp',
		data : {
			name_equals : $('#city').val(),
			featureClass : 'P',
			style : 'full',
			country : 'DE',
			maxRows : 12,
			lang : 'de'
		},
		success : function(data) {
			$('#country').val(data.geonames[0].countryName);
			var latlng = new google.maps.LatLng(data.geonames[0].lat, data.geonames[0].lng);
			map.setZoom(13);
			map.setCenter(latlng);
			clearAllMarkers();
			addMarker(new google.maps.Marker({
				map : map,
				position : latlng
			}));

		}
	});

}

function getLocationByStreet() {
	geocoder = new google.maps.Geocoder();
	geocoder.geocode({
		'address' : $('#street').val()
	}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			map.setZoom(15);
			map.setCenter(results[0].geometry.location);
			clearAllMarkers();
			addMarker(new google.maps.Marker({
				map : map,
				position : results[0].geometry.location
			}));
			$('#city').val(results[0].address_components[4].long_name);
			$('#country').val(results[0].address_components[7].long_name);
			$('#postal').val(results[0].address_components[8].long_name);
		}
	});
}

function checkCaptcha() {
	var input = $('#captcha').val();
	if (result == input) {
		$('#check_captcha').text('richtig');
		captcha = true;
	} else {
		$('#check_captcha').text('falsch');
		captcha = false;
	};
}

function generateCaptcha() {
	$(document).ready(function() {
		var numberA = 1 + Math.floor(Math.random() * 10);
		var numberB = 1 + Math.floor(Math.random() * 10);
		result = numberA + numberB;
		$('#captcha_label').text(numberA.toString() + ' + ' + numberB.toString() + ' = ?');
	});
}

function login() {
	$(document).ready(function() {

		var user;
		user = checkUsername();
		console.log(user.toString());
		if (!user) {
			$.ajax({
				url : 'http://localhost/FAPServer/login',
				type : 'POST',
				dataType : 'text',
				contentType : 'application/json',
				data : JSON.stringify({
					'loginName' : $('#username').val(),
					'passwort' : {
						'passwort' : $('#password').val()
					}
				}),
				error : function(xhr, status) {
					console.log(status);
				},
				success : function(data) {
					console.log('hallo');
					if (data) {
						var sessionId = data;
						createCookie($('#username').val(), sessionId, 7);
						//alert('SessionID from Cookie: ' + readCookieSessionId());
						//alert('Username from Cookie: ' + readCookieUserName());
						location.href = "http://localhost/fap_client/html/index.html";
					} else {
						alert('Anmeldung fehlgeschlagen');
					}
				}
			});
		}
	});
}

function createCookie(name, value, days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		var expires = "; expires=" + date.toGMTString();
	} else
		var expires = "";

	document.cookie = name + "=" + value + expires + "; path=http://localhost/fap_client/html/index.html";
}

function readCookieSessionId() {

	var ca = document.cookie.split(';');

	var cookieString = ca[0];
	
	var index = cookieString.search("=");
	
	return cookieString.substring(index + 4, 18);

}

function readCookieUserName() {
	
	var ca = document.cookie.split(';');

	var cookieString = ca[0];
	
	var index = cookieString.search("=");
	
	return cookieString.substring(0, index);

}

function deleteCookie() {
	
	var name = readCookieUserName();
	
	document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function editLocation(editLocation) {

}

function addLocation(add_Location) {

}

function getContacts() {
	var table;
	$.ajax({
		url : 'http://localhost/FAPServer/getAdressbuch',
		type : 'GET',
		async : false,
		dataType : 'json',
		contentType : 'application/json',
		data : {
			id : 'peterl',
			sid : '4711007'
		},

		success : function(data) {
			for (contact in data.kontakte) {
				table += '<tr><td>';
				if ( typeof data.kontakte[contact].name === 'undefined') {
					table += '</td>';
				} else {
					table += data.kontakte[contact].name + '</td>';
				}
				if ( typeof data.kontakte[contact].vorname === 'undefined') {
					table += '<td></td>';
				} else {
					table += '<td>' + data.kontakte[contact].vorname + '</td>';
				}
				if ( typeof data.kontakte[contact].loginName === 'undefined') {
					table += '<td></td>';
				} else {
					table += '<td>' + data.kontakte[contact].loginName + '</td>';
				}
				if ( typeof data.kontakte[contact].plz === 'undefined') {
					table += '<td></td>';
				} else {
					table += '<td>' + data.kontakte[contact].plz + '</td>';
				}
				if ( typeof data.kontakte[contact].ort === 'undefined') {
					table += '<td></td>';
				} else {
					table += '<td>' + data.kontakte[contact].ort + '</td>';
				}
				if ( typeof data.kontakte[contact].strasse === 'undefined') {
					table += '<td></td>';
				} else {
					table += '<td>' + data.kontakte[contact].strasse + '</td>';
				}
				if ( typeof data.kontakte[contact].email.adresse === 'undefined') {
					table += '<td></td>';
				} else {
					table += '<td>' + data.kontakte[contact].email.adresse + '</td>';
				}
			}
		}
	});
	console.log(table);
	return table;
}

function editEntry() {

}

function changeMode(mode) {
	var status;
	if (!mode) {
		status = true;
		$('#edit_Location').show();
		$('#abort').show();
		$('#mode').text('Change mode on');
		$(ui.selected).children().each(function(index, value) {
			if (index == 0) {
				$('#name').val($(value).text());
			} else if (index == 1) {
				$('#surname').val($(value).text());
			} else if (index == 2) {
				$('#username').val($(value).text());
			} else if (index == 3) {
				$('#postal').val($(value).text());
			} else if (index == 4) {
				$('#city').val($(value).text());
			} else if (index == 5) {
				$('#street').val($(value).text());
			} else if (index == 6) {
				$('#mail').val($(value).text());
			}
		});
	} else {
		status = false;
		$('#edit_Location').hide();
		$('#abort').hide();
		$('#mode').text('');
	}
	return status;
}

/*
 function getLocation(loginName) {
 geocoder = new google.maps.Geocoder();
 var latlng;
 $.ajax({
 url : 'http://localhost/FAPServer/getStandort/' + loginName,
 type : 'GET',
 async: false,
 dataType : 'json',
 contentType : 'application/json',
 success : function(data) {
 $('#username').val(data.loginName);
 latlng = JSON.stringify({ 'lat': data.standort.laengengrad, 'lng': data.standort.breitengrad});
 var latlng = new google.maps.LatLng(data.standort.laengengrad, data.standort.breitengrad);
 geocoder.geocode({
 'latLng' : latlng
 }, function(results, status) {
 if (status == google.maps.GeocoderStatus.OK) {
 map.setZoom(15);
 map.setCenter(results[0].geometry.location);
 clearAllMarkers();
 addMarker(new google.maps.Marker({
 map : map,
 position : results[0].geometry.location
 }));
 $('#city').val(results[0].address_components[2].long_name);
 $('#country').val(results[0].address_components[5].long_name);
 $('#street').val(results[0].address_components[1].long_name + ' ' + results[0].address_components[0].long_name);

 }
 });

 }
 });
 return latlng;
 }
 */
