import type {NextPage, GetServerSideProps, InferGetServerSidePropsType} from 'next';
import css from '../styles/Practice.module.css';
import MainLayout from "../components/MainLayout";
import {UserContext} from "../context";
import {getRank, getStatistics, getUserDetails} from "../ssrLibs";
import Head from "next/head";
import {Table} from '@chakra-ui/react';

export const getServerSideProps: GetServerSideProps = async (context) => {

    const user=await getUserDetails(context.req.cookies?.auth);
    return {
        props: {
            user,
        }
    }
}

const PracticePage: NextPage = ({user}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    return (
        <UserContext.Provider value={user}>
            <MainLayout>
                <Head>
                    <title>练习</title>
                </Head>

            </MainLayout>
        </UserContext.Provider>
    )
}

export default PracticePage
