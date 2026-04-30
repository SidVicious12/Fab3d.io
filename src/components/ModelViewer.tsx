import { useRef, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Dimensions } from '@/hooks/useTextToCAD';

interface STLModelProps {
  buffer: ArrayBuffer;
}

function STLModel({ buffer }: STLModelProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!meshRef.current || !buffer) return;

    // Parse binary STL
    const geometry = parseBinarySTL(buffer);
    if (!geometry) return;

    geometry.computeVertexNormals();
    geometry.center();

    // Scale to fit viewport (normalize to ~4 units)
    const bbox = new THREE.Box3().setFromBufferAttribute(
      geometry.attributes.position as THREE.BufferAttribute
    );
    const size = bbox.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = maxDim > 0 ? 4 / maxDim : 1;
    geometry.scale(scale, scale, scale);

    if (meshRef.current) {
      meshRef.current.geometry.dispose();
      meshRef.current.geometry = geometry;
    }
  }, [buffer]);

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <bufferGeometry />
      <meshStandardMaterial
        color="#00d4ff"
        metalness={0.3}
        roughness={0.4}
        emissive="#001a2e"
        emissiveIntensity={0.1}
      />
    </mesh>
  );
}

function parseBinarySTL(buffer: ArrayBuffer): THREE.BufferGeometry | null {
  try {
    const view = new DataView(buffer);

    // Check if it's ASCII STL
    const header = new Uint8Array(buffer, 0, 5);
    const isASCII = header[0] === 115 && header[1] === 111 && header[2] === 108 && header[3] === 105 && header[4] === 100;

    if (isASCII) {
      return parseASCIISTL(buffer);
    }

    const triangleCount = view.getUint32(80, true);
    const vertices: number[] = [];
    const normals: number[] = [];

    for (let i = 0; i < triangleCount; i++) {
      const offset = 84 + i * 50;

      const nx = view.getFloat32(offset, true);
      const ny = view.getFloat32(offset + 4, true);
      const nz = view.getFloat32(offset + 8, true);

      for (let v = 0; v < 3; v++) {
        const vOffset = offset + 12 + v * 12;
        vertices.push(
          view.getFloat32(vOffset, true),
          view.getFloat32(vOffset + 4, true),
          view.getFloat32(vOffset + 8, true),
        );
        normals.push(nx, ny, nz);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    return geometry;
  } catch {
    return null;
  }
}

function parseASCIISTL(buffer: ArrayBuffer): THREE.BufferGeometry | null {
  try {
    const text = new TextDecoder().decode(buffer);
    const vertices: number[] = [];
    const vertexRegex = /vertex\s+([\d.e+-]+)\s+([\d.e+-]+)\s+([\d.e+-]+)/g;
    let match;
    while ((match = vertexRegex.exec(text)) !== null) {
      vertices.push(parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3]));
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geometry;
  } catch {
    return null;
  }
}

function GridFloor() {
  return (
    <Grid
      position={[0, -2.5, 0]}
      args={[20, 20]}
      cellSize={0.5}
      cellThickness={0.3}
      cellColor="#1a3a4a"
      sectionSize={2}
      sectionThickness={0.5}
      sectionColor="#00d4ff"
      fadeDistance={15}
      fadeStrength={1}
      infiniteGrid
    />
  );
}

interface ModelViewerProps {
  stlBuffer: ArrayBuffer | null;
  isLoading?: boolean;
  dimensions?: Dimensions | null;
}

export function ModelViewer({ stlBuffer, isLoading, dimensions }: ModelViewerProps) {
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-fab-navy border border-white/5">
      {/* Grid background pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <Canvas
        camera={{ position: [5, 4, 5], fov: 45 }}
        shadows
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.5}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <pointLight position={[-5, 5, -5]} intensity={0.5} color="#00d4ff" />
          <pointLight position={[5, -5, 5]} intensity={0.3} color="#0066ff" />

          <Environment preset="night" />

          {stlBuffer && <STLModel buffer={stlBuffer} />}
          <GridFloor />
          <OrbitControls
            makeDefault
            enablePan
            enableZoom
            enableRotate
            minDistance={1}
            maxDistance={30}
            target={[0, 0, 0]}
          />
        </Suspense>
      </Canvas>

      {/* Empty state */}
      {!stlBuffer && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="w-20 h-20 rounded-2xl border border-fab-cyan/20 bg-fab-cyan/5 flex items-center justify-center mb-4">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M20 4L36 12V28L20 36L4 28V12L20 4Z" stroke="#00d4ff" strokeWidth="1.5" fill="none" opacity="0.6"/>
              <path d="M20 4L20 36M4 12L36 12M4 28L36 28" stroke="#00d4ff" strokeWidth="0.5" opacity="0.3"/>
            </svg>
          </div>
          <p className="text-white/40 text-sm font-medium">Your 3D model will appear here</p>
          <p className="text-white/20 text-xs mt-1">Orbit · Zoom · Pan</p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-fab-navy/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-fab-cyan/20" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-fab-cyan animate-spin" />
              <div className="absolute inset-2 rounded-full border border-fab-cyan/30 animate-ping" />
            </div>
            <div className="text-center">
              <p className="text-fab-cyan font-medium text-sm">Generating your model...</p>
              <p className="text-white/40 text-xs mt-1">This may take 10-30 seconds</p>
            </div>
          </div>
        </div>
      )}

      {/* Dimensions overlay */}
      {dimensions && stlBuffer && (
        <div className="absolute top-3 left-3 flex gap-2">
          {[
            { label: 'W', value: dimensions.width },
            { label: 'D', value: dimensions.depth },
            { label: 'H', value: dimensions.height },
          ].map(({ label, value }) => (
            <div key={label} className="bg-fab-navy/80 border border-white/10 rounded px-2 py-1 backdrop-blur-sm">
              <span className="text-fab-cyan text-[10px] font-mono">{label}</span>
              <span className="text-white text-[10px] font-mono ml-1">{value}mm</span>
            </div>
          ))}
        </div>
      )}

      {/* Controls hint */}
      {stlBuffer && (
        <div className="absolute bottom-3 left-3 text-white/20 text-[10px] font-mono">
          ← Drag to rotate · Scroll to zoom →
        </div>
      )}
    </div>
  );
}
