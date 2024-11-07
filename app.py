from flask import (
    Flask, render_template, request, redirect, url_for, session, jsonify, render_template_string)
from tensorflow import keras
import tensorflow as tf
from tensorflow.keras import layers
import numpy as np
import io
import base64
import matplotlib
matplotlib.use('Agg')
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
    image = np.array(pixels).astype(float).reshape(1, 50, 50, 1)
    
    model = keras.models.load_model('numbers3.keras')

    __ = model.predict(image)
    pred = np.argmax(__, axis=-1)
    print(f"Prediction Value: {pred[0]}")

    # Extract feature maps from each convolutional layer
    # conv_layers = [layer for layer in model.layers if isinstance(layer, keras.layers.Conv2D)]
    conv_layers = []
    model_weights = []
    counter = 0

    # Call the function on each top-level layer
    for layer in model.layers:
        get_conv_layers_and_weights(layer, conv_layers, model_weights)

    outputs = []
    names = []
    for layer in conv_layers:
        image = layer(image)
        outputs.append(image)
        names.append(str(layer))
    print(len(outputs))
    #print feature_maps
    for feature_map in outputs:
        print(feature_map.shape)

    processed = []
    for feature_map in outputs:
        feature_map = tf.squeeze(feature_map, axis=0)  # Remove batch dimension
        gray_scale = tf.reduce_sum(feature_map, axis=-1)  # Sum across channels to make it grayscale
        gray_scale /= tf.cast(feature_map.shape[-1], tf.float32)  # Normalize by the number of channels
        processed.append(gray_scale.numpy())  # Convert to NumPy array
        print('finished squeeze')
    
    processed_images = []
    for i, fm in enumerate(processed):
    # Create a new figure for each feature map
        fig, ax = plt.subplots(figsize=(6, 6))  # Adjust the size as needed
        ax.imshow(fm, cmap='viridis')  # Display the feature map
        ax.axis("off")  # Hide the axes for a cleaner look
        ax.set_title(names[i].split('(')[0], fontsize=12)  # Set a smaller title for individual plots

        # Save the figure to a BytesIO buffer
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight')  # Save the plot to the buffer
        plt.close(fig)  # Close the figure to free up memory
        buf.seek(0)  # Rewind the buffer to the beginning

        # Convert the buffer to a base64 string and store it
        img_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        processed_images.append(img_base64)
    for fm in processed:
        print(fm.shape)

    # Return JSON with prediction and images
    print('made into json package time')
    return jsonify(pred=pred[0].item(), images=processed_images)


    # return jsonify(pred=pred[0].item())

def get_conv_layers_and_weights(layer, conv_layers, model_weights):
    # Check if the layer is a Conv2D layer
    if isinstance(layer, layers.Conv2D):
        model_weights.append(layer.get_weights())
        conv_layers.append(layer)
    # If the layer contains sub-layers (e.g., Sequential), recursively check them
    elif hasattr(layer, 'layers'):
        for sub_layer in layer.layers:
            get_conv_layers_and_weights(sub_layer, conv_layers, model_weights)

if __name__ == '__main__':
    app.run(debug=True)