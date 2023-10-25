const idNTNumber = document.querySelector( '#idNTNumber' );
const idNTInput = document.querySelector( '#idNTInput' );
const idDTNumber = document.querySelector( '#idDTNumber' );
const idDTInput = document.querySelector( '#idDTInput' );

const idNxNumber = document.querySelector( '#idNxNumber' );
const idNxInput = document.querySelector( '#idNxInput' );
const idNyNumber = document.querySelector( '#idNyNumber' );
const idNyInput = document.querySelector( '#idNyInput' );
const idNzNumber = document.querySelector( '#idNzNumber' );
const idNzInput = document.querySelector( '#idNzInput' );

const idNgxNumber = document.querySelector( '#idNgxNumber' );
const idNgxInput = document.querySelector( '#idNgxInput' );
const idNgyNumber = document.querySelector( '#idNgyNumber' );
const idNgyInput = document.querySelector( '#idNgyInput' );
const idNgzNumber = document.querySelector( '#idNgzNumber' );
const idNgzInput = document.querySelector( '#idNgzInput' );

const idDHNumber = document.querySelector( '#idDHNumber' );
const idDHInput = document.querySelector( '#idDHInput' );
const idRotNumber = document.querySelector( '#idRotNumber' );
const idRotInput = document.querySelector( '#idRotInput' );
const idFileInputPre = document.querySelector( '#idFileInputPre' );
const idStrike = document.querySelector( '#idStrike' );
const idStr = document.querySelector( '#idStr' );




var latlon2m = 104270.0;
var NT;
var nx, ny, nz;
var ngx, ngy, ngz;
var DH;
var DT;
var STR, DIP, RAKE;
var SLIP;
var NXSC, NYSC, NZSC;
var NDEPTH;
var IXPOS, IYPOS;
var NBGX, NEDX, NSKPX;
var NBGY, NEDY, NSKPY;
var NBGZ, NEDZ, NSKPZ;
var NTISKP;
var NDAMP;
var IFRE;
var NSV;
var VIS3D;
var fo;
var NSTR;
var nholes;
var Rot;

var vitesseRupture;
var DXRupture;
var dtRupture;
var nTimeStepsRupture;
var factorDeReduccionDelSlip;
var lengthInNumberOfSteps;
var widthInNumberOfSteps;
var xHypocenterIdem;
var yHypocenterIdem;
var durationEnSegundos;
var riseTime;

let cells=[];


nint=( rval )=>{
	if(rval < 0.0)
		return (rval - 0.5);
	else
		return (rval + 0.5);
}

sx=( i )=>{
	let ini,fin;
	let r=0;
	if(i==indexinix)ini=NBGX;
	else ini=N_SDx*i+1;
	fin=N_SDx*(i+1);
	if(fin>NEDX)fin=NEDX;
	return nint( (fin-ini+1)/NSKPX );
}

setBGN=()=>{
	N_SDx=parseInt(nx/ngx,10);
	indexinix=NBGX/N_SDx;
	indexendx=NEDX/N_SDx;
	
	if( sx(indexinix)==0 )indexinix+=1;
	if( sx(indexendx)==0 )indexendx-=1;
	if( indexendx>=ngx ) indexendx=ngx-1;
	/*
	console.log("nx:",nx," ngx:",ngx," N_SDx:",N_SDx);
	console.log("NBGX:",NBGX," NEDX:",NEDX);
	console.log("indexinix:",indexinix);
	console.log("indexendx:",indexendx);
	*/
}



function rotPoint(P0,P,alpha){
	c=Math.cos(alpha*Math.PI/180)
	s=Math.sin(alpha*Math.PI/180)
	dlng=P.lng-P0.lng
	dlat=P.lat-P0.lat
	return new L.LatLng( P0.lat + dlng*s + dlat*c, P0.lng + dlng*c - dlat*s );
}

class DomCell {
	constructor(Rot, Origin, theta,dx,dy){
		this.Rot = Rot;
		this.theta = theta;
		this.dx=dx;
		this.dy=dy;
		
		this.latN=Origin.lat+0.5*this.dy;
		this.latS=Origin.lat-0.5*this.dy;
		this.lngE=Origin.lng+0.5*this.dx;
		this.lngO=Origin.lng-0.5*this.dx;
		
		this.rotOrigin=rotPoint( Rot, Origin, theta);
		//console.log("Rot:",this.Rot,"Origin:",this.Origin,"lat0:",this.lat0,this.latN);
	}
	
