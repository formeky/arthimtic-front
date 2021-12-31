import type {NextPage, GetServerSideProps, InferGetServerSidePropsType} from 'next';
import css from '../styles/Login.module.css';
import css2 from '../styles/SignUp.module.css';
import MainLayout from "../components/MainLayout";
import {UserContext} from "../context";
import {getUserDetails} from "../ssrLibs";
import Head from "next/head";
import {
    Input, InputRightElement, InputLeftElement,
    InputGroup, Stack, Button, useToast, PinInput, PinInputField, HStack,
    FormLabel, Avatar,  AvatarGroup, Icon
} from '@chakra-ui/react'
import {useEffect, useRef, useState} from "react";
import { EmailIcon,UnlockIcon } from '@chakra-ui/icons'
import {getCaptcha, trySignUp} from "../network";
import {useRouter} from "next/router";
import classArray from "../utils/classArray";
import {BsFillPersonFill} from 'react-icons/bs';
import {allAvatars, getReqCookie, randomRgbColor, redirectToHome} from "../utils/common";

export const getServerSideProps: GetServerSideProps = async (context) => {
    const cookie=getReqCookie(context.req.cookies?.auth);
    const colors=Array.from(new Array(10),randomRgbColor);
    const user=await getUserDetails(cookie);
    const avatarNames=Object.getOwnPropertyNames(allAvatars);
    return {
        props: {
            user,
            colors,
            avatarNames
        }
    }
}

