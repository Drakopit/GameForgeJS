// processor.js
class MyProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
    }

    process(inputs, outputs, parameters) {
        // Exemplo básico: apenas passa os dados de entrada para saída
        const input = inputs[0];
        const output = outputs[0];

        if (input && input.length > 0) {
            for (let channel = 0; channel < input.length; channel++) {
                const inputChannel = input[channel];
                const outputChannel = output[channel];
                for (let i = 0; i < inputChannel.length; i++) {
                    outputChannel[i] = inputChannel[i];
                }
            }
        }

        // Retorne true para continuar o processamento
        return true;
    }
}

registerProcessor('my-processor', MyProcessor);
