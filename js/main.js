var mainScene, camera, renderer, controls;
var container;
var loader;
var w = window.innerWidth;
var h = window.innerHeight;
var mouseX, mouseY;
var mapMouseX, mapMouseY;
var FBObject1, FBObject2, mirror;
var globalUniforms;
var time = 0;

initScene();
function initScene(){
	container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(50, w / h, 1, 100000);
    camera.position.set(0,0, 750);//test
    camera.rotation.y = Math.PI/4
    cameraRTT = new THREE.OrthographicCamera( w / - 2, w / 2, h / 2, h / - 2, -10000, 10000 );
	cameraRTT.position.z = 100;
	controls = new THREE.OrbitControls(camera);
	// controls.maxPolarAngle = Math.PI/2; 
	renderer = new THREE.WebGLRenderer();
    renderer.setSize(w,h);
    renderer.setClearColor(0xffffff, 1);

    container.appendChild(renderer.domElement);


    mainScene = new THREE.Scene();

    globalUniforms = {
		time: { type: "f", value: 0.0 } ,
		resolution: {type: "v2", value: new THREE.Vector2(w,h)},
		step_w: {type: "f", value: 1/w},
		step_h: {type: "f", value: 1/h},
		mouseX: {type: "f", value: 1.0},
		mouseY: {type: "f", value: 1.0},
		tv_resolution: {type: "f", value: 640.0},
		tv_resolution_y: {type: "f", value: 1600.0}
	}
	var path = "textures/cube/vince/";
	var format = '.png';
	var urls = [
			path + 'px' + format, path + 'nx' + format,
			path + 'py' + format, path + 'ny' + format,
			path + 'pz' + format, path + 'nz' + format
	];
	var reflectionCube = THREE.ImageUtils.loadTextureCube( urls );
	reflectionCube.format = THREE.RGBFormat;

	var refractionCube = new THREE.CubeTexture( reflectionCube.image, THREE.CubeRefractionMapping );
	refractionCube.format = THREE.RGBFormat;
	var mirrorMaterial = new THREE.MeshLambertMaterial( { side: THREE.DoubleSide, color: 0x000000, ambient: 0xaaaaaa, envMap: reflectionCube, combine: THREE.AddOperation } )

	// control = new THREE.TransformControls( camera, renderer.domElement );
	// control.attach( FBObject2.mesh );
	// mainScene.add( control );

	display_inner = new FBObject({
			w: w,
	    	h: h, 
	    	x: 0,
	    	y: 0,
	    	z: 0,
	    	// texture: "textures/phone-bg.jpg",
	    	useVideo:true,
	    	vertexShader: "vs",
	    	fragmentShader1: "fs",
	    	fragmentShader2: "fs",
	    	mainScene: mainScene
		});
	display_inner.uniforms = globalUniforms;
	display_inner.init(67.45,120.46);
	display_innerTex = new THREE.ImageUtils.loadTexture("textures/phone-bg.jpg");
	display_innerTex.flipY = true;
	display_innerTex.flipX = true;
	display_innerMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xaaaaaa} )

	screenGeometry = new THREE.PlaneBufferGeometry(67.45, 120.46);
	// screenGeometry = new THREE.PlaneBufferGeometry(w/1.,120.);
	// display_inner.renderTargets[0].width = 67.45;
	// display_inner.renderTargets[0].height = 120.46;
	// display_inner.renderTargets[1].setViewport(67.45,120.46);
	screenMaterial = new THREE.MeshBasicMaterial({color:0xffffff, side: THREE.DoubleSide, map:display_inner.renderTargets[1]});
	screenMesh = new THREE.Mesh(screenGeometry, screenMaterial);
	// screenMesh.rotation.set(3*Math.PI/2,0,0);
	screenMesh.rotation.set(0,0,0);
	screenMesh.position.set(0,0.5,3.55);
	mainScene.add(screenMesh);



	// display_inner.loadModel("js/models/display-inner.js", 0, 0, 300, 10.0, 0, 0, 0,display_innerMaterial);

	display_outer = new FBObject({
			w: w,
	    	h: h, 
	    	x: 0,
	    	y: 0,
	    	z: 0,
	    	vertexShader: "vs",
	    	fragmentShader1: "fs",
	    	fragmentShader2: "fs",
	    	mainScene: mainScene
		});
	display_outer.uniforms = globalUniforms;
	display_outer.init(w,h);
	display_outer.loadModel("js/models/display-outer.js", 0, 0, 0, 10.0, Math.PI/2, 0, 0, mirrorMaterial);

	plastic = new FBObject({w: w, h: h, mainScene: mainScene});
	plasticMaterial = new THREE.MeshBasicMaterial({color: 0x7e7e7e});
	plastic.loadModel("js/models/plastic.js", 0, 0, 0, 10.0, Math.PI/2, 0, 0, plasticMaterial);

	orange = new FBObject({w: w, h: h, mainScene: mainScene});
	orangeMaterial = new THREE.MeshBasicMaterial({color: 0xcc5e33});
	orange.loadModel("js/models/orange-part.js", 0, 0, 0, 10.0, Math.PI/2, 0, 0, orangeMaterial);

	lensRing = new FBObject({w: w, h: h, mainScene: mainScene});
	lensRingMaterial = new THREE.MeshBasicMaterial({color: 0x474747});
	lensRing.loadModel("js/models/lens-ring.js", 0, 0, 0, 10.0, Math.PI/2, 0, 0, mirrorMaterial);

	lensGlass = new FBObject({w: w, h: h, mainScene: mainScene});
	lensGlassMaterial = new THREE.MeshBasicMaterial({color: 0x595959, transparent: true, opacity: 0.75});
	lensGlass.loadModel("js/models/lens-glass.js", 0, 0, 0, 10.0, Math.PI/2, 0, 0, lensGlassMaterial);

	lensInner = new FBObject({w: w, h: h, mainScene: mainScene});
	// lensInnerMaterial = new THREE.MeshBasicMaterial({color: 0x001384});
	lensInnerMaterial = new THREE.MeshLambertMaterial( { side: THREE.DoubleSide, color: 0x001384, ambient: 0xaaaaaa, envMap: reflectionCube, combine: THREE.AddOperation } )
	lensInner.loadModel("js/models/lens-inner.js", 0, 0, 0, 10.0, Math.PI/2, 0, 0, lensInnerMaterial);

	lensHolder = new FBObject({w: w, h: h, mainScene: mainScene});
	lensHolderMaterial = new THREE.MeshBasicMaterial({color: 0x474747});
	lensHolder.loadModel("js/models/lens-holder.js", 0, 0, 0, 10.0, Math.PI/2, 0, 0, lensHolderMaterial);

	flash = new FBObject({w: w, h: h, mainScene: mainScene});
	flashMaterial = new THREE.MeshLambertMaterial( { side: THREE.DoubleSide, color: 0xfeffe0, ambient: 0xaaaaaa, envMap: reflectionCube, combine: THREE.AddOperation } )
	// flashMaterial = new THREE.MeshLambertMaterial({color: 0xfeffe0, shininess: 30});
	flash.loadModel("js/models/flash.js", 0, 0, 0, 10.0, Math.PI/2, 0, 0, flashMaterial);

	decal = new FBObject({w: w, h: h, mainScene: mainScene});
	decalMaterial = new THREE.MeshLambertMaterial({color: 0xcc5e33, shininess: 30});
	decal.loadModel("js/models/decal.js", 0, 0, 0, 10.0, Math.PI/2, 0, 0, mirrorMaterial);

	body = new FBObject({
			w: w,
	    	h: h, 
	    	x: 0,
	    	y: 0,
	    	z: 0,
	    	texture: "textures/display_inner.png",
	    	vertexShader: "vs",
	    	fragmentShader1: "fs",
	    	fragmentShader2: "fs",
	    	mainScene: mainScene
		});
	body.uniforms = globalUniforms;
	body.init(w,h);
	var bodyMaterial = new THREE.MeshPhongMaterial({
	color: 0x595959,
    ambient: 0xff0000,
    specular: 0xffffff,
    shininess: 5});

	// display_innerTex = new THREE.ImageUtils.loadTexture("textures/keyboard-&-magic-mouse-by-apple-keys.jpg");
	// display_innerMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xaaaaaa, map: keyboardTex } )

	body.loadModel("js/models/body.js", 0, 0, 0, 10.0, Math.PI/2, 0, 0, bodyMaterial);


    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    window.addEventListener('resize', onWindowResize, false);

	var geometry = new THREE.PlaneBufferGeometry(100000,100000);
	var material = new THREE.MeshBasicMaterial({color:0xffffff, side:THREE.DoubleSide});


	var mesh = new THREE.Mesh(geometry, material);
	mesh.receiveShadow = true;
	mesh.position.set(0,-7,0);
	mesh.rotation.set(Math.PI/2,0,0);
	// mainScene.add(mesh);

    addLights();
    // onWindowResize();
	animate();
}
function addLights(){
	var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.75 );
	mainScene.add(hemiLight)
	light = new THREE.DirectionalLight(0xffffff, 0.22);
	light.position.x = 0;
	light.position.y = 1000;
	mainScene.add(light);

