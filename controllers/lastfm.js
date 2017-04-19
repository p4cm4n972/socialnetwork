  var lastfmApp  = angular.module('lastfmApp',[]);

  lastfmApp.controller('LastfmController', function LastfmController($scope){
    $scope.artist = [
        {
        name:'Manuel',
        picture:'photo'
        }
    ]
  });