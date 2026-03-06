import * as tf from '@tensorflow/tfjs';

// Service for Vision-based ML tasks (e.g., Handwriting Analysis)
class VisionService {
    model: tf.LayersModel | null = null;
    isLoaded: boolean = false;

    constructor() {
        this.init();
    }

    async init() {
        try {
            // Load pre-trained model or create a new one
            // For this prototype, we will create a simple CNN on the fly
            this.model = this.createModel();
            this.isLoaded = true;
            console.log("Vision AI Model Loaded 👁️");
        } catch (error) {
            console.error("Failed to load Vision AI:", error);
        }
    }

    // Create a simple CNN for 28x28 grayscale images (MNIST style)
    createModel(): tf.LayersModel {
        const model = tf.sequential();

        // 1. Convolutional Layer
        model.add(tf.layers.conv2d({
            inputShape: [28, 28, 1],
            kernelSize: 3,
            filters: 16,
            activation: 'relu'
        }));

        // 2. Max Pooling
        model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

        // 3. Flatten
        model.add(tf.layers.flatten());

        // 4. Dense Layer (Classifier)
        // Output: 2 classes (0: Good, 1: Issues) - simplified for prototype
        model.add(tf.layers.dense({ units: 2, activation: 'softmax' }));

        model.compile({
            optimizer: 'adam',
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });

        return model;
    }

    // Analyze a drawing from Canvas data
    async analyzeDrawing(imageData: ImageData): Promise<{ label: string, confidence: number }> {
        if (!this.model) return { label: "Error", confidence: 0 };

        return tf.tidy(() => {
            // 1. Convert ImageData to Tensor
            let tensor = tf.browser.fromPixels(imageData, 1); // 1 channel (grayscale)

            // 2. Resize to 28x28 (Model input shape)
            tensor = tf.image.resizeBilinear(tensor, [28, 28]);

            // 3. Normalize (0-255 -> 0-1)
            tensor = tensor.toFloat().div(tf.scalar(255));

            // 4. Expand dims to batch (1, 28, 28, 1)
            const input = tensor.expandDims(0);

            // 5. Predict
            const prediction = this.model!.predict(input) as tf.Tensor;
            const values = prediction.dataSync();

            // Interpret results
            // Index 0: Good Quality
            // Index 1: Potential Dysgraphia Signs (Jitter/Distortion)
            const goodScore = values[0];
            const issueScore = values[1];

            if (issueScore > goodScore) {
                return { label: "Potential Issues Detected", confidence: issueScore };
            } else {
                return { label: "Good Motor Control", confidence: goodScore };
            }
        });
    }

    // Train on synthetic/mock data (Prototype capability)
    async trainOnMockData() {
        if (!this.model) return;

        // Create dummy tensors
        const xs = tf.randomNormal([10, 28, 28, 1]); // 10 images
        const ys = tf.oneHot(tf.tensor1d([0, 1, 0, 1, 0, 1, 0, 1, 0, 1], 'int32'), 2); // Labels

        await this.model.fit(xs, ys, {
            epochs: 5,
            callbacks: {
                onEpochEnd: (epoch, logs) => console.log(`Epoch ${epoch}: loss=${logs?.loss}`)
            }
        });
        console.log("Mock Training Complete");
    }
}

export const visionAi = new VisionService();