const SignUpPage: NextPage = ({user,colors,avatarNames}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const router=useRouter();

    const toast = useToast()

    const captchaTips=useRef('获取验证码');
    const pinCode=useRef('');

    const [signIn,setSignIn]=useState(false);

    const [name,setName]=useState('');
    const [email,setEmail]=useState('');
    const [passwd1,setPasswd1]=useState('');
    const [passwd2,setPasswd2]=useState('');
    const [captcha,setCaptcha]=useState(60);
    const [avatar,setAvatar]=useState(0);
    const [isInvalid,setIsInvalid]=useState({
        name: false,
        email: false,
        passwd1: false,
        passwd2: false,
        captcha: false
    });

    const handleEmail=({target})=>{
        setEmail(target.value);
        setIsInvalid({
            ...isInvalid,
            email: !/\w+@\w+\.\w/.test(target.value),
        });
    }

    const handleName=({target})=>{
        setName(target.value);
        setIsInvalid({
            ...isInvalid,
            name: target.value.length<3,
        });
    }

    const handleCaptcha=()=>{
        if(!email||captcha!==60||isInvalid.email) {
            if(!isInvalid.email){
                setIsInvalid({
                    ...isInvalid,
                    email: true
                });
            }
            return;
        }
        const errorToast = toast.bind(null,{
            title: '邮件发送失败',
            description: '邮件失败，返回状态码不为200',
            status: 'warning',
            position: 'top'
        });
        getCaptcha(email).then(res=>{
            if(res.data?.code===200){
                toast({
                    title: '邮件已成功',
                    description: '邮件发送成功，请注意查收',
                    status: 'success',
                    position: 'top'
                });
                setCaptcha(59);
            } else {
                errorToast();
            }
        },()=>{
            errorToast();
        })
    }
    useEffect(()=>{
        if(captcha>0 && captcha<60){
            setTimeout(setCaptcha.bind(null,captcha-1),1000);
        } else if(captcha===0){
            captchaTips.current='再次获取';
            setCaptcha(60);
        }
    },[captcha])

    const handlePasswd1=({target})=>{
        const value=target.value;
        setPasswd1(value);
        const char=value.match(/[a-zA-Z]/g),
            num=value.match(/\d/g);
        setIsInvalid({
            ...isInvalid,
            passwd1: !(char && num &&value.length>7),
        });
    }

    const handlePasswd2=({target})=>{
        const value=target.value;
        setPasswd2(value);
        setIsInvalid({
            ...isInvalid,
            passwd2: passwd1!==value,
        });
    }

    const handleAvatar=({target})=>{
        const index= (+target.dataset.index);
        if(!isNaN(index)) setAvatar(index);
    }

    const handleSubmit=async ()=>{
        setSignIn(true);
        if(pinCode.current.length!==6){
            setIsInvalid({
                ...isInvalid,
                captcha: true
            });
            setSignIn(false);
            return
        }
        if(isInvalid.email||isInvalid.captcha
            ||isInvalid.name||isInvalid.passwd1
        ){
            setSignIn(false);
            return;
        }
        const res=await trySignUp({
            name,
            email,
            captcha: pinCode.current,
            passwd: passwd1,
            avatar: avatarNames[avatar]
        });
        if(res.data?.code===200){
            toast({
                title: '注册成功',
                description: '注册成功，即将跳转至首页',
                status: 'success',
                position: 'top'
            });
            router.replace('/');
        } else {
            toast({
                title: '注册失败',
                description: `注册未成功，${res.data?.msg}`,
                status: 'warning',
                position: 'top'
            });
        }
        setSignIn(false);
    }

    const handlePin=(value)=>{
        pinCode.current=value;
        setIsInvalid({
            ...isInvalid,
            captcha: false
        })
    }

    useEffect(()=>{
        redirectToHome(user,toast,router);
    },[user])

    const judgeColor=value=>value?'red.500':'blue.500'

    return (
        <UserContext.Provider value={user}>
            <Head>
                <title>创建账户</title>
            </Head>
            <MainLayout>
                <div className={classArray([css.wrap,css2.wrap])}>
                    <p className={css.title}>创建账户</p>
                    <FormLabel fontWeight='bold'>用户信息</FormLabel>
                    <Stack spacing={3}>
                        <InputGroup>
                            <InputLeftElement
                                pointerEvents='none'
                                fontSize='1.2em'
                                children={<Icon color='blue.500' as={BsFillPersonFill}/>}
                            />
                            <Input
                                type='text'
                                placeholder='用户名，至少三个字母'
                                value={name}
                                onChange={handleName}
                                isInvalid={isInvalid.name}
                                focusBorderColor={judgeColor(isInvalid.name)}
                            />
                        </InputGroup>

                        <InputGroup>
                            <InputLeftElement
                                pointerEvents='none'
                                fontSize='1.2em'
                                children={<EmailIcon color='blue.400' />}
                            />
                            <Input
                                type='text'
                                placeholder='邮箱'
                                value={email}
                                onChange={handleEmail}
                                isInvalid={isInvalid.email}
                                focusBorderColor={judgeColor(isInvalid.email)}
                            />
                            <InputRightElement width='4.5rem' marginRight='5px'>
                                <Button
                                    onClick={handleCaptcha}
                                    h='1.25rem'
                                    size='sm'
                                    disabled={captcha!==60}
                                >
                                    {captcha===60?captchaTips.current:`${captcha} s`}
                                </Button>
                            </InputRightElement>
                        </InputGroup>

                        <InputGroup>
                            <InputLeftElement
                                pointerEvents='none'
                                fontSize='1.2em'
                                children={<UnlockIcon color='blue.400' />}
                            />
                            <Input
                                value={passwd1}
                                placeholder='密码，8位以上，包含数字和字母'
                                onChange={handlePasswd1}
                                isInvalid={isInvalid.passwd1}
                                focusBorderColor={judgeColor(isInvalid.passwd1)}
                            />
                        </InputGroup>

                        <InputGroup>
                            <InputLeftElement
                                pointerEvents='none'
                                fontSize='1.2em'
                                children={<UnlockIcon color='blue.400' />}
                            />
                            <Input
                                value={passwd2}
                                placeholder='再次输入密码'
                                onChange={handlePasswd2}
                                type='password'
                                isInvalid={isInvalid.passwd2}
                                focusBorderColor={judgeColor(isInvalid.passwd2)}
                            />
                        </InputGroup>
                    </Stack>

                    <FormLabel fontWeight='bold' marginTop='10px'>验 证 码</FormLabel>
                    <HStack justify='space-between'>
                        <PinInput id='captcha' type='number' onComplete={handlePin} isInvalid={isInvalid.captcha}>
                            <PinInputField />
                            <PinInputField />
                            <PinInputField />
                            <PinInputField />
                            <PinInputField />
                            <PinInputField />
                        </PinInput>
                    </HStack>
                    <FormLabel fontWeight='bold' marginTop='10px'>选择头像</FormLabel>
                    <AvatarGroup spacing='1rem' onClick={handleAvatar}>
                        {avatarNames.map((key,index)=>{
                            return <Avatar
                                key={index}
                                bg='green.50'
                                data-index={index}
                                borderColor='#fff'
                                showBorder={true}
                                cursor='pointer'
                                data-selected={index===avatar}
                                className={css2.allAvatars}
                                icon={<Icon
                                    as={allAvatars[key]}
                                            boxSize='1.75rem'
                                            color={colors[index]
                                            }
                                    pointerEvents='none'
                                />}
                            />
                        })}
                    </AvatarGroup>
                    {/*<div className={css.loginTips}>*/}

                    {/*    <div className={css.forgetPasswd}>*/}
                    {/*        <span>忘记密码？</span>*/}
                    {/*        <Link href='/reset'>*/}
                    {/*            <a className={css.redirectBtn}>前往重置</a>*/}
                    {/*        </Link>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                    <Button
                        colorScheme='teal'
                        variant='outline'
                        width='100%'
                        className={css.submit}
                        onClick={router.replace.bind(null,'/login')}
                    >
                        返回登陆
                    </Button>
                    <Button
                        isLoading={signIn}
                        loadingText='正在注册……'
                        // colorScheme='green'
                        variant='outline'
                        width='100%'
                        color='green.50'
                        _hover={{ bg: 'green.500' }}
                        bg='green.400'
                        className={css.submit}
                        onClick={handleSubmit}
                    >
                        立即注册
                    </Button>
                </div>
            </MainLayout>
        </UserContext.Provider>
    )
}

export default SignUpPage
