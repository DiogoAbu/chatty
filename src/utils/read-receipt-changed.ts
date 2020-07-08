import ReadReceiptModel from '!/models/ReadReceiptModel';
import { DeepPartial } from '!/types';

export default function readReceiptChanged(
  prev: DeepPartial<ReadReceiptModel>[],
  next: DeepPartial<ReadReceiptModel>[],
): boolean {
  return next?.some((msg) => {
    const other = prev.find((e) => e.id === msg.id);
    if (!other) {
      return true;
    }
    return msg.receivedAt !== other.receivedAt || msg.seenAt !== other.seenAt;
  });
}
