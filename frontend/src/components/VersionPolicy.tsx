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
                <SelectItem value="{custom}">커스텀</SelectItem>
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

      {/* Commit Rules */}
      <Card>
        <CardHeader>
          <CardTitle>커밋 규칙</CardTitle>
          <CardDescription>문서 커밋 시 필수 요구사항을 설정합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>변경 이력 필수</Label>
              <p className="text-sm text-muted-foreground">
                커밋 메시지 작성을 필수로 합니다
              </p>
            </div>
            <Switch checked={changelogRequired} onCheckedChange={setChangelogRequired} />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="naming">버전 네이밍 규칙</Label>
            <Textarea
              id="naming"
              placeholder="예: [문서타입] 변경내용&#10;- 신규: 새로운 문서 추가&#10;- 수정: 기존 문서 수정&#10;- 삭제: 문서 삭제"
              value={versionNaming}
              onChange={(e) => setVersionNaming(e.target.value)}
              rows={5}
            />
            <p className="text-sm text-muted-foreground">
              팀원들이 따라야 할 커밋 메시지 작성 규칙을 설명합니다
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Branch Strategy */}
      <Card>
        <CardHeader>
          <CardTitle>브랜치 전략</CardTitle>
          <CardDescription>문서 작업 브랜치 전략을 설정합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="text-primary">main</span> - 승인 완료된 최종 버전
                </p>
                <p className="text-sm">
                  <span className="text-[#3DBE8B]">develop</span> - 개발/작성 중인 버전
                </p>
                <p className="text-sm">
                  <span className="text-[#F5A524]">feature/*</span> - 개별 작업 브랜치
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch">기본 브랜치 전략</Label>
            <Select defaultValue="gitflow">
              <SelectTrigger id="branch">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gitflow">Git Flow (main/develop/feature)</SelectItem>
                <SelectItem value="trunk">Trunk-based (main only)</SelectItem>
                <SelectItem value="custom">커스텀</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Retention Policy */}
      <Card>
        <CardHeader>
          <CardTitle>보관 정책</CardTitle>
          <CardDescription>문서 버전 보관 기간을 설정합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="retention">버전 보관 기간</Label>
            <Select defaultValue="unlimited">
              <SelectTrigger id="retention">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30일</SelectItem>
                <SelectItem value="90">90일</SelectItem>
                <SelectItem value="180">6개월</SelectItem>
                <SelectItem value="365">1년</SelectItem>
                <SelectItem value="unlimited">무제한</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              오래된 버전은 자동으로 아카이브됩니다
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
