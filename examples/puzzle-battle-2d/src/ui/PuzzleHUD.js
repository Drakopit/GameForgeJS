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
            const fighter = index ? level.fighter2 : level.fighter1;
            const scale = Math.min(0.78, bw / 200);
            const portraitWidth = 60 * scale;
            const nextWidth = Math.min(48, bw * 0.26);
            const textWidth = Math.max(8, bw - portraitWidth - nextWidth - 8);
            fighter.draw(ctx, x + portraitWidth * 0.43, top + 58, scale, index ? -1 : 1);
            f.Text(fighter.data.name, x + portraitWidth, top + 24,
                { size: bw < 170 ? 10 : 14, maxWidth: textWidth, weight: 700, color: index ? '#c2b7ff' : '#7be3d4' });
            f.Text(String(board.score).padStart(5,'0'),x+portraitWidth,top+48,{size:bw<170?16:23,weight:700,maxWidth:textWidth});
            f.Text('NEXT',x+bw-nextWidth,top+19,{size:10,color:f.theme.muted});
            this.next?.[index]?.forEach((gem,i)=>gem.render(ctx,x+bw-nextWidth+i*(nextWidth/2),top+29,nextWidth/2-1));
            const occupied=board.grid.flat().filter(Boolean).length/(PuzzleConfig.ROWS*PuzzleConfig.COLS);
            f.Meter(occupied,{x,y:board.y+board.cellSize*PuzzleConfig.ROWS+8,width:bw,height:5},occupied>0.7?'#ff8c8c':'#7be3d4');
        }
        f.Text('PRISM DUEL',center,29,{align:'center',size:20,weight:700,color:f.theme.gold});
        f.Text('Build rectangles. Shatter Power Gems with crash cores.',center,48,{align:'center',size:11,maxWidth:270});
        if (w >= 700 && h >= 550) {
            const y = level.board1.y + 43;
            f.Panel({ x: center - 132, y, width: 264, height: 205 });
            f.Text(level.gameEnded ? (level.board1.gameOver ? 'KIRA WINS' : 'BLAZE WINS') : 'PRISM ARENA',
                center, y + 28, { align: 'center', size: 15, weight: 700, color: f.theme.gold });
            const floor = ctx.createLinearGradient(center - 110, 0, center + 110, 0);
            floor.addColorStop(0, '#7be3d4');
            floor.addColorStop(0.5, '#ead399');
            floor.addColorStop(1, '#c2b7ff');
            ctx.fillStyle = floor;
            ctx.fillRect(center - 110, y + 148, 220, 3);
            level.fighter1.draw(ctx, center - 65, y + 146, 1.25, 1);
            level.fighter2.draw(ctx, center + 65, y + 146, 1.25, -1);
            f.Text('VS', center, y + 108, { align: 'center', size: 18, weight: 700, color: f.theme.gold });
            f.Text('Chains send counter-gems', center, y + 180, { align: 'center', size: 13, color: f.theme.muted });
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
