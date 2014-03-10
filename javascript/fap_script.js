//Google Maps LatLng Objekt über prototype Attribut um Funktion erweitern, die die Distanz zwischen zwei LatLng Objekten ermittelt
google.maps.LatLng.prototype.distanceFrom = function(newLatLng) {
	// setup our variables
	var lat1 = this.lat();
	var radianLat1 = lat1 * (Math.PI / 180 );
	var lng1 = this.lng();
	var radianLng1 = lng1 * (Math.PI / 180 );
	var lat2 = newLatLng.lat();
	var radianLat2 = lat2 * (Math.PI / 180 );
	var lng2 = newLatLng.lng();
	var radianLng2 = lng2 * (Math.PI / 180 );
	// sort out the radius, MILES or KM?
	var earth_radius = 6378.1;
	// (km = 6378.1) OR (miles = 3959) - radius of the earth

	// sort our the differences
	var diffLat = (radianLat1 - radianLat2 );
	var diffLng = (radianLng1 - radianLng2 );
	// put on a wave (hey the earth is round after all)
	var sinLat = Math.sin(diffLat / 2);
	var sinLng = Math.sin(diffLng / 2);

	// maths - borrowed from http://www.opensourceconnections.com/wp-content/uploads/2009/02/clientsidehaversinecalculation.html
	var a = Math.pow(sinLat, 2.0) + Math.cos(radianLat1) * Math.cos(radianLat2) * Math.pow(sinLng, 2.0);

	// work out the distance
	var distance = earth_radius * 2 * Math.asin(Math.min(1, Math.sqrt(a)));

	// return the distance
	return distance;
};
// Google Maps Canvas initialisieren
function initialize() {
	// Google Map Options festlegen mit Default Standort und Zoom 8
	var mapOptions = {
		center : new google.maps.LatLng(51, 7),
		zoom : 8
	};
	// Google Maps Object mit Map Options erstellen
	map = new google.maps.Map($("#map")[0], mapOptions);
}

// Google Maps alle Marker löschen
function clearAllMarkers() {
	if (markers) {
		for (i in markers) {
			markers[i].setMap(null);
		}
		markers.length = 0;
	}
}

// Google Maps Marker setzen (globale Liste)
function addMarker(marker) {
	this.markers.push(marker);
}

// Nutzung REST Service um Benutzer hinzuzufügen
function addUser() {
	// Wenn User verfügbar, Passwort Check erfolgreich und Captcha richtig ist
	if (user && password_validate && captcha) {
		// AJAX Aufruf des REST Service um Benutzer hinzuzufügen
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
				'telefon' : $('#phone').val(),
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
		//Wenn eingehende Prüfung nicht erfolgreich -> Fehlermeldung
		if (!user) {
			alert('Benutzer nicht verfügbar');
		} else if (!password_validate) {
			alert('Passwörter stimmen nicht überein');
		} else if (!captcha) {
			alert('Captcha Eingabe ist falsch');
		}
	};
}

//Verfügbarkeit des Benutzernamens prüfen
function checkUsername() {
	var user;
	// AJAX Aufruf des REST Service um Login Namen zu prüfen
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
			if (data) {
				user = false;
			} else {
				user = true;
			}
		}
	});
	return user;

}

//Eingegebenes Passwort validieren
function passwordCheck() {
	//Input Felderwerte holen
	var password = $('#password').val();
	var password_check = $('#password_check').val();
	// Wenn Inputfelder übereinstimmen
	if (password == password_check) {
		//Passwort mindestens 8 Zeichen lang
		if (password.length < 8) {
			$('#password_validate').text('password must have 8 characters');
			password_validate = false;
			//Passwort darf nicht leer sein
		} else if (password != '') {
			$('#password_validate').text('passwords match');
			password_validate = true;
			//Passwort wurde nie eingegeben
		} else if (password == '' || typeof password === 'undefined') {
			$('#password_validate').text('password is emtpy');
			password_validate = false;
		}
		// Wenn Inputfelder nicht übereinstimmen
	} else {
		$('#password_validate').text('passwords dont match');
		password_validate = false;
	};
}

