import os
import shutil
import time

for filename in os.listdir("."):
	#Directories should not be copied, so they are skipped and
	#on macs, the '.DS_STORE' file is skipped 
	if filename[0] == '.' or os.path.isdir(filename):
		continue
		
	if "_white_" in filename:
		white = filename.find("_white_")
		before = filename[:white]
		after = filename[filename.rfind("."):]
		os.rename(filename, before + after)