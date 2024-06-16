import { useState } from 'react';
import { IError, IErrorDtoInfos } from '../types/api';

export function useErrorHandling() {
  const [errors, setErrors] = useState<string[]>([]);
  const [message, setMessage] = useState<string>('');

  const checkErrors = (error: IError) => {
    if (error.errors?.length) {
      setErrors(error.errors.map((err: IErrorDtoInfos) => err.message));
    } else if (error.message) {
      setErrors([error.message]);
    } else {
      setErrors(['An error occurred, please try again']);
    }
  };

  const resetMessages = () => {
    setTimeout(() => {
      setErrors([]);
      setMessage('');
    }, 5000);
  };

  return { errors, message, checkErrors, resetMessages, setMessage };
}
