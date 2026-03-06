import * as tf from '@tensorflow/tfjs';

// Service for Reinforcement Learning (Adaptive Difficulty)
// Uses a simple Deep Q-Network (DQN) style approach
// State: [CurrentLevel (norm), Streak (norm), UserSuccessRate]
// Action: 0 (Easier), 1 (Same), 2 (Harder)

class GameAiService {
    model: tf.LayersModel | null = null;
    learningRate = 0.01;
    epsilon = 0.1; // Exploration rate

    constructor() {
        this.init();
    }

    async init() {
        this.model = tf.sequential();
        this.model.add(tf.layers.dense({ units: 10, inputShape: [3], activation: 'relu' }));
        this.model.add(tf.layers.dense({ units: 10, activation: 'relu' }));
        this.model.add(tf.layers.dense({ units: 3, activation: 'linear' })); // Q-values for 3 actions

        this.model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });
        console.log("Game AI (RL) Model Loaded 🎮");
    }

    // Decide next difficulty adjustment
    async getAction(level: number, streak: number, successRate: number): Promise<number> {
        if (!this.model) return 1; // Default: Stay same

        // Epsilon-greedy strategy
        if (Math.random() < this.epsilon) {
            return Math.floor(Math.random() * 3); // Explore
        }

        return tf.tidy(() => {
            const state = tf.tensor2d([[level / 10, streak / 10, successRate]]);
            const qValues = this.model!.predict(state) as tf.Tensor;
            return qValues.argMax(1).dataSync()[0]; // 0, 1, or 2
        });
    }

    // Train the model based on the result of the action
    // Reward: Did the user continue playing? Did they get it right?
    async train(state: number[], action: number, reward: number, nextState: number[]) {
        if (!this.model) return;

        // Q-Learning Update Rule (simplified for NN)
        // Target = Reward + Gamma * Max(Q(nextState))
        const gamma = 0.95;

        tf.tidy(() => {
            const stateTensor = tf.tensor2d([state]);
            const nextStateTensor = tf.tensor2d([nextState]);

            const qValues = this.model!.predict(stateTensor) as tf.Tensor;
            const nextQValues = this.model!.predict(nextStateTensor) as tf.Tensor;

            // Get current Q-values to modify only the one for the action taken
            const qValuesData = qValues.arraySync() as number[][];
            const maxNextQ = nextQValues.max(1).dataSync()[0];

            // Update the Q-value for the action taken
            qValuesData[0][action] = reward + gamma * maxNextQ;

            // Re-train with updated Q-values
            const targetTensor = tf.tensor2d(qValuesData);

            this.model!.fit(stateTensor, targetTensor, { epochs: 1, verbose: 0 });
        });
    }
}

export const gameAi = new GameAiService();
