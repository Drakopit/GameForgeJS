/**
 * @doc Class Store
 * @namespace Root
 * @class Store
 * @author Patrick Faustino Camello
 * @summary This class is part of the GameForgeJS framework and provides functionality to save and restore game state in the browser's local storage.
 * @Date 15/05/2019
 * @example
 *  var store = new Store();
 *  store.SaveState({ level: 1, score: 1000 });
 *  var state = store.RestoreState();
 * @returns {Object}
 */
export class Store {
    constructor(prefix?: string);
    prefix: string;
    /**
     * @doc Method
     * @param {Object} state - The state object to be saved.
     * @description Saves the current state to local storage.
     * @example
     *  store.SaveState({ level: 1, score: 1000 });
     * @returns {void}
     */
    SaveState(state: any, prefix: any): void;
    /**
     * @doc Method
     * @description Restores the previously saved state from local storage.
     * @example
     *  var state = store.RestoreState();
     * @returns {Object|null} The saved state object or null if no state is found.
     */
    RestoreState(prefix: any): any | null;
    /**
     * @doc Method
     * @description Clears the saved state from local storage.
     * @example
     *  store.ClearState();
     * @returns {void}
     */
    ClearState(prefix: any): void;
    /**
     * @doc Method
     * @description Backs up the saved state to a different key in local storage.
     * @param {string} backupPrefix - The prefix for the backup key.
     * @example
     *  store.BackupState('backup_game');
     * @returns {void}
     */
    BackupState(backupPrefix: string, prefix: any): void;
}
