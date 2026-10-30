uniform sampler2D uTexture;
uniform vec3 uBackground;
uniform float uCurvature;
uniform float uScanlineOpacity;
uniform float uVignetteStrength;
uniform vec2 uResolution;
uniform vec4 uTextArea;
uniform float uTime;

varying vec2 vUv;

// Barrel distortion: the picture bulges like the face of the tube. Normalised so the middle of each
// edge stays put: the text keeps its place and size on average (as on the mock), swelling a little
// in the middle and drawn in towards the corners.
vec2 barrelDistortion(vec2 uv, float strength) {
  vec2 center = vec2(0.5, 0.5);
  vec2 coord = uv - center;
  float dist = length(coord);
  coord *= (1.0 + strength * dist * dist) / (1.0 + strength * 0.25);
  return coord + center;
}

// The terminal's picture at a distorted position. Beyond its edges lies empty screen, not its edge
// pixels smeared outwards.
vec3 picture(vec2 uv) {
  vec2 inside = step(vec2(0.0), uv) * step(uv, vec2(1.0));
  return mix(uBackground, texture2D(uTexture, clamp(uv, 0.0, 1.0)).rgb, inside.x * inside.y);
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
  vec2 areaMin = uTextArea.xy;
  vec2 areaSize = uTextArea.zw - uTextArea.xy;
  // The picture is distorted within the text area; scanlines and vignette use the whole glass
  vec2 distortedUv = barrelDistortion((vUv - areaMin) / areaSize, uCurvature);
  vec3 screenColor = picture(distortedUv);

  // Resampling the terminal's canvas onto the curved glass softens its strokes; sharpen them back to
  // the mock's crisp glyphs
  vec2 px = 1.0 / (uResolution * areaSize);
  vec3 around = picture(distortedUv + vec2(px.x, 0.0)) + picture(distortedUv - vec2(px.x, 0.0))
    + picture(distortedUv + vec2(0.0, px.y)) + picture(distortedUv - vec2(0.0, px.y));
  screenColor = max(screenColor + 0.5 * (screenColor - around * 0.25), 0.0);

  // Phosphor saturation: a green stroke's red and blue only come up near full brightness, so its
  // edges are pure green and only the cores turn pale mint, as on the mock. Other hues are left alone.
  float lit = clamp((screenColor.g - uBackground.g) / (1.0 - uBackground.g), 0.0, 1.0);
  float green = smoothstep(0.0, 0.08, screenColor.g - max(screenColor.r, screenColor.b));
  screenColor.rb = mix(screenColor.rb, uBackground.rb + (screenColor.rb - uBackground.rb) * lit, green);

  // Phosphor bloom: lit glyphs bleed a soft glow onto the glass right around their strokes. Twelve
  // directions at two short radii keep the glow round; only light above the dark screen colour
  // contributes, so the background itself is not lifted. The glow is the phosphor's own saturated
  // green, as on the mock, not the pale mint of the stroke cores.
  vec3 bloom = vec3(0.0);
  for (int i = 0; i < 12; i++) {
    float a = float(i) * 0.5235988;
    vec2 dir = vec2(cos(a), sin(a)) / (uResolution * areaSize);
    bloom += max(picture(distortedUv + dir * 1.5) - vec3(0.05, 0.14, 0.07), 0.0) * 0.6;
    bloom += max(picture(distortedUv + dir * 3.5) - vec3(0.05, 0.14, 0.07), 0.0) * 0.4;
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

