'''
@Description: 
@Author: 
@Date: 2024-03-16 17:17:45
@LastEditTime: 2024-03-16 19:26:58
@LastEditors: Nemo
'''
from compute.TSfuncCal import Normalization
from compute.filter import getTSdata, getNormalListData
from compute.comprehensive import getBoundary
from compute.hungarianMatch import get_eucdis, hungarian

def getBestNode(pv_tree_data, folder_path, target_node_ids, timeRange=[], mode='similarity'):
    # to be implemented
    return

def getBestLayer(pv_tree_data, folder_path, target_layer_ids, timeRange=[], mode='similarity'):
    # to be implemented
    return

def getBestPath(pv_tree_data, folder_path, target_path_ids, timeRange=[], mode='similarity'):
    boundarys = getBoundary(pv_tree_data, folder_path, timeRange)['result']

    target_path_nodes = [pv_tree_data[id-1] for id in target_path_ids]
    target_start_level = target_path_nodes[0]['level']

    normal_target_path_datas = [Normalization({'data':getTSdata(pv_tree_data[id-1]['node_name'], folder_path, timeRange)}, \
                                            boundarys[pv_tree_data[id-1]['level']-1]['max'], boundarys[pv_tree_data[id-1]['level']-1]['min']) \
                                for id in target_path_ids]

    candidate_results = []
    for node in pv_tree_data:
        if node['level'] == target_start_level:
            candidate_father_data = {'data':getTSdata(node['node_name'], folder_path, timeRange)}
            normalized_candidate_father_data = Normalization(candidate_father_data, boundarys[node['level']-1]['max'], boundarys[node['level']-1]['min'])
            normalized_candidate_children_data = \
                getNormalListData(pv_tree_data, folder_path, boundarys, node['children_id'], timeRange)
            for i in range(len(node['children_id'])):
                normalized_candidate_child_data = normalized_candidate_children_data[i]
                score = get_eucdis(normal_target_path_datas[0], normalized_candidate_father_data)
                score += get_eucdis(normal_target_path_datas[1], normalized_candidate_child_data)
                candidate_path_ids = [node['id'], node['children_id'][i]]
                candidate_data = [getTSdata(pv_tree_data[id-1]['node_name'], folder_path, timeRange) for id in candidate_path_ids]
                
                result={}
                result['path_ids'] = candidate_path_ids
                result['score'] = score
                # test
                result['data'] = candidate_data
                candidate_results.append(result)
    
    if mode == 'similarity':
        sorted_result = sorted(candidate_results, key=lambda x: x['score'], reverse=False)
    elif mode == 'correlation':
        sorted_result = sorted(candidate_results, key=lambda x: x['score'], reverse=True)
    else:
        print('mode Error!')
        return

    return sorted_result[1:4]


def getBestTree(pv_tree_data, folder_path, target_id, timeRange=[], mode='similarity'):
    boundarys = getBoundary(pv_tree_data, folder_path, timeRange)['result']
    candidate_results = []
    for node in pv_tree_data:
        if node['id'] == target_id:
            target_level = node['level']
            target_father_data = {'data':getTSdata(node['node_name'], folder_path, timeRange)}
            normalized_target_father_data = Normalization(target_father_data, boundarys[node['level']-1]['max'], boundarys[node['level']-1]['min'])
            normalized_target_children_data = \
                getNormalListData(pv_tree_data, folder_path, boundarys, node['children_id'], timeRange)

    for node in pv_tree_data:
        if node['id'] != target_id and node['level'] == target_level:
            result = {}
            candidate_children_id = node['children_id']
            candidate_father_data = {'data':getTSdata(node['node_name'], folder_path, timeRange)}
            normalized_candidate_father_data = Normalization(candidate_father_data, boundarys[node['level']-1]['max'], boundarys[node['level']-1]['min'])
            normalized_candidate_children_data = \
                getNormalListData(pv_tree_data, folder_path, boundarys, node['children_id'], timeRange)
            
            # hungarian_match
            match_ids, total_score = hungarian(normalized_target_children_data, normalized_candidate_children_data, candidate_children_id, mode)

            match_ids=[node['id']]+match_ids
            total_score += get_eucdis(normalized_target_father_data, normalized_candidate_father_data)
            candidate_data = [getTSdata(pv_tree_data[id-1]['node_name'], folder_path, timeRange) for id in match_ids]
            
            result['tree_ids'] = match_ids
            result['score'] = total_score
            result['data'] = candidate_data

            candidate_results.append(result)

    # format process
    if mode == 'similarity':
        sorted_result = sorted(candidate_results, key=lambda x: x['score'], reverse=False)
    elif mode == 'correlation':
        sorted_result = sorted(candidate_results, key=lambda x: x['score'], reverse=True)
    else:
        print('mode Error!')
        return

    return sorted_result[:3]