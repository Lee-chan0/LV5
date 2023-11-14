import express from 'express';
import CategoriesRouter from './routes/categories.router.js';
import MenusRouter from './routes/menus.router.js'
import UsersRouter from './routes/users.router.js';
import menusOrderRouter from './routes/menus.order.router.js';
import cookieParser from 'cookie-parser';
import LogMiddleware from './middlewares/log.middleware.js';
import ErrorHandlingMiddleware from './middlewares/error-handling.middleware.js';

const app = express();
const PORT = 3006;

app.use(LogMiddleware);
app.use(cookieParser());
app.use(express.json());
app.use('/api', [CategoriesRouter, MenusRouter, UsersRouter, menusOrderRouter]);
app.use(ErrorHandlingMiddleware)


app.get('/', (req, res) => {
    return res.status(200).json({message : "OK"});
})

app.listen(PORT, () => {
    console.log(PORT, "번 연결");
})