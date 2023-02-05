// json parsing
const jsonURL = 'http://localhost:8000/parking_spaces'

function Get(jsonURL){
    var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET",jsonURL,false);
    Httpreq.send(null);
    return Httpreq.responseText;          
}

// update status every 2 seconds
setInterval(updateSpots, 2000);

var map;
var noPoi = [
    {
        featureType: "poi",
        stylers: [
          { visibility: "off" }
        ]   
      }
    ];
var defaultOptions = {
    zoom:19,
    center:{lat:43.8899806,lng:-79.3120005},
    styles: noPoi
  }
var mapBounds;

var directionsRenderer;
var directionsService;

var clickOrigin;
var clickDestination;
var clickChoice = 0;
var routeMarkers = [];

var adding = false;
var pointsClicked = 0;
var corners = [];

var numSpots = 0;

function initMap(){
    directionsRenderer = new google.maps.DirectionsRenderer({suppressMarkers: true});
    directionsService = new google.maps.DirectionsService();

    map = new google.maps.Map(document.getElementById('map'), defaultOptions);
    mapBounds = new google.maps.LatLngBounds();

    // load and put spots
    loadAllSpots();

    google.maps.event.addListener(map, 'click', function(event){
        if (clickChoice == 0)
        {
            clickOrigin = {coords:event.latLng};
            routeMarkers.push(placeMarker(clickOrigin.coords, "./CarMarker.png"));
                pickDestination();
        }
        else if (clickChoice == 1)
        {
            clickDestination = {coords:event.latLng};
            directionsRenderer.setMap(map);
            getRoute(directionsRenderer, directionsService);
            pickDone();
        }
        else if (clickChoice == 2)
        {
            pointsClicked++;
            document.getElementById("PickLabel").textContent = "Select " + (4 - pointsClicked) + " more points";
            corners.push(event.latLng);

            if (pointsClicked == 4) {
                pointsClicked = 0;
                putSpot(corners);
                corners = [];
                document.getElementById("PickLabel").textContent = "Spot added. Keep clicking to add more";
            }
        }
    });
}

function pickDone()
{
    clickChoice = -1;
    document.getElementById("PickLabel").textContent = "Route Calculated";
    document.getElementById("ResetRouteButton").disabled = false;
}

function pickDestination()
{
    clickChoice = 1;
    document.getElementById("PickLabel").textContent = "Choose Destination";
}

function placeMarker(position, icon)
{
    marker = new google.maps.Marker({
        position: position,
        map:map,
        icon: icon,
      });
    return marker;
}

function resetData()
{
    clickChoice = 0;
    document.getElementById("PickLabel").textContent = "Choose Origin";
    document.getElementById("ResetRouteButton").disabled = true;
    clearMarkers(routeMarkers);
    routeMarkers = [];
    directionsRenderer.setMap(null);
}

function recenter()
{
    map.setCenter(defaultOptions.center);
    map.setZoom(defaultOptions.zoom);
}

function clearMarkers(markers)
{
    for (let index = 0; index < markers.length; index++) {
        markers[index].setMap(null);
        markers[index] = null;
    }
}

function getRoute(directionsRenderer, directionsService)
{
    directionsService
    .route({
            origin:clickOrigin.coords,
            destination:clickDestination.coords,
            travelMode:google.maps.TravelMode["DRIVING"],
    })
    .then((response) => {
        directionsRenderer.setDirections(response);
        clearMarkers(routeMarkers);
        routeMarkers = [];
        routeMarkers.push(placeMarker(response.routes[0].legs[0].start_location, "./CarMarker.png"));
        routeMarkers.push(placeMarker(response.routes[0].legs[0].end_location, "./ParkingMarker.png"));
    })
    .catch((e) => window.alert("Direction request failed."));

}

function resetAdding()
{
    document.getElementById("AddSpotButton").textContent = "Add Parking Spot";
    adding = false;
    corners = [];
    pointsClicked = 0;
    resetData();
}

// initiating placing spot from ui
function addingSpot()
{
    if (!adding)
    {
        adding = true;
        clickChoice = 2;
        document.getElementById("PickLabel").textContent = "Click to add a spot";
        document.getElementById("AddSpotButton").textContent = "Done";
    }
    else
    {
        resetAdding();
    }
}

// admin placing spot
function putSpot(corners)
{
    // add POST to json later

    window['spot'+(numSpots + 1)] = new google.maps.Polygon({
        paths: corners,
        strokeColor: "#00FF00",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#00FF00",
        fillOpacity: 0.35,
        editable: true,
        draggable: true,
        geodesic: true
    });
    window['spot'+(numSpots + 1)].setMap(map);
    numSpots++;
}

// loading all spots from remote
function loadAllSpots()
{
    let spotData = JSON.parse(Get(jsonURL));
    numSpots = spotData.length;

    for (let i = 0; i < numSpots; i++) {
        let coords = spotData[i].corners;
        let open = spotData[i].open;

        // spots are stored here, by ID
        window['spot'+spotData[i].id] = new google.maps.Polygon({
            paths: [
                { lat: coords[0][0], lng: coords[0][1] },
                { lat: coords[1][0], lng: coords[1][1] },
                { lat: coords[2][0], lng: coords[2][1] },
                { lat: coords[3][0], lng: coords[3][1] },
            ],
            strokeColor: open ? "#00FF00": "#FF0000",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: open ? "#00FF00": "#FF0000",
            fillOpacity: 0.35,
            editable: true,
            draggable: true,
            geodesic: true
        });
        window['spot'+spotData[i].id].setMap(map);
    }
}

// check json for updates and apply them
function updateSpots()
{
    let json_obj = JSON.parse(Get(jsonURL));
    for(let i = 0; i < json_obj.length; i++) {
        let spot = json_obj[i];
        if (!(spot.open === window['spot'+spot.id].open)) {
            window['spot'+spot.id].setOptions({strokeColor: spot.open ? "#00FF00": "#FF0000", fillColor: spot.open ? "#00FF00": "#FF0000"});
            window['spot'+spot.id].open = spot.open;
        }
    }
}