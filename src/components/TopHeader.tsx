import css from '../styles/TopHeader.module.css';
import signinIcon from '../assets/icons/signin.svg';
import {UserContext} from "../context";
import { BsFillBinocularsFill } from "react-icons/bs";
import Link from 'next/link';
import {useState, useContext, ReactElement} from "react";
import {useSpring,animated} from "@react-spring/web";
import {useRouter} from "next/router";
import {Avatar, Icon} from "@chakra-ui/react";
import {allAvatars, sampleAvatar} from "../utils/common";

export default function TopHeader() {
    const router=useRouter();

    const [showDrop,setDrop]=useState(false);

    const dropStyles = useSpring(showDrop?{
        to: [
            { opacity: 0, visibility: 'visible' },
            { opacity: 1, visibility: 'visible' },
        ],

    }:{
        to: [
            { opacity: 0, visibility: 'visible' },
            { opacity: 0, visibility: 'hidden' },
        ],
    });

    const user=useContext(UserContext);

    const [pathname,setPath]=useState(router.pathname);

    const handleDrop=(e)=>{
        if(user.id!==-1) {
            if(e.type==='mouseenter'){
                setDrop(true);
            } else {
                setDrop(false);
            }
        }
    }

    const handleLogout=()=>{
        document.cookie='auth=;'
        location.reload();
    }

    const handleClick=()=>{
        if(user.id===-1 && pathname!=='/login'){
            router.push('/login');
        }
        setDrop(false);
    }

    const handlePath=({target})=>{
        setPath(target.getAttribute('href'));
    }

    const route=[
        {
            name: '首页',
            path: '/'
        },
        {
            name: '练习',
            path: '/practice'
        },
        {
            name: '错题集',
            path: '/collection'
        }
    ]

    return <div className={css.header}>
        <span>
            <BsFillBinocularsFill className={css.logo}/>
            <span className={css.title}>
                <Link href='/'>口算练习</Link>
            </span>
        </span>
        <span className={css.navList}>
            {route.map((e)=>{
                return <Link href={e.path} key={e.path}>
                    <a
                        onClick={handlePath}
                        className={css.navItem}
                        data-active={e.path===pathname}
                    >
                        {e.name}
                    </a>
                </Link>
            })}
            <span className={css.indicator}/>
        </span>
        <span
            className={css.userDetail}
            onMouseEnter={handleDrop}
            onMouseLeave={handleDrop}
            onClick={handleClick}
        >
                    <span className={css.userName}>{user.name}</span>
            <Avatar
                src={user.id!==-1?null:signinIcon.src}
                icon={user.id===-1?undefined:<Icon
                    as={sampleAvatar(user.avatar)}
                    boxSize='1.5rem'
                    color='rgb(153,123,190)'
                />
                }
                showBorder
                borderColor={user.id===-1?'#fff':'#A0AEC0'}
                bg={user.id===-1?'#fff':'green.50'}
                verticalAlign={user.id===-1?'-10px':'-5px'}
                boxSize='2.5rem'
            />
                    <animated.div style={dropStyles} className={css.userDrop}>
                        <div>{`邮箱: ${user.email}`}</div>
                        <div onClick={handleLogout}>退出登录</div>
                    </animated.div>
                </span>
    </div>
}
