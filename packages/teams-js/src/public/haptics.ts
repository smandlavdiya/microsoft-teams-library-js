/**
 * Module for triggering native haptic feedback.
 *
 * Provides access to the device's haptic engine (Taptic Engine on iOS,
 * vibration motor on Android) for tactile responses to user actions.
 *
 * @module
 */

import { sendMessageToParentAsync } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { errorNotSupportedOnPlatform } from './constants';
import { runtime } from './runtime';

const hapticsTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * The type of haptic feedback to trigger.
 *
 * - `success` — Indicates a successful action (e.g., payment confirmed)
 * - `error` — Indicates a failure (e.g., transaction declined)
 * - `warning` — Indicates a cautionary state (e.g., low balance)
 * - `impact` — A physical impact feel (e.g., button press, drag snap)
 * - `selection` — A light tick for selection changes (e.g., picker scroll)
 */
export type HapticType = 'success' | 'error' | 'warning' | 'impact' | 'selection';

/**
 * Triggers a haptic vibration on the device.
 *
 * @param type - The type of haptic feedback. Defaults to "impact" if not specified.
 * @returns A Promise that resolves when the haptic has been triggered.
 * @throws Error if the capability is not supported.
 *
 * @example
 * ```typescript
 * // On successful payment
 * await haptics.vibrate('success');
 *
 * // On form validation error
 * await haptics.vibrate('error');
 *
 * // On picker value change
 * await haptics.vibrate('selection');
 * ```
 */
export async function vibrate(type: HapticType = 'impact'): Promise<void> {
  ensureInitialized(runtime);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  await sendMessageToParentAsync(
    getApiVersionTag(hapticsTelemetryVersionNumber, 'haptics.vibrate' as ApiName),
    'haptics.vibrate',
    [{ type }],
  );
}

/**
 * Checks if the haptics capability is supported by the host.
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.haptics !== undefined;
}
