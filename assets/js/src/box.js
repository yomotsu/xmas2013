;( function () {
  const MODEL_URL = '/assets/model/box/box.js';
  const WIDTH = 2.5;
  const HEIGHT = 2.5;
  const MASS = 3;

  xmas.Box = function () {
    this.mesh;
    this.body;

    var boxShape = new CANNON.Box( new CANNON.Vec3( WIDTH / 2, HEIGHT / 2, WIDTH / 2 ) );
    this.body  = new CANNON.RigidBody( MASS, boxShape );
    xmas.world.add( this.body );

    THREE.EventDispatcher.prototype.apply( this );

    xmas.updateHandler.add( this.update.bind( this ) );
  }

  xmas.Box.prototype.setPosition = function ( x, y, z ) {
    this.body.position.set( x, y, z );
    this.update();
  }

  xmas.Box.prototype.load = function () {
    var that = this;
    var d = new $.Deferred();
    var loader = new THREE.JSONLoader();
    var tmpGeometry = new THREE.Geometry();

    loader.load( MODEL_URL, function( geo, mat ) {
      that.mesh = new THREE.Mesh(
        geo,
        new THREE.MeshFaceMaterial( mat )
      );
      xmas.scene.add( that.mesh );

      that.dispatchEvent( { type: 'loaded' } );
      d.resolve();
    } );

    return d.promise();
  }

  xmas.Box.prototype.update = function () {
    this.body.quaternion.copy( this.mesh.quaternion );
    this.body.position.copy( this.mesh.position );
  }

  xmas.Box.prototype.clone = function () {
    var clone = new xmas.Box();
    clone.mesh = this.mesh.clone();
    xmas.scene.add( clone.mesh );
    return clone;
  }

  xmas.Box.WIDTH = WIDTH;
  xmas.Box.HEIGHT = HEIGHT;

} )();