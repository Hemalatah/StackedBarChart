import sqlite3
import numpy as np
import csv
import matplotlib.pyplot as plt
import matplotlib
from flask import Flask
from flask import render_template
import json
from pymongo import MongoClient
from bson import json_util
from bson.json_util import dumps

matplotlib.style.use('ggplot')

'''packets = []
type1 = []
type2 = []
for r in result:
	if r[0] == 0:
		type1.append(r[2])
	elif r[0] == 2:
		type2.append(r[2])
	packets.append(list(r))
print len(packets)
print packets, type1, type2'''

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("d3.html")

@app.route("/querytable/<int:starttime>&<int:endtime>", methods=['GET', 'POST'])
def query_table(starttime, endtime):
	connection = sqlite3.connect("data.db")
	cursor = connection.cursor()
	#t1 = str(1498431718)
	#t2 = str(1498431963)
	t1 = str(starttime)
	t2 = str(endtime)
	cursor.execute("select distinct type, subtype, count() from mac_headers where type in (select distinct type from mac_headers)  and timestamp between " + t1  + " and  " + t2 + " group by type, subtype order by type, subtype ")
	result = cursor.fetchall()
	json_data = []
	for r in result:
		json_data.append(list(r))
	json_data = json.dumps(json_data, default=json_util.default)
	return json_data

if __name__ == "__main__":
    app.run(host='0.0.0.0',port=5000,debug=True)


width = 0.35       # the width of the bars: can also be len(x) sequence
p1 = plt.bar(1, type1[0], width, color='#d62728')
p2 = plt.bar(2, type2[0], width, color='#0066cc')
for i in range(1, len(type1)):
	p1 += plt.bar(1, type1[i], width, color='#d62728', bottom=type1[i-1])

for i in range(len(type2)):
	p2 += plt.bar(2, type2[i], width, color='#0066cc', bottom=type2[i-1])

plt.ylabel('Packets')
plt.xlabel('Type')
plt.title('Title')
plt.xticks(np.arange(0,2,2))
plt.yticks(np.arange(0, 30000, 1000))
plt.legend((p1[0], p2[0]), ('Type0', 'Type2'))

plt.show()


