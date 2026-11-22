/** Input belongs to a game and its target; canvas targets should be focusable. */
export function inputModule({ target }?: {
    target?: any;
}): {
    id: string;
    setup(context: any): () => void;
};
