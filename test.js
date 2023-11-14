// map배우기

// 배열을 처리해서 새로운 배열로 반환하기 위한 함수
// map()함수에 전달되는 콜백함수는 "각 요소를 변환하여 새로운 배열로 매핑하는 역할을 한다."라고 한다. 

// 배열을 순회하며 지정된 콜백함수를 적용해서, 각 요소를 변환하고, 그 변환된 값을 모아 새로운 배열로 반환해준다.

const orderList = [{"menusId": 3,"quantity": 2},{"menusId": 5,"quantity": 1}]

Promise.all(orderList.map((order) => {
    console.log(order)
}))
// const dubleNumbers = numbers.map(function (i) {
//     console.log(i);
//     return i * 2;
// })
// console.log(dubleNumbers);