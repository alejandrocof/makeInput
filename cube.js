/*============= Creating a canvas ======================*/
var canvas = document.getElementById('my_Canvas');
gl = canvas.getContext('webgl',{premultipliedAlpha: false,});
gl.enable(gl.BLEND);
gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

/*========== Defining and storing the geometry ==========*/
var vertexSlip=[];
var colorSlip=[];
var indexSlip=[];
var vertexSlip_buffer={};
var colorSlip_buffer={};
var indexSlip_buffer={};


var vertexGround=[-1,-1, 1,  1,-1, 1,  1, 1, 1, -1, 1, 1];
var colorGround=[0.2,0.2,0.2,0.4, 0.2,0.2,0.2,0.4, 0.2,0.2,0.2,0.4, 0.2,0.2,0.2,0.4];
var indexGround=[0,1,3, 2,3,1];

var vertexCube=[-1,-1, 1,  1,-1, 1,  1, 1, 1, -1, 1, 1,
                -1,-1,-1,  1,-1,-1,  1, 1,-1, -1, 1,-1];
var colorCube=[1.0,0.2,0.2,1.0, 0.2,0.2,0.2,1.0, 0.2,0.2,0.2,1.0, 0.2,0.2,0.2,1.0,
               0.2,0.2,0.2,1.0, 0.2,0.2,0.2,1.0, 0.2,0.2,0.2,1.0, 0.2,0.2,0.2,1.0];
var indexCube=[0,1, 1,2, 2,3, 3,0,
               4,5, 5,6, 6,7, 7,4,
               0,4, 1,5, 2,6, 3,7 ];
               

// a->-b
// |   |
// d-<-c
function interpola3D(alpha,beta, a_pos, b_pos, c_pos, d_pos){
	let ab_x = a_pos.X + alpha*(b_pos.X - a_pos.X);
	let ab_y = a_pos.Y + alpha*(b_pos.Y - a_pos.Y);
	let ab_z = a_pos.Z + alpha*(b_pos.Z - a_pos.Z);
	let dc_x = d_pos.X + alpha*(c_pos.X - d_pos.X);
	let dc_y = d_pos.Y + alpha*(c_pos.Y - d_pos.Y);
	let dc_z = d_pos.Z + alpha*(c_pos.Z - d_pos.Z);
//	return { x:ab_x + beta*(dc_x-ab_x)}
	return { x:ab_x + beta*(dc_x-ab_x), y:ab_y + beta*(dc_y-ab_y), z:ab_z + beta*(dc_z-ab_z) };
}


