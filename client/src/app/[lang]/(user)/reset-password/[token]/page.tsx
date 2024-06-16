'use client';
import Image from 'next/image';
import React, { useState, FormEvent } from 'react';
import { HttpService } from '@/services';
import { IError, IErrorDtoInfos, IResponse } from '@/types/api';
import relaxingHippoquest from '~/public/assets/images/relaxing-hippoquests.jpeg';
import Link from 'next/link';
import { useErrorHandling } from '@/hooks/useErrorHandling';
import { useDictionary } from '@/providers/dictionary-provider';

export default function ResetPassword({
  params,
}: {
  params: { token: string };
}) {
  const http = new HttpService();
  const { errors, message, checkErrors, resetMessages, setMessage } =
    useErrorHandling();
  const dictionary = useDictionary();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const formJSON: any = Object.fromEntries(formData.entries());

    try {
      const response = await http
        .service()
        .modify<IResponse, any>(`auth/resetpassword/${params.token}`, formJSON);
      if (response.status === 'success') {
        setMessage(response.message);
      }
    } catch (e: any) {
      checkErrors(e.response.data);
    }
    resetMessages();
  };

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Image
            width={40}
            height={40}
            className="mx-auto h-10 w-auto"
            src={relaxingHippoquest}
            alt="Your Company"
          />
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            {dictionary.resetPassword.title}
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
            <form className="space-y-6" onSubmit={handleSubmit} method="POST">
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    {dictionary.resetPassword.formLabelOne}
                  </label>
                </div>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="passwordConfirm"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    {dictionary.resetPassword.formLabelTwo}
                  </label>
                </div>
                <div className="mt-2">
                  <input
                    id="passwordConfirm"
                    name="passwordConfirm"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              {errors.length > 0 &&
                errors.map((error: string, index) => (
                  <p key={index} className="text-red-700">
                    {error}
                  </p>
                ))}
              {message !== '' && <p className="text-green-700">{message}</p>}
              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-cyan-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
                >
                  {dictionary.resetPassword.button}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
