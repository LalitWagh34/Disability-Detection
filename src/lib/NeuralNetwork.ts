export class NeuralNetwork {
    inputNodes: number;
    hiddenNodes: number;
    outputNodes: number;
    weightsIH: number[][]; // Input -> Hidden
    weightsHO: number[][]; // Hidden -> Output
    biasH: number[];
    biasO: number[];
    learningRate: number;

    constructor(input_nodes: number, hidden_nodes: number, output_nodes: number) {
        this.inputNodes = input_nodes;
        this.hiddenNodes = hidden_nodes;
        this.outputNodes = output_nodes;

        // Initialize weights randomly between -1 and 1
        this.weightsIH = Array(this.hiddenNodes).fill(0).map(() => Array(this.inputNodes).fill(0).map(() => Math.random() * 2 - 1));
        this.weightsHO = Array(this.outputNodes).fill(0).map(() => Array(this.hiddenNodes).fill(0).map(() => Math.random() * 2 - 1));

        this.biasH = Array(this.hiddenNodes).fill(0).map(() => Math.random() * 2 - 1);
        this.biasO = Array(this.outputNodes).fill(0).map(() => Math.random() * 2 - 1);

        this.learningRate = 0.1;
    }

    // Sigmoid activation function
    sigmoid(x: number): number {
        return 1 / (1 + Math.exp(-x));
    }

    // Derivative of sigmoid for backpropagation
    dSigmoid(y: number): number {
        return y * (1 - y);
    }

    predict(input_array: number[]): number[] {
        // Generating the Hidden Outputs
        let hidden = this.matrixMultiply(this.weightsIH, input_array);
        hidden = this.matrixAdd(hidden, this.biasH);
        hidden = hidden.map(val => this.sigmoid(val));

        // Generating the output's output!
        let output = this.matrixMultiply(this.weightsHO, hidden);
        output = this.matrixAdd(output, this.biasO);
        output = output.map(val => this.sigmoid(val));

        return output;
    }

    train(input_array: number[], target_array: number[]) {
        // Generate the hidden outputs
        let hidden = this.matrixMultiply(this.weightsIH, input_array);
        hidden = this.matrixAdd(hidden, this.biasH);
        hidden = hidden.map(val => this.sigmoid(val));

        // Generate the output outputs
        let outputs = this.matrixMultiply(this.weightsHO, hidden);
        outputs = this.matrixAdd(outputs, this.biasO);
        outputs = outputs.map(val => this.sigmoid(val));

        // Calculate output errors (Target - Output)
        let output_errors = target_array.map((t, i) => t - outputs[i]);

        // Calculate gradient
        let gradients = outputs.map(val => this.dSigmoid(val));
        gradients = gradients.map((val, i) => val * output_errors[i] * this.learningRate);

        // Calculate deltas
        let hidden_T = hidden; // simplified for 1D array structure in this specific implementation
        // Actually, we need weights deltas. 
        // weight_ho_deltas = gradient * hidden_T
        // For simplicity in this non-matrix library, we loop.

        // Adjust Hidden->Output Weights
        for (let i = 0; i < this.outputNodes; i++) {
            for (let j = 0; j < this.hiddenNodes; j++) {
                this.weightsHO[i][j] += gradients[i] * hidden[j];
            }
            this.biasO[i] += gradients[i];
        }

        // Calculate hidden errors
        // hidden_errors = weights_ho_T * output_errors
        let weights_ho_t = this.transpose(this.weightsHO);
        let hidden_errors = this.matrixMultiply(weights_ho_t, output_errors);

        // Calculate hidden gradient
        let hidden_gradient = hidden.map(val => this.dSigmoid(val));
        hidden_gradient = hidden_gradient.map((val, i) => val * hidden_errors[i] * this.learningRate);

        // Adjust Input->Hidden Weights
        for (let i = 0; i < this.hiddenNodes; i++) {
            for (let j = 0; j < this.inputNodes; j++) {
                this.weightsIH[i][j] += hidden_gradient[i] * input_array[j];
            }
            this.biasH[i] += hidden_gradient[i];
        }
    }

    // Helper: Matrix Multiply (Matrix * Vector)
    matrixMultiply(matrix: number[][], vector: number[]): number[] {
        return matrix.map(row =>
            row.reduce((sum, val, i) => sum + val * vector[i], 0)
        );
    }

    // Helper: Vector Add
    matrixAdd(v1: number[], v2: number[]): number[] {
        return v1.map((val, i) => val + v2[i]);
    }

    transpose(matrix: number[][]): number[][] {
        return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
    }
}
