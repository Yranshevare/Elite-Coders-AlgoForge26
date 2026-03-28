from flask import Flask, request, jsonify
import pickle
import re

app = Flask(__name__)

vector = pickle.load(open("src/vectorizer.pkl", 'rb'))
model = pickle.load(open("src/model.pkl", 'rb'))

@app.route("/predict", methods=['POST'])
def predict():
    data = request.get_json()
    
    if not data or 'url' not in data:
        return jsonify({"error": "URL is required"}), 400
    
    url = data['url']
    
    # Clean URL
    cleaned_url = re.sub(r'^https?://(www\.)?', '', url)
    
    # Prediction
    result = model.predict(vector.transform([cleaned_url]))[0]
    
    if result == 'bad':
        prediction = "phishing"
    elif result == 'good':
        prediction = "safe"
    else:
        prediction = "unknown"
    
    return jsonify({
        "url": url,
        "prediction": prediction
    })

if __name__ == "__main__":
    app.run(debug=True)