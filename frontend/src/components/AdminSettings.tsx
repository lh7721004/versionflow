import { useState } from 'react';
import { useParams } from "react-router-dom";
import { UserPlus, Settings, Mail, Trash2 } from 'lucide-react';
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

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'sub-admin' | 'user';
  joinDate: string;
}

export function AdminSettings() {
  const { id } = useParams();
  const [users, setUsers] = useState([
    {
      id: '1',
      name: '김철수',
      email: 'kim@company.com',
      role: 'admin',
      joinDate: '2024-01-15',
    },
    {
      id: '2',
      name: '이영희',
      email: 'lee@company.com',
      role: 'sub-admin',
      joinDate: '2024-02-20',
    },
    {
      id: '3',
      name: '박민수',
      email: 'park@company.com',
      role: 'user',
      joinDate: '2024-03-10',
    },
    {
      id: '4',
      name: '정수진',
      email: 'jung@company.com',
      role: 'user',
      joinDate: '2024-03-25',
    },
  ] as (User[]));

  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user' as ('admin' | 'sub-admin' | 'user'));

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-[#004B8D]';
      case 'sub-admin':
        return 'bg-[#3DBE8B]';
      case 'user':
        return 'bg-muted-foreground';
      default:
        return 'bg-muted-foreground';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return '관리자';
      case 'sub-admin':
        return '부관리자';
      case 'user':
        return '사용자';
      default:
        return '알 수 없음';
    }
  };

  const handleInvite = () => {
    if (inviteEmail) {
      const newUser: User = {
        id: String(users.length + 1),
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole,
        joinDate: new Date().toISOString().split('T')[0],
      };
      setUsers([...users, newUser]);
      setInviteEmail('');
      setInviteRole('user');
      setIsInviteDialogOpen(false);
    }
  };

  const handleRoleChange = (userId: string, newRole: 'admin' | 'sub-admin' | 'user') => {
    setUsers(users.map((user: User) => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  const handleRemoveUser = (userId: string) => {
    setUsers(users.filter((user: User) => user.id !== userId));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          <div>
            <h2>관리자 설정</h2>
            <p className="text-muted-foreground">프로젝트 사용자 및 권한을 관리합니다</p>
          </div>
        </div>
        <Button onClick={() => setIsInviteDialogOpen(true)} className="gap-2">
          <UserPlus className="w-4 h-4" />
          사용자 초대
        </Button>
      </div>

      {/* Role Information */}
      <Card>
        <CardHeader>
          <CardTitle>권한 안내</CardTitle>
          <CardDescription>각 권한별 접근 가능한 기능</CardDescription>
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
              문서 조회, 편집 권한 (승인 및 관리 기능 불가)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle>프로젝트 멤버</CardTitle>
          <CardDescription>현재 {users.length}명의 멤버가 참여 중입니다</CardDescription>
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
              {users.map((user: User) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value: string) => handleRoleChange(user.id, value as 'admin' | 'sub-admin' | 'user')}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getRoleColor('admin')}`} />
                            관리자
                          </div>
                        </SelectItem>
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
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{user.joinDate}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveUser(user.id)}
                      className="text-[#E25A5A] hover:text-[#E25A5A] hover:bg-[#E25A5A]/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사용자 초대</DialogTitle>
            <DialogDescription>
              새로운 사용자를 프로젝트에 초대합니다
            </DialogDescription>
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
                  onChange={(e: { target: { value: any; }; }) => setInviteEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">권한</Label>
              <Select value={inviteRole} onValueChange={(value: string) => setInviteRole(value as 'admin' | 'sub-admin' | 'user')}>
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
