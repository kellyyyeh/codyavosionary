from flask import (
    Flask, render_template, request, redirect, url_for, session)
from tensorflow import keras
import numpy as np

app = Flask(__name__)

@app.route('/')
def index():
    model = keras.models.load_model('number.keras')

    return render_template("index.html")

@app.route('/recognize', methods=['Get'])
def recognize_get():
    return render_template('recognize.html')

@app.route('/recognize', methods=['POST'])
def recognize_post():
    pixels = request.form['pixels']
    pixels = pixels.split(',')
    img = np.array(pixels).astype(float).reshape(1, 50, 50, 1)
    print('before loading')

    pred = np.argmax(model.predict(img), axis=-1)
    print(pred)
    return render_template('recognize.html')

if __name__ == '__main__':
    app.run(debug=True)