/**
 * Module to interact with the security-specific part of the SDK.
 *
 * Provides re-authentication for sensitive actions and biometric availability checks.
 * The native host handles the biometric/passcode prompt and returns the result.
 *
 * @module
 */

import { sendAndUnwrap, sendMessageToParentAsync } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { errorNotSupportedOnPlatform } from './constants';
import { runtime } from './runtime';

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const securityTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * Parameters for requesting re-authentication.
 */
export interface ReauthenticateParameters {
  /** Reason displayed to the user explaining why authentication is needed. */
  reason?: string;
}

/**
 * Result returned from a successful re-authentication.
 */
export interface ReauthenticateResult {
  /** Whether the authentication was successful. */
  success: boolean;
}

/**
 * Information about the device's biometric capabilities.
 */
export interface BiometricAvailability {
  /** Whether biometric authentication is available on the device. */
  available: boolean;
  /** The type of biometric available: "faceId", "touchId", "biometric", or "none". */
  type: string;
}

/**
 * Triggers a native biometric/passcode re-authentication prompt for sensitive operations.
 *
 * Use this before performing high-risk actions such as:
 * - Financial transfers
 * - Changing security settings
 * - Viewing sensitive personal data
 * - Approving important requests
 *
 * @param params - Optional parameters including a reason string displayed to the user.
 * @returns A Promise that resolves with the authentication result if successful.
 * @throws Error if the user cancels or fails authentication, or if the capability is not supported.
 *
 * @example
 * ```typescript
 * import { security } from '@anthropic/teams-js';
 *
 * try {
 *   const result = await security.reauthenticate({ reason: 'Confirm transfer of $500' });
 *   if (result.success) {
 *     // Proceed with sensitive action
 *   }
 * } catch (error) {
 *   // User cancelled or failed authentication
 * }
 * ```
 */
export async function reauthenticate(params?: ReauthenticateParameters): Promise<ReauthenticateResult> {
  ensureInitialized(runtime);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }

  const apiVersionTag = getApiVersionTag(securityTelemetryVersionNumber, 'security.reauthenticate' as ApiName);
  const args = params ? [params] : [];

  const [result] = await sendMessageToParentAsync<[ReauthenticateResult]>(
    apiVersionTag,
    'security.reauthenticate',
    args,
  );
  return result;
}

/**
 * Checks whether biometric authentication is available on the current device.
 *
 * @returns A Promise that resolves with biometric availability information.
 * @throws Error if the capability is not supported or app is not initialized.
 *
 * @example
 * ```typescript
 * import { security } from '@anthropic/teams-js';
 *
 * const biometric = await security.isBiometricAvailable();
 * if (biometric.available) {
 *   console.log(`Biometric type: ${biometric.type}`); // "faceId", "touchId", etc.
 * }
 * ```
 */
export async function isBiometricAvailable(): Promise<BiometricAvailability> {
  ensureInitialized(runtime);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }

  const apiVersionTag = getApiVersionTag(
    securityTelemetryVersionNumber,
    'security.isBiometricAvailable' as ApiName,
  );

  return sendAndUnwrap<BiometricAvailability>(apiVersionTag, 'security.isBiometricAvailable');
}

/**
 * Checks if the security capability is supported by the host.
 *
 * @returns `true` if the host supports security operations (re-authentication, biometric checks).
 * @throws Error if {@linkcode app.initialize} has not successfully completed.
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.security !== undefined;
}
