from flask import (
    Flask, render_template, request, redirect, url_for, session, jsonify, render_template_string)
from tensorflow import keras
import tensorflow as tf
import numpy as np
import io
import base64
import matplotlib.pyplot as plt


app = Flask(__name__)

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/recognize', methods=['GET'])
def recognize_get():
    print('in recognize get')
    return render_template('recognize.html')

@app.route('/recognize', methods=['POST'])
def recognize_post():
    pixels = request.form['pixels']
    pixels = pixels.split(',')
    img = np.array(pixels).astype(float).reshape(1, 50, 50, 1)
    
    model = keras.models.load_model('numbers3.keras')

    __ = model.predict(img)
    print('Here is input: ' + model.input)
    pred = np.argmax(__, axis=-1)
    print(f"Prediction Value: {pred[0]}")

    # Extract feature maps from each convolutional layer
    # conv_layers = [layer for layer in model.layers if isinstance(layer, keras.layers.Conv2D)]
    conv_layers = []
    model_weights = []
    counter = 0

    # Call the function on each top-level layer
    for layer in model.layers:
        get_conv_layers_and_weights(layer)

    feature_maps = []

    for layer in conv_layers:
        intermediate_model = keras.models.Model(inputs=model.input, outputs=layer.output)
        feature_map = intermediate_model.predict(img)
        feature_maps.append(feature_map)

    # Process and convert feature maps to base64 images
    processed_images = []
    for fm in feature_maps:
        fm = np.squeeze(fm, axis=0)  # Remove batch dimension
        fm = np.mean(fm, axis=-1)  # Average across channels to make a 2D image
        
        fig, ax = plt.subplots()
        ax.imshow(fm, cmap='viridis')
        ax.axis("off")
        
        # Convert to base64
        buf = io.BytesIO()
        fig.savefig(buf, format="png")
        plt.close(fig)
        buf.seek(0)
        img_base64 = base64.b64encode(buf.getvalue()).decode("utf-8")
        processed_images.append(img_base64)

    # Return JSON with prediction and images
    print(processed_images)
    return jsonify(pred=pred[0].item(), images=processed_images)


    # return jsonify(pred=pred[0].item())

def get_conv_layers_and_weights(layer):
    global counter
    # Check if the layer is a Conv2D layer
    if isinstance(layer, layers.Conv2D):
        model_weights.append(layer.get_weights())
        conv_layers.append(layer)
        counter += 1
    # If the layer contains sub-layers (e.g., Sequential), recursively check them
    elif hasattr(layer, 'layers'):
        for sub_layer in layer.layers:
            get_conv_layers_and_weights(sub_layer)

if __name__ == '__main__':
    app.run(debug=True)