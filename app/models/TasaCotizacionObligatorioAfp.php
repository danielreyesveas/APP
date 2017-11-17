<?php

class TasaCotizacionObligatorioAfp extends Eloquent {
    
    protected $table = 'tasa_cotizacion_obligatorio_afp';
    protected $connection = "principal";
    
    static function listaTasaCotizacionObligatorioAfp($mes=null){
        
        if(!$mes){
            $mes = \Session::get('mesActivo')->mes;
        }
        
    	$listaTasaCotizacionObligatorioAfp = array();
    	$tasasCotizacionesObligatoriosAfp = TasaCotizacionObligatorioAfp::where('mes', $mes)->orderBy('id', 'ASC')->get();
    	if( $tasasCotizacionesObligatoriosAfp->count() ){
            foreach( $tasasCotizacionesObligatoriosAfp as $tasaCotizacionObligatorioAfp ){
                $idAfp = $tasaCotizacionObligatorioAfp->afp_id;
                $afp = Glosa::find($idAfp)->glosa;
                $listaTasaCotizacionObligatorioAfp[]=array(
                    'id' => $tasaCotizacionObligatorioAfp->id,
                    'idAfp' => $tasaCotizacionObligatorioAfp->afp_id,
                    'afp' => $afp,
                    'tasaAfp' => $tasaCotizacionObligatorioAfp->tasa_afp,
                    'sis' => $tasaCotizacionObligatorioAfp->sis,
                    'tasaAfpIndependientes' => $tasaCotizacionObligatorioAfp->tasa_afp_independientes
                );
            }
    	}
    	return $listaTasaCotizacionObligatorioAfp;
    }
    
    static function errores($datos){
         
        $rules = array(
            'valor' => 'required',
            'nombre' => 'required'
        );

        $message = array(
            'tasaCotizacionObligatorioAfp.required' => 'Obligatorio!'
        );

        $verifier = App::make('validation.presence');
        $verifier->setConnection("principal");

        $validation = Validator::make($datos, $rules, $message);
        $validation->setPresenceVerifier($verifier);

        if($validation->fails()){
            return $validation->messages();
        }else{
            return false;
        }
    }
}