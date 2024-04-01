'''
@Description: a file define the cluster function.
@Author: Nemo
@Date: 2024-01-31 15:19:43
@LastEditTime: 2024-02-28 16:44:11
@LastEditors: Nemo
'''
import json
import numpy as np
from compute.jsonTransfer import TSjson_exp
from sklearn.cluster import KMeans
from sklearn.cluster import DBSCAN

def cluster_kmeans(json_data, n):
    '''
    @description: the function deal with the multi-TS data and cluster them.
    @Author: Nemo
    @Date: 2024-01-31 18:12:34
    @return {*} if json_data wrong : return '' and print DataError type;
    else : return the cluster_labels in json format
    @param {*} json_data : the TS json data(from request)
    @param {*} n : the clusters' number
    '''
    try:
        keys, array = TSjson_exp(json_data)

        seed = np.random.randint(1000) 
        n_clusters = n
        kmeans = KMeans(n_clusters=n_clusters, random_state=seed)
        kmeans.fit(array[:, 1:].T)
        labels = kmeans.labels_
        # cluster_centers = kmeans.cluster_centers_
        # labels_counter = np.unique(labels, return_counts=True)

        result_dict = {}
        for i in range(n_clusters):
            result_dict.update({str(i+1):[]})
        for i in range(len(labels)):
            j = labels[i]
            result_dict[str(j+1)].append(keys[i+1])
        result_dict = {"result":result_dict}
        json_string = json.dumps(result_dict)

        return json_string

    except Exception as e:

        print("Data Error _01")
        return ''

def cluster_dbscan(data_list, eps=0.4, min_samples=2):
    '''
    @description: function of dbscan to 2d datas and return the labels in json.
    @Author: Nemo
    @Date: 2024-02-16 19:32:54
    @return {*} return json file as {cluster id: [node_id], ...}
    @param {*} data_list: the result_list of mds_to2d funtion.
    @param {*} eps: the radius of dbscan algorithm.
    @param {*} min_samples: the min number of samples in each cluster.
    '''
    keys = []
    data_2d = []
    for i in range(len(data_list)):
        keys.append(data_list[i]['id'])
        data_2d.append([data_list[i]['x'], data_list[i]['y']])
    data_2d = np.array(data_2d, dtype=np.float32)

    dbscan = DBSCAN(eps, min_samples)
    labels = dbscan.fit_predict(data_2d)

    result_dict = {}
    for i in range(len(data_2d)):
        j = labels[i]+1
        if str(j) in result_dict:
            result_dict[str(j)].append(keys[i])
        else:
            result_dict.update({str(j):[keys[i]]})
    # json_string = json.dumps(result_dict)
    
    return result_dict

def cluster_kmeans_2d(data_list, n):
    keys = []
    data_2d = []
    for i in range(len(data_list)):
        keys.append(data_list[i]['id'])
        data_2d.append([data_list[i]['x'], data_list[i]['y']])
    data_2d = np.array(data_2d, dtype=np.float32)
    # print(keys)
    # print(data_2d)
    seed = 666 
    n_clusters = n
    kmeans = KMeans(n_clusters=n_clusters, random_state=seed)

    kmeans.fit(data_2d)
    labels = kmeans.labels_
    # cluster_centers = kmeans.cluster_centers_
    # labels_counter = np.unique(labels, return_counts=True)

    result_dict = {}
    for i in range(len(data_2d)):
        j = labels[i]+1
        if str(j) in result_dict:
            result_dict[str(j)].append(keys[i])
        else:
            result_dict.update({str(j):[keys[i]]})
    return result_dict