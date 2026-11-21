const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const source=p=>import(pathToFileURL(path.resolve(p)));

test('height navigation respects climb, occupied tiles, one-gap jumps and terrain sight',async()=>{
    const {HeightGrid}=await source('src/3d/Navigation/HeightGrid.js');
    const grid=new HeightGrid([[0,0,3,0],[0,null,1,0],[0,0,1,0]]);
    const reachable=grid.Reachable({col:0,row:1},{move:3,climb:1,jump:2,occupied:new Set(['0,0'])});
    assert(!reachable.has('0,0'));assert(reachable.has('2,1'));assert.equal(reachable.get('2,1').cost,2);
    assert(!grid.Reachable({col:0,row:1},{move:3,climb:1,jump:0}).has('2,1'));
    assert(!grid.CanSee({col:1,row:0},{col:3,row:0}));
    assert(grid.CanSee({col:0,row:2},{col:1,row:2}));
    assert.throws(()=>new HeightGrid([[0],[0,1]]),RangeError);
});
test('tactical previews distinguish front, side, back, height and exhausted spark energy',async()=>{
    const {HeightGrid}=await source('src/3d/Navigation/HeightGrid.js');
    const {BattleRules}=await source('examples/highland-tactics-3d/src/data/BattleRules.js');
    const grid=new HeightGrid([[0,0,0],[0,0,0],[0,0,0]]);
    const defender={col:1,row:1,facing:0,hp:20,team:'enemy',exposed:0};
    const actor={col:1,row:0,hp:30,team:'ally',energy:2,attack:12};
    const front=BattleRules.Preview(grid,actor,defender);
    const side=BattleRules.Preview(grid,{...actor,col:0,row:1},defender);
    const back=BattleRules.Preview(grid,{...actor,row:2},defender);
    assert.equal(front.side,'FRONT');assert.equal(side.side,'SIDE');assert.equal(back.side,'BACK');
    assert(front.damage<side.damage&&side.damage<back.damage);assert(front.chance<back.chance);
    assert(BattleRules.CanAttack(grid,actor,defender));
    assert(!BattleRules.CanAttack(grid,{...actor,energy:0},defender,'spark'));
});
test('CT action budgets reject repeated moves/actions and wait spends CT before next actor',async()=>{
    const {TurnSystem}=await source('examples/highland-tactics-3d/src/components/TurnSystem.js');
    const {HeightGrid}=await source('src/3d/Navigation/HeightGrid.js');
    const grid=new HeightGrid([[0,0,0],[0,0,0]]);
    const pawn=(team,col)=>({stats:{team,col,row:0,hp:30,maxHp:30,speed:20,id:team,name:team,ct:100,energy:2,facing:1,attack:12},travel:{Follow(path,done){done();}}});
    const one=pawn('ally',0),two=pawn('enemy',2),turn=new TurnSystem(grid,[one,two],{Play(){}});
    turn.Begin(one);turn.Choose(0);assert(turn.Move({col:1,row:0}));assert(!turn.Move({col:1,row:0}));
    one.stats.col=1;turn.Choose(1);assert(turn.Attack(two));turn.ResolveAttack();
    turn.Choose(1);assert.equal(turn.phase,'command');assert(!turn.Attack(two));
    turn.Choose(3);turn.EndTurn();assert.equal(one.stats.ct,0);assert.equal(turn.phase,'charge');
    turn.OnUpdate(0);assert.equal(turn.active,two);
});
test('surface animation caps ripples and seeded rain reuses bounded drops, wetness dries',async()=>{
    const {SurfaceMaterial,RainEmitter,WetSurfaceResponse}=await source('src/3d/index.js');
    const material=new SurfaceMaterial({preset:'water'});
    for(let i=0;i<20;i++)material.AddRipple({x:i,z:0});
    material.Advance(0.1);assert.equal(material.ripples.length,8);assert.equal(material.rippleUniforms.length,32);
    material.Advance(3);assert.equal(material.ripples.length,0);assert.throws(()=>new SurfaceMaterial({preset:'plastic'}),RangeError);
    const one=new RainEmitter({count:8,seed:12}),two=new RainEmitter({count:8,seed:12});
    const first=one.drops[0];for(let i=0;i<120;i++){one.OnFixedUpdate(1/60);two.OnFixedUpdate(1/60);}
    assert.deepEqual(one.drops.map(d=>d.position),two.drops.map(d=>d.position));assert.equal(one.drops[0],first);assert(one.impacts>0);
    const stone=new SurfaceMaterial({preset:'stone'}),response=new WetSurfaceResponse(one,[stone]);
    response.OnUpdate(1);assert(stone.wetness>0);one.enabled=false;response.OnUpdate(100);assert.equal(stone.wetness,0);
    response.OnDestroy();one.OnDestroy();assert.equal(one.drops.length,0);
});

