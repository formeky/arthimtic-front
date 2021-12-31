import type {NextPage, GetServerSideProps, InferGetServerSidePropsType} from 'next';
import css from '../styles/Index.module.css';
import MainLayout from "../components/MainLayout";
import {UserContext} from "../context";
import {getRank, getStatistics, getUserDetails} from "../ssrLibs";
import Head from "next/head";
import {
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableCaption,
} from '@chakra-ui/react';
import {getReqCookie} from "../utils/common";

export const getServerSideProps: GetServerSideProps = async (context) => {
    const cookie=getReqCookie(context.req.cookies?.auth);
    const rank=await getRank(cookie);
    const statistics=await getStatistics();
    const user=await getUserDetails(cookie);
  return {
    props: {
      user,
        statistics,
        rank
    }
  }
}

const IndexPage: NextPage = ({user,statistics,rank}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
      <UserContext.Provider value={user}>
        <MainLayout>
            <Head>
                <title>首页</title>
            </Head>
                    <div className={css.cardList}>
                        {statistics.map(({name,num,color})=>{
                            return <span
                                key={name}
                                className={css.statisticalCard}
                                style={{backgroundColor: color}}
                            >
                        <p>{num}</p>
                        <p>{name}</p>
                    </span>
                        })}
                    </div>
                    <div className={css.rankWrap}>
                        <Table variant='striped' colorScheme='teal' size='md'>
                            <TableCaption fontSize='1.25rem' className={css.tableCaption} placement='top'>正确率排行榜</TableCaption>
                            <Thead>
                                <Tr>
                                    <Th>用户名</Th>
                                    <Th isNumeric>正确题数</Th>
                                    <Th isNumeric>总练习数</Th>
                                    <Th>正确率</Th>
                                    <Th isNumeric>排行</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {rank.map(({name,correct,all,rank},i)=><Tr key={i}>
                                    <Td>{name}</Td>
                                    <Td isNumeric>{correct}</Td>
                                    <Td isNumeric>{all}</Td>
                                    <Td>{`${(correct/all*100).toFixed(1)}%`}</Td>
                                    <Td isNumeric>{rank}</Td>
                                </Tr>)}
                            </Tbody>
                            <Tfoot>
                                <Tr>
                                    <Th>用户名</Th>
                                    <Th isNumeric>正确题数</Th>
                                    <Th isNumeric>总练习数</Th>
                                    <Th>正确率</Th>
                                    <Th isNumeric>排行</Th>
                                </Tr>
                            </Tfoot>
                        </Table>
                    </div>
        </MainLayout>
      </UserContext.Provider>
  )
}

export default IndexPage
