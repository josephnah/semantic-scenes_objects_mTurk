# created by joecool890
# Extracts qualtrics survey into pandas
# Version 0.1.0
# customized for semantic-scn-obj-mTurk

import numpy as np
import glob, os, time, getpass
import pandas as pd

# if you have workers you wish to exclude, add them here
exclude     = ["A1V2H0UF94ATWY:36H9ULYP63SVHLP2L4S07K361DJFJV",
               "APY5858P6BTDY:3H8DHMCCWA9TULHOCJXMKZ0Y4P6DKK"]

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
df_raw = pd.concat(raw_data)

# Select only uniqueID + survey data
# as well as other cleaning methods
df_raw = df_raw.iloc[:,17:-1]
df_raw = df_raw.iloc[2:]
df_raw = df_raw.drop(exclude)
df_raw = df_raw.dropna()

# remap string values into numbers for survey
remapping = {"Extremely unlikely": 1, "Moderately unlikely": 2, "Slightly unlikely": 3, "Slightly likely": 4, "Moderately likely": 5, "Extremely likely": 6}
df = df_raw.replace(remapping)

df["scene1"] = (df["Q1-10"] + df["Q1-11"])/2 - (df["Q1-20"] + df["Q1-21"] + df["Q1-30"] + df["Q1-31"] + df["Q1-40"] + df["Q1-41"] + df["Q1-50"] + df["Q1-51"])/8
df["scene2"] = (df["Q2-20"] + df["Q2-21"])/2 - (df["Q2-10"] + df["Q2-11"] + df["Q2-30"] + df["Q2-31"] + df["Q2-40"] + df["Q2-41"] + df["Q2-50"] + df["Q2-51"])/8

data = df.groupby(["uniqueId"]).mean()
print(df)
