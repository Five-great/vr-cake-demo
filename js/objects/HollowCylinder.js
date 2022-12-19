/**
 * 
 * @author Five / https://github.com/Five-great
 * 
 */

import { Geometry,BufferGeometry,Float32BufferAttribute,Vector3,Vector2 } from '../build/three.module.js';

 var HollowCylinder = function( radiusTop, radiusBottom,radiusStep, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength ,phiSegments) {

	Geometry.call( this );

	this.type = 'HollowCylinder';

	this.parameters = {
		radiusTop: radiusTop,
		radiusBottom: radiusBottom,
		radiusStep:radiusStep,
		height: height,
		radialSegments: radialSegments,
		heightSegments: heightSegments,
		openEnded: openEnded,
		thetaStart: thetaStart,
		phiSegments:phiSegments,
		thetaLength: thetaLength
	};

	this.fromBufferGeometry( new HollowBufferCylinder( radiusTop, radiusBottom,radiusStep, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength,phiSegments ) );
	this.mergeVertices();

}

HollowCylinder.prototype = Object.create( Geometry.prototype );
HollowCylinder.prototype.constructor = HollowCylinder;

// CylinderBufferGeometry

 var HollowBufferCylinder=function( radiusTop, radiusBottom,radiusStep, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength,phiSegments ) {

	BufferGeometry.call( this );

	this.type = 'HollowBufferCylinder';

	this.parameters = {
		radiusTop: radiusTop,
		radiusBottom: radiusBottom,
		radiusStep:radiusStep,
		height: height,
		radialSegments: radialSegments,
		heightSegments: heightSegments,
		openEnded: openEnded,
		thetaStart: thetaStart,
		phiSegments:phiSegments,
		thetaLength: thetaLength
	};

	var scope = this;

	radiusTop = radiusTop !== undefined ? radiusTop : 10;
	radiusBottom = radiusBottom !== undefined ? radiusBottom : 10;
	height = height || 10;
	radiusStep = radiusStep || 2
	radialSegments = Math.floor( radialSegments ) || 8;
	heightSegments = Math.floor( heightSegments ) || 1;
	phiSegments = Math.floor(phiSegments) || 8;

	openEnded = openEnded !== undefined ? openEnded : false;
	thetaStart = thetaStart !== undefined ? thetaStart : 0.0;
	thetaLength = thetaLength !== undefined ? thetaLength : Math.PI*2;
	
	// buffers
	var indices = [];
	var vertices = [];
	var normals = [];
	var uvs = [];
    var arr =[];
	// helper variables
     
	var index = 0;
	var halfHeight = height / 2;
	var groupStart = 0;
	
	// generate geometry
	generateTorso(true);//Inside
	generateTorso(false);//Outside

	// if ( openEnded === false ) {

		if ( radiusTop > 0 ) generateCap( true );
		if ( radiusBottom > 0 ) generateCap( false );

	// }

	generateTorsoSide(true);
	generateTorsoSide(false);
	// build geometry



	this.setIndex( indices );
	this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
	this.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
	this.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );


	function generateTorso(inside) {

		var x, y;
		var normal = new Vector3();
		var vertex = new Vector3();
		var indexArray = [];
		var groupCount = 0;

		// this will be used to calculate the normal
		var slope = ( radiusBottom - radiusTop ) / height;

		// generate vertices, normals and uvs

		for ( y = 0; y <= heightSegments; y ++ ) {

			var indexRow = [];

			var v = y / heightSegments;

			// calculate the radius of the current row

			var radius = inside ? v * ( radiusBottom - radiusTop ) + radiusTop-radiusStep : v * ( radiusBottom - radiusTop ) + radiusTop;

			for ( x = 0; x <= radialSegments; x ++ ) {

				var u = x / radialSegments;

				var theta = u * thetaLength + thetaStart;

				var sinTheta = Math.sin( theta );
				var cosTheta = Math.cos( theta );

				// vertex

				vertex.x = radius * sinTheta;
				vertex.y = - v * height + halfHeight;
				vertex.z = radius * cosTheta;
				vertices.push( vertex.x, vertex.y, vertex.z );
				
				// normal

				normal.set( sinTheta, slope, cosTheta ).normalize();
				normals.push( normal.x, normal.y, (inside?1:-1)*normal.z );

				// uv
			// 	console.log(vertex);
			// 	console.log(sinTheta+" "+cosTheta);
            //    console.log(u+" "+v);
			   
				uvs.push( u,  1-v );

				// save index of vertex in respective row

				indexRow.push( index ++ );

			}

			// now save vertices of the row in our index array

			indexArray.push( indexRow );

		}
		// generate indices

		for ( x = 0; x < radialSegments; x ++ ) {

			for ( y = 0; y < heightSegments; y ++ ) {

				// we use the index array to access the correct indices

				var a = indexArray[ y ][ x ];
				var b = indexArray[ y + 1 ][ x ];
				var c = indexArray[ y + 1 ][ x + 1 ];
				var d = indexArray[ y ][ x + 1 ];

				// faces

				indices.push( a, b, d );
				indices.push( b, c, d );

				// update group counter

				groupCount += 6;

			}

		}
	//	console.log(vertices[indexArray[heightSegments-1][radialSegments-1]].x+" " + vertices[indexArray[heightSegments-1][radialSegments-1]].y+" "+vertices[indexArray[heightSegments-1][radialSegments-1]].z);
		
	  //arr.push(vertices[indexArray[x-1][y-1]]);
	   //console.log(arr);
	   
		// add a group to the geometry. this will ensure multi material support

		scope.addGroup( groupStart, groupCount, inside === true ? 0 : 1 );

		// calculate new start value for groups

		groupStart += groupCount;

	}



	function generateTorsoSide(sideLeft) {

		
		 var groupCount = 0;
		// generate vertices, normals and uvs

		// generate indices
  
		var theta = sideLeft == true ? thetaLength + thetaStart : thetaStart;
		vertices.push(radiusTop*Math.sin(theta), halfHeight,radiusTop*Math.cos(theta));
		normals.push(Math.sin(theta),(sideLeft?1:-1)*-1, Math.cos(theta));
        uvs.push( 0, 0);
		vertices.push((radiusTop-radiusStep)*Math.sin(theta), halfHeight,(radiusTop-radiusStep)*Math.cos(theta));
		normals.push(Math.sin(theta), (sideLeft?1:-1)*-1, Math.cos(theta));
		uvs.push( 0, 1);
		vertices.push(radiusBottom*Math.sin(theta), -halfHeight,radiusBottom*Math.cos(theta));
		normals.push(Math.sin(theta),(sideLeft?1:-1)*1,Math.cos(theta));
		uvs.push( 1, 0);
		vertices.push((radiusBottom-radiusStep)*Math.sin(theta), -halfHeight,(radiusBottom-radiusStep)*Math.cos(theta));
		normals.push(Math.sin(theta), (sideLeft?1:-1)*1,Math.cos(theta));
		uvs.push( 1, 1);
		

			var a = index ++;
			var b = index ++;
			var c = index ++;
			var d = index ++;

			// faces

			// indices.push( a, b, c);
			// indices.push( c, d, b);
			if(sideLeft){
				indices.push( d, c, b);
				indices.push( b, a, c);
			}else{
				indices.push( a, b, c);
			    indices.push( c, d, b);
			}

			groupCount += 6;

				// faces

		// add a group to the geometry. this will ensure multi material support

		scope.addGroup( groupStart, groupCount, sideLeft === true ? 4 : 5 );

		// calculate new start value for groups

		groupStart += groupCount;

	}



	function generateCap( top ) {

		var x, centerIndexStart, centerIndexEnd;

		var uv = new Vector2();
		var vertex = new Vector3();

		var groupCount = 0;

		var outerRadius = ( top === true ) ? radiusTop : radiusBottom;
		var sign = ( top === true ) ? 1 : - 1;

		var segment;	
			
		var radius =outerRadius-radiusStep;
	
		var j, i;
		// save the index of the first center vertex
		centerIndexStart = index;

		for ( j = 0; j <= phiSegments; j ++ ) {

			for ( i = 0; i <= radialSegments; i ++ ) {
	
				// values are generate from the inside of the ring to the outside
	
				segment = thetaStart + i / radialSegments * thetaLength;
	
				// vertex
	
				vertex.x = radius * Math.sin( segment );
				vertex.y = halfHeight * sign;
				vertex.z = radius * Math.cos( segment );
	
				vertices.push( vertex.x, vertex.y, vertex.z );
	
				// normal
	
				normals.push( 0, sign, 0 );
	
				// uv
	
				uv.x = ( vertex.x / outerRadius+1)/2;
				uv.z = ( vertex.z / outerRadius+1)/2;
				uvs.push( uv.x, uv.z);

				index++;
	
			}
	         radius += radiusStep/phiSegments;
			// increase the radius for next row of vertices

	
		}
	


       // indices

		for ( j = 0; j < phiSegments; j ++ ) {

			var radialSegmentLevel = j * ( radialSegments + 1 );

			for ( i = 0; i < radialSegments; i ++ ) {

				segment = i + radialSegmentLevel;

				var a = centerIndexStart +segment;
				var b = centerIndexStart +segment + radialSegments + 1;
				var c = centerIndexStart +segment + radialSegments + 2;
				var d = centerIndexStart +segment + 1;
				
			
				    // face top
					indices.push( a, b, d );
					indices.push( b, c, d );

				groupCount += 6;
			}

		}

		// add a group to the geometry. this will ensure multi material support

		scope.addGroup( groupStart, groupCount, top === true ? 2 : 3 );

		// calculate new start value for groups

		groupStart += groupCount;

	}

}

HollowBufferCylinder.prototype = Object.create( BufferGeometry.prototype );
HollowBufferCylinder.prototype.constructor = HollowBufferCylinder;


export { HollowCylinder, HollowBufferCylinder };





	

	

	


	
