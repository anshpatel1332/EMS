import sys
import os

from flask import Flask, request, jsonify
import numpy as np
import base64
import cv2
import requests as req_lib
from insightface.app import FaceAnalysis

app = Flask(__name__)

face_app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
face_app.prepare(ctx_id=0, det_size=(640, 640))

def decode_image(image_data):
    try:
        if not image_data:
            return None
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        img_bytes = base64.b64decode(image_data)
        np_arr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        print('Decode error:', e)
        return None

def load_url_image(url):
    """Load image from either a base64 data URL or an HTTP URL."""
    try:
        if url.startswith('data:'):
            header, b64data = url.split(',', 1)
            img_bytes = base64.b64decode(b64data)
            img_array = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
            if img is None:
                print('[load] Base64 image decode returned None')
            return img
        else:
            resp = req_lib.get(url, timeout=10)
            img_array = np.frombuffer(resp.content, np.uint8)
            return cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    except Exception as e:
        print('load_url_image error:', e)
        return None

def get_embedding(img):
    try:
        faces = face_app.get(img)
        if len(faces) == 0:
            return None
        return faces[0].normed_embedding
    except Exception as e:
        print('Embedding error:', e)
        return None

def cosine_similarity(a, b):
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

@app.route('/verify', methods=['POST'])
def verify():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'match': False, 'message': 'No data received'})

        image_data = data.get('image')
        known_faces = data.get('known_faces', [])
        print(f'[verify] known faces count: {len(known_faces)}')

        input_image = decode_image(image_data)
        if input_image is None:
            return jsonify({'match': False, 'message': 'Invalid image'})

        input_embedding = get_embedding(input_image)
        if input_embedding is None:
            return jsonify({'match': False, 'message': 'No face detected in camera'})

        # InsightFace buffalo_sc normed cosine similarity:
        # Same person  -> typically 0.55 to 0.85
        # Diff person  -> typically 0.10 to 0.40
        THRESHOLD = 0.50

        best_similarity = -1
        best_emp_id = None

        for face in known_faces:
            emp_id = face.get('employee_id')
            url = face.get('image_url')
            if not url:
                print(f'  [skip] emp {emp_id} - no image_url')
                continue
            known_img = load_url_image(url)
            if known_img is None:
                print(f'  [skip] emp {emp_id} - could not load image')
                continue
            known_embedding = get_embedding(known_img)
            if known_embedding is None:
                print(f'  [skip] emp {emp_id} - no face in stored image')
                continue
            similarity = cosine_similarity(input_embedding, known_embedding)
            print(f'  emp {emp_id} similarity: {similarity:.4f} (need >= {THRESHOLD})')

            # Only accept if it clears threshold AND beats current best
            if similarity >= THRESHOLD and similarity > best_similarity:
                best_similarity = similarity
                best_emp_id = emp_id

        print(f'[verify] Result: emp={best_emp_id}, similarity={best_similarity:.4f}, threshold={THRESHOLD}')

        if best_emp_id is not None:
            return jsonify({
                'match': True,
                'employee_id': best_emp_id,
                'message': 'Face matched',
                'similarity': round(best_similarity, 4)
            })

        return jsonify({'match': False, 'message': 'No match found'})

    except Exception as e:
        print('ERROR:', e)
        return jsonify({'match': False, 'error': str(e)})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5050))
    app.run(host='0.0.0.0', port=port, debug=False)

