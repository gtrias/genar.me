uniform sampler2D uTexture;
uniform float uCurvature;
uniform float uScanlineOpacity;
uniform float uVignetteStrength;
uniform vec2 uResolution;
uniform float uTime;

varying vec2 vUv;

// Barrel distortion
vec2 barrelDistortion(vec2 uv, float strength) {
  vec2 center = vec2(0.5, 0.5);
  vec2 coord = uv - center;
  float dist = length(coord);
  coord *= 1.0 + strength * dist * dist;
  return coord + center;
}

// Scanlines effect
float scanlines(vec2 uv, float opacity) {
  float line = mod(uv.y * uResolution.y, 2.0);
  return 1.0 - step(1.0, line) * opacity;
}

// Vignette effect
float vignette(vec2 uv, float strength) {
  vec2 center = vec2(0.5, 0.5);
  float dist = length(uv - center);
  return 1.0 - smoothstep(0.3, 1.0, dist) * strength;
}

// Chromatic aberration (very subtle, can be disabled)
vec3 chromaticAberration(sampler2D tex, vec2 uv, float amount) {
  // Reduce amount significantly or disable by returning normal sample
  if (amount < 0.0001) {
    return texture2D(tex, uv).rgb;
  }
  float r = texture2D(tex, uv + vec2(amount, 0.0)).r;
  float g = texture2D(tex, uv).g;
  float b = texture2D(tex, uv - vec2(amount, 0.0)).b;
  return vec3(r, g, b);
}

void main() {
  // Apply barrel distortion to UV coordinates
  vec2 distortedUv = barrelDistortion(vUv, uCurvature);
  
  // Clamp to prevent sampling outside texture
  distortedUv = clamp(distortedUv, 0.0, 1.0);
  
  // Sample texture with very subtle chromatic aberration
  vec3 screenColor = chromaticAberration(uTexture, distortedUv, 0.0003);
  
  // Apply scanlines
  float scanline = scanlines(vUv, uScanlineOpacity);
  screenColor *= scanline;
  
  // Apply vignette
  float vig = vignette(vUv, uVignetteStrength);
  screenColor *= vig;
  
  // Subtle brightness adjustment for CRT feel
  screenColor *= 1.05;
  
  gl_FragColor = vec4(screenColor, 1.0);
}

