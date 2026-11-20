import { ActionManager, Input } from 'gameforgejs/core';
import { Button, Draw, HUDFrame, Rectangle, TextBox, InputHelpPanel } from 'gameforgejs/2d';
import { OnlineLobby } from './OnlineLobby.js';

const CHAT_HOLD_SECONDS = 6;
const CHAT_FADE_SECONDS = 0.6;
const MAX_CHAT_LINES = 4;

/** All visible UI is engine-drawn; native text entry only supplies IME/OS keyboard. */
export class OnlineInterface {
    constructor(level) {
        this.level = level; this.screen = level.screen;
        this.frame = new HUDFrame(new Draw(this.screen));
        this.help = new InputHelpPanel(new Draw(this.screen),{title:'Online Sandbox / Controls'});
        this.fields = {}; this.buttons = {}; this.messages = []; this.chatAge = 0;
        this.selection = 0; this.volume = 0.35; this.controlScale = 1;
        this.lobby = new OnlineLobby(this);
        for (const [id, placeholder, length] of [
            ['name', 'Your name', 20], ['room', 'Six-letter room code', 6],
            ['server', 'wss://your-server/ws', 240], ['chat', 'Message… Enter to send', 160],
        ]) {
            const field = this.fields[id] = new TextBox(this.screen, { nativeInput: true });
            field.SetPlaceholder(placeholder); field.SetMaxLength(length);
            field.onSubmit = () => {
                if (id === 'chat') { level.session.Chat(field.GetText()); field.SetText(''); }
                field.SetActive(false);
            };
        }
        this.fields.name.SetText('Explorer');
        this.fields.room.SetText(new URLSearchParams(location.search).get('room') ?? '');
        this.fields.server.SetText(level.session.constructor.DefaultEndpoint());
        const callbacks = {
            create: () => level.Connect(true), join: () => level.Connect(false),
            pause: () => this.TogglePause(), resume: () => this.TogglePause(),
            leave: () => level.Leave(), chat: () => this.FocusChat(),
            invite: () => this.CopyInvite(),
            help: () => this.help.Toggle(),
            volume: () => { this.volume = this.volume > 0 ? 0 : 0.35; },
            controls: () => {const p=Input.instance.presentation;p.SetTouchMode(p.TouchVisible?'off':'on');},
            done: () => { for (const field of Object.values(this.fields)) field.SetActive(false); },
        };
        for (const [id, callback] of Object.entries(callbacks)) {
            const button = this.buttons[id] = new Button(this.screen, { pointerInput: true });
            button.OnClick(callback);
        }
    }
    get IsTyping() { return Object.values(this.fields).some(field => field.isActive); }
    FocusChat() { if (this.level.playing && !this.paused) this.fields.chat.SetActive(true); }
    TogglePause() {
        for (const field of Object.values(this.fields)) field.SetActive(false);
        this.paused = !this.paused;
    }
    AddMessage(message) {
        this.messages.push(message);
        if (this.messages.length > MAX_CHAT_LINES) this.messages.shift();
        this.chatAge = 0;
    }
    async CopyInvite() {
        try {
            await navigator.clipboard.writeText(this.level.session.Invite());
            this.AddMessage({ system: true, text: 'Invite copied. Send it to your friend.' });
        } catch {
            this.fields.chat.SetText(this.level.session.Invite()); this.FocusChat();
            this.AddMessage({ system: true, text: 'Select and copy the invitation from the chat field.' });
        }
    }
    Update(dt) {
        for (const field of Object.values(this.fields)) field.OnUpdate(dt);
        this.chatAge += dt;
        if (!this.IsTyping && ActionManager.IsActionDown('HELP')) this.help.Toggle();
        if (this.help.visible) return;
        if (!this.IsTyping && ActionManager.IsActionDown('PAUSE')) this.TogglePause();
        if (!this.IsTyping && ActionManager.IsActionDown('CHAT')) this.FocusChat();
        if (this.IsTyping) return;
        const choices = !this.level.playing ? ['create', 'join'] : this.paused ? ['resume', 'volume', 'controls', 'leave'] : [];
        if (!choices.length) return;
        if (ActionManager.IsActionDown('MENU_NEXT')) this.selection = (this.selection + 1) % choices.length;
        if (ActionManager.IsActionDown('MENU_PREVIOUS')) this.selection = (this.selection + choices.length - 1) % choices.length;
        if (ActionManager.IsActionDown('CONFIRM')) this.buttons[choices[this.selection % choices.length]].onClickHandler();
    }
    LayoutButton(id, label, x, y, width, selected = false) {
        const box = new Rectangle(x, y, width, 44);
        this.buttons[id].SetButton(box); this.buttons[id].enabled = true;
        this.frame.Panel(box);
        this.frame.Text(`${selected ? '› ' : ''}${label}`, x + width / 2, y + 28,
            { align: 'center', color: selected ? '#ffe6a0' : '#dce8ff', size: 14 });
    }
    Field(id, x, y, width) {
        this.fields[id].SetBox(new Rectangle(x, y, width, 40)); this.fields[id].DrawCursor();
    }
    Draw() {
        for (const button of Object.values(this.buttons)) button.enabled = false;
        // Hidden fields must have no hit region, so a tap on the world cannot open a keyboard.
        for (const field of Object.values(this.fields)) field.SetBox(new Rectangle(-1000, -1000, 0, 0));
        const { Width: width, Height: height } = this.screen;
        const panelWidth = Math.min(440, width - 32), x = (width - panelWidth) / 2;
        const f = this.frame, session = this.level.session;
        if (!this.level.playing) {
            this.lobby.Draw(width, height);
            this.help.OnDrawn();
            return;
        }
        f.Panel({ x: 12, y: 12, width: width - 24, height: 78 });
        f.Text(`ROOM ${session.room} · ${session.players.filter(player => player.connected).length}/8 · ${session.status}`, 24, 37, { size: 13 });
        f.Text(`BEACON ${session.charge}/${this.level.rules.requiredGems}   ◆ ${this.level.player.state?.gems ?? 0} in bag`, 24, 59, { color: '#ffe6a0' });
        const material = this.level.controls.Material;
        f.Text(`${material.toUpperCase()} ×${this.level.player.state?.inventory?.[material] ?? 0} · ${Math.round(session.ping)}ms`, 24, 78);
        this.LayoutButton('pause', 'Ⅱ', width - 60, 26, 38);
        this.LayoutButton('chat', 'Chat', 12, 100, 62);
        this.LayoutButton('invite', 'Invite', 82, 100, 64);
        const opacity = this.fields.chat.isActive ? 1 : Math.max(0, Math.min(1, 1 - (this.chatAge - CHAT_HOLD_SECONDS) / CHAT_FADE_SECONDS));
        const chatY = Math.min(200, height * 0.32), chatWidth = Math.min(420, width - 24);
        const ctx = this.screen.Context; ctx.save(); ctx.globalAlpha = opacity;
        if (opacity > 0) {
            f.Panel({ x: 12, y: chatY - 25, width: chatWidth, height: this.messages.length * 20 + 22 });
            this.messages.forEach((message, index) => f.Text(`${message.system ? '•' : message.name + ':'} ${message.text}`, 22, chatY + index * 20,
                { size: 12, color: message.system ? '#ffe6a0' : '#eef7ff', maxWidth: chatWidth - 20 }));
        }
        ctx.restore();
        if (this.fields.chat.isActive) this.Field('chat', 12, Math.min(chatY + MAX_CHAT_LINES * 20, height - 56), chatWidth);
        if (!this.level.controls.mobile) this.help.DrawAction('HELP',18,height-44);
        this.LayoutButton('help','?',width-60,100,38);
        if (this.paused) {
            for (const button of Object.values(this.buttons)) button.enabled = false;
            ctx.fillStyle = 'rgba(5,12,22,.8)'; ctx.fillRect(0, 0, width, height);
            f.Panel({ x, y: height / 2 - 160, width: panelWidth, height: 310 });
            f.Text('REST A MOMENT', x + 24, height / 2 - 120, { size: 24, color: '#ffe6a0' });
            f.Text('The shared world keeps running.', x + 24, height / 2 - 96);
            const labels = ['Resume', `Sound: ${this.volume ? 'on' : 'off'}`, `Touch controls: ${Input.instance.presentation.TouchVisible?'on':'off'}`, 'Leave room'];
            ['resume', 'volume', 'controls', 'leave'].forEach((id, index) =>
                this.LayoutButton(id, labels[index], x + 20, height / 2 - 74 + index * 52, panelWidth - 40, this.selection % 4 === index));
        }
        this.help.OnDrawn();
    }
    Dispose() {
        this.help.Dispose();
        for (const field of Object.values(this.fields)) field.Dispose();
        for (const button of Object.values(this.buttons)) button.Dispose();
    }
}
