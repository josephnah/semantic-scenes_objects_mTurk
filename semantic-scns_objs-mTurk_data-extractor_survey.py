# created by joecool890
# Extracts qualtrics survey into pandas
# Version 0.1.0
# customized for semantic-scn-obj-mTurk

import numpy as np
import glob, os, time, getpass
import pandas as pd

# if you have workers you wish to exclude, add them here
exclude     = ["A1V2H0UF94ATWY:36H9ULYP63SVHLP2L4S07K361DJFJV",
               "APY5858P6BTDY:3H8DHMCCWA9TULHOCJXMKZ0Y4P6DKK"];

# If on windows, change directory
if  os.name == "nt":
    os.chdir("Insert directory here that fits your root folder. After you do this, ./ will work!")

# change directory based on computer
userName    = getpass.getuser()
data_dir    = "/Users/" + userName + "/Dropbox/GWU/01_Research/08_semanticScenes/mTurk/*.csv"

# Extract all data files into single np array
data_files      = glob.glob(data_dir)
raw_data = [];
data = pd.read_csv(data_files[0], index_col="uniqueId", header=0)



raw_data.append(data)
dataframe_raw = pd.concat(raw_data)

# Select only uniqueID + survey data
dataframe_raw = dataframe_raw.iloc[:,17:-1]
dataframe_raw = dataframe_raw.iloc[2:]

# remap string values into numbers for survey
remapping = {"Extremely unlikely": 1, "Moderately unlikely": 2, "Slightly unlikely": 3, "Slightly likely": 4, "Moderately likely": 5, "Extremely likely": 6}
dataframe = dataframe_raw.replace(remapping)

data = dataframe.groupby(["uniqueId"]).mean()
print(data)


dataframe.to_clipboard(excel=True, sep='\t')