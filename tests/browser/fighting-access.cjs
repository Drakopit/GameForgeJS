const assert=require('node:assert/strict');

async function ready(page){
    await page.evaluate(async()=>window.fx=await import('gameforgejs/core'));
    await page.waitForFunction(()=>window.fx.LevelHandler.current?.constructor.name==='FightingGameMenuLevel');
}

async function tapButton(page,group,id){
    const p=await page.evaluate(({group,id})=>{
        const level=window.fx.LevelHandler.current;
        const items=group==='help'?level.hud.help.buttons:group==='touch'?level.touch.bar.buttons:level.touchMenu.buttons;
        const item=items.find(item=>item.id===id||item.label===id),rect=item.button.rect,bounds=level.screen.Canvas.getBoundingClientRect();
        return{x:bounds.left+(rect.x+rect.width/2)*bounds.width/level.screen.Width,y:bounds.top+(rect.y+rect.height/2)*bounds.height/level.screen.Height};
    },{group,id});await page.touchscreen.tap(p.x,p.y);
}

async function inspectFightingMobile(page){
    await ready(page);
    await page.waitForFunction(()=>window.fx.LevelHandler.current.touchMenu.buttons[0].button.enabled);
    await tapButton(page,'menu','ARCADE');
    await page.waitForFunction(()=>window.fx.LevelHandler.current.constructor.name==='FightingCharacterSelectLevel');
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(()=>window.fx.LevelHandler.current.constructor.name),'FightingCharacterSelectLevel','a tap must not select the next screen twice');
    const card=await page.evaluate(()=>{
        const l=window.fx.LevelHandler.current,v=l.viewport.Layout(),b=l.screen.Canvas.getBoundingClientRect();
        return{x:b.left+(v.x+180*v.scale)*b.width/l.screen.Width,y:b.top+(v.y+250*v.scale)*b.height/l.screen.Height};
    });await page.touchscreen.tap(card.x,card.y);
    await page.waitForFunction(()=>window.fx.LevelHandler.current.roundState==='fight');
    await page.evaluate(()=>window.fx.LevelHandler.current.playerTwo.controlledByPlayer=true);
    await tapButton(page,'touch','POWER');
    await page.waitForFunction(()=>window.fx.LevelHandler.current.playerOne.shotsFired>=1);
    const session=await page.context().newCDPSession(page);
    const controls=await page.evaluate(()=>{
        const l=window.fx.LevelHandler.current,b=l.screen.Canvas.getBoundingClientRect(),p=l.touch.stick.origin;
        const rect=l.touch.bar.buttons[2].button.rect;
        const toClient=(x,y)=>({x:b.left+x*b.width/l.screen.Width,y:b.top+y*b.height/l.screen.Height});
        return{origin:toClient(p.x,p.y),steer:toClient(p.x+42,p.y),power:toClient(rect.x+rect.width/2,rect.y+rect.height/2),x:l.playerOne.position.x};
    });
    await page.waitForFunction(()=>window.fx.LevelHandler.current.playerOne.CanStartAttack('special'));
    await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...controls.origin,id:1}]});
    await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...controls.steer,id:1}]});
    await page.waitForFunction(x=>window.fx.LevelHandler.current.playerOne.position.x>x+10,controls.x);
    await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...controls.steer,id:1},{...controls.power,id:2}]});
    await page.waitForFunction(()=>window.fx.LevelHandler.current.playerOne.shotsFired>=2,null,{timeout:5000}).catch(async error=>{
        console.error('Simultaneous fighting touch state',await page.evaluate(()=>{const l=window.fx.LevelHandler.current;return{state:l.playerOne.state,notice:l.playerOne.notice,command:l.playerOne.command,pending:l.touch.pending,contacts:window.fx.Input.instance.touch.GetActiveTouches(),ready:l.playerOne.CanStartAttack('special'),visible:window.fx.Input.instance.presentation.TouchVisible};}));throw error;
    });
    await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await session.detach();
    assert(await page.evaluate(()=>{
        const l=window.fx.LevelHandler.current;return l.touch.bar.buttons.every(({button})=>{const r=button.rect;return button.enabled&&r.width>=44&&r.height>=44&&r.x>=0&&r.y>=0&&r.x+r.width<=l.screen.Width&&r.y+r.height<=l.screen.Height;});
    }));
    const help=await page.evaluate(()=>{const l=window.fx.LevelHandler.current,r=l.hud.helpButton.rect,b=l.screen.Canvas.getBoundingClientRect();return{x:b.left+(r.x+r.width/2)*b.width/l.screen.Width,y:b.top+(r.y+r.height/2)*b.height/l.screen.Height};});
    await page.touchscreen.tap(help.x,help.y);await page.waitForFunction(()=>window.fx.LevelHandler.current.hud.help.visible);
    const timer=await page.evaluate(()=>window.fx.LevelHandler.current.roundTimer);await page.waitForTimeout(180);
    assert.equal(await page.evaluate(()=>window.fx.LevelHandler.current.roundTimer),timer);
    await tapButton(page,'help','close');await page.waitForFunction(()=>!window.fx.LevelHandler.current.hud.help.visible);
    await page.waitForFunction(timer=>window.fx.LevelHandler.current.roundTimer<timer,timer);
    await page.screenshot({path:'test-results/browser/fighting-mobile-controls.png'});
}

