const map = L.map('map').setView([23.6260333, -102.5375005], 5);
map.createPane('slip');
map.createPane('domain');

map.getPane('slip').style.zIndex = 500;
map.getPane('domain').style.zIndex = 400;
map.getPane('domain').style.pointerEvents = 'none';

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);







