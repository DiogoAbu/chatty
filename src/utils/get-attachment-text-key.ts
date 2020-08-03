import AttachmentModel from '!/models/AttachmentModel';
import { DeepPartial } from '!/types';

export default function getAttachmentTextKey(attachments: DeepPartial<AttachmentModel>[] | null): string {
  let attachmentDescription = '';

  if (!attachments) {
    return attachmentDescription;
  }

  if (attachments.length === 1) {
    if (attachments[0].type === 'video') {
      attachmentDescription = 'label.video';
    } else if (attachments[0].type === 'image') {
      attachmentDescription = 'label.image';
    }
  } else if (attachments.length > 1 && attachments.every((e) => e.type === 'image')) {
    attachmentDescription = 'label.images';
  }

  return attachmentDescription;
}
