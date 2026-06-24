/**
 * Module for managing server-owned inbox records in offline storage.
 * Inbox records are received from the server and are read-only on the client.
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
import { OfflineRecord, PaginatedResult, QueryOptions } from './offlineStorage';

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const inboxTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * Handler invoked when new records arrive in the inbox from the server
 *
 * @beta
 */
export type InboxUpdateHandler = (schemaId: string, records: OfflineRecord[]) => void;

/**
 * Retrieves a single inbox record by its identifier
 *
 * @param schemaId - The schema identifier for this record
 * @param id - The unique identifier of the inbox record to retrieve
 * @returns A promise that resolves to the inbox record
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 * @throws Error if the offlineStorage capability is not supported
 *
 * @beta
 */
export function get(schemaId: string, id: string): Promise<OfflineRecord> {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  return sendAndUnwrap(
    getApiVersionTag(inboxTelemetryVersionNumber, ApiName.OfflineStorage_Inbox_Get),
    'offlineStorage.inbox.get',
    schemaId,
    id,
  );
}

/**
 * Queries inbox records with optional filtering and pagination
 *
 * @param schemaId - The schema identifier to query
 * @param options - Optional query parameters including filters, sorting, and pagination
 * @returns A promise that resolves to a paginated result set
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 * @throws Error if the offlineStorage capability is not supported
 *
 * @beta
 */
export function query(schemaId: string, options?: QueryOptions): Promise<PaginatedResult> {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  return sendAndUnwrap(
    getApiVersionTag(inboxTelemetryVersionNumber, ApiName.OfflineStorage_Inbox_Query),
    'offlineStorage.inbox.query',
    schemaId,
    options,
  );
}

/**
 * Returns the count of inbox records for a given schema, optionally filtered
 *
 * @param schemaId - The schema identifier to count records for
 * @param options - Optional query filters
 * @returns A promise that resolves to the number of matching inbox records
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 * @throws Error if the offlineStorage capability is not supported
 *
 * @beta
 */
export function getCount(schemaId: string, options?: QueryOptions): Promise<number> {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  return sendAndUnwrap(
    getApiVersionTag(inboxTelemetryVersionNumber, ApiName.OfflineStorage_Inbox_GetCount),
    'offlineStorage.inbox.getCount',
    schemaId,
    options,
  );
}

/**
 * Marks one or more inbox records as read
 *
 * @param schemaId - The schema identifier for the records
 * @param ids - Array of record identifiers to mark as read
 * @returns A promise that resolves when the operation is complete
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 * @throws Error if the offlineStorage capability is not supported
 *
 * @beta
 */
export function markAsRead(schemaId: string, ids: string[]): Promise<void> {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  return sendAndHandleSdkError(
    getApiVersionTag(inboxTelemetryVersionNumber, ApiName.OfflineStorage_Inbox_MarkAsRead),
    'offlineStorage.inbox.markAsRead',
    schemaId,
    ids,
  );
}

/**
 * Registers a handler to be called when new records arrive in the inbox
 *
 * @param handler - The handler function to invoke when inbox updates arrive
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 * @throws Error if the offlineStorage capability is not supported
 *
 * @beta
 */
export function registerOnUpdateHandler(handler: InboxUpdateHandler): void {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  registerHandler(
    getApiVersionTag(inboxTelemetryVersionNumber, ApiName.OfflineStorage_Inbox_RegisterOnUpdateHandler),
    'offlineStorage.inbox.onUpdate',
    handler,
  );
}

/**
 * Checks if the offlineStorage.inbox capability is supported by the host
 * @returns boolean to represent whether the offlineStorage.inbox capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @beta
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.offlineStorage?.inbox !== undefined;
}
