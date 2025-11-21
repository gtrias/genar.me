# Three.js CRT Glass Deformation

This directory contains the Three.js-based CRT glass deformation effect implementation.

## Files

### `CRTShader.ts`
GLSL shader implementation with:
- Vertex shader (passthrough with UV coordinates)
- Fragment shader (barrel distortion, chromatic aberration, vignette, scanlines)
- Uniform definitions and default values

### `GlassDeformation.ts`
Main rendering engine that:
- Manages Three.js scene, camera, renderer
- Captures terminal content from xterm.js canvas layers
- Applies CRT shader effects in real-time
- Handles resize and cleanup
- Provides configuration API

### `index.ts`
Module exports for easy importing

## Quick Start

```typescript
import { GlassDeformation } from './threejs/GlassDeformation';

const deformation = new GlassDeformation(targetElement, {
  distortion: 0.15,
  chromaticAberration: 0.003,
  scanlineIntensity: 0.15,
});

await deformation.initialize();
```

## Key Features

1. **Real-time Rendering** - 60fps shader-based rendering
2. **Efficient Capture** - Direct canvas copying from xterm.js
3. **Dynamic Configuration** - Adjust parameters at runtime
4. **Mobile Optimization** - Reduced effects for better performance
5. **Clean API** - Simple enable/disable and configuration updates

## Integration

Integrated into `CRTEffects` class:

```typescript
// src/terminal/effects/CRTEffects.ts
private glassDeformation: GlassDeformation | null = null;

async initialize() {
  this.glassDeformation = new GlassDeformation(targetElement, config);
  await this.glassDeformation.initialize();
}
```

## Performance

- GPU-accelerated shader processing
- Direct canvas-to-texture updates
- Optimized for real-time terminal rendering
- Mobile-specific optimizations

## Dependencies

- `three` - Three.js library for WebGL rendering
- No additional dependencies required
