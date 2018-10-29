# created by joecool890
# Takes CSV data files into a pandas dataframe to organize for data analysis
# Version 0.1.0
# customized for semantic-scn-obj-mTurk
import glob, os, time, getpass
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import datetime as dt

# Data Thresholding
exp_name    = "scns_obs-mTurk"
RT_thres    = 1
exp_iter    = 1
scn_filter  = 0
acc_thresh  = 80
date        = dt.datetime.now().strftime("%Y-%m-%d")  # get date as YMD_H_M_S

# function to determine confidence interval corrected for within-participants
def cm_standard_error(dataframe):
    # Get # of conditions (number of columns)
    num_conditions = dataframe.shape[1]

    # Morey portion of Cousineau-Morey method
    morey_correction = np.sqrt(float(num_conditions) / (num_conditions - 1))

    # Calculate mean of each participant and the grand mean
    parMean     = dataframe.mean(axis = 1)
    grandMean   = parMean.mean()

    # Get standard error & add to original dataframe (subtract parMean, add grandMean)
    normMean                        = dataframe.sub(parMean, axis=0) + grandMean
    dataframe.loc["mean"]           = normMean.mean()
    dataframe.loc["ste_c-m-corr"]   = normMean.std() / np.sqrt(len(dataframe) - 1) * morey_correction
    forexcel_dataframe              = pd.concat([dataframe.loc["mean"], dataframe.loc["ste_c-m-corr"]], axis=1).unstack()
    return(forexcel_dataframe)

# Control which analysis to run
data_analysis   = 1
survey_analysis = 1
data_write      = 0
plot_graphs     = 0

