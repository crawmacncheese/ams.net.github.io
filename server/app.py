import os
import shutil
import sys
from flask import send_from_directory
from flask import Flask, request, send_file, jsonify, make_response
import subprocess
from werkzeug.utils import secure_filename
import json
import psycopg2
from flask_cors import CORS, cross_origin



app = Flask(__name__, static_folder=os.path.abspath("build"))
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})
# if __name__ == '__main__':
#     app.run(debug=True, host='0.0.0.0', ssl_context=('fullchain.pem','privkey.pem'))
    # app.run(host='localhost', port=3000)

# app.run(debug=True, host='0.0.0.0', ssl_context=('fullchain.pem','privkey.pem'))
conn = None
try:
    conn = psycopg2.connect(database="amsnet", user="postgres", password="alvin135", host="localhost", port="5433")

    cur = conn.cursor()
    cur.execute("""CREATE TABLE IF NOT EXISTS users (
        username VARCHAR(50) PRIMARY KEY,
        password VARCHAR(50) NOT NULL
        );""")
    
    cur.execute("""CREATE TABLE IF NOT EXISTS files (
        component_id VARCHAR(100) PRIMARY KEY,
        username VARCHAR(50),
        imagenumber INTEGER NOT NULL,
        folder VARCHAR(50) NOT NULL,
        path VARCHAR(255),
        json JSONB,
        cir TEXT
        );""")
    conn.commit()
except (Exception, psycopg2.Error) as error:
    print(f'Error: {error}')

finally:
    if conn:
        conn.close()
        print("Database initialized, connection closed")

