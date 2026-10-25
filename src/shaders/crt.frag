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

// Scanlines: a soft sinusoid with a fixed count across the screen (as on the mock, about 121), so
// they scale with the tube; never finer than 3px, where they would turn into moire.
float scanlines(vec2 uv, float opacity) {
  float count = min(121.0, uResolution.y / 3.0);
  float dark = 0.5 - 0.5 * cos(uv.y * count * 6.2831853);
  return 1.0 - dark * opacity;
}

// Vignette effect
float vignette(vec2 uv, float strength) {
  vec2 center = vec2(0.5, 0.5);
  float dist = length(uv - center);
  return 1.0 - smoothstep(0.3, 1.0, dist) * strength;
}

void main() {
  // Apply barrel distortion to UV coordinates
  vec2 distortedUv = barrelDistortion(vUv, uCurvature);
  
  // Clamp to prevent sampling outside texture
  distortedUv = clamp(distortedUv, 0.0, 1.0);
  
  vec3 screenColor = texture2D(uTexture, distortedUv).rgb;

  // Phosphor bloom: lit glyphs bleed a soft glow onto the glass right around their strokes. Twelve
  // directions at two short radii keep the glow round; only light above the dark screen colour
  // contributes, so the background itself is not lifted. The glow is the phosphor's own saturated
  // green, as on the mock, not the pale mint of the stroke cores.
  vec3 bloom = vec3(0.0);
  for (int i = 0; i < 12; i++) {
    float a = float(i) * 0.5235988;
    vec2 dir = vec2(cos(a), sin(a)) / uResolution;
    bloom += max(texture2D(uTexture, clamp(distortedUv + dir * 1.5, 0.0, 1.0)).rgb - vec3(0.05, 0.14, 0.07), 0.0) * 0.6;
    bloom += max(texture2D(uTexture, clamp(distortedUv + dir * 3.5, 0.0, 1.0)).rgb - vec3(0.05, 0.14, 0.07), 0.0) * 0.4;
  }
  screenColor += bloom.g * vec3(0.0, 0.042, 0.009);

  // Scanlines darken the glass between the beam's lines; lit strokes bloom across them, as on the mock
  float scanline = scanlines(vUv, uScanlineOpacity);
  screenColor *= mix(scanline, 1.0, smoothstep(0.3, 0.8, screenColor.g));
  
  // Apply vignette
  float vig = vignette(vUv, uVignetteStrength);
  screenColor *= vig;
  
  // Subtle brightness adjustment for CRT feel
  screenColor *= 1.05;
  
  gl_FragColor = vec4(screenColor, 1.0);
}