test('modal native buttons block background hits and never replay a close pointer underneath',async()=>{
    const {Button,Rectangle}=await source('src/2d/index.js');
    const canvas=Object.assign(new EventTarget(),{width:400,height:300,getBoundingClientRect:()=>({left:0,top:0,width:400,height:300})});
    const screen={Canvas:canvas,Context:{}};let modalHits=0,backgroundHits=0;
    const background=new Button(screen,{pointerInput:true}),modal=new Button(screen,{pointerInput:true}),owner={};
    modal.modalOwner=owner;screen.inputModal=owner;
    background.SetButton(new Rectangle(0,0,100,50));modal.SetButton(new Rectangle(0,0,100,50));
    background.OnClick(()=>backgroundHits++);modal.OnClick(()=>{modalHits++;screen.inputModal=null;});
    const event={button:0,clientX:20,clientY:20,preventDefault(){}};
    background.pointerHandler(event);modal.pointerHandler(event);background.pointerHandler(event);
    assert.equal(modalHits,1);assert.equal(backgroundHits,0);background.Dispose();modal.Dispose();
});

test('puzzle spawn resets orientation, detects blockage and preserves fractional fall time',async()=>{
    const {PuzzleBoard}=await source('examples/puzzle-battle-2d/src/entities/PuzzleBoard.js');
    const {FallingPiece}=await source('examples/puzzle-battle-2d/src/entities/FallingPiece.js');
    const create=()=>{const board=new PuzzleBoard(0,0),piece=new FallingPiece(board,null,true);piece.rotIndex=2;piece.setGems({color:'red'},{color:'blue'});return{board,piece};};
    const one=create(),two=create();assert.equal(one.piece.rotIndex,0);
    one.piece.update(0.5);for(let i=0;i<5;i++)two.piece.update(0.1);
    assert.equal(one.piece.row1,two.piece.row1);assert(Math.abs(one.piece.fallTimer-two.piece.fallTimer)<1e-8);
    one.board.grid[1][2]={};one.piece.setGems({},{});assert(one.board.gameOver);
});

test('Puzzle Power Gems fall as a block and send bonus counter-gems when shattered', async () => {
    const { PuzzleBoard } = await import('../examples/puzzle-battle-2d/src/entities/PuzzleBoard.js');
    const { GemType, PuzzleGem } = await import('../examples/puzzle-battle-2d/src/entities/PuzzleGem.js');
    const board = new PuzzleBoard(0, 0);
    for (const row of [6, 7]) {
        for (const col of [0, 1]) board.grid[row][col] = new PuzzleGem(GemType.NORMAL, 'red');
    }
    board.grid[11][0] = new PuzzleGem(GemType.GARBAGE, 'garbage', 3);
    board.applyGravity();
    const [power] = board.MergePowerGems().blocks;
    assert.deepEqual([power.r, power.c, power.width, power.height], [9, 0, 2, 2]);
    board.grid[10][2] = new PuzzleGem(GemType.CRASH, 'red');
    let pressure = 0;
    board.onSendGarbage = amount => { pressure += amount; };
    assert.equal(board.checkMatches(), true);
    assert.equal(pressure, 3);
    assert.equal(board.grid.flat().filter(Boolean).length, 1);
});
