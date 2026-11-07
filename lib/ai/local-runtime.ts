export type LocalRuntime = {
  generate: (prompt: string, onToken: (token: string) => void) => Promise<void>;
};

let runtime: LocalRuntime | null = null;

/** Register an ExecuTorch or ONNX implementation. None is bundled. */
export function setLocalRuntime(next: LocalRuntime | null) {
  runtime = next;
}

export function getLocalRuntime(): LocalRuntime | null {
  return runtime;
}
