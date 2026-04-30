export enum WorkerMessageType {
  PREVIEW = 'preview',
  EXPORT = 'export',
  FS_READ = 'fs.read',
  FS_WRITE = 'fs.write',
  FS_UNLINK = 'fs.unlink',
}

export interface OpenSCADParameter {
  name: string;
  type: string;
  value: string | number | boolean | string[] | number[] | boolean[];
  defaultValue?: string | number | boolean | string[] | number[] | boolean[];
}

export interface OpenSCADWorkerMessageData {
  code: string;
  params: OpenSCADParameter[];
  fileType: string;
}

export interface FileSystemWorkerMessageData {
  path: string;
  content?: ArrayBuffer | File;
  type?: string;
}

export interface OpenSCADWorkerResponseData {
  output?: Uint8Array;
  exitCode: number;
  duration: number;
  log: { stdErr: string[]; stdOut: string[] };
  fileType: string;
  extraOutputs?: Record<string, Uint8Array>;
}

export interface WorkerMessage {
  type: WorkerMessageType;
  data: OpenSCADWorkerMessageData | FileSystemWorkerMessageData;
}

export interface WorkerResponseMessage {
  id?: string;
  type: WorkerMessageType;
  data: OpenSCADWorkerResponseData | FileSystemWorkerMessageData | boolean | null;
  err?: Error | { name: string; message: string; code?: string; stdErr?: string[] };
}
