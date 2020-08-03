import AttachmentModel from '!/models/AttachmentModel';
import { DeepPartial } from '!/types';

export default function attachmentChanged(
  prev: DeepPartial<AttachmentModel>[],
  next: DeepPartial<AttachmentModel>[],
): boolean {
  return next?.some((msg) => {
    const other = prev.find((e) => e.id === msg.id);
    if (!other) {
      return true;
    }
    return msg.localUri !== other.localUri || msg.cipherUri !== other.cipherUri;
  });
}
