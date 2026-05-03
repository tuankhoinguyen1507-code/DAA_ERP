export type Role = 'head_of_daa' | 'daa_member' | 'head_of_subject' | 'lecturer' | 'ta';

export type Scope = 'all' | 'department' | 'class' | 'assigned_only';

export type Permission = 
  | 'student.view_all' | 'student.view_assigned' | 'student.create' | 'student.update' | 'student.delete'
  | 'class.view_all' | 'class.view_department' | 'class.view_assigned'
  | 'attendance.mark' | 'attendance.comment' | 'attendance.view_all'
  | 'tuition.view' | 'tuition.create_invoice' | 'tuition.export_pdf' | 'tuition.manage_all'
  | 'role.manage' | 'account.manage'
  | 'schedule.edit_assigned' | 'schedule.edit_department' | 'schedule.view_assigned'
  | 'subject.manage';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  head_of_daa: [
    'student.view_all', 'student.create', 'student.update', 'student.delete',
    'class.view_all',
    'attendance.mark', 'attendance.comment', 'attendance.view_all',
    'tuition.view', 'tuition.create_invoice', 'tuition.export_pdf', 'tuition.manage_all',
    'role.manage', 'account.manage',
    'schedule.edit_department', 'schedule.edit_assigned', 'schedule.view_assigned',
    'subject.manage'
  ],
  daa_member: [
    'student.view_all', 'student.create', 'student.update',
    'class.view_all',
    'attendance.mark', 'attendance.comment', 'attendance.view_all',
    'tuition.view', 'tuition.create_invoice', 'tuition.export_pdf',
    'schedule.edit_assigned', 'schedule.edit_department'
  ],
  head_of_subject: [
    'student.view_all', 
    'class.view_department',
    'attendance.view_all',
    'schedule.edit_department'
  ],
  lecturer: [
    'student.view_assigned',
    'class.view_assigned',
    'attendance.mark', 'attendance.comment',
    'schedule.view_assigned', 'schedule.edit_assigned'
  ],
  ta: [
    'student.view_assigned',
    'class.view_assigned',
    'attendance.mark', 'attendance.comment',
    'schedule.view_assigned'
  ]
};

export const ROLE_SCOPES: Record<Role, Scope> = {
  head_of_daa: 'all',
  daa_member: 'all',
  head_of_subject: 'department',
  lecturer: 'assigned_only',
  ta: 'assigned_only'
};

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: Role;
  scope: Scope;
  departmentId?: string; // e.g., 'english'
}

export const checkPermission = (user: UserAccount, requiredPermission: Permission): boolean => {
  const userPermissions = ROLE_PERMISSIONS[user.role];
  return userPermissions.includes(requiredPermission);
};
