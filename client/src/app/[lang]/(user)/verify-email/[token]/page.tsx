'use client';
import { HttpService } from '@/services';
import { IResponse } from '@/types/api';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CheckCircleIcon } from '@heroicons/react/20/solid';
import { useDictionary } from '@/providers/dictionary-provider';

export default function VerifyEmail({ params }: { params: { token: string } }) {
  const http = new HttpService();
  const router = useRouter();
  const dictionary = useDictionary();

  async function handleVerifyEmail() {
    try {
      const response = await http
        .service()
        .get<IResponse>(`/auth/verifyemail/${params.token}`);
      setTimeout(() => {
        router.push('/home');
      }, 5000);
    } catch (e: any) {}
  }

  useEffect(() => {
    handleVerifyEmail();
  }, []);

  return (
    <div className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon
                className="h-5 w-5 text-green-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                {dictionary.verifyEmail.confirm}
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>{dictionary.verifyEmail.text}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
