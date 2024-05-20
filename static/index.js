//create bounds that don't allow the camera to pan off the map
var southWestBound = L.latLng(-90,-180);
var northEastBound = L.latLng(90,185);
var boundedArea = L.latLngBounds(southWestBound,northEastBound);
var map = new L.map('map').setView([37.0902,95.7129],5)
const tileLayer = L.tileLayer('https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=api_key',{
// do not allow the user to zoom out of bounds
attribution : '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
minZoom : 3,
maxBoundsViscosity : 2
}).addTo(map);
map.setMaxBounds(boundedArea);
// push the panning of the camera back to where we can not pan outside of the bounds


map.on('drag', function() {
map.panInsideBounds(bounds, { animate: false });})

//track locations then add to map as marker
var selectedMarkers = [];

// gather the longitude and latitude of the selected markers and push them into the array

function postData(selectedMarkers)
{
    fetch("/dataCollection",{
        method : "POST",
        body : JSON.stringify(selectedMarkers),
        headers: {"Content-Type": "application/json"},
        credentials: "same-origin"
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        displayData(data);
    })
    .catch((error) => {
        console.error('Error:', error); 
    });
}
function onClick(e)
{
    
    if(selectedMarkers.length < 2)
    {
    selectedMarkers.push(e.latlng);
}
if (selectedMarkers.length == 2)
    {
        console.log(JSON.stringify(selectedMarkers));
        postData();
    }
}
// displaying the data that was processed through POST request
function displayData(data) {
    const responseData = document.getElementById('responseData');
    console.log('Response Data Element:', responseData);  // Log the responseData element
    console.log('Processed Data:', data);  // Log the processed data array
    
    if (Array.isArray(data)) {
        const firstPlaceName = data[0];
        const firstPlaceTemp = data[1];
        const secondPlaceName = data[2];
        const secondPlaceTemp = data[3];
        const difference = data[4];
        const firstAirportCode = data[5];
        const airportAveragePrice = data[6];
        const secondAirportCode = data[7];
        const airportMedianPrice = data[8];
        // calculate the distance (originally in meters, divide by 1609 to get miles)
        distance = (map.distance(selectedMarkers[0],selectedMarkers[1])/1609).toFixed(2);
        var polyLine = L.polyline(selectedMarkers,{
            color: 'red',
        }).addTo(map);
        console.log(secondAirportCode,airportMedianPrice)
        if (airportMedianPrice != "Unknown" && airportAveragePrice != "Unknown")
            {
        polyLine.bindTooltip(`${firstPlaceName}'s temperature: ${firstPlaceTemp}°F <br> ${secondPlaceName}'s temperature: ${secondPlaceTemp}°F <br> Difference in Temp: ${difference}°F <br> <br> Nearest direct flight to get to the location: <br> ${firstAirportCode} to ${secondAirportCode} <br> Average price: $${airportAveragePrice} <br> 
        Median price: $${airportMedianPrice} `,{permanent : true});
            }
        else
            {
                polyLine.bindTooltip(`${firstPlaceName}'s temperature: ${firstPlaceTemp}°F <br> ${secondPlaceName}'s temperature: ${secondPlaceTemp}°F <br> Difference in Temp: ${difference}°F <br> <br> There is no direct flight, or near flight within the next month.`,{permanent : true});
            }
    }
}

map.on("click", function (r) {
    if (selectedMarkers.length < 2) {
        var marker = new L.marker(r.latlng);
        marker.addTo(map);
        selectedMarkers.push([r.latlng.lat, r.latlng.lng]);
        console.log(selectedMarkers);
        if (selectedMarkers.length == 2) {
            postData(selectedMarkers);
        } 
    }
});
document.addEventListener('keydown', function(clicked) {
    if (clicked.key === 'r' || clicked.key === 'R') {
        keyRPress();
    }
});

// Reset the map, deleting all markers & lines
function resetMap() {
    map.eachLayer(function (layer) {
        if (layer !== tileLayer) {
            map.removeLayer(layer);
        }
    });
}

function keyRPress()
{
    var confirmation = confirm("Are you sure you want to delete both markers?")
    if(confirmation)
        {
            selectedMarkers = [];
            resetMap();
        }
}
