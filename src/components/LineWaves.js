'use client';

import { Renderer, Program, Mesh, Triangle } from 'ogl';
import { useEffect, useRef } from 'react';

function hexToVec3(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

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

export default function LineWaves({
  speed = 0.3,
  innerLineCount = 32.0,
  outerLineCount = 36.0,
  warpIntensity = 1.0,
  rotation = -45,
  edgeFadeWidth = 0.0,
  colorCycleSpeed = 1.0,
  brightness = 0.2,
  // amethyst-400 / 600 / 800
  color1 = '#b2adc7',
  color2 = '#8479a0',
  color3 = '#5a516c',
  enableMouseInteraction = true,
  mouseInfluence = 2.0,
}) {
  const containerRef = useRef(null);

  // ── Loop-read ref ──────────────────────────────────────────────────────────
  // Changing props does NOT recreate the WebGL context — the loop reads from
  // this ref so React never tears down/rebuilds the renderer on prop changes.
  const propsRef = useRef({ speed, innerLineCount, outerLineCount, warpIntensity, rotation, edgeFadeWidth, colorCycleSpeed, brightness, color1, color2, color3, enableMouseInteraction, mouseInfluence });

  useEffect(() => {
    propsRef.current = { speed, innerLineCount, outerLineCount, warpIntensity, rotation, edgeFadeWidth, colorCycleSpeed, brightness, color1, color2, color3, enableMouseInteraction, mouseInfluence };
  }, [speed, innerLineCount, outerLineCount, warpIntensity, rotation, edgeFadeWidth, colorCycleSpeed, brightness, color1, color2, color3, enableMouseInteraction, mouseInfluence]);

  // ── Main WebGL setup — runs once on mount ──────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const renderer = new Renderer({ alpha: true, premultipliedAlpha: false });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    let currentMouse = [0.5, 0.5];
    let targetMouse = [0.5, 0.5];

    function handleMouseMove(e) {
      const rect = gl.canvas.getBoundingClientRect();
      targetMouse = [
        (e.clientX - rect.left) / rect.width,
        1.0 - (e.clientY - rect.top) / rect.height,
      ];
    }

    function handleMouseLeave() {
      targetMouse = [0.5, 0.5];
    }

    function resize() {
      renderer.setSize(container.offsetWidth, container.offsetHeight);
      if (program) {
        program.uniforms.uResolution.value = [
          gl.canvas.width,
          gl.canvas.height,
          gl.canvas.width / gl.canvas.height,
        ];
      }
    }
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const geometry = new Triangle(gl);
    const p = propsRef.current;

    let program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime:           { value: 0 },
        uResolution:     { value: [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height] },
        uSpeed:          { value: p.speed },
        uInnerLines:     { value: p.innerLineCount },
        uOuterLines:     { value: p.outerLineCount },
        uWarpIntensity:  { value: p.warpIntensity },
        uRotation:       { value: (p.rotation * Math.PI) / 180 },
        uEdgeFadeWidth:  { value: p.edgeFadeWidth },
        uColorCycleSpeed:{ value: p.colorCycleSpeed },
        uBrightness:     { value: p.brightness },
        uColor1:         { value: hexToVec3(p.color1) },
        uColor2:         { value: hexToVec3(p.color2) },
        uColor3:         { value: hexToVec3(p.color3) },
        uMouse:          { value: new Float32Array([0.5, 0.5]) },
        uMouseInfluence: { value: p.mouseInfluence },
        uEnableMouse:    { value: p.enableMouseInteraction },
      },
    });

    resize();

    const mesh = new Mesh(gl, { geometry, program });
    container.appendChild(gl.canvas);

    gl.canvas.addEventListener('mousemove', handleMouseMove);
    gl.canvas.addEventListener('mouseleave', handleMouseLeave);

    let animationFrameId = 0;

    function update(time) {
      animationFrameId = requestAnimationFrame(update);
      const cp = propsRef.current;

      // Update uniforms in-place from the latest props ref — no context rebuild needed
      program.uniforms.uSpeed.value          = cp.speed;
      program.uniforms.uInnerLines.value     = cp.innerLineCount;
      program.uniforms.uOuterLines.value     = cp.outerLineCount;
      program.uniforms.uWarpIntensity.value  = cp.warpIntensity;
      program.uniforms.uRotation.value       = (cp.rotation * Math.PI) / 180;
      program.uniforms.uEdgeFadeWidth.value  = cp.edgeFadeWidth;
      program.uniforms.uColorCycleSpeed.value= cp.colorCycleSpeed;
      program.uniforms.uBrightness.value     = cp.brightness;
      program.uniforms.uColor1.value         = hexToVec3(cp.color1);
      program.uniforms.uColor2.value         = hexToVec3(cp.color2);
      program.uniforms.uColor3.value         = hexToVec3(cp.color3);
      program.uniforms.uMouseInfluence.value = cp.mouseInfluence;
      program.uniforms.uEnableMouse.value    = cp.enableMouseInteraction;
      program.uniforms.uTime.value           = time * 0.001;

      if (cp.enableMouseInteraction) {
        currentMouse[0] += 0.05 * (targetMouse[0] - currentMouse[0]);
        currentMouse[1] += 0.05 * (targetMouse[1] - currentMouse[1]);
        program.uniforms.uMouse.value[0] = currentMouse[0];
        program.uniforms.uMouse.value[1] = currentMouse[1];
      } else {
        program.uniforms.uMouse.value[0] = 0.5;
        program.uniforms.uMouse.value[1] = 0.5;
      }

      renderer.render({ scene: mesh });
    }

    // Pause RAF when scrolled out of view — mirrors Aurora/GradientBlinds pattern.
    const setActive = (active) => {
      if (!active) {
        if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = 0; }
      } else if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(update);
      }
    };
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: '200px' });
    io.observe(container);

    // Pause when tab is hidden.
    const onVisibilityChange = () => setActive(!document.hidden);
    document.addEventListener('visibilitychange', onVisibilityChange);

    animationFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      ro.disconnect();
      io.disconnect();
      gl.canvas.removeEventListener('mousemove', handleMouseMove);
      gl.canvas.removeEventListener('mouseleave', handleMouseLeave);
      if (container.contains(gl.canvas)) container.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  // Empty dep array: all mutable values are read from propsRef in the loop.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
}
