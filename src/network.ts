import {ax} from "./axios";

class UserInfo{
    passwd:string
    email:string
}
export function userLogin(userInfo:UserInfo){
    return ax.post('/api/v1/login',userInfo);
}

export function getCaptcha(email:string){
    return ax.post('/api/v1/captcha',{email});
}

class SignUpInfo {
    name:string
    email:string
    avatar:string
    passwd:string
    captcha:string
}
export function trySignUp(sign:SignUpInfo) {
    return ax.post('/api/v1/signUp',sign);
}

class Exercise{
    total:number
    level:number
}
export function createExercise(info:Exercise){
    return ax.post('/api/v1/exercises',info);
}

export function deleteExercise(id:number){
    return ax.delete(`/api/v1/exercise/${id}`);
}

export function getExercise(id:number){
    return ax.get(`/api/v1/problemList/${id}`);
}
