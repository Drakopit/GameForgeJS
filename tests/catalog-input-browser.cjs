const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('@playwright/test');
const {startServer}=require('../cli/server.cjs');

async function helpButton(page,id){
    const point=await page.evaluate(id=>{
        const level=window.fx.LevelHandler.current,help=level.hud.help,rect=help.buttons.find(item=>item.id===id).button.rect;
        const screen=level.screen,bounds=screen.Canvas.getBoundingClientRect();
        return{x:bounds.left+(rect.x+rect.width/2)*bounds.width/screen.Width,y:bounds.top+(rect.y+rect.height/2)*bounds.height/screen.Height};
    },id);await page.mouse.click(point.x,point.y);
}

async function main(){
    const root=path.resolve(__dirname,'..'),server=await startServer({root,port:0,basePath:'/GameForgeJS/'});
    const base=`http://127.0.0.1:${server.address().port}/GameForgeJS/`;
    fs.mkdirSync(path.join(root,'test-results/prompts'),{recursive:true});
    const browser=await chromium.launch({headless:true,executablePath:process.env.GAMEFORGE_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
    try{
        const page=await browser.newPage({viewport:{width:1280,height:850}}),documents=[];
        page.on('request',request=>{if(request.isNavigationRequest()&&request.frame()===page.mainFrame())documents.push(request.url());});
        await page.goto(base);assert.equal(await page.locator('[data-group]').count(),6);assert.equal(await page.locator('.demo-card').count(),19);
        await page.locator('[data-category="core"]').click();assert.equal(await page.locator('.demo-card:visible').count(),4);
        await page.locator('[data-category="patterns"]').click();assert.equal(await page.locator('.demo-card:visible').count(),7);
        await page.locator('[data-category="all"]').click();
        const count=documents.length;await page.locator('.demo-card[href="examples/boss-patterns-2d/index.html"]').click();
        await page.evaluate(async()=>{window.fx=await import('gameforgejs/core');});
        await page.waitForFunction(()=>window.fx.LevelHandler.current?.hud);
        assert.equal(documents.length-count,1);assert(!documents.at(-1).includes('Main.html'));
        assert.equal(await page.locator('canvas').count(),1);
        assert.equal(await page.evaluate(()=>window.fx.Input.instance.presentation.TouchVisible),false);
        assert(await page.evaluate(()=>window.fx.LevelHandler.current.hud.bar.buttons.slice(0,2).every(item=>!item.button.enabled)));
        await page.keyboard.press('h');await page.waitForFunction(()=>window.fx.LevelHandler.current.hud.help.visible);
        for(const profile of ['keyboard','xbox','playstation']){
            await helpButton(page,'profile');await page.waitForFunction(profile=>window.fx.Input.instance.presentation.Profile===profile,profile);
        }
        assert.equal(await page.evaluate(()=>window.fx.LevelHandler.current.hud.help.registry.ForAction('ACTION','playstation')[0].symbol),'cross');
        await page.screenshot({path:path.join(root,'test-results/prompts/desktop-playstation.png')});
        await helpButton(page,'touch');await helpButton(page,'close');
        await page.waitForFunction(()=>window.fx.LevelHandler.current.hud.bar.buttons[0].button.enabled);
        assert(await page.evaluate(()=>window.fx.Input.instance.presentation.TouchVisible));
        await page.keyboard.press('h');await page.waitForFunction(()=>window.fx.LevelHandler.current.hud.help.visible);
        await helpButton(page,'touch');await helpButton(page,'close');
        await page.waitForFunction(()=>!window.fx.LevelHandler.current.hud.bar.buttons[0].button.enabled);
        await page.waitForFunction(()=>window.fx.AudioManager.instance.context.state==='running');
        const tone=await page.evaluate(()=>window.fx.AudioManager.instance.PlayTone({frequency:440,duration:0.5,volume:0.1}));assert(tone);
        await page.waitForTimeout(60);
        assert(await page.evaluate(()=>{const audio=window.fx.AudioManager.instance,samples=new Float32Array(audio.analyserNode.fftSize);audio.analyserNode.getFloatTimeDomainData(samples);return samples.some(value=>Math.abs(value)>0.001);}));
        await page.keyboard.press('h');await page.waitForFunction(()=>window.fx.LevelHandler.current.hud.help.visible);
        await helpButton(page,'sound');assert(await page.evaluate(()=>window.fx.AudioManager.instance.muted));
        assert.equal(await page.evaluate(()=>window.fx.AudioManager.instance.PlayTone()),false);
        const cleanup=await page.evaluate(async()=>{const audio=window.fx.AudioManager.instance,atlas=window.fx.LevelHandler.current.hud.help.atlas;await window.fx.Engine.Dispose();return{voices:audio.activeSources.size,context:audio.context,tiles:atlas.tiles.size};});
        assert.deepEqual(cleanup,{voices:0,context:null,tiles:0});await page.close();
        console.log('PASS catalog direct launch, category filters, sprite profiles, desktop opt-in, audio signal/mute and disposal');
        for(const mobile of [false,true]){
            const context=await browser.newContext({viewport:{width:390,height:844},isMobile:mobile,hasTouch:mobile});
            try{
                const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
                await page.goto(base+'examples/boss-patterns-2d/');await page.evaluate(async()=>window.fx=await import('gameforgejs/core'));
                await page.waitForFunction(()=>window.fx.LevelHandler.current?.hud);
                assert.equal(await page.evaluate(()=>window.fx.Input.instance.presentation.TouchVisible),mobile,'narrow desktop is not mobile');
                await page.keyboard.press('h');await page.waitForFunction(()=>window.fx.LevelHandler.current.hud.help.visible);
                await page.screenshot({path:path.join(root,`test-results/prompts/${mobile?'mobile':'narrow-desktop'}-help.png`)});
                const fits=await page.evaluate(()=>{const l=window.fx.LevelHandler.current;return l.hud.help.buttons.every(({button})=>{const b=button.rect;return b.x>=0&&b.y>=0&&b.x+b.width<=l.screen.Width&&b.y+b.height<=l.screen.Height;});});assert(fits);
                assert.deepEqual(errors,[]);await page.evaluate(()=>window.fx.Engine.Dispose());
            }finally{await context.close();}
        }
        for(const route of ['Main.html','examples/showcase/index.html']){const page=await browser.newPage();await page.goto(base+route);await page.waitForURL(url=>url.pathname.endsWith('/index.html')&&url.hash==='#jogos');assert.equal(await page.locator('.demo-card').count(),19);await page.close();}
        console.log('PASS mobile/coarse detection, narrow desktop, responsive prompt layout and legacy list redirects');
    }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
