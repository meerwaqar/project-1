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
                    if ($stateParams.obj != null) { //if user if brought to the login page from purchase screen, redirect him back to purchase screen
                        $state.go('purchase', { obj: $stateParams.obj });
                    } else { //otherwise redirect him to main page
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


            //here will come the code to register the user
            //means to put user information on browser cache

            UserFactory.register($scope.user).then(
                function (success) {

                    console.log(success);
                    var alertPopup = $ionicPopup.alert({
                        title: 'Success',
                        template: "Registered successfully, please login with your user name and password"
                    }).then(function (res) {
                        $scope.viewLogin = true; //redirecting user to login screen
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

        //this method will be called whenever the state will be loaded.
        //this method renders the ionic modal which consists of login and registration screen 
        // $rootScope.loginFromMenu();


    })


    .controller('SearchController', function ($scope, $rootScope,  SpectaclesDataFactory, $state) {
        /**
         * scope variables
         */
        $scope.spectacleList = [];
        var Data = [];
        $scope.search = {
            str: ''
        }
        $scope.noData = false;

        /**
         * Methods
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

        getAllSpecs(); //getting data from factory

        $scope.gotoDetail = function (data) {
            console.log(data);
            $rootScope.fromTicket = false;
            $rootScope.fromPurchase = false;
            $state.go('spec-detail', { obj: data });
        }
    })

    .controller('TicketController', function ($scope, TicketsDataService, $rootScope, $state) {
        /**
         * scope variables
         */
        $scope.list = [];

        /**
         * methods
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
         * scope variables
         */
        //check if state param is not null
        $scope.spectacle = $stateParams.obj === null ? '' : $stateParams.obj;

        /**
         * methods
         */

        $scope.goBack = function () {
            if ($rootScope.fromTicket) {
                console.log('going to tickets list');
                $state.go('app.ticket');
            } else if($rootScope.fromPurchase) { 
                $ionicHistory.goBack();
            }else{
                console.log('going to search list');
                $state.go('app.search');
            }
        }

        $scope.purchase = function (data) {
            $state.go('purchase', { obj: data });
        }


    })

    .controller('TicketPurchaseController', function ($scope, $rootScope, $ionicPopup, TicketsDataService, $stateParams, $state, $ionicHistory) {

        /**
         * scope variables
         */
        $scope.spectacle = $stateParams.obj === null ? '' : $stateParams.obj;
        $scope.table = [];
        $scope.totalCost = 0;
        var totalTickets = 0;

        /**
         * methods
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
            totalTickets += parseInt(amount); //Keeping track of how many tickets are purchased.
            //temporary object that we will format and insert in $scope.table
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

