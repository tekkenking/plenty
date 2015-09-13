angular.module('starter.directives', ['ngMessages'])
.directive('phone', function () {
	return {
		restrict: 'A',
		require : 'ngModel',
		link 	: function ( $scope, $ele, $attr, ctrl ) {
			ctrl.$validators.phone = function ( value ){
		
				return new RegExp( /^\s*(?:\+?(\d{1,3}))?([-. (]*(\d{3})[-. )]*)?((\d{3})[-. ]*(\d{2,4})(?:[-.x ]*(\d+))?)\s*$/ )
				.test( value )

			}

		}
	}
})
.directive('email', function () {
	return {
		restrict: 'A',
		require : 'ngModel',
		link 	: function ( $scope, $ele, $attr, ctrl ) {
			ctrl.$validators.email = function ( value ){
		
				return new RegExp( /([\w-\.]+)@((?:[\w]+\.)+)([a-zA-Z]{2,4})/ )
				.test( value )

			}

		}
	}
})

/*.directive('unique', function ( ajaxService ) {
	return {
		restrict 	: "A",
		require 	: "ngModel",
		scope 		: {},
		link 		: function ( $scope, $ele, $attr, ctrl ) {
			ctrl.$asyncValidators.unique = function ( value ) {
				return ajaxService.isUnique( ctrl.$name , value);
			}
		}
	}
})*/

.directive('initialValue', function() {
  var removeIndent = function (str) {
		var arr = str.split("\n");
		var result = "";
		arr.forEach(function (it) {
			result += it.trim();
			result += '\n';
		});

		return result;
	};
  
  
  return{
    restrict: 'A',
    controller: ['$scope', '$element', '$attrs', '$parse', function($scope, $element, $attrs, $parse){

      var getter, setter, val, tag;
      tag = $element[0].tagName.toLowerCase();

      val = $attrs.initialValue || removeIndent($element.val());
      if(tag === 'input'){
        if($element.attr('type') === 'checkbox'){
          val = $element[0].checked ? true : undefined;
        } else if($element.attr('type') === 'radio'){
          val = ($element[0].checked || $element.attr('selected') !== undefined) ? $element.val() : undefined;
        }else if( $element.attr('type') === 'number' ){
        	val = $element.val() * 1;
        }
      }

      if($attrs.ngModel){
        getter = $parse($attrs.ngModel);
        setter = getter.assign;
        setter($scope, val);
      }
    }]
  };
});