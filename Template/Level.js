/**
 * @doc Class Level
 * @namespace Template
 * @class Level
 * @author Patrick Faustino Camello
 * @summary That class was made, to compose the EngineHtml5 framework.
 * @description Base class to levels
 * @Date 15/05/2019
 * @example
 *  Is used to inheritance 
 * @returns void
 */

import { Base } from "../Root/Base.js";

export class Level extends Base {
    constructor() {
        super();
        // The level name
        this.caption = "Modelo de Level";
        
        // If pass to the next level
        this.Next = false;
        
		// Level ID
		this.TelaId;

        // Level Handler
        this.LEVEL_HANDLER
    }

    OnStart() {
        // Just show how use the caption
        document.title = this.caption;
    }
}