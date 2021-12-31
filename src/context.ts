import React from "react";
import {User} from "./interface";

export const UserContext = React.createContext<User>({
    id: 0,
    name: '未登录',
    email: '未知邮件，请先登录',
    avatar: ''
});
