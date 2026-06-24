/**
 * Module for managing client-owned draft records in offline storage.
 * Drafts are records created locally that have not yet been submitted for synchronization.
 *
 * @beta
 * @module
 */

import { sendAndHandleSdkError, sendAndUnwrap } from '../../internal/communication';
import { ensureInitialized } from '../../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../../internal/telemetry';
import { errorNotSupportedOnPlatform, FrameContexts } from '../constants';
import { runtime } from '../runtime';
import { OfflineRecord, PaginatedResult, QueryOptions } from './offlineStorage';

/**
 * Result returned when a new draft record is created.
 * @beta
 */
export interface DraftCreateResult {
  /** The generated unique identifier for the created draft record. */
  id: string;
}

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const draftsTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * Creates a new draft record in offline storage
 *
 * @param schemaId - The schema identifier for this record
 * @param data - The record data conforming to the schema definition
 * @returns A promise that resolves to an object containing the generated record id
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 * @throws Error if the offlineStorage capability is not supported
 *
 * @beta
 */
export function create(schemaId: string, data: Record<string, unknown>): Promise<DraftCreateResult> {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  return sendAndUnwrap(
    getApiVersionTag(draftsTelemetryVersionNumber, ApiName.OfflineStorage_Drafts_Create),
    'offlineStorage.drafts.create',
    schemaId,
    data,
  );
}

/**
 * Updates an existing draft record
 *
 * @param schemaId - The schema identifier for this record
 * @param id - The unique identifier of the draft to update
 * @param data - Partial record data to merge into the existing draft
 * @returns A promise that resolves when the update is complete
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 * @throws Error if the offlineStorage capability is not supported
 *
 * @beta
 */
export function update(schemaId: string, id: string, data: Partial<Record<string, unknown>>): Promise<void> {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  return sendAndHandleSdkError(
    getApiVersionTag(draftsTelemetryVersionNumber, ApiName.OfflineStorage_Drafts_Update),
    'offlineStorage.drafts.update',
    schemaId,
    id,
    data,
  );
}

/**
 * Retrieves a single draft record by its identifier
 *
 * @param schemaId - The schema identifier for this record
 * @param id - The unique identifier of the draft to retrieve
 * @returns A promise that resolves to the draft record
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
    getApiVersionTag(draftsTelemetryVersionNumber, ApiName.OfflineStorage_Drafts_Get),
    'offlineStorage.drafts.get',
    schemaId,
    id,
  );
}

/**
 * Queries draft records with optional filtering and pagination
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
    getApiVersionTag(draftsTelemetryVersionNumber, ApiName.OfflineStorage_Drafts_Query),
    'offlineStorage.drafts.query',
    schemaId,
    options,
  );
}

/**
 * Deletes a draft record from offline storage
 *
 * @param schemaId - The schema identifier for this record
 * @param id - The unique identifier of the draft to delete
 * @returns A promise that resolves when the deletion is complete
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 * @throws Error if the offlineStorage capability is not supported
 *
 * @beta
 */
export function remove(schemaId: string, id: string): Promise<void> {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  return sendAndHandleSdkError(
    getApiVersionTag(draftsTelemetryVersionNumber, ApiName.OfflineStorage_Drafts_Remove),
    'offlineStorage.drafts.remove',
    schemaId,
    id,
  );
}

/**
 * Submits a draft record for synchronization, moving it to the outbox
 *
 * @param schemaId - The schema identifier for this record
 * @param id - The unique identifier of the draft to submit
 * @returns A promise that resolves when the record has been moved to the outbox
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 * @throws Error if the offlineStorage capability is not supported
 *
 * @beta
 */
export function submit(schemaId: string, id: string): Promise<void> {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  return sendAndHandleSdkError(
    getApiVersionTag(draftsTelemetryVersionNumber, ApiName.OfflineStorage_Drafts_Submit),
    'offlineStorage.drafts.submit',
    schemaId,
    id,
  );
}

/**
 * Checks if the offlineStorage.drafts capability is supported by the host
 * @returns boolean to represent whether the offlineStorage.drafts capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @beta
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.offlineStorage?.drafts !== undefined;
}
