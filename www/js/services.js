angular.module('starter.services', ['angular-locker', 'satellizer'])

//Default values for the app
.factory('defaultVal', function() {
  var serverDomain      = '192.168.83.1',
      serverUrl         = 'http://'+ serverDomain +'/dev/git/appcart/public',
      currentApiVersion = 'v1',
      serverApiPath     = serverUrl + '/api/' + currentApiVersion,
      serverUploadPath  = serverUrl + '/uploads',
      serverImagePath   = serverUploadPath + '/img/';
      $currencyLogo      = {
        "ngn"  : '₦'
      };

  var user = {
    storageKey : 'userdata'
  }

  return {
    apiUrl          : serverApiPath,
    apiImage        : serverImagePath,
    user            : user.storageKey,
    $currencyLogo    : $currencyLogo

  };
})

//Ajax request service
.factory('ajaxService', [ '$q', '$http', '$timeout', 'defaultVal', function ( $q, $http, $timeout, defaultVal ) {
  var apiRootUrl = defaultVal.apiUrl;

  //Common functions starts
      var onSuccess = function(response){
          return response.data;
      };

      var onError = function(response)
      {
          return response.data;
      };

  //Common functions ends

    //Function to validate if a field is unique or not
    var isDataUnique = function ( field, value ) {
      var deferred = $q.defer(), postdata = {};

      postdata[field] = value;

     // $timeout( function (){

        $http.post( apiRootUrl + '/user/unique/' + field, postdata)
        .then( function (){
          deferred.resolve();
        },

        function (){
          deferred.reject();
        });

     // }, 2000);

      return deferred.promise;
    };

    //Lets authenticate user for login
    // NOT IN USE
    var authUser = function( authData )
    {
      return $http.post( apiRootUrl + '/user/authjwt', authData )
              .then(onSuccess, onError);
    };

    //Register new user
    //NOT IN USE
    var regUser = function( userData )
    {
      return $http.post( apiRootUrl + '/user/register', userData )
                .then( onSuccess, onError );
    };

    var listCountries =  function ()
    {
      return $http.get( apiRootUrl + '/store/getcountries' )
              .then( onSuccess, onError )
              .then(function(countries){
                return countries.data;
              });
    }

    var getAuthUser = function ()
    {
      return $http.get( apiRootUrl + '/getauthuser' )
              .then( onSuccess, onError );
    }

    var createStore = function( storeinfo )
    {
      return $http.post( apiRootUrl + '/store/create', storeinfo )
              .then( onSuccess, onError );
    }

    var getMyStore = function()
    {
      return $http.get( apiRootUrl + '/store/mystore' )
            .then( onSuccess, onError )
            .then( function(data){
              if( data.error !== undefined ){
                return { state : false, store : null }
              }else{
                return { state : true, store : data }
              }
            });
    }

    var getCategoriesAndSubcategories = function()
    {
      return $http.get( apiRootUrl + '/pb/categories/withcategories' )
              .then( onSuccess, onError );
    }

    var get = function( url, param )
    {
      param = param || '';
      return $http.get( apiRootUrl + url + param )
              .then( onSuccess, onError );
    }    

    var post = function( url, data )
    {
      return $http.get( apiRootUrl + url, data)
              .then( onSuccess, onError );
    }

    return {
      isUnique      : isDataUnique,
      loginUser     : authUser,
      registerUser  : regUser,
      getCountries  : listCountries,
      currentUser   : getAuthUser,
      createStore   : createStore,
      getMyStore    : getMyStore,
      getShopDepartments : getCategoriesAndSubcategories,
      getData : get,
      postData : post
    };

}])

.factory('mylocker', ['locker', function (locker) {
  return locker;
}] )

.factory('userData', ['mylocker', 'defaultVal', '$rootScope', function (mylocker, defaultVal, $rootScope){

    var getData = function(){
      return mylocker.get(defaultVal.user, null);
    };

    var setData = function( userObj ){
      return mylocker.put( defaultVal.user, userObj );
    }

    var getRootScope = function ()
    {
      return $rootScope.currentUser || null;
    }    

    var setRootScope = function ( userObj )
    {
      return $rootScope.currentUser = userObj;
    }

    return {
      get     : getData,
      set     : setData,
      getRootScope : getRootScope,
      setRootScope : setRootScope
    }

}])

.factory('isAuthenticated', [ '$rootScope', 'userData', '$auth', function ($rootScope, userData, $auth){
  return {
    check : function(){ 
            var user = userData.get();

            if( user && $auth.isAuthenticated() ){
              userData.setRootScope(user);
              $rootScope.authenticated = true;
              return $rootScope.authenticated;
            }

            return false;
          },
    yes   : function(){ return $rootScope.authenticated = true; },
    no    : function(){ return $rootScope.authenticated = false; }
  }
}])

.factory('loader', ['$ionicLoading', '$timeout', function ( $ionicLoading, $timeout ){
  var loading = function (options){

   var opt = {
    msg : 'Loading...',
    ttl : 0,
    spinner : {
      type : 'ripple',
      class : 'spinner-calm'
    }
   };

  angular.extend(opt, options);
  //angular.copy(options, opt);

   var spinnerIcon = function ()
   {
    if( opt.spinner === false ){
      return '';
    }else{
      return '<ion-spinner icon="'+ opt.spinner.type +'" class="'+opt.spinner.class+'"></ion-spinner> ';
    }
   }

    $ionicLoading.show({
      template: spinnerIcon() + opt.msg
    });

    if( opt.ttl > 0 ){
      $timeout(function (){
        unLoading();
      }, opt.ttl);
    }

  }

  var unLoading = function(){
    $ionicLoading.hide();
  }

  return {
    show : loading,
    hide : unLoading
  }
}])
