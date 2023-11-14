// src/middlewares/error-handling.middleware.js

export default function (err, req, res, next) {
    switch(err.name){
        case "ValidationError":
            console.log("joi에서 발생한 에러입니다.")
    }
    console.error(err);
    // 클라이언트에게 에러 메시지를 전달합니다.
    res.status(500).json({ errorMessage: '서버 내부 에러가 발생했습니다.' });
}