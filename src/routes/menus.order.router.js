import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware2 from '../middlewares/auth.middleware2.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import joiSchema from '../joi.js';


const router = express.Router();
const { OrderSchema } = joiSchema;

// 1. 메뉴 주문 API

router.post('/orders', authMiddleware2, async (req, res, next) => {
    try {
        const { userId } = req.user;
        const { orderList } = req.body;

        await Promise.all(orderList.map(async (order) => {
            const validation = await OrderSchema.validateAsync(order);
            const { menusId, quantity } = validation;

            const findMenu = await prisma.menus.findFirst({
                where: { menusId: +menusId }
            });

            if (!findMenu) {
                return res.status(401).json({ message: "존재하지 않는 메뉴입니다." });
            }

            const totalPrice = findMenu.price * quantity;
            const subCount = findMenu.sellableCount - quantity;

            if (subCount < 0) {
                return res.status(401).json({ message: `판매수량을 초과했습니다. ${findMenu.menusId}번 메뉴는 ${findMenu.sellableCount}개 남았습니다.` });
            } else if (subCount === 0) {
                await prisma.menus.update({
                    where: { menusId: +menusId },
                    data: {
                        status: "SOLD_OUT",
                        sellableCount: 0
                    }
                });
            } else if (subCount > 0) {
                await prisma.menus.update({
                    where: { menusId: +menusId },
                    data: {
                        sellableCount: subCount
                    }
                });
            }

            await prisma.orders.create({
                data: {
                    MenusId: +menusId,
                    quantity: quantity,
                    totalPrice: totalPrice,
                    UserId: +userId
                }
            });
        }));

        return res.status(201).json({ message: "메뉴 주문에 성공했습니다." });
    } catch (error) {
        next(error);
    }
});


// 2. 사용자 주문 내역 조회 API

router.get('/orders/customer', authMiddleware2, async (req, res, next) => {
    try {
        const { userId } = req.user;
        const { status } = req.body;
        if (status) {
            const findorder = await prisma.orders.findMany({
                where: { UserId: +userId, status: status },
                select: {
                    Menu: {
                        select: {
                            name: true,
                            price: true,
                        }
                    },
                    quantity: true,
                    status: true,
                    createdAt: true,
                    totalPrice: true,
                }, orderBy: { createdAt: 'desc' }
            })
            return res.status(201).json({ data: findorder });
        } else if (!status) {
            const findorder = await prisma.orders.findMany({
                where: { UserId: +userId },
                select: {
                    Menu: {
                        select: {
                            name: true,
                            price: true,
                        }
                    },
                    quantity: true,
                    status: true,
                    createdAt: true,
                    totalPrice: true,
                }
                , orderBy: { createdAt: 'desc' }
            });
            return res.status(201).json({ data: findorder });
        }
    } catch (err) {
        next(err);
    }
})

// 3. 사장님 주문 내역 조회 API

router.get('/orders/owner', authMiddleware, async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!status) {
            const Findorder = await prisma.orders.findMany({
                select: {
                    orderId: true,
                    User: {
                        select: {
                            userId: true,
                            nickname: true
                        }
                    },
                    Menu: {
                        select: {
                            name: true,
                            price: true,
                        }
                    },
                    quantity: true,
                    status: true,
                    createdAt: true,
                    totalPrice: true,
                }, orderBy: { createdAt: 'desc' }
            });
            return res.status(201).json({ message: Findorder })
        } else if (status) {
            const Findorder = await prisma.orders.findMany({
                where: { status: status },
                select: {
                    orderId: true,
                    User: {
                        select: {
                            userId: true,
                            nickname: true
                        }
                    },
                    Menu: {
                        select: {
                            name: true,
                            price: true,
                        }
                    },
                    quantity: true,
                    status: true,
                    createdAt: true,
                    totalPrice: true,
                }, orderBy: { createdAt: 'desc' }
            });
            return res.status(201).json({ message: Findorder })
        }
    } catch (err) {
        next(err);
    }
})

// 4. 주문 상태 변경 API

router.patch('/orders/:orderId/status', authMiddleware, async (req, res, next) => {
    const { orderId } = req.params;

    const findOrderId = await prisma.orders.findFirst({ where: { orderId: +orderId } })
    if (!findOrderId) { return res.status(401).json({ message: "해당 주문이 존재하지 않습니다." }) }

    const validation = await OrderSchema.validateAsync(req.body);
    const { status } = validation;

    const re = await prisma.orders.update({
        where: { orderId: +orderId },
        data: {
            status: status,
        }
    })
    return res.status(201).json({ message: re })
})

export default router;