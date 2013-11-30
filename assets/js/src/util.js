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