import express from 'express';
import {prisma} from '../utils/prisma/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import joiSchema from '../joi.js';

const {UserSchema} = joiSchema;

const router = express.Router();

// 1. 회원가입 API (소비자/사장님)

router.post('/sign-up', async(req, res, next) => {
    try{
    const validation = await UserSchema.validateAsync(req.body);
    const {nickname, password, userType} = validation;

    const user = await prisma.users.findFirst({where : {nickname : nickname}})

    if(user){return res.status(401).json({message : "중복된 닉네임 입니다."});}

    const hashedpassword = await bcrypt.hash(password, 10);

    await prisma.users.create({
        data : {
            nickname : nickname,
            password : hashedpassword,
            userType : userType
        }
    })
    return res.status(200).json({message : "회원가입이 완료되었습니다."})
    }catch(err){
        next(err);
    }
})

// 2. 로그인 API (소비자/사장님)
router.post('/sign-in', async(req, res, next) => {
    try{
    const {nickname, password} = req.body;

    const findUser = await prisma.users.findFirst({where : {nickname : nickname}});

    const decodedPassword = await bcrypt.compare(password, findUser.password)

    if(!decodedPassword){return res.status(400).json({message : "비밀번호가 틀립니다."});}

    const Token = jwt.sign(
        {
        userId : findUser.userId,
        nickname : findUser.nickname,
        userType : findUser.userType
        }, 'secretKey'
    )
    res.cookie('Lv4Token', `Bearer ${Token}`);
    return res.status(200).json({message : "로그인 성공"});
    }catch(err){
        next(err);
    }
})


export default router;