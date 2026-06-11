/**
 * Module for monitoring network connectivity status.
 *
 * Provides real-time network state (online/offline, WiFi/cellular) from the native layer,
 * which is more reliable than the browser's `navigator.onLine`.
 *
 * @module
 */

import { sendAndUnwrap, sendMessageToParentAsync } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { errorNotSupportedOnPlatform } from './constants';
import { runtime } from './runtime';

const connectivityTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * Network connectivity status.
 */
export interface ConnectivityStatus {
  /** Whether the device currently has internet connectivity. */
  connected: boolean;
  /** The type of network connection: "wifi", "cellular", "ethernet", "none", or "unknown". */
  type: 'wifi' | 'cellular' | 'ethernet' | 'none' | 'unknown';
}

/**
 * Gets the current network connectivity status.
 *
 * @returns A Promise resolving with the current connectivity status.
 * @throws Error if the capability is not supported.
 *
 * @example
 * ```typescript
 * const status = await connectivity.getStatus();
 * if (!status.connected) {
 *   showOfflineBanner();
 * }
 * ```
 */
export async function getStatus(): Promise<ConnectivityStatus> {
  ensureInitialized(runtime);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  return sendAndUnwrap<ConnectivityStatus>(
    getApiVersionTag(connectivityTelemetryVersionNumber, 'connectivity.getStatus' as ApiName),
    'connectivity.getStatus',
  );
}

/**
 * Registers a listener for connectivity status changes.
 * After registration, listen for the `connectivityStatusChange` CustomEvent on `window`.
 *
 * @returns A Promise that resolves when the listener is registered.
 *
 * @example
 * ```typescript
 * await connectivity.registerOnStatusChange();
 * window.addEventListener('connectivityStatusChange', (e: CustomEvent) => {
 *   const { connected, type } = e.detail;
 *   updateNetworkUI(connected, type);
 * });
 * ```
 */
export async function registerOnStatusChange(): Promise<void> {
  ensureInitialized(runtime);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  await sendMessageToParentAsync(
    getApiVersionTag(connectivityTelemetryVersionNumber, 'connectivity.registerOnStatusChange' as ApiName),
    'connectivity.registerOnStatusChange',
    [],
  );
}

/**
 * Checks if the connectivity capability is supported by the host.
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.connectivity !== undefined;
}
