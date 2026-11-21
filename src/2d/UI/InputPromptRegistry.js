import { InputGlyphs } from './InputGlyphs.js';
import { ActionManager } from '../../core/Input/ActionManager.js';
import { GamepadAlias } from '../../core/Input/GamepadAlias.js';
import { Config } from '../../core/Config.js';
/** Resolves logical actions through real bindings, then maps physical inputs to art. */
export class InputPromptRegistry {
    constructor(data = {}, actions = ActionManager) {
        this.actions = actions;
        this.profiles = Object.fromEntries([...new Set([...Object.keys(InputGlyphs.profiles), ...Object.keys(data.profiles ?? {})])]
            .map(profile => [profile, { ...InputGlyphs.profiles[profile], ...data.profiles?.[profile] }]));
        this.fallback = data.fallback ?? InputGlyphs.fallback;
    }
    ForAction(action, profile, explicitRules = null) {
        const rules = explicitRules ?? this.actions.GetRules(action);
        const device = profile === 'keyboard' ? 'keyboard' : 'gamepad';
        return rules.filter(rule => rule.device === device).map(rule => this.Resolve(rule, profile));
    }
    Resolve(rule, profile) {
        let token = rule.input;
        if (rule.device === 'gamepad') {
            const options = this.actions.input.GamepadAliasOptions();
            const button = GamepadAlias.ResolveButtonIndex(token, options);
            const axis = GamepadAlias.ResolveAxis(token, options);
            token = button !== null ? `button_${button}` : axis ? `axis_${axis.index}_${axis.direction}` : token;
        }
        const descriptor = this.profiles[profile]?.[token] ?? this.fallback;
        return { ...descriptor, token, ariaLabel: descriptor.ariaLabel ?? `${profile} ${descriptor.label ?? descriptor.symbol ?? token}` };
    }
    /** Legacy adapters may reference their real configuration paths without duplicating bindings. */
    FromPaths(sources, profile, config = Config.data) {
        const device = profile === 'keyboard' ? 'keyboard' : 'gamepad';
        return (sources?.[device] ?? []).flatMap(path => {
            let value = config;
            for (const segment of path.split('.'))
                value = value && Object.hasOwn(value, segment) ? value[segment] : null;
            const inputs = Array.isArray(value) ? value : [...(value?.buttons ?? []), ...(value?.axes ?? [])];
            return inputs.map(input => this.Resolve({ device, input }, profile));
        });
    }
}
