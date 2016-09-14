// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('BookStoreApp', ['ionic', 'BookStoreApp.controllers', 'BookStoreApp.factory'])

    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    }).run(['$rootScope', 'AuthFactory',
        function ($rootScope, AuthFactory) {

            $rootScope.isAuthenticated = AuthFactory.isLoggedIn();

            // utility method to convert number to an array of elements
            $rootScope.getNumber = function (num) {
                return new Array(num);
            }

        }
    ]).config(['$stateProvider', '$urlRouterProvider', '$httpProvider',
        function ($stateProvider, $urlRouterProvider, $httpProvider) {

            // setup the token interceptor
            $httpProvider.interceptors.push('TokenInterceptor');

            $stateProvider

                /**
                 * State for login screen
                 */
                .state('login', {
                    url: "/login",
                    templateUrl: "templates/login.html",
                    controller: 'LoginController',
                    // resolve: {
                    //     auth: function (AuthFactory, $q, $timeout, $state) {
                    //         if (AuthFactory.isLoggedIn()) {


                    //             $timeout(function () {
                    //                 console.log('logged in')
                    //                 $state.go('app.browse');
                    //             },0);
                    //             return $q.when();
                    //         }
                    //         else {
                    //             console.log('user not logged in');
                    //             return $q.reject();
                    //         }

                    //     }
                    // }
                })

                .state('app', {
                    url: "/app",
                    abstract: true,
                    templateUrl: "templates/menu.html",
                    controller: 'AppCtrl'
                })

                .state('app.search', {
                    url: "/search",
                    views: {
                        'menuContent': {
                            templateUrl: "templates/search.html",
                            controller: 'SearchController'
                        }
                    }
                })

                .state('app.ticket', {
                    url: "/ticket",
                    views: {
                        'menuContent': {
                            templateUrl: "templates/ticket.html",
                            controller: 'TicketController'
                        }
                    }
                })

                /**
                 * Spectacle Detail screen state
                 */

                .state('spec-detail', {
                    url: "/detail",
                    templateUrl: "templates/detail.html",
                    controller: 'DetailController',
                    params: { //stateParams that we will get from controller which will call transition to this state
                        obj: null
                    }
                })

                /**
                 * Ticket Purchase screen state
                 */
                .state('purchase', {
                url: "/purchase",
                templateUrl: "templates/purchase.html",
                controller: 'TicketPurchaseController',
                params: { //stateParams that we will get from controller which will call transition to this state
                    obj: null
                }
            });




            // if none of the above states are matched, use this as the fallback
            $urlRouterProvider.otherwise('/app/search');
        }
    ])

