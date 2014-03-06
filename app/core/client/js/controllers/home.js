'use strict';

angular.module(ApplicationConfiguration.applicationModuleName).controller('HomeController', ['$scope', 'Authentication', function ($scope, Authentication) {
    $scope.authentication = Authentication;
}]);