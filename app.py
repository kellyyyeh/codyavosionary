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
    print(outputs[0].shape)
    for feature_map in outputs:
        feature_map = tf.squeeze(feature_map, axis=0)  # Remove the batch dimension (shape now: (height, width, num_filters))
        num_filters = feature_map.shape[-1]  # Get the number of filters

        for j in range(num_filters):  # Iterate over each filter
            single_filter_map = feature_map[:, :, j].numpy()  # Convert to NumPy array for visualization
            processed.append(single_filter_map)

    # Visualize and save each processed feature map
    processed_images = []
    for i, fm in enumerate(processed):
        fig, ax = plt.subplots(figsize=(4, 4))
        ax.imshow(fm, cmap='viridis')
        ax.axis("off")
        ax.set_title(f'Feature Map {i}', fontsize=10)

        buf = io.BytesIO()
        fig.savefig(buf, format='png', bbox_inches='tight')
        plt.close(fig)
        buf.seek(0)

        img_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        processed_images.append(img_base64)
    # for feature_map in outputs:
    #     feature_map = tf.squeeze(feature_map, axis=0)  # Remove batch dimension
    #     gray_scale = tf.reduce_sum(feature_map, axis=-1)  # Sum across channels to make it grayscale
    #     gray_scale /= tf.cast(feature_map.shape[-1], tf.float32)  # Normalize by the number of channels
    #     processed.append(gray_scale.numpy())  # Convert to NumPy array
    #     print('finished squeeze')
    
    # processed_images = []
    # for i, fm in enumerate(processed):
    #     print(f"Feature map shape for layer {i}: {fm.shape}")  # Add this line for debugging
    # for i, fm in enumerate(processed):  # Loop over each feature map tensor in `processed`
    #     # `fm` should have a shape like (height, width, num_filters)
    #     fig, ax = plt.subplots(figsize=(4, 4))
    #     ax.imshow(fm, cmap='viridis')
    #     ax.axis("off")
    #     ax.set_title(f'Layer {i}', fontsize=10)

    #     buf = io.BytesIO()
    #     fig.savefig(buf, format='png', bbox_inches='tight')
    #     plt.close(fig)
    #     buf.seek(0)

    #     img_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
    #     processed_images.append(img_base64)

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