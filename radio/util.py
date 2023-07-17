import os
import time

def extract_time(string: str):
  end = string.index('.txt')
  start = string.index('SAEXP_')
  return int(string[start+14:end])

def clear_dir(dir: str):
  t1 = time.time()
  for file in os.scandir(dir):
      os.remove(file.path)
  t2 = time.time()