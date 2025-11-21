# CRT Glass Deformation Effect

## Overview

The CRT Glass Deformation system implements realistic curved glass text deformation using Three.js and custom GLSL shaders. This creates an authentic CRT monitor appearance with barrel distortion, chromatic aberration, scanlines, and vignetting effects.

## Features

### Visual Effects

1. **Barrel Distortion** - Simulates the curved glass of a CRT screen with adjustable horizontal and vertical distortion
2. **Chromatic Aberration** - RGB color separation effect that mimics electron beam misalignment
3. **Vignette** - Edge darkening similar to CRT phosphor falloff
4. **Scanlines** - Horizontal lines characteristic of CRT displays
5. **Dynamic Rendering** - Real-time rendering of terminal content with smooth animations
6. **Mobile Optimization** - Reduced effect intensity for better performance on mobile devices

## Architecture

### Components

```
src/terminal/effects/threejs/
├── CRTShader.ts           # GLSL vertex and fragment shaders
├── GlassDeformation.ts    # Main Three.js rendering engine
└── index.ts               # Exports
```

### Integration

The glass deformation effect integrates seamlessly with the existing CRT effects system:

```typescript
// src/terminal/effects/CRTEffects.ts
import { GlassDeformation } from './threejs/GlassDeformation';

export class CRTEffects {
  private glassDeformation: GlassDeformation | null = null;
  // ...
}
```

## Usage

### Basic Configuration

The effect is automatically initialized when the terminal starts. Default configuration:

```typescript
{
  enabled: true,
  distortion: 0.15,          // Overall barrel distortion strength
  distortionX: 0.12,         // Horizontal distortion
  distortionY: 0.15,         // Vertical distortion
  chromaticAberration: 0.003, // RGB separation amount
  vignette: 0.35,            // Edge darkening intensity
  scanlineIntensity: 0.15,   // Scanline visibility
  curvature: 4.0,            // Glass curvature strength
  mobileOptimized: false,    // Auto-reduced effects on mobile
}
```

### Programmatic Control

#### Enable/Disable the Effect

```typescript
// Access CRT effects from TerminalManager
const terminalManager = window.terminalManager;
const crtEffects = terminalManager.crtEffects;

// Toggle glass deformation
crtEffects.setGlassDeformationEnabled(false); // Disable
crtEffects.setGlassDeformationEnabled(true);  // Enable
```

#### Update Configuration

```typescript
// Adjust deformation parameters dynamically
crtEffects.updateGlassDeformation({
  distortion: 0.2,              // Increase barrel distortion
  chromaticAberration: 0.005,   // Stronger RGB separation
  scanlineIntensity: 0.25,      // More visible scanlines
});
```

#### Direct Access

```typescript
// Get glass deformation instance for advanced control
const glassDeform = crtEffects.getGlassDeformation();

if (glassDeform) {
  // Update full configuration
  glassDeform.updateConfig({
    distortion: 0.1,
    vignette: 0.5,
    curvature: 6.0,
  });

  // Enable/disable
  glassDeform.setEnabled(false);

  // Clean up
  glassDeform.cleanup();
}
```

## Shader Details

### Vertex Shader

Simple passthrough shader that preserves UV coordinates:

