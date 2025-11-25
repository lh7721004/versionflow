import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { FileText } from 'lucide-react';

interface LoginPageProps {
  onKakaoLogin: () => void;
  onGoogleLogin: () => void;
}

export function LoginPage({ onKakaoLogin,onGoogleLogin }: LoginPageProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  // const loginOAuth = () => {
  //   onLogin();
  // }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-lg p-8 space-y-6">
          {/* Logo */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className='flex flex-col gap-8'>
              <h1 className="text-center font-black text-lg">Document Version Control System</h1>
              <div className='flex flex-col gap-4'>
                <div className='bg-[#FAE100] px-4 py-2 rounded-xl flex flex-row gap-2 cursor-pointer justify-center drop-shadow-2xl'>
                  <div className='w-8 flex flex-col justify-center'>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 265 265"><path d="M128 36C70.562 36 24 72.713 24 118c0 29.279 19.466 54.97 48.748 69.477-1.593 5.494-10.237 35.344-10.581 37.689 0 0-.207 1.762.934 2.434s2.483.15 2.483.15c3.272-.457 37.943-24.811 43.944-29.04 5.995.849 12.168 1.29 18.472 1.29 57.438 0 104-36.712 104-82 0-45.287-46.562-82-104-82z"/></svg>
                  </div>
                  <div className='font-semibold flex flex-col justify-center' onClick={onKakaoLogin}>
                    카카오톡으로 로그인하기
                  </div>
                </div>
                <div className='bg-[#FFFFFF] px-4 py-2 rounded-xl flex flex-row gap-2 cursor-pointer justify-center drop-shadow-2xl'>
                  <div className='w-8 flex flex-col justify-center'>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 265 265" preserveAspectRatio="xMidYMid"><path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4"/><path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853"/><path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05"/><path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335"/></svg>
                  </div>
                  <div className='font-semibold flex flex-col justify-center' onClick={onGoogleLogin}>
                    Google로 로그인하기
                  </div>
                </div>
              </div>
            </div>
          </div>


        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-muted-foreground">
          <p>© 2025 VersionFlow</p>
        </div>
      </div>
    </div>
  );
}