	ij2cell(i,j,label,color='green'){
		const latN = this.latN + (j-1)*this.dy;
		const latS = this.latS + (j-1)*this.dy;
		const lngE = this.lngE + (i-1)*this.dx;
		const lngO = this.lngO + (i-1)*this.dx;
   	var inilatlngs = [
				rotPoint( this.Rot, new L.LatLng( latS, lngO ), this.theta),
				rotPoint( this.Rot, new L.LatLng( latS, lngE ), this.theta),
				rotPoint( this.Rot, new L.LatLng( latN, lngE ), this.theta),
				rotPoint( this.Rot, new L.LatLng( latN, lngO ), this.theta)
		];
		return L.polygon(inilatlngs, {color: color, pane: 'celdas'}).bindPopup(label+`<br>(${i},${j})`).addTo(map);
	}
	
	latlng2ij(lat,lng){
		const {lat:latj,lng:lngi} = rotPoint( this.rotOrigin, new L.LatLng(lat, lng), -this.theta);
		let i = parseInt( Math.round( (lngi - this.rotOrigin.lng)/this.dx) )+1;
		let j = parseInt( Math.round( (latj - this.rotOrigin.lat)/this.dy) )+1;
		return { i:i, j:j };
	}
	
	latlng2cell( lat, lng, label ){
		const { i, j } = this.latlng2ij( lat, lng );
		return this.ij2cell( i, j, label );
	}
}

