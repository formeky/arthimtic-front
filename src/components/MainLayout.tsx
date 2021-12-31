import TopHeader from "./TopHeader";
import css from '../styles/MainLayout.module.css'
import {useSpring,animated} from "@react-spring/web";

export default function MainLayout({children}){
    const transitions=useSpring({
        from: {
            opacity: 0,
            transform: 'translateY(-30px)'
        },
        to: {
            opacity: 1,
            transform: 'translateY(0)'
        }
    })
    return <div className={css.wrap}>
            <div className={css.header}>
                <TopHeader />
            </div>
        <div className={css.main}>
            <animated.div style={transitions}>
                {children}
            </animated.div>
        </div>
    </div>
}
