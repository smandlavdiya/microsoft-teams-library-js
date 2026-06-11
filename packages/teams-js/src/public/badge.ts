/**
 * Module for managing the app icon badge count.
 *
 * Controls the numeric badge displayed on the app icon in the device's home screen
 * or app launcher. Useful for showing unread counts, pending items, etc.
 *
 * @module
 */

import { sendMessageToParentAsync } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { errorNotSupportedOnPlatform } from './constants';
import { runtime } from './runtime';

const badgeTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * Sets the app icon badge count.
 *
 * @param count - The number to display on the badge. Must be >= 0.
 *               Setting to 0 clears the badge.
 * @returns A Promise that resolves when the badge is updated.
 * @throws Error if the capability is not supported.
 *
 * @example
 * ```typescript
 * // Show 3 unread messages
 * await badge.setCount(3);
 *
 * // Clear the badge
 * await badge.setCount(0);
 * ```
 */
export async function setCount(count: number): Promise<void> {
  ensureInitialized(runtime);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  await sendMessageToParentAsync(
    getApiVersionTag(badgeTelemetryVersionNumber, 'badge.setCount' as ApiName),
    'badge.setCount',
    [count],
  );
}

/**
 * Clears the app icon badge (sets count to 0).
 *
 * @returns A Promise that resolves when the badge is cleared.
 * @throws Error if the capability is not supported.
 *
 * @example
 * ```typescript
 * await badge.clear();
 * ```
 */
export async function clear(): Promise<void> {
  ensureInitialized(runtime);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  await sendMessageToParentAsync(
    getApiVersionTag(badgeTelemetryVersionNumber, 'badge.clear' as ApiName),
    'badge.clear',
    [],
  );
}

/**
 * Checks if the badge capability is supported by the host.
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.badge !== undefined;
}
