
 interface SignupBodyRequest  extends Omit<User,'timestamp' | 'id'  | 'account_verifyed' | 'last_login' | 'role'> {}

 interface LoginBodyRequest {
    email?:string;
    password?:string
}

export interface SignupRequest extends Express.Request{
    body:SignupBodyRequest
}

export interface User {
    timestamp:Date;
    id:string;
    first_name:string;
    last_name:string;
    email:string;
    password:string;
    account_verifyed:boolean;
    last_login:string;
    role:string;
    phone:string;
}

export interface LoginRequest extends Express.Request{
    body:LoginBodyRequest
}
