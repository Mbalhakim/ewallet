/**
 * This function is specifically made for testing with the emulator.
 * It will check if the given client is a localhost instance. If it is,
 * it will be replaced with '10.0.2.2' to allow it to function on the emulator.
 */
export function localhostConverter(client_id: string, uri: string): string {
  if (client_id.includes('localhost')) {
    uri = uri.replace('localhost', '10.0.2.2');
  }
  return uri
}