import { useState, useCallback, useRef, useEffect } from 'react';
import { WorkerMessage, WorkerMessageType } from '@/worker/types';

type PendingRequest = {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
};

export function useOpenSCAD() {
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState<Error | undefined>();
  const [stlBuffer, setStlBuffer] = useState<ArrayBuffer | undefined>();
  const workerRef = useRef<Worker | null>(null);
  const pendingRequestsRef = useRef<Map<string, PendingRequest>>(new Map());

  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL('../worker/worker.ts', import.meta.url),
        { type: 'module' },
      );
    }
    return workerRef.current;
  }, []);

  const eventHandler = useCallback((event: MessageEvent) => {
    const { id, type, err, data } = event.data;

    if (id && pendingRequestsRef.current.has(id)) {
      const pending = pendingRequestsRef.current.get(id)!;
      pendingRequestsRef.current.delete(id);
      if (err) {
        pending.reject(new Error(err.message || 'Worker operation failed'));
      } else {
        pending.resolve(data);
      }
      return;
    }

    if (type === WorkerMessageType.PREVIEW || type === WorkerMessageType.EXPORT) {
      if (err) {
        setError(new Error(err.message || 'Compilation failed'));
        setStlBuffer(undefined);
      } else if (data?.output) {
        const buffer = data.output.buffer as ArrayBuffer;
        setStlBuffer(buffer);
        setError(undefined);
      }
      setIsCompiling(false);
    }
  }, []);

  useEffect(() => {
    const worker = getWorker();
    worker.addEventListener('message', eventHandler);

    return () => {
      worker.removeEventListener('message', eventHandler);
      workerRef.current?.terminate();
      workerRef.current = null;
      pendingRequestsRef.current.forEach((pending) => {
        pending.reject(new Error('Worker terminated'));
      });
      pendingRequestsRef.current.clear();
    };
  }, [eventHandler, getWorker]);

  const compileScad = useCallback(async (code: string) => {
    setIsCompiling(true);
    setError(undefined);
    setStlBuffer(undefined);

    const worker = getWorker();

    const message: WorkerMessage = {
      type: WorkerMessageType.PREVIEW,
      data: {
        code,
        params: [],
        fileType: 'stl',
      },
    };

    worker.postMessage(message);
  }, [getWorker]);

  const reset = useCallback(() => {
    setStlBuffer(undefined);
    setError(undefined);
    setIsCompiling(false);
  }, []);

  return { compileScad, isCompiling, stlBuffer, error, reset };
}
