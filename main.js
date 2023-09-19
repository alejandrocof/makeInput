const map = L.map('map').setView([23.6260333, -102.5375005], 5);
map.createPane('celdas');
map.createPane('slip');
map.createPane('domain');

map.getPane('celdas').style.zIndex = 300;
map.getPane('slip').style.zIndex = 200;
map.getPane('domain').style.zIndex = 100;
map.getPane('domain').style.pointerEvents = 'none';

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);







