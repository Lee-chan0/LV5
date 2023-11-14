import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import joiSchema from '../joi.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const {MenusSchema} = joiSchema;

const router = express.Router();


// 5. 메뉴 등록 API

router.post('/categories/:categoryId/menus', authMiddleware ,async (req, res, next) => {
    try {
        const {userId} = req.user;
        const { categoryId } = req.params;
        const validation = await MenusSchema.validateAsync(req.body);
        const { name, description, price, image, status } = validation;
        const findCategoryId = await prisma.categories.findFirst({
            where: { categoryId: +categoryId },
        });
        if (!findCategoryId) {
            return res.status(404).json({ message: "해당하는 카테고리가 없습니다." });
        }
        const findOrder = await prisma.menus.findFirst({
            select: { order: true },
            orderBy: {
                order: 'desc',
            },
        });
        const newOrder = findOrder ? findOrder.order + 1 : 1;

        await prisma.menus.create({
            data: {
                UserId : +userId,
                CategoryId: +categoryId,
                name: name,
                description: description,
                image: image,
                price: price,
                order: newOrder,
                status : status
            },
        });
        return res.status(200).json({ message: "메뉴를 등록하였습니다." });
    } catch (err) {
        next(err);
    }
});

// 6. 카테고리별 메뉴 조회 API

router.get('/categories/:categoryId/menus', async (req, res, next) => {
    try {
        const { categoryId } = req.params;

        const findCategory = await prisma.categories.findFirst({
            where: { categoryId: +categoryId },
        });
        if (!findCategory) {
            return res.status(404).json({ message: "해당하는 카테고리가 없습니다." });
        }

        const menusList = await prisma.menus.findMany({
            where : {CategoryId : +categoryId, removed : false},
            select: {
                CategoryId: true,
                name: true,
                image: true,
                price: true,
                order: true,
                status: true,
                sellableCount : true,
            },
        });
        return res.status(200).json({ data: menusList });
    } catch (error) {
        next(err);
    }
});

// 7. 메뉴 상세 조회 API

router.get('/categories/:categoryId/menus/:menusId', async (req, res, next) => {
    try {
        const { categoryId, menusId } = req.params;
        if (!categoryId || !menusId) {
            return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
        }
        const findCategory = await prisma.categories.findFirst({
            where: { categoryId: +categoryId, removed : false },
        });
        if (!findCategory) {
            return res.status(404).json({ message: "존재하지 않는 카테고리 입니다." });
        }
        const findMenus = await prisma.menus.findFirst({
            where: { CategoryId: +categoryId, menusId: +menusId, removed: false },
            select: {
                menusId: true,
                name: true,
                description: true,
                image: true,
                price: true,
                order: true,
                status: true,
            },
        });
        return res.status(200).json({ data: findMenus });
    } catch (error) {
        next(err);
    }
});
// 8. 메뉴 수정 API

router.put('/categories/:categoryId/menus/:menusId', authMiddleware, async (req, res, next) => {
    try {
        const validation = await MenusSchema.validateAsync(req.body);
        const { name, description, price, order, status } = validation;
        const { categoryId, menusId } = req.params;

        const findCategory = await prisma.categories.findFirst({
            where: { categoryId: +categoryId , removed : false}
        });
        if (!findCategory) {
            return res.status(404).json({ message: "해당하는 카테고리가 존재하지 않습니다." });
        }
        const findMenus = await prisma.menus.findFirst({
            where: { menusId: +menusId, CategoryId: +categoryId, removed : false }
        });
        if (!findMenus) {
            return res.status(404).json({ message: "존재하지 않는 메뉴입니다." });
        }
        await prisma.menus.update({
            where: { menusId: +menusId, CategoryId: +categoryId },
            data: {
                name: name,
                description: description,
                price: price,
                order: order,
                status: status,
            }
        });
        return res.status(200).json({ message: "수정완료" });
    } catch (error) {
        next(err);
    }
});

// 9. 메뉴 삭제 API

router.delete('/categories/:categoryId/menus/:menusId', authMiddleware, async (req, res) => {
    try {
        const { categoryId, menusId } = req.params;
        const findCategory = await prisma.categories.findFirst({
            where: { categoryId: +categoryId , removed : false}
        });
        if (!findCategory) {
            return res.status(404).json({ message: "카테고리가 존재하지 않습니다." });
        }
        const findMenus = await prisma.menus.findFirst({
            where: { CategoryId: +categoryId, menusId: +menusId, removed : false },
        });
        if (!findMenus) {
            return res.status(404).json({ message: "메뉴가 존재하지 않습니다." });
        }
        await prisma.menus.update({
            where: { CategoryId: +categoryId, menusId: +menusId },
            data : {removed : true}
        });
        return res.status(201).json({ message: "삭제되었습니다." });
    } catch (error) {
        next(err);
    }
});


export default router;