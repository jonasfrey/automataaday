const vertexShaderSource = `#version 300 es
precision mediump float;
in vec2 a_position;
out vec2 v_texCoord;
void main() {
    v_texCoord = (a_position + 1.0) / 2.0;
    gl_Position = vec4(a_position, 0, 1);
}`;

const fragmentShaderSource = `#version 300 es
precision mediump float;
in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_texture;

void main() {
    vec4 lastFrame = texture(u_texture, v_texCoord);
    
    // Implement your cellular automaton logic here, for example, 
    // a simple binary rule or life-like automaton.
    float state = lastFrame.r; // Let's assume red channel is the state

    state = (lastFrame.r>0.5) ? 0.0: 1.0;

    fragColor = vec4(state, state, state, 1.0);
}`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

function createTexture(gl, width, height, initialColor = [0, 0, 0, 255]) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Create a buffer for the initial texture content
    const pixels = new Uint8Array(width * height * 4); // 4 components: RGBA
    for (let i = 0; i < pixels.length; i += 4) {
        pixels[i] = initialColor[0];     // Red
        pixels[i + 1] = initialColor[1]; // Green
        pixels[i + 2] = initialColor[2]; // Blue
        pixels[i + 3] = initialColor[3]; // Alpha
    }

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    return texture;
}
function createFramebuffer(gl, texture) {
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return fb;
}

function main() {
    const canvas = document.getElementById("glCanvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) {
        console.error("WebGL 2 not supported");
        return;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([
        -1, -1, 1, -1, -1, 1,
        -1, 1, 1, -1, 1, 1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const textureWidth = 512;
    const textureHeight = 512;

    let texture1 = createTexture(gl, textureWidth, textureHeight, [255, 255, 255, 255]); // Initialize white
    let texture2 = createTexture(gl, textureWidth, textureHeight, [255, 255, 255, 255]); // Initialize white
    
    let framebuffer1 = createFramebuffer(gl, texture1);
    let framebuffer2 = createFramebuffer(gl, texture2);

    gl.useProgram(program);
    gl.uniform1i(gl.getUniformLocation(program, "u_texture"), 0);
    let n = 0;
    function render() {
        gl.viewport(0, 0, textureWidth, textureHeight);
        console.log(n)
        n+=1;
        // Draw to framebuffer1
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer1);
        gl.bindTexture(gl.TEXTURE_2D, texture2);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // Now draw the framebuffer content to the canvas
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, texture1);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // Swap the framebuffers
        const temp = framebuffer1;
        framebuffer1 = framebuffer2;
        framebuffer2 = temp;

        const tempTexture = texture1;
        texture1 = texture2;
        texture2 = tempTexture;

        requestAnimationFrame(render);
    }

    render();
}

main();
