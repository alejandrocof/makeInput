const estaciones=[
{"INSTITUCION": "IINGEN", "CLAVE": "PANG", "ESTADO": "Oaxaca", "LATITUD":"15.67", "LONGITUD":"-96.49"},
{"INSTITUCION": "IINGEN", "CLAVE": "TAJN", "ESTADO": "Chiapas", "LATITUD":"14.92", "LONGITUD":"-92.27"},
{"INSTITUCION": "IINGEN", "CLAVE": "OXLC", "ESTADO": "Oaxaca", "LATITUD":"17.07", "LONGITUD":"-96.7"},
{"INSTITUCION": "IINGEN", "CLAVE": "OXBJ", "ESTADO": "Oaxaca", "LATITUD":"17.07", "LONGITUD":"-96.72"},
{"INSTITUCION": "IINGEN", "CLAVE": "MIHL", "ESTADO": "Veracruz", "LATITUD":"17.99", "LONGITUD":"-94.54"},
{"INSTITUCION": "IINGEN", "CLAVE": "PHPU", "ESTADO": "Puebla", "LATITUD":"19.04", "LONGITUD":"-98.17"},
{"INSTITUCION": "IINGEN", "CLAVE": "HMTT", "ESTADO": "Guerrero", "LATITUD":"17.8", "LONGITUD":"-98.56"},
{"INSTITUCION": "IINGEN", "CLAVE": "XALA", "ESTADO": "Veracruz", "LATITUD":"19.53", "LONGITUD":"-96.9"},
{"INSTITUCION": "IINGEN", "CLAVE": "COYC", "ESTADO": "Guerrero", "LATITUD":"17", "LONGITUD":"-100.09"},
{"INSTITUCION": "IINGEN", "CLAVE": "ACP2", "ESTADO": "Guerrero", "LATITUD":"16.87", "LONGITUD":"-99.89"},
{"INSTITUCION": "IINGEN", "CLAVE": "TEJU", "ESTADO": "México", "LATITUD":"18.9", "LONGITUD":"-100.16"},
{"INSTITUCION": "IINGEN", "CLAVE": "ATYC", "ESTADO": "Guerrero", "LATITUD":"17.21", "LONGITUD":"-100.43"},
{"INSTITUCION": "IINGEN", "CLAVE": "VNTA", "ESTADO": "Guerrero", "LATITUD":"16.91", "LONGITUD":"-99.82"},
{"INSTITUCION": "IINGEN", "CLAVE": "ACAM", "ESTADO": "Guanajuato", "LATITUD":"20.04", "LONGITUD":"-100.72"},
{"INSTITUCION": "IINGEN", "CLAVE": "PET2", "ESTADO": "Guerrero", "LATITUD":"17.54", "LONGITUD":"-101.26"},
{"INSTITUCION": "IGEOF", "CLAVE": "CMIG", "ESTADO": "Oaxaca", "LATITUD":"17.09", "LONGITUD":"-94.88"},
{"INSTITUCION": "IGEOF", "CLAVE": "TGIG", "ESTADO": "Chiapas", "LATITUD":"16.78", "LONGITUD":"-93.12"},
{"INSTITUCION": "IGEOF", "CLAVE": "TUIG", "ESTADO": "Veracruz", "LATITUD":"18.03", "LONGITUD":"-94.42"},
{"INSTITUCION": "IGEOF", "CLAVE": "TPIG", "ESTADO": "Puebla", "LATITUD":"18.42", "LONGITUD":"-97.36"},
{"INSTITUCION": "IGEOF", "CLAVE": "PPIG", "ESTADO": "México", "LATITUD":"19.07", "LONGITUD":"-98.63"},
{"INSTITUCION": "IGEOF", "CLAVE": "PNIG", "ESTADO": "Oaxaca", "LATITUD":"16.39", "LONGITUD":"-98.13"},
{"INSTITUCION": "IGEOF", "CLAVE": "HLIG", "ESTADO": "Oaxaca", "LATITUD":"17.83", "LONGITUD":"-97.8"},
{"INSTITUCION": "IGEOF", "CLAVE": "TLIG", "ESTADO": "Guerrero", "LATITUD":"17.56", "LONGITUD":"-98.57"},
{"INSTITUCION": "IGEOF", "CLAVE": "MEIG", "ESTADO": "Guerrero", "LATITUD":"17.92", "LONGITUD":"-99.62"},
{"INSTITUCION": "IGEOF", "CLAVE": "ZIIG", "ESTADO": "Guerrero", "LATITUD":"17.61", "LONGITUD":"-101.46"},
{"INSTITUCION": "IGEOF", "CLAVE": "DHIG", "ESTADO": "Hidalgo", "LATITUD":"20.3", "LONGITUD":"-99.04"}
]

const optIcon = L.Icon.extend({
	options: {
		shadowUrl: 'sombra.png',
		iconSize:     [20, 30],
		shadowSize:   [20, 4],
		iconAnchor:   [10, 30],
		shadowAnchor: [10, 2],
		popupAnchor:  [0, -30]
	}
});

const marcadorIcon = new optIcon({iconUrl: 'marcador.png'});
const marcadorRojoIcon = new optIcon({iconUrl: 'marcadorRojo.png'});
const marcadorVerdeIcon = new optIcon({iconUrl: 'marcadorVerde.png'});
const marcadorAmarilloIcon = new optIcon({iconUrl: 'marcadorAmarillo.png'});

//var imageUrl = 'Vx3D-MaxZ.png';
//imageBounds = [[ymin, xmin], [ymax, xmax]];
//L.imageOverlay(imageUrl, imageBounds, {opacity:'0.5', zIndex:'0'}).addTo(map);

estaciones.forEach(estacion => {
	//console.log(estacion.CLAVE, estacion.LONGITUD, estacion.LATITUD)
	
	
	let text="Clave: "+estacion.CLAVE+"<br>";
	text+=`Institución:${+(estacion["INSTITUCION"]==="")?" Sin datos":estacion["INSTITUCION"]}<br>`;
	text+=`Estado:${+(estacion["ESTADO"]==="")?" Sin datos":estacion["ESTADO"]}<br>`;
	text+=`Latitud:${+(estacion["LATITUD"]==="")?" Sin datos":estacion["LATITUD"]}<br>`;
	text+=`Longitud:${+(estacion["LONGITUD"]==="")?" Sin datos":estacion["LONGITUD"]}<br>`;

	if(estacion["INSTITUCION"]=="IINGEN"){
		const mmarcador = L.marker([estacion.LATITUD, estacion.LONGITUD], {icon: marcadorRojoIcon}).bindPopup(text).addTo(map);
	}
	else if(estacion["INSTITUCION"]=="IGEOF"){
		const mmarcador = L.marker([estacion.LATITUD, estacion.LONGITUD], {icon: marcadorVerdeIcon}).bindPopup(text).addTo(map);
	}
	else if(estacion["INSTITUCION"]=="Amarillo"){
		const mmarcador = L.marker([estacion.LATITUD, estacion.LONGITUD], {icon: marcadorAmarilloIcon}).bindPopup(text).addTo(map);
	}
	else {
		const mmarcador = L.marker([estacion.LATITUD, estacion.LONGITUD], {icon: marcadorIcon}).bindPopup(text).addTo(map);
	}
		
});
