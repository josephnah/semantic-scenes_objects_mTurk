# created by joecool890
# Extracts SQL database into pandas
# Version 0.1.0
# customized for semantic-scn-obj-mTurk
# http://blog.appliedinformaticsinc.com/how-to-parse-and-convert-json-to-csv-using-python/
from sqlalchemy import create_engine, MetaData, Table
import json
import pandas as pd

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
exclude     = [];
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

# Put all subjects' trial data into a dataframe object from the
# 'pandas' python library: one option among many for analysis
exp_data_frame = pd.DataFrame(RAWDATA)
event = pd.DataFrame(event_data)
acc_overall = exp_data_frame.groupby(["uniqueid"])["accuracy"].mean()
# print(acc_overall)
event.to_clipboard(excel=True, sep='\t')