/**
 * Module to interact with the offline storage capability of the host.
 * Provides a mail-like pattern with inbox, drafts, outbox, and sent boxes
 * for managing server-driven dynamic schemas with offline-first data persistence.
 *
 * @beta
 * @module
 */

import { sendAndHandleSdkError, sendAndUnwrap } from '../../internal/communication';
import { ensureInitialized } from '../../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../../internal/telemetry';
import { errorNotSupportedOnPlatform, FrameContexts } from '../constants';
import { runtime } from '../runtime';
import * as drafts from './drafts';
import * as inbox from './inbox';
import * as outbox from './outbox';
import * as sent from './sent';
import * as sync from './sync';

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const offlineStorageTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * Represents a field definition within a schema
 *
 * @beta
 */
export interface SchemaField {
  /** The name of the field */
  name: string;
  /** The data type of the field */
  type: 'text' | 'integer' | 'real' | 'boolean' | 'json' | 'blob_ref';
  /** Whether this field should be indexed for query performance */
  indexed?: boolean;
  /** Whether this field is required */
  required?: boolean;
  /** Default value for the field */
  defaultValue?: string | number | boolean;
}

/**
 * Represents a server-driven schema definition used to create storage tables dynamically
 *
 * @beta
 */
export interface SchemaDefinition {
  /** Unique identifier for this schema */
  schemaId: string;
  /** Version number of the schema, used for migrations */
  version: number;
  /** Human-readable display name for the schema */
  displayName?: string;
  /** Field definitions for this schema */
  fields: SchemaField[];
}

/**
 * Information about a registered schema
 *
 * @beta
 */
export interface SchemaInfo {
  /** Unique identifier for this schema */
  schemaId: string;
  /** Current version number */
  version: number;
  /** Human-readable display name */
  displayName?: string;
  /** Number of records across all boxes */
  recordCount: number;
}

/**
 * Result of a schema migration operation
 *
 * @beta
 */
export interface MigrationResult {
  /** Whether the migration completed successfully */
  success: boolean;
  /** The previous schema version */
  previousVersion: number;
  /** The new schema version */
  currentVersion: number;
  /** Fields that were added during migration */
  addedFields: string[];
  /** Fields that were deprecated during migration */
  deprecatedFields: string[];
}

/**
 * Represents a filter condition for querying records
 *
 * @beta
 */
export interface QueryFilter {
  /** Field name to filter on */
  field: string;
  /** Comparison operator */
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in';
  /** Value to compare against */
  value: string | number | boolean | string[] | number[];
}

/**
 * Options for paginated queries
 *
 * @beta
 */
export interface QueryOptions {
  /** Filters to apply */
  filters?: QueryFilter[];
  /** Field to sort by */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
  /** Maximum number of results to return */
  limit?: number;
  /** Number of results to skip */
  offset?: number;
}

/**
 * Paginated result set
 *
 * @beta
 */
export interface PaginatedResult<T = Record<string, unknown>> {
  /** The result items */
  items: T[];
  /** Total number of matching records */
  totalCount: number;
  /** Whether there are more results beyond this page */
  hasMore: boolean;
}

/**
 * The status of a record in the offline storage system
 *
 * @beta
 */
export enum RecordStatus {
  /** Record is a local draft, not yet submitted for sync */
  Draft = 'draft',
  /** Record is queued for sync */
  Pending = 'pending',
  /** Record is currently being synced */
  Syncing = 'syncing',
  /** Record has been successfully synced */
  Synced = 'synced',
  /** Record sync has failed */
  Failed = 'failed',
}

/**
 * The box (category) a record belongs to
 *
 * @beta
 */
export enum RecordBox {
  /** Server-owned records received from the server */
  Inbox = 'inbox',
  /** Client-owned records created locally but not yet submitted */
  Drafts = 'drafts',
  /** Sync-owned records submitted and queued/in-progress for upload */
  Outbox = 'outbox',
  /** Synchronized copy of successfully uploaded records */
  Sent = 'sent',
}

