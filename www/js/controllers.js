angular.module('BookStoreApp.controllers', [])

    .controller('AppCtrl', ['$rootScope', '$ionicModal', 'AuthFactory', '$location', 'UserFactory', '$scope', 'Loader',
        function ($rootScope, $ionicModal, AuthFactory, $location, UserFactory, $scope, Loader) {


            $rootScope.logout = function () {
                UserFactory.logout();
                $rootScope.isAuthenticated = false;
                $location.path('/login');
                Loader.toggleLoadingWithMessage('Successfully Logged Out!', 2000);
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

    function ($rootScope, $ionicModal, AuthFactory, $location, $state, UserFactory, $scope, Loader, LocalStorageFactory, $ionicPopup) {


        $scope.user = {
            email: '',
            password: ''
        };
        // $rootScope.$on('showLoginModal', function ($event, scope, cancelCallback, callback) {
        //     $scope.user = {
        //         email: '',
        //         password: ''
        //     };

        //     $scope = scope || $scope;

        //     $scope.viewLogin = true;

        //     $ionicModal.fromTemplateUrl('templates/login.html', {
        //         scope: $scope
        //     }).then(function (modal) {
        //         $scope.modal = modal;
        //         $scope.modal.show();


        //     });
        // });

        // $rootScope.loginFromMenu = function () {
        //     $rootScope.$broadcast('showLoginModal', $scope, null, null);
        // }

        $scope.switchTab = function (tab) {
            if (tab === 'login') {
                $scope.viewLogin = true;
            } else {
                $scope.viewLogin = false;
            }
        }

        $scope.login = function () {
            // Loader.showLoading('Authenticating...');

            UserFactory.login($scope.user).then(
                function (success) {
                    console.log(success);
                    AuthFactory.setUser(success);
                    $rootScope.isAuthenticated = true;
                    $state.go('app.search');
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


    .controller('SearchController', function ($scope, SpectaclesDataFactory) {
        /**
         * scope variables
         */
        $scope.spectacleList = [];
        var showData = [];
        $scope.search = {
            str: ''
        }
         $scope.noData = false;

        /**
         * Methods
         */

        var getAllSpecs = function () {
            SpectaclesDataFactory.getShowsList().then(
                function (success) {
                    showData = success;
                    $scope.spectacleList = success;
                    console.log(success);
                },
                function (error) {

                }
            )
        }

        $scope.searchList = function (str) {
            SpectaclesDataFactory.searchShow(str,showData).then(
                function (success) {
                    $scope.spectacleList = success;
                    console.log(success);

                    if ($scope.spectacleList.length < 1){
                        $scope.noData = true;
                    } else{
                         $scope.noData = false;
                    }
                },
                function (error) {

                }
            )
            
        }

        getAllSpecs(); //getting data from factory
    })

    .controller('TicketController', function ($scope, TicketsData) {
        /**
         * scope variables
         */
        var allShows = [];
        $scope.list = [];

        /**
         * methods
         */

        var getShowData = function(){
            TicketsData.getShowsList().then(
                function(success){
                    allShows = success;
                    $scope.list = success;
                },
                function(error){

                }
            )
        }
        getShowData();


    })