// light.castShadow = true;

// light.shadowCameraVisible = true
// light.shadowMapWidth = 10000;
// light.shadowMapHeight = 10000;
// light.shadowCascadeWidth = 10000;
// light.shadowCascadeHeight = 10000;

}
function map(value,max,minrange,maxrange) {
    return ((max-value)/(max))*(maxrange-minrange)+minrange;
}

function onDocumentMouseMove(event){
	mouseX = (event.clientX );
    mouseY = (event.clientY );
    mapMouseX = map(mouseX, window.innerWidth, -1.0,1.0);
    mapMouseY = map(mouseY, window.innerHeight, -1.0,1.0);
	globalUniforms.mouseX.value = mapMouseX;
	globalUniforms.mouseY.value = mapMouseY;
}
function onWindowResize( event ) {
	globalUniforms.resolution.value.x = window.innerWidth;
	globalUniforms.resolution.value.y = window.innerHeight;
	w = window.innerWidth;
	h = window.innerHeight;
	renderer.setSize( window.innerWidth, window.innerHeight );
}
function onDocumentMouseDown(event){
		display_inner.getFrame(cameraRTT);

}
var inc = 0;
var addFrames = true;
var translate = false;
function render(){

	// FBObject1.material1.uniforms.texture.value.needsUpdate = true;
	display_inner.material1.uniforms.texture.value.needsUpdate = true;

	// display_inner.modelMesh.castShadow = display_inner.modelMesh.receiveShadow = true;
	// display_outer.modelMesh.castShadow = display_outer.modelMesh.receiveShadow = true;
	// body.modelMesh.castShadow = body.modelMesh.receiveShadow = true;
	display_inner.passTex();

	controls.update();

	time +=0.05;
	globalUniforms.time.value = time;

    inc++
	if(inc >= 10){
		addFrames = false;
	}
	if(addFrames){
		display_inner.getFrame(cameraRTT);
		translate = true;
	}
	if(translate = true){
		// FBObject1.scale(1.01);
		// FBObject2.scale(0.999);

	}
	display_inner.getFrame(cameraRTT);
	display_inner.render(cameraRTT);
	renderer.render(mainScene, camera);
	display_inner.cycle(cameraRTT);

}
function animate(){
	window.requestAnimationFrame(animate);
	render();

}