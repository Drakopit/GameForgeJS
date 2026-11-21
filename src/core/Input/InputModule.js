import { Input } from "./Input.js";
import { ActionManager } from "./ActionManager.js";

/** Input belongs to a game and its target; canvas targets should be focusable. */
export function inputModule({ target = null } = {}) {
    return {
        id: "input",
        setup(context) {
            const input = Input.CreateScoped({
                config: context.config, events: context.events,
                target: target ?? context.canvas ?? globalThis.window,
            });
            class Actions extends ActionManager {
                static input = input;
                static mappings = structuredClone(context.config.input?.actionMappings ?? {});
            }
            context.services.set("input", input);
            context.services.set("actions", Actions);
            return () => {
                input.instance.Dispose();
                context.services.delete("input");
                context.services.delete("actions");
            };
        },
    };
}
