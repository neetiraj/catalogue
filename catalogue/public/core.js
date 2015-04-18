// public/core.js
var eStore = angular.module('eStore', ['ui.bootstrap', 'ngRoute']);

 eStore.config(['$routeProvider',function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl : 'product-view.html',
                controller  : 'mainController'
            })

            // route for the contact page
            .when('/products/new', {
                templateUrl : 'product-form.html',
                controller  : 'mainController'
            })

            .otherwise({
                redirectTo: '/'
            });
    }]);

function mainController($scope, $http) {
    $scope.formData = {};
    $scope.addItem = {};
    $scope.selected = undefined;
    $scope.selectedProduct = {};
    $scope.loading = false;
    $scope.customValidationSP = false;

    // when landing on the page, get all Products and show them
    $http.get('/api/products')
        .success(function(data) {
            $scope.products = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });

    // when submitting the add form, send the text to the node API
    $scope.createProduct = function() {
        $http.post('/api/products', $scope.addItem)
            .success(function(data) {
                $scope.addItem = {}; // clear the form so our user is ready to enter another
                $scope.products = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

    // delete a Product after checking it
    $scope.deleteProduct = function(id) {
        $http.delete('/api/products/' + id)
            .success(function(data) {
                $scope.products = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

    // Update a Product 
    $scope.updateProduct = function() {
        $scope.loading = true;
        console.log('inside updateProduct!');
        if ($scope.selectedProduct.sellingPrice < $scope.selectedProduct.costPrice){
            $scope.customValidationSP = true;
            $scope.loading = false;
        } else {
            $http.put('/api/products/' + $scope.selectedProduct.productId, $scope.selectedProduct)
                .success(function(data) {
                    $scope.products = data;
                    console.log(data);
                    $scope.loading = false;
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                    $scope.loading = false;
                });
        }
    };

    $scope.onProductSelect = function($item) {
        $scope.selectedProduct = $.extend({}, $item);
        console.log($scope.selectedProduct);
    };

    $scope.resetSearch = function(){
        $scope.selected = undefined;
        $scope.selectedProduct = undefined;
        $scope.customValidationSP = false;
    }

}