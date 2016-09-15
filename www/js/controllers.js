angular.module('spectacleStore.controllers', [])

    .controller('AppCtrl', ['$rootScope', '$ionicModal', 'AuthFactory', '$location', 'UserFactory', '$scope', 'TicketsDataService', 'Loader', '$state',
        function ($rootScope, $ionicModal, AuthFactory, $location, UserFactory, $scope, TicketsDataService, Loader, $state) {


            $scope.logout = function () {
                UserFactory.logout();
                $rootScope.isAuthenticated = false;
                TicketsDataService.clearAll();
                // $location.path('/login');
                $state.go('login', { obj: null });
                Loader.toggleLoadingWithMessage('Successfully Logged Out!', 2000);
            }

            $scope.login = function () {
                $state.go('login', { obj: null });

            }


        }
    ])

    .controller('LoginController',

    function ($rootScope, $ionicModal, $stateParams, AuthFactory, $ionicHistory, $location, $state, UserFactory, $scope, Loader, LocalStorageFactory, $ionicPopup) {


        $scope.user = {
            email: '',
            password: ''
        };

        $scope.switchTab = function (tab) {
            if (tab === 'login') {
                $scope.viewLogin = true;
            } else {
                $scope.viewLogin = false;
            }
        }

        $scope.close = function () {
            console.log('now closing the app');
            $ionicHistory.goBack();
        }

        $scope.login = function () {
            // Loader.showLoading('Authenticating...');

            UserFactory.login($scope.user).then(
                function (success) {
                    console.log(success);
                    AuthFactory.setUser(success);
                    $rootScope.isAuthenticated = true;
                    if ($stateParams.obj != null) { //se o utilizador vem para pagina de login da pagina de compra, redireciona-o de volta para a página de compra
                        $state.go('purchase', { obj: $stateParams.obj });
                    } else { //se nao manda-o para a pagina de inicio
                        $state.go('app.search');
                    }
                },
                function (error) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Error!',
                        template: error
                    }).then(function (res) {
                    });
                    console.log(error);
                }
            )
        }

        $scope.register = function () {


            // Loader.showLoading('Registering...');

            //aqui vai o codigo para registar o utilizador
            //poe a informacao do utilizador no cache do browser

            UserFactory.register($scope.user).then(
                function (success) {

                    console.log(success);
                    var alertPopup = $ionicPopup.alert({
                        title: 'Success',
                        template: "Registered successfully, please login with your user name and password"
                    }).then(function (res) {
                        $scope.viewLogin = true; //redireciona o utilizador para login screen
                    });


                },
                function (error) {

                    var alertPopup = $ionicPopup.alert({
                        title: 'Error!',
                        template: error
                    }).then(function (res) {
                    });

                    console.log(error);

                }
            )
        }

        $rootScope.logout = function () {
            UserFactory.logout();
            $rootScope.isAuthenticated = false;
            $location.path('/login');
        }

        //este metodo vai ser chamado sempre quando o estado vai estar a carregar.
        //este metodo faz render de ionic modal que consiste de login e ecra de registo
         
        // $rootScope.loginFromMenu();

    })


    .controller('SearchController', function ($scope, $rootScope,  SpectaclesDataFactory, $state) {
        /**
         * scope das variaveis
         */
        $scope.spectacleList = [];
        var Data = [];
        $scope.search = {
            str: ''
        }
        $scope.noData = false;

        /**
         * Metodos
         */

        var getAllSpecs = function () {
            SpectaclesDataFactory.getSpectacleList().then(
                function (success) {
                    Data = success;
                    $scope.spectacleList = success;
                    console.log(success);
                },
                function (error) {

                }
            )
        }

        $scope.searchList = function (str) {
            SpectaclesDataFactory.searchSpectacle(str, Data).then(
                function (success) {
                    $scope.spectacleList = success;
                    console.log(success);

                    if ($scope.spectacleList.length < 1) {
                        $scope.noData = true;
                    } else {
                        $scope.noData = false;
                    }
                },
                function (error) {

                }
            )

        }

        getAllSpecs(); //receber dados do factory

        $scope.gotoDetail = function (data) {
            console.log(data);
            $rootScope.fromTicket = false;
            $rootScope.fromPurchase = false;
            $state.go('spec-detail', { obj: data });
        }
    })

    .controller('TicketController', function ($scope, TicketsDataService, $rootScope, $state) {
        /**
         * scope das variaveis
         */
        $scope.list = [];

        /**
         * metodos
         */

        var getTickets = function () {
            $scope.list = TicketsDataService.getTickets();

            console.log($scope.list);
        }

        getTickets();

        $scope.gotoDetail = function (data) {
            $rootScope.fromTicket = true;
            $rootScope.fromPurchase = false;
            $state.go('spec-detail', { obj: data });
        }


    })

    .controller('DetailController', function ($scope, $stateParams, $rootScope,  $state, $ionicHistory) {
        /**
         * scope das variaveis
         */
        //verifica se o estado dos param nao esta nulo
        $scope.spectacle = $stateParams.obj === null ? '' : $stateParams.obj;

        /**
         * metodos
         */

        $scope.goBack = function () {
            if ($rootScope.fromTicket) {
                console.log('vai para lista de bilhetes');
                $state.go('app.ticket');
            } else if($rootScope.fromPurchase) { 
                $ionicHistory.goBack();
            }else{
                console.log('vai para lista de pesquisa');
                $state.go('app.search');
            }
        }

        $scope.purchase = function (data) {
            $state.go('purchase', { obj: data });
        }


    })

    .controller('TicketPurchaseController', function ($scope, $rootScope, $ionicPopup, TicketsDataService, $stateParams, $state, $ionicHistory) {

        /**
         * scope das variaveis
         */
        $scope.spectacle = $stateParams.obj === null ? '' : $stateParams.obj;
        $scope.table = [];
        $scope.totalCost = 0;
        var totalTickets = 0;

        /**
         * metodos
         */
        $scope.goBack = function () {
            $state.go('spec-detail', { obj: $scope.spectacle });
        }

        var getCost = function (type) {
            var result = null;
            switch (type) {
                case 'Balcony':
                    result = 34.6;
                    break;
                case 'Arena':
                    result = 28.4;
                    break;
                case 'Box':
                    result = 12.9;
                    break;
            }

            return result;
        }

        $scope.addtoTable = function (type, amount) {
            var cost = getCost(type);
            totalTickets += parseInt(amount); //tracking de quantos bilhetes foram comprados
            //objeto temporario que nos vamos formatar e inserir em $scope.table
            var obj = {
                type: type,
                cost: cost,
                amount: amount
            };

            var tempCost = cost * amount;

            $scope.totalCost += tempCost;

            $scope.table.push(obj);
        }

        $scope.gotoDetail = function (data) {
            console.log(data);
            $rootScope.fromPurchase = true;
            $state.go('spec-detail', { obj: data });
        }

        $scope.purchase = function (specData) {

            specData.totalTickets = totalTickets;
            specData.totalCost = $scope.totalCost;
            TicketsDataService.setTicket(specData);

            var alertPopup = $ionicPopup.alert({
                title: 'Success!',
                template: 'Tickets Purchased Successfully'
            }).then(function (res) {
            });



        }

    })

