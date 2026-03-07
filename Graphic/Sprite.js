/**
 * @doc Class Sprite
 * @namespace Graphic
 * @class Sprite
 * @author Patrick Faustino Camello
 * @summary Handles sprite rendering and animation for the EngineHtml5 framework.
 * @description This class provides functionality to render static and animated sprites on the canvas.
 * @Date 15/05/2019
 * @example
 *  const sprite = new Sprite(screen, 'path/to/sprite.png');
 *  sprite.Animation(undefined, new Vector2D(100, 100), 'horizontal');
 * @returns {Object}
 */
import { Vector2D } from "../Math/Vector2D.js";

export class Sprite {
	constructor(screen, spriteSrc) {
		this.screen = screen;
		this.position = new Vector2D(0, 0);
		this.size = new Vector2D(32, 32);
		this.scale = 1;
		this.direction = "horizontal";
		this.row = 0;
		this.index = 0;
		this.frameCount = 1;
		this.updateFrame = 0;
		this.updatesPerFrame = 2;

		this.sprite = new Image();
		if (spriteSrc) {
			this.sprite.src = spriteSrc;
		}
	}

	/**
	 * @doc Method
	 * @param {string} [spriteSrc] - The path to the sprite image.
	 * @param {Vector2D} position - The position on the canvas to draw the sprite.
	 * @description Draws a static sprite on the canvas.
	 * @example
	 *  sprite.Static('path/to/sprite.png', new Vector2D(100, 100));
	 */
	Static(spriteSrc, position) {
		if (spriteSrc) {
			this.sprite.src = spriteSrc;
		}

		if (!this.sprite.src) {
			throw new Error('Sprite source is not set.');
		}

		this.screen.Context.drawImage(this.sprite, position.GetValue().x, position.GetValue().y);
	}

	/**
	 * @doc Method
	 * @param {string} [spriteSrc] - The path to the sprite image.
	 * @param {Vector2D} position - The position on the canvas to draw the sprite.
	 * @param {Vector2D} size - The size of the sprite to draw.
	 * @param {Vector2D} cutPosition - The position to start clipping from.
	 * @param {Vector2D} cutSize - The size of the clipping area.
	 * @description Draws a clipped portion of a sprite.
	 * @example
	 *  sprite.Cliping('path/to/sprite.png', new Vector2D(100, 100), new Vector2D(32, 32), new Vector2D(0, 0), new Vector2D(32, 32));
	 */
	Cliping(spriteSrc, position, size, cutPosition, cutSize) {
		if (spriteSrc) {
			this.sprite.src = spriteSrc;
		}

		if (!this.sprite.src) {
			throw new Error('Sprite source is not set.');
		}

		this.screen.Context.drawImage(
			this.sprite,
			cutPosition.GetValue().x, cutPosition.GetValue().y,
			cutSize.GetValue().x, cutSize.GetValue().y,
			position.GetValue().x, position.GetValue().y,
			size.GetValue().x, size.GetValue().y
		);
	}

	/**
	 * @doc Method
	 * @param {string} [spriteSrc] - The path to the sprite image.
	 * @param {Vector2D} position - The position on the canvas to draw the sprite.
	 * @param {Vector2D} size - The new size to stretch the sprite.
	 * @description Draws the sprite stretched to the specified size on the canvas.
	 * @example
	 *  sprite.Stretched('path/to/sprite.png', new Vector2D(100, 100), new Vector2D(200, 200));
	 */
	Stretched(spriteSrc, position, size) {
		if (spriteSrc) {
			this.sprite.src = spriteSrc;
		}

		if (!this.sprite.src) {
			throw new Error('Sprite source is not set.');
		}

		const { x: posX, y: posY } = position.GetValue();
		const { x: width, y: height } = size.GetValue();

		this.screen.Context.drawImage(
			this.sprite,
			0, 0,
			this.sprite.width, this.sprite.height,
			posX, posY,
			width, height
		);
	}


	/**
	 * @doc Method
	 * @param {string} spriteSrc - The path to the sprite image.
	 * @param {Vector2D} position - The position on the canvas to draw the sprite.
	 * @param {string} [direction='horizontal'] - The animation direction ('horizontal' or 'vertical').
	 * @param {number} [row=0] - The row index for vertical animations.
	 * @description Draws an animated sprite based on the current index and row.
	 * @example
	 *  sprite.Animation('path/to/sprite.png', new Vector2D(100, 100), 'horizontal', 0);
	 */
	Animation(spriteSrc, position, direction = 'horizontal', row = 0, facingRight = true) {
        // Atualiza a source apenas se for diferente, evitando recarregamentos no loop
        if (spriteSrc && this.sprite.src !== new URL(spriteSrc, document.baseURI).href) {
            this.sprite.src = spriteSrc;
        }

        if (!this.sprite.src) {
            throw new Error('Sprite source is not set.');
        }

        this.position = position;
        this.row = row;

        const { x, y } = this.size.GetValue();
        const { x: posX, y: posY } = this.position.GetValue();
        
        // Calculamos a largura e altura finais com a escala aplicada
        const finalWidth = x * this.scale;
        const finalHeight = y * this.scale;

        const ctx = this.screen.Context;
        
        // 1. Salva o estado atual do canvas para não bugar o resto do jogo
        ctx.save(); 

        // 2. Lógica de inversão
        if (!facingRight) {
            // Se estiver olhando para a esquerda, movemos o eixo X para a direita 
            // (somando a largura final) e invertemos a escala.
            ctx.translate(posX + finalWidth, posY);
            ctx.scale(-1, 1);
        } else {
            // Se for direita, apenas movemos o eixo para a posição normal
            ctx.translate(posX, posY);
        }

        // 3. Desenho
        // ATENÇÃO: Como o ctx já foi movido para a posição correta (posX, posY),
        // o destino no drawImage (parâmetros 6 e 7) passa a ser 0, 0.
        if (direction === 'horizontal') {
            ctx.drawImage(this.sprite,
                this.index * x, this.row * y,
                x, y, 
                0, 0, // <--- Relativo ao eixo transladado
                finalWidth, finalHeight
            );
        } else {
            ctx.drawImage(this.sprite,
                0, this.index * y,
                x, y, 
                0, 0, // <--- Relativo ao eixo transladado
                finalWidth, finalHeight
            );
        }

        // 4. Restaura o estado original do canvas para desenhar as próximas entidades
        ctx.restore(); 
    }

	/**
	 * @doc Method
	 * @description Updates the animation frame based on the frame count and updates per frame.
	 * @example
	 *  sprite.Update();
	 */
	Update() {
		if (this.updateFrame >= this.updatesPerFrame) {
			this.updateFrame = 0;
			this.index = (this.index + 1) % this.frameCount;
		}
		this.updateFrame++;
	}

	/**
	 * @doc Method
	 * @description Resets the animation frame to the first frame.
	 * @example
	 *  sprite.Reset();
	 */
	Reset() {
		this.index = 0;
		this.updateFrame = 0;
	}
}
