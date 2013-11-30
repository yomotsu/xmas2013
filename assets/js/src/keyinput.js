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