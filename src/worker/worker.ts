import OpenSCADWrapper from './openSCAD';
import {
  FileSystemWorkerMessageData,
  OpenSCADWorkerMessageData,
  WorkerMessage,
  WorkerResponseMessage,
  WorkerMessageType,
} from './types';

const openscad = new OpenSCADWrapper();

self.onmessage = async (event: MessageEvent<WorkerMessage & { id: string }>) => {
  const { id, type, data } = event.data;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any = null;

    switch (type) {
      case WorkerMessageType.PREVIEW:
        result = await openscad.preview(data as OpenSCADWorkerMessageData);
        break;
      case WorkerMessageType.EXPORT:
        result = await openscad.exportFile(data as OpenSCADWorkerMessageData);
        break;
      case WorkerMessageType.FS_WRITE:
        result = await openscad.writeFile(data as FileSystemWorkerMessageData);
        break;
    }

    const response: WorkerResponseMessage = { id, type, data: result };
    self.postMessage(response);
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    const response: WorkerResponseMessage = { id, type, data: null, err };
    self.postMessage(response);
  }
};
