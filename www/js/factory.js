angular.module('spectacleStore.factory', [])

    .factory('Loader', ['$ionicLoading', '$timeout', function ($ionicLoading, $timeout) {

        var LOADERAPI = {

            showLoading: function (text) {
                text = text || 'Loading...';
                $ionicLoading.show({
                    template: text
                });
            },

            hideLoading: function () {
                $ionicLoading.hide();
            },

            toggleLoadingWithMessage: function (text, timeout) {
                var self = this;

                self.showLoading(text);

                $timeout(function () {
                    self.hideLoading();
                }, timeout || 3000);
            }

        };
        return LOADERAPI;
    }])

    .factory('LSFactory', [function () {

        var LSAPI = {

            clear: function () {
                return localStorage.clear();
            },

            get: function (key) {
                return JSON.parse(localStorage.getItem(key));
            },

            set: function (key, data) {
                return localStorage.setItem(key, JSON.stringify(data));
            },

            delete: function (key) {
                return localStorage.removeItem(key);
            }

        };

        return LSAPI;

    }])


    .factory('AuthFactory', ['LSFactory', function (LSFactory) {

        var userKey = 'user';
        var tokenKey = 'token';

        var AuthAPI = {

            isLoggedIn: function () {
                return this.getUser() === null ? false : true;
            },

            getUser: function () {
                return LSFactory.get(userKey);
            },

            setUser: function (user) {
                return LSFactory.set(userKey, user);
            },

            getToken: function () {
                return LSFactory.get(tokenKey);
            },

            setToken: function (token) {
                return LSFactory.set(tokenKey, token);
            },

            deleteAuth: function () {
                LSFactory.delete(userKey);
                LSFactory.delete(tokenKey);
            }

        };

        return AuthAPI;

    }])

    .factory('UserFactory', ['$http', 'AuthFactory', 'LocalStorageFactory', '$q',
        function ($http, AuthFactory, LocalStorageFactory, $q) {

            var UserAPI = {

                login: function (user) {

                    var deffered = $q.defer();

                    var obj = LocalStorageFactory.getObject(user.email);

                    if (!obj) {
                        deffered.reject('User does not exist');
                    }
                    else {
                        if (obj.password != user.password) {
                            deffered.reject('Credentials does not match, please try again');
                        }
                        else {
                            deffered.resolve(user);
                        }
                    }

                    return deffered.promise;

                },

                register: function (user) {

                    //A service that helps you run functions asynchronously, and use their return values (or exceptions) when they are done processing.
                    var deffered = $q.defer(); // we will use $q service of angularJS, 

                    var obj = LocalStorageFactory.getObject(user.email); //to see if user is already registered

                    if (!obj) {
                        LocalStorageFactory.setObject(user, user.email);
                        deffered.resolve('User Registered Successfully');
                    } else {
                        deffered.reject('User Already Registered using this email');
                    }

                    return deffered.promise;


                },

                logout: function () {
                    AuthFactory.deleteAuth();
                }

            };

            return UserAPI;
        }
    ])

    .factory('LocalStorageFactory', function (LSFactory) {

        /**
         * This factory deals with storing and retrieving data from browser's local storage also know as cache
         */

        var setObject = function (obj, key) {
            LSFactory.set(key, obj);
        }

        var getObject = function (key) {
            var obj = LSFactory.get(key);
            if (obj == undefined) {
                return false
            } else {
                return obj;
            }
        }

        return {
            setObject: setObject,
            getObject: getObject
        }

        // window.localStorage['storageName']

    })

    .factory('SpectaclesDataFactory', function ($q) {
        var spectacles = [];

        function randomDate(start, end) {
            return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        }

        var populateData = function () {

            //generating random data
            for (var i = 0; i < 20; i++) {
                var num = i%2 == 0 ? '1' : '2'; 
                var obj = {
                    id : i,
                    name: 'name ' + i,
                    photo: i % 2 == 0 ? 'img/0.jpg' : 'img/1.jpg',
                    date: randomDate(new Date(), new Date(2016, 12, 21)),
                    location: 'location ' + i + 1,
                    purchases : 0,
                    category : 'category '+ num,
                    description : 'this is a very nice spectacle',
                    artist : ['artist1', 'artist2'],
                    promoter : 'm&G'
                }
                spectacles.push(obj);
            }
        }

        var getSpectacleList = function () {

            populateData();
            var deffered = $q.defer();
            deffered.resolve(spectacles);

            return deffered.promise;
        }

        var searchSpectacle = function (str, data) {
            var result = [];
            var deffered = $q.defer();
            angular.forEach(data, function (item) {
                if (item.name.indexOf(str) != -1) { // if str is a substring of item.name
                    result.push(item);
                }
            })
            deffered.resolve(result);
            return deffered.promise;


        }

        return {
            getSpectacleList: getSpectacleList,
            searchSpectacle: searchSpectacle
        }
    })

    .factory('TicketsData', function ($q) {

        var shows = [];

        function randomDate(start, end) {
            return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        }

        var populateShows = function () {

            //generating random data
            for (var i = 0; i < 20; i++) {
                var obj = {
                    name: 'name ' + i,
                    photo: i % 2 == 0 ? 'img/0.jpg' : 'img/1.jpg',
                    date: randomDate(new Date(), new Date(2016, 12, 21)),
                    location: 'location ' + i + 1,
                    ticketPurchased : 0
                }
                shows.push(obj);
            }
        }

        var getShowsList = function () {

            populateShows();
            var deffered = $q.defer();
            deffered.resolve(shows);

            return deffered.promise;
        }


        return {
            getShowsList : getShowsList
        }

    })

    .service('TicketsDataService', function(){
        this.tickets = [];


        this.setTicket = function(data){
            this.tickets.push(data);
        }

        this.getTickets = function(){
            return this.tickets;
        }

        this.clearAll = function(){
            this.tickets = [];
        }
    })
