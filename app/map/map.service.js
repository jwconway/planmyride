'use strict';
google.load('visualization', '1', {
    packages: ['corechart']
});

var thisWayPoints = new Array();
var thisElevations = new Array();
var map, directionsService, elevator, hoverMarker;
angular.module('planMyRide.map').service('mapService', function () {
    this.initMap = function () {
        directionsService = new google.maps.DirectionsService();
        elevator = new google.maps.ElevationService();
        map = new google.maps.Map(document.getElementById('map'), {
            center: {
                lat: 54.897539083675134
                , lng: -1.5192031860351562
            }
            , zoom: 12
        });
        google.maps.event.addListener(map, 'click', function (event) {
            thisWayPoints.push({
                lat: event.latLng.lat()
                , lng: event.latLng.lng()
            });
            placeMarker(event.latLng);
        });
    }

    this.calcRoute = function () {
        var segmentPromises = new Array();
        var segmentNumber = 1;
        for (var i = 0; i < (thisWayPoints.length - 1); i++) {
            segmentPromises.push(calculateRouteBetweenWaypoints(segmentNumber++, thisWayPoints[i], thisWayPoints[i + 1]));
        }
        return Promise.all(segmentPromises).then(buildRouteDetail).then(function (route) {
            return route;
        });
    }
    this.plotElevations = function (elevations) {
        var chartDiv = document.getElementById('elevation_chart');

        var chart = new google.visualization.ColumnChart(chartDiv);

        google.visualization.events.addListener(chart, 'onmouseover', function (e){
            var marker = placeMarker(elevations[e.row].location);
            if(hoverMarker) hoverMarker.setMap(null);
            hoverMarker = marker;
        });
        google.visualization.events.addListener(chart, 'onmouseout', function (e){
            if(hoverMarker) hoverMarker.setMap(null);
            hoverMarker = null;
        });

        // Extract the data from which to populate the chart.
        // Because the samples are equidistant, the 'Sample'
        // column here does double duty as distance along the
        // X axis.
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Sample');
        data.addColumn('number', 'Elevation');
        //data.addColumn({type: 'string', role: 'tooltip'});
        for (var i = 0; i < elevations.length; i++) {
            data.addRow(['', elevations[i].elevation]);//, getElevationTooltipContent(elevations[i])]);
            //console.log(elevations[i].elevation);
        }
        // Draw the chart using the data within its DIV.
        chart.draw(data, {
            height: 150
            , legend: 'none'
            , titleY: 'Elevation (m)'
            , titleX: 'Distance (km)'
            , tooltip : {isHtml:true,trigger:'both'}
        });
    }
    this.plotRoute = function (path) {
        // Display a polyline of the elevation path.
        new google.maps.Polyline({
            path: path
            , strokeColor: '#0000CC'
            , opacity: 0.4
            , map: map
        });
    }
});

function placeMarker(location) {
    return new google.maps.Marker({
        position: location
        , map: map
    });
}

function getElevationTooltipContent(elevation) {
    return 'Elevation: ' + elevation.elevation;
}

function buildRouteDetail(segments) {
    return new Promise(function (resolve, reject) {
        var distance, maxElevation, segmentCount, routeElevations, routePath;
        distance = 0;
        maxElevation = 0;
        segmentCount = 0;
        routeElevations = new Array();
        routePath = new Array();
        for (var i = 0; i < segments.length; i++) {
            distance += segments[i].segmentDistanceMeters;
            segmentCount += 1;
            routeElevations = routeElevations.concat(segments[i].segmentElevations);
            routePath = routePath.concat(segments[i].segmentPath);
            maxElevation = (segments[i].segmentMaxElevation > maxElevation) ? segments[i].segmentMaxElevation : maxElevation
        }
        var route = {
            routeDistance: distance
            , routeElevations: routeElevations
            , routeMaxElevation: maxElevation
            , routePath: routePath
            , routeSegmentCount: segmentCount
            , routeSegments: segments
        }
        resolve(route);
    });
}

function calculateRouteBetweenWaypoints(segmentNumber, waypoint1, waypoint2) {
    return new Promise(function (resolve, reject) {
        console.log('getting route data for segment ' + segmentNumber);
        var request = {
            origin: new google.maps.LatLng(waypoint1.lat, waypoint1.lng)
            , destination: new google.maps.LatLng(waypoint2.lat, waypoint2.lng)
            , travelMode: google.maps.TravelMode["BICYCLING"]
        };
        directionsService.route(request, function (response, status) {
            if (status == 'OK') {
                getPathElevations(response.routes[0].overview_path, elevator).then(function (elevations) {
                    var segment = {
                        segmentNumber: segmentNumber
                        , segmentPath: response.routes[0].overview_path
                        , segmentElevations: elevations
                        , segmentDistanceMeters: response.routes[0].legs[0].distance.value
                        , segmentMaxElevation: Math.max.apply(null, elevations.map(function (elevation) {
                            return elevation.elevation
                        }))
                    }
                    resolve(segment);
                });
            }
            else {
                reject();
            }
        });
    });
}

function getPathElevations(path, elevator) {
    return new Promise(function (resolve, reject) {
        console.log('getting elevations for path');
        var elevations;
        elevator.getElevationAlongPath({
            'path': path
            , 'samples': 50
        }, function (elevations, status) {
            if (status === 'OK') {
                resolve(elevations);
            }
            else if (status === 'OVER_QUERY_LIMIT') {
                console.log('Over query limit!');
                reject([]);
            }
            else {
                console.error('Failed to get elevations');
                reject([]);
            }
        });
    });
}
