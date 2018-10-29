# created by joecool890
# Extracts SQL database into csv files
# Redundant, but allows access to data outside of GWU boundaries (if using MYSQL)
# There might be a way to access MYSQL outside of GWU but idk how
# Version 1.1.1
# customized for semantic-scn-obj-mTurk
from sqlalchemy import create_engine, MetaData, Table
import json, os, getpass, glob
import pandas as pd

# Data Thresholding
exp_name    = "scns_obs-mTurk"

# Change to 1 if you want 1 csv file w/ all data on it as well
concat_data = 0;

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
        data_dir    =  "/Users/" + userName + "/Dropbox/GWU/01_Research/08_semanticScenes/data/exp04-mTurk/data/"  + exp_name + "_" + row["endhit"].strftime('%Y-%m-%d_%H-%M-%S') + "_" +row["workerid"] +"-" + row["assignmentid"] + "_data" + ".csv"
        demogr_dir  =  "/Users/" + userName + "/Dropbox/GWU/01_Research/08_semanticScenes/data/exp04-mTurk/demogr/"  + exp_name + "_" + row["endhit"].strftime('%Y-%m-%d_%H-%M-%S') + "_" +row["workerid"] + "-" + row["assignmentid"] + "_survey" + ".csv"
        event_dir   =  "/Users/" + userName + "/Dropbox/GWU/01_Research/08_semanticScenes/data/exp04-mTurk/event/"  + exp_name + "_" + row["endhit"].strftime('%Y-%m-%d_%H-%M-%S') + "_" +row["workerid"] + "-" + row["assignmentid"] + "_event" + ".csv"

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
                record['trialdata']['date']     = row["endhit"].strftime('%Y-%m-%d_%H-%M-%S')
        # eventdata
        for part in eventdata:
            for record in part:
                record["uniqueid"] = row["uniqueid"]

        # questiondata
        for part in questiondata:
            part["uniqueid"] = row["uniqueid"]

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
        if os.path.isfile(data_dir):
            print('data already exists bro')
        else:
            exp_dataframe.to_csv(data_dir)
            quest_dataframe.to_csv(demogr_dir)
            event_dataframe.to_csv(event_dir)

if concat_data == 1:
    all_data_dir    = "/Users/" + userName + "/Dropbox/GWU/01_Research/08_semanticScenes/mTurk/data" + "/*.csv"
    # Extract all data files into single np array
    data_files      = glob.glob(all_data_dir)
    participants    = len(data_files)

    raw_data = []
    for file in range(participants):
        data = pd.read_csv(data_files[file], index_col = "uniqueid", header = 0)
        raw_data.append(data)

    exp_dataframe = pd.concat(raw_data)
    # exp_dataframe.to_csv(data_dir,"a")
    # exp_dataframe.to_clipboard(excel=True, sep='\t')
