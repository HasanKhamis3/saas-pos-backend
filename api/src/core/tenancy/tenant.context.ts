import { AsyncLocalStorage } from 'async_hooks';

const tenantContext = new AsyncLocalStorage<string>();

export function getTenantId(): string | undefined {
  return tenantContext.getStore();
}

export function setTenantId(tenantId: string, callback: () => void) {
  tenantContext.run(tenantId, callback);
}