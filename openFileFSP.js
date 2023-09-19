let file = document.getElementById("openFile");

let variables={};
let arraySlip=[];
let maxSlip=0


file.addEventListener("change", function () {
	var reader = new FileReader();
	fileback=file.files[0];
	file.value=""
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
					if(i==0){
						if(j==0){
							maxSlip=0
							arraySlip=new Array(Nz);
							//console.log("j=0 Nz=",Nz);
						}
						arraySlip[j]=new Array(Nx);
						//console.log("i=0 Nx=",Nx);
					}
					const segmentos = linea.split(/\s+/).filter(cadena => cadena.trim() !== '');
					lat = parseFloat( segmentos[0] );
					lon = parseFloat( segmentos[1] );
					pos = new L.LatLng( parseFloat( segmentos[0] ), parseFloat( segmentos[1] ) )
					slip = parseFloat( segmentos[5] );
					maxSlip=Math.max(slip,maxSlip)
					Z = parseFloat( segmentos[4] );
					arraySlip[j][i]={'lat':lat,'lon':lon,'pos':pos,'slip':slip, 'Z':Z};
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
		setRot(variables['Mech']['STRK']-270);
		DIP=variables['Mech']['DIP'];
		RAKE=variables['Mech']['RAKE'];
		
		drawDomain();
		drawSlip();
		drawHyp();
	};
	//reader.readAsText(this.files[0]);
	reader.readAsText(fileback);
	
});