if data_analysis == 1:
    # If on windows, change directory
    if  os.name == "nt":
        os.chdir("Insert directory here that fits your root folder. After you do this, ./ will work!")

    # change directory based on computer
    userName    = getpass.getuser()
    data_dir    = "/Users/" + userName + "/Dropbox/GWU/01_Research/08_semanticScenes/data/exp04-mTurk/data" + "/*.csv"
    demogr_dir  = "/Users/" + userName + "/Dropbox/GWU/01_Research/08_semanticScenes/data/exp04-mTurk/demogr" + "/*.csv"
    survey_dir  = "/Users/" + userName + "/Dropbox/GWU/01_Research/08_semanticScenes/data/exp04-mTurk/survey" + "/*.csv"
    final_data  = "/Users/" + userName + "/Dropbox/GWU/01_Research/08_semanticScenes/data/exp04-mTurk/" + "semantic_scns-objs_mTurk_" + date + ".xlsx"

    # Extract all data files into single np array
    data_files      = glob.glob(data_dir)
    survey_files    = glob.glob(demogr_dir)
    participants    = len(data_files)

    # Load all data and survey files into single panda data frame
    raw_data    = []
    demogr_data = []
    x = time.time()
    for file in range(participants):
        data    = pd.read_csv(data_files[file], header = 0)
        survey  = pd.read_csv(survey_files[file], header = 0)
        raw_data.append(data)
        demogr_data.append(survey)

    exp_dataframe = pd.concat(raw_data)
    sur_dataframe = pd.concat(demogr_data)

    # Combine demographics and data from experiment
    exp_dataframe = pd.merge(exp_dataframe, sur_dataframe, on= "uniqueid")


    # Put all subjects' trial data into pandas dataframe
    # 320 trials per participant
    # 160 for full CB
    # 16 semRel trials per scene
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

    sanity_checks       = pd.concat([avg_match,avg_target_ori,avg_main_obj_loc], axis = 1)
    # print(sanity_checks)

    # count trials
    count_semRel_scenes_exemplar = exp_dataframe.groupby(["uniqueid","condition","scene_type","main_obj"])["accuracy"].count().unstack(["condition","scene_type","main_obj"])
    # print(count_semRel_scenes_exemplar)

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
        excluded_data_count.columns = ["dropped_trials", "drop_rate"]

    # Keep only the good participants
    acc_cut                     = exp_dataframe.groupby(["uniqueid"])["accuracy"].mean()*100
    good_participants           = acc_cut.loc[acc_cut >= acc_thresh].index.get_level_values(0).tolist()
    exp_dataframe               = exp_dataframe[exp_dataframe["uniqueid"].isin(good_participants)]
    dropped_trials              = excluded_data_count[excluded_data_count.index.isin(good_participants)]

    # Remap hand to numbers
    exp_dataframe["hand"]       = exp_dataframe["hand"].map({"Right": 1, "Left": 2})
    demogr_dataframe            = exp_dataframe.groupby(["uniqueid"])["age", "hand"].mean()

    # ACCURACY
    acc_overall                 = exp_dataframe.groupby(["uniqueid"])["accuracy"].mean() * 100
    acc_semRel                  = exp_dataframe.groupby(["uniqueid","condition"])["accuracy"].mean().unstack(["condition"])*100
    acc_semRel_scenes           = exp_dataframe.groupby(["uniqueid","scene_type","condition"])["accuracy"].mean().unstack(["scene_type", "condition"])*100
    acc_semRel_scenes_exemplar  = exp_dataframe.groupby(["uniqueid", "scene_type", "scene_exemplar", "condition"])["accuracy"].mean().unstack(["condition", "scene_type", "scene_exemplar"])*100
    acc_semRel_scenes_mainObj   = exp_dataframe.groupby(["uniqueid","scene_type","main_obj", "condition"])["accuracy"].mean().unstack(["scene_type","main_obj", "condition"])*100

    # RT
    # Get only correct data
    corr_exp_dataframe          = exp_dataframe[(exp_dataframe["accuracy"] == 1)]

    RT_overall                  = corr_exp_dataframe.groupby(["uniqueid"])["RT"].mean()
    RT_semRel                   = corr_exp_dataframe.groupby(["uniqueid","condition"])["RT"].mean().unstack(["condition"])
    RT_semRel_scenes            = corr_exp_dataframe.groupby(["uniqueid","scene_type","condition"])["RT"].mean().unstack(["scene_type", "condition"])
    RT_semRel_scenes_exemplar   = corr_exp_dataframe.groupby(["uniqueid","scene_type","scene_exemplar","condition"])["RT"].mean().unstack(["condition","scene_type","scene_exemplar"])
    RT_semRel_scenes_mainObj    = corr_exp_dataframe.groupby(["uniqueid","scene_type","main_obj", "condition"])["RT"].mean().unstack(["scene_type","main_obj", "condition"])

    # concat all data into single data frame, update when necessary
    all_data = pd.concat([RT_semRel_scenes_mainObj],axis = 1)

    # PLOT GRAPHS
    if plot_graphs == 1:
        ax = a.plot.bar(x = "ww", y = "ms", rot = 0)
        plt.show()

    # WRITE DATA
    if data_write == 1:
        writer = pd.ExcelWriter(final_data, engine="xlsxwriter")
        sanity_checks.to_excel(writer, sheet_name="Sheet1")
        RT_semRel_scenes_mainObj.to_excel(writer, sheet_name="Sheet2")
        acc_semRel_scenes_mainObj.to_excel(writer, sheet_name="Sheet3")
        sur_dataframe.to_excel(writer, sheet_name="Sheet4")

        writer.save()

