// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
// 'starter.directives' is found in directives.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'starter.directives'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
})

.run( function( $rootScope, $state, isAuthenticated ){


    $rootScope.$on("$stateChangeStart", function(
      event, toState, toParams, fromState, fromParams){
      //

      //console.log( $state.$current );
      //console.log( toState );
      //$rootScope.returnToState = toState;

      if ( toState.authenticate === true  && isAuthenticated.check() === false ){

        $rootScope.returnToState = toState;

        $rootScope.fromState = fromState;
        $rootScope.returnToStateParams = toParams;
        $rootScope.fromStateParams = fromParams;

        // User isn’t authenticated
        $state.go("sidemenu.rlut.logout");
        event.preventDefault(); 
      }
    })
})

.config(["$stateProvider", "$urlRouterProvider", "$ionicConfigProvider", "$authProvider", "$provide", "$httpProvider",
  function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $authProvider, $provide, $httpProvider) {

  //Satellizer
  $authProvider.httpInterceptor = true; // Add Authorization header to HTTP request
  $authProvider.loginOnSignup = true;
  $authProvider.baseUrl = 'http://192.168.83.1/dev/git/appcart/public/api/v1'; // API Base URL for the paths below.
  //$authProvider.logoutRedirect = '/';
  $authProvider.signupRedirect = '/login';
  $authProvider.loginUrl = '/user/authjwt';
  $authProvider.signupUrl = '/auth/signup';
  //$authProvider.loginRoute = '/login';
  //$authProvider.signupRoute = '/signup';

 function redirectWhenLoggedOut($q, $injector) {

      return {

          responseError: function(rejection) {

              // Need to use $injector.get to bring in $state or else we get
              // a circular dependency error
              var $state = $injector.get('$state');
              var $timeout = $injector.get('$timeout');
              var $ionicPopup = $injector.get('$ionicPopup');

              // Instead of checking for a status code of 400 which might be used
              // for other reasons in Laravel, we check for the specific rejection
              // reasons to tell us if we need to redirect to the login state
              var rejectionReasons = ['token_not_provided', 'token_expired', 'token_absent', 'token_invalid'];

              // Loop through each rejection reason and redirect to the login
              // state if one is encountered
              if( rejection.data.error === undefined ){
                angular.forEach(rejectionReasons, function(value, key) {
                    if( rejection.data.error === value) {

                        /*var myPopup = $ionicPopup.alert({
                           title: 'Autentication error',
                           template: "You'll need to relogin"
                        });*/

                        // If we get a rejection corresponding to one of the reasons
                        // in our array, we know we need to authenticate the user so 
                        // we can remove the current user from local storage
                        //localStorage.removeItem('user');
                        $timeout(function(){
                          //We close the popup before login redirect
                         // myPopup.close();

                          // Send the user to the auth state so they can login
                          $state.go('sidemenu.rlut.logout');
                        }, 1000)
                        
                    }
                });
              }

              return $q.reject(rejection);
          }
      }
  }

  // Setup for the $httpInterceptor
  $provide.factory('redirectWhenLoggedOut', redirectWhenLoggedOut);

  // Push the new factory onto the $http interceptor array
  $httpProvider.interceptors.push('redirectWhenLoggedOut');

  moment.locale('en', {
    relativeTime : {
        future: "in %s",
        past:   "%s ago",
        s:  "secs",
        m:  "a min",
        mm: "%d mins",
        h:  "an hr",
        hh: "%d hrs",
        d:  "a day",
        dd: "%d days",
        M:  "a mon",
        MM: "%d mons",
        y:  "a yr",
        yy: "%d yrs"
    }
  });


  $ionicConfigProvider.tabs.position('bottom');
  $ionicConfigProvider.navBar.alignTitle('left');


  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
  // setup an abstract state for the tabs directive
  .state('sidemenu', {
    url: "/sidemenu",
    abstract: true,
    views : {
      'index' : { 
          templateUrl : "templates/general-sidemenus.html" ,
          controller : 'IndexCtrl'
        }
      }
  })

  .state('sidemenu.rlut', {
    url : '/rlut',
    abstract : true,
    views : {
      'sidemenu' : { templateUrl : "templates/nonauth/register-login-tab.html" }
    }
  })

  .state('sidemenu.rlut.logout', {
    url : '/logout',
    resolve : {
      beforeLogout : function ( $rootScope, mylocker, defaultVal ){
        $rootScope.$broadcast('logoutMethod', 'logging out');
        mylocker.forget(defaultVal.user);
        $rootScope.$emit('AuthSideMenuChange', 'done');
      }
    },
    views : {
      'rlut-login' : {
        templateUrl: 'templates/nonauth/user-login.html',
        controller : 'UserAuthCtrl'
      }
    }
  })

  .state('sidemenu.rlut.login', {
    url : "/login",
    views : {
      'rlut-login'  : {
        templateUrl : "templates/nonauth/user-login.html",
        controller : 'UserAuthCtrl'
      }
    }
  })

  .state('sidemenu.rlut.user-register', {
    url : "/user-register",
    views : {
      'rlut-register'  : {
        templateUrl : "templates/nonauth/user-register.html",
        controller : 'UserRegisterCtrl'
      }
    }
  })

  .state('sidemenu.tab', {
    url : "/tab",
    abstract : true,
    views : {
       'sidemenu'     : { templateUrl : "templates/general-tabs.html"  },
    }
  })

  .state('sidemenu.tab.home', {
      url: '/home',
      views: {
        'home-tab': {
          templateUrl: 'templates/home/home.html',
          controller: 'HomeCtrl'
        }
      }
    })

  .state('sidemenu.tab.feeds', {
      url: '/feeds',
      views: {
        'feeds-tab': {
          templateUrl: 'templates/home/feeds.html',
          controller: 'FeedsCtrl'
        }
      }
    })

  .state('sidemenu.tab.cart', {
      url: '/cart',
      authenticate : true,
      views: {
        'cart-tab': {
          templateUrl: 'templates/cart/cart.html',
          controller: 'CartCtrl'
        }
      }
    })  

  .state('sidemenu.tab.search', {
      url: '/search',
      authenticate : true,
      views: {
        'search-tab': {
          templateUrl: 'templates/search/search.html',
          controller: 'SearchCtrl'
        }
      }
    })

  .state('sidemenu.secure', {
    url : '/secure',
    abstract : true,
    cache : false,
    views : {
      'sidemenu' : {
        templateUrl : 'templates/secure.html'
      }
    }
  })

  .state('sidemenu.secure.mystore', {
    url: '/mystore',
    authenticate : true,
    views: {
      'secure': {
        templateUrl: 'templates/mystore/index.html',
        controller: 'StoreCtrl'
      }
    }
  })

  .state('sidemenu.secure.mystorecreate', {
    url: '/mystore/create',
    authenticate : true,
    views: {
      'secure': {
        templateUrl: 'templates/mystore/create_form.html',
        controller: 'CreateStoreCtrl'
      }
    }
  })

  .state('storemenu', {
    url : '/storemenu',
    abstract : true,
    authenticate : true,
    cache : false,
    views : {
      'index' : { 
        templateUrl : "templates/storemenu.html" ,
        controller : 'IndexCtrl'
      }
    }
  })

  .state('storemenu.secure', {
    url : '/secure',
    abstract : true,
    authenticate : true,
    cache : false,
    views : {
      'storemenu' : {
        templateUrl : 'templates/secure.html'
      }
    }
  })

  .state('storemenu.secure.addproduct', {
    url: '/addproduct',
    authenticate : true,
    views: {
      'secure': {
        templateUrl: 'templates/mystore/product/add.html',
        controller: 'AddProductCtrl'
      }
    }
  })



  /*.state('onlytab', {
    url : "/onlytab",
    abstract : true,
    views : {
       'base'     : { templateUrl : "templates/tabs.html"  },
    }
  })

  .run( function( $rootScope, $state, isAuthenticated ){


      $rootScope.$on("$stateChangeStart", function(
        event, toState, toParams, fromState, fromParams){

        console.log( isAuthenticated );

        if (toState.authenticate === true && isAuthenticated === false){

          $rootScope.returnToState = toState;
          $rootScope.fromState = fromState;
          $rootScope.returnToStateParams = toParams;
          $rootScope.fromStateParams = fromParams;

          // User isn’t authenticated
          $state.transitionTo("sidemenu.rlut.user-login");
         // event.preventDefault(); 
        }
      });

  .state('onlytab.other', {
    url: '/other',
    views: {
      'tab-other': {
        templateUrl: 'templates/otherpage.html',
        controller: 'OtherCtrl'
      }
    }
  })*/;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/sidemenu/tab/feeds');

}]);
