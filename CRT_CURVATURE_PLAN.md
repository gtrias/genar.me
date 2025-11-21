# CRT Curvature Implementation Plan

## Overview
Apply CRT-like curvature to the terminal text using three.js to create a retro monitor effect with barrel distortion.

## Approach: Terminal Texture on Curved Surface

### Architecture
1. **Capture Terminal Canvas**: Extract the xterm.js canvas as a texture
2. **Create Curved Geometry**: Use three.js to create a curved plane/cylinder surface
3. **Apply Texture**: Map the terminal texture onto the curved surface
4. **Add CRT Effects**: Enhance with shaders for scanlines, vignette, and color distortion

## Implementation Steps

### Step 1: Install Dependencies
- `three` - Core three.js library
- `@types/three` - TypeScript types (dev dependency)

### Step 2: Create Three.js Scene Setup
- Initialize WebGL renderer
- Create scene, camera, and lighting
- Set up render loop
- Handle window resize

### Step 3: Capture Terminal Canvas
- Access xterm.js internal canvas element
- Create `THREE.CanvasTexture` from the terminal canvas
- Update texture on each frame (or use `needsUpdate` flag)

### Step 4: Create Curved Surface Geometry
**Option A: Curved Plane (Barrel Distortion)**
- Use `THREE.PlaneGeometry` with high segment count
- Apply vertex shader to create barrel distortion effect
- More control over curvature amount

**Option B: Cylindrical Surface**
- Use `THREE.CylinderGeometry` with partial arc
- Simpler but less customizable

**Recommended: Option A with custom shader**

### Step 5: Barrel Distortion Shader
```glsl
// Vertex shader applies curvature
// Fragment shader adds CRT effects:
- Scanlines (horizontal lines)
- Vignette (darkened edges)
- Color bleeding/chromatic aberration
- Subtle glow effect
```

### Step 6: Component Structure
```
Terminal.tsx
├── Terminal Component (existing xterm.js)
├── Three.js Scene Manager
│   ├── Scene setup
│   ├── Camera controls
│   ├── Texture capture from terminal
│   └── Render loop
└── CRT Shader Material
    ├── Barrel distortion
    ├── Scanlines
    └── Vignette
```

### Step 7: Integration Points
- Mount three.js canvas alongside or replace terminal container
- Sync terminal canvas updates with texture updates
- Handle terminal resize events
- Maintain terminal interactivity (mouse/keyboard events)

## Technical Considerations

### Performance
- Use `requestAnimationFrame` for render loop
- Update texture only when terminal content changes
- Consider using `OffscreenCanvas` if available

### Event Handling
- Forward mouse/keyboard events from three.js canvas to xterm.js
- Map 2D screen coordinates to 3D curved surface coordinates
- Handle focus management

### Responsiveness
- Maintain aspect ratio of terminal
- Adjust camera/geometry on window resize
- Keep terminal fit addon working

## File Structure
```
src/
├── components/
│   ├── Terminal.tsx (modified)
│   └── CRTScene.tsx (new - three.js scene manager)
├── shaders/
│   ├── crt.vert (vertex shader)
│   └── crt.frag (fragment shader)
└── utils/
    └── terminalTexture.ts (new - texture capture utility)
```

## Shader Effects Details

### Barrel Distortion
- Apply radial distortion to simulate curved CRT screen
- Configurable curvature strength
- Formula: `r' = r * (1 + k * r^2)` where k controls curvature

### Scanlines
- Horizontal lines every 2-3 pixels
- Subtle opacity (10-20%)
- Optional: animated scanline effect

### Vignette
- Darken edges of screen
- Radial gradient from center
- Configurable intensity

### Chromatic Aberration (Optional)
- Slight RGB channel separation at edges
- Enhances retro feel

## Configuration Options
- Curvature intensity (0.0 - 1.0)
- Scanline opacity
- Vignette strength
- Enable/disable effects individually
- Screen aspect ratio (4:3 for authentic CRT)

## Alternative Simpler Approach
If full three.js setup is too complex, consider:
- CSS `filter: perspective()` with transforms
- Canvas 2D barrel distortion
- WebGL fragment shader on 2D canvas

However, three.js approach provides:
- More realistic 3D curvature
- Better control over effects
- Extensibility for future enhancements

## Next Steps
1. Install three.js dependencies
2. Create basic three.js scene setup
3. Implement terminal canvas capture
4. Create curved geometry with barrel distortion
5. Add CRT shader effects
6. Integrate with existing Terminal component
7. Test and fine-tune parameters

