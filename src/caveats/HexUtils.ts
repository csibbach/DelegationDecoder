import { getAddress, type Address, type Hex } from 'viem'

import { CaveatTermsDecodeError } from '../errors.js'

/**
 * Helpers for reading packed ABI / encodePacked hex blobs at byte offsets.
 */
export class HexUtils {
  static byteLength(hex: Hex): number {
    return Math.max(0, (hex.length - 2) / 2)
  }

  static requireLength(hex: Hex, expected: number, enforcerType: string): void {
    const actual = HexUtils.byteLength(hex)
    if (actual !== expected) {
      throw new CaveatTermsDecodeError(
        enforcerType,
        `invalid terms length: expected ${expected} bytes, got ${actual}`,
      )
    }
  }

  /** Read `bytes20` as an address from hex at byte offset. */
  static readAddress(hex: Hex, byteOffset: number): Address {
    const start = 2 + byteOffset * 2
    return getAddress(`0x${hex.slice(start, start + 40)}`)
  }

  /** Read `bytes32` as bigint from hex at byte offset. */
  static readUint256(hex: Hex, byteOffset: number): bigint {
    const start = 2 + byteOffset * 2
    return BigInt(`0x${hex.slice(start, start + 64)}`)
  }

  /** Read `bytes32` as Hex from hex at byte offset. */
  static readBytes32(hex: Hex, byteOffset: number): Hex {
    const start = 2 + byteOffset * 2
    return `0x${hex.slice(start, start + 64)}` as Hex
  }

  /** Read a single byte as number. */
  static readUint8(hex: Hex, byteOffset: number): number {
    const start = 2 + byteOffset * 2
    return Number.parseInt(hex.slice(start, start + 2), 16)
  }

  /** Read `uint16` (big-endian) from hex at byte offset. */
  static readUint16(hex: Hex, byteOffset: number): number {
    const start = 2 + byteOffset * 2
    return Number.parseInt(hex.slice(start, start + 4), 16)
  }

  /** Read `uint32` (big-endian) from hex at byte offset. */
  static readUint32(hex: Hex, byteOffset: number): number {
    const start = 2 + byteOffset * 2
    return Number.parseInt(hex.slice(start, start + 8), 16)
  }

  /** Read `int256` from hex at byte offset. */
  static readInt256(hex: Hex, byteOffset: number): bigint {
    const value = HexUtils.readUint256(hex, byteOffset)
    const signBit = 1n << 255n
    return (value & signBit) !== 0n ? value - (1n << 256n) : value
  }
}
