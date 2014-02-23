
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