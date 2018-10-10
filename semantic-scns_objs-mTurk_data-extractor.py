# created by joecool890
# Extracts SQL database into pandas
# Version 0.1.0
# customized for semantic-scn-obj-mTurk
# http://blog.appliedinformaticsinc.com/how-to-parse-and-convert-json-to-csv-using-python/
from sqlalchemy import create_engine, MetaData, Table
import json
import pandas as pd
import openpyxl

# Data Thresholding
RT_thres    = 1
exp_iter    = 1
scn_filter  = 0
acc_thresh  = 80

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

data = []
#status codes of subjects who completed experiment
statuses = [5];
# if you have workers you wish to exclude, add them here
exclude     = ["A1V2H0UF94ATWY:36H9ULYP63SVHLP2L4S07K361DJFJV",
               "APY5858P6BTDY:3H8DHMCCWA9TULHOCJXMKZ0Y4P6DKK"];
uniqueid    = [];

for row in rows:
    # only use subjects who completed experiment and aren't excluded
    if row['status'] in statuses and row['uniqueid'] not in exclude:
        data.append(row[data_column_name]);
        uniqueid.append(row["uniqueid"]);

# Now we have all participant datastrings in a list.
# Let's make it a bit easier to work with:

# parse each participant's datastring as json object
# and take the 'data' sub-object
exp_data        = [json.loads(part)['data'] for part in data]
eventdata       = [json.loads(part)['eventdata'] for part in data];
questiondata    = [json.loads(part)['questiondata'] for part in data];

## Now insert uniqueid field into exp_data, eventdata, questiondata

for part in exp_data:
    for record in part:
        record['trialdata']['uniqueid'] = record['uniqueid']
        record['trialdata']['dateTime'] = record['dateTime']

for part in eventdata:
    count = 0
    for record in part:
        record["uniqueid"] = uniqueid[count]
    count +=1

count = 0
for part in questiondata:
    part["uniqueid"] = uniqueid[count]
    count +=1

# flatten nested list so we just have a list of the trialdata recorded
# each time psiturk.recordTrialData(trialdata) was called.
trial_data = [record['trialdata'] for part in exp_data for record in part]
event_data = [record for part in eventdata for record in part]
# print(trial_data)
## Extracts flattened nested list into pandas dataframe
RAWDATA = [];
SURVEY  = [];
questionnaire = [];

for part in range(len(trial_data)):
    # print(trial_data[part]["phase"])
    if trial_data[part]["phase"] == "EXPERIMENT":
        RAWDATA.append(trial_data[part])
        # print(trial_data[part]["trial"])

# Put all subjects' trial data into pandas dataframe
# 320 trials per participant
# 160 for full CB
# 16 semRel trials per scene
exp_dataframe   = pd.DataFrame(RAWDATA)
event_dataframe = pd.DataFrame(event_data)

            #"exp_mode": 1,
            #"block": block,
            #"trial": trial_count,
            #"match": match,
            #"target_ori": target_ori,
            #"condition": parseFloat([exp_trials[trial_count][index_condition]]),
            #"main_obj": parseFloat([exp_trials[trial_count][index_main_object]]),
            #"other_obj": parseFloat([exp_trials[trial_count][index_other_object]]),
            #"main_obj_loc": main_object_loc,
            #"scene_type": parseFloat([exp_trials[trial_count][index_scene_category]]),
            #"scene_exemplar": parseFloat([exp_trials[trial_count][index_scene_exemplar]]),
            #"accuracy": acc,
            #"RT": RT,
            #"pressedKey": keyPressed,
            #"resp": resp

# Sanity Checks
avg_match           = exp_dataframe.groupby(["uniqueid"])["match"].mean()
avg_target_ori      = exp_dataframe.groupby(["uniqueid"])["target_ori"].mean()
avg_main_obj_loc    = exp_dataframe.groupby(["uniqueid"])["main_obj_loc"].mean()

sanity_checks = pd.concat([avg_match,avg_target_ori,avg_main_obj_loc], axis = 1)

# count trials
count_semRel_scenes_exemplar = exp_dataframe.groupby(["uniqueid","condition","scene_type","main_obj"])["accuracy"].count().unstack(["condition","scene_type","main_obj"])

if RT_thres == 1:
    RT_min          = 200
    RT_max          = 1500
    all_data_count  = 320

    # exclude data less than RT_min and greater than RT_max
    exp_dataframe       = exp_dataframe[(exp_dataframe["RT"] > RT_min) & (exp_dataframe["RT"] < RT_max)]

    excluded_data_count = [all_data_count - exp_dataframe.groupby(["uniqueid"])["RT"].count(),
                           (all_data_count - exp_dataframe.groupby(["uniqueid"])["RT"].count()) / all_data_count * 100]

    # concat trial count + % into one
    excluded_data_count = pd.concat(excluded_data_count, axis=1)
    excluded_data_count.columns = ["dropped_Trials", "drop_Rate"]

# ACCURACY
acc_overall                 = exp_dataframe.groupby(["uniqueid"])["accuracy"].mean()
acc_semRel                  = exp_dataframe.groupby(["uniqueid","condition"])["accuracy"].mean().unstack(["condition"])
acc_semRel_scenes           = exp_dataframe.groupby(["uniqueid","condition","scene_type"])["accuracy"].mean().unstack(["condition","scene_type"])
acc_semRel_scenes_mainObj   = exp_dataframe.groupby(["uniqueid","condition","scene_type","main_obj"])["accuracy"].mean().unstack(["condition","scene_type","main_obj"])

# RT
corr_exp_dataframe          = exp_dataframe[(exp_dataframe["accuracy"] == 1)]

RT_overall                  = corr_exp_dataframe.groupby(["uniqueid"])["RT"].mean()
RT_semRel                   = corr_exp_dataframe.groupby(["uniqueid","condition"])["RT"].mean().unstack(["condition"])
RT_semRel_scenes            = corr_exp_dataframe.groupby(["uniqueid","condition","scene_type"])["RT"].mean().unstack(["condition","scene_type"])
RT_semRel_scenes_exemplar   = corr_exp_dataframe.groupby(["uniqueid","condition","scene_type","scene_exemplar"])["RT"].mean().unstack(["condition","scene_type","scene_exemplar"])
RT_semRel_scenes_mainObj    = corr_exp_dataframe.groupby(["uniqueid","condition","scene_type","main_obj"])["RT"].mean().unstack(["condition","scene_type","main_obj"])

# print(RT_semRel_scenes_mainObj)
RT_semRel_scenes_mainObj.to_clipboard(excel=True, sep='\t')


# Write data to excel file
writer = pd.ExcelWriter("semantic_scns-objs_mTurk.xlsx", engine="xlsxwriter")
sanity_checks.to_excel(writer, sheet_name="Sheet1")
RT_semRel_scenes_mainObj.to_excel(writer, sheet_name="Sheet2")
acc_semRel_scenes_mainObj.to_excel(writer, sheet_name="Sheet3")
writer.save()
