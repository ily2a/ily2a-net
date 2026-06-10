'use client';

import { Renderer, Program, Mesh, Triangle } from 'ogl';
import { useRef } from 'react';
import { useWebGLBackground, type WebGLBackgroundContext } from '@/hooks/useWebGLBackground';
import { AMETHYST } from '@/constants/colors';
import { hexToRgbNormalized } from '@/lib/color';

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform float uSpeed;
uniform float uInnerLines;
uniform float uOuterLines;
uniform float uWarpIntensity;
uniform float uRotation;
uniform float uEdgeFadeWidth;
uniform float uColorCycleSpeed;
uniform float uBrightness;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec2 uMouse;
uniform float uMouseInfluence;
uniform bool uEnableMouse;

#define HALF_PI 1.5707963

float hashF(float n) {
  return fract(sin(n * 127.1) * 43758.5453123);
}

float smoothNoise(float x) {
  float i = floor(x);
  float f = fract(x);
  float u = f * f * (3.0 - 2.0 * f);
  return mix(hashF(i), hashF(i + 1.0), u);
}

float displaceA(float coord, float t) {
  float result = sin(coord * 2.123) * 0.2;
  result += sin(coord * 3.234 + t * 4.345) * 0.1;
  result += sin(coord * 0.589 + t * 0.934) * 0.5;
  return result;
}

float displaceB(float coord, float t) {
  float result = sin(coord * 1.345) * 0.3;
  result += sin(coord * 2.734 + t * 3.345) * 0.2;
  result += sin(coord * 0.189 + t * 0.934) * 0.3;
  return result;
}

vec2 rotate2D(vec2 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}

