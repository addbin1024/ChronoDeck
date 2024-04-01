'''
@Description: 
@Author: 
@Date: 2024-03-14 21:15:55
@LastEditTime: 2024-03-16 17:17:21
@LastEditors: Nemo
'''
import numpy as np
from scipy.optimize import linear_sum_assignment

def get_pearson(TS1, TS2):
    Pearson = np.corrcoef(TS1, TS2)[0,1]
    return Pearson
    
def get_eucdis(TS1, TS2):
    Eucdis = np.linalg.norm(TS1 - TS2)
    return Eucdis

def get_cost_matrix(datalist1, datalist2, operation=get_eucdis):
    if len(datalist1) > len(datalist2):
        print("size error!")
        return
    cost_matrix = np.zeros((len(datalist1), len(datalist2)))
    for i in range(len(datalist1)):
        for j in range(len(datalist2)):
            cost_matrix[i,j] = operation(datalist1[i], datalist2[j])
    return cost_matrix

def get_bestmatch(cost_matrix, mode='similarity'):
    if mode == 'correlation':
        sign = -1
    elif mode == 'similarity':
        sign = 1
    else:
        print('mode error!')
        return
    cost_matrix = sign * cost_matrix
    row_ind, col_ind = linear_sum_assignment(cost_matrix)
    best_match = [(i, j) for i, j in zip(row_ind, col_ind)]
    total_score = sign * cost_matrix[row_ind, col_ind].sum()
    return best_match, total_score

def transfer_match(best_match, id_list):
    match_ids = []
    for pair in best_match:
        match_ids.append(id_list[pair[1]])
    return match_ids

def hungarian(datalist1, datalist2, idlilst2, mode='similarity'):
    cost_matrix = get_cost_matrix(datalist1, datalist2)
    best_match, total_score = get_bestmatch(cost_matrix, mode)
    best_idlist = transfer_match(best_match, idlilst2)
    return best_idlist, total_score