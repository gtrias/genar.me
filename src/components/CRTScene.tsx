import { onMount, onCleanup } from 'solid-js';
import * as THREE from 'three';
import type { Terminal } from '@xterm/xterm';
import { createTerminalTexture, updateTerminalTexture } from '../utils/terminalTexture';
import vertShader from '../shaders/crt.vert?raw';
import fragShader from '../shaders/crt.frag?raw';

interface CRTSceneProps {
  terminal: Terminal;
  curvature?: number;
  scanlineOpacity?: number;
  vignetteStrength?: number;
}

const CRTScene = (props: CRTSceneProps) => {
  let containerRef: HTMLDivElement | undefined;
  let scene: THREE.Scene | undefined;
  let camera: THREE.OrthographicCamera | undefined;
  let renderer: THREE.WebGLRenderer | undefined;
  let mesh: THREE.Mesh | undefined;
  let texture: THREE.CanvasTexture | undefined;
  let animationFrameId: number | undefined;
  let material: THREE.ShaderMaterial | undefined;

  const curvature = () => props.curvature ?? 0.15;
  const scanlineOpacity = () => props.scanlineOpacity ?? 0.15;
  const vignetteStrength = () => props.vignetteStrength ?? 0.3;

  onMount(() => {
    if (!containerRef) return;

    // Wait a bit for terminal to be fully initialized
    setTimeout(() => {
      if (!containerRef) return;

      // Initialize scene
      scene = new THREE.Scene();

      // Create camera (orthographic for 2D-like effect)
      const width = containerRef.clientWidth || 800;
      const height = containerRef.clientHeight || 600;
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
      camera.position.z = 1;

      // Create renderer
      renderer = new THREE.WebGLRenderer({ 
        antialias: false, // Disable antialiasing for more authentic CRT look
        alpha: false // Opaque background to match screen color
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      // Set clear color to match terminal background
      renderer.setClearColor(0x1e1e1e, 1);
      containerRef.appendChild(renderer.domElement);

      // Create a default texture (1x1 black pixel) as fallback
      const defaultCanvas = document.createElement('canvas');
      defaultCanvas.width = 1;
      defaultCanvas.height = 1;
      const defaultTexture = new THREE.CanvasTexture(defaultCanvas);
      
      // Create shader material
      material = new THREE.ShaderMaterial({
        uniforms: {
          uTexture: { value: defaultTexture },
          uCurvature: { value: curvature() },
          uScanlineOpacity: { value: scanlineOpacity() },
          uVignetteStrength: { value: vignetteStrength() },
          uResolution: { value: new THREE.Vector2(width, height) },
          uTime: { value: 0 },
        },
        vertexShader: vertShader,
        fragmentShader: fragShader,
      });

      // Create plane geometry (high segment count for smooth distortion)
      const geometry = new THREE.PlaneGeometry(2, 2, 64, 64);

      // Create mesh
      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      // Create terminal texture - retry if it fails initially
      const tryCreateTexture = () => {
        try {
          texture = createTerminalTexture(props.terminal);
          if (material && texture) {
            material.uniforms.uTexture.value = texture;
            console.log('Terminal texture created successfully', texture);
          }
        } catch (error) {
          console.error('Failed to create terminal texture:', error);
          console.log('Terminal element:', props.terminal.element);
          // Retry after a short delay
          setTimeout(tryCreateTexture, 100);
        }
      };
      // Wait a bit longer for terminal to be fully ready
      setTimeout(tryCreateTexture, 200);

      // Render loop
      let lastUpdateTime = 0;
      const UPDATE_INTERVAL = 100; // Update texture every 100ms
      
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        // Update texture periodically
        const now = Date.now();
        if (texture && now - lastUpdateTime > UPDATE_INTERVAL) {
          updateTerminalTexture(texture);
          lastUpdateTime = now;
        }

        if (material) {
          const uniforms = material.uniforms;
          uniforms.uTime.value += 0.01;
          uniforms.uCurvature.value = curvature();
          uniforms.uScanlineOpacity.value = scanlineOpacity();
          uniforms.uVignetteStrength.value = vignetteStrength();
        }

        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }
      };
      animate();

      let resizeTimeout: number | undefined;

      // Handle resize
      const handleResize = () => {
        if (!containerRef || !renderer || !camera) return;
        
        const width = containerRef.clientWidth;
        const height = containerRef.clientHeight;
        
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        
        if (material) {
          material.uniforms.uResolution.value.set(width, height);
        }
        
        // Re-create texture on resize to handle canvas resizing/replacement safely
        // Debounce to avoid too many recreations during resize
        if (resizeTimeout) clearTimeout(resizeTimeout);
        
        resizeTimeout = setTimeout(() => {
          // Dispose old texture first to be safe
          if (texture) {
            texture.dispose();
            texture = undefined;
          }
          
          // Create new texture from updated terminal canvas
          const newTexture = createTerminalTexture(props.terminal);
          texture = newTexture;
          
          if (material && texture) {
            const oldTexture = material.uniforms.uTexture.value;
            material.uniforms.uTexture.value = texture;
            
            // Ensure old texture is disposed if it's different and not the default
            if (oldTexture?.isCanvasTexture && oldTexture !== texture) {
               // Already disposed above if it was the same reference, but good to be safe
            }
            
            console.log('Terminal texture recreated on resize', texture);
          }
        }, 100); // Wait for terminal layout to stabilize
      };

      window.addEventListener('resize', handleResize);
      
      // Store cleanup function in a way accessible to onCleanup
      const cleanup = () => {
        window.removeEventListener('resize', handleResize);
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        if (renderer) {
          renderer.dispose();
          if (containerRef && renderer.domElement) {
            containerRef.removeChild(renderer.domElement);
          }
        }
        if (texture) {
          texture.dispose();
        }
        if (mesh) {
          mesh.geometry.dispose();
          if (mesh.material instanceof THREE.Material) {
            mesh.material.dispose();
          }
        }
      };
      
      // Store cleanup reference
      if (containerRef) {
        (containerRef as { __crtCleanup?: () => void }).__crtCleanup = cleanup;
      }
    }, 100); // Small delay to ensure terminal is ready

    // Cleanup
    onCleanup(() => {
      const cleanup = containerRef ? (containerRef as { __crtCleanup?: () => void }).__crtCleanup : undefined;
      if (cleanup) {
        cleanup();
        if (containerRef) {
          delete (containerRef as { __crtCleanup?: () => void }).__crtCleanup;
        }
      }
    });
  });

  return (
    <div
      ref={containerRef}
      class="absolute overflow-hidden"
      style={{ 
        'pointer-events': 'none',
        'z-index': 2,
        background: 'transparent',
        top: '25px',
        left: '25px',
        right: '25px',
        bottom: '25px',
        width: 'calc(100% - 50px)',
        height: 'calc(100% - 50px)'
      }}
    />
  );
};

export default CRTScene;

