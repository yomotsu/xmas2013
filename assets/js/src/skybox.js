;( function () {
  const SIZE = 200;
  const TEXTURE_URL = [
    '/assets/model/skybox/right.jpg',
    '/assets/model/skybox/left.jpg',
    '/assets/model/skybox/top.jpg',
    '/assets/model/skybox/bottom.jpg',
    '/assets/model/skybox/front.jpg',
    '/assets/model/skybox/back.jpg'
  ];

  xmas.Skybox = function () {
    this.mesh;
    THREE.EventDispatcher.prototype.apply( this );
  }

  xmas.Skybox.prototype.load = function () {
    var mesh;
    var d = new $.Deferred();
    var state = 0;
    var checkState = function () {
      state ++;
      if ( state >= 7 ) {
        that.dispatchEvent( { type: 'loaded' } );
        d.resolve();
      }
    }
    var materials = [];
    var texture;
    for ( var i = 0; i < 6; i ++ ) {
      texture = THREE.ImageUtils.loadTexture(
        TEXTURE_URL[ i ],
        checkState,
        checkState
      );
      materials.push( new THREE.MeshPhongMaterial( {
        map: texture,
        side: THREE.BackSide
      } ) );
    }
    mesh = new THREE.Mesh( 
      new THREE.CubeGeometry( SIZE, SIZE, SIZE ),
      new THREE.MeshFaceMaterial( materials )
    );
    
    this.mesh = mesh;
    xmas.scene.add( this.mesh );
    d.promise();
  }
} )();