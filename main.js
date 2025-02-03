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


var width, height, groundHeight = 30, groundColor = '#101d21', wallWidth = 10, wallColor = '#161d21';

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

//2.添加墙壁和地面
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

//3.生成水果! important
var level1Radius = 10, levelUpTimes = 20, judgeLineHeight = 200;
function getRadius(level) {
    return level * levelUpTimes + level1Radius;
}//获取半径（没啥大作用）
function getFruitStyle(level) {
    const colors = ['#ff7675', '#74b9ff', '#55efc4', '#ffeaa7', '#a29bfe'];
    return colors[level - 1]
}//生成水果的样式（不知道准备生成图片来着）
function createFruit(x, level, y = judgeLineHeight) {
    const r = getRadius(level);
    const fruit = Bodies.circle(x, y, r, {
        restitution: 0.5,
        render: {
            fillStyle: getFruitStyle(level)
        },
        label: 'fruit',//标记一下是水果，方便合成
        level: level//方便同等级合成
    });
    World.add(engine.world, fruit);
}

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
}
const counter = new fruitLevelCount();
document.addEventListener('click', () => {
    const x = mouse.absolute.x;
    let fruitLevel = counter.getFruitLevel();
    createFruit(x, fruitLevel);
});
//水果碰撞
Matter.Events.on(engine, 'collisionStart', (event) => {
    const pairs = event.pairs;
    pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;
        if (bodyA.label === 'fruit' && bodyB.label === 'fruit' && !bodyA.isMerged && !bodyB.isMerged) {
            if ((bodyA.level === bodyB.level)&&bodyA.level!=5) {
                const newLevel = (bodyA.level + 1) ;
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





//n.用户自定义设置：
//应该是有默认的然后用户选择之后刷新，不过就是简单的css设置了。
//应该可以衔接保存本地设置。
function getBackground() {
    return "#986f19";
}