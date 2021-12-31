import type {NextPage, GetServerSideProps, InferGetServerSidePropsType} from 'next';
import css from '../styles/Login.module.css';
import MainLayout from "../components/MainLayout";
import {UserContext} from "../context";
import {getUserDetails} from "../ssrLibs";
import {useSpring,animated} from "@react-spring/web";
import Head from "next/head";
import {Input, InputRightElement, InputLeftElement, InputGroup, Stack, Button,useToast} from '@chakra-ui/react'
import {useState} from "react";
import Link from 'next/link';
import { EmailIcon,UnlockIcon } from '@chakra-ui/icons'
import {userLogin} from "../network";
import {getReqCookie} from "../utils/common";

export const getServerSideProps: GetServerSideProps = async (context) => {
    const cookie=getReqCookie(context.req.cookies?.auth);
    const user=await getUserDetails(cookie);
    return {
        props: {
            user,
        }
    }
}

const LoginPage: NextPage = ({user}: InferGetServerSidePropsType<typeof getServerSideProps>) => {

    const [showPasswd,setShowPasswd]=useState(false);

    const handleShowPasswd=()=>{
        setShowPasswd(!showPasswd)
    }

    const enterStyles=useSpring({
        from: {
            marginTop: '15vh',
        },
        to: {
            marginTop: '20vh',
        }
    });

    const [login,setLogin]=useState(false);

    const [email,setEmail]=useState('');
    const [passwd,setPasswd]=useState('');
    const [isInvalid,setIsInvalid]=useState({
        email: false,
        passwd: false
    })

    const handleEmail=({target})=>{
        isInvalid.email=false;
        setEmail(target.value);
    }

    const handlePasswd=({target})=>{
        isInvalid.passwd=false;
        setPasswd(target.value);
    }

    const toast = useToast()

    const handleSubmit=async ()=>{
        setLogin(true);
        const invalid={
            email: false,
            passwd: false
        }
        if(!/\w+@\w+\.\w/.test(email)){
            invalid.email=true;
        }
        if(!/.+/.test(passwd)){
            invalid.passwd=true;
        }
        if(invalid.email||invalid.passwd){
            setIsInvalid(invalid);
            setLogin(false);
        } else {
            const res= await userLogin({passwd,email});
            if(res.data?.code===200){
                history.back();
            } else {
                toast({
                    title: '登录失败',
                    description: res.data?.msg,
                    status: 'warning',
                    isClosable: true,
                    position: 'top'
                })
                setLogin(false);
            }
        }
    }

    const handleKeyDown=(e)=>{
        if(e.keyCode===13) {
            handleSubmit();
        }
    }

    return (
        <UserContext.Provider value={user}>
            <Head>
                <title>用户登录</title>
            </Head>
            <MainLayout>
                <animated.div className={css.wrap} style={enterStyles} onKeyDown={handleKeyDown}>
                    <p className={css.title}>你好，欢迎登录！</p>
                    <Stack spacing={4}>
                        <InputGroup>
                            <InputLeftElement
                                pointerEvents='none'
                                fontSize='1.2em'
                                children={<EmailIcon color='blue.400' />}
                            />
                            <Input
                                type='text'
                                placeholder='请输入邮箱'
                                value={email}
                                onChange={handleEmail}
                                isInvalid={isInvalid.email}
                            />
                        </InputGroup>

                        <InputGroup>
                            <InputLeftElement
                                pointerEvents='none'
                                fontSize='1.2em'
                                children={<UnlockIcon color='blue.400' />}
                            />
                            <Input
                                value={passwd}
                                placeholder='请输入密码'
                                onChange={handlePasswd}
                                type={showPasswd ? 'text' : 'password'}
                                isInvalid={isInvalid.passwd}
                            />
                            <InputRightElement width='4.5rem'>
                                <Button h='1.75rem' size='sm' onClick={handleShowPasswd}>
                                    {showPasswd ? '显示' : '隐藏'}
                                </Button>
                            </InputRightElement>
                        </InputGroup>
                    </Stack>
                    <div className={css.loginTips}>
                        <div className={css.noAccount}>
                            <span>没有账号？</span>
                            <Link href='/signUp'>
                                <a className={css.redirectBtn}>前往注册</a>
                            </Link>
                        </div>

                        <div className={css.forgetPasswd}>
                            <span>忘记密码？</span>
                            <Link href='/reset'>
                                <a className={css.redirectBtn}>前往重置</a>
                            </Link>
                        </div>
                    </div>
                    <Button
                        isLoading={login}
                        loadingText='正在登录……'
                        colorScheme='teal'
                        variant='outline'
                        width='100%'
                        className={css.submit}
                        onClick={handleSubmit}
                    >
                        登 录
                    </Button>
                </animated.div>
            </MainLayout>
        </UserContext.Provider>
    )
}

export default LoginPage
