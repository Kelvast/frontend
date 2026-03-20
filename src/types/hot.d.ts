interface ImportMeta {
  readonly hot?: {
    accept(cb?: () => void): void;
    accept(deps: readonly string[], cb: (updatedDeps: unknown[]) => void): void;
    dispose(cb: () => void): void;
  };
}