```glsl
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

### Fragment Shader

Complex shader implementing multiple CRT effects:

```glsl
// Key functions:
vec2 curvedDistortion(vec2 uv)           // Barrel distortion
float vignetteFx(vec2 uv, ...)           // Edge darkening
float scanlines(vec2 uv, ...)            // Scanline effect
float borderMask(vec2 uv)                // Screen border
```

### Uniforms

| Uniform | Type | Default | Description |
|---------|------|---------|-------------|
| `tDiffuse` | sampler2D | - | Source texture (terminal content) |
| `time` | float | 0.0 | Elapsed time for animations |
| `distortion` | float | 0.15 | Barrel distortion amount |
| `distortionX` | float | 0.12 | Horizontal distortion |
| `distortionY` | float | 0.15 | Vertical distortion |
| `chromaticAberration` | float | 0.003 | RGB color separation |
| `vignette` | float | 0.35 | Edge darkening intensity |
| `vignetteAlpha` | float | 0.8 | Vignette opacity |
| `scanlineIntensity` | float | 0.15 | Scanline strength |
| `scanlineCount` | float | 800.0 | Number of scanlines |
| `brightness` | float | 1.05 | Overall brightness |
| `curvature` | float | 4.0 | Glass curvature strength |

## Performance Considerations

### Optimization Strategies

1. **Mobile Detection** - Automatically reduces effect intensity on mobile devices
2. **Efficient Texture Updates** - Direct canvas copying from xterm.js layers
3. **RequestAnimationFrame** - Synchronized rendering with browser refresh rate
4. **WebGL Acceleration** - GPU-accelerated shader processing

### Mobile Optimizations

On mobile devices, effects are automatically reduced:

```typescript
if (mobileOptimized) {
  config.distortion *= 0.5;
  config.chromaticAberration *= 0.5;
  config.scanlineIntensity *= 0.3;
  config.vignette *= 0.6;
}
```

### Rendering Pipeline

1. **Capture** - Extract terminal content from xterm.js canvas layers
2. **Upload** - Update WebGL texture with captured content
3. **Process** - Apply shader transformations (distortion, aberration, etc.)
4. **Render** - Draw processed result to overlay canvas
5. **Repeat** - Loop at 60fps via requestAnimationFrame

## Technical Details

### Three.js Setup

```typescript
// Orthographic camera for 2D rendering
this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

// WebGL renderer with alpha channel
this.renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: false,  // Authentic CRT look
  preserveDrawingBuffer: true,
});

// Fullscreen quad for shader
const geometry = new THREE.PlaneGeometry(2, 2);
this.quad = new THREE.Mesh(geometry, this.material);
```

### Texture Capture

Efficient terminal content capture from xterm.js:

```typescript
// Direct copy from xterm canvas layers
const xtermCanvas = element.querySelector('canvas.xterm-text-layer');
const cursorCanvas = element.querySelector('canvas.xterm-cursor-layer');
const selectionCanvas = element.querySelector('canvas.xterm-selection-layer');

ctx.drawImage(xtermCanvas, 0, 0, canvas.width, canvas.height);
ctx.drawImage(cursorCanvas, 0, 0, canvas.width, canvas.height);
ctx.drawImage(selectionCanvas, 0, 0, canvas.width, canvas.height);
```

## Troubleshooting

### Effect Not Visible

1. Check if glass deformation is enabled: `crtEffects.getGlassDeformation()?.config.enabled`
2. Verify WebGL support in browser
3. Check browser console for initialization errors

### Performance Issues

1. Reduce `scanlineCount` to lower value (e.g., 400)
2. Decrease `chromaticAberration` for less processing
3. Enable `mobileOptimized` flag
4. Lower overall `distortion` values

### Visual Artifacts

1. Adjust `distortionX` and `distortionY` separately for balanced curvature
2. Reduce `chromaticAberration` if color separation is too strong
3. Modify `vignette` and `vignetteAlpha` for edge darkening control

## Browser Compatibility

- ✅ Chrome/Edge 90+ (Chromium)
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers with WebGL support

Requires:
- WebGL 1.0 or higher
- Canvas API
- RequestAnimationFrame

## Examples

### Subtle Effect (Professional)

```typescript
crtEffects.updateGlassDeformation({
  distortion: 0.08,
  chromaticAberration: 0.001,
  scanlineIntensity: 0.05,
  vignette: 0.2,
});
```

### Dramatic Effect (Retro)

```typescript
crtEffects.updateGlassDeformation({
  distortion: 0.25,
  chromaticAberration: 0.008,
  scanlineIntensity: 0.3,
  vignette: 0.5,
  curvature: 6.0,
});
```

### Minimal (Performance)

```typescript
crtEffects.updateGlassDeformation({
  distortion: 0.05,
  chromaticAberration: 0.0,
  scanlineIntensity: 0.02,
  vignette: 0.1,
});
```

## Future Enhancements

Potential improvements:

- [ ] Additional shader effects (bloom, noise, grain)
- [ ] Configurable refresh rate/flicker patterns
- [ ] Shadow mask/aperture grille simulation
- [ ] Color temperature adjustment
- [ ] Phosphor persistence simulation
- [ ] Dynamic configuration UI

## License

This implementation uses:
- Three.js (MIT License)
- Custom GLSL shaders (MIT License)
- xterm.js integration (MIT License)
