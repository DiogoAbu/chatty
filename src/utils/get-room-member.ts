import UserModel from '!/models/UserModel';

export default function getRoomMember(
  members: UserModel[],
  signedUserId?: string,
): UserModel | null {
  if (!signedUserId) {
    return null;
  }
  return members.find((member) => member.id !== signedUserId) || null;
}
