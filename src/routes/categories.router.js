import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import joiSchema from '../joi.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const {CategoriesSchema} = joiSchema;

const router = express.Router();


// 카테고리 등록 API

router.post('/categories', authMiddleware, async (req, res, next) => {
    try {
        const validation = await CategoriesSchema.validateAsync(req.body);
        const {userId} = req.user;
        const { name } = validation;
        if (!name) {
            return res.status(400).json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
        }

        const findOrder = await prisma.categories.findFirst({
            select: {
                order: true,
            },
            orderBy: {
                categoryId: 'desc'
            }
        });

        const newOrder = findOrder ? findOrder.order + 1 : 1;

        await prisma.categories.create({
            data: {
                UserId : userId,
                name: name,
                order: newOrder
            },
        });

        return res.status(201).json({ message: "카테고리를 등록하였습니다." });
    } catch(err){
        next(err);
    }
});

// 2. 카테고리 조회 API

router.get('/categories', async (req, res, next) => {
    try {
        const category = await prisma.categories.findMany({
            where : {removed : false},
            select: {
                categoryId: true,
                name: true,
                order: true
            }
        });
        return res.status(200).json({ data: category });
    } catch (err) {
        next(err);
    }
});



// 3. 카테고리 수정 API

router.put('/categories/:categoryId', authMiddleware, async (req, res, next) => {
    try {
        const { name, order } = req.body;
        const { categoryId } = req.params;
        
        const UpdateCategory = await prisma.categories.update({
            where: { categoryId: +categoryId , removed : false},
            data: {
                name: name,
                order: order,
            }
        });
        if (!UpdateCategory) {
            return res.status(404).json({ message: "존재하지 않는 카테고리 입니다." });
        }
        return res.status(201).json({ message: "카테고리 정보를 수정하였습니다." });
    } catch (err) {
        next(err);
    }
});


// 4. 카테고리 삭제 API

router.delete('/categories/:categoryId', authMiddleware , async (req, res) => {
    try {
        const { categoryId } = req.params;
        const findCategory = await prisma.categories.findFirst({
            where: { categoryId: +categoryId }
        });
        if (!findCategory) {
            return res.status(404).json({ message: "해당하는 카테고리가 존재하지 않습니다." });
        } else {
            await prisma.categories.update({
                where: { categoryId: +categoryId },
                data : { removed : true }
            });
        }
        return res.status(201).json({ message: "데이터가 삭제되었습니다." });
    } catch (err) {
        next(err);
    }
});

export default router;