//Geonames.org REST Service Nutzung Standort über PLZ im Canvas setzen
function getLocationByPostal() {
	//AJAX Aufruf des REST Service von Geonames.org
	$.ajax({
		url : 'http://api.geonames.org/postalCodeSearchJSON?username=Babbafett',
		//jsonp für Callback Rückgabe
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
					name_equals : data.postalCodes[0].placeName,
					featureClass : 'P',
					style : 'full',
					country : 'DE',
					maxRows : 12,
					lang : 'de'
				},
				success : function(data) {
					if ( typeof data.geonames[0] != 'undefined') {
						//Land Text setzen
						$('#country').val(data.geonames[0].countryName);
						//Lat und Lng Objekt des zurückgegebener Standort erstellen
						var latlng = new google.maps.LatLng(data.geonames[0].lat, data.geonames[0].lng);
						lat = data.geonames[0].lat;
						lng = data.geonames[0].lng;
						//Zoom von Google Maps Canvas größer auf 13 setzen
						map.setZoom(13);
						map.setCenter(latlng);
						//vorhandene Marker lösche und neuen Marker an Standort setzen
						clearAllMarkers();
						addMarker(new google.maps.Marker({
							map : map,
							position : latlng
						}));
					}

				}
			});
		}
	});

}

//Geonames.org REST Service Nutzung Standort über Stadtnamen im Canvas setzen
function getLocationByCity() {
	//AJAX Aufruf des REST Service von Geonames.org
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
			if ( typeof data.geonames[0] != 'undefined') {
				$('#country').val(data.geonames[0].countryName);
				var latlng = new google.maps.LatLng(data.geonames[0].lat, data.geonames[0].lng);
				lat = data.geonames[0].lat;
				lng = data.geonames[0].lng;
				map.setZoom(13);
				map.setCenter(latlng);
				clearAllMarkers();
				addMarker(new google.maps.Marker({
					map : map,
					position : latlng
				}));
			}

		}
	});

}

//Google Geocoder Nutzung Standort über Straßennamen im Canvas setzen
function getLocationByStreet() {
	//Google Geocoder Objekt erstellen
	geocoder = new google.maps.Geocoder();
	var address;
	//durch keyUp Event bedingte Prüfung, ob bereits Eingaben erfolgt sind, um Suchergebnisse des Standorts zu verbessern
	//Ergebnis setzt Suchstring für den AJAX Aufruf
	if ($('#city').val() != '' && $('#postal').val() != '') {
		if (postal && city) {
			address = $('#street').val() + ' ' + city_string + ' ' + postal_string;
		} else if (postal && !city) {
			address = $('#street').val() + ' ' + postal_string;
		} else if (!postal && city) {
			address = $('#street').val() + ' ' + city_string;
		} else {
			if (( typeof postal_string !== 'undefined' && postal_string != '') && ( typeof city_string !== 'undefined' && city_string != '')) {
				address = $('#street').val() + ' ' + city_string + ' ' + postal_string;
			} else if ( typeof postal_string !== 'undefined' && postal_string != '') {
				address = $('#street').val() + ' ' + postal_string;
			} else if ( typeof city_string !== 'undefined' && city_string != '') {
				address = $('#street').val() + ' ' + city_string;
			} else {
				address = $('#street').val();
			}
		}
	} else {
		address = $('#street').val();
		postal = false;
		city = false;
	}
	//Geocoder Call mit Suchstring (Adresse)
	geocoder.geocode({
		'address' : address
	}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			map.setZoom(15);
			map.setCenter(results[0].geometry.location);
			clearAllMarkers();
			addMarker(new google.maps.Marker({
				map : map,
				position : results[0].geometry.location
			}));

			lat = results[0].geometry.location.lat;
			lng = results[0].geometry.location.lng;
			//JSON iterieren
			for (var i = 0; i < results[0].address_components.length; i++) {
				for (var j = 0; j < results[0].address_components[i].types.length; j++) {
					if (results[0].address_components[i].types[j] == 'locality') {
						$('#city').val(results[0].address_components[i].long_name);
						city = false;
					} else if (results[0].address_components[i].types[j] == 'country') {
						$('#country').val(results[0].address_components[i].long_name);
					} else if (results[0].address_components[i].types[j] == 'postal_code') {
						$('#postal').val(results[0].address_components[i].long_name);
						postal = false;
					}
				}
			}

		}
	});
}

