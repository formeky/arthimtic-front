/**
 * 算术表达式生成类
 */
import {PARSE_OPERATOR_ERROR} from "../errors";

type Operator='+' | '-' | '*' | '/' | '×' | '÷';

class AExpression {
    outerText: string;
    numsList: number[];
    opsList: Operator[];
    static parseExpression(text:string):AExpression{
        const newE:AExpression={
            outerText: null,
            opsList: [],
            numsList: []
        }
        const nums=text.match(/\d+/g);
        const ops=text.match(/[+\-*\/×÷]/g);
        if(nums.length>1 && nums.length === ops.length+1){
            ops.forEach((item:string)=> {
                if(item==='+'||item==='-'||item==='/'
                    ||item==='*' ||item==='×'||item==='÷'
                ){
                    newE.opsList.push(item)
                } else {
                    throw new TypeError(PARSE_OPERATOR_ERROR);
                }
            });
            nums.forEach((item:string)=> {
                const num=(+item);
                if(!isNaN(num)) {
                    newE.numsList.push(num);
                } else {
                    throw new TypeError(PARSE_OPERATOR_ERROR);
                }
            });
            const text:string[]=[nums[0]];
            ops.forEach((operator,index)=>{
                text.push(operator,nums[index+1]);
            });
            newE.outerText=text.join(' ');
            return newE;
        } else {
            throw new Error(PARSE_OPERATOR_ERROR);
        }
    }
    static toString(){}
}

class Arithmetic {
    __hasUsed: AExpression[];
    /**
     * @Description: 判断传入的表达式是否已存在
     */
    isDuplicate(e : AExpression) : Boolean{
        const newE:AExpression=AExpression.parseExpression(e.outerText);
        this.__hasUsed.forEach(item=>{
            if(item.outerText===e.outerText){

            }
        });
        return
    }
    /**
     * @Description: 生成新的算数表达式
     */
    renderExpression(option):AExpression{
        // do something
        return null;
    }
}

export {
    Arithmetic,
    AExpression
};
export type { Operator };
