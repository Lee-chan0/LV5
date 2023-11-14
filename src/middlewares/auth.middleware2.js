import { prisma } from '../utils/prisma/index.js';
import jwt from 'jsonwebtoken';

export default async function (req, res, next) {
    try{
    const {Lv4Token} = req.cookies;
    
    const [tokenType, token] = Lv4Token.split(' ');

    if (tokenType !== 'Bearer') {return res.status(400).json({ message: "Bearer토큰 형식이 아닙니다." })}

    const decodedToken = jwt.verify(token, 'secretKey')
    const userId = decodedToken.userId;

    const findUser = await prisma.users.findFirst({ where: { userId: +userId } });
    if (!findUser) {
        res.clearCookie('Lv4Token')
        return res.status(401).json({ errorMessage: "토큰 사용자가 없습니다." });
    }else if(findUser.userType === 'OWNER'){
        return res.status(401).json({ errorMessage : "권한이 없습니다."})
    }
    req.user = findUser;
    
    next();

    }catch(err){
        res.clearCookie('Lv4Token')
        return res.status(401).json({ message: err.message ?? '비정상적인 요청입니다.' });
    }
}
