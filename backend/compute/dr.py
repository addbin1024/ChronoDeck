import numpy as np
from sklearn.manifold import MDS, TSNE
from compute.jsonTransfer import TSjson_exp

def mds_to2d(json_data, mode='similarity'):
    '''
    @description: sclaing the data to 2d with mds method.
    @Author: Nemo
    @Date: 2024-02-16 19:21:43
    @return {*} return list as [{id: key ,x: , y: }, ... ]
    @param {*} json_data: data input.
    @param {*} mode: to scaling by 'similarity' or 'correlation'.
    '''
    keys, datas = TSjson_exp(json_data)
    tmpData = datas[:, 1:].T.astype('float')

    if mode == 'correlation':
        min_vals = tmpData.min(axis=1, keepdims=True)
        max_vals = tmpData.max(axis=1, keepdims=True)
        tmpData = (tmpData - min_vals) / (max_vals - min_vals)
    elif mode != 'similarity':
        print("Mode Error!")
        return
    
    if tmpData.shape[0] == 1:
        return [{'id':keys[1], 'x': 0.0, 'y': 0.0}]

    distance_matrix = np.linalg.norm(tmpData[:, np.newaxis] - tmpData, axis=-1)

    # 使用MDS进行降维
    mds = MDS(n_components=2, dissimilarity='precomputed', random_state=666)
    data_to2d = mds.fit_transform(distance_matrix)

    result_list = []
    # print(len(data_to2d))
    for i in range(len(data_to2d)):
        result_list.append({'id':keys[i+1], 'x':data_to2d[i][0], 'y':data_to2d[i][1]})

    return result_list

def t_sne_to2d(json_data, perp=5, ee=12):
    '''
    @description: sclaing the data to 2d with t-sne method.
    @Author: Nemo
    @Date: 2024-03-05 15:41:14
    @return {*} return list as [{id: key ,x: , y: }, ... ]
    @param {*} json_data: data input.
    '''
    keys, datas = TSjson_exp(json_data)
    tmpData = datas[:, 1:].T.astype('float')

    if tmpData.shape[0] == 1:
        return [{'id':keys[1], 'x': 0.0, 'y': 0.0}]

    # 构建t-SNE模型并应用于数据
    tsne = TSNE(n_components=2, perplexity=perp, early_exaggeration=ee, random_state=666)
    data_to2d = tsne.fit_transform(tmpData).astype('float')

    result_list = []
    for i in range(len(data_to2d)):
        result_list.append({'id':keys[i+1], 'x':data_to2d[i][0], 'y':data_to2d[i][1]})

    return result_list