const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('@playwright/test');
const {startServer}=require('../cli/server.cjs');
const {build}=require('../cli/lib/build.cjs');
const {enterFight}=require('./browser/fighting.cjs');

async function ready(page,url) {
    await page.goto(url,{waitUntil:'networkidle'});
    await page.evaluate(async()=>window.fx=await import('gameforgejs/core'));
    await page.waitForFunction(()=>window.fx.LevelHandler.current?._started,null,{timeout:30000});
}
async function press(page,key){await page.keyboard.down(key);await page.waitForTimeout(90);await page.keyboard.up(key);await page.waitForTimeout(90);}
async function hudButton(page,name){
    const point=await page.evaluate(name=>{const l=window.fx.LevelHandler.current,item=l.hud.buttons.find(b=>b.label===name),r=item.button.rect,b=l.ui.Screen.Canvas.getBoundingClientRect();return{x:b.x+(r.x+r.width/2)*b.width/l.ui.Screen.Width,y:b.y+(r.y+r.height/2)*b.height/l.ui.Screen.Height};},name);
    await page.touchscreen.tap(point.x,point.y);
}
async function highland(page,url,mobile){
    await ready(page,url);await page.waitForFunction(()=>window.fx.LevelHandler.current.turn.phase==='command');
    if(mobile)await hudButton(page,'MOVE');else await press(page,'Enter');
    await page.waitForFunction(()=>window.fx.LevelHandler.current.turn.phase==='move');
    if(mobile){
        const point=await page.evaluate(()=>{const l=window.fx.LevelHandler.current,tile=l.grid.Get(1,4),p=l.camera.Project(l.terrain.World(tile),l.ui.Screen.Width,l.ui.Screen.Height),r=l.ui.Screen.Canvas.getBoundingClientRect();return{x:r.x+p.x*r.width/l.ui.Screen.Width,y:r.y+p.y*r.height/l.ui.Screen.Height};});
        await page.touchscreen.tap(point.x,point.y);
    }else{await press(page,'ArrowUp');await press(page,'Enter');}
    await page.waitForFunction(()=>{const t=window.fx.LevelHandler.current.turn;return t.phase==='command'&&t.active.stats.row===4;});
    if(mobile){await hudButton(page,'WAIT / FACE');await hudButton(page,'EAST');await hudButton(page,'CONFIRM WAIT');}
    else {await press(page,'ArrowDown');await press(page,'ArrowDown');await press(page,'ArrowDown');await press(page,'Enter');await press(page,'ArrowRight');await press(page,'Enter');}
    assert.equal(await page.evaluate(()=>window.fx.LevelHandler.current.pawns[0].stats.facing),1);
    await press(page,'h');await page.waitForFunction(()=>window.fx.LevelHandler.current.hud.help.visible);
    const before=await page.evaluate(()=>window.fx.LevelHandler.current.pawns.map(p=>p.stats.ct));await page.waitForTimeout(150);
    assert.deepEqual(await page.evaluate(()=>window.fx.LevelHandler.current.pawns.map(p=>p.stats.ct)),before);
    await press(page,'h');
    const simulation=await page.evaluate(()=>{
        window.fx.Engine.Stop();const l=window.fx.LevelHandler.current;
        const run=()=>{for(let step=0;step<30000&&!l.turn.result;step++){
            if(l.turn.phase==='command')l.turn.phase='ai';l.OnUpdate(1/60);
        }return l.turn.result;};
        l.ResetBattle();const first=run();
        l.ResetBattle();for(const p of l.pawns){if(p.stats.team==='ally')p.stats.hp=1;else p.stats.attack=100;}
        const second=run();l.ResetBattle();l.ToggleWeather();
        for(let i=0;i<120;i++){l.OnFixedUpdate(1/60);l.OnUpdate(1/60);}
        l.OnDrawn();l.OnGUI();
        const errors=l.renderer.gl.getError(),impacts=l.environment.rain.impacts;
        return{first,second,errors,impacts,wetness:l.terrain.stone.wetness};
    });
    assert.equal(simulation.first,'VICTORY',JSON.stringify(simulation));assert.equal(simulation.second,'DEFEAT');
    assert.equal(simulation.errors,0);assert(simulation.impacts>0);assert(simulation.wetness>0);
    await page.screenshot({path:`test-results/highland-${mobile?'touch':'keyboard'}.png`});
    await page.evaluate(()=>window.fx.Engine.Dispose());assert.equal(await page.locator('canvas').count(),0);
}
async function classicTactics(page,base){
    await ready(page,base+'examples/tactical-rpg-2d/');await press(page,'Enter');
    await page.waitForFunction(()=>window.fx.LevelHandler.current?.battle);
    const result=await page.evaluate(async()=>{
        window.fx.Engine.Stop();const {LevelHandler}=window.fx;
        const {BattleState}=await import(new URL('./src/state/BattleState.js',location.href));
        const {TacticalMapLevel}=await import(new URL('./src/levels/TacticalMapLevel.js',location.href));
        const old=LevelHandler.current,oldUnit=old.battle.player,context=old.context;
        oldUnit.hp-=3;const hp=oldUnit.hp;old.OnExit();
        const next=new TacticalMapLevel();next.context=context;next.OnStart(context);
        next.OnUpdate(1/60);next.OnDrawn();next.OnGUI();
        const valid=next.battle.player!==oldUnit&&next.battle.player.hp===hp&&next.battle.player.components.length>0;
        next.OnExit();BattleState.ResetAll();
        const again=new TacticalMapLevel();again.context=context;again.OnStart(context);again.OnDrawn();
        const reset=again.battle.player.hp===again.battle.player.maxHp;again.OnExit();return{valid,reset};
    });assert.deepEqual(result,{valid:true,reset:true});
}
async function fighterSheets(page,base){
    await ready(page,base+'examples/fighting-2d/');
    const report=await page.evaluate(async()=>{
        const {GetSheetAnimations}=await import(new URL('./src/data/FighterAnimations.js',location.href));
        const names=['fight_char_blue','fight_char_no_armor','fight_char_gold','fight_char_silver'],report=[];
        for(const asset of names){
            const image=window.fx.AssetManager.instance.GetImage(asset),canvas=new OffscreenCanvas(image.width,image.height),ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
            const pixels=ctx.getImageData(0,0,image.width,image.height).data,occupied=new Set();
            for(let y=0;y<image.height;y++)for(let x=0;x<image.width;x++)if(pixels[(y*image.width+x)*4+3]>0)occupied.add(`${Math.floor(y/64)},${Math.floor(x/64)}`);
            const mapped=new Set(Object.values(GetSheetAnimations(asset)).flatMap(clip=>clip.cells.map(cell=>`${cell.row},${cell.column}`)));
            report.push({asset,occupied:occupied.size,mapped:mapped.size,missing:[...occupied].filter(key=>!mapped.has(key)),blank:[...mapped].filter(key=>!occupied.has(key))});
        }return report;
    });
    for(const sheet of report){assert.deepEqual(sheet.missing,[],JSON.stringify(sheet));assert.deepEqual(sheet.blank,[],JSON.stringify(sheet));}
    console.log('PASS fighter sheet coverage',JSON.stringify(report));
    await press(page,'ArrowDown');await press(page,'ArrowDown');await press(page,'Enter');
    await page.waitForFunction(()=>window.fx.LevelHandler.current?.constructor.name==='FightingAnimationLevel');
    await press(page,'ArrowRight');await press(page,'ArrowDown');
    await page.screenshot({path:'test-results/fighter-animation-lab.png'});await press(page,'Escape');
    await page.waitForFunction(()=>window.fx.LevelHandler.current?.constructor.name==='FightingGameMenuLevel');
    await enterFight(page);
    const repertoire=await page.evaluate(()=>{
        window.fx.Engine.Stop();const l=window.fx.LevelHandler.current,one=l.playerOne,two=l.playerTwo;
        l.StartRound(true);l.roundState='fight';l.input.Player=()=>({});two.controlledByPlayer=true;
        one.command={};one.StartAttack('medium');const medium=one.state;
        one.ResetRound(400,l.arena.groundY,true);two.ResetRound(470,l.arena.groundY,false);
        one.command={crouch:true};one.StartAttack('heavy');const low=one.state;
        const attack=one.GetCurrentAttack();two.ChangeState('guard');two.command={};const source={position:{x:400}};
        const highGuard=two.IsBlocking(source,attack);two.command={crouch:true};const lowGuard=two.IsBlocking(source,attack);
        two.command={};l.combat.ApplyHit(one,two,attack,{x:470,y:300});two.visual.OnUpdate(0);const down=two.knockedDown&&two.visual.clipName==='knockdown';
        let recovered=false;for(let i=0;i<70;i++){l.OnUpdate(1/60);if(two.visual.clipName==='getUp')recovered=true;}
        const stood=two.state==='idle';one.ResetRound(400,l.arena.groundY,true);one.position.y-=90;one.command={};one.StartAttack('heavy');const aerial=one.state;
        return{medium,low,highGuard,lowGuard,down,recovered,stood,aerial};
    });
    assert.deepEqual(repertoire,{medium:'medium',low:'crouchHeavy',highGuard:false,lowGuard:true,down:true,recovered:true,stood:true,aerial:'aerialHeavy'});
}
async function highlandGamepad(page,base){
    await ready(page,base+'examples/highland-tactics-3d/');await page.waitForFunction(()=>window.fx.LevelHandler.current.turn.phase==='command');
    const result=await page.evaluate(()=>{
        window.fx.Engine.Stop();const l=window.fx.LevelHandler.current,input=window.fx.Input;
        let buttons=[];Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[{index:0,id:'Sony DualSense',connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},(_,i)=>({pressed:buttons.includes(i),value:buttons.includes(i)?1:0}))}]});
        const frame=()=>{input.Update();l.OnUpdate(1/60);input.LateUpdate();};
        const tap=index=>{buttons=[index];frame();buttons=[];frame();};
        tap(13);const selected=l.turn.command;tap(0);const targeted=l.turn.phase;tap(1);tap(13);tap(0);
        const target=l.pawns[2];target.stats.col=1;target.stats.row=4;target.travel.Snap();
        tap(12);tap(0);for(let i=0;i<30;i++)frame();
        const result={selected,targeted,damaged:target.stats.hp<target.stats.maxHp,status:target.stats.exposed,energy:l.turn.active.stats.energy,profile:input.instance.presentation.Profile};
        delete navigator.getGamepads;return result;
    });assert.deepEqual(result,{selected:1,targeted:'target',damaged:true,status:2,energy:1,profile:'playstation'});
}
async function surfaces(page,base){
    await ready(page,base+'examples/renderer-3d/');
    const result=await page.evaluate(async()=>{
        window.fx.Engine.Stop();const l=window.fx.LevelHandler.current;
        const {Scene3D,Mesh,PrimitiveMesh,SurfaceMaterial,StandardMaterial,AmbientLight}=await import('gameforgejs/3d');
        const {PlanarReflection2D}=await import('gameforgejs/2d');
        const scene=new Scene3D();scene.Add(l.camera);scene.Add(new AmbientLight({intensity:0.8}));
        const material=new SurfaceMaterial({preset:'water'});material.AddRipple({x:0,z:0});material.Advance(0.1);
        const mesh=new Mesh({geometry:PrimitiveMesh.Cube(2),material});scene.Add(mesh);l.renderer.Render(scene,l.camera);
        const gl=l.renderer.gl,shader=l.renderer.standardShader,read=name=>gl.getUniform(shader.program,shader.GetUniform(name));
        const enabled={surface:read('uSurface'),reflection:read('uReflection'),ripples:read('uRippleCount')};
        mesh.material=new StandardMaterial();l.renderer.Render(scene,l.camera);
        const reset={surface:read('uSurface'),reflection:read('uReflection'),ripples:read('uRippleCount')};
        const canvas=new OffscreenCanvas(16,16),ctx=canvas.getContext('2d');ctx.fillStyle='red';ctx.fillRect(0,0,16,8);ctx.globalAlpha=0.3;
        PlanarReflection2D.Draw(ctx,canvas,{width:16,height:16,waterY:8,time:0});
        return{enabled,reset,error:gl.getError(),pixel:ctx.getImageData(8,9,1,1).data[0],alpha:ctx.globalAlpha};
    });assert.equal(result.enabled.surface,1);assert(result.enabled.reflection>0);assert.equal(result.enabled.ripples,1);assert.deepEqual(result.reset,{surface:0,reflection:0,ripples:0});assert.equal(result.error,0);assert(result.pixel>0);assert(Math.abs(result.alpha-0.3)<0.001);
}
async function buildingBlocksTouch(page,url,id){
    await ready(page,url);
    const tap=async label=>{
        const point=await page.evaluate(label=>{
            const l=window.fx.LevelHandler.current,bar=l.controls?.bar??l.bar,item=bar.buttons.find(item=>(typeof item.label==='function'?item.label():item.label)===label),r=item.button.rect,b=l.screen.Canvas.getBoundingClientRect();
            return{x:b.x+(r.x+r.width/2)*b.width/l.screen.Width,y:b.y+(r.y+r.height/2)*b.height/l.screen.Height};
        },label);await page.touchscreen.tap(point.x,point.y);
    };
    if(id==='platformer-2d'){
        await page.waitForFunction(()=>window.fx.LevelHandler.current.player.controller.grounded);
        const points=await page.evaluate(()=>{
            const l=window.fx.LevelHandler.current,b=l.screen.Canvas.getBoundingClientRect(),jump=l.controls.bar.buttons.find(item=>item.label==='JUMP').button.rect,origin=l.controls.stick.origin;
            const point=(x,y,id)=>({id,x:b.x+x*b.width/l.screen.Width,y:b.y+y*b.height/l.screen.Height});
            return[point(origin.x+35,origin.y,1),point(jump.x+jump.width/2,jump.y+jump.height/2,2)];
        });
        const session=await page.context().newCDPSession(page);
        await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points});
        await page.waitForFunction(()=>{const l=window.fx.LevelHandler.current;return l.player.position.x>68&&l.player.controller.vy<0;});
        await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await session.detach();
    }else{
        await tap('ROTATE');await page.waitForFunction(()=>window.fx.LevelHandler.current.piece1.rotIndex===1);
        await tap('LEFT');await tap('DROP');await page.waitForFunction(()=>window.fx.LevelHandler.current.board1.score>0);
        await tap('PAUSE');const row=await page.evaluate(()=>window.fx.LevelHandler.current.piece1.row1);await page.waitForTimeout(150);
        assert.equal(await page.evaluate(()=>window.fx.LevelHandler.current.piece1.row1),row);
        await tap('RESUME');await tap('RETRY');assert.equal(await page.evaluate(()=>window.fx.LevelHandler.current.board1.score),0);
    }
    await page.setViewportSize({width:844,height:390});
    await page.waitForFunction(()=>window.fx.LevelHandler.current.screen.Width===844);
    assert(await page.evaluate(()=>{const l=window.fx.LevelHandler.current,bar=l.controls?.bar??l.bar;return bar.buttons.filter(a=>a.button.enabled).every(a=>{const r=a.button.rect;return r.x>=0&&r.y>=0&&r.x+r.width<=l.screen.Width&&r.y+r.height<=l.screen.Height;});}));
    await page.evaluate(()=>window.fx.Engine.Dispose());assert.equal(await page.locator('canvas').count(),0);
}
async function main(){
    const root=path.resolve(__dirname,'..'),temp=fs.mkdtempSync(path.join(os.tmpdir(),'gameforge-polish-')),servers=[];
    fs.mkdirSync(path.join(root,'test-results'),{recursive:true});
    const browser=await chromium.launch({executablePath:process.env.GAMEFORGE_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
    const serve=async directory=>{const server=await startServer({root:directory,port:0,basePath:'/game/'});servers.push(server);return `http://127.0.0.1:${server.address().port}/game/`;};
    try{
        const base=await serve(root);
        for(const [name,fn]of [['classic tactics lifecycle',p=>classicTactics(p,base)],['fighter sheet coverage/lab',p=>fighterSheets(p,base)],['Highland gamepad abilities',p=>highlandGamepad(p,base)],['native surface uniforms and Canvas reflection',p=>surfaces(p,base)]]){
            const page=await browser.newPage({viewport:{width:1100,height:800}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await fn(page);assert.deepEqual(errors,[],name);await page.evaluate(()=>window.fx.Engine.Dispose());await page.close();console.log('PASS '+name);
        }
        const output=build(path.join(root,'examples/highland-tactics-3d'),{output:path.join(temp,'highland')}).output,built=await serve(output);
        for(const [mode,url]of [['source',base+'examples/highland-tactics-3d/'],['built',built]])for(const mobile of [false,true]){
            const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1100,height:760},isMobile:mobile,hasTouch:mobile}),errors=[];
            page.on('pageerror',e=>errors.push(e.message));await highland(page,url,mobile);assert.deepEqual(errors,[]);await page.close();console.log(`PASS Highland ${mode}/${mobile?'touch':'keyboard'}: paths, facing, CT, victory/defeat, weather and cleanup`);
        }
        for(const id of ['platformer-2d','puzzle-battle-2d']){
            const packed=build(path.join(root,'examples',id),{output:path.join(temp,id)}).output,url=await serve(packed);
            for(const [mode,entry]of [['source',base+'examples/'+id+'/'],['built',url]]){
                const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),errors=[];
                page.on('pageerror',e=>errors.push(e.message));await buildingBlocksTouch(page,entry,id);assert.deepEqual(errors,[]);await page.close();console.log(`PASS ${id} ${mode}: mobile gameplay, rotation and cleanup`);
            }
        }
    }finally{
        await browser.close();await Promise.all(servers.map(server=>new Promise(resolve=>server.close(resolve))));
        if(path.dirname(temp)===fs.realpathSync(os.tmpdir())&&path.basename(temp).startsWith('gameforge-polish-'))fs.rmSync(temp,{recursive:true,force:true});
    }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