async function inspectFightingSparsePads(page){
    await ready(page);
    await page.evaluate(()=>{
        window.pads=[{index:3,id:'Xbox slot 3',buttons:[]},{index:7,id:'Sony DualSense slot 7',buttons:[]}];
        Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>{
            const pads=[];for(const pad of window.pads)pads[pad.index]={...pad,connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},(_,i)=>({pressed:pad.buttons.includes(i),value:pad.buttons.includes(i)?1:0}))};return pads;
        }});
    });
    const press=async(index,button)=>{
        await page.evaluate(({index,button})=>window.pads.find(p=>p.index===index).buttons=[button],{index,button});
        await page.waitForTimeout(100);await page.evaluate(index=>window.pads.find(p=>p.index===index).buttons=[],index);await page.waitForTimeout(100);
    };
    await press(3,13);assert.equal(await page.evaluate(()=>window.fx.LevelHandler.current.selectedIndex),1);
    await press(3,0);await page.waitForFunction(()=>window.fx.LevelHandler.current.constructor.name==='FightingCharacterSelectLevel');
    await press(3,0);await page.waitForFunction(()=>window.fx.LevelHandler.current.selectionStep==='p2');
    await press(7,0);await page.waitForFunction(()=>window.fx.LevelHandler.current.roundState==='fight');
    assert.deepEqual(await page.evaluate(()=>{const l=window.fx.LevelHandler.current;return[l.playerOne.input.gamepad.index,l.playerTwo.input.gamepad.index];}),[3,7]);
    await press(3,5);await page.waitForFunction(()=>window.fx.LevelHandler.current.playerOne.shotsFired===1);
    await press(7,5);await page.waitForFunction(()=>window.fx.LevelHandler.current.playerTwo.shotsFired===1);
    await page.evaluate(()=>window.pads=window.pads.filter(p=>p.index!==3));
    await page.waitForFunction(()=>window.fx.LevelHandler.current.playerOne.input.gamepad.index===-1);
    assert.equal(await page.evaluate(()=>window.fx.LevelHandler.current.playerTwo.input.gamepad.index),7);
    await page.waitForTimeout(1300);await press(7,7);await page.waitForFunction(()=>window.fx.LevelHandler.current.playerTwo.shotsFired===2);
    assert.equal(await page.evaluate(()=>window.fx.LevelHandler.current.playerOne.shotsFired),1);
    await press(7,9);await page.waitForFunction(()=>window.fx.LevelHandler.current.hud.help.visible);
    assert.equal(await page.evaluate(()=>window.fx.Input.instance.presentation.Profile),'playstation');
    await press(7,9);await page.waitForFunction(()=>!window.fx.LevelHandler.current.hud.help.visible);
    await page.evaluate(()=>window.pads.push({index:11,id:'Xbox replacement',buttons:[]}));
    await page.waitForFunction(()=>window.fx.LevelHandler.current.playerOne.input.gamepad.index===11);
    await press(11,5);await page.waitForFunction(()=>window.fx.LevelHandler.current.playerOne.shotsFired===2);
}
module.exports={inspectFightingMobile,inspectFightingSparsePads};
