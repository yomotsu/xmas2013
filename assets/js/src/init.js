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