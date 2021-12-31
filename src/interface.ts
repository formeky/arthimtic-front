export type Avatar='GiCat'|'GiChessQueen'|'GiCastle'|'GiCleopatra'|'GiComputing'

export class User{
    id: number
    avatar: Avatar
    name: string
    email: string
}

export class Statistics{
    name: string
    num: number
    color?: string
}

export class Rank {
    name:string
    correct	:number
    all:number
    rank :number
}

export class Exercise {
    id:number
    create: number
    total: number
    level: number
    correct:number
    status: number
    finish: number
}
