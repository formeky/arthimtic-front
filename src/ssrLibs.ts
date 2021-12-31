import {ax} from "./axios";
import {Rank, Statistics, User,Exercise} from "./interface";
import {randomRgbColor} from "./utils/common";

type BaseDto={
    code: number,
    msg: string
}

type UserDetailsDto=BaseDto&{
    data: User,
}
export const getUserDetails=async (cookie):Promise<User>=>{
    const errorRes={
        id: -1,
        name: '未登录',
        email: '未知，请先登录',
        avatar: null
    };
    if(!cookie) return errorRes;
    return await ax.get<UserDetailsDto>('/api/v1/userDetails',{
        headers:{
            cookie
        }
    }).then(res=>{
        return res.data?.data||errorRes;
    },err=>{
        return errorRes;
    });
}

type StatisticsDto=BaseDto&{
    data: Statistics[]
}
export const getStatistics=async ():Promise<Statistics[]>=>{
    return await ax.get<StatisticsDto>('/api/v1/statistics').then(res=>{
        return res.data?.data?.map(e=>{
            e.color=randomRgbColor();
            return e;
        })||[];
    },err=>{
        return [];
    })
}

type RankDto=BaseDto&{
    data: Rank[]
}
export const getRank=async (cookie:string): Promise<Rank[]> =>{
    return await ax.get<RankDto>('/api/v1/rank',{headers:{cookie}}).then(res=>{
        return res.data?.data||[];
    },err=>{
        return [];
    })
}

type ExercisesDto=BaseDto&{
    data: Exercise[]
}

export const getExercises=async (cookie:string):Promise<Exercise[]>=>{
    return await  ax.get<ExercisesDto>('/api/v1/exercises',{headers:{cookie}}).then(res=>{
        return res.data?.data || [];
    },err=>{
        return [];
    })
}
