angular.module('spectacleStore.factory', [])
    
    //Loader gere loading do ionic
    .factory('Loader', ['$ionicLoading', '$timeout', function ($ionicLoading, $timeout) {

        var LOADERAPI = {
            //mostra Loading
            showLoading: function (text) {
                text = text || 'Loading...';
                $ionicLoading.show({
                    template: text
                });
            },
            //esconde Loading
            hideLoading: function () {
                $ionicLoading.hide();
            },
            /* Mostra modulo usando showLoading com a mensagem desejada e esconde-a com o tempo posto ou depois das 3 segundos.
            */
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

    //LSFactory - trata de armazenamento local
    /*
    *
    */
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

    //AuthFactory - gere autenticacao local
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

    //UserFactory - gere login, registo
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
                    
                    //O servico que lhe ajuda para correr as funcoes nao ao mesmo tempo, e e para utiliza-los para devolver os valores (ou excepcoes) quanto os mesmos ficam processados.
                    
                    var deffered = $q.defer(); // vamos utilizar $q service de angularJS, 

                    var obj = LocalStorageFactory.getObject(user.email); //para verificar se o utilizador ja esta registado

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
         * Estes detalhes de factory guardam e devolvem os dados do cache do browser.
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

    })

    .factory('SpectaclesDataFactory', function ($q) {
        var spectacles = [];

        function randomDate(start, end) {
            return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        }

        var populateData = function () {

            //Geracao espetaculos aleatorios
            /*for (var i = 0; i < 20; i++) {
                var num = i%2 == 0 ? '1' : '2'; 
                var obj = {
                    id : i,
                    name: 'Spectacle ' + i,
                    //para escolher imagens aleatorios
                    photo: i % 2 == 0 ? 'img/0.jpg' : 'img/1.jpg',
                    date: randomDate(new Date(), new Date(2016, 12, 21)),
                    location: 'Location: Royal Opera House ',
                    purchases : 0,
                    category : 'category '+ num,
                    description : 'This spectacle will be the greatest that you ever seen.',
                    artist : ['artist1', 'artist2'],
                    promoter : 'm&G'
                }
                spectacles.push(obj);
            }*/
            var obj = {
                id : 0,
                name: 'Royal Opera House ',
                photo: 'img/0.jpg',
                date: randomDate(new Date(), new Date(2016, 12, 21)),
                location: 'Royal Opera House ',
                purchases : 0,
                category : 'category ',
                description : 'Its School of Rock! The Broadway version of this brand new musical, based on the hit movie, has Andrew Lloyd Webber and Julian Fellowes to thank for its broad people-appeal. Theyre both involved in the production, a considerable theatrical accolade in itself.',
                artist : ['David Fynn'],
                promoter : 'M&G'
            }
            spectacles.push(obj);
            
            var obj = {
                id : 1,
                name: 'Phantom of the Opera',
                photo: 'img/1.jpg',
                date: randomDate(new Date(), new Date(2016, 12, 21)),
                location: 'Royal Opera House ',
                purchases : 0,
                category : 'category ',
                description : 'Sir Andrew Lloyd Webber’s triumphant show tells the sad tale of a deformed, masked mystery man and his obsession with Christine, a beautiful young singer. Opening in Paris in 1911, an auctioneer selling the contents of the Paris Opera House tells the story of the Phantom, transporting the audience back in time to enjoy this thrilling tale.',
                artist : ['Andrew Lloyd'],
                promoter : 'M&G'
            }
            spectacles.push(obj);
            
            var obj = {
                id : 2,
                name: 'The Book of Mormon',
                photo: 'img/3.jpg',
                date: randomDate(new Date(), new Date(2016, 12, 21)),
                location: 'Royal Opera House ',
                purchases : 0,
                category : 'category ',
                description : 'Its hilarious, irreverent and very, very silly. The Book of Mormon was written by Trey Parker and Matt Stone, who created the popular adult cartoon series South Park, plus Robert Lopez who created the US stage hit Avenue Q. It marks Parker and Stones Broadway debut… and what a debut it is!',
                artist : ['Trey Parker,' ,'Matt Stone'],
                promoter : 'M&G'
            }
            spectacles.push(obj);
            
            var obj = {
                id : 3,
                name: 'The Lion King',
                photo: 'img/4.jpg',
                date: randomDate(new Date(), new Date(2016, 12, 21)),
                location: 'Royal Opera House ',
                purchases : 0,
                category : 'category ',
                description : 'Transport yourself and your children to the magical world of the African bush, where life-size animals roam the stage and a magical tale of triumph against evil unfolds. With six coveted Tony Awards, a Grammy award for the show album and two prestigious Olivier awards under its belt, this is a real show stopper of a musical for the whole family.',
                artist : ['Trey John,' ,'Elton Stone'],
                promoter : 'M&G'
            }
            spectacles.push(obj);
                
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
                if (item.name.indexOf(str) != -1) { // se string substitui item.name
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
                    name: 'Spectacle ' + i,
                    photo: i % 2 == 0 ? 'img/0.jpg' : 'img/1.jpg',
                    date: randomDate(new Date(), new Date(2016, 12, 21)),
                    location: 'London,Royal Opera House  ' + i + 1,
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
