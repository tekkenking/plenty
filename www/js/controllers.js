angular.module('starter.controllers', ['ngMessages', 'angularMoment', 'satellizer'])

.controller('IndexCtrl', [ '$scope', 'isAuthenticated', '$rootScope', 'ajaxService', '$ionicScrollDelegate', function ($scope, isAuthenticated, $rootScope, ajaxService, $ionicScrollDelegate){

    $rootScope.$on('AuthSideMenuChange', function(event, data){
      $scope.isLoggedIn = isAuthenticated.check();
    });

    $rootScope.$emit('AuthSideMenuChange', 'done');

    //Populating categories and subcategories at the sidemenu[ RIGHT ]
    $scope.groups = [];
    ajaxService.getShopDepartments().then(function(resources){
      $scope.groups = resources;
      $scope.toggleGroup = function(group) {
        group.shown = !group.shown;
        // http://ionicframework.com/docs/api/service/$ionicScrollDelegate/
        $ionicScrollDelegate.resize();
      };
      $scope.isGroupShown = function(group) {
        return group.shown;
      };
    });
    //End

}])

.controller('UserAuthCtrl', ['$scope', '$rootScope', '$state', '$auth', '$timeout', 'userData', 'ajaxService', 'isAuthenticated', 'loader', function ($scope, $rootScope, $state, $auth, $timeout, userData, ajaxService, isAuthenticated, loader){
  var vm = $scope;
  vm.auth = {};

  //After loginUrl
  var afterLoginUrl = function(){
      var placeToGo = 'sidemenu.tab.home';

      if( $rootScope.returnToState != undefined ){
        placeToGo = $rootScope.returnToState.name;
      }

      return placeToGo;
  }

  //Logging In
  vm.auth.process = function( logindata, form ){
    loader.show({ 
      msg : '', 
      ttl : 1000, 
      spinner : {   
        type : "android", 
        class : 'spinner-assertive' 
      } 
    });

    $auth.login( logindata, true )
        .then(function (response){
          //console.log(response.data);
          vm.auth.alert = response.data.alert;
          vm.auth.message =response.data.message;

          ajaxService.currentUser()
          .then(function( data ){
          
          var user = data;

          // Set the stringified user data into local storage
          userData.set( user );

          // The user's authenticated state gets flipped to
          // true so we can now show parts of the UI that rely
          // on the user being logged in
          isAuthenticated.yes();

          // Putting the user's data on $rootScope allows
          // us to access it anywhere across the app
          userData.getRootScope(user);

          //Resets the login form to defaults
          form.$setPristine();
          vm.auth.message = '';
          vm.auth.alert = '';
          logindata.password = '';
          logindata.email = '';

          $rootScope.$emit('AuthSideMenuChange', 'done');

          loader.hide();
          $state.go( afterLoginUrl() );
        });

        }, function (error){
          vm.auth.alert = error.data.error.message.alert;
          vm.auth.message = error.data.error.message.message;
        })

  }

}])

.controller('UserRegisterCtrl', [ '$scope', 'ajaxService', 'loader', '$state', '$timeout', function ($scope, ajaxService, loader, $state, $timeout){
  var $vm = $scope;
  $vm.user = {};

  $vm.user.register = function ( userform ){
    $vm.error = {};
    $vm.register = {};

    loader.show({
      msg : '', 
      ttl : 1000, 
      spinner : {   
        type : "android", 
        class : 'spinner-assertive' 
      } 
    });

    ajaxService.registerUser(userform)
    .then(function (data){
      //console.log(data);
      if( data.error !== undefined && data.error.code == 422 ){
        angular.forEach( data.error.message, function ( message, input){
          $vm.error[input] = message[0];
        });
      }

      if( data.error === undefined ){
        $vm.register = data.meta;

        $timeout(function(){
          $state.go('sidemenu.rlut.login');
        }, 500);
        
      }

    });

  }

}])

.controller('HomeCtrl', ['$scope', function ($scope){
  $scope.message = "Welcome to homepage";
}])

.controller('FeedsCtrl', ['$scope', 'defaultVal',  function ($scope, defaultVal){

  var calculatePercentage = function ( newPrice, oldPrice )
  {
    if( newPrice >= oldPrice )
    {
      return 0;
    }

    return (newPrice * 100) / oldPrice;
  }

  var imagePath = defaultVal.apiImage;

  $scope.feeds = [
    { 
      id : 1,
      newPrice : 100000,
      oldPrice : 200000,
      percentage : calculatePercentage(100000, 200000),
      itemImage : imagePath + 'item.png',
      timeAgo : new Date(),
      itemType : 'food',
      itemShowState : 0,
      itemState : 'new',
      itemTitle : 'Super Maharaja McMeal sold at an amazing price',
      itemLocation : 'Wuse II, Abuja. Nigeria',
      sellerLogo : imagePath + 'url.png',
      sellerName : 'McDonalds',
      sellerFollowers : 2120000
    },

    { 
      id : 2,
      newPrice : 190000000,
      oldPrice : 45000,
      percentage : calculatePercentage(190000000, 45000),
      itemImage : imagePath + 'samsung.jpg',
      timeAgo : "2015-06-20T18:58:38.950Z",
      itemType : 'product',
      itemShowState : 1,
      itemState : 'used',
      itemTitle : 'Samsung s4 phone',
      itemLocation : 'Ikeja, Lagos. Nigeria',
      sellerLogo : imagePath + 'item2.jpg',
      sellerName : 'Samsung Electronics',
      sellerFollowers : 1520000
    },
  ];

  $scope.currency = defaultVal.$currencyLogo.ngn;
}])

