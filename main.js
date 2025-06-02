// 引入 Matter.js 模块
const { Engine, Render, Runner, World, Bodies, Body, Mouse, MouseConstraint } = Matter;
// 创建引擎和渲染器
const engine = Engine.create();
const render = Render.create({
    element: document.getElementById("container"),
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

//一些初始化数值
var width, height, groundHeight = 30, groundColor = '#101d21', wallWidth = 10, wallColor = '#161d21';
var state = 'initing';

//1.宽度高度的计算
function calcBorder() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    if (windowHeight > 700 && windowWidth > 500) {
        width = 500;
        height = 700;
    } else {
        if ((windowWidth / 500) > (windowHeight / 700)) {
            height = windowHeight;
            width = windowHeight / 7 * 5;
        } else {
            width = windowWidth;
            height = windowWidth / 5 * 7;
        }
    }
    return [width, height];
}

//2.绘制墙壁和地面以及判定线
const ground = Bodies.rectangle(width / 2, height - groundHeight / 2, width, groundHeight, {
    isStatic: true,
    render: {
        fillStyle: groundColor
    }
});
const leftWall = Bodies.rectangle(wallWidth / 2, height / 2, wallWidth, height, {
    isStatic: true,
    render: {
        fillStyle: wallColor
    }
});
const rightWall = Bodies.rectangle(width - wallWidth / 2, height / 2, wallWidth, height, {
    isStatic: true,
    render: {
        fillStyle: wallColor
    }
});
World.add(engine.world, [ground, leftWall, rightWall]);
// 每帧绘制判定线
Matter.Events.on(render, 'afterRender', function () {
    const context = render.context;
    context.strokeStyle = 'red';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(wallWidth, judgeLineHeight);
    context.lineTo(calcBorder()[0] - wallWidth, judgeLineHeight);
    context.stroke();
});

//3.生成水果! important
var level1Radius = 10, levelUpTimes = 20, judgeLineHeight = 100;
const sizes={
    1:146,
    2:196,
    3:281,
    4:545,
    5:754
}
function getRadius(level) {
    return level * levelUpTimes + level1Radius;
}//获取半径（没啥大作用）
function getFruitStyle(level) {
    const colors = ['#ff7675', '#74b9ff', '#55efc4', '#ffeaa7', '#a29bfe'];
    return colors[level - 1]
}//生成水果的样式（不知道准备生成图片来着）
function getTexture(level){
    const pictures=["./1.png","./orange2.png","./kiwifruit3.png","./halfMelon4.png","./bigMelon5.png"]
    return pictures[level-1]
}
function getScale(level){
    return getRadius(level)
}
function createFruit(x, level, y = judgeLineHeight) {
    if (state == 'ending') return;
    const r = getRadius(level);
    y -= r;
    const fruit = Bodies.circle(x, y, r, {
        restitution: 0.5,
        render: {
            // fillStyle: getFruitStyle(level),
            sprite:{
                texture:getTexture(level),
                xScale:0.4,
                yScale:0.4,
            }
        },
        label: 'fruit',//标记一下是水果，方便合成以及结束判定
        level: level//方便同等级合成
    });
    World.add(engine.world, fruit);
    return fruit.id;
}
const createFruit1 = throttle(createFruit, 400, { 'leading': true, 'trailing': false });

//4.事件处理（鼠标点击和水果碰撞）
//鼠标点击
const mouse = Mouse.create(render.canvas);
class fruitLevelCount {
    constructor() {
        this.count = 0;
        this.arr = [2, 1, 1, 2, 1];
    }
    getFruitLevel() {
        this.count = (this.count + 1) % 5;
        return this.arr[this.count];
    }
}//这里搞一个class是为了点击生成不同等级的水果（虽然可能没啥用）
const counter = new fruitLevelCount();
let currentFruit = null;
document.addEventListener('mousedown', () => {
    const x = mouse.absolute.x;
    let fruitLevel = counter.getFruitLevel();
    let id = createFruit(x, fruitLevel);
    currentFruit = engine.world.bodies.filter(body => body.label === 'fruit' && body.id == id)[0];
    Matter.Body.setStatic(currentFruit, true);
    currentFruit.label = 'generatingFruit';
    state = 'startGenerateFruit';
});
document.addEventListener('mousemove', () => {
    if (state != 'startGenerateFruit') return;
    if (currentFruit) {
        Matter.Body.setPosition(currentFruit, { x: mouse.absolute.x, y: currentFruit.position.y });
    }
})
document.addEventListener('mouseup', () => {
    if (state != 'startGenerateFruit') return;
    if (currentFruit) {
        Matter.Body.setStatic(currentFruit, false);
    }
    currentFruit.label = 'fruit';
    state = 'endGenerate';
})
document.addEventListener('touchstart', function (event) {
    event.preventDefault();
    const touch = event.touches[0];
    const simulatedEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: touch.clientX,
        clientY: touch.clientY,
        screenX: touch.screenX,
        screenY: touch.screenY,
    });
    document.dispatchEvent(simulatedEvent);
});//内置的mouse不会因为touch而改变，我又懒得去转换一下对应在canvas里面的坐标
//水果碰撞
Matter.Events.on(engine, 'collisionStart', (event) => {
    if (state == 'ending') return;
    const pairs = event.pairs;
    pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;
        if (bodyA.label === 'fruit' && bodyB.label === 'fruit' && !bodyA.isMerged && !bodyB.isMerged) {
            if ((bodyA.level === bodyB.level) && bodyA.level != 5) {
                const newLevel = (bodyA.level + 1);
                const newX = (bodyA.position.x + bodyB.position.x) / 2;
                const newY = (bodyA.position.y + bodyB.position.y) / 2;
                // 标记为已合成,防止还没移除又碰撞
                bodyA.isMerged = true;
                bodyB.isMerged = true;
                World.remove(engine.world, [bodyA, bodyB]);
                createFruit(newX, newLevel, newY);
            }
        }
    });
});

