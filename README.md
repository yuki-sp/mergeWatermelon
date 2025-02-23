# 合成大西瓜
链接<a href="https://yuki-sp.github.io/mergeWatermelon/index.html">这里这里(≧∇≦)ﾉ</a>
## 主体
### 物理引擎
- 使用的是Matter.js库(api文档:<a href="https://brm.io/matter-js/docs/">matter.js</a>)
- #### 大体结构
  1. 生成水果函数`createFruit`
   - 传入参数：等级、x位置、(y位置)`level, x, y = judgeLineHeight`
   - 调用`getRadius`、`getFruitStyle`等函数方便修改
   - 对每个水果增设`label: 'fruit'`(用来标记一下是水果，方便合成以及结束判定)以及`level: level`以方便同等级合成
  2. 事件处理--水果合成
  3. 结束判定
### 页面样式
## 碎碎念