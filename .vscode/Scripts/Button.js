class Button extends Base {
    constructor() {
        // Default
        this.color = "#428BCA";
    };
    
    // Gets e Sets
    set color(cor) {
        this.color = cor;
    }
    get color() {
        return this.color;
    }
    
    // Métodos
    Click() {

    }

    Draw(x, y, width, height) {
        context.fillStyle = color;
        context.rect(x, y, width, height);
        context.fill();
    }
}