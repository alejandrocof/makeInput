let hyp;
let slipGroup=[];

colorMapSlip=[
	{r:255,g:255,b:255},
	{r:255,g:255,b:255},
	{r:254,g:255,b:255},
	{r:198,g:255,b:255},
	{r:144,g:255,b:255},
	{r:76,g:255,b:255},
	{r:9,g:255,b:253},
	{r:3,g:255,b:170},
	{r:0,g:255,b:88},
	{r:43,g:255,b:43},
	{r:88,g:255,b:2},
	{r:170,g:253,b:0},
	{r:250,g:252,b:0},
	{r:255,g:226,b:0},
	{r:255,g:201,b:0},
	{r:255,g:161,b:0},
	{r:255,g:121,b:0},
	{r:255,g:65,b:0},
	{r:255,g:8,b:0}
];

function getColor(lambda,colorMap){
    if(lambda>1.0)lambda=1.0;
    if(lambda<0.0)lambda=0.0;
    size=colorMap.length;
    let f=lambda*(size-1);
    let indice=Math.floor(f);
    let indice2=indice+1;
    let delta=f-indice;
    //console.log(colorMap[indice],f,indice,indice+1,colorMap.length,lambda);
    if( indice2 == size ){
    	indice2=indice;
    }
    const {r:r0, g:g0, b:b0} = colorMap[indice];
    const {r:r1, g:g1, b:b1} = colorMap[indice2];
    r = r0 + delta*(r1-r0);
    g = g0 + delta*(g1-g0);
    b = b0 + delta*(b1-b0);
    return {r:r, g:g, b:b };
}

/*
function interpola(alpha,beta, {lat:a_lat, lon:a_lon}, {lat:b_lat, lon:b_lon}, {lat:c_lat, lon:c_lon}, {lat:d_lat, lon:d_lon}){
	ab_lat = a_lat + alpha*(b_lat - a_lat);
	ab_lon = a_lon + alpha*(b_lon - a_lon);
	dc_lat = d_lat + alpha*(c_lat - d_lat);
	dc_lon = d_lon + alpha*(c_lon - d_lon);
	//return {lat: ab_lat + beta*(dc_lat-ab_lat), lon: ab_lon + beta*(dc_lon-ab_lon) };
	return new L.LatLng( ab_lat + beta*(dc_lat-ab_lat), ab_lon + beta*(dc_lon-ab_lon) );
}*/

function interpola(alpha,beta, a_pos, b_pos, c_pos, d_pos){
	ab_lat = a_pos.lat + alpha*(b_pos.lat - a_pos.lat);
	ab_lng = a_pos.lng + alpha*(b_pos.lng - a_pos.lng);
	dc_lat = d_pos.lat + alpha*(c_pos.lat - d_pos.lat);
	dc_lng = d_pos.lng + alpha*(c_pos.lng - d_pos.lng);
	return new L.LatLng( ab_lat + beta*(dc_lat-ab_lat), ab_lng + beta*(dc_lng-ab_lng) );
}

function drawHyp(){
	if( hyp ){
		map.removeLayer(hyp);
	}
	hyp = L.marker([variables["Loc"]["LAT"], variables["Loc"]["LON"]], {icon: marcadorAmarilloIcon}).bindPopup(variables['Event']).addTo(map);
	map.setView([variables["Loc"]["LAT"], variables["Loc"]["LON"]], 7);
}

