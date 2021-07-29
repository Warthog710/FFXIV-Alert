from flask import Flask, render_template, jsonify
from Scraper import lodeStoneScraper

#TODO: Add FFXIV Alarm title above buttons
#TODO: Below title, and above buttons show icon legend
#TODO: Below server cards show next update countdown.

app = Flask(__name__)
lss = lodeStoneScraper()

@app.route('/')
def index():
    return render_template('index.html', data=lss.get_data())

@app.route('/data')
def data():
    return jsonify(lss.get_data())

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)