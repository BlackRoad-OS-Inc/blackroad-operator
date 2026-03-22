import { createHash } from 'node:crypto'

export interface WormAppendInput<T = unknown> {
  payload: T
  timestamp?: Date
}

export interface WormBlock<T = unknown> {
  idx: number
  ts: Date
  payload: T
  prevHash: string
  hash: string
}

type WormStoreRecord<T = unknown> = WormBlock<T>

type WormStore<T = unknown> = {
  findFirst(args?: { orderBy?: { idx?: 'asc' | 'desc' } }): Promise<WormStoreRecord<T> | null>
  findMany(args?: { orderBy?: { idx?: 'asc' | 'desc' } }): Promise<WormStoreRecord<T>[]>
  create(args: { data: WormStoreRecord<T> }): Promise<WormStoreRecord<T>>
}

type PrismaLike<T = unknown> = {
  wormBlock: WormStore<T>
}

function clonePayload<T>(payload: T): T {
  return payload === undefined ? payload : JSON.parse(JSON.stringify(payload))
}

function computeHash<T>(prevHash: string, ts: Date, payload: T, idx: number): string {
  return createHash('sha256')
    .update(JSON.stringify({ prevHash, ts: ts.toISOString(), payload, idx }))
    .digest('hex')
}

export class WormLedger<T = unknown> {
  constructor(private readonly prisma: PrismaLike<T>) {}

  async append(entry: WormAppendInput<T>): Promise<WormBlock<T>> {
    const prev = await this.prisma.wormBlock.findFirst({ orderBy: { idx: 'desc' } })
    const ts = entry.timestamp ?? new Date()
    const block: WormBlock<T> = {
      idx: prev ? prev.idx + 1 : 1,
      ts,
      payload: clonePayload(entry.payload),
      prevHash: prev?.hash ?? 'GENESIS',
      hash: computeHash(prev?.hash ?? 'GENESIS', ts, entry.payload, prev ? prev.idx + 1 : 1),
    }
    return this.prisma.wormBlock.create({ data: block })
  }

  async tail(): Promise<WormBlock<T> | null> {
    return this.prisma.wormBlock.findFirst({ orderBy: { idx: 'desc' } })
  }

  async all(): Promise<WormBlock<T>[]> {
    return this.prisma.wormBlock.findMany({ orderBy: { idx: 'asc' } })
  }

  async verify(): Promise<boolean> {
    const blocks = await this.all()
    let prevHash = 'GENESIS'
    for (let i = 0; i < blocks.length; i += 1) {
      const block = blocks[i]
      const expectedIdx = i + 1
      const expectedHash = computeHash(prevHash, new Date(block.ts), block.payload, expectedIdx)
      if (block.idx !== expectedIdx) return false
      if (block.prevHash !== prevHash) return false
      if (block.hash !== expectedHash) return false
      prevHash = block.hash
    }
    return true
  }
}
