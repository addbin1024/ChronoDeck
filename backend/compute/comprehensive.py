'''
@Description: 
@Author: 
@Date: 2024-03-13 19:51:25
@LastEditTime: 2024-03-14 21:04:19
@LastEditors: Nemo
'''
from compute.TSfuncCal import GetMax, GetMin
from compute.filter import getTSdata
from compute.jsonTransfer import TSjson_exp
import numpy as np

def getBoundary(pv_tree_data, folder_path, timeRange=[]):
    level_max=[]
    level_min=[]
    for node in pv_tree_data:
        node_TS_data = {'data':getTSdata(node['node_name'], folder_path, timeRange)}
        node_max = GetMax(node_TS_data)
        node_min = GetMin(node_TS_data)
        if node['level'] > len(level_max):
            level_max.append(node_max)
            level_min.append(node_min)
        else:
            if node_max > level_max[node['level']-1]:
                level_max[node['level']-1] = node_max
            if node_min < level_min[node['level']-1]:
                level_min[node['level']-1] = node_min
    # print(level_max)
    # print(level_min)
    result = []
    for i in range(len(level_max)):
        tmp_dict = {'level':i+1, 'max':level_max[i], 'min':level_min[i]}
        result.append(tmp_dict)
    return {'result':result}

def getSDALL(pv_tree_data, folder_path, max_level=3):
    data01 = getTSdata(pv_tree_data[0]['node_name'], folder_path)
    _, TS_datalist = TSjson_exp({'data':data01})
    Time_stamps = TS_datalist[:, 0]
    result = []
    for i in range(1, max_level):
        level_data = []
        for j in range(len(Time_stamps)):
            level_data.append([])
        for node in pv_tree_data:
            if node['level'] == i+1:
                _, node_TS_values = TSjson_exp({'data':getTSdata(node['node_name'], folder_path)})
                node_TS_values = node_TS_values[:, 1]
                for k in range(len(node_TS_values)):
                    level_data[k].append(node_TS_values[k])
        level_SD = [np.std(data) for data in level_data]
        level_dict = {"level":i+1, "SD":[]}
        for j in range(len(Time_stamps)):
            time_value = {"Time": Time_stamps[j], "Value": level_SD[j]}
            level_dict['SD'].append(time_value)
        result.append(level_dict)
    return result
