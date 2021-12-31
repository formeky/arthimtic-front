import {Avatar, User} from "../interface";
import {NextRouter} from "next/router";
import { GiCat,GiChessQueen,GiCastle,GiCleopatra,GiComputing } from 'react-icons/gi';

export function randomRgbColor() {
    let r = Math.floor(Math.random() * 256);
    let g = Math.floor(Math.random() * 256);
    let b = Math.floor(Math.random() * 256);
    return `rgb(${r},${g},${b})`;
}

export function redirectToHome(user:User,toast: any,router : NextRouter) {
    if(user.id!==-1){
        toast({
            title: '您已登录',
            description: '您已登录，即将跳转至首页',
            status: 'success',
            isClosable: true,
            position: 'top'
        });
        router.replace('/');
    }
}

export const allAvatars={
    GiCat,GiChessQueen,GiCastle,GiCleopatra,GiComputing
}
export function sampleAvatar(name: Avatar) {
    if(!name) return GiCat;
    return allAvatars[name];
}

export function getReqCookie(cookie:string|undefined) {
    if(cookie){
        return `auth=${cookie};`;
    }
    return '';
}

export function dateFormatter(ms:number){
    const date=new Date(ms),
        year=date.getFullYear(),
        mouth=(date.getMonth()+1).toString(),
        day=date.getDate().toString(),
        hour=date.getHours().toString(),
        min=date.getMinutes().toString();
    return `${year}年${
        mouth.length===2?mouth:'0'+mouth
    }月${
        day.length===2?day:'0'+day
    }日 ${
        hour.length===2?hour:'0'+hour
    }:${
        min.length===2?min:'0'+min
    }`
}
