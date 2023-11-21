import * as THREE from 'three';
import { StereoEffect } from './StereoEffect';

const CANVAS_WIDTH = 900;
const videoElement = document.getElementById('source') as HTMLVideoElement;
videoElement.oncanplay = () => {
    init();
    animate();
};

let container, camera, scene, renderer, effect;

// const spheres = [];

let mouseX = 0, mouseY = 0;

let windowHalfX = 900 / 2;
let windowHalfY = 450 / 2;

// document.addEventListener( 'mousemove', onDocumentMouseMove );



function init() {
    container = document.createElement( 'div' );
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(60, 900 / 450, 1, 100000);
    camera.position.z = 3200;

    scene = new THREE.Scene();
    // Создаем текстуру на основе видеоэлемента
    const texture = new THREE.VideoTexture(videoElement);
    // указываем, что текстуру надо обновлять
    texture.needsUpdate = true;
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.x = -1;
    scene.background = texture;

    // scene.background = new THREE.CubeTextureLoader()
    //     .setPath( 'textures/cube/Park3Med/' )
    //     .load( [ 'px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg' ] );
    // const geometry = new THREE.SphereGeometry( 100, 32, 16 );
    // const textureCube = new THREE.CubeTextureLoader()
    //     .setPath( 'textures/cube/Park3Med/' )
    //     .load( [ 'px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg' ] );
    // textureCube.mapping = THREE.CubeRefractionMapping;
    // const material = new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: textureCube, refractionRatio: 0.95 } );
    // for ( let i = 0; i < 500; i ++ ) {
    //     const mesh = new THREE.Mesh( geometry, material );
    //     mesh.position.x = Math.random() * 10000 - 5000;
    //     mesh.position.y = Math.random() * 10000 - 5000;
    //     mesh.position.z = Math.random() * 10000 - 5000;
    //     mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 3 + 1;
    //     scene.add( mesh );
    //     spheres.push( mesh );
    // }

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    container.appendChild( renderer.domElement );

    effect = new StereoEffect( renderer );
    effect.setSize( 900, 450 );
}

function animate() {
    effect.render(scene, camera);
    camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), 0.001);
    requestAnimationFrame( animate );
}