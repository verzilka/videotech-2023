const sourceVideoElement = document.getElementById('source') as HTMLVideoElement;
sourceVideoElement.oncanplay = init;

const canvas = document.createElement('canvas');
canvas.width = 900;
canvas.height = 450;

const wrapper = document.getElementById('result');
wrapper.appendChild(canvas);

const gl = canvas.getContext('webgl');
gl.clearColor(0, 0, 0, 1);
gl.enable(gl.DEPTH_TEST);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.viewport(0, 0, canvas.width, canvas.height);

const vertices = [-1, -1, 1, -1, 1, 1, -1, 1];
const fov = {x: 135, y: 76};
const focus = {x: 0, y: 0};

let vertexBuffer,
    vertexShader,
    fragmentShader,
    shaderProgram,
    videoTexture,
    textureLoc,
    focusLoc,
    texelLoc,
    texelBuffer;

function init() {
    sourceVideoElement.oncanplay = null;

    /** создаем вершинный буфер */
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    /** создаем вершинный шейдер */
    vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, VERTEX_SHADER_SRC);
    gl.compileShader(vertexShader);

    /** создаем фрагментный шейдер */
    fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, FRAGMENT_SHADER_SRC);
    gl.compileShader(fragmentShader);

    /** создаем шейдерную программу */
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    /** создаем текстуру */
    videoTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, videoTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    textureLoc = gl.getUniformLocation(shaderProgram, 'u_texture');

    /** настраиваем как читать вершинный буфер */
    const vertexLoc = gl.getAttribLocation(shaderProgram, 'a_vertex');
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vertexLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    /** буфер маппинга текстуры */
    texelBuffer = gl.createBuffer();
    texelLoc = gl.getAttribLocation(shaderProgram, 'a_texel');
    gl.bindBuffer(gl.ARRAY_BUFFER, texelBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(texelLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texelLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    focusLoc = gl.getUniformLocation(shaderProgram, 'u_focus');

    renderScene();
}

function renderScene() {
    /** обновляем текстуру из видеоэлемента */
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        sourceVideoElement,
    );

    /** передаем текущий фокус (в градусах) */
    gl.uniform2f(focusLoc, focus.x, focus.y);

    /** рисуем кадр */
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    /** поворот камеры для наглядности */
    // focus.x += 0.5;

    /** следующий кадр */
    requestAnimationFrame(() => {
        renderScene();
    });
}

const VERTEX_SHADER_SRC = `
#ifdef GL_ES
    precision highp float;
    precision highp int;
#else
    precision highp float;
#endif

attribute vec2 a_vertex;
attribute vec2 a_texel;

varying vec2 v_texel;

void main(void) {
    // рисуем вершину без изменений
    gl_Position = vec4(a_vertex, 0.0, 1.0);
    // прокидываем координату маппинга текстуры во фрагментный шейдер
    v_texel = a_texel;
}
`;

const FRAGMENT_SHADER_SRC = `
#ifdef GL_ES
    precision highp float;
    precision highp int;
#else
    precision highp float;
#endif

#define PI 3.14159265358979323846264

varying vec2 v_texel;

uniform sampler2D u_texture;
uniform vec2 u_focus;

void main(void) {
    float lambda0 = u_focus.x / 180.0;
    float phi0 = u_focus.y / 180.0;

    float lambda = PI * (v_texel.x - 0.5 - lambda0);
    float phi = PI * (v_texel.y - 0.5 - phi0);

    float p = sqrt(lambda * lambda + phi * phi);
    float c = atan(p);
    float cos_c = cos(c); // 1
    float sin_c = sin(c); // 0

    float x = lambda0 + atan(
        lambda * sin_c,
        p * cos(phi0) * cos_c - phi * sin(phi0) * sin_c
    );
    float y = asin(cos_c * sin(phi0) + (phi * sin_c * cos(phi0)) / p);

    vec2 tc = vec2(
        mod(x / (PI * 2.0) - 0.5, 1.0),
        mod(y / PI - 0.5, 1.0)
    );

    gl_FragColor = texture2D(u_texture, tc);
}
`;