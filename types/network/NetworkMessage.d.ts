/**
 * Creates and decodes transport-neutral message envelopes.
 *
 * Payload contents belong to the game; this utility only gives messages a
 * stable `type` and metadata shape.
 */
export class NetworkMessage {
    /**
     * Creates an envelope with an id and send timestamp.
     * @param {string} type - Application message type.
     * @param {Object} [payload={}] - Serializable body.
     * @param {Object} [meta={}] - Additional metadata.
     * @returns {Object} Message envelope.
     */
    static Create(type: string, payload?: any, meta?: any): any;
    /**
     * Tests whether a value has the minimal envelope contract.
     * @param {*} value - Candidate value.
     * @returns {boolean} Whether the value is an envelope.
     */
    static IsEnvelope(value: any): boolean;
    /**
     * Encodes an envelope as JSON.
     * @param {Object} message - Message envelope.
     * @returns {string} JSON representation.
     */
    static Serialize(message: any): string;
    /**
     * Parses JSON text, an ArrayBuffer or an existing envelope.
     * @param {string|ArrayBuffer|Object} data - Wire data.
     * @returns {Object} Message envelope.
     */
    static Parse(data: string | ArrayBuffer | any): any;
    static CreateId(prefix?: string): string;
    static Now(): number;
}