function draw3DSlip(){

	if(Nx>0 && Nz>0){
	vertexSlip = new Array((Nx*Nz+1)*4*3);
	colorSlip   = new Array((Nx*Nz+1)*4*4);
	indexSlip   = new Array((Nx*Nz+1)*6);
	
	//let minXYZ=Math.min(min.X,min.Y,min.Y);
	let maxXYZ=Math.max(max.X-min.X,max.Y-min.Y,max.Y-min.Z);
	let k=1;
	//for(let j=Nz-1; j>=0; j-- ){
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
			const {slip, pos, Z}=arraySlip[j][i];
			//SLIP RAKE TRUP RISE SF_MOMENT
			
			const variable='SLIP'
			//interpola3D( alpha1, beta1, arraySlip[J1-1][I1-1], arraySlip[J1-1][I1],   arraySlip[J1][I1],     arraySlip[J1][I1-1]   );
			const p1 = interpola3D( alpha1, beta1, arraySlip[J1-1][I1-1], arraySlip[J1-1][I1],   arraySlip[J1][I1],     arraySlip[J1][I1-1]   );
			const p2 = interpola3D( alpha2, beta2, arraySlip[J2-1][I2],   arraySlip[J2-1][I2+1], arraySlip[J2][I2+1],   arraySlip[J2][I2]     );
			const p3 = interpola3D( alpha3, beta3, arraySlip[J3][I3],     arraySlip[J3][I3+1],   arraySlip[J3+1][I3+1], arraySlip[J3+1][I3]   );
			const p4 = interpola3D( alpha4, beta4, arraySlip[J4][I4-1],   arraySlip[J4][I4],     arraySlip[J4+1][I4],   arraySlip[J4+1][I4-1] );
			const {r,g,b}=getColor(arraySlip[j][i][variable]/max[variable],colorMapSlip);
			let R=r/255;
			let G=g/255;
			let B=b/255;
			
			
			//let weight=1.0;
			//let strokeColor='black';
			//if(i==0 && j==0)weight=2.0;
			//if(j==0)strokeColor='red';
			
			vertexSlip[12*k   ]=2*(p1.x-min.X)/maxXYZ-1;
			vertexSlip[12*k+1 ]=2*(p1.y-min.Y)/maxXYZ-1;
			vertexSlip[12*k+2 ]=-2*(p1.z-min.Z)/maxXYZ+1;
			vertexSlip[12*k+3 ]=2*(p2.x-min.X)/maxXYZ-1;
			vertexSlip[12*k+4 ]=2*(p2.y-min.Y)/maxXYZ-1;
			vertexSlip[12*k+5 ]=-2*(p2.z-min.Z)/maxXYZ+1;
			vertexSlip[12*k+6 ]=2*(p3.x-min.X)/maxXYZ-1;
			vertexSlip[12*k+7 ]=2*(p3.y-min.Y)/maxXYZ-1;
			vertexSlip[12*k+ 8]=-2*(p3.z-min.Z)/maxXYZ+1;
			vertexSlip[12*k+9 ]=2*(p4.x-min.X)/maxXYZ-1;
			vertexSlip[12*k+10]=2*(p4.y-min.Y)/maxXYZ-1;
			vertexSlip[12*k+11]=-2*(p4.z-min.Z)/maxXYZ+1;
			
			
			colorSlip[16*k   ]=R; colorSlip[16*k+1 ]=G; colorSlip[16*k+2 ]=B; colorSlip[16*k+3 ]=0.8;
			colorSlip[16*k+4 ]=R; colorSlip[16*k+5 ]=G; colorSlip[16*k+6 ]=B; colorSlip[16*k+7 ]=0.8;
			colorSlip[16*k+8 ]=R; colorSlip[16*k+9 ]=G; colorSlip[16*k+10]=B; colorSlip[16*k+11]=0.8;
			colorSlip[16*k+12]=R; colorSlip[16*k+13]=G; colorSlip[16*k+14]=B; colorSlip[16*k+15]=0.8;
			
			//indexSlip[6*k  ]=4*k  ; indexSlip[6*k+1]=4*k+1; indexSlip[6*k+2]=4*k+3;
			//indexSlip[6*k+3]=4*k+2; indexSlip[6*k+4]=4*k+3; indexSlip[6*k+5]=4*k+1;
			indexSlip= indexSlip.concat( indexGround.map((x) => x + 4*k) );
			k++;
			//var latlngs = [p1,p2,p3,p4];
			//		slipGroup[ i+j*variables['Invs']['Nx'] ] = L.polygon(latlngs, { fillColor: `rgb(${r}, ${g}, ${b})`,color: strokeColor,weight: weight, fillOpacity: .75, pane: 'slip' }).bindPopup(`${variable}: ${arraySlip[j][i][variable]}<br>Lat: ${pos.lat}<br>lng: ${pos.lng}<br>Z: ${Z}`).addTo(map);
				//map.fitBounds(polygon.getBounds());
			}
		}
		//vertexSlip= vertexSlip.concat(vertexCube.map((x) => 1.1*x));
		let c=Math.cos(-Rot*Math.PI/180.0);
		let s=Math.sin(-Rot*Math.PI/180.0);
		let maxn=Math.max(nx,ny,nz);
		for(let i=0;i<vertexGround.length/3;i++){
			let x=1.5*vertexGround[3*i];
			let y=1.5*vertexGround[3*i+1];
			let z=1.1*vertexGround[3*i+2];
			/*vertexSlip= vertexSlip.concat(
				[vertexCube[3*i]*nx/maxXYZ,
				vertexCube[3*i+1]*ny/maxXYZ,
				vertexCube[3*i+2]*nz/maxXYZ]);*/
			vertexSlip= vertexSlip.concat(
				[x*c-y*s,
				y*c+x*s,
				z]);
		}
		var vertexCubeRotate=[];
		
		for(let i=0;i<vertexCube.length/3;i++){
			let x=1.5*vertexCube[3*i];
			let y=1.5*vertexCube[3*i+1];
			let z=1.1*vertexCube[3*i+2];
			vertexCubeRotate[3*i] = x*c-y*s;
			vertexCubeRotate[3*i+1] = y*c+x*s;
			vertexCubeRotate[3*i+2] = z;
		}
		colorSlip= colorSlip.concat(colorGround);
		indexSlip= indexSlip.concat( indexGround.map((i) => i + 4*k) );
		
		
		
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexSlip_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexSlip), gl.DYNAMIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	
		
		gl.bindBuffer(gl.ARRAY_BUFFER, colorSlip_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorSlip), gl.DYNAMIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexSlip_buffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexSlip), gl.DYNAMIC_DRAW);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
		
		
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexCube_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexCubeRotate), gl.DYNAMIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	
		
		gl.bindBuffer(gl.ARRAY_BUFFER, colorCube_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorCube), gl.DYNAMIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexCube_buffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexCube), gl.DYNAMIC_DRAW);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
		/*
		indexSlip= indexSlip.concat( indexVertex.map((i) => i + 4*(k+1)) );
		indexSlip= indexSlip.concat( indexVertex.map((i) => i + 4*(k+2)) );
		indexSlip= indexSlip.concat( indexVertex.map((i) => i + 4*(k+3)) );
		indexSlip= indexSlip.concat( indexVertex.map((i) => i + 4*(k+4)) );
		indexSlip= indexSlip.concat( indexVertex.map((i) => i + 4*(k+5)) );
		*/
		//console.log(indexSlip)
		

		
		
		
		/*
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexCube_buffer);
		var _Cubeposition = gl.getAttribLocation(shaderprogram, "position");
		gl.vertexAttribPointer(_Cubeposition, 3, gl.FLOAT, false,0,0);
		gl.enableVertexAttribArray(_Cubeposition);
	
		gl.bindBuffer(gl.ARRAY_BUFFER, colorCube_buffer);
		var _Cubecolor = gl.getAttribLocation(shaderprogram, "color");
		gl.vertexAttribPointer(_Cubecolor, 4, gl.FLOAT, false,0,0) ;
		gl.enableVertexAttribArray(_Cubecolor);
		
		gl.useProgram(shaderprogram);
*/
/*		
		let k=0;
		for(let j=0;j<Nz-1;j++){
			for(let i=0;i<Nx-1;i++){
				vertexSlip[k]=arraySlip[j][i].X;
				vertexSlip[k]=arraySlip[j][i].Y;
				vertexSlip[k]=arraySlip[j][i].Z;
				k++;
			}
		}
		*/
		animate(0);
		}
}
	/*
	var vertices = [
			-1,-1,-1, 1,-1,-1, 1, 1,-1, -1, 1,-1,
			-1,-1, 1, 1,-1, 1, 1, 1, 1, -1, 1, 1,
			-1,-1,-1, -1, 1,-1, -1, 1, 1, -1,-1, 1,
			1,-1,-1, 1, 1,-1, 1, 1, 1, 1,-1, 1,
			-1,-1,-1, -1,-1, 1, 1,-1, 1, 1,-1,-1,
			-1, 1,-1, -1, 1, 1, 1, 1, 1, 1, 1,-1, 
			];
	
	var colors = [
			1,0,1, 1,0,1, 1,0,1, 1,0,1,
			0,1,1, 0,1,1, 0,1,1, 0,1,1,
			0,0,1, 0,0,1, 0,0,1, 0,0,1,
			1,0,0, 1,0,0, 1,0,0, 1,0,0,
			1,1,0, 1,1,0, 1,1,0, 1,1,0,
			0,1,0, 0,1,0, 0,1,0, 0,1,0 
			];
	
	var indices = [
			0,1,2, 0,2,3, 4,5,6, 4,6,7,
			8,9,10, 8,10,11, 12,13,14, 12,14,15,
			16,17,18, 16,18,19, 20,21,22, 20,22,23 
			];
	
	// Create and store data into vertex buffer
	var vertex_buffer = gl.createBuffer ();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
	
	// Create and store data into color buffer
	var color_buffer = gl.createBuffer ();
	gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	
	// Create and store data into index buffer
	var index_buffer = gl.createBuffer ();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
	*/
	/*=================== SHADERS =================== */
	
	var vertCode = 'attribute vec3 position;'+
			'uniform mat4 Pmatrix;'+
			'uniform mat4 Vmatrix;'+
			'uniform mat4 Mmatrix;'+
			'attribute vec4 color;'+//the color of the point
			'varying vec4 vColor;'+
			'void main(void) { '+//pre-built function
			'gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);'+
			'vColor = color;'+
			'}';
	
	var fragCode = 'precision mediump float;'+
			'varying vec4 vColor;'+
			'void main(void) {'+
			'gl_FragColor = vColor;'+
			'gl_FragColor.rgb = gl_FragColor.rgb*vColor.a;'+
			'}';
	
	var vertShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertShader, vertCode);
	gl.compileShader(vertShader);
	
	var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragShader, fragCode);
	gl.compileShader(fragShader);
	
	var shaderprogram = gl.createProgram();
	gl.attachShader(shaderprogram, vertShader);
	gl.attachShader(shaderprogram, fragShader);
	gl.linkProgram(shaderprogram);
	
	/*======== Associating attributes to vertex shader =====*/
	var _Pmatrix = gl.getUniformLocation(shaderprogram, "Pmatrix");
	var _Vmatrix = gl.getUniformLocation(shaderprogram, "Vmatrix");
	var _Mmatrix = gl.getUniformLocation(shaderprogram, "Mmatrix");
	
	/*
	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
	var _position = gl.getAttribLocation(shaderprogram, "position");
	gl.vertexAttribPointer(_position, 3, gl.FLOAT, false,0,0);
	gl.enableVertexAttribArray(_position);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
	var _color = gl.getAttribLocation(shaderprogram, "color");
	gl.vertexAttribPointer(_color, 3, gl.FLOAT, false,0,0) ;
	gl.enableVertexAttribArray(_color);
	*/
	gl.useProgram(shaderprogram);
