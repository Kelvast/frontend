interface ImportMeta {
  readonly hot?: {
    accept(cb?: () => void): void;
    accept(deps: readonly string[], cb: (updatedDeps: unknown[]) => void): void;
    dispose(cb: () => void): void;
  };
}

interface RequireContext {
  keys(): string[];
  (id: string): any;
  resolve(id: string): string;
  id: string;
}

interface Require {
  context(directory: string, useSubdirectories: boolean, regExp: RegExp): RequireContext;
}

declare const require: Require;