//5.游戏结束判定

const fruitTimers = new Map();
const remainTimePresenter = document.getElementById('remainTimePresenter');
function gameover() {
    alert("gameover");
    state = 'ending';
    engine.world.bodies.filter(body=>body.label==='fruit'||body.label==='generatingFruit').forEach(fruit=>{
        World.remove(engine.world, fruit);
    });
    remainTimePresenter.innerHTML="点我再来一局";
    remainTimePresenter.classList.add('floatdiv');
    remainTimePresenter.addEventListener('click',()=>{
        state='initing';
        remainTimePresenter.classList.remove('floatdiv');
        remainTimePresenter.innerHTML="再来一局，加油！"
    })
}
function remainTimePresent(time) {
    remainTimePresenter.innerHTML = `还有${time}秒`;
}
Matter.Events.on(engine, 'beforeUpdate', () => {
    if (state == 'ending') return;
    const now = Date.now();
    const fruits = engine.world.bodies.filter(body => body.label === 'fruit');
    fruits.forEach(fruit => {
        const y = fruit.position.y;
        const r = getRadius(fruit.level);
        if (y-r < judgeLineHeight) {
            if (fruitTimers.has(fruit.id)) {
                const duration = now - fruitTimers.get(fruit.id);

                //这里要利用函数处理一下，保证是最大值
                remainTimePresenter.innerHTML = `还有${5 - duration / 1000}秒`;
                if (duration >= 5000) gameover();

            } else {
                fruitTimers.set(fruit.id, now);
            }
        } else {
            fruitTimers.delete(fruit);
        }

    })
});


//n.用户自定义设置：
//应该是有默认的然后用户选择之后刷新，不过就是简单的css设置了。
//应该可以衔接保存本地设置。
function getBackground() {
    return "#986f19";
}