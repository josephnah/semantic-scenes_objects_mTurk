# created by joecool890
# Extracts SQL database into csv files
# Redundant, but allows access to data outside of GWU boundaries
# Version 0.1.0
# customized for semantic-scn-obj-mTurk
# http://blog.appliedinformaticsinc.com/how-to-parse-and-convert-json-to-csv-using-python/
from sqlalchemy import create_engine, MetaData, Table
import json, os, getpass
import pandas as pd
import openpyxl

# Data Thresholding
exp_name    = "scns_obs-mTurk"
RT_thres    = 1
exp_iter    = 1
scn_filter  = 0
acc_thresh  = 80


if  os.name == "nt":
    os.chdir("Insert directory here that fits your root folder. After you do this, ./ will work!")

# change directory based on computer
userName    = getpass.getuser()

# Specify location of data.
# Data are stored as string in "data_column_name" in table, "table_name", in SQL located in "db_url"
db_url = "mysql+pymysql://cnah:baejarin$1216neMoagung@localhost:33306/acl_semantics_scns_objs_mTurk"
# db_url              = "sqlite:///participants.db"
table_name          = "exp_data"
data_column_name    = "datastring"

# Not sure if these are needed.
hit_ID_name         = "hitid"
worker_ID_name      = "workerid"
assignment_ID_name  = "assignmentid"
unique_ID_name      = "uniqueid"

# boilerplace sqlalchemy setup
engine          = create_engine(db_url)
metadata        = MetaData()
metadata.bind   = engine
table           = Table(table_name, metadata, autoload=True)

# make a query and loop through
s       = table.select()
rows    = s.execute()

#status codes of subjects who completed experiment
statuses = [4,5];

# if you have workers you wish to exclude, add them here
exclude     = ["A1V2H0UF94ATWY:36H9ULYP63SVHLP2L4S07K361DJFJV",  # Accuracy less than 50
               "APY5858P6BTDY:3H8DHMCCWA9TULHOCJXMKZ0Y4P6DKK",   # RTs greater than 2000
               "A320QA9HJFUOZO:3FDJT1UU756YQ82VXDF3MNC6W4ZK57"]; # error in data

# Last trial didn't save + trial matrix got pushed forward a trial. Whatever is in folder has been fixed
# all are master workers as well
problem     = ["A27SMEOPKV84VI:3JMSRU9HQJSC22P07IMDSQT0KZAVED",
               "A2ZNOMZ35LKY8Q:336KAV9KYRQ1BG8PJ9EWXOO55DPY2Q",
               "A30RAYNDOWQ61S:32XVDSJFP0V1HZJB06QL3T1Y1X42MQ",
               "A18G2CLYSTENK:3TVRFO09GLDICX4NOJAZT6G5E2ULXZ",
               "A1JV64BL3WCK0G:32XVDSJFP0V1HZJB06QL3T1Y1X42MQ",
               "A3QC57KUVJP5EW:3GGAI1SQEWWEFHBDXZFRF6AKDQXCMT"];

uniqueid    = [];

for row in rows:
    data = []
    # only use subjects who completed experiment and aren't excluded
    if row['status'] in statuses and row['uniqueid'] not in exclude and row['uniqueid'] not in problem:
        data.append(row[data_column_name]);
        uniqueid.append(row["uniqueid"]);

        # Define directories
        data_dir    =  "/Users/" + userName + "/Dropbox/GWU/01_Research/08_semanticScenes/mTurk/data/"  + exp_name + "_" + row["endhit"].strftime('%Y-%m-%d_%H-%M-%S') + "_" +row["workerid"] +"-" + row["assignmentid"] + "_data" + ".csv"
        survey_dir  =  "/Users/" + userName + "/Dropbox/GWU/01_Research/08_semanticScenes/mTurk/survey/"  + exp_name + "_" + row["endhit"].strftime('%Y-%m-%d_%H-%M-%S') + "_" +row["workerid"] + "-" + row["assignmentid"] + "_survey" + ".csv"
        event_dir   =  "/Users/" + userName + "/Dropbox/GWU/01_Research/08_semanticScenes/mTurk/event/"  + exp_name + "_" + row["endhit"].strftime('%Y-%m-%d_%H-%M-%S') + "_" +row["workerid"] + "-" + row["assignmentid"] + "_event" + ".csv"

        # parse each participant's datastring as json object
        # and take the 'data' sub-object
        exp_data        = [json.loads(part)['data'] for part in data]
        eventdata       = [json.loads(part)['eventdata'] for part in data];
        questiondata    = [json.loads(part)['questiondata'] for part in data];

        ## Now insert uniqueid field into exp_data
        for part in exp_data:
            for record in part:
                record['trialdata']['uniqueid'] = record['uniqueid']
                record['trialdata']['dateTime'] = record['dateTime']

        # eventdata
        for part in eventdata:
            for record in part:
                record["uniqueid"] = row["uniqueid"]

        # questiondata
        for part in questiondata:
            part["uniqueid"] = row["uniqueid"]
        # print(exp_data);

        # flatten nested list so we just have a list of the trialdata recorded
        trial_data = [record['trialdata'] for part in exp_data for record in part]
        event_data = [record for part in eventdata for record in part]
        quest_data = [record for part in questiondata for record in part]
        RAWDATA = [];
        for part in range(len(trial_data)):
            if trial_data[part]["phase"] == "EXPERIMENT":
                RAWDATA.append(trial_data[part])

        exp_dataframe   = pd.DataFrame(RAWDATA)
        event_dataframe = pd.DataFrame(event_data)
        quest_dataframe = pd.DataFrame(questiondata)

        # save to data folder
        exp_dataframe.to_csv(data_dir)
        quest_dataframe.to_csv(survey_dir)
        event_dataframe.to_csv(event_dir)

        # quest_dataframe.to_clipboard(excel=True, sep='\t')