@app.route('/', defaults={'path':''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder,path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')
    
    
@app.route('/instantiate_uuid', methods=['GET'])
def instantiate_uuid():
    user_uuid = request.args.get('user_uuid')   
    root_path = f'components/{user_uuid}'

    page_bin_path = f'{root_path}/page_bin'
    page_img_path = f'{root_path}/page_img'
    page_data_path = f'{root_path}/page_data'  
    page_netlist_path = f'{root_path}/page_netlist'
    part_bin_path = f'{root_path}/part_bin'
    part_img_path = 'components/part_img'
    export_dir = f'{root_path}/export_20240510'

    for file_path in [
    page_bin_path,
    page_img_path,
    page_data_path,
    page_netlist_path,
    part_bin_path,
    part_img_path
    ]:
        os.makedirs(file_path, exist_ok=True)
    os.makedirs(f'{export_dir}/0', exist_ok=True)
    return jsonify({"message": "UUID stored successfully"}), 200

@app.route('/run_script', methods=['POST'])
def run_script():
    user_uuid = request.args.get('user_uuid')
    data = request.get_json()
    counter = data["counter"]
    conn = psycopg2.connect(database="amsnet", user="postgres", password="alvin135", host="localhost", port="5433")

    cur = conn.cursor()
    cur.execute("INSERT INTO files (username, imagenumber, folder) VALUES (%s, 0, %s)", (user_uuid,"james"))
    conn.commit()
    conn.close()
    
    subprocess.call(["python3", "amsnet_1_1.py", user_uuid, str(counter)])
    return send_file(f"components/{user_uuid}/export_20240510/{counter}/{counter}_cpnt.jpg",mimetype='image/png')


@app.route('/get_bbox', methods=['GET'])
def get_bbox():
    
    user_uuid = request.args.get('user_uuid')
    imgname = request.args.get('imgname')
    component_id = f"{imgname}_bbox"
    # conn = psycopg2.connect(database="amsnet", user="postgres", password="alvin135", host="localhost", port="5433")

    # cur = conn.cursor()
    # cur.execute("SELECT json FROM files WHERE username = %s AND imagenumber = %s AND component_id = %s;", (user_uuid, imgname, component_id))
    # bbox = cur.fetchone()
    
    # conn.commit()
    # conn.close()
    # return send_file(bbox[0], mimetype='application/json')
    return send_file(f"components/{user_uuid}/export_20240510/{imgname}/{imgname}_bbox.json",mimetype='application/json')

@app.route('/refresh_json', methods=['GET'])
def refresh_json():
    user_uuid = request.args.get('user_uuid')
    imgname = request.args.get('imgname')
    emptydata = {}
    file_path = os.path.join(f"components/{user_uuid}/export_20240510/{imgname}", f'{imgname}_bbox.JSON')
    
    with open(file_path, 'w') as f:
        json.dump(emptydata, f)
    
    return 'JSON file refreshed successfully!'

    
@app.route('/upload_and_replace', methods=['POST'])
def upload_and_replace():
    user_uuid = request.args.get('user_uuid')
    file = request.files['file']
    counter = request.form.get('counter')
    
    
    filename = secure_filename(file.filename)
    file.save(os.path.join(f'components/{user_uuid}', filename))
    
    old_file_path = os.path.join(f'components/{user_uuid}', f'{counter}.png')
    new_file_path = os.path.join(f'components/{user_uuid}', filename)
    
    os.rename(new_file_path, old_file_path)
    
    return 'Image added successfully!'

@app.route('/replace_json', methods=['POST'])
def replace_json():
    user_uuid = request.args.get('user_uuid')
    data = request.get_json()
    
    file_path = os.path.join(f'components/{user_uuid}', 'test.JSON')
    
    with open(file_path, 'w') as f:
        json.dump(data, f)
    
    return jsonify({'message': 'JSON file replaced successfully'}), 200

@app.route('/delete_img', methods=['POST'])
def delete_img():
    user_uuid = request.args.get('user_uuid')
    data = request.get_json()
    imgname = data["name"]
    imgnumber = data['imgnumber']
    file_path = os.path.join(f'components/{user_uuid}', 'part_img', imgname)
    os.remove(file_path)
    jsonpath = os.path.join(f"components/{user_uuid}/export_20240510/{imgnumber}", f'{imgnumber}_bbox.JSON')
    with open(jsonpath, 'r', encoding='utf-8') as json_file:
        prevjson = json.load(json_file)

    specific_string = data["label"]

    if specific_string in prevjson:
        del prevjson[specific_string]

    with open(jsonpath, 'w', encoding='utf-8') as json_file:
        json.dump(prevjson, json_file)
    
    
    return send_file(f"components/{user_uuid}/export_20240510/{imgnumber}/{imgnumber}_bbox.json",mimetype='application/json')
    # return send_file(f"components/{mac_id}/export_20240510/0/0_bbox.json",mimetype='application/json')

    #dynamic routing

@app.route('/get_netlist', methods=['GET'])
def get_netlist():
    user_uuid = request.args.get('user_uuid')
    imgnumber = request.args.get('imgnumber')
    try:
        with open(f'components/{user_uuid}/export_20240510/{imgnumber}/{imgnumber}.cir', 'r') as file:
            data = file.read()
            print(data)
        return jsonify({'file_content': data})
    except Exception as e:
        return str(e)
    
@app.route('/get_img', methods=['POST'])
def get_img():
    user_uuid = request.args.get('user_uuid')
    data = request.get_json()
    imagename = data["imgname"]
    imagetype = data["imgtype"]
    conn = psycopg2.connect(database="amsnet", user="postgres", password="alvin135", host="localhost", port="5433")

    cur = conn.cursor()
    cur.execute("SELECT username FROM files WHERE username = %s", (user_uuid,))
    type = cur.fetchone()
    print(type)
    conn.commit()
    conn.close()
    try:
        # file_path = os.path.join(f'components/{user_uuid}/export_20240510/0', '0.jpg')
        file_path = os.path.join(f'components/{user_uuid}/export_20240510/{imagename}', f'{imagetype}.jpg')
        if not os.path.exists(file_path):
            return jsonify({'error': 'Folder does not exist'}), 404
        
        return send_file(file_path, mimetype="image/png"), 200
    except Exception as e:
        return str(e)
    
@app.route('/get_img_labels', methods=['GET'])
def get_img_labels():
    user_uuid = request.args.get('user_uuid')
    folder_path = os.path.join(f'components/{user_uuid}', 'part_img')
    imagenames = os.listdir(folder_path)
    return jsonify(imagenames)
    
@app.route('/get_all_img', methods=['GET'])
def get_all_img():
    user_uuid = request.args.get('user_uuid')
    imagenames = [f for f in os.listdir(f'components/{user_uuid}') if f.lower().endswith('.png')]
    try:
        return jsonify(imagenames)
    except Exception as e:
        return str(e)

    
    
@app.route('/delete_circuit', methods=['POST'])
def delete_circuit():
    user_uuid = request.args.get('user_uuid')
    data = request.get_json()
    file_path = os.path.join(f'components/{user_uuid}', f'{data["name"]}.png')
    os.remove(file_path)
    folder_path = os.path.join(f'components/{user_uuid}/export_20240510', data["name"])
    if not os.path.exists(folder_path):
        return jsonify({'error': 'Folder does not exist'}), 404

    shutil.rmtree(folder_path)

    return jsonify({'message': 'All files removed successfully'}), 200
    