//Captcha Prüfung
function checkCaptcha() {
	var input = $('#captcha').val();
	if (result == input) {
		$('#check_captcha').text('input right');
		captcha = true;
	} else {
		$('#check_captcha').text('input wrong');
		captcha = false;
	};
}

//Captcha generieren
function generateCaptcha() {
	$(document).ready(function() {
		//zwei Zufallszahlen von 1-10 zufällig generieren
		var numberA = 1 + Math.floor(Math.random() * 10);
		var numberB = 1 + Math.floor(Math.random() * 10);
		//Captcha Ergebnis setzen
		result = numberA + numberB;
		$('#captcha_label').text(numberA.toString() + ' + ' + numberB.toString() + ' = ?');
	});
}

//Benutzerlogin
function login() {
	$(document).ready(function() {

		var user;
		user = checkUsername();
		//Wenn User vorhanden
		if (!user) {
			//AJAX Aufruf des REST Service um Benutzer einzuloggen
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
					if (data) {
						var sessionId = data;
						createCookie($('#username').val(), sessionId, 7);
						//Bei erfolgreichem Login bzw. Rückgabewert Weiterleitung um Standort zu setzen
						location.href = "setMyLocation.html";
					} else {
						//Fehlermeldung Login fehlgeschlagen
						alert('Anmeldung fehlgeschlagen');
					}
				}
			});
		}
	});
}

//Cookie setzen
function createCookie(name, value, days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		//Gültigkeit des Cookies
		var expires = "; expires=" + date.toGMTString();
	} else
		var expires = "";
	//Cookie anlegen
	document.cookie = name + "=" + value + expires + "; path=http://localhost/fap_client/html/index.html";
}

//Cookie lesen und Session wiedergeben
function readCookieSessionId() {

	var ca = document.cookie.split(';');

	var cookieString = ca[0];

	var index = cookieString.search("=");

	return cookieString.substring(index + 4, 18);

}

//Cookie lesen und Benutzernamen wiedergeben
function readCookieUserName() {

	var ca = document.cookie.split(';');

	var cookieString = ca[0];

	var index = cookieString.search("=");

	return cookieString.substring(0, index);

}

//Cookie löschen
function deleteCookie() {

	var name = readCookieUserName();
	var json;
	var username = readCookieUserName();
	var session = readCookieSessionId();
	json = JSON.stringify({
		'loginName' : username.toString(),
		'sitzung' : {
			'sitzungsID' : session.toString()
		}
	});
	//Cookie Gültigkeit auf Vergangenheit setzen, um Ungültigkeit zu erzwingen
	document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	//AJAX Aufruf des REST Service um Benutzer auszuloggen und Session zu löschen
	$.ajax({
		url : 'http://localhost/FAPServer/logout',
		type : 'DELETE',
		dataType : 'json',
		contentType : 'application/json',
		data : json,
		error : function(xhr, status) {
			console.log(status);
		},
		success : function(data) {
			if (data) {
				alert('Logout');
			} else {
				alert('Logout fail');
			}
		}
	});
	// Nach Logout zur Login Seite weiterleiten
	location.href = "login.html";
}

//Aktuelles Adressbuch zurückgeben
function getContacts() {
	//Session und Benutzernamen aus Cookie lesen
	var username = readCookieUserName();
	var session = readCookieSessionId();
	var table;
	//AJAX Aufruf des REST Service um Adressbuch zu ermitteln
	$.ajax({
		url : 'http://localhost/FAPServer/getAdressbuch',
		type : 'GET',
		//synchroner Aufruf um variable synchron zurückzugeben
		async : false,
		dataType : 'json',
		contentType : 'application/json',
		data : {
			id : username.toString(),
			sid : session.toString()
		},

		success : function(data) {
			//JSON iterieren und entsprechende HTML Struktur generieren
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
				if ( typeof data.kontakte[contact].telefon === 'undefined') {
					table += '<td></td>';
				} else {
					table += '<td>' + data.kontakte[contact].telefon + '</td></tr>';
				}
			}
		}
	});
	//HTML Struktur zurückgeben
	return table;
}

