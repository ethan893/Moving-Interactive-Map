import requests
import json
from flask import request
from flask import Flask, render_template, jsonify,make_response
import requests
import statistics
import datetime
from datetime import date
from dateutil.relativedelta import *
import csv
from geopy.distance import geodesic

app = Flask(__name__)
def load_airports(filename):
    airports = []
    with open(filename, 'r', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        for row in reader:
            airports.append({
                'airport_id': row[0],
                'name': row[1],
                'city': row[2],
                'country': row[3],
                'iata': row[4],
                'icao': row[5],
                'latitude': float(row[6]),
                'longitude': float(row[7]),
                'altitude': row[8],
                'timezone': row[9],
                'dst': row[10],
                'tz': row[11]
            })
    return airports

def find_nearest_airport(lat, lng, airports):
    min_distance = float('inf')
    nearest_airport = None
    for airport in airports:
        airport_lat = airport['latitude']
        airport_lng = airport['longitude']
        distance = geodesic((lat, lng), (airport_lat, airport_lng)).km
        if distance < min_distance:
            min_distance = distance
            nearest_airport = airport
    return nearest_airport
def priceOfFlight(firstAirportCode, secondAirportCode):
    use_date = date.today()
    use_date = use_date + relativedelta(months=+1)

    url = "https://sky-scanner3.p.rapidapi.com/flights/search-everywhere"

    # Corrected query string formatting
    querystring = {
        "fromEntityId": firstAirportCode,
        "toEntityId": secondAirportCode,
        "departStartDate": date.today(),
        "departEndDate": use_date
    }

    headers = {
        "x-rapidapi-key": "api_key",
        "x-rapidapi-host": "sky-scanner3.p.rapidapi.com",
        "Content-Type": "application/json"
    }

    response = requests.get(url, headers=headers, params=querystring)
    
    airportData = response.json()

    # Try to see if the data is there, such that there is an airport flight next month there
    try:
        priceArray = []
        for i in range(len((airportData['data']['flightQuotes']['results']))):
            temporaryString = (airportData['data']['flightQuotes']['results'][i]['content']['price'])
            priceArray.append(int(''.join([j for j in temporaryString if j in '1234567890'])))
        print(priceArray)
        airportAveragePrice = statistics.mean(priceArray)
        airportMedianPrice = statistics.median(priceArray)
    except:
        return ("Unknown","Unknown")
    airportAveragePrice = statistics.mean(priceArray)
    airportMedianPrice = statistics.median(priceArray)

    return airportAveragePrice, airportMedianPrice


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/dataCollection", methods=["POST"])
def data_collection():
        try:
            data = request.get_json()

            api_key = 'api_key'

            latitude = data[0][0]
            longitude = data[0][1]

            url = f'http://api.openweathermap.org/data/2.5/forecast?lat={latitude}&lon={longitude}&appid={api_key}'

            response = requests.get(url)

            secondLatitude = data[1][0]

            secondLongitude = data[1][1]

            secondURL = f'http://api.openweathermap.org/data/2.5/forecast?lat={secondLatitude}&lon={secondLongitude}&appid={api_key}'

            secondResponse = requests.get(secondURL)
            if response.status_code == 200 and secondResponse.status_code == 200:
                firstData = response.json()
                firstTemp = round(((firstData['list'][0]['main']['temp']-273.15) * (9/5) + 32),2)
                firstName = firstData['city']['name']

                secondData = secondResponse.json()
                secondTemp = round(((secondData['list'][0]['main']['temp']-273.15) * (9/5) + 32),2)
                secondName = secondData['city']['name']
                difference = round(firstTemp - secondTemp,2)
                if(not firstName):
                    firstName = "Unknown"
                if(not secondName):
                    secondName = "Unknown"

                filename = 'airports.dat'
                airports = load_airports(filename)

                firstNearestAirport = find_nearest_airport(latitude, longitude, airports)
                secondNearestAirport = find_nearest_airport(secondLatitude, secondLongitude, airports)
                
                firstAirportCode = firstNearestAirport['iata']
                secondAirportCode = secondNearestAirport['iata']
                airportAveragePrice,airportMedianPrice = "Unknown", "Unknown"
                if firstAirportCode and secondAirportCode:
                    result = priceOfFlight(firstAirportCode, secondAirportCode)
                    if isinstance(result, tuple) and len(result) == 2:
                        airportAveragePrice, airportMedianPrice = result
                    else:
                        print("Unexpected number of values returned from priceOfFlight")
                else:
                    firstAirportCode = "There are no close airports or direct flights to both locations"
                    secondAirportCode = ""
                print(airportMedianPrice,airportAveragePrice)
                responseArray = [firstName,firstTemp,secondName,secondTemp,difference,firstAirportCode,airportAveragePrice,
                                secondAirportCode,airportMedianPrice]
                
                return jsonify(responseArray)
            else:
                print('Perhaps one of the locations that you clicked on does not correspond to a location')
        except Exception as e:
            print(f"Error: {e}")
            return jsonify({"message": "An error occurred"}), 500






if __name__ == '__main__':
   app.run(debug = True)
"""
housing costs
precipitation average
population
population density/size


"""