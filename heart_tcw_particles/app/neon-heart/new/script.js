var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var gl = canvas.getContext("webgl");

if (!gl) {
    console.error("WebGL not supported.");
}

// Time variable
var time = 0.0;

var vertexSource = `
attribute vec2 position;
void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

var fragmentSource = `
precision highp float;
uniform float time;
uniform vec2 resolution;

#define POINT_COUNT 8
vec2 points[POINT_COUNT];
const float speed = -0.5;
const float len = 0.25;
float intensity = 0.9;
float radius = 0.015;

// Heart shape function
vec2 getHeartPosition(float t) {
    return vec2(
        16.0 * sin(t) * sin(t) * sin(t),
        -(13.0 * cos(t) - 5.0 * cos(2.0*t) - 2.0 * cos(3.0*t) - cos(4.0*t))
    );
}

// Glow function
float getGlow(float dist, float radius, float intensity) {
    return pow(radius / dist, intensity);
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    float widthHeightRatio = resolution.x / resolution.y;
    vec2 center = vec2(0.5, 0.5);
    vec2 pos = center - uv;
    pos.y /= widthHeightRatio;
    pos.y += 0.02;
    float scale = 0.000015 * resolution.y;

    float dist = length(getHeartPosition(time) - pos);
    float glow = getGlow(dist, radius, intensity);
    
    vec3 color = vec3(1.0, 0.2, 0.4) * glow;
    gl_FragColor = vec4(color, 1.0);
}
`;

// Shader compilation
function compileShader(source, type) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
}

// Create shaders
var vertexShader = compileShader(vertexSource, gl.VERTEX_SHADER);
var fragmentShader = compileShader(fragmentSource, gl.VERTEX_SHADER);

// Create shader program
var program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

var positionHandle = gl.getAttribLocation(program, "position");
var timeHandle = gl.getUniformLocation(program, "time");
var resolutionHandle = gl.getUniformLocation(program, "resolution");

gl.uniform2f(resolutionHandle, window.innerWidth, window.innerHeight);

function draw() {
    time += 0.02;
    gl.uniform1f(timeHandle, time);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(draw);
}

draw();
