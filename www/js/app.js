// Ionic Starter App

// angular .module e o sitio global para criacao, registo e recepcao de Algular modules 

// 'starter' e o nome deste exemplo de angular module (tambem definido em <body> atributo no  index.html)

// o segundo paramento e um array dos 'requisitos'
//
angular.module('spectacleStore', ['ionic', 'spectacleStore.controllers', 'spectacleStore.factory'])

    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Oculta a barra de acessorios por defeito (remove este para mostrar a barra de acessórios acima do teclado)
            // para form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar necessario
                StatusBar.styleDefault();
            }
        });
    }).run(['$rootScope', 'AuthFactory','$document',
        function ($rootScope, AuthFactory, $document) {

            $rootScope.isAuthenticated = AuthFactory.isLoggedIn();

            // metodo para converter o numero para um array
            $rootScope.getNumber = function (num) {
                return new Array(num);
            }

        }
    ]).config(['$stateProvider', '$urlRouterProvider', '$httpProvider',
        function ($stateProvider, $urlRouterProvider, $httpProvider) {

            // setup the token interceptor

            $stateProvider

                /**
                 * Estado para ecra de login
                 */
                .state('login', {
                    url: "/login",
                    templateUrl: "templates/login.html",
                    controller: 'LoginController',
                    params: {
                        obj: null
                    }
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
                 * Spectacle Detail estado do ecra
                 */

                .state('spec-detail', {
                    url: "/detail",
                    templateUrl: "templates/detail.html",
                    controller: 'DetailController',
                    params: { //stateParams vai obter do controller que vai receber chamada para mudar para este estado
                        obj: null
                    }
                })

                /**
                 * Compra do bilhete estado do ecra
                 */
                .state('purchase', {
                    url: "/purchase",
                    templateUrl: "templates/purchase.html",
                    controller: 'TicketPurchaseController',
                    params: {  //stateParams vai obter do controller que vai receber chamada para mudar para este estado
                        obj: null
                    },
                    resolve: {
                        auth: function (AuthFactory, $q, $timeout, $state, $stateParams) {
                            if (AuthFactory.isLoggedIn()) {
                                console.log('user already logged in');
                                return $q.when();
                            }
                            else {
                                console.log('user not logged in');
                                $timeout(function () {
                                    $state.go('login', { obj: $stateParams.obj });
                                }, 0);
                                return $q.reject();
                            }

                        }
                    }
                });

            $urlRouterProvider.otherwise('/app/search');
        }
    ])

