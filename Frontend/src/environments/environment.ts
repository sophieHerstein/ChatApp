const backendOrigin = window.location.origin;
const websocketProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

export const environment = {
  apiBaseUrl: backendOrigin,
  websocketUrl: `${websocketProtocol}//${window.location.host}/ws`,
};