# # flatten nested list so we just have a list of the trialdata recorded
# # each time psiturk.recordTrialData(trialdata) was called.
# trial_data = [record['trialdata'] for part in exp_data for record in part]
# event_data = [record for part in eventdata for record in part]
# # print(trial_data)
# ## Extracts flattened nested list into pandas dataframe
# RAWDATA = [];
# SURVEY  = [];
# questionnaire = [];
#
# for part in range(len(trial_data)):
#     # print(trial_data[part]["phase"])
#     if trial_data[part]["phase"] == "EXPERIMENT":
#         RAWDATA.append(trial_data[part])
#         # print(trial_data[part]["trial"])
#
# # Put all subjects' trial data into pandas dataframe
# # 320 trials per participant
# # 160 for full CB
# # 16 semRel trials per scene
# exp_dataframe   = pd.DataFrame(RAWDATA)
# event_dataframe = pd.DataFrame(event_data)
#
#             #"exp_mode": 1,
#             #"block": block,
#             #"trial": trial_count,
#             #"match": match,
#             #"target_ori": target_ori,
#             #"condition": parseFloat([exp_trials[trial_count][index_condition]]),
#             #"main_obj": parseFloat([exp_trials[trial_count][index_main_object]]),
#             #"other_obj": parseFloat([exp_trials[trial_count][index_other_object]]),
#             #"main_obj_loc": main_object_loc,
#             #"scene_type": parseFloat([exp_trials[trial_count][index_scene_category]]),
#             #"scene_exemplar": parseFloat([exp_trials[trial_count][index_scene_exemplar]]),
#             #"accuracy": acc,
#             #"RT": RT,
#             #"pressedKey": keyPressed,
#             #"resp": resp
#
# # Sanity Checks
# avg_match           = exp_dataframe.groupby(["uniqueid"])["match"].mean()
# avg_target_ori      = exp_dataframe.groupby(["uniqueid"])["target_ori"].mean()
# avg_main_obj_loc    = exp_dataframe.groupby(["uniqueid"])["main_obj_loc"].mean()
#
# sanity_checks = pd.concat([avg_match,avg_target_ori,avg_main_obj_loc], axis = 1)
#
# # count trials
# count_semRel_scenes_exemplar = exp_dataframe.groupby(["uniqueid","condition","scene_type","main_obj"])["accuracy"].count().unstack(["condition","scene_type","main_obj"])
#
# if RT_thres == 1:
#     RT_min          = 200
#     RT_max          = 1500
#     all_data_count  = 320
#
#     # exclude data less than RT_min and greater than RT_max
#     exp_dataframe       = exp_dataframe[(exp_dataframe["RT"] > RT_min) & (exp_dataframe["RT"] < RT_max)]
#
#     excluded_data_count = [all_data_count - exp_dataframe.groupby(["uniqueid"])["RT"].count(),
#                            (all_data_count - exp_dataframe.groupby(["uniqueid"])["RT"].count()) / all_data_count * 100]
#
#     # concat trial count + % into one
#     excluded_data_count = pd.concat(excluded_data_count, axis=1)
#     excluded_data_count.columns = ["dropped_Trials", "drop_Rate"]
#
# # ACCURACY
# acc_overall                 = exp_dataframe.groupby(["uniqueid"])["accuracy"].mean()
# acc_semRel                  = exp_dataframe.groupby(["uniqueid","condition"])["accuracy"].mean().unstack(["condition"])
# acc_semRel_scenes           = exp_dataframe.groupby(["uniqueid","condition","scene_type"])["accuracy"].mean().unstack(["condition","scene_type"])
# acc_semRel_scenes_mainObj   = exp_dataframe.groupby(["uniqueid","condition","scene_type","main_obj"])["accuracy"].mean().unstack(["condition","scene_type","main_obj"])
#
# # RT
# corr_exp_dataframe          = exp_dataframe[(exp_dataframe["accuracy"] == 1)]
#
# RT_overall                  = corr_exp_dataframe.groupby(["uniqueid"])["RT"].mean()
# RT_semRel                   = corr_exp_dataframe.groupby(["uniqueid","condition"])["RT"].mean().unstack(["condition"])
# RT_semRel_scenes            = corr_exp_dataframe.groupby(["uniqueid","condition","scene_type"])["RT"].mean().unstack(["condition","scene_type"])
# RT_semRel_scenes_exemplar   = corr_exp_dataframe.groupby(["uniqueid","condition","scene_type","scene_exemplar"])["RT"].mean().unstack(["condition","scene_type","scene_exemplar"])
# RT_semRel_scenes_mainObj    = corr_exp_dataframe.groupby(["uniqueid","condition","scene_type","main_obj"])["RT"].mean().unstack(["condition","scene_type","main_obj"])
#
# # print(RT_semRel_scenes_mainObj)
# acc_semRel_scenes.to_clipboard(excel=True, sep='\t')
#
# print(excluded_data_count)
# Write data to excel file
# writer = pd.ExcelWriter("semantic_scns-objs_mTurk.xlsx", engine="xlsxwriter")
# sanity_checks.to_excel(writer, sheet_name="Sheet1")
# RT_semRel_scenes_mainObj.to_excel(writer, sheet_name="Sheet2")
# acc_semRel_scenes_mainObj.to_excel(writer, sheet_name="Sheet3")
# writer.save()
