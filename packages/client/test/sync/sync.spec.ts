import { EventEmitter } from 'events'
import tape from 'tape-catch'
import td from 'testdouble'
import { Config } from '../../lib/config'
import { Chain } from '../../lib/blockchain'

tape('[Synchronizer]', async (t) => {
  class PeerPool extends EventEmitter {
    open() {}
    close() {}
  }
  PeerPool.prototype.open = td.func<any>()
  PeerPool.prototype.close = td.func<any>()
  td.replace('../../lib/net/peerpool', { PeerPool })

  const { Synchronizer } = await import('../../lib/sync/sync')

  t.test('should sync', async (t) => {
    const config = new Config({ loglevel: 'error', transports: [] })
    const pool = new PeerPool() as any
    const chain = new Chain({ config })
    const sync = new Synchronizer({ config, pool, chain })
    ;(sync as any).sync = td.func()
    td.when((sync as any).sync()).thenResolve(true)
    sync.on('synchronized', async () => {
      t.ok('synchronized')
      await sync.stop()
      t.notOk((sync as any).running, 'stopped')
      t.end()
    })
    await sync.start()
  })

  t.test('should reset td', (t) => {
    td.reset()
    t.end()
  })
})
