'''
@Description: 
@Author: 
@Date: 2024-02-27 16:06:23
@LastEditTime: 2024-03-16 17:15:41
@LastEditors: Nemo
'''
import os
import json
from datetime import datetime, timedelta
from compute.TSfuncCal import Normalization,Standardize


def filterDataByTimeRange(data, timeRange=[]):
    # default timeRange return original data
    if not timeRange:
        return data
    # Parse the start and end times from the timeRange list and adjust them
    # Replace "Z" with "+00:00" to properly handle the timezone

    start_time_original = datetime.fromisoformat(timeRange[0].replace("Z", "+00:00"))
    end_time_original = datetime.fromisoformat(timeRange[1].replace("Z", "+00:00"))
    
    # Adjust the start time to the day after the original start time
    start_time_adjusted = start_time_original + timedelta(days=1)
    # The end time is set to the exact date of the end time specified in timeRange
    end_time_adjusted = end_time_original

    # Convert both adjusted times to "YYYY-MM-DD" format for comparison
    start_date_str = start_time_adjusted.strftime("%Y-%m-%d")
    end_date_str = end_time_adjusted.strftime("%Y-%m-%d")

    # Filter the data to include only the entries within the adjusted time range
    filtered_data = [
        entry for entry in data
        if start_date_str <= entry["Time"] <= end_date_str
    ]

    return filtered_data

def getTSdata(nodeName, folder_path, timeRange=[]):
    if '-' not in nodeName:
        data_file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)),folder_path, nodeName+'.json')
        with open(data_file_path, 'r') as file:
            data_file = filterDataByTimeRange(Standardize(json.load(file)['data']), timeRange)
    else:
        data_folder_path = list(nodeName.split("-"))[-2]
        data_file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)),folder_path, data_folder_path, nodeName+'.json')
        with open(data_file_path, 'r') as file:
            data_file = filterDataByTimeRange(Standardize(json.load(file)['data']), timeRange)
    return data_file

def getNormalListData(pv_tree_data, folder_path, boundarys, nodelist, timeRange=[]):
    normalized_children_data = []
    for child_id in nodelist:
        child_node = pv_tree_data[child_id-1]
        child_data = {'data':getTSdata(child_node['node_name'], folder_path, timeRange)}
        normalized_child_data = Normalization(child_data, boundarys[child_node['level']-1]['max'], boundarys[child_node['level']-1]['min'])
        normalized_children_data.append(normalized_child_data)
    return normalized_children_data