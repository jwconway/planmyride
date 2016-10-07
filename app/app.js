'use strict';

// Declare app level module which depends on views, and components
angular.module('planMyRide', [
  'ngRoute',
  'planMyRide.map'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: '/map'});
}]);
