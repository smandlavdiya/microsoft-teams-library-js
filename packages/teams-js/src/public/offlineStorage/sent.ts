/**
 * Module for managing synchronized copies of successfully uploaded records.
 * Sent records are confirmation copies that have been synced to the server.
 *
 * @beta
 * @module
 */

import { sendAndHandleSdkError, sendAndUnwrap } from '../../internal/communication';
import { ensureInitialized } from '../../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../../internal/telemetry';
import { errorNotSupportedOnPlatform, FrameContexts } from '../constants';
import { runtime } from '../runtime';
import { OfflineRecord, QueryOptions, PaginatedResult } from './offlineStorage';

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const sentTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * Retrieves a single sent record by its identifier
 *
 * @param schemaId - The schema identifier for this record
 * @param id - The unique identifier of the sent record to retrieve
 * @returns A promise that resolves to the sent record
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
    getApiVersionTag(sentTelemetryVersionNumber, ApiName.OfflineStorage_Sent_Get),
    'offlineStorage.sent.get',
    schemaId,
    id,
  );
}

/**
 * Queries sent records with optional filtering and pagination
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
    getApiVersionTag(sentTelemetryVersionNumber, ApiName.OfflineStorage_Sent_Query),
    'offlineStorage.sent.query',
    schemaId,
    options,
  );
}

/**
 * Lists sent records that were synced after a given timestamp
 *
 * @param schemaId - The schema identifier to list sent records for
 * @param since - Unix timestamp in milliseconds; only records synced after this time will be returned
 * @returns A promise that resolves to an array of sent records
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 * @throws Error if the offlineStorage capability is not supported
 *
 * @beta
 */
export function listSince(schemaId: string, since: number): Promise<OfflineRecord[]> {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  return sendAndUnwrap(
    getApiVersionTag(sentTelemetryVersionNumber, ApiName.OfflineStorage_Sent_ListSince),
    'offlineStorage.sent.listSince',
    schemaId,
    since,
  );
}

/**
 * Removes sent records older than the specified timestamp to free up storage space
 *
 * @param schemaId - The schema identifier to purge records from
 * @param olderThan - Unix timestamp in milliseconds; records synced before this time will be removed
 * @returns A promise that resolves to the number of records purged
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 * @throws Error if the offlineStorage capability is not supported
 *
 * @beta
 */
export function purge(schemaId: string, olderThan: number): Promise<number> {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  return sendAndUnwrap(
    getApiVersionTag(sentTelemetryVersionNumber, ApiName.OfflineStorage_Sent_Purge),
    'offlineStorage.sent.purge',
    schemaId,
    olderThan,
  );
}

/**
 * Checks if the offlineStorage.sent capability is supported by the host
 * @returns boolean to represent whether the offlineStorage.sent capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @beta
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.offlineStorage?.sent !== undefined;
}
