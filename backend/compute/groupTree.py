'''
@Description: 
@Author: 
@Date: 2024-02-26 15:39:05
@LastEditTime: 2024-02-28 16:43:45
@LastEditors: Nemo
'''
import os
import json
from compute.dr import mds_to2d 
from compute.filter import filterDataByTimeRange
from compute.cluster import cluster_dbscan, cluster_kmeans_2d

def constructGT(Tree_path, points, level=3, n=5):
    if os.path.exists(Tree_path):
        with open(Tree_path, 'r') as file:
            pv_tree_data = json.load(file)
    num_nodes = len(pv_tree_data)
    clusters = cluster_kmeans_2d(points, n)
    for node in pv_tree_data:
        if node['level'] == level-1:
            groups_id_list = []
            groups_list = []
            clusters_id_list = []
            for child_id in node['children_id']:
                child_node = pv_tree_data[child_id - 1]
                for key, value in clusters.items():
                    if child_id in value:
                        cluster_id = int(key)
                        break
                
                group = {}
                if cluster_id == 0 or cluster_id not in clusters_id_list:
                    # init a single group
                    num_nodes += 1
                    group['id'] = num_nodes
                    group["node_name"] = node['node_name']+'-G'+str(len(groups_list)+1)
                    group["parent_id"] = node['id']
                    group["children_id"] = [child_id]
                    group["level"] = level
                    group["attribute"] = "group"+str(cluster_id)

                    groups_list.append(group)
                    groups_id_list.append(num_nodes)
                    clusters_id_list.append(cluster_id)
                    
                    child_node["parent_id"] = num_nodes
                    child_node["level"] = level+1
                else:
                    # rather than init a group, add the node to the exist group
                    index = clusters_id_list.index(cluster_id)
                    groups_list[index]['children_id'].append(child_id)
                    
                    child_node["parent_id"] = groups_list[index]['id']
                    child_node["level"] = level+1
            
            node['children_id'] = groups_id_list
            pv_tree_data.extend(groups_list)
    grouped_Tree_path = Tree_path[:-5]+'_grouped.json'
    with open(grouped_Tree_path, 'w') as json_file:
        json.dump(pv_tree_data, json_file)
    return pv_tree_data

def getGroupedPoints(pv_tree_data, children_Points, level=3):
    # with open(grouped_Tree_path, 'r') as file:
    #     pv_tree_data = json.load(file)
    
    grouped_points = []

    for node in pv_tree_data:
        if node['level'] == level:
            childpoints_list = []
            for child_id in node['children_id']:
                for data in children_Points:
                    if data['id'] == child_id:
                        childpoints_list.append([data['x'], data['y']])
                        break
            center = [sum(x) / len(childpoints_list) for x in zip(*childpoints_list)]
            group_point = {}
            group_point['id'] = node['id']
            group_point['x'] = center[0]
            group_point['y'] = center[1]
            grouped_points.append(group_point)
    return grouped_points