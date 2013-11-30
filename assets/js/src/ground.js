;( function () {
  const TEXTURE_DEFUSE_URL = '/assets/model/ground/defuse.jpg';
  // const TEXTURE_BUMP_URL   = '/assets/model/ground/bump.jpg';

  xmas.Ground = function () {
    this.mesh;
    this.body = new CANNON.RigidBody( 0, new CANNON.Plane() );
    this.body.quaternion.setFromAxisAngle( new CANNON.Vec3( 1, 0, 0 ), Math.PI / -2 );
    xmas.world.add( this.body );

    THREE.EventDispatcher.prototype.apply( this );
  }

  xmas.Ground.prototype.load = function () {
    var that = this;
    var d = new $.Deferred();
    var i;
    var simplexNoise = new SimplexNoise;
    var vertex;
    var geometry = new THREE.PlaneGeometry( 150, 150, 64, 64 );
    var defuse, bump;
    var state = 0;
    var checkState = function () {
      state ++;
      if ( state >= 2 ) {
        that.dispatchEvent( { type: 'loaded' } );
        d.resolve();
      }
    }

    for ( i = 0; i < geometry.vertices.length; i++ ) {
      vertex = geometry.vertices[i];
      vertex.z = simplexNoise.noise( vertex.x / 10, vertex.y / 10 ) / 3;
    }
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    defuse = THREE.ImageUtils.loadTexture(
      TEXTURE_DEFUSE_URL,
      undefined,
      checkState,
      checkState
    );
    defuse.wrapS = defuse.wrapT = THREE.RepeatWrapping;
    defuse.repeat.set( 16, 16 );

    // bump map cause an issue on IE11
    // bump = THREE.ImageUtils.loadTexture(
    //   TEXTURE_BUMP_URL,
    //   undefined,
    //   checkState,
    //   checkState
    // );
    // bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
    // bump.repeat.set( 16, 16 );

    this.mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshPhongMaterial( {
        specular: 0x333333,
        shininess: 25, 
        map: defuse,
        // bumpMap: bump,
        bumpScale: 1,
        // wireframe: true
      } )
    );

    this.mesh.rotation.x = Math.PI / -2;
    this.mesh.castShadow = false;
    this.mesh.receiveShadow = true;

    xmas.scene.add( this.mesh );
    checkState();
    return d.promise();
  }
} )();