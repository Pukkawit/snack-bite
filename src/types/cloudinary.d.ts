type CloudinaryResource = {
  public_id: string;
  format: string;
  secure_url?: string;
  resource_type?: string;
  bytes?: number;
  created_at?: string;
};

type CheckDuplicateRequest = {
  fileName: string;
  folderName?: string;
  strictMode?: boolean;
};

type CheckDuplicateResponse = {
  exists: boolean;
  duplicateType?: "exact" | "basename";
  file?: CloudinaryResource;
  allMatches?: CloudinaryResource[];
  message?: string;
  error?: string;
};
