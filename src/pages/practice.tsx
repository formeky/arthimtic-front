import type {NextPage, GetServerSideProps, InferGetServerSidePropsType} from 'next';
import css from '../styles/Practice.module.css';
import MainLayout from "../components/MainLayout";
import {UserContext} from "../context";
import {getExercises, getUserDetails} from "../ssrLibs";
import Head from "next/head";
import {
    useToast, Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    SliderMark, FormLabel,
    Select, VStack, Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody
    , useDisclosure,
} from '@chakra-ui/react';
import {ArrowForwardIcon,ArrowBackIcon} from '@chakra-ui/icons'
import React, {useEffect, useRef, useState} from "react";
import {useRouter} from "next/router";
import {dateFormatter, getReqCookie} from "../utils/common";
import {useTransition,animated} from '@react-spring/web';
import {createExercise, deleteExercise, getExercise} from "../network";

export const getServerSideProps: GetServerSideProps = async (context) => {
    const cookie=getReqCookie(context.req.cookies?.auth);
    const user=await getUserDetails(cookie);
    const exercises=await getExercises(cookie);
    return {
        props: {
            user,
            exercises
        }
    }
}

const PracticePage: NextPage = ({user,exercises}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const toast=useToast({
        position: 'top',
        isClosable: true,
        status: 'warning',
    });

    const router=useRouter();

    useEffect(()=>{
        if(user.id==-1){
            toast({
                title: '用户未登录',
                description: '您必须先登录再进行练习',
            });
            router.push('/login');
        }
    },[user])

    if(user.id==-1){
        return <UserContext.Provider value={user}>
            <MainLayout>
                <Head>
                    <title>练习</title>
                </Head>
            </MainLayout>
        </UserContext.Provider>
    }

    const [problems,setProblems]=useState(exercises);
    const [sliderValue, setSliderValue] = useState(25);

    const [showExercise,setShowExercise] = useState(false)
    const transitions = useTransition(showExercise, {
        from: { opacity: 0,top: '-30px' },
        enter: { opacity: 1 ,top: '0'},
        leave: { opacity: 0 ,top: '-30px'},
    })

    const { isOpen, onOpen, onClose } = useDisclosure()

    const formData=useRef({
        total: 0,
        level: 0,
        delete: 0
    });

    const [collect,setCollect]=useState({
        id: -1,
        data: [],
        loading: false
    });

    const handleHasOpened=()=>{
        toast({
            title: '无法完成操作',
            description: `请先保存并关闭当前习题`,
            position: 'top',
            status: 'info'
        })
    }

    const handleShowExercise=async (e)=>{
        const action=e.target.dataset.action;
        if(showExercise && (action==='show'||action==='delete')) {
            handleHasOpened();
            return;
        }
        const id=(+e.target.dataset.id);
        if(action==='show') {
            setCollect({...collect,loading: true,id});
            const res=await getExercise(id);
            if(res.data?.code===200){
                setCollect({data: res.data.data.list,loading: false,id});
                setShowExercise(!showExercise);
            } else {
                toast({
                    title: '打开习题失败',
                    description: `获取习题题目列表失败`,
                    position: 'top',
                    status: 'warning'
                });
                setCollect({data: res.data.data.list,loading: false,id});
            }
        } else if(action==='delete'){
            formData.current.delete=id;
            onOpen();
        }
    }

    const handleSelect=(e:React.ChangeEvent<HTMLSelectElement>)=>{
        const value=+(e.target.value);
        if(!isNaN(value)){
            formData.current.level=value;
        }
    }

    const [creating,setCreating]=useState(false);
    const handleCreate=async ()=>{
        if(showExercise){
            handleHasOpened();
            return;
        }
        setCreating(true);
        const res=await createExercise(formData.current);
        if(res.data?.code){
            const current=formData.current;
            problems.unshift({
                level: current.level,
                total: current.total,
                correct: 0,
                finish: 0,
                status: 0,
                create: 0,
                id: -1,
                ...res.data.data,
            });
            setProblems([...problems]);
        } else {
            toast({
                title: '创建失败',
                description: `创建失败，${res.data?.msg}`,
                position: 'top',
                status: 'warning'
            })
        }
        setCreating(false);
    }

    const handleDelete=async ()=>{
        onClose();
        const id=formData.current.delete;
        const res=await deleteExercise(id);
        if(res.data?.code===200){
            toast({
                title: '删除成功',
                description: `id为${id}的练习题删除成功}`,
                position: 'top',
                status: 'success'
            });
            setProblems(problems.filter(item=>item.id===id));
        } else {
            toast({
                title: '删除失败',
                description: `删除失败，${res.data?.msg}`,
                position: 'top',
                status: 'warning'
            })
        }
    }

    return (
        <UserContext.Provider value={user}>
            <MainLayout>
                <Head>
                    <title>练习</title>
                </Head>
                <div className={css.main} onClick={handleShowExercise}>
                    <VStack className={css.createWrap} spacing={3} align='flex-start'>
                        <FormLabel fontSize='1.125rem'>新建习题</FormLabel>
                        <FormLabel fontSize='1rem'>题目难度</FormLabel>
                        <Select placeholder='请选择题目难度' size='sm' colorScheme='cyan' onChange={handleSelect}>
                            <option value='1'>一年级</option>
                            <option value='2'>二年级</option>
                            <option value='3'>三年级</option>
                            <option value='4'>四年级</option>
                            <option value='5'>五年级</option>
                            <option value='6'>六年级</option>
                        </Select>
                        <FormLabel fontSize='1rem'>题目数量</FormLabel>
                        <div className={css.numPicker}>
                            <Slider onChange={(val) => {
                                formData.current.total=val;
                                setSliderValue(val)
                            }} max={50} min={1}>
                                <SliderMark value={10} mt='1' ml='-2.5' fontSize='sm'>10</SliderMark>
                                <SliderMark value={20} mt='1' ml='-2.5' fontSize='sm'>20</SliderMark>
                                <SliderMark value={30} mt='1' ml='-2.5' fontSize='sm'>30</SliderMark>
                                <SliderMark value={40} mt='1' ml='-2.5' fontSize='sm'>40</SliderMark>
                                <SliderMark
                                    value={sliderValue}
                                    textAlign='center'
                                    bg='blue.500'
                                    color='white'
                                    mt='-10'
                                    ml='-5'
                                    w='12'
                                >
                                    {sliderValue}
                                </SliderMark>
                                <SliderTrack>
                                    <SliderFilledTrack />
                                </SliderTrack>
                                <SliderThumb />
                            </Slider>
                        </div>
                        <Button colorScheme='blue' size='md' width='100%' variant='solid' fontSize='13px'
                                isLoading={creating} loadingText='创建中' onClick={handleCreate}
                        >
                            创建练习题
                        </Button>
                        <FormLabel fontSize='1.125rem'>最近创建</FormLabel>
                        <div className={css.exerciseList}>
                            {problems.slice(0,2).map(({id, create, total, level, correct, status, finish})=>{
                                let statusTips='开始练习';
                                if(status===2) statusTips='继续练习';
                                else if(status===4) statusTips='查看练习'
                                return <div className={css.exerciseCard} key={id}>
                                    <p className={css.exerciseTitle}>试题：{id}</p>
                                    <p className={css.exerciseInfo}>习题数量：{total}</p>
                                    <p className={css.exerciseInfo}>创建时间：{dateFormatter(create)}</p>
                                    {/*<p className={css.exerciseInfo}>完成时间{finish?finish:'未完成'}</p>*/}
                                    <div>
                                        <Button colorScheme='teal'
                                                isLoading={collect.loading&&collect.id===id}
                                                loadingText='加载中'
                                                size='xs' marginRight='25px' data-action='show' data-id={id}>
                                            {statusTips}
                                        </Button>
                                        <Button colorScheme='red' size='xs' data-action='delete' data-id={id}>
                                            删除习题
                                        </Button>
                                    </div>
                                </div>
                            })}
                        </div>
                    </VStack>
                    <div className={css.exerciseWrap}>
                        <div>
                            {problems.map(({id, create, total, status, finish})=>{
                                let statusTips='开始练习';
                                if(status===2) statusTips='继续练习';
                                else if(status===4) statusTips='查看练习'
                                return <div className={css.allExerciseCard} key={id}>
                                    <p className={css.exerciseTitle}>试题：{id}</p>
                                    <p className={css.exerciseInfo}>习题数量：{total}</p>
                                    <p className={css.exerciseInfo}>创建时间：{dateFormatter(create)}</p>
                                    <p className={css.exerciseInfo}>完成时间：{finish?dateFormatter(finish):'未完成'}</p>
                                    <div>
                                        <Button colorScheme='teal'
                                                isLoading={collect.loading&&collect.id===id}
                                                loadingText='加载中'size='xs' marginRight='25px' data-action='show' data-id={id}>
                                            {statusTips}
                                        </Button>
                                        <Button colorScheme='red' size='xs' data-action='delete' data-id={id}>
                                            删除习题
                                        </Button>
                                    </div>
                                </div>
                            })}
                        </div>
                    </div>
                    {transitions((style,show)=>{
                        if(!show) return null;
                        return <animated.div className={css.problemWrap} style={style}>
                            <div className={css.answerWrap}>
                                <div>
                                    <Button leftIcon={<ArrowBackIcon />} colorScheme='teal' h={7} variant='solid'>
                                        上一题
                                    </Button>
                                    <Button rightIcon={<ArrowForwardIcon />} colorScheme='teal' float='right' h={7} variant='solid'>
                                        下一题
                                    </Button>
                                </div>
                                <p className={css.expression}>23 + 18 = ?</p>
                                <div>
                                    <div style={{width:'216px',float: 'left'}}>
                                        {Array.from(new Array(9),(_,i)=>i).map(num=>{
                                            return <span key={num} className={css.keyboardItem}>{num+1}</span>
                                        })}
                                        <span className={css.keyboardItem}>0</span>
                                        <span className={css.keyboardItem}>清空</span>
                                        <span className={css.keyboardItem}>删除</span>
                                    </div>
                                </div>
                                <div style={{width:'216px',height: '240px',float: 'right',display: 'flex',alignItems:'center',flexDirection: 'column',justifyContent: 'space-around'}}>
                                    <Button colorScheme='red' w='100%' variant='outline'>退出练习</Button>
                                    <Button colorScheme='teal' w='100%' variant='outline'>保存练习</Button>
                                    <Button colorScheme='teal' w='100%' variant='solid'>提交练习</Button>
                                </div>
                            </div>
                            <div className={css.answerStatus}>
                                <FormLabel mb={3}>答题情况</FormLabel>
                                {collect.data.map(({userAnswer,question},i)=>{
                                    return <span key={question} data-finish={userAnswer!==-1} className={css.statusItem}>{i}</span>
                                })}
                            </div>
                        </animated.div>
                    })}
                    <Modal isOpen={isOpen} onClose={onClose}>
                        <ModalOverlay />
                        <ModalContent>
                            <ModalHeader color='red.500'>删除确认</ModalHeader>
                            <ModalBody>
                                确定要删除 习题{formData.current.delete} 吗？
                            </ModalBody>

                            <ModalFooter>
                                <Button variant='solid' color='green.500' mr={3} onClick={onClose} borderColor='#fff'>
                                    取消
                                </Button>
                                <Button variant='ghost' color='red.500' onClick={handleDelete}>删除</Button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>
                </div>

            </MainLayout>
        </UserContext.Provider>
    )
}

export default PracticePage
