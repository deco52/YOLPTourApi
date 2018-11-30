var map, cityData;

function initialize() {
	map = new Y.Map("map");
	map.drawMap(
		new Y.LatLng(35.485115, 137.937964),// ツアーの中心の緯度経度
		12,
		Y.LayerSetId.NORMAL
	);
	map.setConfigure("scrollWheelZoom", true);
	map.addControl(new Y.LayerSetControl());
	map.addControl(new Y.SliderZoomControlVertical());
	map.addControl(new Y.ScaleControl());

	var obj = new XMLHttpRequest();
	obj.onreadystatechange = function () {
		if (obj.readyState == 4 && obj.status == 200) ReadJson(obj.responseText);
	}
	obj.open("get", "iida_city_tour.json");
	obj.setRequestHeader("If-Modified-Since", "01 Jan 2000 00:00:00 GMT");
	obj.send(null);

	document.getElementById("reset").innerHTML = '<input type="button" value="リセット" onclick="Reset()"/>';

	document.getElementById("tour").innerHTML =
		'<input type="text" id="tourR" value="5" size="1">周'
		+ '<input type="button" value="ツアー開始" onclick="StartTour()"/>'
		+ '<input type="button" value="ツアー停止" onclick="StopTour()"/>'
		+ '<span id="now"></span>';
}

function ReadJson(text) {
	console.log(text);//　デバッグ用
	cityData = eval("(" + text + ")");
	var points = new Array();
	for (var i = 0; i < cityData.city.length; i++) {
		var point = new Y.LatLng(cityData.city[i].lat, cityData.city[i].lng);
		AddMarker(point, cityData.city[i].name, cityData.city[i].url);
		AddLink(cityData.city[i].name, point);
		points[i] = point;
	}
	points[i] = points[0];

	var style = new Y.Style("ff0000", 3, 0.5);
	var polyline = new Y.Polyline(points, { strokeStyle: style });
	map.addFeature(polyline);
}

function AddMarker(point, name, url) {
	var icon = new Y.Icon("img/" + name + ".jpg", { iconSize: new Y.Size(75, 50) });// アイコン画像の指定
	var marker = new Y.Marker(point, { icon: icon });
	var text = '<a href=' + url + " target=_new>" + name + '</a>';
	marker.bindInfoWindow(text);
	map.addFeature(marker);
}

function AddLink(name, point) {
	var lnk = document.createElement("a");
	lnk.innerHTML = name;
	lnk.href = "#";
	lnk.onclick = function () { GoTo(point.lat(), point.lng()); };
	document.getElementById("link").appendChild(lnk);

	var br = document.createElement("br");
	document.getElementById("link").appendChild(br);
}

function GoTo(lat, lng) { map.setCenter(new Y.LatLng(lat, lng)); }

function Reset() {
	document.getElementById("link").innerHTML = "";
	document.getElementById("reset").innerHTML = "";
	document.getElementById("tour").innerHTML = "";
	initialize();
}

var tourMax;
var timerID = new Array();
function StartTour() {
	var num = 0;
	var round = 1;

	tourMax = document.getElementById("tourR").value * cityData.city.length + 1;
	for (var i = 0; i < tourMax; i++) {
		if (num >= cityData.city.length) {
			num = 0;
			round++;
		}
		var point = new Y.LatLng(cityData.city[num].lat, cityData.city[num].lng);
		moveTimer(i, round, point, cityData.city[num].name);
		num++;
	}

	timerID[i] =
		setTimeout(function () { document.getElementById("now").innerHTML = ""; }, i * 1000);
}

function moveTimer(i, round, point, name) {
	timerID[i] = setTimeout(
		function () {
			map.panTo(point);
			document.getElementById("now").innerHTML = "(" + round + "周目)現在、" + name + "です。";
		},
		i * 1000
	);
}

function StopTour() {
	for (var i = 0; i < tourMax + 1; i++) {
		clearTimeout(timerID[i]);
	}
	document.getElementById("now").innerHTML = "";
}