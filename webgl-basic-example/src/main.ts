/** Создаем канвас */
const canvas = document.createElement('canvas');
canvas.height = 400;
canvas.width = 400;
document.body.appendChild(canvas);

/** Получаем контекст */
const gl = canvas.getContext('webgl');

/** Очищаем канвас */
gl.clearColor(0.5, 0.5, 0.5, 1);
gl.enable(gl.DEPTH_TEST);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.viewport(0, 0, canvas.width, canvas.height);

/** Задаем вершины в координатах CLIP SPACE */
const vertices = [-0.5, 0.5, -0.5, -0.5, 0.5, -0.5];

/** Создаем буфер для наших вершин и загружаем данные */
const vertex_buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

/** Создаем вершинный шейдер */
const vertCode = `
attribute vec2 coordinates;
void main(void) {
    gl_Position = vec4(coordinates, 0.0, 1.0);
}`;
const vertShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertShader, vertCode);
gl.compileShader(vertShader);

/** Создаем фрагментный шейдер */
const fragCode =`
void main(void) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.1);
}`;
const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragShader, fragCode);
gl.compileShader(fragShader);

/** Создаем шейдерную программу */
const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertShader);
gl.attachShader(shaderProgram, fragShader);
gl.linkProgram(shaderProgram);
gl.useProgram(shaderProgram);

/** Настраиваем аттрибут */
gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
const coords = gl.getAttribLocation(shaderProgram, "coordinates");
gl.vertexAttribPointer(coords, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(coords);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

/** Рисуем! */
gl.drawArrays(gl.TRIANGLES, 0, 3);
