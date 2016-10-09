'use strict';
//var mapService = require('map.service.js');
angular.module('planMyRide.map', ['ngRoute']).config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/map', {
            templateUrl: 'map/map.html'
            , controller: 'MapCtrl'
        });
}]) 
    //.service('mapService', mapService)
    .controller('MapCtrl', ['$scope', 'mapService', function ($scope, mapService) {
        var ctrl = this;
        mapService.initMap();
        $scope.calculateRoute = function () {
            mapService.calcRoute().then(function (route) {
                $scope.$apply(function () {
                    $scope.route = route;
                    mapService.plotElevations(route.routeElevations);
                    mapService.plotRoute(route.routePath);
                });
            });
        } 
}]); 