import { NeuralNetwork } from "@/lib/NeuralNetwork";

// Singleton service to handle AI predictions
class AiDiagnosisService {
    private dyslexiaModel: NeuralNetwork;
    private dysgraphiaModel: NeuralNetwork;
    private isTrained: boolean = false;

    constructor() {
        // Inputs: [Score (0-1), TimeTaken (normalized), MistakeCount (normalized)]
        // Output: [Risk Probability]
        this.dyslexiaModel = new NeuralNetwork(3, 4, 1);
        this.dysgraphiaModel = new NeuralNetwork(3, 4, 1);
        this.trainModels();
    }

    private trainModels() {
        // Train with Synthetic Data
        // Pattern: Low Score + High Time = High Risk (1)
        // Pattern: High Score + Low Time = Low Risk (0)

        const trainingData = [
            { inputs: [0.1, 0.9, 0.8], target: [0.9] }, // Very low score, slow, many mistakes -> High Risk
            { inputs: [0.2, 0.8, 0.7], target: [0.8] },
            { inputs: [0.9, 0.1, 0.0], target: [0.05] }, // Perfect score, fast -> No risk
            { inputs: [0.8, 0.2, 0.1], target: [0.1] },
            { inputs: [0.5, 0.5, 0.5], target: [0.4] }, // Average
            { inputs: [0.4, 0.6, 0.4], target: [0.5] },
            { inputs: [0.1, 0.2, 0.1], target: [0.2] }, // Low score but fast? Maybe just careless, lower risk than struggling
        ];

        // Train 2000 times
        for (let i = 0; i < 2000; i++) {
            const data = trainingData[Math.floor(Math.random() * trainingData.length)];
            this.dyslexiaModel.train(data.inputs, data.target);
            this.dysgraphiaModel.train(data.inputs, data.target); // Using same pattern for proto
        }

        this.isTrained = true;
        console.log("AI Models Trained");
    }

    // Predict Dyslexia Risk
    // Score: 0-100 (will normalize)
    // Time: Seconds (will normalize with cap 300s)
    predictDyslexia(score: number, totalQuestions: number, timeSeconds: number): { risk: string, probability: number } {
        const normScore = score / totalQuestions;
        const normTime = Math.min(timeSeconds / 300, 1); // Cap at 5 mins
        const normMistakes = 1 - normScore; // Approximation for metadata

        const output = this.dyslexiaModel.predict([normScore, normTime, normMistakes]);
        const probability = output[0]; // 0 to 1

        let risk = "Low";
        if (probability > 0.7) risk = "High";
        else if (probability > 0.4) risk = "Moderate";

        return { risk, probability };
    }

    // New: Predict Dysgraphia (Mocking logic via NN for now as we lack raw path data)
    // We use time taken and "drawing quality" (length of data string as proxy for complexity)
    predictDysgraphia(timeSeconds: number, drawingLength: number): { risk: string, probability: number } {
        const normTime = Math.min(timeSeconds / 120, 1); // Cap at 2 mins
        // If drawing is too short ( < 1000 chars), it might be incomplete/poor. 
        // If too long, maybe too much jitter? Let's say optimal is midway.
        // For this proto, we normalize length.
        const normLength = Math.min(drawingLength / 5000, 1);

        // Pass to model (reusing dysgraphiaModel)
        const output = this.dysgraphiaModel.predict([normTime, normLength, 0.5]);
        const probability = output[0];

        let risk = "Low";
        if (probability > 0.6) risk = "High";
        else if (probability > 0.3) risk = "Moderate";

        return { risk, probability };
    }

    // New: Predict Dyscalculia
    predictDyscalculia(score: number, totalQuestions: number, timeSeconds: number): { risk: string, probability: number } {
        // Reusing similar logic to Dyslexia for now on the generic model
        const normScore = score / totalQuestions;
        const normTime = Math.min(timeSeconds / 300, 1);

        // Inverse logic: High score = low risk.
        // The NN was trained: Low Score (0.1) -> High Risk (0.9). 

        const output = this.dyslexiaModel.predict([normScore, normTime, 1 - normScore]);
        const probability = output[0];

        let risk = "Low";
        if (probability > 0.7) risk = "High";
        else if (probability > 0.4) risk = "Moderate";

        return { risk, probability };
    }
}

export const aiDiagnosis = new AiDiagnosisService();
