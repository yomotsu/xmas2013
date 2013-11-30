;( function () {
  const MODEL_URL = '/assets/model/tree/tree.js';

  xmas.Forrest = function ( position ) {
    this.mesh;
    this.body;
    this._position = position;
    THREE.EventDispatcher.prototype.apply( this );
  }

  xmas.Forrest.prototype.load = function () {
    var that = this;
    var d = new $.Deferred();
    var loader = new THREE.JSONLoader();
    var tmpGeometry = new THREE.Geometry();

    loader.load( MODEL_URL, function( geo, mat ) {
      var tree = new THREE.Mesh(
        geo,
        new THREE.MeshFaceMaterial( mat )
      );

      var i;
      for ( i = 0; i < that._position.length; i ++ ) {
        ( function () {
          var clone = tree.clone();
          clone.position.set(
            that._position[ i ].x,
            0,
            that._position[ i ].z
          );
          THREE.GeometryUtils.merge( tmpGeometry, clone );


          var body = new CANNON.RigidBody(
              0,
              new CANNON.Cylinder( 5, 5, 50, 8 )
          );

          var axisX = new CANNON.Vec3( 1, 0, 0 );
          body.position.set(
            that._position[ i ].x,
            0,
            that._position[ i ].z
          );
          body.quaternion.setFromAxisAngle( axisX, Math.PI / -2 );
          that.body = body;
          xmas.world.add( that.body );

        } )();
      }
      this.mesh = new THREE.Mesh(
        tmpGeometry,
        new THREE.MeshFaceMaterial( mat )
      );
      xmas.scene.add( this.mesh );

      that.dispatchEvent( { type: 'loaded' } );
      d.resolve();
      delete this._position;
    } );
    return d.promise();
  }
} )();