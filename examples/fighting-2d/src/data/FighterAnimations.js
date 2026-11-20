export const FrameSize=Object.freeze({width:64,height:64,feetY:54});
const clip=(row,columns,fps=12,loop=false,extra={})=>Object.freeze({row,column:columns[0],count:columns.length,cells:columns.map(column=>({row,column})),fps,loop,...extra});
// All 79 occupied cells shared by the four supplied sheets. Empty cells are excluded.
export const FighterAnimations=Object.freeze({
 idle:clip(0,[0,1,2,3,4,5],9,true),
 walk:clip(0,[6,7,8,9,10,11],12,true),
 walkBack:clip(0,[11,10,9,8,7,6],10,true),
 crouch:clip(0,[12],8,true),guard:clip(0,[13],8,true),
 guardLow:clip(0,[12,16],12,false),
 crouchLight:clip(0,[12,14,12],18),crouchHeavy:clip(0,[12,15,12],14),
 meditate:clip(0,[17],8,true),jump:clip(1,[0],8),dash:clip(1,[1],12,true),fall:clip(1,[2],8),
 alternateWalk:clip(1,[11,12,13,14,15,16],12,true),
 light:clip(2,[0,1,2,3,4],20),medium:clip(2,[5,6,7],16),heavy:clip(2,[8,9,10,11],14),
 sweep:clip(2,[12,13],14),aerialLight:clip(2,[15],12),aerialHeavy:clip(2,[16,17],12),
 hurt:clip(3,[0,1],12),knockback:clip(3,[3,4,5],14),
 knockdown:clip(3,[5,7],12,false,{feetY:59}),ko:clip(3,[5,7],8,false,{feetY:59}),
 getUp:clip(3,[7,10,9,0],18),land:clip(3,[9,10],20),dashStrike:clip(3,[12,13],16),
 super:clip(4,[0,1,2,3],10),weaponSpecial:Object.freeze({row:4,column:5,count:6,cells:[{row:4,column:5},{row:4,column:6},{row:4,column:7},{row:5,column:9},{row:5,column:10},{row:5,column:11}],fps:14,loop:false}),
 special:clip(4,[9,10,11,12],12),victory:clip(4,[14],8,true),intro:clip(5,[0,1,2,3],9),
 backDash:clip(5,[4,5],14),aura:clip(6,[0,1,2,3],12,true),
});

// Silver's supplied sheet has no alternate-outfit run. Never substitute blank cells.
export function GetSheetAnimations(asset) {
    return asset==='fight_char_silver'
        ? Object.fromEntries(Object.entries(FighterAnimations).filter(([name])=>name!=='alternateWalk'))
        : FighterAnimations;
}
