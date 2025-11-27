import { useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAcceptInvitationByToken } from '../queries/useInvitations';
import { useMe } from '../queries/useMe';

type Props = {
  onKakaoLogin?: () => void;
  onGoogleLogin?: () => void;
};
interface User {
  _id: string;
  [key: string]: any;
}
export function InviteAccept({ onKakaoLogin, onGoogleLogin }: Props) {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();
  const { data: me, isLoading: isUserLoading } = useMe();
  const user = useMemo(() => (me as User)?.data ?? (me as User) ?? null, [me]);
  const acceptedOnce = useRef(false);

  const { mutateAsync, isPending } = useAcceptInvitationByToken();

  useEffect(() => {
    if (acceptedOnce.current) return;
    if (!token || !user?.id) return;
    acceptedOnce.current = true;
    mutateAsync({ token, userId: user.id })
      .then(() => {
        toast.success('초대를 수락했어요. 프로젝트에 멤버로 추가되었습니다.');
        navigate('/');
      })
      .catch((err: any) => {
        acceptedOnce.current = false;
        const msg = err?.response?.data?.error?.message || err?.message || '초대 수락에 실패했어요.';
        toast.error(msg);
      });
  }, [token, user?.id, mutateAsync, navigate]);

  if (!token) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <h1 className="text-xl font-semibold">유효하지 않은 초대 링크</h1>
        <p className="mt-2 text-sm text-gray-600">초대 토큰이 없습니다. 초대 메일의 링크를 다시 확인해주세요.</p>
      </div>
    );
  }

  if (!user && !isUserLoading) {
    return (
      <div className="p-6 max-w-lg mx-auto space-y-4">
        <h1 className="text-xl font-semibold">로그인이 필요합니다</h1>
        <p className="text-sm text-gray-600">초대를 수락하려면 먼저 로그인해주세요.</p>
        <div className="flex gap-2">
          {onKakaoLogin && (
            <button
              onClick={onKakaoLogin}
              className="px-4 py-2 rounded bg-yellow-400 text-black font-medium"
            >
              카카오로 로그인
            </button>
          )}
          {onGoogleLogin && (
            <button
              onClick={onGoogleLogin}
              className="px-4 py-2 rounded bg-red-500 text-white font-medium"
            >
              구글로 로그인
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-semibold mb-2">초대 수락 중...</h1>
      <p className="text-sm text-gray-600">
        {isPending ? '초대를 처리하고 있어요.' : isUserLoading ? '사용자 정보를 확인 중입니다.' : '잠시만 기다려주세요.'}
      </p>
    </div>
  );
}
