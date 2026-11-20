import { HUDFrame } from 'gameforgejs/2d';
import { PuzzleConfig } from '../data/puzzleConfig.js';

/** Scene-owned presentation; board rules never draw menu or status text. */
export class PuzzleHUD {
    constructor(draw) { this.frame=new HUDFrame(draw); this.floatingTexts=[]; this.p1Score=0; this.p2Score=0; }
    setNextPieces(one,two) { this.next=[one,two]; }
    addFloatingText(x,y,text,color='#ffdf99') { this.floatingTexts.push({x,y,text,color,life:1.4}); }
    update(dt) { for(const text of this.floatingTexts){text.y-=24*dt;text.life-=dt;} this.floatingTexts=this.floatingTexts.filter(text=>text.life>0); }
    draw(ctx,level) {
        const f=this.frame,w=level.screen.Width,h=level.screen.Height,center=w/2;
        for(const [index,board] of [level.board1,level.board2].entries()) {
            const x=board.x,bw=board.cellSize*PuzzleConfig.COLS,top=board.y-80;
            f.Panel({x:x-8,y:top,width:bw+16,height:74});
            f.Text(index?'KIRA / CPU':'BLAZE / YOU',x+4,top+22,{size:bw<170?11:14,maxWidth:bw-55,weight:700,color:index?'#c2b7ff':'#7be3d4'});
            f.Text(String(board.score).padStart(5,'0'),x+4,top+50,{size:23,weight:700,maxWidth:bw-56});
            f.Text('NEXT',x+bw-50,top+19,{size:10,color:f.theme.muted});
            this.next?.[index]?.forEach((gem,i)=>gem.render(ctx,x+bw-50+i*25,top+29,23));
            const occupied=board.grid.flat().filter(Boolean).length/(PuzzleConfig.ROWS*PuzzleConfig.COLS);
            f.Meter(occupied,{x,y:board.y+board.cellSize*PuzzleConfig.ROWS+8,width:bw,height:5},occupied>0.7?'#ff8c8c':'#7be3d4');
        }
        f.Text('PRISM DUEL',center,29,{align:'center',size:20,weight:700,color:f.theme.gold});
        f.Text('Crash cores break connected colors',center,48,{align:'center',size:11,maxWidth:270});
        if(w>=700&&h>=550){
        f.Panel({x:center-133,y:164,width:266,height:175});
        f.Text('VS',center,215,{align:'center',size:34,weight:700,color:f.theme.gold});
        f.Text('Build colors. Drop a core.',center,253,{align:'center',size:15});
        f.Text('Chain clears send stone to your rival.',center,280,{align:'center',size:12,maxWidth:242});
        f.Text(level.gameEnded?(level.board1.gameOver?'KIRA WINS':'BLAZE WINS'):level.paused?'PAUSED':'DUEL IN PROGRESS',center,315,{align:'center',size:12,color:'#7be3d4'});
        }
        for(const text of this.floatingTexts){ctx.save();ctx.globalAlpha=Math.min(1,text.life);f.Text(text.text,text.x,text.y,{size:19,weight:700,align:'center',color:text.color});ctx.restore();}
        if(level.gameEnded||level.paused){
            f.Panel({x:center-150,y:h/2-53,width:300,height:107});
            f.Text(level.gameEnded?'DUEL COMPLETE':'TAKE A BREATH',center,h/2-21,{align:'center',size:19,color:f.theme.gold});
            f.Text(level.gameEnded?'Retry for a new duel':'Pause again to continue',center,h/2+8,{align:'center',size:13});
            f.Text('H / controls · R / retry',center,h/2+33,{align:'center',size:12});
        }
    }
}
