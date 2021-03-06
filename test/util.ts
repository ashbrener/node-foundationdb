import 'mocha'
import * as fdb from '../lib'

// We'll tuck everything behind this prefix and delete it all when the tests finish running.
export const prefix = '__test_data__/'
// export const prefixBuf = (key: Buffer) => Buffer.concat([Buffer.from(prefix), key])

// Using big endian numbers because they're lexographically sorted correctly.
export const bufToNum = (b: Buffer | null, def: number = 0) => b ? b.readInt32BE(0) : def
export const numToBuf = (n: number) => {
  const b = Buffer.alloc(4)
  b.writeInt32BE(n, 0)
  return b
}

export const numXF = {
  pack: numToBuf,
  unpack: bufToNum
}

export const strXF = {
  pack(s: string) {return s},
  unpack(b: Buffer) {return b.toString('utf8')}
}

// Only testing with one API version for now.
export const testApiVersion = 510

export const withEachDb = (fn: (db: fdb.Database) => void) => {
  fdb.setAPIVersion(testApiVersion)
  
  // These tests just use a single shared database instance which is reset
  // between tests. It would be cleaner if we used beforeEach to close & reopen
  // the database but its probably fine like this.
  const db = fdb.openSync().at(prefix)

  // We need to do this both before and after tests run to clean up any mess
  // that a previously aborted test left behind.
  beforeEach(() => db.clearRangeStartsWith(''))
  afterEach(() => db.clearRangeStartsWith(''))

  describe('fdb', () => fn(db))

  // TODO: It would be nice to check that nothing was written outside of the prefix.
}