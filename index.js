//create bounds that don't allow the camera to pan off the map
var southWestBound = L.latLng(-90,-180);
var northEastBound = L.latLng(90,185);
var boundedArea = L.latLngBounds(southWestBound,northEastBound);
var map = new L.map('map').setView([37.0902,95.7129],5)
L.tileLayer('https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=key',{
// do not allow the user to zoom out of bounds
attribution : '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
minZoom : 3,
maxBoundsViscosity : 2
}).addTo(map);
map.setMaxBounds(boundedArea);
// push the panning of the camera back to where we can not pan outside of the bounds
map.on('drag', function() {
map.panInsideBounds(bounds, { animate: false });})
const latitudeAndLongitudes = [[31.2304,121.4737],[37.7749,-122.4194],[-40.9006,174.8860]];
const names = ["Shanghai","San Francisco", "New Zealand"];
//track locations then add to map as marker
const selectedMarkers = [];
for(let i = 0; i < latitudeAndLongitudes.length; ++i)
{
    var locationName = names[i];
    var place = L.marker(latitudeAndLongitudes[i],{title: names[i]}).bindPopup(names[i]).on('click',onClick)
    place.addTo(map);
}
// gather the longitude and latitude of the selected markers and push them into the array
function onClick(e)
{
    if (selectedMarkers.length == 1)
{
    // make sure to not use http-server servers (they are read-only)
$.ajax({
    url : 'http://127.0.0.1:8080/',
    method : "POST",
    dataType: 'jsonp',
    contentType: "application/json; charset=utf-8",
    data : JSON.stringify({selectedMarkers}),
    success : console.log("success")
});
}
    if(selectedMarkers.length < 2)
    {
    selectedMarkers.push(e.latlng);
    // calculate the distance (originally in meters, divide by 1609 to get miles)
    distance = (map.distance(selectedMarkers[0],selectedMarkers[1])/1609).toFixed(2);
    var polyLine = L.polyline(selectedMarkers,{
        color: 'red',
    }).addTo(map);
    let v1 = `${distance} miles`;
    polyLine.bindTooltip(v1,{permanent : true});
    const s = JSON.stringify(selectedMarkers);
}
else
alert("You have selected more than two markers, please unselect one or both markers!")
}
