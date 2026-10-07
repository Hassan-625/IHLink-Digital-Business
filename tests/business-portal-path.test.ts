import assert from 'node:assert/strict';
import test from 'node:test';
import { businessPortalPath } from '../src/lib/businessPortalPath.ts';

const pages = ['dashboard','requests','quotes','invoices','payments','files','notifications','support','profile','settings','production','usage'];
test('specialist workspace destinations fit the registered single-page routes', () => {
  for (const base of ['/fabrication','/compute','/digital-business']) {
    for (const page of pages) {
      const path = businessPortalPath(base,page);
      assert.equal(path,base+'/'+page);
      assert.equal(path.slice(base.length+1).includes('/'),false);
    }
  }
});
test('root-hosted workspaces retain their registered dashboard route', () => {
  assert.equal(businessPortalPath('/','dashboard'),'/dashboard');
  for (const page of pages.filter(page=>page!=='dashboard'))
    assert.equal(businessPortalPath('/',page),'/dashboard/'+page);
});