//	gl.useProgram(shaderprogram);
		
	var _position = gl.getAttribLocation(shaderprogram, "position");
	var _color = gl.getAttribLocation(shaderprogram, "color")
	
	vertexSlip_buffer = gl.createBuffer ();
	colorSlip_buffer = gl.createBuffer ();
	indexSlip_buffer = gl.createBuffer ();
	vertexCube_buffer = gl.createBuffer ();
	colorCube_buffer = gl.createBuffer ();
	indexCube_buffer = gl.createBuffer ();;
	
	/*==================== MATRIX ====================== */
	
	function get_projection(angle, a, zMin, zMax) {
		var ang = Math.tan((angle*.5)*Math.PI/180);//angle*.5
		return [
				0.5/ang, 0 , 0, 0,
				0, 0.5*a/ang, 0, 0,
				0, 0, -(zMax+zMin)/(zMax-zMin), -1,
				0, 0, (-2*zMax*zMin)/(zMax-zMin), 0 
				];
	}
	
	var proj_matrix = get_projection(40, canvas.width/canvas.height, 1, 100);
	var mo_matrix = [ 1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1 ];
	var view_matrix = [ 1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1 ];
	
	view_matrix[14] = view_matrix[14]-6;
	
	/*================= Mouse events ======================*/
	
	var AMORTIZATION = 0.95;
	var drag = false;
	var old_x, old_y;
	var dX = 0, dY = 0;
	
	var mouseDown = function(e) {
			drag = true;
			old_x = e.pageX, old_y = e.pageY;
			e.preventDefault();
			return false;
};
	
	var mouseUp = function(e){
			drag = false;
			animate(0);
};
	
	var mouseMove = function(e) {
			if (!drag) return false;
			dX = (e.pageX-old_x)*2*Math.PI/canvas.width,
			dY = (e.pageY-old_y)*2*Math.PI/canvas.height;
			THETA+= dX;
			PHI+=dY;
			old_x = e.pageX, old_y = e.pageY;
			e.preventDefault();
			animate(0);
};
	
	var mouseWheel = function(e) {
			//console.log(event.deltaY);
			e.stopPropagation();
			if(e.deltaY>0)SCALE/=1.1;
			else SCALE*=1.1;
			animate(0);
}
			
			
	canvas.addEventListener("mousedown", mouseDown, false);
	canvas.addEventListener("mouseup", mouseUp, false);
	canvas.addEventListener("mouseout", mouseUp, false);
	canvas.addEventListener("mousemove", mouseMove, false);
	canvas.addEventListener("wheel", mouseWheel, false);
	
	/*=========================rotation================*/
	
	function rotateX(m, angle) {
		var c = Math.cos(angle);
		var s = Math.sin(angle);
		var mv1 = m[1], mv5 = m[5], mv9 = m[9];
		
		m[1] = m[1]*c-m[2]*s;
		m[5] = m[5]*c-m[6]*s;
		m[9] = m[9]*c-m[10]*s;
		
		m[2] = m[2]*c+mv1*s;
		m[6] = m[6]*c+mv5*s;
		m[10] = m[10]*c+mv9*s;
	}
	
	function rotateY(m, angle) {
		var c = Math.cos(angle);
		var s = Math.sin(angle);
		var mv0 = m[0], mv4 = m[4], mv8 = m[8];
		
		m[0] = c*m[0]+s*m[2];
		m[4] = c*m[4]+s*m[6];
		m[8] = c*m[8]+s*m[10];
		
		m[2] = c*m[2]-s*mv0;
		m[6] = c*m[6]-s*mv4;
		m[10] = c*m[10]-s*mv8;
	}
	
	function zoom(m, s) {
		m[0] = s*m[0];
		m[1] = s*m[1];
		m[2] = s*m[2];
		
		m[4] = s*m[4];
		m[5] = s*m[5];
		m[6] = s*m[6];
		
		m[8] = s*m[8];
		m[9] = s*m[9];
		m[10] = s*m[10];
		//console.log("zoom")
	}
	
	/*=================== Drawing =================== */
	
	var THETA = 0,
			PHI = 0,
			SCALE = 1;
	var time_old = 0;
	
	var animate = function(time) {
		
		var maxn=100.0;
		var sizeOfFloat = 4;
		var vertices = [
			-nx/maxn, -ny/maxn,-nz/maxn,  nx/maxn, -ny/maxn,-nz/maxn,  nx/maxn, ny/maxn,-nz/maxn, -nx/maxn, ny/maxn,-nz/maxn,
			-nx/maxn, -ny/maxn, nz/maxn,  nx/maxn, -ny/maxn, nz/maxn,  nx/maxn, ny/maxn, nz/maxn, -nx/maxn, ny/maxn, nz/maxn,
			-nx/maxn, -ny/maxn,-nz/maxn, -nx/maxn,  ny/maxn,-nz/maxn, -nx/maxn, ny/maxn, nz/maxn, -nx/maxn,-ny/maxn, nz/maxn,
			nx/maxn, -ny/maxn,-nz/maxn,  nx/maxn,  ny/maxn,-nz/maxn,  nx/maxn, ny/maxn, nz/maxn,  nx/maxn,-ny/maxn, nz/maxn,
			-nx/maxn, -ny/maxn,-nz/maxn, -nx/maxn, -ny/maxn, nz/maxn,  nx/maxn,-ny/maxn, nz/maxn,  nx/maxn,-ny/maxn,-nz/maxn,
			-nx/maxn,  ny/maxn,-nz/maxn, -nx/maxn,  ny/maxn, nz/maxn,  nx/maxn, ny/maxn, nz/maxn,  nx/maxn, ny/maxn,-nz/maxn, 
		];
		//var vertex_buffer = gl.createBuffer ();
		//gl.bindBuffer(gl.ARRAY_BUFFER, vertexSlip_buffer);
		//gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexSlip), gl.DYNAMIC_DRAW);
		//bindAttributes();
		//gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
		//gl.bufferSubData(gl.ARRAY_BUFFER, 12*6*sizeOfFloat, vertices);
		
		var dt = time-time_old;
		
		if (!drag) {
			dX *= AMORTIZATION, dY*=AMORTIZATION;
			THETA+=dX, PHI+=dY;
		}
		
		//set model matrix to I4
		
		mo_matrix[0] = 1, mo_matrix[1] = 0, mo_matrix[2] = 0,
		mo_matrix[3] = 0,
		
		mo_matrix[4] = 0, mo_matrix[5] = 1, mo_matrix[6] = 0,
		mo_matrix[7] = 0,
		
		mo_matrix[8] = 0, mo_matrix[9] = 0, mo_matrix[10] = 1,
		mo_matrix[11] = 0,
		
		mo_matrix[12] = 0, mo_matrix[13] = 0, mo_matrix[14] = 0,
		mo_matrix[15] = 1;
		
		rotateX(mo_matrix, -Math.PI/2);
		rotateY(mo_matrix, THETA);
		rotateX(mo_matrix, PHI);
		zoom(mo_matrix, SCALE);
		
		time_old = time; 
		gl.enable(gl.DEPTH_TEST);
		
		// gl.depthFunc(gl.LEQUAL);
		
		gl.clearColor(0.5, 0.5, 0.5, 1.0);
		//gl.clearColor(1, 1, 1, 1.0);
		gl.clearDepth(1.0);
		gl.viewport(0.0, 0.0, canvas.width, canvas.height);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		gl.uniformMatrix4fv(_Pmatrix, false, proj_matrix);
		gl.uniformMatrix4fv(_Vmatrix, false, view_matrix);
		gl.uniformMatrix4fv(_Mmatrix, false, mo_matrix);
		
		
		
		gl.enableVertexAttribArray(_position);
		gl.enableVertexAttribArray(_color);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexSlip_buffer);
		gl.vertexAttribPointer(_position, 3, gl.FLOAT, false,0,0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, colorSlip_buffer);
		gl.vertexAttribPointer(_color, 4, gl.FLOAT, false,0,0) ;
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexSlip_buffer);
		gl.drawElements(gl.TRIANGLES, indexSlip.length, gl.UNSIGNED_SHORT, 0);
		
		
		
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexCube_buffer);
		gl.vertexAttribPointer(_position, 3, gl.FLOAT, false,0,0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, colorCube_buffer);
		gl.vertexAttribPointer(_color, 4, gl.FLOAT, false,0,0) ;
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexCube_buffer);
		gl.drawElements(gl.LINES, indexCube.length, gl.UNSIGNED_SHORT, 0);
		
		//gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexCube_buffer);
		//gl.drawElements(gl.LINES, indexCube.length, gl.UNSIGNED_SHORT, 0);
		
		//console.log(nx)
		
		//window.requestAnimationFrame(animate);
	}

