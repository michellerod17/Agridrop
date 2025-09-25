from flask import Flask, request, jsonify
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow frontend to access backend

# Load crop dataset
df = pd.read_csv('crops.csv')  # Make sure this CSV is in the same folder

# Home route to check server
@app.route('/')
def home():
    return "Flask backend is running!"

# Recommend crops route
@app.route('/recommend', methods=['GET'])
def recommend():
    # Get query parameters
    water_level = request.args.get('water')
    region = request.args.get('region')
    land_size = request.args.get('land')

    # Check if all required parameters are provided
    if not water_level or not region or not land_size:
        return jsonify({
            "error": "Missing required parameters. Please provide water, region, and land."
        }), 400  # HTTP 400 = Bad Request

    try:
        land_size = float(land_size)
        if land_size <= 0:
            raise ValueError
    except ValueError:
        return jsonify({
            "error": "Land size must be a positive number."
        }), 400

    # Filter by water need
    filtered = df[df['water_need'].str.lower() == water_level.lower()]

    # Filter by region
    filtered = filtered[filtered['region'].str.lower() == region.lower()]

    # Calculate total yield and total profit
    filtered['total_yield'] = filtered['yield_per_acre'] * land_size
    filtered['total_profit'] = filtered['profit_per_acre'] * land_size

    # Return JSON
    return jsonify(filtered.to_dict(orient='records'))

# Run Flask app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
