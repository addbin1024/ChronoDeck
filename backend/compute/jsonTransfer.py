'''
@Description: a file of json data transfer
@Author: Nemo
@Date: 2024-01-31 15:38:23
@LastEditTime: 2024-01-31 18:34:26
@LastEditors: Nemo
'''
import pandas as pd
import numpy as np

def TSjson_exp(json_data):
    '''
    @description: 
    @Author: Nemo
    @Date: 2024-01-31 17:06:11
    @return {*} if json_data wrong : return none;
    else : return the keys list and the json data table array
    @param {*} json_data : the TS json data(from request)
    '''
    df = pd.DataFrame(json_data)
    keys = list(json_data.keys())   # return
    df_tmp = pd.json_normalize(df[keys[0]])
    Time_df = df_tmp['Time']
    array = df_tmp['Time'].to_numpy()

    for i in range(len(keys)):
        df_tmp = pd.json_normalize(df[keys[i]])
        if Time_df.equals(df_tmp['Time']):
            array = np.c_[array, df_tmp.to_numpy()[:,1]]
        else:
            print(i)
            print("Data Error!")
            return
    
    keys = ['Time'] + keys
    
    return keys, array