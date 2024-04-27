import openmeteo_requests
import requests
import json
from flask import request
from flask import Flask, render_template, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/test', methods=['OPTIONS'])
def test():
    myData = request.get_json()
    myForm = request.form
    print(myData)
    print(myForm)
    return myData


api_key = '5f0ae2710485a0b1f880cdbae5725fe8'

latitude = 37.7749

longitude = -122.4194

url = f'http://api.openweathermap.org/data/2.5/forecast?lat={latitude}&lon={longitude}&appid={api_key}'

response = requests.get(url)

secondLatitude = 31.2304

secondLongitude = 121.4737

secondURL = f'http://api.openweathermap.org/data/2.5/forecast?lat={secondLatitude}&lon={secondLongitude}&appid={api_key}'

secondResponse = requests.get(secondURL)
if response.status_code == 200 and secondResponse.status_code == 200:
    firstData = response.json()
    firstTemp = round(((firstData['list'][0]['main']['temp']-273.15) * (9/5) + 32),2)
    firstName = firstData['city']['name']

    secondData = secondResponse.json()
    secondTemp = round(((secondData['list'][0]['main']['temp']-273.15) * (9/5) + 32),2)
    secondName = secondData['city']['name']
    
    print(f'{firstTemp}F')
    print(firstName)
    print(f'{secondTemp}F')
    print(secondName)
    print(f'This is the difference in temperatures between {firstName} and {secondName} : {round(firstTemp - secondTemp,2)}F')
else:
    print('Perhaps one of the locations that you clicked on does not correspond to a location')


"""
housing costs
precipitation average
population
population density/size


"""