const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const source=file=>import(pathToFileURL(path.resolve('src',file)));

test('responsive layout preserves aspect, reserves controls and round-trips pointer coordinates',async()=>{
    const {ResponsiveLayout}=await source('core/Window/ResponsiveLayout.js');
    const layout=new ResponsiveLayout(960,540);
    for(const [width,height,reserveBottom] of [[390,844,180],[844,390,120],[1280,800,0]]) {
        const view=layout.Fit(width,height,{reserveBottom});
        assert(view.width<=width && view.height<=height-reserveBottom);
        assert(Math.abs(view.width/view.height-960/540)<1e-10);
        const world={x:250,y:123},result=layout.ToWorld(layout.ToScreen(world,view),view);
        assert(Math.abs(world.x-result.x)<1e-10 && Math.abs(world.y-result.y)<1e-10);
    }
    assert.throws(()=>new ResponsiveLayout(0,540),RangeError);
    assert.throws(()=>layout.Fit(390,844,{reserveBottom:844}),RangeError);
});

test('touch policy distinguishes a fine-pointer desktop from coarse mobile and respects explicit choices',async()=>{
    const {InputPresentation}=await source('core/Input/InputPresentation.js');
    const previous=globalThis.matchMedia;
    try{
        globalThis.matchMedia=()=>({matches:false});
        const state=new InputPresentation({});assert.equal(state.TouchVisible,false);
        state.SetTouchMode('on');assert.equal(state.TouchVisible,true);
        state.SetTouchMode('off');globalThis.matchMedia=()=>({matches:true});assert.equal(state.TouchVisible,false);
        state.SetTouchMode('auto');assert.equal(state.TouchVisible,true);
        assert.throws(()=>state.SetTouchMode('sometimes'),RangeError);
    }finally{globalThis.matchMedia=previous;}
});

test('active profile follows input edges; manual art selection never changes game bindings',async()=>{
    const {InputPresentation}=await source('core/Input/InputPresentation.js');
    const input={keysDown:{},mouse:{buttonsDown:{}},gamepad:{gamepads:{0:{id:'Sony DualSense',buttons:[{pressed:true}],axes:[]}},previousButtons:{},previousAxes:{}}};
    const state=new InputPresentation(input);state.Update();assert.equal(state.Profile,'playstation');
    input.keysDown.KeyW=true;state.Update();assert.equal(state.Profile,'keyboard');
    state.SetProfile('xbox');input.keysDown={};state.Update();assert.equal(state.Profile,'xbox');
});

test('prompt registry resolves physical aliases before swapping art, and JSON extends existing profiles',async()=>{
    const {InputPromptRegistry}=await source('2d/UI/InputPromptRegistry.js');
    const actions={GetRules:()=>[{device:'keyboard',input:'Space'},{device:'gamepad',input:'A'}],input:{GamepadAliasOptions:()=>({profile:'xbox'})}};
    const registry=new InputPromptRegistry({profiles:{keyboard:{KeyP:{shape:'key',label:'CUSTOM'}}}},actions);
    assert.equal(registry.ForAction('JUMP','playstation')[0].symbol,'cross');
    assert.equal(registry.ForAction('JUMP','xbox')[0].label,'A');
    assert.equal(registry.ForAction('JUMP','keyboard')[0].symbol,'space');
    assert.equal(registry.Resolve({device:'keyboard',input:'KeyP'},'keyboard').label,'CUSTOM');
    assert.equal(registry.Resolve({device:'keyboard',input:'KeyW'},'keyboard').label,'W');
    assert.equal(registry.Resolve({device:'keyboard',input:'Unmapped'},'keyboard').label,'?');
});

test('native synthesized cues cap voices, throttle events, preserve mute volume and release nodes',async()=>{
    const {AudioManager}=await source('core/Audio/AudioManager.js');
    const {SoundEffects}=await source('core/Audio/SoundEffects.js');
    const audio=new AudioManager();const parameter={setValueAtTime(){},exponentialRampToValueAtTime(){},linearRampToValueAtTime(){}};
    let disconnected=0;
    audio.context={state:'running',currentTime:0,createOscillator:()=>({frequency:parameter,connect(){},start(){},stop(){},disconnect(){disconnected++;}}),createGain:()=>({gain:parameter,connect(){},disconnect(){disconnected++;}})};
    audio.masterGain={gain:{value:1}};audio.maxVoices=2;
    const cues=new SoundEffects(audio);
    assert(cues.Play('select'));assert(!cues.Play('select'));assert(cues.Play('hit'));assert(!cues.Play('jump'));
    for(const source of [...audio.activeSources])source.onended();assert.equal(audio.activeSources.size,0);assert.equal(disconnected,4);
    audio.SetGlobalVolume(0.4);audio.SetMuted(true);assert.equal(audio.masterGain.gain.value,0);assert(!audio.PlayTone());
    audio.SetMuted(false);assert.equal(audio.masterGain.gain.value,0.4);
    audio.context.state='suspended';assert(!audio.PlayTone());audio.context.state='running';cues.OnUpdate(1);assert(cues.Play('select'));
    cues.OnDestroy();assert.equal(cues.audio,null);assert.equal(audio.context.state,'running');
});

test('fighting player seats remain stable when browser slots are sparse or a controller disconnects',async()=>{
    const {FightingPadSeats}=await import(pathToFileURL(path.resolve('examples/fighting-2d/src/input/FightingPadSeats.js')));
    const seats=new FightingPadSeats();seats.Update([3,7]);assert.equal(seats.Resolve(0),3);assert.equal(seats.Resolve(1),7);
    seats.Update([7]);assert.equal(seats.Resolve(0),-1);assert.equal(seats.Resolve(1),7);
    seats.Update([7,11]);assert.equal(seats.Resolve(0),11);assert.equal(seats.Resolve(1),7);
});
