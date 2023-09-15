const idNTNumber = document.querySelector( '#idNTNumber' );
const idNTInput = document.querySelector( '#idNTInput' );
const idNxNumber = document.querySelector( '#idNxNumber' );
const idNxInput = document.querySelector( '#idNxInput' );
const idNyNumber = document.querySelector( '#idNyNumber' );
const idNyInput = document.querySelector( '#idNyInput' );
const idNzNumber = document.querySelector( '#idNzNumber' );
const idNzInput = document.querySelector( '#idNzInput' );
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
var vis3d;
var fo;
var nstr;
var nholes;
var Rot;

var polyline
var inipolyline

function rotPoint(P0,P,alpha){
	c=Math.cos(alpha*Math.PI/180)
	s=Math.sin(alpha*Math.PI/180)
	dlng=P.lng-P0.lng
	dlat=P.lat-P0.lat
	return new L.LatLng( P0.lat + dlng*s + dlat*c, P0.lng + dlng*c - dlat*s );
}

function drawDomain(){
	if( 'Loc' in variables ){
		if( polyline ){
			map.removeLayer(polyline);
			map.removeLayer(inipolyline);
		}
		
		lat=variables['Loc']['LAT'];
		lng=variables['Loc']['LON'];
		dx=DH/latlon2m;
		dy=DH/latlon2m;
		ndx=nx*dx;
		ndy=ny*dy;
		theta=-Rot;
		//theta=0;
		var latlngs = [
			rotPoint( new L.LatLng(lat, lng), new L.LatLng(lat+0.5*ndy, lng-0.5*ndx), theta),
			rotPoint( new L.LatLng(lat, lng), new L.LatLng(lat+0.5*ndy, lng+0.5*ndx), theta),
			rotPoint( new L.LatLng(lat, lng), new L.LatLng(lat-0.5*ndy, lng+0.5*ndx), theta),
			rotPoint( new L.LatLng(lat, lng), new L.LatLng(lat-0.5*ndy, lng-0.5*ndx), theta)
		];
		polyline = L.polygon(latlngs, {color: 'gray', pane: 'domain'}).addTo(map);
		
		var inilatlngs = [
			rotPoint( new L.LatLng(lat, lng), new L.LatLng(lat+0.5*ndy, lng-0.5*ndx), theta),
			rotPoint( new L.LatLng(lat, lng), new L.LatLng(lat+0.5*ndy, lng-0.5*ndx+dx), theta),
			rotPoint( new L.LatLng(lat, lng), new L.LatLng(lat+0.5*ndy-dy, lng-0.5*ndx+dx), theta),
			rotPoint( new L.LatLng(lat, lng), new L.LatLng(lat+0.5*ndy-dy, lng-0.5*ndx), theta)
		];
		inipolyline = L.polygon(inilatlngs, {color: 'blue', pane: 'domain'}).addTo(map);
		
	}

	idFileInputPre.textContent=
`${Number(NT).toFixed(0)} NT    = # of timesteps
${Number(nx).toFixed(0) } nx    = number of steps in x direction
${Number(ny).toFixed(0) } ny    = number of steps in y direction
${Number(nz).toFixed(0) } nz    = number of steps in z direction
${Number(ngx).toFixed(0) } ngx    = number of mpi blocs in x direction
${Number(ngy).toFixed(0) } ngy    = number of mpi blocs in y direction
${Number(ngz).toFixed(0) } ngz    = number of mpi blocs in z direction
${Number(DH).toFixed(0) } DH          = spatial step (meters)
${Number(DT).toFixed(2) } DT          = time step (seconds)
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
${Number(vis3d).toFixed(0) } vis3d          = 0 no Vis3D, 1 = Vis3D
${Number(fo).toFixed(0) } fo             = atenuation factor
${Number(nstr).toFixed(0) } nstr           = mkmodel, 0 = homogeneous
${Number(nholes).toFixed(0) } nholes         = # of seismograms on the surface
`;

}


idNTNumber.oninput = (number) => {
	setNT( number.target.value )
}
idNTInput.oninput = (slider) => {
	setNT( slider.target.value )
};
setNT=( value )=>{
	NT=value
	idNTNumber.value=NT
	idNTInput.value=NT
	drawDomain()
}
setNT(1000);


idNxNumber.oninput = (number) => {
	setNx( number.target.value )
}
idNxInput.oninput = (slider) => {
	setNx( slider.target.value )
};
setNx=( value )=>{
	nx=value
	idNxNumber.value=nx
	idNxInput.value=nx
	drawDomain()
}
setNx(100);

idNyNumber.oninput = (number) => {
	setNy( number.target.value )
}
idNyInput.oninput = (slider) => {
	setNy( slider.target.value )
};
setNy=( value )=>{
	ny=value
	idNyNumber.value=ny
	idNyInput.value=ny
	drawDomain()
}
setNy(100);

idNzNumber.oninput = (number) => {
	setNz( number.target.value )
}
idNzInput.oninput = (slider) => {
	setNz( slider.target.value )
};
setNz=( value )=>{
	nz=value
	idNzNumber.value=nz
	idNzInput.value=nz
	drawDomain()
}
setNz(100);

idDHNumber.oninput = (number) => {
	setDH( number.target.value )
}
idDHInput.oninput = (slider) => {
	setDH( slider.target.value )
};
setDH=( value )=>{
	DH=value
	idDHNumber.value=DH
	idDHInput.value=DH
	drawDomain()
}
setDH(1000);


idRotNumber.oninput = (number) => {
	setRot( number.target.value )
}
idRotInput.oninput = (slider) => {
	setRot( slider.target.value )
};
setRot=( value )=>{
	Rot=value
	if('Mech' in variables){
		STR=variables['Mech']['STRK']-value;
		idStrike.textContent=`STRIKE (fsp): ${Number(variables["Mech"]["STRK"]).toFixed(1)}`
		idStr.textContent=`STR (input): ${Number(STR).toFixed(1)}`
	}
	idRotNumber.value=Rot
	idRotInput.value=Rot
	drawDomain();
	drawSlip();
}
setRot(0);



