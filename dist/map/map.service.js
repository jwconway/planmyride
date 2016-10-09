"use strict";function placeMarker(e){return new google.maps.Marker({position:e,map:map})}function getElevationTooltipContent(e){return"Elevation: "+e.elevation}function buildRouteDetail(e){return new Promise(function(t,n){var o,a,i,r,l;o=0,a=0,i=0,r=new Array,l=new Array;for(var s=0;s<e.length;s++)o+=e[s].segmentDistanceMeters,i+=1,r=r.concat(e[s].segmentElevations),l=l.concat(e[s].segmentPath),a=e[s].segmentMaxElevation>a?e[s].segmentMaxElevation:a;var g={routeDistance:o,routeElevations:r,routeMaxElevation:a,routePath:l,routeSegmentCount:i,routeSegments:e};t(g)})}function calculateRouteBetweenWaypoints(e,t,n){return new Promise(function(o,a){console.log("getting route data for segment "+e);var i={origin:new google.maps.LatLng(t.lat,t.lng),destination:new google.maps.LatLng(n.lat,n.lng),travelMode:google.maps.TravelMode.BICYCLING};directionsService.route(i,function(t,n){"OK"==n?getPathElevations(t.routes[0].overview_path,elevator).then(function(n){var a={segmentNumber:e,segmentPath:t.routes[0].overview_path,segmentElevations:n,segmentDistanceMeters:t.routes[0].legs[0].distance.value,segmentMaxElevation:Math.max.apply(null,n.map(function(e){return e.elevation}))};o(a)}):a()})})}function getPathElevations(e,t){return new Promise(function(n,o){console.log("getting elevations for path");t.getElevationAlongPath({path:e,samples:50},function(e,t){"OK"===t?n(e):"OVER_QUERY_LIMIT"===t?(console.log("Over query limit!"),o([])):(console.error("Failed to get elevations"),o([]))})})}google.load("visualization","1",{packages:["corechart"]});var thisWayPoints=new Array,thisElevations=new Array,map,directionsService,elevator,hoverMarker;angular.module("planMyRide.map").service("mapService",function(){this.initMap=function(){directionsService=new google.maps.DirectionsService,elevator=new google.maps.ElevationService,map=new google.maps.Map(document.getElementById("map"),{center:{lat:54.897539083675134,lng:-1.5192031860351562},zoom:12}),google.maps.event.addListener(map,"click",function(e){thisWayPoints.push({lat:e.latLng.lat(),lng:e.latLng.lng()}),placeMarker(e.latLng)})},this.calcRoute=function(){for(var e=new Array,t=1,n=0;n<thisWayPoints.length-1;n++)e.push(calculateRouteBetweenWaypoints(t++,thisWayPoints[n],thisWayPoints[n+1]));return Promise.all(e).then(buildRouteDetail).then(function(e){return e})},this.plotElevations=function(e){var t=document.getElementById("elevation_chart"),n=new google.visualization.ColumnChart(t);google.visualization.events.addListener(n,"onmouseover",function(t){var n=placeMarker(e[t.row].location);hoverMarker&&hoverMarker.setMap(null),hoverMarker=n}),google.visualization.events.addListener(n,"onmouseout",function(e){hoverMarker&&hoverMarker.setMap(null),hoverMarker=null});var o=new google.visualization.DataTable;o.addColumn("string","Sample"),o.addColumn("number","Elevation");for(var a=0;a<e.length;a++)o.addRow(["",e[a].elevation]);n.draw(o,{height:150,legend:"none",titleY:"Elevation (m)",titleX:"Distance (km)",tooltip:{isHtml:!0,trigger:"both"}})},this.plotRoute=function(e){new google.maps.Polyline({path:e,strokeColor:"#0000CC",opacity:.4,map:map})}});