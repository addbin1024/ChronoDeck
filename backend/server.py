from flask import Flask, request, jsonify, make_response
import os
import shutil
import json  
from compute.filter import filterDataByTimeRange
from compute.dr import mds_to2d, t_sne_to2d
from compute.groupTree import constructGT, getGroupedPoints
from compute.basic import getAverageSeriesData
from compute.comprehensive import getBoundary, getSDALL
from compute.relate import getBestPath, getBestTree
from compute.TSfuncCal import Standardize, ChangePercentage

app = Flask(__name__)

PV_data_folder_path = "data/Stock"
PV_tree_file_name = "PV_Tree.json"
PV_tree_grouped_file_name = "PV_Tree_grouped.json"
collection_json_path = os.path.join(os.path.dirname(__file__), 'tmp/origin_coordinateCollection.json')

@app.route('/PVTree', methods=['GET'])
def getPVTree():

    if os.path.exists(os.path.join(os.path.dirname(__file__),PV_data_folder_path, PV_tree_grouped_file_name)):
        os.remove(os.path.join(os.path.dirname(__file__),PV_data_folder_path, PV_tree_grouped_file_name))
    if os.path.exists(os.path.join(os.path.dirname(__file__),"tmp")):
        shutil.rmtree(os.path.join(os.path.dirname(__file__),"tmp")) 

    file_path = os.path.join(os.path.dirname(__file__),PV_data_folder_path, PV_tree_file_name)
    if os.path.exists(file_path):
        with open(file_path, 'r') as file:
            pv_tree_data = json.load(file) 
        
        SD_result = getSDALL(pv_tree_data, PV_data_folder_path) # max_level可以调，四级就是4
        SD_file_path = os.path.join(os.path.dirname(__file__),PV_data_folder_path, "PV_SD.json")
        with open(SD_file_path, 'w') as json_file:
            json.dump(SD_result, json_file)
        return {"PV_Tree": pv_tree_data, "SD": SD_result}
    else:
        return make_response(jsonify({"error": "File not found"}), 404)

@app.route('/SeriesCollection', methods=['POST'])
def getSeriesCollection():
    data = request.get_json()
    selectionTree = data.get('selectionTree', [])
    dataset = data.get('dataset', None)
    collection = []
    nodeList = []
    pv_tree_data =[]
    pv_tree_grouped_data = []

    for item in selectionTree:
        nodeList.append(item["id"])
    
    if dataset == 'PV':
        # read the tree structure to get file_name
        file_path = os.path.join(os.path.dirname(__file__),PV_data_folder_path, PV_tree_file_name)
        file_grouped_path = os.path.join(os.path.dirname(__file__),PV_data_folder_path, PV_tree_grouped_file_name)
        if os.path.exists(file_path):
            with open(file_path, 'r') as file:
                pv_tree_data = json.load(file) 
        
        if os.path.exists(file_grouped_path):
            with open(file_grouped_path, 'r') as file:
                pv_tree_grouped_data = json.load(file) 

        for id in nodeList:
            object = {}
            object["id"] = id

            matching_dict = next((item for item in pv_tree_data if item["id"] == id), None)
            matching_node = next((item for item in pv_tree_grouped_data if item["id"] == id), None)
            if matching_dict is not None:
                object["node_name"] = matching_dict["node_name"]
                if matching_node is not None:
                    object["level"] = matching_node["level"]
                elif matching_node is None:
                    object["level"] = matching_dict["level"]
                data_file_name = matching_dict["node_name"] + ".json"
                if id == 1:
                    data_file_path = os.path.join(os.path.dirname(__file__),PV_data_folder_path, data_file_name)
                    with open(data_file_path, 'r') as file:
                        d = json.load(file)["data"]
                        object['seriesData'] = Standardize(d)
                        print(object['seriesData'])
                        object['seriesData_copy'] = object['seriesData']
                        object['price'] = d
                        object['change'] = ChangePercentage(d)
                else:
                    data_folder_path = list(matching_dict["node_name"].split("-"))[-2]
                    # 封装以下
                    data_file_path = os.path.join(os.path.dirname(__file__),PV_data_folder_path, data_folder_path, data_file_name)
                    with open(data_file_path, 'r') as file:
                        d = json.load(file)["data"]
                        object['seriesData'] = Standardize(d)
                        object['seriesData_copy'] = object['seriesData']
                        object['price'] = d
                        object['change'] = ChangePercentage(d)
                        
            else:
                object["node_name"] = matching_node["node_name"]
                object["level"] = matching_node["level"]
                children_id = matching_node["children_id"]
                seriesData_list = []
                priceData_list = []
                for child_id in children_id:
                    child_matching_node = next((item for item in pv_tree_grouped_data if item["id"] == child_id), None)
                    data_file_name = child_matching_node["node_name"] + ".json"
                    data_folder_path = list(child_matching_node["node_name"].split("-"))[-2]
                    data_file_path = os.path.join(os.path.dirname(__file__),PV_data_folder_path, data_folder_path, data_file_name)
                    with open(data_file_path, 'r') as file:
                        d = json.load(file)["data"]
                        seriesData_list.append(Standardize(d))
                        priceData_list.append(d)

                object['seriesData'] = getAverageSeriesData(seriesData_list)
                object['seriesData_copy'] = object['seriesData']
                object['price'] = getAverageSeriesData(priceData_list)
                object['change'] = ChangePercentage(object['price'])

            collection.append(object)
    
    return {"seriesCollection": collection}