function drawDomain(){
	let POI_Dom=[];
	if( 'Loc' in variables ){
		if( cells.length > 0 ){
			cells.forEach( (sg)=>map.removeLayer(sg));
			cells=[];
		}
		
		latRot=variables['Loc']['LAT'];
		lngRot=variables['Loc']['LON'];
		dx=DH/latlon2m;
		dy=DH/latlon2m;
		ndx=nx*dx;
		ndy=ny*dy;
		theta=-Rot;
		//theta=0;
		var latlngs = [
			rotPoint( new L.LatLng(latRot, lngRot), new L.LatLng(latRot+0.5*ndy, lngRot-0.5*ndx), theta),
			rotPoint( new L.LatLng(latRot, lngRot), new L.LatLng(latRot+0.5*ndy, lngRot+0.5*ndx), theta),
			rotPoint( new L.LatLng(latRot, lngRot), new L.LatLng(latRot-0.5*ndy, lngRot+0.5*ndx), theta),
			rotPoint( new L.LatLng(latRot, lngRot), new L.LatLng(latRot-0.5*ndy, lngRot-0.5*ndx), theta)
		];
		cells.push( L.polygon(latlngs, {color: 'gray', pane: 'domain'}).addTo(map) );
		
		lat0=latRot-0.5*ndy+0.5*dy;
		lng0=lngRot-0.5*ndx+0.5*dx;
		let Points= new DomCell( new L.LatLng(latRot, lngRot), new L.LatLng(lat0, lng0), theta,dx,dy);

		cells.push( Points.ij2cell( 1, 1, `Origen<br>Lat: ${lat0}<br>lng: ${lng0}`,'red') );
		cells.push( Points.ij2cell( nx, 1, 'Fin X') );
		cells.push( Points.ij2cell( 1, ny, 'Fin Y') );
		cells.push( Points.ij2cell( nx, ny, 'Fin X Y') );
		
		//for(let k=0;k<Nx;k++){
		//	cells.push( Points.latlng2cell( arraySlip[0][k].pos.lat, arraySlip[0][k].pos.lng,
		//	`Celda slip<br>lat: ${arraySlip[0][k].pos.lat}<br>lng: ${arraySlip[0][k].pos.lng}<br>Z: ${arraySlip[0][k].Z} km` ) );
		//}
		
		cells.push( Points.latlng2cell( arraySlip[0][0].pos.lat, arraySlip[0][0].pos.lng,
		`Celda slip<br>lat: ${arraySlip[0][0].pos.lat}<br>lng: ${arraySlip[0][0].pos.lng}<br>Z: ${arraySlip[0][0].Z} km` ) );
		
		cells.push( Points.latlng2cell( arraySlip[0][Nx-1].pos.lat, arraySlip[0][Nx-1].pos.lng,
		`Celda slip<br>lat: ${arraySlip[0][Nx-1].pos.lat}<br>lng: ${arraySlip[0][Nx-1].pos.lng}<br>Z: ${arraySlip[0][Nx-1].Z} km` ) );
		
		cells.push( Points.latlng2cell( arraySlip[Nz-1][Nx-1].pos.lat, arraySlip[Nz-1][Nx-1].pos.lng,
		`Celda slip<br>lat: ${arraySlip[Nz-1][Nx-1].pos.lat}<br>lng: ${arraySlip[Nz-1][Nx-1].pos.lng}<br>Z: ${arraySlip[Nz-1][Nx-1].Z} km` ) );
		
		cells.push( Points.latlng2cell( arraySlip[Nz-1][0].pos.lat, arraySlip[Nz-1][0].pos.lng,
		`Celda slip<br>lat: ${arraySlip[Nz-1][0].pos.lat}<br>lng: ${arraySlip[Nz-1][0].pos.lng}<br>Z: ${arraySlip[Nz-1][0].Z} km` ) );
	//	cells.push( Points.latlng2cell( arraySlip[0][0].pos.lat, arraySlip[0][0].pos.lng,
		//`Celda slip<br>lat: ${arraySlip[0][0].pos.lat}<br>lng: ${arraySlip[0][0].pos.lng}<br>Z: ${arraySlip[0][0].Z} km` ) );
		
		const { i:i_iniSlip, j:j_iniSlip } = Points.latlng2ij( arraySlip[0][Nx-1].pos.lat, arraySlip[0][Nx-1].pos.lng );
		NXSC=i_iniSlip
		NYSC=j_iniSlip
		NZSC=nz-1-parseInt( Math.round( 1000.0*arraySlip[0][Nx-1].Z/DH ) );
		//points of interest
		POI = estaciones.map(function(obj) {
			return { lat: obj.LATITUD, lng: obj.LONGITUD, label: obj.CLAVE, i:1, j:1 };
		});
		
		POI.forEach( ({lat,lng,label})=>{
			const { i, j }=Points.latlng2ij( lat, lng );
			if( i>0 && i<nx && j>0 && j<ny ){
				POI_Dom.push( { i:i, j:j, label:label } );
				cells.push( Points.ij2cell( i, j, `${label}<br>Lat: ${lat}<br>lng: ${lng}`) );
			}
		})
	}
	
	nholes=POI_Dom.length;
	idFileInputPre.textContent=
`${Number(NT).toFixed(0)} NT    = # of timesteps
${Number(nx).toFixed(0) } nx    = number of steps in x direction
${Number(ny).toFixed(0) } ny    = number of steps in y direction
${Number(nz).toFixed(0) } nz    = number of steps in z direction
${Number(ngx).toFixed(0) } ngx    = number of mpi blocs in x direction
${Number(ngy).toFixed(0) } ngy    = number of mpi blocs in y direction
${Number(ngz).toFixed(0) } ngz    = number of mpi blocs in z direction
${Number(DH).toFixed(0) } DH          = spatial step (meters)
${Number(DT).toFixed(3) } DT          = time step (seconds)
${Number(STR).toFixed(1) } STR            = strike of fault
${Number(DIP).toFixed(1) } DIP            = dip of fault
${Number(RAKE).toFixed(1) } RAKE           = rake of fault
${Number(SLIP).toFixed(1) } SLIP           = slip of fault
${Number(NXSC).toFixed(0) } NXSC           = x nodal position for point source
${Number(NYSC).toFixed(0) } NYSC           = y nodal position for point source
${Number(NZSC).toFixed(0) } NZSC           = z nodal position for point source
${Number(NDEPTH).toFixed(0) } NDEPTH         = depth at which we plot snapshots
${Number(IXPOS).toFixed(0) } IXPOS          = position of the vertical cross section along y
${Number(IYPOS).toFixed(0) } IYPOS          = position of the vertical cross section along x
${Number(NBGX).toFixed(0) } NBGX           = first x node to contain surface receivers
${Number(NEDX).toFixed(0) } NEDX           = last x node to contain surface receivers
${Number(NSKPX).toFixed(0) } NSKPX          = skip of nodes containing x receivers
${Number(NBGY).toFixed(0) } NBGY           = first y node to contain surface receivers
${Number(NEDY).toFixed(0) } NEDY           = last y node to contain surface receivers
${Number(NSKPY).toFixed(0) } NSKPY          = skip of nodes containing y receivers
${Number(NBGZ).toFixed(0) } NBGZ           = first  node z to contain surface receivers
${Number(NEDZ).toFixed(0) } NEDZ           = last z node to contain surface receivers
${Number(NSKPZ).toFixed(0) } NSKPZ          = skip of nodes containing z receivers
${Number(NTISKP).toFixed(0) } NTISKP         = time skip of seismograms
${Number(NDAMP).toFixed(0) } NDAMP          = size of nodal region for exp damping
${Number(IFRE).toFixed(0) } IFRE           = 0 flat, <>0 irregular free surface
${Number(NSV).toFixed(0) } NSV            = 0 no checkpt, >0 checkpt every nsv step
${Number(VIS3D).toFixed(0) } vis3d          = 0 no Vis3D, 1 = Vis3D
${Number(fo).toFixed(0) } fo             = atenuation factor
${Number(NSTR).toFixed(0) } nstr           = mkmodel, 0 = homogeneous
${Number(nholes).toFixed(0) } nholes         = # of seismograms on the surface
`;


	POI_Dom.forEach(({i,j,label})=>{
		idFileInputPre.textContent+=`${Number(i).toFixed(0)} ${Number(j).toFixed(0)}            = ${label}\n`
	})
	
	idFileInputPre.textContent+=`${Number(vitesseRupture).toFixed(0) }         = vitesse rupture
${Number(DXRupture).toFixed(0) }         = dx
${Number(dtRupture).toFixed(3) }         = dt
${Number(nTimeStepsRupture).toFixed(0) }         = ntime steps
${Number(factorDeReduccionDelSlip).toFixed(1) }         = factor de reduccion del slip
${Number(lengthInNumberOfSteps).toFixed(0) }         = length in number of steps
${Number(widthInNumberOfSteps).toFixed(0) }         = width in number of steps
${Number(xHypocenterIdem).toFixed(0) }         = x_hypocenter idem
${Number(yHypocenterIdem).toFixed(0) }         = y_hypocenter idem
${Number(durationEnSegundos).toFixed(1) }         = duration  en segundos
${Number(riseTime).toFixed(1) }         = rise time
`;

}


