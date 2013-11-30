;( function () {
  const MODEL_URL = '/assets/model/santa/santa.js';
  const MASS = 80;
  const RADIUS = 2;

  xmas.Santa = function () {
    this.mesh = new THREE.Object3D();
    this.body;
    THREE.EventDispatcher.prototype.apply( this );

    xmas.scene.add( this.mesh );

    this.body = new CANNON.RigidBody( MASS, new CANNON.Sphere( RADIUS ) );
    this.body.position.set( 0, 10, 0 );
    xmas.world.add( this.body );

      // var sphereGeometry = new THREE.SphereGeometry( RADIUS, 8, 8);
      // var sphereMaterial = new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } );
      // var sphereMesh = new THREE.Mesh( sphereGeometry, sphereMaterial );
      // xmas.scene.add( sphereMesh );
    xmas.updateHandler.add( this.update.bind( this ) );
  }

  xmas.Santa.prototype.load = function () {
    var that = this;
    var d = new $.Deferred();
    var loader = new THREE.JSONLoader();
    loader.load( MODEL_URL, function( geo, mat ) {
      var mesh = new THREE.SkinnedMesh(
        geo,
        new THREE.MeshFaceMaterial( mat )
      );
      mesh.rotation.y = Math.PI;

      mesh.material.materials.forEach( function ( mat ) {
        mat.skinning = true;
      } );
      mesh.traverse( function ( child ) {
        child.castShadow = true;
        child.receiveShadow = false;
      } );

      THREE.AnimationHandler.add( mesh.geometry.animations[ 0 ] );
      THREE.AnimationHandler.add( mesh.geometry.animations[ 1 ] );

      that.motion = {
        idle : new THREE.Animation(
          mesh,
          mesh.geometry.animations[ 0 ].name,
          THREE.AnimationHandler.CATMULLROM
        ),
        run : new THREE.Animation(
          mesh,
          mesh.geometry.animations[ 1 ].name,
          THREE.AnimationHandler.CATMULLROM
        )
      }
      // mesh.name = 'santa';
      mesh.position.set( 0, -RADIUS, 0 );
      that.mesh.add( mesh );

      that.dispatchEvent( { type: 'loaded' } );
      d.resolve();
    } );
    return d.promise();
  }

  xmas.Santa.prototype.update = function () {
    // this.body.quaternion.copy( this.mesh.quaternion );
    this.body.position.copy( this.mesh.position );
  }

  xmas.Santa.prototype.idle = function () {
    this.motion.run.stop();
    this.motion.idle.play();
  }

  xmas.Santa.prototype.run = function () {
    this.motion.idle.stop();
    this.motion.run.play();
  }

} )();