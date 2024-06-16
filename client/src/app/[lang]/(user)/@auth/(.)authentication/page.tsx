'use client';
import Modal from '@/components/Modal';
import { useErrorHandling } from '@/hooks/useErrorHandling';
import { useDictionary } from '@/providers/dictionary-provider';
import { HttpService } from '@/services';
import { IResponse } from '@/types/api';
import { DialogTitle } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { FormEvent, useRef, useState } from 'react';

export default function Authentication({
  params: { lang },
}: {
  params: { lang: string };
}) {
  const http = new HttpService();
  const { errors, message, checkErrors, resetMessages, setMessage } =
    useErrorHandling();
  const router = useRouter();
  const dictionary = useDictionary();
  const [authForm, setAuthForm] = useState<IAuthForm>('login');
  type IAuthForm = 'login' | 'register' | 'forgot-password';
  const loginRef = useRef<HTMLFormElement>(null);
  const registerRef = useRef<HTMLFormElement>(null);
  const forgotPasswordRef = useRef<HTMLFormElement>(null);

  const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const formJSON: any = Object.fromEntries(formData.entries());
    loginRef.current?.reset();
    try {
      const response = await http
        .service()
        .push<IResponse, any>(`/auth/login`, formJSON);
      if (response.status === 'success') {
        router.back();
      }
    } catch (e: any) {
      checkErrors(e.response.data);
    }
    resetMessages();
  };

  async function handleForgotPasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const formJSON: any = Object.fromEntries(formData.entries());
    forgotPasswordRef.current?.reset();
    try {
      const response = await http
        .service()
        .push<IResponse, any>(`auth/forgotpassword`, formJSON);
      if (response.status === 'success') {
        setMessage(response.message);
      }
    } catch (e: any) {
      checkErrors(e.response.data);
    }
    resetMessages();
  }

  const handleRegisterSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const formJSON: any = Object.fromEntries(formData.entries());
    registerRef.current?.reset();
    try {
      const response = await http
        .service()
        .push<IResponse, any>(`/auth/register`, { ...formJSON, lang });
      if (response.status === 'success') {
        setMessage(response.message);
      }
    } catch (e: any) {
      checkErrors(e.response.data);
    }
    resetMessages();
  };

  function onDismiss() {
    router.back();
  }
  return (
    <Modal>
      {authForm === 'login' ? (
        <div className="text-center">
          <DialogTitle
            as="h3"
            className="text-base font-semibold leading-6 text-gray-900 mb-5"
          >
            {dictionary.login.title}
          </DialogTitle>
          <div className="mt-2"></div>
          <form
            ref={loginRef}
            className="space-y-6"
            onSubmit={handleLoginSubmit}
            method="POST"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                {dictionary.login.formLabelOne}
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                {dictionary.login.formLabelTwo}
              </label>
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

            <div className="flex items-center justify-between">
              <div className="flex items-center"></div>

              <div className="text-sm leading-6">
                <span
                  className="font-semibold text-cyan-600 hover:text-cyan-500 cursor-pointer"
                  onClick={() => setAuthForm('forgot-password')}
                >
                  {dictionary.login.forgotPassword}
                </span>
              </div>
            </div>

            {errors.length > 0 &&
              errors.map((error: string, index) => (
                <p key={index} className="text-red-700">
                  {error}
                </p>
              ))}
            {message !== '' && <p className="text-green-700">{message}</p>}

            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              <button
                type="submit"
                className="inline-flex w-full justify-center rounded-md bg-cyan-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 sm:col-start-2"
              >
                {dictionary.login.button}
              </button>
              <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                onClick={onDismiss}
                data-autofocus
              >
                {dictionary.login.buttonCancel}
              </button>
            </div>
          </form>
          <p className="mt-10 text-center text-sm text-gray-500">
            {dictionary.login.text}{' '}
            <span
              className="font-semibold leading-6 text-cyan-600 hover:text-cyan-500 cursor-pointer"
              onClick={() => setAuthForm('register')}
            >
              {dictionary.login.link}
            </span>
          </p>
        </div>
      ) : authForm === 'register' ? (
        <div className="text-center">
          <DialogTitle
            as="h3"
            className="text-base font-semibold leading-6 text-gray-900 mb-5"
          >
            {dictionary.register.title}
          </DialogTitle>
          <form
            ref={registerRef}
            className="space-y-6"
            onSubmit={handleRegisterSubmit}
            method="POST"
          >
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                {dictionary.register.formLabelOne}
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                {dictionary.register.formLabelTwo}
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                {dictionary.register.formLabelThree}
              </label>
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
              <label
                htmlFor="passwordConfirm"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                {dictionary.register.formLabelFour}
              </label>
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
                {dictionary.register.button}
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-gray-500">
            {dictionary.register.text}{' '}
            <span
              className="font-semibold leading-6 text-cyan-600 hover:text-cyan-500 cursor-pointer"
              onClick={() => setAuthForm('login')}
            >
              {dictionary.register.link}
            </span>
          </p>
        </div>
      ) : authForm === 'forgot-password' ? (
        <div className="text-center">
          <DialogTitle
            as="h3"
            className="text-base font-semibold leading-6 text-gray-900 mb-5"
          >
            {dictionary.forgotPassword.title}
          </DialogTitle>
          <form
            ref={forgotPasswordRef}
            className="space-y-6"
            onSubmit={handleForgotPasswordSubmit}
            method="POST"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                {dictionary.forgotPassword.formLabel}
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
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
                {dictionary.forgotPassword.button}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <></>
      )}
    </Modal>
  );
}