@app.route('/coordinateCollection', methods=["POST"])
def getCoordinateCollection():
    # print("getCoordinateCollection running!")
    data = request.get_json()
    dataset = data.get("dataset","")
    level_id_list = data.get("level_id_list",[])
    timeRange = data.get("timeRange",[])
    # print("CHECK")
    # print(timeRange)

    if dataset == "PV":
        # I dont know why I wrote this, but it maybe useful.
        # if os.path.isfile(collection_json_path):
        #     with open(collection_json_path, 'r') as file:
        #         collection_dict = json.load(file)
            
        #     return collection_dict

        file_path = os.path.join(os.path.dirname(__file__),PV_data_folder_path, PV_tree_file_name)
        if os.path.exists(file_path):
            with open(file_path, 'r') as file:
                pv_tree_data = json.load(file) 
        
        collection = {}
        for level_id in level_id_list:
            object = {}
            node_list = []
            # find nodes in pv_tree_data whose level equals to level_id
            for node in pv_tree_data:
                if node["level"] == level_id:
                    node_list.append(node)
            
            for node in node_list:
                data_file_name = node["node_name"] + ".json"
                if node["id"] == 1:
                    data_file_path = os.path.join(os.path.dirname(__file__),PV_data_folder_path, data_file_name)
                    with open(data_file_path, 'r') as file:
                        object[node["id"]] = filterDataByTimeRange(Standardize(json.load(file)["data"]), timeRange)

                else:
                    data_folder_path = list(node["node_name"].split("-"))[-2]
                    data_file_path = os.path.join(os.path.dirname(__file__),PV_data_folder_path, data_folder_path, data_file_name)
                    with open(data_file_path, 'r') as file:
                        object[node["id"]] = filterDataByTimeRange(Standardize(json.load(file)["data"]), timeRange)
                        
            # result = mds_to2d(object)
            result = t_sne_to2d(object, perp=5, ee=12)

            collection[level_id] = result
        
        collection_dict = {"coordinateCollection":collection}
        os.makedirs(os.path.join(os.path.dirname(__file__),"tmp"), exist_ok=True)
        with open(collection_json_path, 'w') as json_file:
            json.dump(collection_dict, json_file)
        
        return collection_dict

@app.route('/addLayer', methods=["POST"])
def getGroupedCoordinateCollection():
    data = request.get_json()
    dataset = data.get("dataset","")
    level = data.get("level_id",[])
    collection = {}

    if dataset == 'PV':
        Tree_path = os.path.join(os.path.dirname(__file__),PV_data_folder_path, PV_tree_file_name)
        if os.path.exists(Tree_path):
            with open(Tree_path, 'r') as file:
                pv_tree_data = json.load(file) 
        max_level = max(pv_tree_data, key=lambda x: x["level"])['level']

        # if exist the original collection: get level's points;
        # else run the mds on the original Tree
        with open(collection_json_path, 'r') as file:
            origin_collection = json.load(file) 
        # print(origin_collection)
        tmp_result = origin_collection["coordinateCollection"][str(level)]

        grouped_Tree = constructGT(Tree_path, tmp_result, level, n=2)
        grouped_Points = getGroupedPoints(grouped_Tree, tmp_result, level)
        for i in range(max_level+1, level, -1):
            collection[i] = origin_collection["coordinateCollection"][str(i-1)]
        collection[level] = grouped_Points
        for i in range(level-1, 0, -1):
            collection[i] = origin_collection["coordinateCollection"][str(i)]
        grouped_result = {"newOriginalTree":grouped_Tree, "newCoordinateCollection":collection}
        
        shutil.rmtree(os.path.join(os.path.dirname(__file__),"tmp"))   
        
        return grouped_result
    

@app.route('/scale', methods=["POST"])
def getScale():
    data = request.get_json()
    dataset = data.get("dataset", "")
    timeRange = data.get("timeRange",[])

    if dataset == 'PV':
        Tree_path = os.path.join(os.path.dirname(__file__),PV_data_folder_path, PV_tree_file_name)
        if os.path.exists(Tree_path):
            with open(Tree_path, 'r') as file:
                pv_tree_data = json.load(file) 
        return getBoundary(pv_tree_data, PV_data_folder_path, timeRange)

@app.route('/SD', methods=["POST"])
def getSD():
    data = request.get_json()
    dataset = data.get("dataset", "")

    if dataset == 'PV':
        SD_file_path = os.path.join(os.path.dirname(__file__),PV_data_folder_path, "PV_SD.json")
        if os.path.exists(SD_file_path):
            with open(SD_file_path, 'r') as file:
                SD_result = json.load(file) 
        return SD_result

# @app.route('', methods=["POST"])    # get interface
# def getRelateTree():
#     data = request.get_json()
#     dataset = data.get("dataset", "")
#     target_tree_id = data.get("??") # get data
#     timeRange = data.get("timeRange",[])

#     if dataset == "PV":
#         Tree_path = os.path.join(os.path.dirname(__file__),PV_data_folder_path, PV_tree_file_name)
#         if os.path.exists(Tree_path):
#             with open(Tree_path, 'r') as file:
#                 pv_tree_data = json.load(file) 
#         relate_trees = getBestTree(pv_tree_data, PV_data_folder_path, target_tree_id, timeRange)
#         return relate_trees
    
# @app.route('', methods=["POST"])    # get interface
# def getRelatePath():
#     data = request.get_json()
#     dataset = data.get("dataset", "")
#     target_path_id = data.get("??", []) # get data
#     timeRange = data.get("timeRange",[])

#     if dataset == "PV":
#         Tree_path = os.path.join(os.path.dirname(__file__),PV_data_folder_path, PV_tree_file_name)
#         if os.path.exists(Tree_path):
#             with open(Tree_path, 'r') as file:
#                 pv_tree_data = json.load(file) 
#         relate_trees = getBestPath(pv_tree_data, PV_data_folder_path, target_path_id, timeRange)
#         return relate_trees

if __name__ == "__main__":
    app.run(port=3000, debug=True)
