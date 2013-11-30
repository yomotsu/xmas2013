var xmas = {
  VERSION: 0.1
};
;( function () {

  xmas.webglExperimental = ( function () {
    var experimental;
    var canvas = document.createElement( 'canvas' );
    var gl = canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' );
    if ( !gl ) {
      experimental = false;
    } else {
      experimental = true;
    }
    return experimental;
  } )();

  xmas.updateHandler = {
    handler: []
  };

  xmas.updateHandler.add = function ( handler ) {
    if ( typeof handler ) {
      xmas.updateHandler.handler.push( handler );
    }
  }

  xmas.updateHandler.excuse = function () {
    var i, l = xmas.updateHandler.handler.length;
    for ( i = 0; i < l; i ++ ) {
      xmas.updateHandler.handler[ i ]();
    }
  }
  
  xmas.play = function () {
    xmas.isPaused = false;
    xmas.updadeLoop();
  }

  xmas.updadeLoop = function () {
    if ( xmas.isPaused ) {
      return;
    }
    requestAnimationFrame( xmas.updadeLoop );
    xmas.world.step( 1.0 / 60.0 );
    var delta = xmas.clock.getDelta();
    var theta = xmas.clock.getElapsedTime();

    // xmas.camera.position.x = 20 * Math.sin( theta * 10 * Math.PI / 360 );
    // xmas.camera.position.z = 20 * Math.cos( theta * 10 * Math.PI / 360 );
    xmas.camera.lookAt( xmas.cameraTarget );

    THREE.AnimationHandler.update( delta );

    xmas.updateHandler.excuse();

    xmas.renderer.render( xmas.scene, xmas.camera );
    // xmas.renderer.clear();
    // xmas.composer.render();
  }

  xmas.onresize = function () {
    xmas.width = window.innerWidth,
    xmas.height = window.innerHeight;
    xmas.renderer.setSize( xmas.width, xmas.height );
    xmas.camera.aspect = xmas.width / xmas.height;
    xmas.camera.updateProjectionMatrix();
  }

} )();
;( function () {
  xmas.init = function () {
    xmas.width = window.innerWidth,
    xmas.height = window.innerHeight;
    xmas.container = document.body;
    xmas.clock = new THREE.Clock();
    xmas.cameraTarget = new THREE.Vector3( 0, 5, 0 );

    xmas.scene = new THREE.Scene();
    xmas.scene.fog = new THREE.FogExp2( 0xeeeeee, 0.012 );

    xmas.camera = new THREE.PerspectiveCamera( 60, xmas.width / xmas.height, 1, 300 );
    xmas.camera.position.set( 0, 10, -40 );
    xmas.camera.lookAt( xmas.cameraTarget );

    var ambientLight = new THREE.AmbientLight( 0xcccccc );
    xmas.scene.add( ambientLight );

    var spotLight = new THREE.SpotLight( 0xffffff, 0.2 );
    spotLight.position.set( -10, 100, 10 );
    spotLight.target.position.set( 0, 0, 0 );
    spotLight.castShadow = true;
    spotLight.shadowMapWidth = 512;
    spotLight.shadowMapHeight = 512;
    spotLight.shadowCameraFov = 60;
    spotLight.shadowCameraNear = 1;
    spotLight.shadowCameraFar = 300;
    spotLight.shadowBias = -0.0003;
    spotLight.shadowDarkness = 0.5;
    // spotLight.shadowCameraVisible = true;
    xmas.scene.add( spotLight );

    xmas.renderer = new THREE.WebGLRenderer();
    xmas.renderer.setSize( xmas.width, xmas.height );
    // xmas.renderer.setClearColor( 0xeeeeee );
    xmas.renderer.shadowMapEnabled = true;
    xmas.container.appendChild( xmas.renderer.domElement );

    // I just wonted to attach some effect thought PostProcess
    // but i couldnt find nice one...

    // var renderModel = new THREE.RenderPass( xmas.scene, xmas.camera );
    // var effectBloom = new THREE.BloomPass( 1, 25, 1.3 );
    // var effectCopy = new THREE.ShaderPass( THREE.CopyShader );
    // effectCopy.renderToScreen = true;

    // xmas.composer = new THREE.EffectComposer( xmas.renderer );
    // xmas.composer.addPass( renderModel );
    // xmas.composer.addPass( effectBloom );
    // xmas.composer.addPass( effectCopy );

    // cannon---
    xmas.world = new CANNON.World();
    xmas.world.gravity.set( 0, -9.82, 0 );
    xmas.world.broadphase = new CANNON.NaiveBroadphase();

    // xmas.contactMaterial = {
    //   ground: new CANNON.Material(),
    //   player: new CANNON.Material(),
    //   object: new CANNON.Material()
    // }

    // var contact1 = new CANNON.ContactMaterial(
    //     xmas.contactMaterial.ground,
    //     xmas.contactMaterial.player,
    //     1.0,
    //     0.0
    // );
    // xmas.world.addContactMaterial( contact1 );
    
    $( window ).on( 'resize', xmas.onresize );
  }
} )();
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
;( function () {
  const PLAYER_MOVEMENT_SPEED = 20;

  xmas.KeyInput = function ( playerObject ) {
    this.player = playerObject;

    this.disableMovementKey = false;
    // this.disableJumpKey = true;
    // this.disableMouse = true;
    // this.disableMouseScroll = true;

    this.keyInput = {
      up : false,
      down : false,
      left : false,
      right : false
    };

    window.addEventListener( 'keydown', xmas.KeyInput.onkeydown.bind( this ), false );
    window.addEventListener( 'keyup',   xmas.KeyInput.onkeyup.bind( this ),   false );
    xmas.updateHandler.add( this.update.bind( this ) );
  }

  xmas.KeyInput.prototype.update = function () {
    var up    = this.keyInput.up;
    var left  = this.keyInput.left;
    var right = this.keyInput.right;
    var down  = this.keyInput.down;
    var frontAngle = 0;
    if ( !up && !left &&  down && !right) { frontAngle +=   0 * Math.PI / 180 }
    if ( !up && !left &&  down &&  right) { frontAngle +=  45 * Math.PI / 180 }
    if ( !up && !left && !down &&  right) { frontAngle +=  90 * Math.PI / 180 }
    if (  up && !left && !down &&  right) { frontAngle += 135 * Math.PI / 180 }
    if (  up && !left && !down && !right) { frontAngle += 180 * Math.PI / 180 }
    if (  up &&  left && !down && !right) { frontAngle += 225 * Math.PI / 180 }
    if ( !up &&  left && !down && !right) { frontAngle += 270 * Math.PI / 180 }
    if ( !up &&  left &&  down && !right) { frontAngle += 315 * Math.PI / 180 }

    if ( up || left || down || right ) {
      this.player.mesh.rotation.y = frontAngle;
      this.player.body.velocity.x = -Math.sin( frontAngle ) * PLAYER_MOVEMENT_SPEED;
      this.player.body.velocity.z = -Math.cos( frontAngle ) * PLAYER_MOVEMENT_SPEED;
      this.player.run();
    } else {
      this.player.body.velocity.x = 0;
      this.player.body.velocity.z = 0;
      this.player.idle();
    }
  };

  xmas.KeyInput.onkeydown = function ( e ) {
    if ( !this.disableMovementKey ) {
      //W || up arrow
      if ( e.keyCode === 87 || e.keyCode === 38 ) {
        this.keyInput.up = true;
        this.keyInput.down = false;
      };
      //S || down arrow
      if ( e.keyCode === 83 || e.keyCode === 40 ) {
        this.keyInput.down = true;
        this.keyInput.up = false;
      };
      //A || left arrow
      if ( e.keyCode === 65 || e.keyCode === 37 ) {
        this.keyInput.left = true;
        this.keyInput.right = false;
      };
      //D || right arrow
      if ( e.keyCode === 68 || e.keyCode === 39 ) {
        this.keyInput.right = true;
        this.keyInput.left = false;
      };
    };
    // if( !this.disableJumpKey ) {
    //   if ( /32/.test( e.keyCode ) ) {
    //     TODO JUMP
    //   };
    // };
  }

  xmas.KeyInput.onkeyup = function ( e ) {
    if( e.keyCode === 87 || e.keyCode === 38 ){
      this.keyInput.up = false;
    } else if ( e.keyCode === 83 || e.keyCode === 40 ){
      this.keyInput.down = false;
    } else if ( e.keyCode === 65 || e.keyCode === 37 ){
      this.keyInput.left = false;
    } else if ( e.keyCode === 68 || e.keyCode === 39 ){
      this.keyInput.right = false;
    }
  }

} )();