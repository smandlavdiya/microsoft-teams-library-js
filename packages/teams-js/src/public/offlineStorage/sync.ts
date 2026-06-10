/**
 * Module for controlling and monitoring the synchronization engine in offline storage.
 * The sync module provides APIs to trigger sync operations, monitor status, and handle conflicts.
 *
 * @beta
 * @module
 */

import { sendAndHandleSdkError, sendAndUnwrap } from '../../internal/communication';
import { registerHandler } from '../../internal/handlers';
import { ensureInitialized } from '../../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../../internal/telemetry';
import { errorNotSupportedOnPlatform, FrameContexts } from '../constants';
import { runtime } from '../runtime';

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const syncTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * Represents the overall synchronization status
 *
 * @beta
 */
export enum SyncState {
  /** Sync engine is idle, no operations in progress */
  Idle = 'idle',
  /** Sync engine is actively uploading/downloading records */
  Syncing = 'syncing',
  /** Sync engine is waiting for network connectivity */
  WaitingForNetwork = 'waitingForNetwork',
  /** Sync engine encountered an error */
  Error = 'error',
}

/**
 * Detailed sync status information
 *
 * @beta
 */
export interface SyncStatus {
  /** Current state of the sync engine */
  state: SyncState;
  /** Timestamp of the last successful sync */
  lastSyncAt?: number;
  /** Number of records pending upload */
  pendingUploadCount: number;
  /** Number of records pending download */
  pendingDownloadCount: number;
  /** Whether the device currently has network connectivity */
  isOnline: boolean;
  /** Error message if state is Error */
  error?: string;
}

/**
 * Result of a manually triggered sync operation
 *
 * @beta
 */
export interface SyncResult {
  /** Whether the sync operation completed successfully */
  success: boolean;
  /** Number of records uploaded to the server */
  uploadedCount: number;
  /** Number of records downloaded from the server */
  downloadedCount: number;
  /** Number of conflicts encountered during sync */
  conflictCount: number;
  /** Timestamp when this sync completed */
  completedAt: number;
}

/**
 * Strategy for resolving conflicts between client and server versions
 *
 * @beta
 */
export enum ConflictStrategy {
  /** Server version always wins (default) */
  ServerWins = 'serverWins',
  /** Client version always wins */
  ClientWins = 'clientWins',
  /** Escalate to the application layer for manual resolution */
  Manual = 'manual',
}

/**
 * Information about a sync conflict
 *
 * @beta
 */
export interface ConflictInfo {
  /** The schema identifier of the conflicting record */
  schemaId: string;
  /** The record identifier */
  recordId: string;
  /** The client version of the data */
  clientData: Record<string, unknown>;
  /** The server version of the data */
  serverData: Record<string, unknown>;
  /** Client-side version number */
  clientVersion: number;
  /** Server-side version number */
  serverVersion: number;
}

/**
 * Handler invoked when the sync status changes
 *
 * @beta
 */
export type SyncStatusChangeHandler = (status: SyncStatus) => void;

/**
 * Handler invoked when a sync conflict is detected and the strategy is Manual
 *
 * @beta
 */
export type SyncConflictHandler = (conflict: ConflictInfo) => void;

/**
 * Triggers an immediate synchronization operation
 *
 * @returns A promise that resolves to the sync result when the operation completes
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 * @throws Error if the offlineStorage capability is not supported
 *
 * @beta
 */
export function trigger(): Promise<SyncResult> {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  return sendAndUnwrap(
    getApiVersionTag(syncTelemetryVersionNumber, ApiName.OfflineStorage_Sync_Trigger),
    'offlineStorage.sync.trigger',
  );
}

/**
 * Gets the current synchronization status
 *
 * @returns A promise that resolves to the current sync status
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 * @throws Error if the offlineStorage capability is not supported
 *
 * @beta
 */
export function getStatus(): Promise<SyncStatus> {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  return sendAndUnwrap(
    getApiVersionTag(syncTelemetryVersionNumber, ApiName.OfflineStorage_Sync_GetStatus),
    'offlineStorage.sync.getStatus',
  );
}

/**
 * Sets the conflict resolution strategy for a given schema
 *
 * @param schemaId - The schema identifier to configure
 * @param strategy - The conflict resolution strategy to use
 * @returns A promise that resolves when the strategy has been set
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 * @throws Error if the offlineStorage capability is not supported
 *
 * @beta
 */
export function setConflictStrategy(schemaId: string, strategy: ConflictStrategy): Promise<void> {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  return sendAndHandleSdkError(
    getApiVersionTag(syncTelemetryVersionNumber, ApiName.OfflineStorage_Sync_SetConflictStrategy),
    'offlineStorage.sync.setConflictStrategy',
    schemaId,
    strategy,
  );
}

/**
 * Resolves a conflict by choosing either the client or server version
 *
 * @param schemaId - The schema identifier of the conflicting record
 * @param recordId - The record identifier
 * @param resolution - Whether to keep the client or server version
 * @returns A promise that resolves when the conflict has been resolved
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 * @throws Error if the offlineStorage capability is not supported
 *
 * @beta
 */
export function resolveConflict(
  schemaId: string,
  recordId: string,
  resolution: 'client' | 'server',
): Promise<void> {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  return sendAndHandleSdkError(
    getApiVersionTag(syncTelemetryVersionNumber, ApiName.OfflineStorage_Sync_ResolveConflict),
    'offlineStorage.sync.resolveConflict',
    schemaId,
    recordId,
    resolution,
  );
}

/**
 * Registers a handler to be called when the sync status changes
 *
 * @param handler - The handler function to invoke on status changes
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 * @throws Error if the offlineStorage capability is not supported
 *
 * @beta
 */
export function registerOnStatusChangeHandler(handler: SyncStatusChangeHandler): void {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  registerHandler(
    getApiVersionTag(syncTelemetryVersionNumber, ApiName.OfflineStorage_Sync_RegisterOnStatusChangeHandler),
    'offlineStorage.sync.onStatusChange',
    handler,
  );
}

/**
 * Registers a handler to be called when a sync conflict is detected.
 * This handler is only invoked when the conflict strategy is set to {@link ConflictStrategy.Manual}.
 *
 * @param handler - The handler function to invoke when a conflict occurs
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 * @throws Error if the offlineStorage capability is not supported
 *
 * @beta
 */
export function registerOnConflictHandler(handler: SyncConflictHandler): void {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  registerHandler(
    getApiVersionTag(syncTelemetryVersionNumber, ApiName.OfflineStorage_Sync_RegisterOnConflictHandler),
    'offlineStorage.sync.onConflict',
    handler,
  );
}

/**
 * Checks if the offlineStorage.sync capability is supported by the host
 * @returns boolean to represent whether the offlineStorage.sync capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @beta
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.offlineStorage?.sync !== undefined;
}
