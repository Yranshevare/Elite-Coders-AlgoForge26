from flask import Flask, request, jsonify
import pickle
import re

app = Flask(__name__)

vector = pickle.load(open("src/vectorizer.pkl", 'rb'))
model = pickle.load(open("src/model.pkl", 'rb'))

@app.route("/predict", methods=['POST'])
def predict():
    try:
        data = request.get_json()
        
    
        if not data or 'url' not in data:
            return jsonify({"error": "URL is required", "status": "error"}), 400

        url = data['url']

        # Clean URL
        cleaned_url = re.sub(r'^https?://(www\.)?', '', url)

        # Prediction
        result = model.predict_proba(vector.transform([cleaned_url]))[0]
        # print(model.classes_)

        ans = {
            "bad": result[0],
            "good": result[1]
        }

        return jsonify({
            "status":"success",
            "raw": ans,
            "prediction":max(ans, key=ans.get),
            "error":False
        })

    except Exception as e:
        return jsonify({ 
            "status": "error", 
            "error":True
        }), 500

if __name__ == "__main__":
    app.run(debug=True)