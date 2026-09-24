export interface TaskAttachment {
  _id: string;
  filename: string;
  url: string;
  publicId: string;
  resourceType: string;
  mimetype: string;
  size: number;
  uploadedBy?: {
    _id: string;
    username: string;
    email: string;
  } | string;
  task: string;
  createdAt: string;
  updatedAt: string;
}
