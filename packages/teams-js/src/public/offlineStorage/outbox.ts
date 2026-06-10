/**
 * Module for managing sync-owned outbox records in offline storage.
 * Outbox records are submitted drafts that are queued or in-progress for synchronization to the server.
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
import { OfflineRecord, RecordStatus } from './offlineStorage';

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const outboxTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * Summary information about the outbox state
 *
 * @beta
 */
export interface OutboxSummary {
  /** Total number of records in the outbox */
  totalCount: number;
  /** Number of records pending sync */
  pendingCount: number;
  /** Number of records currently syncing */
  syncingCount: number;
  /** Number of records that failed to sync */
  failedCount: number;
}

/**
 * An outbox entry with additional sync status information
 *
 * @beta
 */
export interface OutboxEntry {
  /** The offline record data */
  record: OfflineRecord;
  /** Number of sync retry attempts made */
  retryCount: number;
  /** Timestamp of the next scheduled retry, if applicable */
  nextRetryAt?: number;
}

/**
 * Handler invoked when the status of an outbox record changes
 *
 * @beta
 */
export type OutboxStatusChangeHandler = (schemaId: string, id: string, status: RecordStatus, error?: string) => void;

/**
 * Lists all outbox records for a given schema
 *
 * @param schemaId - The schema identifier to list outbox records for
 * @returns A promise that resolves to an array of outbox entries
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 * @throws Error if the offlineStorage capability is not supported
 *
 * @beta
 */
export function list(schemaId: string): Promise<OutboxEntry[]> {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  return sendAndUnwrap(
    getApiVersionTag(outboxTelemetryVersionNumber, ApiName.OfflineStorage_Outbox_List),
    'offlineStorage.outbox.list',
    schemaId,
  );
}

/**
 * Gets a summary of the outbox state across all schemas or for a specific schema
 *
 * @param schemaId - Optional schema identifier to get summary for. If omitted, returns summary across all schemas.
 * @returns A promise that resolves to an outbox summary
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 * @throws Error if the offlineStorage capability is not supported
 *
 * @beta
 */
export function getSummary(schemaId?: string): Promise<OutboxSummary> {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  return sendAndUnwrap(
    getApiVersionTag(outboxTelemetryVersionNumber, ApiName.OfflineStorage_Outbox_GetSummary),
    'offlineStorage.outbox.getSummary',
    schemaId,
  );
}

/**
 * Retries synchronization of a failed outbox record
 *
 * @param schemaId - The schema identifier for this record
 * @param id - The unique identifier of the outbox record to retry
 * @returns A promise that resolves when the record has been re-queued for sync
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 * @throws Error if the offlineStorage capability is not supported
 *
 * @beta
 */
export function retry(schemaId: string, id: string): Promise<void> {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  return sendAndHandleSdkError(
    getApiVersionTag(outboxTelemetryVersionNumber, ApiName.OfflineStorage_Outbox_Retry),
    'offlineStorage.outbox.retry',
    schemaId,
    id,
  );
}

/**
 * Cancels an outbox record, moving it back to drafts
 *
 * @param schemaId - The schema identifier for this record
 * @param id - The unique identifier of the outbox record to cancel
 * @returns A promise that resolves when the record has been moved back to drafts
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 * @throws Error if the offlineStorage capability is not supported
 *
 * @beta
 */
export function cancel(schemaId: string, id: string): Promise<void> {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  return sendAndHandleSdkError(
    getApiVersionTag(outboxTelemetryVersionNumber, ApiName.OfflineStorage_Outbox_Cancel),
    'offlineStorage.outbox.cancel',
    schemaId,
    id,
  );
}

/**
 * Registers a handler to be called when the status of an outbox record changes
 *
 * @param handler - The handler function to invoke on status changes
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 * @throws Error if the offlineStorage capability is not supported
 *
 * @beta
 */
export function registerOnStatusChangeHandler(handler: OutboxStatusChangeHandler): void {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  registerHandler(
    getApiVersionTag(outboxTelemetryVersionNumber, ApiName.OfflineStorage_Outbox_RegisterOnStatusChangeHandler),
    'offlineStorage.outbox.onStatusChange',
    handler,
  );
}

/**
 * Checks if the offlineStorage.outbox capability is supported by the host
 * @returns boolean to represent whether the offlineStorage.outbox capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @beta
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.offlineStorage?.outbox !== undefined;
}
