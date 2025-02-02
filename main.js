// 引入 Matter.js 模块
const { Engine, Render, Runner, World, Bodies, Body, Mouse, MouseConstraint } = Matter;
// 创建引擎和渲染器
const engine = Engine.create();
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: calcBorder()[0],
        height: calcBorder()[1],
        wireframes: false,
        background: getBackground()
    }
});
// 启动渲染器
Render.run(render);
// 创建运行器
const runner = Runner.create();
Runner.run(runner, engine);

//1.宽度高度的计算
function calcBorder(){
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    let width, height;
    if (windowHeight > 700 && windowWidth > 500) {
        width = 500;
        height = 700;
    } else {
        if ((windowWidth / 500) > (windowHeight / 700)) {
            height = windowHeight;
            width = windowHeight / 7 * 5;
        }else{
            width = windowWidth;
            height = windowWidth / 5* 7;
        }
    }
    return [width,height];
}







//n.用户自定义设置：
//应该是有默认的然后用户选择之后刷新，不过就是简单的css设置了。
//应该可以衔接保存本地设置。
function getBackground(){
    return "red";
}