//Edit und Add Mode setzen
function changeMode(active, mode) {
	var status;
	if (mode == 1) {
		if (!active) {
			status = true;
			//Forumlar einblenden, Status setzen und Formular mit zu editierenden Datensatz befüllen
			$('#edit_adressbook').show();
			$('#mode').text('Change mode on');
			$(currentUi.selected).children().each(function(index, value) {
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
				} else if (index == 7) {
					$('#phone').val($(value).text());
				}
			});
		} else {
			//Modus verlassen und Formular wieder ausblenden
			status = false;
			$('#edit_adressbook').hide();
			$('#mode').text('');
		}
	} else if (mode == 2) {
		if (!active) {
			//Forumlar einblenden und Status setzen
			status = true;
			$('#mode').text('Add Mode on');
			$('#name').val(null);
			$('#surname').val(null);
			$('#username').val(null);
			$('#postal').val(null);
			$('#city').val(null);
			$('#street').val(null);
			$('#mail').val(null);
			$('#phone').val(null);
			$('#edit_adressbook').show();
		} else {
			//Modus verlassen und Formular wieder ausblenden
			status = false;
			$('#edit_adressbook').hide();
			$('#mode').text('');
		}

	}

	return status;
}

//aktuellen Standort vom gegebenen Benutzernamen mit Hilfe von Google Geocoder zurückgeben
function getLocation(loginName) {
	//Eingabemaske ausblenden
	$('#location_search').hide();
	//Geocoder Object erstellen
	geocoder = new google.maps.Geocoder();
	var latlng;
	//Prüfen ob Benutzername vorhanden
	var invalidUser = checkUsername();
	if (!invalidUser) {
		$('#location_search').show();
		initialize();
		//AJAX Aufruf des REST Service um aktuellen Standort zu ermitteln
		$.ajax({
			url : 'http://localhost/FAPServer/getStandort/' + loginName,
			type : 'GET',
			async : false,
			dataType : 'json',
			contentType : 'application/json',
			success : function(data) {
				$('#surname').val(data.nachname);
				$('#name').val(data.vorname);
				$('#nameSearched').val(data.loginName);
				latlng = JSON.stringify({
					'lng' : data.standort.laengengrad,
					'lat' : data.standort.breitengrad
				});
				var latlng = new google.maps.LatLng(data.standort.breitengrad, data.standort.laengengrad);
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
						var street;
						for (var i = 0; i < results[0].address_components.length; i++) {
							for (var j = 0; j < results[0].address_components[i].types.length; j++) {
								if (results[0].address_components[i].types[j] == 'locality') {
									$('#city').val(results[0].address_components[i].long_name);
								} else if (results[0].address_components[i].types[j] == 'country') {
									$('#country').val(results[0].address_components[i].long_name);
								} else if (results[0].address_components[i].types[j] == 'postal_code') {
									$('#postal').val(results[0].address_components[i].long_name);
								} else if (results[0].address_components[i].types[j] == 'route') {
									street = results[0].address_components[i].long_name;
								} else if (results[0].address_components[i].types[j] == 'street_number') {
									street += results[0].address_components[i].long_name;
								}
							}
						}
						$('#street').val(street);

					}
				});

			}
		});

	} else {
		alert('User not valid!');
	}

	return latlng;
}

