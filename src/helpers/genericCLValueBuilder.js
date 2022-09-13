import { Buffer } from 'buffer';
import { CLTypeBuilder, CLURef, CLValueBuilder, decodeBase16 } from 'casper-js-sdk';
import { None, Some } from 'ts-results';

export default function buildCLValue(cltype, rawValue, innerType = null) {
  console.log((!(rawValue === '0' || rawValue === 'false')));
  let keyParameter = null;
  switch (cltype) {
    case 'bool':
      return CLValueBuilder[cltype]((!(rawValue === '0' || rawValue === 'false')));
    case 'u8':
    case 'u32':
    case 'i32':
    case 'u64':
    case 'i64':
    case 'u128':
    case 'u256':
    case 'u512':
    case 'unit':
    case 'string':
      return CLValueBuilder[cltype](rawValue);
    case 'uref':
      return CLURef.fromFormattedStr(rawValue);
    case 'key':
      if (rawValue.startsWith('uref-')) {
        keyParameter = CLURef.fromFormattedStr(rawValue);
      } else if (rawValue.startsWith('01') || rawValue.startsWith('02')) {
        keyParameter = CLValueBuilder.publicKey(
          decodeBase16(rawValue).subarray(1),
          decodeBase16(rawValue)[0],
        );
      } else {
        keyParameter = CLValueBuilder.byteArray(Buffer.from(rawValue));
      }
      return CLValueBuilder.key(keyParameter);
    case 'list':
      return CLValueBuilder[cltype](rawValue);
    case 'tuple':
      return CLValueBuilder[cltype + rawValue.length](rawValue);
    case 'option':
      if (rawValue === null) {
        return CLValueBuilder[cltype](None, CLTypeBuilder[innerType]());
      }
      return CLValueBuilder[cltype](Some(rawValue));
    case 'map':
      return 'Not supported';
    case 'publicKey':
      return CLValueBuilder[cltype](
        decodeBase16(rawValue).subarray(1),
        decodeBase16(rawValue)[0],
      );
    case 'byteArray':
      return CLValueBuilder[cltype](Buffer.from(rawValue));
    default:
      return 'Select a type';
  }
}
