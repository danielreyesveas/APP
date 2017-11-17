'use strict';

/**
 * @ngdoc function
 * @name angularjsApp.controller:IngresoInasistenciasCtrl
 * @description
 * # IngresoInasistenciasCtrl
 * Controller of the angularjsApp
 */
angular.module('angularjsApp')
  .controller('IngresoInasistenciasCtrl', function ($scope, $uibModal, $filter, $anchorScroll, trabajador, constantes, $rootScope, Notification) {
    $anchorScroll();
    
    $scope.datos = [];
    $scope.constantes = constantes;
    $scope.cargado = false;

    function cargarDatos(){
      $rootScope.cargando=true;
      var datos = trabajador.totalInasistencias().get();
      datos.$promise.then(function(response){
        $scope.datos = response.datos;
        $scope.accesos = response.accesos;
        $rootScope.cargando=false;
        $scope.cargado = true;
      });
    };

    cargarDatos();

    $scope.openInasistencia = function(obj){
      var miModal = $uibModal.open({
        animation: true,
        templateUrl: 'views/forms/form-nueva-inasistencia.html?v=' + $filter('date')(new Date(), 'ddMMyyyyHHmmss'),
        controller: 'FormInasistenciasCtrl',
        resolve: {
          objeto: function () {
            return obj;          
          }
        }
      });
      miModal.result.then(function (object) {
        Notification.success({message: object.mensaje, title: 'Mensaje del Sistema'});
        cargarDatos();         
      }, function () {
        javascript:void(0)
      });
    };

    $scope.openDetalleInasistencias = function(obj){
      var miModal = $uibModal.open({
        animation: true,
        templateUrl: 'views/forms/form-detalle-inasistencias.html?v=' + $filter('date')(new Date(), 'ddMMyyyyHHmmss'),
        controller: 'FormDetalleInasistenciasCtrl',
        size: 'lg',
        resolve: {
          objeto: function () {
            return obj;          
          }
        }
      });
     miModal.result.then(function (mensaje) {
        Notification.success({message: mensaje, title: 'Mensaje del Sistema'});
        cargarDatos();         
      }, function () {
        cargarDatos();      
      });
    };    

    $scope.detalle = function(sid){
      $rootScope.cargando=true;
      var datos = trabajador.inasistencias().get({sid: sid});
      datos.$promise.then(function(response){
        $scope.openDetalleInasistencias( response );
        $rootScope.cargando=false;
      });
    };

  })
  .controller('FormDetalleInasistenciasCtrl', function ($rootScope, $uibModal, $filter, Notification, $scope, $uibModalInstance, objeto, inasistencia, trabajador) { 
    
    $scope.trabajador = angular.copy(objeto.datos);
    $scope.accesos = angular.copy(objeto.accesos);

    function cargarDatos(tra){
      $rootScope.cargando=true;
      var datos = trabajador.inasistencias().get({sid: tra});
      datos.$promise.then(function(response){
        $scope.trabajador = response.datos;
        $scope.accesos = response.accesos;
        $rootScope.cargando=false;
      });
    };

    $scope.editar = function(ina, tra){
      $rootScope.cargando=true;
      var datos = inasistencia.datos().get({sid: ina.sid});
      datos.$promise.then(function(response){
        $scope.openInasistencia( response );
        $rootScope.cargando=false;
      });
    };

    $scope.eliminar = function(ina, tra){
      $rootScope.cargando=true;
      $scope.result = inasistencia.datos().delete({ sid: ina.sid });
      $scope.result.$promise.then( function(response){
        if(response.success){
          Notification.success({message: response.mensaje, title:'Notificación del Sistema'});
          cargarDatos(tra);
        }
      });
    }

    $scope.openInasistencia = function(obj){
      var miModal = $uibModal.open({
        animation: true,
        templateUrl: 'views/forms/form-nueva-inasistencia.html?v=' + $filter('date')(new Date(), 'ddMMyyyyHHmmss'),
        controller: 'FormInasistenciasCtrl',
        resolve: {
          objeto: function () {
            return obj;          
          }
        }
      });
      miModal.result.then(function (object) {
        Notification.success({message: object.mensaje, title: 'Mensaje del Sistema'});
        cargarDatos(object.sidTrabajador);         
      }, function () {
        javascript:void(0)
      });
    };

  })
  .controller('FormInasistenciasCtrl', function ($rootScope, Notification, $scope, $uibModalInstance, objeto, inasistencia, fecha) {

    var mesActual = $rootScope.globals.currentUser.empresa.mesDeTrabajo;
    
    if(objeto.trabajador){
      $scope.trabajador = angular.copy(objeto.trabajador);
      $scope.inasistencia = angular.copy(objeto);
      $scope.inasistencia.desde = fecha.convertirFecha($scope.inasistencia.desde);
      $scope.inasistencia.hasta = fecha.convertirFecha($scope.inasistencia.hasta);
      $scope.isEdit = true;
      $scope.titulo = 'Modificación Inasistencia';
    }else{
      $scope.trabajador = angular.copy(objeto);
      $scope.isEdit = false;
      $scope.titulo = 'Ingreso Inasistencia';
    }

    $scope.motivos = [
                      { id : 1, nombre : 'Falta sin aviso' },
                      { id : 2, nombre : 'Permiso sin goce de sueldo' }
    ];

    $scope.guardar = function(inasist, trabajador){
      
      $rootScope.cargando=true;
      var mes = $rootScope.globals.currentUser.empresa.mesDeTrabajo;
      var response;
      var Inasistencia = { idTrabajador : trabajador.id, idMes : mes.id, desde : inasist.desde, hasta : inasist.hasta, dias : inasist.dias, motivo : inasist.motivo, observacion : inasist.observacion };

      if( $scope.inasistencia.sid ){
        response = inasistencia.datos().update({sid:$scope.inasistencia.sid}, Inasistencia);
      }else{
        response = inasistencia.datos().create({}, Inasistencia);
      }
      response.$promise.then(
        function(response){
          if(response.success){
            $uibModalInstance.close({ mensaje : response.mensaje, sidTrabajador : trabajador.sid });
          }else{
            // error
            $scope.erroresDatos = response.errores;
            Notification.error({message: response.mensaje, title: 'Mensaje del Sistema'});
          }
          $rootScope.cargando=false;
        }
      );
    }

    $scope.calcularDias = function(){
      if($scope.inasistencia.desde && $scope.inasistencia.hasta){
        $scope.inasistencia.dias = (($scope.inasistencia.hasta - $scope.inasistencia.desde) / 86400000 + 1);
      }
    }
    
    // Fecha
    $scope.today = function() {
      $scope.dt = new Date();
    };
    $scope.today();
    $scope.inlineOptions = {
      customClass: getDayClass,
      minDate: new Date(),
      showWeeks: true
    };

    $scope.dateOptions = {
      //dateDisabled: disabled,
      formatYear: 'yy',
      maxDate: fecha.convertirFecha(mesActual.fechaRemuneracion),
      minDate: fecha.convertirFecha(mesActual.mes),
      startingDay: 1
    };  

    function disabled(data) {
      var date = data.date,
        mode = data.mode;
      return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
    }

    $scope.toggleMin = function() {
      $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
      $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
    };

    $scope.toggleMin();

    $scope.openFechaHasta = function() {
      $scope.popupFechaHasta.opened = true;
    };

    $scope.openFechaDesde = function() {
      $scope.popupFechaDesde.opened = true;
    };

    $scope.setDate = function(year, month, day) {
      $scope.fecha = new Date(year, month, day);
    };

    $scope.format = ['dd-MMMM-yyyy'];

    $scope.popupFechaHasta = {
      opened: false
    };
    $scope.popupFechaDesde = {
      opened: false
    };

    function getDayClass(data) {
      var date = data.date,
        mode = data.mode;
      if (mode === 'day') {
        var dayToCheck = new Date(date).setHours(0,0,0,0);
        for (var i = 0; i < $scope.events.length; i++) {
          var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);
          if (dayToCheck === currentDay) {
            return $scope.events[i].status;
          }
        }
      }
      return '';
    }

  });
