/**
 * Module for launching external apps and receiving results.
 *
 * Provides a generic mechanism to:
 * - Launch another app with parameters and wait for a result
 * - Open another app (fire-and-forget)
 * - Check if a target app is installed
 *
 * @module
 */

import { sendAndUnwrap } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { errorNotSupportedOnPlatform } from './constants';
import { runtime } from './runtime';

const externalAppTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * Android-specific intent configuration.
 */
export interface AndroidIntentConfig {
  /** Intent action (e.g., "android.intent.action.VIEW") */
  action?: string;
  /** Target package name (e.g., "com.example.app") */
  package?: string;
  /** Intent data URI (e.g., "upi://pay?...") */
  data?: string;
  /** MIME type (e.g., "application/json") */
  type?: string;
  /** Intent category */
  category?: string;
  /** Extra key-value pairs to pass with the intent */
  extras?: Record<string, string | number | boolean>;
}

/**
 * iOS-specific URL scheme configuration.
 */
export interface IOSUrlConfig {
  /** URL scheme to open (e.g., "exampleapp://action?param=value") */
  url: string;
  /** Callback URL that the external app redirects back to (default: "org.jevelin.app://externalapp-callback") */
  callbackUrl?: string;
}

/**
 * Parameters for launching an external app.
 */
export interface ExternalAppLaunchParams {
  /** Android-specific intent configuration */
  android?: AndroidIntentConfig;
  /** iOS-specific URL configuration */
  ios?: IOSUrlConfig;
  /** Maximum time to wait for result in milliseconds (default: 60000, 0 = no timeout) */
  timeout?: number;
}

/**
 * Result from an external app launch.
 */
export interface ExternalAppResult {
  /** Whether the external app returned a successful result */
  success: boolean;
  /** Result data from the external app (key-value pairs) */
  data?: Record<string, string>;
  /** Error reason if success is false: "cancelled", "timeout", "not_installed" */
  error?: string;
}

/**
 * Result from checking if an app is installed.
 */
export interface ExternalAppInstalledResult {
  /** Whether the target app is currently installed on the user's device. */
  installed: boolean;
}

/**
 * Launches an external app and waits for a result.
 *
 * On Android, this uses `startActivityForResult` with the provided intent.
 * On iOS, this opens a URL scheme and waits for a callback URL redirect.
 *
 * @param params - Platform-specific launch parameters
 * @returns A Promise resolving with the result from the external app
 * @throws Error if the capability is not supported
 *
 * @example
 * ```typescript
 * // Launch a UPI payment app
 * const result = await externalApp.launch({
 *   android: {
 *     action: "android.intent.action.VIEW",
 *     data: "upi://pay?pa=merchant@upi&am=500"
 *   },
 *   ios: {
 *     url: "gpay://upi/pay?pa=merchant@upi&am=500",
 *     callbackUrl: "org.jevelin.app://payment-callback"
 *   },
 *   timeout: 120000
 * });
 *
 * if (result.success) {
 *   processPayment(result.data);
 * }
 * ```
 */
export async function launch(params: ExternalAppLaunchParams): Promise<ExternalAppResult> {
  ensureInitialized(runtime);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  return sendAndUnwrap<ExternalAppResult>(
    getApiVersionTag(externalAppTelemetryVersionNumber, 'externalApp.launch' as ApiName),
    'externalApp.launch',
    params,
  );
}

/**
 * Opens an external app without waiting for a result (fire-and-forget).
 *
 * @param params - Platform-specific open parameters
 * @returns A Promise resolving with success/failure of opening
 *
 * @example
 * ```typescript
 * await externalApp.open({
 *   android: { action: "android.intent.action.VIEW", data: "https://wa.me/919999" },
 *   ios: { url: "whatsapp://send?phone=919999" }
 * });
 * ```
 */
export async function open(params: ExternalAppLaunchParams): Promise<ExternalAppResult> {
  ensureInitialized(runtime);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  return sendAndUnwrap<ExternalAppResult>(
    getApiVersionTag(externalAppTelemetryVersionNumber, 'externalApp.open' as ApiName),
    'externalApp.open',
    params,
  );
}

/**
 * Checks if a target app is installed on the device.
 *
 * @param params - Platform-specific identifiers to check
 * @returns A Promise resolving with installation status
 *
 * @example
 * ```typescript
 * const { installed } = await externalApp.isInstalled({
 *   android: { package: "com.example.paymentapp" },
 *   ios: { url: "paymentapp://" }
 * });
 * ```
 */
export async function isInstalled(params: ExternalAppLaunchParams): Promise<ExternalAppInstalledResult> {
  ensureInitialized(runtime);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  return sendAndUnwrap<ExternalAppInstalledResult>(
    getApiVersionTag(externalAppTelemetryVersionNumber, 'externalApp.isInstalled' as ApiName),
    'externalApp.isInstalled',
    params,
  );
}

/**
 * Checks if the externalApp capability is supported by the host.
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.externalApp !== undefined;
}