# DO SURVEY ANALYSIS
if survey_analysis == 1:

    # Extract all data files into single np array
    survey_files        = glob.glob(survey_dir)
    survey_data         = [];
    raw_data            = pd.read_csv(survey_files[0], header=0)
    survey_data.append(raw_data)
    survey_dataframe    = pd.concat(survey_data)
    bad_participants    = []

    # only select data from good participants
    survey_dataframe    = survey_dataframe[survey_dataframe["uniqueId"].isin(good_participants)]

    # Drops irrelevant columns (date, etc)
    survey_dataframe = survey_dataframe.iloc[:,17:]

    # remap string values into numbers for survey
    remapping = {"Extremely unlikely": 1, "Moderately unlikely": 2, "Slightly unlikely": 3, "Slightly likely": 4, "Moderately likely": 5, "Extremely likely": 6,
                 "Very Non-Representative": 1, "Moderately Non-Representative": 2, "Slightly Non-Representative": 3, "Slightly Representative": 4, "Moderately Representative": 5, "Very Representative": 6}
    survey_dataframe = survey_dataframe.replace(remapping)
    
    # Set unique ID as index
    survey_dataframe.set_index('uniqueId', inplace=True)

    # Calculate average ratings for objects in appropriate scene
    survey_dataframe["scene1"] = (survey_dataframe["Q1-10"] + survey_dataframe["Q1-11"])/2
    survey_dataframe["scene2"] = (survey_dataframe["Q2-20"] + survey_dataframe["Q2-21"])/2
    survey_dataframe["scene3"] = (survey_dataframe["Q3-30"] + survey_dataframe["Q3-31"])/2
    survey_dataframe["scene4"] = (survey_dataframe["Q4-40"] + survey_dataframe["Q4-41"])/2
    survey_dataframe["scene5"] = (survey_dataframe["Q5-50"] + survey_dataframe["Q5-51"])/2

    # Calculate difference in ratings for objects in scene
    # Scene 1: Office
    # Scene 2: Living room
    # Scene 3: Bathroom
    # Scene 4: Kitchen
    # Scene 5: Bedroom
    survey_dataframe["scene1_sem-mag"] = (survey_dataframe["Q1-10"] + survey_dataframe["Q1-11"])/2 - (survey_dataframe["Q1-20"] + survey_dataframe["Q1-21"] + survey_dataframe["Q1-30"] + survey_dataframe["Q1-31"] + survey_dataframe["Q1-40"] + survey_dataframe["Q1-41"] + survey_dataframe["Q1-50"] + survey_dataframe["Q1-51"])/8
    survey_dataframe["scene2_sem-mag"] = (survey_dataframe["Q2-20"] + survey_dataframe["Q2-21"])/2 - (survey_dataframe["Q2-10"] + survey_dataframe["Q2-11"] + survey_dataframe["Q2-30"] + survey_dataframe["Q2-31"] + survey_dataframe["Q2-40"] + survey_dataframe["Q2-41"] + survey_dataframe["Q2-50"] + survey_dataframe["Q2-51"])/8
    survey_dataframe["scene3_sem-mag"] = (survey_dataframe["Q3-30"] + survey_dataframe["Q3-31"])/2 - (survey_dataframe["Q3-10"] + survey_dataframe["Q3-11"] + survey_dataframe["Q3-20"] + survey_dataframe["Q3-21"] + survey_dataframe["Q3-30"] + survey_dataframe["Q3-31"] + survey_dataframe["Q3-40"] + survey_dataframe["Q3-41"])/8
    survey_dataframe["scene4_sem-mag"] = (survey_dataframe["Q4-40"] + survey_dataframe["Q4-41"])/2 - (survey_dataframe["Q4-10"] + survey_dataframe["Q4-11"] + survey_dataframe["Q4-20"] + survey_dataframe["Q4-21"] + survey_dataframe["Q4-30"] + survey_dataframe["Q4-31"] + survey_dataframe["Q4-50"] + survey_dataframe["Q4-51"])/8
    survey_dataframe["scene5_sem-mag"] = (survey_dataframe["Q5-50"] + survey_dataframe["Q5-51"])/2 - (survey_dataframe["Q5-10"] + survey_dataframe["Q5-11"] + survey_dataframe["Q5-20"] + survey_dataframe["Q5-21"] + survey_dataframe["Q5-30"] + survey_dataframe["Q5-31"] + survey_dataframe["Q5-40"] + survey_dataframe["Q5-41"])/8

    # Differences for each object
    survey_dataframe["10_sem-mag"] = survey_dataframe["Q1-10"] - (survey_dataframe["Q1-20"] + survey_dataframe["Q1-21"] + survey_dataframe["Q1-30"] + survey_dataframe["Q1-31"] + survey_dataframe["Q1-40"] + survey_dataframe["Q1-41"] + survey_dataframe["Q1-50"] + survey_dataframe["Q1-51"])/8
    survey_dataframe["11_sem-mag"] = survey_dataframe["Q1-11"] - (survey_dataframe["Q1-20"] + survey_dataframe["Q1-21"] + survey_dataframe["Q1-30"] + survey_dataframe["Q1-31"] + survey_dataframe["Q1-40"] + survey_dataframe["Q1-41"] + survey_dataframe["Q1-50"] + survey_dataframe["Q1-51"])/8
    survey_dataframe["20_sem-mag"] = survey_dataframe["Q2-20"] - (survey_dataframe["Q2-10"] + survey_dataframe["Q2-11"] + survey_dataframe["Q2-30"] + survey_dataframe["Q2-31"] + survey_dataframe["Q2-40"] + survey_dataframe["Q2-41"] + survey_dataframe["Q2-50"] + survey_dataframe["Q2-51"])/8
    survey_dataframe["21_sem-mag"] = survey_dataframe["Q2-21"] - (survey_dataframe["Q2-10"] + survey_dataframe["Q2-11"] + survey_dataframe["Q2-30"] + survey_dataframe["Q2-31"] + survey_dataframe["Q2-40"] + survey_dataframe["Q2-41"] + survey_dataframe["Q2-50"] + survey_dataframe["Q2-51"])/8
    survey_dataframe["30_sem-mag"] = survey_dataframe["Q3-30"] - (survey_dataframe["Q3-10"] + survey_dataframe["Q3-11"] + survey_dataframe["Q3-20"] + survey_dataframe["Q3-21"] + survey_dataframe["Q3-30"] + survey_dataframe["Q3-31"] + survey_dataframe["Q3-40"] + survey_dataframe["Q3-41"])/8
    survey_dataframe["31_sem-mag"] = survey_dataframe["Q3-31"] - (survey_dataframe["Q3-10"] + survey_dataframe["Q3-11"] + survey_dataframe["Q3-20"] + survey_dataframe["Q3-21"] + survey_dataframe["Q3-30"] + survey_dataframe["Q3-31"] + survey_dataframe["Q3-40"] + survey_dataframe["Q3-41"])/8
    survey_dataframe["40_sem-mag"] = survey_dataframe["Q4-40"] - (survey_dataframe["Q4-10"] + survey_dataframe["Q4-11"] + survey_dataframe["Q4-20"] + survey_dataframe["Q4-21"] + survey_dataframe["Q4-30"] + survey_dataframe["Q4-31"] + survey_dataframe["Q4-50"] + survey_dataframe["Q4-51"])/8
    survey_dataframe["41_sem-mag"] = survey_dataframe["Q4-41"] - (survey_dataframe["Q4-10"] + survey_dataframe["Q4-11"] + survey_dataframe["Q4-20"] + survey_dataframe["Q4-21"] + survey_dataframe["Q4-30"] + survey_dataframe["Q4-31"] + survey_dataframe["Q4-50"] + survey_dataframe["Q4-51"])/8
    survey_dataframe["50_sem-mag"] = survey_dataframe["Q5-50"] - (survey_dataframe["Q5-10"] + survey_dataframe["Q5-11"] + survey_dataframe["Q5-20"] + survey_dataframe["Q5-21"] + survey_dataframe["Q5-30"] + survey_dataframe["Q5-31"] + survey_dataframe["Q5-40"] + survey_dataframe["Q5-41"])/8
    survey_dataframe["51_sem-mag"] = survey_dataframe["Q5-51"] - (survey_dataframe["Q5-10"] + survey_dataframe["Q5-11"] + survey_dataframe["Q5-20"] + survey_dataframe["Q5-21"] + survey_dataframe["Q5-30"] + survey_dataframe["Q5-31"] + survey_dataframe["Q5-40"] + survey_dataframe["Q5-41"])/8

    # Save Semantic difference score as separate dataframe
    survey_semDiff_dataframe = survey_dataframe.iloc[:,95:]

## Let's wrap up now
# concat all data into single data frame, update when necessary
all_data    = pd.concat([demogr_dataframe, RT_semRel, acc_semRel_scenes, RT_semRel_scenes, survey_semDiff_dataframe], axis=1)


## Get data for graphing
graph_acc   = cm_standard_error(acc_semRel_scenes_mainObj)
graph_RT    = cm_standard_error(RT_semRel_scenes_mainObj)
graph_surv  = survey_semDiff_dataframe.mean()
print(survey_semDiff_dataframe)
graph_data  = pd.concat([graph_acc, graph_RT], axis = 1)

# Prepare data for regression here

# copy df to clipboard
survey_semDiff_dataframe.to_clipboard(excel=True, sep='\t')

time_elapsed = time.time() - x
print("Success! Time Elapsed: " + str(round(time_elapsed,5)*1000) + " ms")