idNTNumber.oninput = (number) => {
	setNT( number.target.value );
}
idNTInput.oninput = (slider) => {
	setNT( slider.target.value );
};
setNT=( value )=>{
	NT=value;
	idNTNumber.value=NT;
	idNTInput.value=NT;
	drawDomain();
}
setNT(1000);

idDTNumber.oninput = (number) => {
	setDT( number.target.value );
}
idDTInput.oninput = (slider) => {
	setDT( slider.target.value );
};
setDT=( value )=>{
	DT=value;
	idDTNumber.value=DT;
	idDTInput.value=DT;
	drawDomain();
}
setDT(0.03);


idNxNumber.oninput = (number) => {
	setNx( number.target.value );
}
idNxInput.oninput = (slider) => {
	setNx( slider.target.value );
};
setNx=( value )=>{
	nx=value;
	NEDX=nx;
	setBGN();
	idNxNumber.value=nx;
	idNxInput.value=nx;
	drawDomain();
	draw3DSlip();
}
setNx(100);

idNyNumber.oninput = (number) => {
	setNy( number.target.value );
}
idNyInput.oninput = (slider) => {
	setNy( slider.target.value );
};
setNy=( value )=>{
	ny=value;
	NEDY=ny;
	idNyNumber.value=ny;
	idNyInput.value=ny;
	drawDomain();
	draw3DSlip();
}
setNy(100);

idNzNumber.oninput = (number) => {
	setNz( number.target.value );
}
idNzInput.oninput = (slider) => {
	setNz( slider.target.value );
};
setNz=( value )=>{
	nz=value;
	NDEPTH=nz-2;
	NBGZ=nz-2;
	NEDZ=nz-2;
	idNzNumber.value=nz;
	idNzInput.value=nz;
	drawDomain();
	draw3DSlip();
}
setNz(100);


/*************/
idNgxNumber.oninput = (number) => {
	setNgx( number.target.value );
}
idNgxInput.oninput = (slider) => {
	setNgx( slider.target.value );
};
setNgx=( value )=>{
	ngx=value;
	setBGN();
	idNgxNumber.value=ngx;
	idNgxInput.value=ngx;
	drawDomain();
}
setNgx(2);

idNgyNumber.oninput = (number) => {
	setNgy( number.target.value );
}
idNgyInput.oninput = (slider) => {
	setNgy( slider.target.value );
};
setNgy=( value )=>{
	ngy=value;
	idNgyNumber.value=ngy;
	idNgyInput.value=ngy;
	drawDomain();
}
setNgy(2);

idNgzNumber.oninput = (number) => {
	setNgz( number.target.value );
}
idNgzInput.oninput = (slider) => {
	setNgz( slider.target.value );
};
setNgz=( value )=>{
	ngz=value;
	idNgzNumber.value=ngz;
	idNgzInput.value=ngz;
	drawDomain();
}
setNgz(2);


setBGN();
/*********************/

idDHNumber.oninput = (number) => {
	setDH( number.target.value );
}
idDHInput.oninput = (slider) => {
	setDH( slider.target.value );
};
setDH=( value )=>{
	DH=value;
	idDHNumber.value=DH;
	idDHInput.value=DH;
	drawDomain();
}
setDH(1000);


idRotNumber.oninput = (number) => {
	setRot( number.target.value );
}
idRotInput.oninput = (slider) => {
	setRot( slider.target.value );
};
setRot=( value )=>{
	Rot=value;
	if('Mech' in variables){
		STR=((variables['Mech']['STRK']-270-value)+360)%360;
		idStrike.textContent=`STRIKE (fsp): ${Number(variables["Mech"]["STRK"]).toFixed(1)}`;
		idStr.textContent=`STR (input): ${Number(STR).toFixed(1)}`;
	}
	idRotNumber.value=Rot;
	idRotInput.value=Rot;
	drawDomain();
	drawSlip();
}
setRot(0);



