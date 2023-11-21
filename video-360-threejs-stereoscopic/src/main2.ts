import * as THREE from 'three';
import { StereoEffect } from "./StereoEffect";

const CANVAS_WIDTH = 900;
const videoElement = document.getElementById('source') as HTMLVideoElement;
videoElement.oncanplay = main;

function main() {
    videoElement.oncanplay = null;
    /**  */
    const CANVAS_HEIGHT = CANVAS_WIDTH * videoElement.videoHeight / videoElement.videoWidth;

    /** Создаем рендерер */
    const renderer = new THREE.WebGLRenderer();
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);
    const target = document.getElementById('result');
    target.appendChild(renderer.domElement);

    // Создаем камеру
    const camera = new THREE.PerspectiveCamera(45, CANVAS_WIDTH / CANVAS_HEIGHT, 1, 300);
    camera.position.set(0, 0, 0);
    camera.lookAt(100, 0, 0);

    // Создаем текстуру на основе видеоэлемента
    const texture = new THREE.VideoTexture(videoElement);
    // указываем, что текстуру надо обновлять
    texture.needsUpdate = true;
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.x = -1;

    // Создаем геометрию
    const geometry = new THREE.SphereGeometry(200, 100, 100);
    // Создаем материал
    const material = new THREE.MeshBasicMaterial({map: texture, side: THREE.BackSide});
    material.needsUpdate = true;
    // Создаем объект
    const mesh = new THREE.Mesh(geometry, material);

    // Создаем сцену
    const scene = new THREE.Scene();
    scene.add(mesh);

    const effect = new StereoEffect( renderer );
    // effect.setEyeSeparation(0.064);
    effect.setSize(900, 450);

    renderScene(effect, scene, camera);
}

/**
 * Запускает цикличный рендеринг сцены
 */
function renderScene(effect, scene, camera) {
    requestAnimationFrame(() => {
        effect.render(scene, camera);
        camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), 0.001);
        renderScene(effect, scene, camera)
    });
}
