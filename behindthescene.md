スカイボックスをつくる

CubeGeometry の内側にスカイボックス用の 6 枚のディフューズテクスチャを貼り付ける

	var urls = [
	  'right.jpg',
	  'left.jpg',
	  'top.jpg',
	  'bottom.jpg',
	  'front.jpg',
	  'back.jpg'
	];
	var materials = [];
	for ( var i = 0; i < 6; i ++ ) {
	    materials.push(
	      new THREE.MeshBasicMaterial( {
	        map: THREE.ImageUtils.loadTexture( urls[ i ] ),
	        side: THREE.BackSide
	      } )
	    );
	}
	var skyBox = new THREE.Mesh( 
	  new THREE.CubeGeometry( 500, 500, 500 ),
	  new THREE.MeshFaceMaterial( materials )
	);
	scene.add( skyBox );

