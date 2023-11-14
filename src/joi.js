import joi from 'joi';


//- **주문 상태(OrderType)**는 **주문 대기(`PENDING`), 접수 완료(`ACCEPTED`), 취소(`CANCEL`)** 타입이 존재합니다.

const OrderSchema = joi.object({
    status : joi.string().valid("PENDING", "ACCEPTED", "CANCEL"),
    quantity : joi.number().integer().greater(0),
    menusId : joi.number().integer()
})

const UserSchema = joi.object({
    nickname : joi.string().alphanum().min(3).max(15),
    password : joi.string().min(8).max(20),
    userType : joi.string().valid("CUSTOMER", "OWNER"),
})

const CategoriesSchema = joi.object({
    name: joi.string().min(1).max(10).required(),
});


const MenusSchema = joi.object({
    name: joi.string().min(1).max(15),
    description: joi.string().min(1).max(50),
    price: joi.number().integer().greater(0),
    status: joi.string().valid("FOR_SALE", "SOLD_OUT"),
    image : joi.string(),
    order : joi.number().integer()
})

export default {UserSchema, CategoriesSchema, MenusSchema, OrderSchema};