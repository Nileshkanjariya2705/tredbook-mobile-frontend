import { api, tokenStorage } from './api';

export interface OfflineMutation {
  mutationId: string;
  idempotencyKey: string;
  entityType: 'INVOICE' | 'ITEM' | 'PAYMENT' | 'ORDER' | 'STOCK';
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: any;
  clientTimestamp: string;
  baseVersion?: number;
  retryCount: number;
  status: 'PENDING' | 'SYNCING' | 'FAILED';
}

export interface ConflictRecord {
  conflictId: string;
  mutationId: string;
  entityType: string;
  entityId: string | number;
  clientValue: any;
  serverValue: any;
  resolvedValue: any;
  resolutionStrategy: string;
  timestamp: string;
}

export interface SyncStatus {
  serverTime: string;
  serverSequenceVersion: number;
  totalAppliedMutations: number;
  totalDuplicatesPrevented: number;
  totalConflictsResolved: number;
  status: string;
  protocolVersion: string;
}

type SyncEventListener = (event: 'STATUS_CHANGED' | 'SYNC_COMPLETE' | 'OUTBOX_UPDATED', payload: any) => void;

const STORAGE_KEY = 'TB_OFFLINE_OUTBOX_QUEUE';

class OfflineSyncService {
  private outbox: OfflineMutation[] = [];
  private isSimulatedOffline: boolean = false;
  private isSyncing: boolean = false;
  private listeners: Set<SyncEventListener> = new Set();

  constructor() {
    this.loadOutbox();
  }

  private async loadOutbox() {
    try {
      const stored = await tokenStorage.get(STORAGE_KEY);
      if (stored) {
        this.outbox = JSON.parse(stored);
        this.notify('OUTBOX_UPDATED', this.outbox);
      }
    } catch {
      this.outbox = [];
    }
  }

  private async persistOutbox() {
    try {
      await tokenStorage.set(STORAGE_KEY, JSON.stringify(this.outbox));
      this.notify('OUTBOX_UPDATED', this.outbox);
    } catch {
      // non-fatal in memory
    }
  }

  public subscribe(listener: SyncEventListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(event: 'STATUS_CHANGED' | 'SYNC_COMPLETE' | 'OUTBOX_UPDATED', payload: any) {
    this.listeners.forEach((fn) => {
      try {
        fn(event, payload);
      } catch {}
    });
  }

  public getOutbox(): OfflineMutation[] {
    return [...this.outbox];
  }

  public isOfflineMode(): boolean {
    return this.isSimulatedOffline;
  }

  public toggleSimulateOffline(enable?: boolean): boolean {
    this.isSimulatedOffline = enable !== undefined ? enable : !this.isSimulatedOffline;
    this.notify('STATUS_CHANGED', { isOffline: this.isSimulatedOffline });
    return this.isSimulatedOffline;
  }

  public async enqueueMutation(
    entityType: OfflineMutation['entityType'],
    action: OfflineMutation['action'],
    payload: any,
    baseVersion?: number
  ): Promise<OfflineMutation> {
    const timestamp = new Date().toISOString();
    const rand = Math.floor(100000 + Math.random() * 900000);
    const mutationId = `mut_${Date.now()}_${rand}`;
    const idempotencyKey = `idem_${entityType.toLowerCase()}_${Date.now()}_${rand}`;

    const item: OfflineMutation = {
      mutationId,
      idempotencyKey,
      entityType,
      action,
      payload,
      clientTimestamp: timestamp,
      baseVersion,
      retryCount: 0,
      status: 'PENDING',
    };

    this.outbox.push(item);
    await this.persistOutbox();

    // If not in offline simulation, trigger background drain
    if (!this.isSimulatedOffline) {
      this.flushOutbox().catch(() => {});
    }

    return item;
  }

  public async flushOutbox(): Promise<{ applied: number; duplicates: number; conflicts: number; failed: number }> {
    if (this.isSyncing || this.isSimulatedOffline || this.outbox.length === 0) {
      return { applied: 0, duplicates: 0, conflicts: 0, failed: 0 };
    }

    this.isSyncing = true;
    this.notify('STATUS_CHANGED', { syncing: true });

    let applied = 0;
    let duplicates = 0;
    let conflicts = 0;
    let failed = 0;

    try {
      const pendingBatch = this.outbox.filter((m) => m.status === 'PENDING' || m.status === 'FAILED');
      if (pendingBatch.length === 0) {
        this.isSyncing = false;
        this.notify('STATUS_CHANGED', { syncing: false });
        return { applied: 0, duplicates: 0, conflicts: 0, failed: 0 };
      }

      const res = await api.post('/sync/push', {
        mutations: pendingBatch.map((m) => ({
          mutationId: m.mutationId,
          idempotencyKey: m.idempotencyKey,
          entityType: m.entityType,
          action: m.action,
          payload: m.payload,
          clientTimestamp: m.clientTimestamp,
          baseVersion: m.baseVersion,
        })),
      });

      const results = res.data?.results || [];
      const successfulIds = new Set<string>();

      for (const r of results) {
        if (r.status === 'APPLIED') {
          applied++;
          successfulIds.add(r.mutationId);
        } else if (r.status === 'DUPLICATE_IGNORED') {
          duplicates++;
          successfulIds.add(r.mutationId);
        } else if (r.status === 'CONFLICT_RESOLVED') {
          conflicts++;
          successfulIds.add(r.mutationId);
        } else {
          failed++;
        }
      }

      // Remove successfully applied/reconciled mutations from outbox
      this.outbox = this.outbox.filter((m) => !successfulIds.has(m.mutationId));
      await this.persistOutbox();

      this.notify('SYNC_COMPLETE', { applied, duplicates, conflicts, failed });
    } catch {
      // Increment retryCount on pending mutations
      this.outbox = this.outbox.map((m) => ({
        ...m,
        retryCount: m.retryCount + 1,
        status: 'FAILED',
      }));
      await this.persistOutbox();
      failed = this.outbox.length;
    } finally {
      this.isSyncing = false;
      this.notify('STATUS_CHANGED', { syncing: false });
    }

    return { applied, duplicates, conflicts, failed };
  }

  public async getSyncStatus(): Promise<SyncStatus> {
    const res = await api.get('/sync/status');
    return res.data;
  }

  public async getConflicts(): Promise<{ totalConflicts: number; conflicts: ConflictRecord[] }> {
    const res = await api.get('/sync/conflicts');
    return res.data;
  }

  public async pullDeltas(sinceVersion?: number) {
    const res = await api.get('/sync/pull', {
      params: { sinceVersion },
    });
    return res.data;
  }

  public async clearOutbox() {
    this.outbox = [];
    await this.persistOutbox();
  }
}

export const offlineSyncService = new OfflineSyncService();
