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
				$('#check').text('Benutzername nicht verfügbar');
				user = false;
			} else {
				$('#check').text('Benutzername verfügbar');
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

		var user = false;
		user = checkUsername();
		console.log(user.toString());
		if (user) {
			$.ajax({
				url : 'http://localhost/FAPServer/Login',
				type : 'POST',
				dataType : 'json',
				contentType : 'application/json',
				data : JSON.stringify({
					'loginName' : $('#username').val(),
					'passwort' : {
						'passwort' : $('#password').val()
					}
				}),
				success : function(data) {
					if (data) {
						var sessionId = data;
						alert('Erfolgreich angemeldet');
					} else {
						alert('Anmeldung fehlgeschlagen');
					}
				}
			});
		}
	});
}

