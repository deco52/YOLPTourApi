var map, cityData;

/**
 * 初期処理
 */
function initialize() {
	map = new Y.Map("map");
	map.drawMap(
		new Y.LatLng(35.485115, 137.937964),// ツアーの中心の緯度経度
		12,// ズームレベル
		Y.LayerSetId.NORMAL// 通常地図を指定
	);
	// 行えるコントロールの種類を指定
	map.setConfigure("scrollWheelZoom", true);
	map.addControl(new Y.LayerSetControl());
	map.addControl(new Y.SliderZoomControlVertical());
	map.addControl(new Y.ScaleControl());

	// jsonの読み込み
	var obj = new XMLHttpRequest();
	obj.onreadystatechange = function () {
		if (obj.readyState == 4 && obj.status == 200) ReadJson(obj.responseText);
	}
	obj.open("get", "iida_city_tour.json");
	obj.setRequestHeader("If-Modified-Since", "01 Jan 2000 00:00:00 GMT");
	obj.send(null);

	// 各領域にボタンなどをセット
	document.getElementById("reset").innerHTML = '<input type="button" value="リセット" onclick="Reset()"/>';
	document.getElementById("tour").innerHTML =
		'<input type="text" id="tourR" value="5" size="1">周'
		+ '<input type="button" value="ツアー開始" onclick="StartTour()"/>'
		+ '<input type="button" value="ツアー停止" onclick="StopTour()"/>';
	
		document.getElementById("info").innerHTML = "ここに詳しい情報が表示されます";
}

/**
 * jsonの情報を使った処理を行うメソッド
 * @param text ファイルから読んだjsonテキスト
 */
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

/**
 * 表示するマーカーに関する処理を行うメソッド
 * @param point 緯度経度
 * @param name 名称
 * @param url 
 */
function AddMarker(point, name, url) {
	var icon = new Y.Icon("img/" + name + ".jpg", { iconSize: new Y.Size(75, 50) });// マップアイコン画像の指定
	var marker = new Y.Marker(point, { icon: icon });
	var text = '<a href=' + url + " target=_new>" + name + '</a>';
	marker.bindInfoWindow(text);
	map.addFeature(marker);
}

/**
 * リンク追加メソッド
 * @param name 
 * @param point 
 */
function AddLink(name, point) {
	var lnk = document.createElement("a");
	lnk.innerHTML = name;
	lnk.href = "#";
	lnk.onclick = function () {// 左のリンクがクリックされた場合
		GoTo(point.lat(), point.lng());
		document.getElementById("info").innerHTML = name;
		document.getElementById("img").innerHTML = "<img src=img/" + name +".jpg height=250 width=100% alt=サンプル画像>";
	};
	document.getElementById("link").appendChild(lnk);

	var br = document.createElement("br");
	document.getElementById("link").appendChild(br);
}

/**
 * 引数で指定した座標へジャンプするメソッド
 * @param lat 
 * @param lng 
 */
function GoTo(lat, lng) { map.setCenter(new Y.LatLng(lat, lng)); }

/**
 * 初期化メソッド
 */
function Reset() {
	document.getElementById("link").innerHTML = "";
	document.getElementById("reset").innerHTML = "";
	document.getElementById("tour").innerHTML = "";
	document.getElementById("info").innerHTML = "";
	document.getElementById("img").innerHTML = "";
	initialize();
}

/*
* ↓↓ツアー用の記述↓↓
*/
var tourMax;// 周回数
var timerID = new Array();

/**
 * ツアー開始
 */
function StartTour() {
	var num = 0;
	var round = 1;

	tourMax = document.getElementById("tour").value * cityData.city.length + 1;
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

/**
 * ツアーのタイマー
 * @param {*} i 
 * @param {*} round 
 * @param {*} point 
 * @param {*} name 
 */
function moveTimer(i, round, point, name) {
	timerID[i] = setTimeout(
		function () {
			map.panTo(point);
			document.getElementById("now").innerHTML = "(" + round + "周目)現在、" + name + "です。";
			console.log("(" + round + "周目)現在、" + name + "です。");// デバッグ用
		},
		i * 1000
	);
}

/**
 * ツアー停止
 */
function StopTour() {
	for (var i = 0; i < tourMax + 1; i++) {
		clearTimeout(timerID[i]);
	}
	document.getElementById("now").innerHTML = "";
}