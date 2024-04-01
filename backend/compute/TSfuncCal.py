'''
@Description: a file define the pearson correlation coefficient function.
@Author: Nemo
@Date: 2024-01-31 15:19:43
@LastEditTime: 2024-03-16 17:16:25
@LastEditors: Nemo
'''
import pandas as pd
import numpy as np
import json
from compute.jsonTransfer import TSjson_exp
from sklearn.preprocessing import StandardScaler
from io import StringIO
import csv

def Pearson_cal(TS1, TS2):
    _, TS1_datalist = TSjson_exp(TS1)
    TS1_datalist = TS1_datalist[:, 1].astype(float)
    _, TS2_datalist = TSjson_exp(TS2)
    TS2_datalist = TS2_datalist[:, 1].astype(float)
    Pearson = np.corrcoef(TS1_datalist, TS2_datalist)[0,1]
    return Pearson
    
def Eucdis_cal(TS1, TS2):
    _, TS1_datalist = TSjson_exp(TS1)
    TS1_datalist = TS1_datalist[:, 1]
    _, TS2_datalist = TSjson_exp(TS2)
    TS2_datalist = TS2_datalist[:, 1]
    Eucdis = np.linalg.norm(TS1_datalist - TS2_datalist)
    return Eucdis

def BestMatchedLayer_cal(target_children_node_data, target_children_node_w_o, other_children_node_data, mode = 'similarity'):
    # final_score = Eucdis_cal(target_father_node_data, other_father_node_data)
    final_score = 0
    best_matched_layer = {}
    if mode == 'similarity':
        for target_index in target_children_node_w_o:
            target_child_node_f = target_children_node_data[target_index]
            tmp_score = float('inf')
            tmp_index = 0
            for other_index in range(len(other_children_node_data)):
                other_child_node_f = other_children_node_data[other_index]
                if other_child_node_f != 0 and Eucdis_cal(target_child_node_f, other_child_node_f) < tmp_score:
                    tmp_score = Eucdis_cal(target_child_node_f, other_child_node_f)
                    tmp_index = other_index
            final_score += tmp_score
            other_children_node_data[tmp_index] = 0
            best_matched_layer[target_index] = (tmp_index)
        return final_score, best_matched_layer
    elif mode == 'correlation':
        for target_index in target_children_node_w_o:
            target_child_node_f = target_children_node_data[target_index]
            tmp_score = float('-inf')
            tmp_index = 0
            for other_index in range(len(other_children_node_data)):
                other_child_node_f = other_children_node_data[other_index]
                if other_child_node_f != 0 and Eucdis_cal(target_child_node_f, other_child_node_f) > tmp_score:
                    tmp_score = Pearson_cal(target_child_node_f, other_child_node_f)
                    tmp_index = other_index
            final_score += tmp_score
            other_children_node_data[tmp_index] = 0
            best_matched_layer[target_index] = (tmp_index)
        return final_score, best_matched_layer
    else:
        print("mode Error!")
        return

def Mean_w(TS):
    _, TS_datalist = TSjson_exp(TS)
    TS_datalist = TS_datalist[:, 1].astype(float)
    Mean = np.mean(TS_datalist)
    return Mean

def GetMax(TS):
    _, TS_datalist = TSjson_exp(TS)
    TS_datalist = TS_datalist[:, 1]
    return TS_datalist.max()

def GetMin(TS):
    _, TS_datalist = TSjson_exp(TS)
    TS_datalist = TS_datalist[:, 1]
    return TS_datalist.min()

def Normalization(TS, level_max, level_min):
    _, TS_datalist = TSjson_exp(TS)
    TS_datalist = TS_datalist[:, 1]
    TS_datalist = (TS_datalist-level_min)/(level_max-level_min)
    return TS_datalist

def Standardize(TS):
    # Convert JSON to DataFrame for easier manipulation
    json_str = json.dumps(TS)
    df = pd.read_json(StringIO(json_str))

    # Perform standardization
    # (subtract the mean and divide by the standard deviation)
    df['value'] = (df['value'] - df['value'].mean()) / df['value'].std()

    # Convert DataFrame back to JSON
    result = df.to_json(orient='records', date_format='iso')
    
    # Convert the JSON string back to a list of dictionaries
    standardized_TS = json.loads(result)
    
    return standardized_TS

def ChangePercentage(TS):
    # 输入和输出都是JSON格式的列表
    result = []  # 用于存放计算结果的列表
    # 第一个时间点的涨跌幅设为0
    if TS:
        result.append({"Time": TS[0]['Time'], "value": 0})
    # 遍历所有时间点，除了第一个
    for i in range(1, len(TS)):
        # 计算涨跌幅度
        previous_value = TS[i - 1]['value']
        current_value = TS[i]['value']
        # 避免除以零
        if previous_value != 0:
            change_percentage = (current_value - previous_value) / previous_value * 100
        else:
            change_percentage = 0  # 如果前一个值是0，则定义涨跌幅为0
        # 添加到结果列表
        result.append({"Time": TS[i]['Time'], "value": change_percentage})
    return result

