import { environment } from '../environments/environment';

export function backendUrl(path?: string): string {
  if (!path) {
    return environment.apiBaseUrl;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${environment.apiBaseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
