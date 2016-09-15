angular.module('BookStoreApp.controllers', [])

    .controller('AppCtrl', ['$rootScope', '$ionicModal', 'AuthFactory', '$location', 'UserFactory', '$scope','TicketsDataService', 'Loader', '$state',
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

    .controller('BrowseCtrl', ['$scope', 'LSFactory', 'Loader',
        function ($scope, LSFactory, Loader) {

        }
    ])

    .controller('BookCtrl', ['$scope', '$state', 'LSFactory', 'AuthFactory', '$rootScope', 'UserFactory', 'Loader',
        function ($scope, $state, LSFactory, AuthFactory, $rootScope, UserFactory, Loader) {

        }
    ])

    .controller('PurchasesCtrl', ['$scope', '$rootScope', 'AuthFactory', 'UserFactory', '$timeout', 'Loader',
        function ($scope, $rootScope, AuthFactory, UserFactory, $timeout, Loader) {
            // http://forum.ionicframework.com/t/expandable-list-in-ionic/3297/2
            $scope.groups = [];

            $scope.toggleGroup = function (group) {
                if ($scope.isGroupShown(group)) {
                    $scope.shownGroup = null;
                } else {
                    $scope.shownGroup = group;
                }
            };
            $scope.isGroupShown = function (group) {
                return $scope.shownGroup === group;
            };

            $scope.$on('getPurchases', function () {
                Loader.showLoading('Fetching Your Purchases');
                UserFactory.getPurchases().success(function (data) {
                    var purchases = data.data;
                    $scope.purchases = [];
                    for (var i = 0; i < purchases.length; i++) {
                        var key = Object.keys(purchases[i]);
                        $scope.purchases.push(key[0]);
                        $scope.groups[i] = {
                            name: key[0],
                            items: purchases[i][key]
                        }
                        var sum = 0;
                        for (var j = 0; j < purchases[i][key].length; j++) {
                            sum += parseInt(purchases[i][key][j].price);
                        };
                        $scope.groups[i].total = sum;
                    };
                    Loader.hideLoading();
                }).error(function (err, statusCode) {
                    Loader.hideLoading();
                    Loader.toggleLoadingWithMessage(err.message);
                });
            });

            if (!AuthFactory.isLoggedIn()) {
                $rootScope.$broadcast('showLoginModal', $scope, function () {
                    $timeout(function () {
                        $location.path('/app/browse');
                    }, 200);
                }, function () {
                    // user is now logged in
                    $scope.$broadcast('getPurchases');
                });
                return;
            }

            $scope.$broadcast('getPurchases');
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


    .controller('SearchController', function ($scope, SpectaclesDataFactory, $state) {
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

            $state.go('spec-detail', { obj: data });
        }
    })

    .controller('TicketController', function ($scope, TicketsDataService) {
        /**
         * scope variables
         */
        $scope.list = [];

        /**
         * methods
         */

        var getTickets = function(){
            $scope.list = TicketsDataService.getTickets();

            console.log($scope.list);
        }

        getTickets();


    })

    .controller('DetailController', function ($scope, $stateParams, $state, $ionicHistory) {
        /**
         * scope variables
         */
        //check if state param is not null
        $scope.spectacle = $stateParams.obj === null ? '' : $stateParams.obj;

        /**
         * methods
         */

        $scope.goBack = function () {
            $state.go('app.search');
        }

        $scope.purchase = function (data) {
            $state.go('purchase', { obj: data });
        }


    })

    .controller('TicketPurchaseController', function ($scope, TicketsDataService, $stateParams, $state, $ionicHistory) {

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
            $state.go('spec-detail', { obj: data });
        }

        $scope.purchase = function(specData){

            specData.totalTickets = totalTickets;
            TicketsDataService.setTicket(specData);

            
        }

    })

