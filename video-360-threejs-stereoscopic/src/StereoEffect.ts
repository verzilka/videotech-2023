import {
    StereoCamera,
    Vector2
} from 'three';

class StereoEffect {
    private renderer: any;
    private stereo: StereoCamera;
    private size: Vector2;

    constructor( renderer ) {
        this.renderer = renderer;
        this.stereo = new StereoCamera();
        this.stereo.aspect = 0.5;
        this.size = new Vector2();
    }

    /**
     * Default is 0.064.
     */
    public setEyeSeparation(eyeSep) {
        this.stereo.eyeSep = eyeSep;
    };

    /**
     *
     */
    public setSize(width, height) {
        this.renderer.setSize(width, height);
    };

    /**
     *
     */
    public render(scene, camera) {
        if (scene.matrixWorldAutoUpdate === true) scene.updateMatrixWorld();

        if (camera.parent === null && camera.matrixWorldAutoUpdate === true) camera.updateMatrixWorld();

        this.stereo.update(camera);

        this.renderer.getSize(this.size);

        if (this.renderer.autoClear) {
            this.renderer.clear();
        }

        this.renderer.setScissorTest(true);

        this.renderer.setScissor(0, 0, this.size.width / 2, this.size.height);
        this.renderer.setViewport(0, 0, this.size.width / 2, this.size.height);
        this.renderer.render(scene, this.stereo.cameraL);

        this.renderer.setScissor(this.size.width / 2, 0, this.size.width / 2, this.size.height);
        this.renderer.setViewport(this.size.width / 2, 0, this.size.width / 2, this.size.height);
        this.renderer.render(scene, this.stereo.cameraR);

        this.renderer.setScissorTest(false);
    };
}

export { StereoEffect };