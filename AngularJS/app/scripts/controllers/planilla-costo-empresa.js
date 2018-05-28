'use strict';

/**
 * @ngdoc function
 * @name angularjsApp.controller:PlanillaCostoEmpresaCtrl
 * @description
 * # PlanillaCostoEmpresaCtrl
 * Controller of the angularjsApp
 */
angular.module('angularjsApp')
  .controller('PlanillaCostoEmpresaCtrl', function ($scope, $uibModal, $filter, $anchorScroll, trabajador, constantes, $rootScope, Notification) {
    
    $anchorScroll();
    $scope.constantes = constantes;
    $scope.isSelect = true;
    $scope.cargado = false;
    $scope.empresa = $rootScope.globals.currentUser.empresa;

    function cargarDatos(){
      $rootScope.cargando = true;
      var datos = trabajador.planillaCostoEmpresa().get();
      datos.$promise.then(function(response){
        $scope.datos = response.datos;
        $scope.totales = response.totales;
        $scope.accesos = response.accesos;
        $rootScope.cargando = false;
        $scope.cargado = true;
        crearModels();
      });
    }

    cargarDatos();

    function crearModels(){
      $scope.objeto = { todos : true };
      for(var i=0, len=$scope.datos.length; i<len; i++){
        $scope.datos[i].check = true;
      }         
      $scope.cargado = true;
    }

    function isSelected(){
      var bool = false;

      for(var i=0,len=$scope.datos.length; i<len; i++){
        if($scope.datos[i].check){
          bool = true;
          break;
        }
      }
    
      return bool;
    }

    function isAllSelected(){
      var bool = true;

      for(var i=0,len=$scope.datos.length; i<len; i++){
        if(!$scope.datos[i].check){
          bool = false;
          break;
        }
      }

      return bool;
    }

    $scope.select = function(check){     
      if(!check){
        if($scope.objeto.todos){
          $scope.objeto.todos = false; 
        }
      }else{
        if(isAllSelected()){
          $scope.objeto.todos = true;
        }
      }
      $scope.isSelect = isSelected();
    }

    $scope.selectAll = function(check){      
      for(var i=0, len=$scope.datos.length; i<len; i++){
        $scope.datos[i].check = check;
      }
      $scope.isSelect = isSelected();
    }

    function descargarExcel(obj){
      var url = $scope.constantes.URL + 'trabajadores/planilla-costo-empresa/descargar-excel/' + obj.nombre;
      $rootScope.cargando=false;
      window.open(url, "_self");
    }

    $scope.generarExcel = function(){
      $rootScope.cargando=true;

      var trabajadores = [];

      for(var i=0,len=$scope.datos.length; i<len; i++){
        if($scope.datos[i].check){
          trabajadores.push($scope.datos[i].idTrabajador);
        }
      }

      var obj = { trabajadores : trabajadores };
      var datos = trabajador.generarPlanilla().post({}, obj);
      datos.$promise.then(function(response){
        if(response.success){
          descargarExcel(response);
        }else{
          // error
          $scope.erroresDatos = response.errores;
          Notification.error({message: response.mensaje, title: 'Mensaje del Sistema'});
          $rootScope.cargando=false;
        }  
      }); 
    }

  });