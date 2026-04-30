import { default as openscad } from '@/vendor/openscad-wasm/openscad.js';
import { ZipReader, BlobReader, Uint8ArrayWriter } from '@zip.js/zip.js';
import {
  FileSystemWorkerMessageData,
  OpenSCADWorkerMessageData,
  OpenSCADWorkerResponseData,
} from './types';

const fontsConf = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd">
<fontconfig></fontconfig>`;

const libraries = [
  { name: 'BOSL', url: '/libraries/BOSL.zip' },
  { name: 'BOSL2', url: '/libraries/BOSL2.zip' },
  { name: 'MCAD', url: '/libraries/MCAD.zip' },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OpenSCADInstance = any;

class WorkspaceFile extends File {
  path: string;
  constructor(chunks: BlobPart[], name: string, options?: FilePropertyBag & { path?: string }) {
    super(chunks, name, options);
    this.path = options?.path || name;
  }
}

class OpenSCADWrapper {
  log: { stdErr: string[]; stdOut: string[] } = { stdErr: [], stdOut: [] };
  files: WorkspaceFile[] = [];

  async getInstance(): Promise<OpenSCADInstance> {
    const instance = await openscad({
      noInitialRun: true,
      print: this.logger('stdOut'),
      printErr: this.logger('stdErr'),
    });

    try {
      this.createDirectoryRecursive(instance, 'fonts');
      instance.FS.writeFile('/fonts/fonts.conf', fontsConf);
    } catch (error) {
      console.error('Error setting up fonts', error);
    }

    for (const file of this.files) {
      if (file.path) {
        const pathParts = file.path.split('/');
        pathParts.pop();
        const dir = pathParts.join('/');
        if (dir && !this.fileExists(instance, dir)) {
          this.createDirectoryRecursive(instance, dir);
        }
        const content = await file.arrayBuffer();
        instance.FS.writeFile(file.path, new Int8Array(content));
      }
    }

    return instance;
  }

  fileExists(instance: OpenSCADInstance, path: string) {
    try {
      instance.FS.stat(path);
      return true;
    } catch {
      return false;
    }
  }

  createDirectoryRecursive(instance: OpenSCADInstance, path: string) {
    const parts = path.split('/');
    let currentPath = '';
    for (const part of parts) {
      currentPath += '/' + part;
      if (!this.fileExists(instance, currentPath)) {
        instance.FS.mkdir(currentPath);
      }
    }
  }

  logger = (type: 'stdErr' | 'stdOut') => (text: string) => {
    this.log[type].push(text);
  };

  async preview(data: OpenSCADWorkerMessageData): Promise<OpenSCADWorkerResponseData> {
    const exportParams = ['--backend=manifold', '--enable=lazy-union'];
    return await this.executeOpenscad(data.code, data.fileType, exportParams);
  }

  async exportFile(data: OpenSCADWorkerMessageData): Promise<OpenSCADWorkerResponseData> {
    const parameters = ['--export-format=binstl', '--enable=manifold', '--enable=fast-csg'];
    return await this.executeOpenscad(data.code, data.fileType, parameters);
  }

  async writeFile(data: FileSystemWorkerMessageData): Promise<boolean> {
    this.files = this.files.filter((file) => file.path !== data.path);
    if (data.content) {
      let workspaceFile: WorkspaceFile;
      if (data.content instanceof ArrayBuffer) {
        workspaceFile = new WorkspaceFile([data.content], data.path, {
          path: data.path,
          type: data.type || 'application/octet-stream',
        });
      } else {
        workspaceFile = new WorkspaceFile([data.content], (data.content as File).name || data.path, {
          path: data.path,
          type: (data.content as File).type || 'application/octet-stream',
        });
      }
      if (!workspaceFile.path) workspaceFile.path = data.path;
      this.files.push(workspaceFile);
    }
    return true;
  }

  async executeOpenscad(
    code: string,
    fileType: string,
    parameters: string[],
  ): Promise<OpenSCADWorkerResponseData> {
    const start = Date.now();
    this.log.stdErr = [];
    this.log.stdOut = [];

    const inputFile = '/input.scad';
    const outputFile = '/out.' + fileType;
    const instance = await this.getInstance();
    const importLibraries: string[] = [];

    instance.FS.writeFile(inputFile, code);
    if (!this.fileExists(instance, '/libraries')) {
      instance.FS.mkdir('/libraries');
    }

    for (const library of libraries) {
      if (code.includes(library.name) && !importLibraries.includes(library.name)) {
        importLibraries.push(library.name);
        try {
          const response = await fetch(library.url);
          const zip = await response.blob();
          const files = await new ZipReader(new BlobReader(zip)).getEntries();
          await Promise.all(
            files
              .filter((f) => !f.directory)
              .map(async (f) => {
                const writer = new Uint8ArrayWriter();
                if (!f.getData) throw new Error('getData is not defined');
                const blob = await f.getData(writer);
                const path = '/libraries/' + library.name + '/' + f.filename;
                const pathParts = path.split('/');
                pathParts.pop();
                const dir = pathParts.join('/');
                if (dir && !this.fileExists(instance, dir)) {
                  this.createDirectoryRecursive(instance, dir);
                }
                instance.FS.writeFile(path, new Int8Array(blob));
              }),
          );
        } catch (error) {
          console.error('Error importing library', library.name, error);
        }
      }
    }

    const args = [inputFile, '-o', outputFile, ...parameters];
    let exitCode: number;
    let output: Uint8Array | undefined;

    try {
      exitCode = instance.callMain(args);
    } catch (error) {
      throw new Error('OpenSCAD exited with an error: ' + (error instanceof Error ? error.message : 'unknown'));
    }

    if (exitCode === 0) {
      try {
        output = instance.FS.readFile(outputFile, { encoding: 'binary' });
      } catch (error) {
        throw new Error('Cannot read output file: ' + (error instanceof Error ? error.message : 'unknown'));
      }
    } else {
      const errMsg = this.log.stdErr.join('\n') || 'Compilation failed';
      throw new Error(errMsg);
    }

    return {
      output,
      exitCode,
      duration: Date.now() - start,
      log: this.log,
      fileType,
    };
  }
}

export default OpenSCADWrapper;
