import { useState, useCallback } from 'react';
import { useOpenSCAD } from './useOpenSCAD';

export interface Dimensions {
  width: number;
  depth: number;
  height: number;
}

export interface UseTextToCADResult {
  generate: (prompt: string) => Promise<void>;
  scadCode: string | null;
  stlBuffer: ArrayBuffer | null;
  isLoading: boolean;
  isCompiling: boolean;
  error: string | null;
  dimensions: Dimensions | null;
  reset: () => void;
}

function stripCodeFences(code: string): string {
  return code
    .replace(/^```[\w]*\n?/gm, '')
    .replace(/^```\n?/gm, '')
    .trim();
}

function parseDimensionsFromSTL(buffer: ArrayBuffer): Dimensions | null {
  try {
    const view = new DataView(buffer);
    // Binary STL: 80 byte header + 4 byte triangle count
    const triangleCount = view.getUint32(84, true);
    if (triangleCount === 0) return null;

    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    for (let i = 0; i < triangleCount; i++) {
      const offset = 84 + 4 + i * 50;
      // Skip normal (12 bytes), then 3 vertices (36 bytes)
      for (let v = 0; v < 3; v++) {
        const x = view.getFloat32(offset + 12 + v * 12, true);
        const y = view.getFloat32(offset + 12 + v * 12 + 4, true);
        const z = view.getFloat32(offset + 12 + v * 12 + 8, true);
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
      }
    }

    return {
      width: Math.round((maxX - minX) * 10) / 10,
      depth: Math.round((maxY - minY) * 10) / 10,
      height: Math.round((maxZ - minZ) * 10) / 10,
    };
  } catch {
    return null;
  }
}

export function useTextToCAD(): UseTextToCADResult {
  const [scadCode, setScadCode] = useState<string | null>(null);
  const [stlBuffer, setStlBuffer] = useState<ArrayBuffer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);

  const { compileScad, isCompiling, stlBuffer: workerStlBuffer, error: compileError, reset: resetWorker } = useOpenSCAD();

  // Watch for worker results
  const [waitingForCompile, setWaitingForCompile] = useState(false);

  // Use effect to process worker output
  const processWorkerOutput = useCallback(() => {
    if (!waitingForCompile) return;

    if (workerStlBuffer && !compileError) {
      setStlBuffer(workerStlBuffer);
      setDimensions(parseDimensionsFromSTL(workerStlBuffer));
      setWaitingForCompile(false);
      setIsLoading(false);
    } else if (compileError && !isCompiling) {
      setError(`Compilation failed: ${compileError.message}`);
      setWaitingForCompile(false);
      setIsLoading(false);
    }
  }, [waitingForCompile, workerStlBuffer, compileError, isCompiling]);

  // Run on each render when waiting
  if (waitingForCompile) {
    processWorkerOutput();
  }

  const generate = useCallback(async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    setScadCode(null);
    setStlBuffer(null);
    setDimensions(null);
    resetWorker();

    let generatedCode: string | null = null;

    // Step 1: Generate OpenSCAD code via API
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, previousError: attempt > 0 ? 'Previous code failed to compile.' : undefined }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || `API error: ${response.status}`);
        }

        const data = await response.json();
        generatedCode = stripCodeFences(data.scadCode);

        if (!generatedCode || generatedCode.length < 10) {
          throw new Error("Couldn't generate valid OpenSCAD code. Try rephrasing.");
        }

        setScadCode(generatedCode);
        break;
      } catch (err) {
        if (attempt === 2) {
          const msg = err instanceof Error ? err.message : 'Failed to generate code';
          setError(msg);
          setIsLoading(false);
          return;
        }
        // Retry
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    if (!generatedCode) return;

    // Step 2: Compile with OpenSCAD WASM
    try {
      setWaitingForCompile(true);
      await compileScad(generatedCode);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Compilation failed';
      setError(msg);
      setIsLoading(false);
      setWaitingForCompile(false);
    }
  }, [compileScad, resetWorker]);

  const reset = useCallback(() => {
    setScadCode(null);
    setStlBuffer(null);
    setIsLoading(false);
    setError(null);
    setDimensions(null);
    setWaitingForCompile(false);
    resetWorker();
  }, [resetWorker]);

  return {
    generate,
    scadCode,
    stlBuffer: stlBuffer || (workerStlBuffer ? workerStlBuffer : null),
    isLoading: isLoading || isCompiling,
    isCompiling,
    error: error || (compileError?.message ?? null),
    dimensions,
    reset,
  };
}
