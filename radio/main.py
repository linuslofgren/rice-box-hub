import redis
import glob
import csv
import time
import os
import json
import util

try:  
  client = redis.Redis(host='localhost', port=6378, decode_responses=True)
except:
  print('No redis connection')
  exit()

CSV_FREQUENCY = '2400000000'
data_dir = 'C:/Users/oskar/Documents/satsagen/Export'

def get_latest_data():
  list_of_files = glob.glob(data_dir+'/*.txt') # * means all if need specific format then *.csv
  if len(list_of_files) == 0:
    return None
  elif len(list_of_files) > 60:
    util.clear_dir(data_dir)
    return None

  latest_file = max(list_of_files, key=os.path.getctime)

  with open(latest_file) as csvfile:
    data = csv.reader(csvfile, delimiter=";")
    for line in data:
      if line[0] == CSV_FREQUENCY:
        return line[1], util.extract_time(latest_file)
    exit('Chosen frequency might be wrong')
        
print('Starting loop')
latest_mag, latest_time = 0, 0
while True:
  data = get_latest_data()
  if data == None:
    continue
  mag, timestamp = data
  if timestamp > latest_time:
    print(mag, timestamp)
    latest_mag = mag
    latest_time = timestamp

    json_data = json.dumps({
      "magnitude_dB": float(mag.replace(',', '.')),
      "timestamp": time.time()*1000
    })
    client.publish('RF_throughput', json_data)
  else:
    time.sleep(0.050)


