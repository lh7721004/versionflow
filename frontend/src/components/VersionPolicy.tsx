import { useEffect, useState } from 'react';
import { FileCode, Save } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useParams } from 'react-router-dom';
import { useUpdateVersioning } from '../queries/useVersioning';
import { toast } from 'sonner';
import { useProject } from '../queries/useProjects';

export function VersionPolicy() {
  const { id } = useParams();
  const { data: projectData, isLoading } = useProject(id);
  const updateVersioning = useUpdateVersioning(id);

  const [versionFormat, setVersionFormat] = useState<'v{major}.{minor}' | 'v{major}.{minor}.{patch}' | '{year}.{month}.{version}'>('v{major}.{minor}');
  const [requireApproval, setRequireApproval] = useState(true);
  const [minApprovers, setMinApprovers] = useState('2');

  const handleSave = async () => {
    if (!id) {
      toast.error('프로젝트 ID를 찾을 수 없습니다.');
      return;
    }
    const namingScheme =
      versionFormat === 'v{major}.{minor}'
        ? 'major-minor'
        : versionFormat === 'v{major}.{minor}.{patch}'
        ? 'semver'
        : 'date-major';
    try {
      await updateVersioning.mutateAsync({
        namingScheme,
        reviewRequired: requireApproval,
        minApprovals: Number(minApprovers) || 1
      });
      toast.success('버전 관리 정책이 저장되었습니다.');
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.message || '저장에 실패했습니다.';
      toast.error(msg);
    }
  };

  // 프로젝트 설정을 불러와 초기값에 반영
  useEffect(() => {
    if (!projectData?.settings?.versioning) return;
    const v = projectData.settings.versioning;
    if (v.namingScheme === 'semver') setVersionFormat('v{major}.{minor}.{patch}');
    else if (v.namingScheme === 'date-major') setVersionFormat('{year}.{month}.{version}');
    else setVersionFormat('v{major}.{minor}');

    if (typeof v.reviewRequired === 'boolean') setRequireApproval(v.reviewRequired);
    if (typeof v.minApprovals === 'number') setMinApprovers(String(v.minApprovals));
  }, [projectData]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileCode className="w-8 h-8 text-primary" />
          <div>
            <h2>버전 관리 정책</h2>
            <p className="text-muted-foreground">
              {isLoading ? '프로젝트 정보를 불러오는 중...' : '프로젝트의 버전 규칙을 설정하세요'}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          저장
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>버전 형식</CardTitle>
          <CardDescription>문서 버전 이름 규칙을 선택하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="format">버전 형식</Label>
            <Select value={versionFormat} onValueChange={(v) => setVersionFormat(v as any)}>
              <SelectTrigger id="format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="v{major}.{minor}">v{'{major}'}.{'{minor}'} (예: v1.0)</SelectItem>
                <SelectItem value="v{major}.{minor}.{patch}">v{'{major}'}.{'{minor}'}.{'{patch}'} (예: v1.0.0)</SelectItem>
                <SelectItem value="{year}.{month}.{version}">{'{year}'}.{'{month}'}.{'{version}'} (예: 2024.10.1)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              현재 형식: <span className="text-foreground">{versionFormat}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>승인 규칙</CardTitle>
          <CardDescription>문서 승인 프로세스를 설정하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>승인 필수</Label>
              <p className="text-sm text-muted-foreground">모든 커밋에 대해 승인을 요구할지 여부</p>
            </div>
            <Switch checked={requireApproval} onCheckedChange={setRequireApproval} />
          </div>

          {requireApproval && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="approvers">최소 승인 인원</Label>
                <Select value={minApprovers} onValueChange={setMinApprovers}>
                  <SelectTrigger id="approvers">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1명</SelectItem>
                    <SelectItem value="2">2명</SelectItem>
                    <SelectItem value="3">3명</SelectItem>
                    <SelectItem value="4">4명</SelectItem>
                    <SelectItem value="5">5명</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  승인이 완료되려면 최소 {minApprovers}명의 승인이 필요합니다.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
