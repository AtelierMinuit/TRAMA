import { invoke } from "@tauri-apps/api/core";

export function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export async function readFileBytes(path: string): Promise<Uint8Array> {
  const value = await invoke<unknown>("read_file_bytes", { path });
  if (!Array.isArray(value) || value.some((item) => typeof item !== "number")) {
    throw new Error("La aplicación recibió un archivo inválido desde el selector nativo.");
  }
  return new Uint8Array(value as number[]);
}

export async function writeFileBytes(path: string, bytes: Uint8Array): Promise<void> {
  await invoke("write_file_bytes", { path, data: Array.from(bytes) });
}