//Adressbuch setzen
function setAdressbook() {
	var value1;
	var value2;
	var value3;
	var value4;
	var value5;
	var value6;
	var value7;
	var value8;
	var json;
	var count = 1;
	var string;
	//JSON aufbauen
	json = "{'kontakte':[";
	//aktuelles Adressbuch itereieren, Values setzen und das JSON weiter aufbauen
	$('#tableBody').children().each(function(index, value) {
		if (count > 1 && count <= $('#tableBody').children().length) {
			json = json + ',';
		}
		$(value).children().each(function(i, v) {
			if (i == 0) {
				value1 = $(v).text();
			} else if (i == 1) {
				value2 = $(v).text();
			} else if (i == 2) {
				value3 = $(v).text();
			} else if (i == 3) {
				value4 = $(v).text();
			} else if (i == 4) {
				value5 = $(v).text();
			} else if (i == 5) {
				value6 = $(v).text();
			} else if (i == 6) {
				value7 = $(v).text();
			} else if (i == 7) {
				value8 = $(v).text();
			}

		});
		string = "{'nachname' :" + value1 + ",'vorname' :" + value2 + ",'benutzername' :" + value3 + ",'PLZ' :" + value4 + ",'ort' :" + value5 + ",'strasse' :" + value6 + ",'mail' :" + value7 + ", 'telefon' :" + value8 + "}";

		json = json + string;
		count++;
	});
	//JSON Aufbaulogik abschließen
	json = json + ']}';
	//JSON aus String erstellen
	json = JSON.stringify(json);
	//AJAX Aufruf des REST Service um aktuelles Adressbuch zu setzen
	$.ajax({
		url : 'http://localhost/FAPServer/setAdressbuch',
		type : 'PUT',
		dataType : 'json',
		contentType : 'application/json',
		data : json,
		error : function(xhr, status) {
			console.log(status);
		},
		success : function(data) {
			if (data) {
				alert('Adressbook is set');
			} else {
				alert('Adressbook not set');
			}
		}
	});

}

//Kontakt dem aktuellen anzeigenden Adressbuch hinzufügen
function addContact() {
	var table;
	//Werte aus Inputfelder lesen und <tr> Datensatz aufbauen
	table += '<tr><td>';
	if ( typeof $('#name').val() === 'undefined') {
		table += '</td>';
	} else {
		table += $('#name').val() + '</td>';
	}
	if ( typeof $('#surname').val() === 'undefined') {
		table += '<td></td>';
	} else {
		table += '<td>' + $('#surname').val() + '</td>';
	}
	if ( typeof $('#username').val() === 'undefined') {
		table += '<td></td>';
	} else {
		table += '<td>' + $('#username').val() + '</td>';
	}
	if ( typeof $('#postal').val() === 'undefined') {
		table += '<td></td>';
	} else {
		table += '<td>' + $('#postal').val() + '</td>';
	}
	if ( typeof $('#city').val() === 'undefined') {
		table += '<td></td>';
	} else {
		table += '<td>' + $('#city').val() + '</td>';
	}
	if ( typeof $('#street').val() === 'undefined') {
		table += '<td></td>';
	} else {
		table += '<td>' + $('#street').val() + '</td>';
	}
	if ( typeof $('#mail').val() === 'undefined') {
		table += '<td></td>';
	} else {
		table += '<td>' + $('#mail').val() + '</td>';
	}
	if ( typeof $('#phone').val() === 'undefined') {
		table += '<td></td>';
	} else {
		table += '<td>' + $('#phone').val() + '</td>';
	}
	//<tr> HTML Struktur zurückgeben
	return table;
}

//aktuellen Standort setzen
function setLocation(lat, lng) {
	var json;
	var username = readCookieUserName();
	var session = readCookieSessionId();
	//JSON aufbauen
	json = JSON.stringify({
		'loginName' : username.toString(),
		'sitzung' : {
			'sitzungsID' : session.toString()
		},
		'standort' : {
			'breitengrad' : lng.toString(),
			'laengengrad' : lat.toString()
		}
	});
	//AJAX Aufruf des REST Service um aktuellen Standort zu setzen
	$.ajax({
		url : 'http://localhost/FAPServer/setStandort',
		type : 'PUT',
		dataType : 'json',
		contentType : 'application/json',
		data : json,
		error : function(xhr, status) {
			console.log(status);
		},
		success : function(data) {
			if (data) {
				alert('Location is set');
			} else {
				alert('Location is not set');
			}
		}
	});
	//Nach Setzen des Standorts zum Adressbuch weiterleiten
	location.href = "addressbook.html";

}