/**
 * Metadata fields attached to every record in offline storage
 *
 * @beta
 */
export interface RecordMetadata {
  /** Client-generated unique identifier */
  id: string;
  /** Which box this record belongs to */
  box: RecordBox;
  /** Current sync status */
  status: RecordStatus;
  /** Optimistic locking version (client-side) */
  version: number;
  /** Last known server version */
  serverVersion?: number;
  /** Timestamp when the record was created */
  createdAt: number;
  /** Timestamp when the record was last updated */
  updatedAt: number;
  /** Timestamp when the record was last synced */
  syncedAt?: number;
  /** Last sync error message, if any */
  error?: string;
}

/**
 * A record stored in offline storage, combining metadata with schema-driven data
 *
 * @beta
 */
export type OfflineRecord<T = Record<string, unknown>> = RecordMetadata & {
  /** The schema-driven data payload */
  data: T;
};

/**
 * Registers a new schema definition with the offline storage system.
 * The host will create the necessary storage structures to hold records of this schema.
 *
 * @param schema - The schema definition to register
 * @returns A promise that resolves when the schema has been registered
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 * @throws Error if the offlineStorage capability is not supported
 *
 * @beta
 */
export function registerSchema(schema: SchemaDefinition): Promise<void> {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  return sendAndHandleSdkError(
    getApiVersionTag(offlineStorageTelemetryVersionNumber, ApiName.OfflineStorage_RegisterSchema),
    'offlineStorage.registerSchema',
    schema,
  );
}

/**
 * Checks whether a schema with the given identifier is registered locally
 *
 * @param schemaId - The unique identifier of the schema to check
 * @returns A promise that resolves to `true` if the schema exists, `false` otherwise
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 * @throws Error if the offlineStorage capability is not supported
 *
 * @beta
 */
export function hasSchema(schemaId: string): Promise<boolean> {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  return sendAndUnwrap(
    getApiVersionTag(offlineStorageTelemetryVersionNumber, ApiName.OfflineStorage_HasSchema),
    'offlineStorage.hasSchema',
    schemaId,
  );
}

/**
 * Lists all schemas currently registered in the offline storage system
 *
 * @returns A promise that resolves to an array of schema information objects
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 * @throws Error if the offlineStorage capability is not supported
 *
 * @beta
 */
export function listSchemas(): Promise<SchemaInfo[]> {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  return sendAndUnwrap(
    getApiVersionTag(offlineStorageTelemetryVersionNumber, ApiName.OfflineStorage_ListSchemas),
    'offlineStorage.listSchemas',
  );
}

/**
 * Migrates an existing schema to a new version.
 * Added fields will be created, removed fields will be marked deprecated (not dropped).
 *
 * @param schema - The updated schema definition with an incremented version number
 * @returns A promise that resolves to the migration result
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 * @throws Error if the offlineStorage capability is not supported
 *
 * @beta
 */
export function migrateSchema(schema: SchemaDefinition): Promise<MigrationResult> {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  return sendAndUnwrap(
    getApiVersionTag(offlineStorageTelemetryVersionNumber, ApiName.OfflineStorage_MigrateSchema),
    'offlineStorage.migrateSchema',
    schema,
  );
}

/**
 * Removes a schema and all its associated records from offline storage.
 * This operation is irreversible.
 *
 * @param schemaId - The unique identifier of the schema to remove
 * @returns A promise that resolves when the schema has been removed
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 * @throws Error if the offlineStorage capability is not supported
 *
 * @beta
 */
export function removeSchema(schemaId: string): Promise<void> {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  return sendAndHandleSdkError(
    getApiVersionTag(offlineStorageTelemetryVersionNumber, ApiName.OfflineStorage_RemoveSchema),
    'offlineStorage.removeSchema',
    schemaId,
  );
}

/**
 * Checks if the offlineStorage capability is supported by the host
 * @returns boolean to represent whether the offlineStorage capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @beta
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.offlineStorage !== undefined;
}

export { drafts, inbox, outbox, sent, sync };