function drawSlip(){

	if( !(Object.keys(variables).length === 0) ){
	//console.log(variables);
	if( slipGroup.length != 0 ){
		slipGroup.forEach( (sg)=>map.removeLayer(sg));
		slipGroup=null;
	}
	Nz=variables['Invs']['Nz']
	Nx=variables['Invs']['Nx']
	slipGroup=new Array( Nz*Nx );
	
	/*
	for (let j = 0; j < Nz; j++ )
		for (let i = 0; i < Nx; i++ ) {
			const {lat,lon,slip}=arraySlip[j][i];
			const {r,g,b}=getColor(slip/maxSlip,colorMapSlip);
			slipGroup[ i+j*variables['Invs']['Nx'] ] = L.circle([lat, lon], {radius: 200, color: `rgb(${r}, ${g}, ${b})`}).bindPopup(`${slip}m`).addTo(map);
		}
	*/
	
	for(let j=0; j<Nz; j++ ){
				J1=J2=J3=J4=j;
				beta1=beta2=beta3=beta4=0.5;
				if(j==0){
					J1=J2=j+1;
					beta1=beta2=-0.5;
				}
				if(j==Nz-1){
					J3=J4=j-1;
					beta3=beta4=1.5;
				}
				for(let i=0; i<Nx; i++ ){
					I1=I2=I3=I4=i;
					alpha1=alpha2=alpha3=alpha4=0.5;
					if(i==0){
						I1=I4=i+1;
						alpha1=alpha4=-0.5;
					}
					if(i==Nx-1){
						I2=I3=i-1;
						alpha2=alpha3=1.5;
					}
					const {slip, lat, lon, Z}=arraySlip[j][i]
					const p1 = interpola( alpha1, beta1, arraySlip[J1-1][I1-1].pos, arraySlip[J1-1][I1].pos,   arraySlip[J1][I1].pos,     arraySlip[J1][I1-1].pos);
					const p2 = interpola( alpha2, beta2, arraySlip[J2-1][I2].pos,   arraySlip[J2-1][I2+1].pos, arraySlip[J2][I2+1].pos,   arraySlip[J2][I2].pos);
					const p3 = interpola( alpha3, beta3, arraySlip[J3][I3].pos,     arraySlip[J3][I3+1].pos,   arraySlip[J3+1][I3+1].pos, arraySlip[J3+1][I3].pos);
					const p4 = interpola( alpha4, beta4, arraySlip[J4][I4-1].pos,   arraySlip[J4][I4].pos,     arraySlip[J4+1][I4].pos,   arraySlip[J4+1][I4-1].pos);
					const {r,g,b}=getColor(slip/maxSlip,colorMapSlip);
					let weight=0.1;
					if(i==0 && j==0)weight=0.8;
					var latlngs = [p1,p2,p3,p4];
					slipGroup[ i+j*variables['Invs']['Nx'] ] = L.polygon(latlngs, { fillColor: `rgb(${r}, ${g}, ${b})`,color: 'black',weight: weight, fillOpacity: .75, pane: 'slip' }).bindPopup(`Slip: ${slip}m<br>Lat: ${lat}<br>lng: ${lon}<br>Z: ${Z}`).addTo(map);
					//map.fitBounds(polygon.getBounds());
				}
			}
			alphaDrawing=[]
			alphaDrawing.push(arraySlip[0][0].pos)
			
			betaDrawing=[]
			betaDrawing.push(arraySlip[0][0].pos)
			let N=100
			for(let i=0; i<=N;i++){
				alpha=Math.PI*(360-variables["Mech"]["STRK"]+90+STR*i/N)/180.0;
				alphaDrawing.push( new L.LatLng(arraySlip[0][0].pos.lat+0.12*Math.sin(alpha),arraySlip[0][0].pos.lng+0.12*Math.cos(alpha)) )
				beta=Math.PI*(90-variables["Mech"]["STRK"]*i/N)/180.0;
				betaDrawing.push( new L.LatLng(arraySlip[0][0].pos.lat+0.1*Math.sin(beta),arraySlip[0][0].pos.lng+0.1*Math.cos(beta)) )
			}
			
			slipGroup.push(
				L.polygon(alphaDrawing, {color: 'rgb(255,128,128)', pane: 'slip' })
				.bindPopup(`Strike (input): ${Number(STR).toFixed(1)}`).addTo(map));
			alpha=Math.PI*(360-variables["Mech"]["STRK"]+90+STR)/180.0;
			slipGroup.push(
				L.polyline([arraySlip[0][0].pos,new L.LatLng(arraySlip[0][0].pos.lat+0.15*Math.sin(alpha),arraySlip[0][0].pos.lng+0.15*Math.cos(alpha))],
				{color: 'red', pane: 'slip' })
				.addTo(map));
			
			slipGroup.push(
				L.polygon(betaDrawing, {color: 'rgb(128,128,128)', pane: 'slip' })
				.bindPopup(`Strike (fsp): ${Number(variables["Mech"]["STRK"]).toFixed(1)}`).addTo(map));
			beta=Math.PI*(90-variables["Mech"]["STRK"])/180.0;
			slipGroup.push(
				L.polyline([arraySlip[0][0].pos,new L.LatLng(arraySlip[0][0].pos.lat+0.15,arraySlip[0][0].pos.lng)],
				{color: 'black', pane: 'slip' })
				.addTo(map));
			
	}
}
