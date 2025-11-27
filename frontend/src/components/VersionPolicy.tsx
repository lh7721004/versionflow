import { useState } from 'react';
import { FileCode, Save, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export function VersionPolicy() {
  const [versionFormat, setVersionFormat] = useState('v{major}.{minor}');
  const [autoIncrement, setAutoIncrement] = useState(true);
  const [requireApproval, setRequireApproval] = useState(true);
  const [minApprovers, setMinApprovers] = useState('2');
  const [versionNaming, setVersionNaming] = useState('');
  const [changelogRequired, setChangelogRequired] = useState(true);

  const handleSave = () => {
    // 저장 로직
    alert('버전 관리 정책이 저장되었습니다.');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileCode className="w-8 h-8 text-primary" />
          <div>
            <h2>버전 관리 정책</h2>
            <p className="text-muted-foreground">프로젝트의 버전 규칙을 설정합니다</p>
          </div>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          저장
        </Button>
      </div>

      {/* Version Format */}
      <Card>
        <CardHeader>
          <CardTitle>버전 형식</CardTitle>
          <CardDescription>문서 버전의 표기 방식을 설정합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="format">버전 형식</Label>
            <Select value={versionFormat} onValueChange={setVersionFormat}>
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

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>자동 증가</Label>
              <p className="text-sm text-muted-foreground">
                커밋 시 버전을 자동으로 증가시킵니다
              </p>
            </div>
            <Switch checked={autoIncrement} onCheckedChange={setAutoIncrement} />
          </div>
        </CardContent>
      </Card>

      {/* Approval Rules */}
      <Card>
        <CardHeader>
          <CardTitle>승인 규칙</CardTitle>
          <CardDescription>문서 승인 프로세스를 설정합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>승인 필수</Label>
              <p className="text-sm text-muted-foreground">
                모든 커밋은 승인을 거쳐야 합니다
              </p>
            </div>
            <Switch checked={requireApproval} onCheckedChange={setRequireApproval} />
          </div>

          {requireApproval && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="approvers">최소 승인자 수</Label>
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
                  승인이 완료되려면 최소 {minApprovers}명의 승인이 필요합니다
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>


    </div>
  );
}
