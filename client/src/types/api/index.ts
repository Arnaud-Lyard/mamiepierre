import { IUser } from '../models';

export interface IResponse {
  status: string;
  message: string;
  data: {
    isConnect: boolean;
  };
}

export interface IProfileResponse {
  status: string;
  data: {
    user: IUser;
  };
}

export interface IError {
  status: string;
  errors?: IErrorDtoInfos[];
  message?: string;
}

export interface IErrorDtoInfos {
  code: string;
  minimum?: number;
  type?: string;
  inclusive?: boolean;
  exact?: boolean;
  message: string;
  path: string[];
}
