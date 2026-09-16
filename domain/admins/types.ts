export interface AdminAccount {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

export interface CreateAdminInput {
  fullName: string;
  email: string;
  password: string;
}
