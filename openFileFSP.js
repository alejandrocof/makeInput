let file = document.getElementById("openFile");

let variables={};
let arraySlip=[];
let maxSlip=0.0;
let maxRAKE=0.0;
let maxTRUPE=0.0;
let maxRISE=0.0;
let maxSF_MOMENT=0.0;
let max={};
let min={};
var Nx=0;
var Nz=0;

//let sSlip=0.0;


file.addEventListener("change", function () {
	var reader = new FileReader();
	fileback=file.files[0];
	//file.value=""
	reader.onload = function (progressEvent) {
		let i=0;
		let j=0;
		this.result.split(/\r?\n/).forEach((linea) => {
			if( linea.startsWith('%') ){
				const match = linea.match(/% (\w+)\s*:\s*(.+)/);
				if (match) {
					const categoria = match[1];
					line2=match[2].replace(/\([^)]*\)/g, ''); //elimina los comentarios que se encuentran entre parentesis
					line3=line2.trimRight();
					const segmentos = line3.split(/\s+/);
					//console.log(segmentos)
					let existenVars=false;
					for (let i = 1; i < segmentos.length-1; i++ ) {
						if( segmentos[i] == '=' ){
							existenVars=true;
							const nombre = segmentos[i - 1];
							const  valor = segmentos[i + 1];
							if( !(categoria in variables) ){
								variables[categoria]={}
							}
							variables[categoria][nombre] = parseFloat(valor);
						}
					}
					if(!existenVars){
						if( isNaN(parseFloat(match[2]) ))
						variables[categoria] = match[2];
					}
				}
			}
			else{
				Nx=variables['Invs']['Nx'];
				Nz=variables['Invs']['Nz'];
				if(i<Nx && j<Nz){
					//console.log("i:",i,"j:",j);
					const segmentos = linea.split(/\s+/).filter(cadena => cadena.trim() !== '');
					pos = new L.LatLng( parseFloat( segmentos[0] ), parseFloat( segmentos[1] ) )
					const X = parseFloat( segmentos[2] );
					const Y = parseFloat( segmentos[3] );
					const Z = parseFloat( segmentos[4] );
					const SLIP = parseFloat( segmentos[5] );
					const RAKE = parseFloat( segmentos[6] );
					const TRUP = parseFloat( segmentos[7] );
					const RISE = parseFloat( segmentos[8] );
					const SF_MOMENT = parseFloat( segmentos[9] );
					
					
					if(i==0){
						if(j==0){
							min['X']=max['X']=X;
							min['Y']=max['Y']=Y;
							min['Z']=max['Z']=Z;
							min['SLIP']=max['SLIP']=SLIP;
							min['RAKE']=max['RAKE']=RAKE;
							min['TRUP']=max['TRUP']=TRUP;
							min['RISE']=max['RISE']=RISE;
							min['SF_MOMENT']=max['SF_MOMENT']=SF_MOMENT;
							//sSlip=0
							arraySlip=new Array(Nz);
							//console.log("j=0 Nz=",Nz);
						}
						arraySlip[j]=new Array(Nx);
						//console.log("i=0 Nx=",Nx);
					}
					else{
						min['X'] = Math.min(X,min['X']);
						min['Y'] = Math.min(Y,min['Y']);
						min['Z'] = Math.min(Z,min['Z']);
						min['SLIP'] = Math.min(SLIP,min['SLIP']);
						min['RAKE'] = Math.min(RAKE,min['RAKE']);
						min['TRUP'] = Math.min(TRUP,min['TRUP']);
						min['RISE'] = Math.min(RISE,min['RISE']);
						min['SF_MOMENT'] = Math.min(SF_MOMENT,min['SF_MOMENT']);
						
						max['X'] = Math.max(X,max['X']);
						max['Y'] = Math.max(Y,max['Y']);
						max['Z'] = Math.max(Z,max['Z']);
						max['SLIP'] = Math.max(SLIP,max['SLIP']);
						max['RAKE'] = Math.max(RAKE,max['RAKE']);
						max['TRUP'] = Math.max(TRUP,max['TRUP']);
						max['RISE'] = Math.max(RISE,max['RISE']);
						max['SF_MOMENT'] = Math.max(SF_MOMENT,max['SF_MOMENT']);
					}
					
					
					
					//arraySlip[j][i]={'lat':lat,'lon':lon,'pos':pos,'slip':slip, 'Z':Z};
					arraySlip[j][i]={'pos':pos,'SLIP':SLIP, 'X':X, 'Y':Y, 'Z':Z,
					'RAKE':RAKE, 'TRUP':TRUP, 'RISE':RISE, 'SF_MOMENT':SF_MOMENT};
					i++;
					if(i>=variables['Invs']['Nx']){
						i=0;
						j++;
					}
				}
				
				
			}
		});
		//console.log(arraySlip);
		console.log(variables);
		setRot((variables['Mech']['STRK']-270+360)%360);
		DIP=variables['Mech']['DIP'];
		RAKE=variables['Mech']['RAKE'];
		//SLIP=sSlip/(Nx*Nz);
		SLIP=maxSlip;
		NDEPTH=nz-2;
		
		//IXPOS = parseInt( Math.round( nx/2 ) );
		//IYPOS = parseInt( Math.round( ny/2 ) );
		
		NBGX=1;
		NEDX=nx;
		NSKPX=1;
		
		NBGY=1;
		NEDY=ny;
		NSKPY=1;
		
		NBGZ=nz-2;
		NEDZ=nz-2;
		NSKPZ=1;
		
		
		NTISKP=1;
		
		/*
		NDAMP=25;
		IFRE=0;
		NSV=0;
		VIS3D=1;
		fo=1;
		NSTR=0;
		
		vitesseRupture=0;
		DXRupture=0;
		dtRupture=0;
		nTimeStepsRupture=0;
		factorDeReduccionDelSlip=0;
		lengthInNumberOfSteps=0;
		widthInNumberOfSteps=0;
		xHypocenterIdem=0;
		yHypocenterIdem=0;
		durationEnSegundos=0;
		riseTime=0;
*/
		drawDomain();
		drawSlip();
		drawHyp();
	};
	//reader.readAsText(this.files[0]);
	reader.readAsText(fileback);
	
});


