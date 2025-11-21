/**
 * CRT Glass Deformation Shader
 * Implements realistic curved CRT glass effects using GLSL shaders
 * Features: barrel distortion, chromatic aberration, vignette, scanlines
 */

export const CRTShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0.0 },
    distortion: { value: 0.15 },        // Barrel distortion amount
    distortionX: { value: 0.12 },       // Horizontal distortion
    distortionY: { value: 0.15 },       // Vertical distortion
    chromaticAberration: { value: 0.003 }, // RGB separation
    vignette: { value: 0.35 },          // Edge darkening
    vignetteAlpha: { value: 0.8 },      // Vignette opacity
    scanlineIntensity: { value: 0.15 }, // Scanline strength
    scanlineCount: { value: 800.0 },    // Number of scanlines
    brightness: { value: 1.05 },        // Overall brightness
    curvature: { value: 4.0 },          // Glass curvature strength
  },

  vertexShader: /* glsl */ `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float distortion;
    uniform float distortionX;
    uniform float distortionY;
    uniform float chromaticAberration;
    uniform float vignette;
    uniform float vignetteAlpha;
    uniform float scanlineIntensity;
    uniform float scanlineCount;
    uniform float brightness;
    uniform float curvature;

    varying vec2 vUv;

    // Barrel distortion function - simulates curved CRT glass
    vec2 barrelDistortion(vec2 coord, float amount) {
      vec2 cc = coord - 0.5;
      float dist = dot(cc, cc) * amount;
      return coord + cc * (1.0 + dist) * dist;
    }

    // Advanced barrel distortion with separate X/Y control
    vec2 curvedDistortion(vec2 uv) {
      vec2 cc = uv - 0.5;
      float dist = dot(cc, cc);

      // Apply asymmetric distortion for realistic CRT curvature
      vec2 offset = cc * (curvature + dist * distortion);
      offset.x *= distortionX;
      offset.y *= distortionY;

      return uv + offset * dist;
    }

    // Vignette effect - darker edges like CRT phosphor falloff
    float vignetteFx(vec2 uv, float intensity, float extent) {
      vec2 center = uv - 0.5;
      float dist = length(center);
      return 1.0 - smoothstep(extent, extent + intensity, dist);
    }

    // Scanlines - horizontal lines typical of CRT displays
    float scanlines(vec2 uv, float count, float intensity) {
      float line = sin(uv.y * count * 3.14159);
      return 1.0 - intensity + intensity * line;
    }

    // Screen border mask - cuts off content outside visible area
    float borderMask(vec2 uv) {
      vec2 border = smoothstep(vec2(0.0), vec2(0.05), uv) *
                    smoothstep(vec2(0.0), vec2(0.05), 1.0 - uv);
      return border.x * border.y;
    }

    void main() {
      // Apply curved glass distortion
      vec2 uv = curvedDistortion(vUv);

      // Sample texture with chromatic aberration (RGB color separation)
      // Red channel - shift left
      vec2 uvR = uv - vec2(chromaticAberration, 0.0);
      // Green channel - no shift
      vec2 uvG = uv;
      // Blue channel - shift right
      vec2 uvB = uv + vec2(chromaticAberration, 0.0);

      // Sample each color channel separately
      float r = texture2D(tDiffuse, uvR).r;
      float g = texture2D(tDiffuse, uvG).g;
      float b = texture2D(tDiffuse, uvB).b;

      vec3 color = vec3(r, g, b);

      // Apply scanlines
      float scanline = scanlines(uv, scanlineCount, scanlineIntensity);
      color *= scanline;

      // Apply vignette
      float vig = vignetteFx(uv, vignette, vignetteAlpha);
      color *= vig;

      // Apply border mask
      float border = borderMask(uv);
      color *= border;

      // Apply brightness adjustment
      color *= brightness;

      // Subtle flicker effect (very subtle)
      float flicker = 1.0 - 0.02 * sin(time * 60.0);
      color *= flicker;

      // Clamp to valid range
      color = clamp(color, 0.0, 1.0);

      gl_FragColor = vec4(color, 1.0);
    }
  `,
};
