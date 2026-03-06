import * as tf from '@tensorflow/tfjs';

// Service for Sequence-based ML tasks (e.g., Attention/Fatigue Tracking)
class AttentionService {
    model: tf.LayersModel | null = null;

    constructor() {
        this.init();
    }

    async init() {
        // Create a simple LSTM model for sequence analysis
        this.model = tf.sequential();

        // LSTM Layer
        // Input shape: [TimeSteps, Features] -> [5, 2] (5 recent answers, [time, correct?])
        this.model.add(tf.layers.lstm({
            units: 8,
            inputShape: [5, 2],
            returnSequences: false
        }));

        // Output: Fatigue Level (0-1)
        this.model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

        this.model.compile({ optimizer: 'sgd', loss: 'meanSquaredError' });
        console.log("Attention LSTM Model Loaded 🧠");
    }

    // Predict fatigue based on recent performance interactions
    // Data: Array of { timeTaken: number, isCorrect: boolean }
    async predictFatigue(interactions: { time: number, correct: boolean }[]): Promise<number> {
        if (!this.model || interactions.length < 5) return 0;

        // Take last 5
        const recent = interactions.slice(-5);

        return tf.tidy(() => {
            // Format data: [[time, correct], [time, correct]...]
            const data = recent.map(i => [i.time / 60, i.correct ? 1 : 0]);

            // Create tensor [1, 5, 2] -> Batch 1, Sequence 5, Features 2
            const input = tf.tensor3d([data], [1, 5, 2]);

            const prediction = this.model!.predict(input) as tf.Tensor;
            const fatigueLevel = prediction.dataSync()[0];

            return fatigueLevel;
        });
    }
}

export const attentionAi = new AttentionService();
