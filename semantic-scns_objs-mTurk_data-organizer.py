# created by joecool890
# Takes CSV data files into a pandas dataframe to organize for data analysis
# Version 0.1.0
# customized for semantic-scn-obj-mTurk
import glob, os, time, getpass
import pandas as pd
import numpy as np

# Data Thresholding
exp_name    = "scns_obs-mTurk"
RT_thres    = 1
exp_iter    = 1
scn_filter  = 0
acc_thresh  = 80

# Control which analysis to run
data_analysis   = 1
survey_analysis = 1
demogr_analysis = 1
data_write      = 0

if data_analysis == 1:
    # If on windows, change directory
    if  os.name == "nt":
        os.chdir("Insert directory here that fits your root folder. After you do this, ./ will work!")

    # change directory based on computer
    userName    = getpass.getuser()
    data_dir    = "/Users/" + userName + "/Dropbox/GWU/01_Research/08_semanticScenes/mTurk/data" + "/*.csv"
    survey_dir  = "/Users/" + userName + "/Dropbox/GWU/01_Research/08_semanticScenes/mTurk/survey" + "/*.csv"
    final_data  = "/Users/" + userName + "/Dropbox/GWU/01_Research/08_semanticScenes/mTurk/" + "semantic_scns-objs_mTurk.xlsx"
    # Extract all data files into single np array
    data_files      = glob.glob(data_dir)
    survey_files    = glob.glob(survey_dir)
    participants    = len(data_files)

    # Load all data and survey files into single panda data frame
    raw_data = []
    survey_data = []
    for file in range(participants):
        data    = pd.read_csv(data_files[file], header = 0)
        survey  = pd.read_csv(survey_files[file], header = 0)
        raw_data.append(data)
        survey_data.append(survey)

    exp_dataframe = pd.concat(raw_data)
    sur_dataframe = pd.concat(survey_data)

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

    # COLUMNS
    col_semRel_scenes           = ["SR_office", "SR_living", "SR_bath", "SR_kitchen", "SR_bed", "NR_office", "NR_living",
                                   "NR_bath", "NR_kitchen", "NR_bed"]

    col_semRel_scenes_mainObj   = ["SR_office_mouse","SR_office_calc", "SR_living_remote", "SR_living_game", "SR_bath_paste",
                                   "SR_bath_tp", "SR_kitchen_mitt", "SR_kitchen_grater", "SR_bed_hanger", "SR_bed_clock",
                                   "NR_office_mouse", "NR_office_calc", "NR_living_remote", "NR_living_game", "NR_bath_paste",
                                   "NR_bath_tp", "NR_kitchen_mitt", "NR_kitchen_grater", "NR_bed_hanger", "NR_bed_clock"]

    # Keep only the good participants
    acc_overall                 = exp_dataframe.groupby(["uniqueid"])["accuracy"].mean()*100
    good_participants           = acc_overall.loc[acc_overall >= acc_thresh].index.get_level_values(0).tolist()
    exp_dataframe               = exp_dataframe[exp_dataframe["uniqueid"].isin(good_participants)]

    # ACCURACY
    acc_semRel                  = exp_dataframe.groupby(["uniqueid","condition"])["accuracy"].mean().unstack(["condition"])*100
    acc_semRel_scenes           = exp_dataframe.groupby(["uniqueid","condition","scene_type"])["accuracy"].mean().unstack(["condition","scene_type"])*100
    acc_semRel_scenes_mainObj   = exp_dataframe.groupby(["uniqueid","condition","scene_type","main_obj"])["accuracy"].mean().unstack(["condition","scene_type","main_obj"])*100

    # acc_semRel_scenes_mainObj.columns = col_semRel_scenes_mainObj;

    # RT
    corr_exp_dataframe          = exp_dataframe[(exp_dataframe["accuracy"] == 1)]

    RT_overall                  = corr_exp_dataframe.groupby(["uniqueid"])["RT"].mean()
    RT_semRel                   = corr_exp_dataframe.groupby(["uniqueid","condition"])["RT"].mean().unstack(["condition"])
    RT_semRel_scenes            = corr_exp_dataframe.groupby(["uniqueid","scene_type","condition"])["RT"].mean().unstack(["condition","scene_type"])
    RT_semRel_scenes_exemplar   = corr_exp_dataframe.groupby(["uniqueid","scene_type","scene_exemplar","condition"])["RT"].mean().unstack(["condition","scene_type","scene_exemplar"])
    RT_semRel_scenes_mainObj    = corr_exp_dataframe.groupby(["uniqueid","condition","scene_type","main_obj"])["RT"].mean().unstack(["condition","scene_type","main_obj"])

    # RT_semRel_scenes_mainObj.columns = col_semRel_scenes_mainObj;
    # concat all data into single data frame, update when necessary
    all_data = pd.concat([excluded_data_count, acc_overall, acc_semRel_scenes, RT_semRel_scenes],axis = 1)


    # print(RT_semRel_scenes_mainObj)
    RT_semRel_scenes.to_clipboard(excel=True, sep='\t')

    # Write data to excel file
    if data_write == 1:
        writer = pd.ExcelWriter(final_data, engine="xlsxwriter")
        sanity_checks.to_excel(writer, sheet_name="Sheet1")
        RT_semRel_scenes_mainObj.to_excel(writer, sheet_name="Sheet2")
        acc_semRel_scenes_mainObj.to_excel(writer, sheet_name="Sheet3")
        sur_dataframe.to_excel(writer, sheet_name="Sheet4")

        writer.save()

# if survey_analysis == 1:
