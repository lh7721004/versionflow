import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserPlus, Settings, Mail, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Badge } from './ui/badge';
import { useCreateInvitation } from '../queries/useInvitations';
import { useMe } from '../queries/useMe';
import { useProjectMembersByProject, useUpdateProjectMemberRole, useRemoveProjectMember } from '../queries/useProjects';

type UiRole = 'admin' | 'sub-admin' | 'user';
type ApiRole = 'owner' | 'maintainer' | 'member';

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: UiRole;
  joinDate: string;
}

export function AdminSettings() {
  const { id } = useParams();
  const { data: projectMembersData, isLoading: isMembersLoading } = useProjectMembersByProject(id);
  const [users, setUsers] = useState<UserRow[]>([]);
  const updateMemberRole = useUpdateProjectMemberRole(id);
  const removeMember = useRemoveProjectMember(id);

  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UiRole>('user');
  const { data: me } = useMe();
  const createInvitation = useCreateInvitation();

  useEffect(() => {
    if (!projectMembersData) return;
    const mapped = (projectMembersData as any[]).map((m: any) => ({
      id: m.userId?._id || m.userId,
      name: m.userId?.name || '알 수 없음',
      email: m.userId?.email || '',
      role: m.role === 'owner' ? 'admin' : m.role === 'maintainer' ? 'sub-admin' : 'user',
      joinDate: m.joinedAt ? new Date(m.joinedAt).toISOString().split('T')[0] : ''
    }));
    setUsers(mapped as UserRow[]);
  }, [projectMembersData]);

  const getRoleColor = (role: UiRole) => {
    switch (role) {
      case 'admin':
        return 'bg-[#004B8D]';
      case 'sub-admin':
        return 'bg-[#3DBE8B]';
      case 'user':
      default:
        return 'bg-muted-foreground';
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) {
      toast.error('초대할 이메일을 입력하세요.');
      return;
    }
    if (!id) {
      toast.error('프로젝트 ID를 찾을 수 없습니다.');
      return;
    }
    const inviterId = (me as any)?.data?.id || (me as any)?.id;
    if (!inviterId) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    const roleMap: Record<UiRole, ApiRole> = {
      admin: 'owner',
      'sub-admin': 'maintainer',
      user: 'member',
    };

    try {
      await createInvitation.mutateAsync({
        projectId: id,
        inviterId,
        inviteeEmail: inviteEmail,
        role: roleMap[inviteRole],
      });
      toast.success('초대 메일을 발송했어요.');
      setInviteEmail('');
      setInviteRole('user');
      setIsInviteDialogOpen(false);
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.message || '초대 발송에 실패했어요.';
      toast.error(msg);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UiRole) => {
    if (!id) return;
    // Optimistic UI update
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    const roleMap: Record<UiRole, ApiRole> = {
      admin: 'owner',
      'sub-admin': 'maintainer',
      user: 'member',
    };
    try {
      await updateMemberRole.mutateAsync({ userId, role: roleMap[newRole] });
      toast.success('멤버 역할을 변경했어요.');
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || err?.message || '역할 변경에 실패했어요.');
      // revert on failure
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: prev.find(p => p.id===userId)?.role || 'user' } : u)));
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!id) return;
    const prev = users;
    setUsers((u) => u.filter((x) => x.id !== userId));
    try {
      await removeMember.mutateAsync({ userId });
      toast.success('멤버를 제거했어요.');
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.message || '멤버 제거에 실패했어요.';
      toast.error(msg);
      setUsers(prev);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          <div>
            <h2>관리자 설정</h2>
            <p className="text-muted-foreground">프로젝트 사용자와 권한을 관리합니다</p>
          </div>
        </div>
        <Button onClick={() => setIsInviteDialogOpen(true)} className="gap-2">
          <UserPlus className="w-4 h-4" />
          사용자 초대
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>권한 안내</CardTitle>
          <CardDescription>각 권한으로 접근 가능한 기능</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <Badge className={`${getRoleColor('admin')} text-white`}>관리자</Badge>
            <p className="text-sm text-muted-foreground">
              모든 프로젝트 설정, 사용자 관리, 문서 승인/거절, 편집, 삭제 권한
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Badge className={`${getRoleColor('sub-admin')} text-white`}>부관리자</Badge>
            <p className="text-sm text-muted-foreground">
              문서 승인/거절, 편집 권한 (프로젝트 설정 및 사용자 관리 불가)
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Badge className={`${getRoleColor('user')} text-white`}>사용자</Badge>
            <p className="text-sm text-muted-foreground">
              문서 조회, 편집 권한 (승인 및 관리 기능 없음)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>프로젝트 멤버</CardTitle>
          <CardDescription>
            현재 {isMembersLoading ? '불러오는 중...' : `${users.length}명`}의 멤버가 참여 중입니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>권한</TableHead>
                <TableHead>가입일</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value: UiRole) => handleRoleChange(user.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      {user.role !== 'admin' ?
                      <SelectContent>
                        <SelectItem value="sub-admin">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getRoleColor('sub-admin')}`} />
                            부관리자
                          </div>
                        </SelectItem>
                        <SelectItem value="user">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getRoleColor('user')}`} />
                            사용자
                          </div>
                        </SelectItem>
                      </SelectContent>:
                      <SelectContent>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getRoleColor('admin')}`} />
                            관리자
                          </div>
                        </SelectItem>
                      </SelectContent>
                      }
                    </Select>
                  </TableCell>
                  <TableCell>{user.joinDate}</TableCell>
                  {user.role !== 'admin' ?
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveUser(user.id)}
                      className="text-[#E25A5A] hover:text-[#E25A5A] hover:bg-[#E25A5A]/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>:<></>}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사용자 초대</DialogTitle>
            <DialogDescription>프로젝트에 사용자를 초대합니다.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <div className="flex gap-2">
                <Mail className="w-4 h-4 mt-3 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="user@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">권한</Label>
              <Select value={inviteRole} onValueChange={(value: UiRole) => setInviteRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">관리자</SelectItem>
                  <SelectItem value="sub-admin">부관리자</SelectItem>
                  <SelectItem value="user">사용자</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleInvite}>초대 발송</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