.controller('SidemenuCtrl', [ '$scope', '$ionicSideMenuDelegate', function ($scope, $ionicSideMenuDelegate){
    $scope.showLeftMenu = function () {
      $ionicSideMenuDelegate.toggleLeft();
    };
    
    $scope.showRightMenu = function () {
      $ionicSideMenuDelegate.toggleRight();
    };
}])

.controller('StoremenuCtrl', [ '$scope', '$ionicSideMenuDelegate', function ($scope, $ionicSideMenuDelegate){
    $scope.showMenu = function () {
      $ionicSideMenuDelegate.toggleLeft();
    };    

}])

.controller('StoreCtrl', [ '$scope', 'userData',  'mylocker', 'ajaxService', 'loader', function ($scope, userData,  mylocker, ajaxService, loader ) {
  var $vm = $scope;

  $vm.haveStore = null;

  loader.show();

  ajaxService.getMyStore()
  .then(function(data){
    $vm.haveStore = data.state;
    $vm.store = data.store;
    loader.hide();
  })


}])

.controller('CreateStoreCtrl', [ '$scope',  'ajaxService', '$state', '$timeout', 'loader', function ($scope, ajaxService, $state, $timeout, loader ) {
  var $vm = $scope;
  $vm.alert = {};
  $vm.store = {};
  $vm.error = {};

  ajaxService.getCountries()
  .then(function(data){
    $vm.countries = data;
  });

  //console.log( userData.get().id );

  //Creat store
  $scope.store.create = function (storeinfo){
    loader.show({ 
      msg : 'Creating store', 
      ttl : 1200, 
      spinner : {   
        type : "android", 
        class : 'spinner-assertive' 
      } 
    });

    ajaxService.createStore( storeinfo )
    .then(function(data){
      if( data.store == undefined ){
        angular.forEach( data.error.message, function ( message, input){
          $vm.error[input] = message[0];
        });
      }

      if( data.store ){
        $vm.alert = data;
        $timeout(function(){
          $state.go('sidemenu.secure.mystore');
        }, 1000)
      }
    })
  }

}])

.controller('CartCtrl', ['$scope', function ($scope) {
  var $vm = $scope;
}])

.controller('SearchCtrl', ['$scope', function ($scope) {
  var $vm = $scope;
}])

.controller('AddProductCtrl', ['$scope','ajaxService', function ($scope, ajaxService){
  var $vm = $scope;

    $vm.item = {};
    $vm.selectType = true;
    $vm.create = {};
    $vm.show = {};
    $vm.selectOptions = {
      listingdays : [ 90, 30, 10, 7, 5, 3, 1 ]
    };

    $vm.producttypeFunc = function ( type ){
      if( type !== undefined ){$vm.product = type;}
       $vm.showdescriptive();
      $vm.selectType = false;
    }

    $vm.showdescriptive = function(){
      $vm.show.create = 'descriptive';
      $vm.expandText = function(){
        var element = document.getElementById("desc");
        element.style.height =  element.scrollHeight + "px";
      }
    }

    $vm.createdescriptive = function (){
      $vm.show.create = 'itemcategory';
      //$vm.item.push(item);
      console.log($vm.item);
    }

    $vm.createitemcategory = function (){
      $vm.show.create = 'itemlistingandcondition';
      //$vm.item.push(item);
      console.log($vm.item);
    }

    $vm.createitemlistingandcondition = function(){
      $vm.show.create = 'itempriceanddeal';
     // $vm.item.push(item);
      console.log($vm.item);
    }

    //Fetch product categories here
    ajaxService.getData( '/pb/categories' )
    .then(function(categories){
      $vm.options1 = categories.data;
    })

    //fetching product subcategories by the chosen category above in the forms
    $scope.getOptions2 = function(id){
        ajaxService.getData('/pb/subcategory/category/' + id)
        .then(function(subcategories){
          $vm.show.xfilters = 'false';
          $vm.options2 = subcategories.data;
        });
    }    

    //fetching product subcategories by the chosen category above in the forms
    $scope.getSubcategoryfiltergroup = function(subcatery_id){
        ajaxService.getData('/pb/subcategoryfilters/subcategory/' + subcatery_id)
        .then(function(groupsWithFilters){
          var result = groupsWithFilters.data;

          if( result.length > 0 ){
            $vm.show.xfilters = 'true';
            $vm.fgs = result;
            $vm.item.properties = [];
            console.log(result);
          }else{
            $vm.show.xfilters = 'false';
          }
        });
    }

}])
