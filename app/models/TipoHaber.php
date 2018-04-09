<?php

class TipoHaber extends Eloquent {
    
    protected $table = 'tipos_haber';
    
    public function haberes(){
        return $this->hasMany('Haber','tipo_haber_id');
    }
    
    public function miCuenta(){
        return $this->belongsTo('Cuenta', 'cuenta_id');
    }
    
    public function cuenta($cuentas = null, $centroCostoId=null)
    {
        $empresa = Session::get('empresa');
        
        if($empresa->centro_costo){
            return $this->haberCuenta($cuentas, $centroCostoId);
        }else{
            if($this->cuenta_id){
                if(!$cuentas){
                    $cuentas = Cuenta::listaCuentas();
                }
                $idCuenta = $this->cuenta_id;
                if(array_key_exists($idCuenta, $cuentas)){
                    return $cuentas[$idCuenta];
                }
            }
        }            
        
        return null;
	}
    
    public function haberCuenta($cuentasCodigo = null, $centroCostoId=null)
    {
        if($centroCostoId){
            $codigo=null;
            if(!$cuentasCodigo){
                $cuentas = Cuenta::listaCuentas();
            }
            $centroCostoCuenta = CuentaCentroCosto::where('concepto', 'haber')
                ->where('concepto_id', $this->id)
                ->where('centro_costo_id', $centroCostoId )
                ->first();

            if( $centroCostoCuenta ){
                if(array_key_exists($centroCostoCuenta->cuenta_id, $cuentasCodigo)){
                    return $cuentasCodigo[$centroCostoCuenta->cuenta_id];
                }
            }
        }else{
            $empresa = Session::get('empresa');
            $centroCostoCuenta = CuentaCentroCosto::where('concepto', 'haber')
                ->where('concepto_id', $this->id)
                ->get();
            if($centroCostoCuenta->count()){
                $asignables = $empresa->centrosAsignables();
                if($centroCostoCuenta->count()==$asignables){
                    return 2;
                }else{
                    return 1;							
                }
            }else{
                return 0;
            }
        }

        return null;
    }
    
    static function isCuentas()
    {
        $tiposHaber = TipoHaber::all();
        $bool = true;
        foreach($tiposHaber as $tipoHaber){
            if(!$tipoHaber->cuenta_id){
                $bool = false;
            }
        }
        
        return $bool;
    }
    
    static function listaTiposHaber(){
    	$listaTiposHaber = array();
    	$tiposHaber = TipoHaber::orderBy('nombre', 'ASC')->get();
    	if( $tiposHaber->count() ){
            foreach( $tiposHaber as $tipoHaber ){
                if($tipoHaber->id>15){
                    $listaTiposHaber[]=array(
                        'id' => $tipoHaber->id,
                        'imponible' => $tipoHaber->imponible ? true : false,
                        'nombre' => $tipoHaber->nombre
                    );
                }
            }
    	}
    	return $listaTiposHaber;
    }
    
    public function misHaberes(){
        
        $idTipoHaber = $this->id;
        $listaHaberes = array();
        $idMes = \Session::get('mesActivo')->id;
        $mes = \Session::get('mesActivo')->mes;
        $misHaberes = Haber::where('tipo_haber_id', $idTipoHaber)->where('mes_id', $idMes)->orWhere('tipo_haber_id', $idTipoHaber)->where('permanente', 1)->orWhere('tipo_haber_id', $idTipoHaber)->where('rango_meses', 1)->where('desde', '<=', $mes)->where('hasta', '>=', $mes)->get();
        
        if( $misHaberes->count() ){
            foreach($misHaberes as $haber){
                $listaHaberes[] = array(
                    'id' => $haber->id,
                    'sid' => $haber->sid,
                    'moneda' => $haber->moneda,
                    'permanente' => $haber->permanente ? true : false,
                    'porMes' => $haber->por_mes ? true : false,
                    'rangoMeses' => $haber->rango_meses ? true : false,
                    'monto' => $haber->monto,
                    'trabajador' => $haber->trabajadorHaber(),
                    'mes' => $haber->mes ? Funciones::obtenerMesAnioTextoAbr($haber->mes) : '',
                    'desde' => $haber->desde ? Funciones::obtenerMesAnioTextoAbr($haber->desde) : '',
                    'hasta' => $haber->hasta ? Funciones::obtenerMesAnioTextoAbr($haber->hasta) : '',
                    'fechaIngreso' => date('Y-m-d H:i:s', strtotime($haber->created_at))
                );
            }
        }
        return $listaHaberes;
    }
    
    public function validar($datos)
    {
        $codigos = TipoHaber::where('codigo', $datos['codigo'])->get();

        if($codigos->count()){
            foreach($codigos as $codigo){
                if($codigo['codigo']==$datos['codigo'] && $codigo['id']!=$this->id){
                    $errores = new stdClass();
                    $errores->codigo = array('El c贸digo ya se encuentra registrado');
                    return $errores;
                }
            }
        }
        return;
    }
    
    public function comprobarDependencias()
    {
        $haberes = $this->haberes;        
        
        if($haberes->count()){
            $errores = new stdClass();
            $errores->error = array("El Tipo de Haber <b>" . $this->nombre . "</b> se encuentra asignado.<br /> Debe <b>eliminar</b> estos haberes primero para poder realizar esta acci贸n.");
            return $errores;
        }
        
        return;
    }
    
    static function errores($datos){
         
        $rules = array(
            'codigo' => 'required|unique:tipos_haber',
            'nombre' => 'required'
        );

        $message = array(
            'tipoHaber.required' => 'Obligatorio!'
        );

        $verifier = App::make('validation.presence');
        //$verifier->setConnection("principal");

        $validation = Validator::make($datos, $rules, $message);
        $validation->setPresenceVerifier($verifier);

        if($validation->fails()){
            return $validation->messages();
        }else{
            return false;
        }
    }
}