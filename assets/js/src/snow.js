;( function () {
  const TEXTURE_URL = '/assets/model/snow/snowflake.png';

  xmas.Snow = function () {
    this.mesh;
    THREE.EventDispatcher.prototype.apply( this );
  }

  xmas.Snow.prototype.load = function () {
    var that = this;
    var d = new $.Deferred();
    var state = 0;
    var checkState = function () {
      state ++;
      if ( state >= 2 ) {
        that.dispatchEvent( { type: 'loaded' } );
        d.resolve();
        xmas.updateHandler.add( that.update.bind( that ) );
      }
    }

    var texture = THREE.ImageUtils.loadTexture(
      TEXTURE_URL,
      undefined,
      checkState,
      checkState
    );
    var geometry = new THREE.Geometry();
    var material = new THREE.ParticleSystemMaterial( {
      color: 0xFFFFFF,
      size: 1,
      map: texture,
      blending: THREE.AdditiveBlending,
      transparent: true
    } );

    for ( i = 0; i < 1000; i ++ ) {
      var vertex = new THREE.Vector3();
      vertex.x = Math.random() * 200 - 100;
      vertex.y = Math.random() * 100;
      vertex.z = Math.random() * 200 - 100;
      geometry.vertices.push( vertex );
    }

    this.mesh = new THREE.ParticleSystem( geometry, material );
    xmas.scene.add( this.mesh );
    checkState();
    return d.promise();
  }
  xmas.Snow.prototype.update = function () {
    var particleLength = this.mesh.geometry.vertices.length;
    var particle;
    while ( particleLength -- ) {
      particle = this.mesh.geometry.vertices[ particleLength ];
      particle.y = particle.y < 0 ? 100 : particle.y - 0.1;
      particle.x = particle.x < -100 ? 100 : particle.x - Math.random() * 0.05;
    }
    this.mesh.geometry.verticesNeedUpdate = true;
  }
} )();