//Personen in der Umgebung des aktuellen Standorts innerhalb eines definierten Radius zurückgeben
function getNearbyPeople(radius) {
	clearAllMarkers();
	$('tableBody').html('');
	$('#map').show();
	initialize();
	var username = readCookieUserName();
	var session = readCookieSessionId();
	var latlng;
	var table;
	//AJAX Aufruf des REST Service um den aktuellen Standort zu ermitteln
	$.ajax({
		url : 'http://localhost/FAPServer/getStandort/' + username,
		type : 'GET',
		async : false,
		dataType : 'json',
		contentType : 'application/json',
		success : function(data) {
			latlng = new google.maps.LatLng(data.standort.breitengrad, data.standort.laengengrad);
		}
	});
	map.setCenter(latlng);
	map.setZoom(4);
	//AJAX Aufruf des REST Service um aktuelles Adressbuch des Benutzers zu ermitteln
	$.ajax({
		url : 'http://localhost/FAPServer/getAdressbuch',
		type : 'GET',
		async : false,
		dataType : 'json',
		contentType : 'application/json',
		data : {
			id : username.toString(),
			sid : session.toString()
		},

		success : function(data) {
			addMarker(new google.maps.Marker({
				map : map,
				position : latlng,
				clickable : true
			}));
			var content = 'current Location of ' + username.toString();
			addInfoWindow(content);

			//JSON iterieren
			for (contact in data.kontakte) {
				var index = 1;
				var lat;
				var lng;
				if ( typeof data.kontakte[contact].standort !== 'undefined') {
					lat = data.kontakte[contact].standort.breitengrad;
				}
				if ( typeof data.kontakte[contact].standort !== 'undefined') {
					lng = data.kontakte[contact].standort.laengengrad;
				}
				//Distanz mit prototype Funktion (siehe Anfang des Skripts) ermitteln
				var compareLatLng = new google.maps.LatLng(lat, lng);
				var km = latlng.distanceFrom(compareLatLng);
				console.log(km);
				//Prüfen ob Distanz innerhalb des angegebenen Radius
				if (km <= radius) {

					addMarker(new google.maps.Marker({
						map : map,
						position : compareLatLng,
						clickable : true
					}));
					if ( typeof data.kontakte[contact].name === 'undefined') {
						if ( typeof data.kontakte[contact].vorname === 'undefined') {
							content = 'no user details';
							addInfoWindow(content);
						} else {
							content = 'current Location of ' + data.kontakte[contact].vorname;
							addInfoWindow(content);
						}
					} else {
						if ( typeof data.kontakte[contact].vorname === 'undefined') {
							content = 'current Location of ' + data.kontakte[contact].name;
							addInfoWindow(content);
						} else {
							content = 'current Location of ' + data.kontakte[contact].name + ', ' + data.kontakte[contact].vorname;
							addInfoWindow(content);
						}
					}

					index++;
					//HTML Struktur der Personen aufbauen
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
					if ( typeof data.kontakte[contact].telefon === 'undefined') {
						table += '<td></td>';
					} else {
						table += '<td>' + data.kontakte[contact].telefon + '</td></tr>';
					}
				}

			}
		}
	});

	if ( typeof table !== 'undefined') {
		setInfoWindows();
		//HTML Struktur setzen und anzeigen
		$('#tableBody').html(table);
		$('#people').show();
		getInfoWindow(0).open(map, getMarker(0));
	} else {
		$('#people').hide();
		$('#map').hide();
		$('#tableBody').html('');
		alert('No Nearby People found');

	}

	return table;

}

function getMarker(index) {
	return this.markers[index];
}

function getInfoWindow(index) {
	return this.infoWindows[index];
}

function addInfoWindow(content) {
	this.infoWindows.push(new google.maps.InfoWindow({
		content : content
	}));
}

function setInfoWindows() {
	for (var i = 0; i < this.markers.length; i++) {
		this.markers[i].info = this.infoWindows[i];
		google.maps.event.addListener(this.markers[i], 'click', function() {
			this.info.open(map, this);
		});
	}
}

