def getAverageSeriesData(seriesData_list):
    # Dictionary to hold the sum of values for each date and count of occurrences
    aggregated_data = {}
    
    # Iterate through each series in the list
    for series in seriesData_list:
        # Iterate through each data point in the series
        for data_point in series:
            time = data_point['Time']
            value = data_point['value']
            # If the time is already in the dictionary, update the sum and count
            if time in aggregated_data:
                aggregated_data[time]['sum'] += value
                aggregated_data[time]['count'] += 1
            # If the time is not in the dictionary, add it
            else:
                aggregated_data[time] = {'sum': value, 'count': 1}
    
    # List to hold the average data
    average_data = []
    
    # Calculate the average for each time and create the new data points
    for time, values in aggregated_data.items():
        average_value = values['sum'] / values['count']
        average_data.append({"Time": time, "value": average_value})
    
    # Return the list sorted by time, assuming time is in YYYY-MM-DD format
    return sorted(average_data, key=lambda x: x['Time'])

    