void main() {
  vec2 coords = gl_FragCoord.xy / uResolution.xy;
  coords = coords * 2.0 - 1.0;
  coords = rotate2D(coords, uRotation);

  float halfT = uTime * uSpeed * 0.5;
  float fullT = uTime * uSpeed;

  float mouseWarp = 0.0;
  if (uEnableMouse) {
    vec2 mPos = rotate2D(uMouse * 2.0 - 1.0, uRotation);
    float mDist = length(coords - mPos);
    mouseWarp = uMouseInfluence * exp(-mDist * mDist * 4.0);
  }

  float warpAx = coords.x + displaceA(coords.y, halfT) * uWarpIntensity + mouseWarp;
  float warpAy = coords.y - displaceA(coords.x * cos(fullT) * 1.235, halfT) * uWarpIntensity;
  float warpBx = coords.x + displaceB(coords.y, halfT) * uWarpIntensity + mouseWarp;
  float warpBy = coords.y - displaceB(coords.x * sin(fullT) * 1.235, halfT) * uWarpIntensity;

  vec2 fieldA = vec2(warpAx, warpAy);
  vec2 fieldB = vec2(warpBx, warpBy);
  vec2 blended = mix(fieldA, fieldB, mix(fieldA, fieldB, 0.5));

  float fadeTop = smoothstep(uEdgeFadeWidth, uEdgeFadeWidth + 0.4, blended.y);
  float fadeBottom = smoothstep(-uEdgeFadeWidth, -(uEdgeFadeWidth + 0.4), blended.y);
  float vMask = 1.0 - max(fadeTop, fadeBottom);

  float tileCount = mix(uOuterLines, uInnerLines, vMask);
  float scaledY = blended.y * tileCount;
  float nY = smoothNoise(abs(scaledY));

  float ridge = pow(
    step(abs(nY - blended.x) * 2.0, HALF_PI) * cos(2.0 * (nY - blended.x)),
    5.0
  );

  float lines = 0.0;
  for (float i = 1.0; i < 3.0; i += 1.0) {
    lines += pow(max(fract(scaledY), fract(-scaledY)), i * 2.0);
  }

  float pattern = vMask * lines;

  float cycleT = fullT * uColorCycleSpeed;
  float rChannel = (pattern + lines * ridge) * (cos(blended.y + cycleT * 0.234) * 0.5 + 1.0);
  float gChannel = (pattern + vMask * ridge) * (sin(blended.x + cycleT * 1.745) * 0.5 + 1.0);
  float bChannel = (pattern + lines * ridge) * (cos(blended.x + cycleT * 0.534) * 0.5 + 1.0);

  vec3 col = (rChannel * uColor1 + gChannel * uColor2 + bChannel * uColor3) * uBrightness;
  float alpha = clamp(length(col), 0.0, 1.0);

  gl_FragColor = vec4(col, alpha);
}
`;

// Visual configuration. These were once component props, but no caller ever
// overrides them, so they live as module constants — the WebGL setup reads them
// directly and the loop only advances the time/mouse uniforms each frame.
const SPEED = 0.25;
const INNER_LINE_COUNT = 32.0;
const OUTER_LINE_COUNT = 36.0;
const WARP_INTENSITY = 0.9;
const ROTATION_DEG = -45;
const EDGE_FADE_WIDTH = 0.0;
const COLOR_CYCLE_SPEED = 0.8;
const BRIGHTNESS = 0.18;
const COLOR1 = AMETHYST[400];
const COLOR2 = AMETHYST[600];
const COLOR3 = AMETHYST[800];
const ENABLE_MOUSE_INTERACTION = true;
const MOUSE_INFLUENCE = 2.0;

export default function NotFoundPasswordBg() {
  const containerRef = useRef<HTMLDivElement>(null);
  useWebGLBackground(containerRef, setupNotFoundPasswordBg, []);

  return (
    <div className="absolute inset-0 -z-10 opacity-60">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

// Builds the ogl renderer/program/mesh and returns the lifecycle contract for
// useWebGLBackground (which owns pause/resume, reduced motion, and context-loss
// recovery). Static uniforms are set once; render() only advances time and
// eases the mouse.
function setupNotFoundPasswordBg(container: HTMLElement): WebGLBackgroundContext {
  const renderer = new Renderer({
    alpha: true,
    premultipliedAlpha: false,
    antialias: false,
    dpr: Math.min(window.devicePixelRatio || 1, 1.5),
  });
  const gl = renderer.gl;
  gl.clearColor(0, 0, 0, 0);

  const currentMouse = [0.5, 0.5];
  let targetMouse = [0.5, 0.5];

  function handleMouseMove(e: MouseEvent) {
    const rect = gl.canvas.getBoundingClientRect();
    targetMouse = [
      (e.clientX - rect.left) / rect.width,
      1.0 - (e.clientY - rect.top) / rect.height,
    ];
  }
  function handleMouseLeave() {
    targetMouse = [0.5, 0.5];
  }

  const geometry = new Triangle(gl);
  const program = new Program(gl, {
    vertex: vertexShader,
    fragment: fragmentShader,
    uniforms: {
      uTime:           { value: 0 },
      uResolution:     { value: [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height] },
      uSpeed:          { value: SPEED },
      uInnerLines:     { value: INNER_LINE_COUNT },
      uOuterLines:     { value: OUTER_LINE_COUNT },
      uWarpIntensity:  { value: WARP_INTENSITY },
      uRotation:       { value: (ROTATION_DEG * Math.PI) / 180 },
      uEdgeFadeWidth:  { value: EDGE_FADE_WIDTH },
      uColorCycleSpeed:{ value: COLOR_CYCLE_SPEED },
      uBrightness:     { value: BRIGHTNESS },
      uColor1:         { value: hexToRgbNormalized(COLOR1) },
      uColor2:         { value: hexToRgbNormalized(COLOR2) },
      uColor3:         { value: hexToRgbNormalized(COLOR3) },
      uMouse:          { value: new Float32Array([0.5, 0.5]) },
      uMouseInfluence: { value: MOUSE_INFLUENCE },
      uEnableMouse:    { value: ENABLE_MOUSE_INTERACTION },
    },
  });
  const mesh = new Mesh(gl, { geometry, program });

  container.appendChild(gl.canvas);
  gl.canvas.addEventListener('mousemove', handleMouseMove);
  gl.canvas.addEventListener('mouseleave', handleMouseLeave);

  function resize() {
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    program.uniforms.uResolution.value = [
      gl.canvas.width,
      gl.canvas.height,
      gl.canvas.width / gl.canvas.height,
    ];
  }

  return {
    canvas: gl.canvas,
    isContextLost: () => gl.isContextLost(),
    resize,
    render(time: number) {
      program.uniforms.uTime.value = time * 0.001;
      if (ENABLE_MOUSE_INTERACTION) {
        currentMouse[0] += 0.05 * (targetMouse[0] - currentMouse[0]);
        currentMouse[1] += 0.05 * (targetMouse[1] - currentMouse[1]);
        program.uniforms.uMouse.value[0] = currentMouse[0];
        program.uniforms.uMouse.value[1] = currentMouse[1];
      } else {
        program.uniforms.uMouse.value[0] = 0.5;
        program.uniforms.uMouse.value[1] = 0.5;
      }
      renderer.render({ scene: mesh });
    },
    renderStatic() {
      program.uniforms.uTime.value = 0;
      renderer.render({ scene: mesh });
    },
    dispose() {
      gl.canvas.removeEventListener('mousemove', handleMouseMove);
      gl.canvas.removeEventListener('mouseleave', handleMouseLeave);
      if (container.contains(gl.canvas)) container.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
