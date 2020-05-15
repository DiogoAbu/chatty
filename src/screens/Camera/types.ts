import AttachmentModel from '!/models/AttachmentModel';
import { DeepPartial } from '!/types';

export interface CameraIds {
  type: number;
  id: string;
  cameraType: string;
}

export interface PicturesTaken extends DeepPartial<AttachmentModel> {
  isSelected: boolean;
}

export type VideoRecorded = DeepPartial<AttachmentModel>;
