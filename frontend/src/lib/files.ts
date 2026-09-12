/**
 * Reads a File into an ArrayBuffer.
 *
 * `File.prototype.arrayBuffer` is missing in a few environments (older Safari,
 * some test runners), so this falls back to FileReader instead of throwing.
 */
export async function readFileBytes(file: File): Promise<ArrayBuffer> {
  if (typeof file.arrayBuffer === 'function') {
    return file.arrayBuffer();
  }

  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (result instanceof ArrayBuffer) {
        resolve(result);
      } else {
        reject(new Error('The file could not be read.'));
      }
    };
    reader.onerror = () => reject(new Error('The file could not be read.'));
    reader.readAsArrayBuffer(file);
  });
}
